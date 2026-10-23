import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getPartiesForState, getStateById } from '@/lib/data/parties';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const poll = (await db.getPollBySlug(id)) || (await db.getPollById(id));

    if (!poll) {
      return NextResponse.json({ success: false, error: 'Poll not found' }, { status: 404 });
    }

    const searchParams = request.nextUrl.searchParams;
    const rawTimeframe = searchParams.get('timeframe');
    const monthParam = searchParams.get('month') || '2026-10';
    const timeframe: '7d' | 'month' | 'year' | 'all' =
      rawTimeframe === '7d' || rawTimeframe === 'month' || rawTimeframe === 'year'
        ? rawTimeframe
        : 'all';

    const results = await db.getPollResults(poll.id, timeframe, monthParam);
    const stateParam = searchParams.get('state');

    if (stateParam && results) {
      const stateParties = getPartiesForState(stateParam);
      const partyMap = new Map(stateParties.map((p) => [p.id, p]));
      const stateResults = results.results
        .filter((r) => partyMap.has(r.party_id))
        .map((r) => {
          const sp = partyMap.get(r.party_id);
          return {
            ...r,
            logo_url: sp?.logo_url || r.logo_url || `/parties/${r.party_id.replace('party-', '')}.png`,
            symbol_svg: '',
            candidate_name_en: sp?.candidate_name_en || r.candidate_name_en,
            candidate_name_hi: sp?.candidate_name_hi || r.candidate_name_hi,
            candidate_role_en: sp?.candidate_role_en || 'CM Candidate',
            candidate_role_hi: sp?.candidate_role_hi || 'मुख्यमंत्री प्रत्याशी',
          };
        });

      const stateTotal = stateResults.reduce((acc, r) => acc + r.count, 0);
      const recalculated = stateResults.map((r) => ({
        ...r,
        percentage: stateTotal > 0 ? Number(((r.count / stateTotal) * 100).toFixed(1)) : 0,
      }));

      // Sort descending by count
      recalculated.sort((a, b) => b.count - a.count);

      const stateInfo = getStateById(stateParam);

      return NextResponse.json({
        success: true,
        totalResponses: stateTotal,
        results: recalculated,
        updatedAt: results.updated_at,
        timeframe,
        selectedMonth: monthParam,
        timeframeLabelEn: results.timeframe_label_en,
        timeframeLabelHi: results.timeframe_label_hi,
        pollMonth: results.poll_month || 'October',
        pollYear: results.poll_year || 2026,
        pollTitleEn: stateInfo ? `Chief Minister (CM) Poll Results — ${stateInfo.name_en}` : poll.title_en,
        pollTitleHi: stateInfo ? `मुख्यमंत्री (CM) सर्वेक्षण परिणाम — ${stateInfo.name_hi}` : poll.title_hi,
        status: poll.status,
        state: stateInfo || null,
      });
    }

    return NextResponse.json({
      success: true,
      totalResponses: results?.total_responses || 0,
      results: results?.results || [],
      updatedAt: results?.updated_at || new Date().toISOString(),
      timeframe,
      selectedMonth: monthParam,
      timeframeLabelEn: results?.timeframe_label_en,
      timeframeLabelHi: results?.timeframe_label_hi,
      pollMonth: results?.poll_month || 'October',
      pollYear: results?.poll_year || 2026,
      pollTitleEn: poll.title_en,
      pollTitleHi: poll.title_hi,
      status: poll.status,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve results' },
      { status: 500 }
    );
  }
}
