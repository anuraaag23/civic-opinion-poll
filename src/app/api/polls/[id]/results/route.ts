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

    const results = await db.getPollResults(poll.id);
    const searchParams = request.nextUrl.searchParams;
    const stateParam = searchParams.get('state');

    if (stateParam && results) {
      const stateParties = getPartiesForState(stateParam);
      const partyIdSet = new Set(stateParties.map((p) => p.id));
      const stateResults = results.results.filter((r) => partyIdSet.has(r.party_id));

      const stateTotal = stateResults.reduce((acc, r) => acc + r.count, 0);
      const recalculated = stateResults.map((r) => ({
        ...r,
        percentage: stateTotal > 0 ? Number(((r.count / stateTotal) * 100).toFixed(1)) : 0,
      }));

      const stateInfo = getStateById(stateParam);

      return NextResponse.json({
        success: true,
        totalResponses: stateTotal,
        results: recalculated,
        updatedAt: results.updated_at,
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
