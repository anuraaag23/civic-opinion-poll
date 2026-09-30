import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

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
