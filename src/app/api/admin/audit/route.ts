import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get('limit')) || 60;
    const events = await db.getAuditEvents(limit);

    return NextResponse.json({
      success: true,
      data: events,
    });
  } catch (err) {
    console.error('Failed to get audit events:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve audit events' },
      { status: 500 }
    );
  }
}
