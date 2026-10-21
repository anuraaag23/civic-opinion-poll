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
    const stateParam = searchParams.get('state');

    // If state filter is requested (for CM poll)
    if (stateParam) {
      const stateParties = getPartiesForState(stateParam);
      const partyMap = new Map(stateParties.map((p) => [p.id, p]));
      const filteredOptions = poll.options
        .filter((opt) => partyMap.has(opt.party_id))
        .map((opt) => {
          const sp = partyMap.get(opt.party_id);
          return {
            ...opt,
            party: sp ? { ...sp } : opt.party,
          };
        });

      const stateInfo = getStateById(stateParam);

      return NextResponse.json({
        success: true,
        poll: {
          ...poll,
          title_en: stateInfo
            ? `Chief Minister (CM) Poll — ${stateInfo.name_en}`
            : poll.title_en,
          title_hi: stateInfo
            ? `मुख्यमंत्री (CM) जनमत सर्वेक्षण — ${stateInfo.name_hi}`
            : poll.title_hi,
          options: filteredOptions.length > 0 ? filteredOptions : poll.options,
        },
        state: stateInfo || null,
      });
    }

    return NextResponse.json({ success: true, poll });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve poll' },
      { status: 500 }
    );
  }
}
