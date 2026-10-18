import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdminRequest } from '@/lib/auth/admin';

export async function GET(request: Request) {
  try {
    if (!verifyAdminRequest(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(Math.max(Number(searchParams.get('limit')) || 60, 1), 200);
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
