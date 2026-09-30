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

    return NextResponse.json({ success: true, poll });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve poll' },
      { status: 500 }
    );
  }
}
