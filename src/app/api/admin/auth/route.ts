import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const DEFAULT_ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || 'meravote2026';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { passcode } = body;

    if (!passcode || typeof passcode !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Passcode is required' },
        { status: 400 }
      );
    }

    if (passcode.trim() === DEFAULT_ADMIN_PASSCODE) {
      await db.recordAuditEvent('admin_login', undefined, {
        timestamp: new Date().toISOString(),
        success: true,
      });

      return NextResponse.json({
        success: true,
        message: 'Authenticated successfully',
      });
    }

    await db.recordAuditEvent('admin_login', undefined, {
      timestamp: new Date().toISOString(),
      success: false,
    });

    return NextResponse.json(
      { success: false, error: 'Invalid passcode' },
      { status: 401 }
    );
  } catch (err) {
    console.error('Admin auth error:', err);
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
