import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  verifyAdminPasscode,
  createAdminSessionToken,
  checkAdminRateLimit,
  recordAdminAuthFailure,
  clearAdminRateLimit,
} from '@/lib/auth/admin';

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1';

    // 1. Enforce strict rate-limiting / brute-force lockout
    const rateLimit = checkAdminRateLimit(ip);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many failed attempts. Administrative access locked. Please retry in ${rateLimit.retryAfterSeconds} seconds.`,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.retryAfterSeconds || 900),
          },
        }
      );
    }

    const body = await request.json();
    const { passcode } = body;

    if (!passcode || typeof passcode !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Passcode is required' },
        { status: 400 }
      );
    }

    // 2. Timing-safe constant-time passcode validation
    if (verifyAdminPasscode(passcode)) {
      clearAdminRateLimit(ip);

      await db.recordAuditEvent('admin_login', undefined, {
        timestamp: new Date().toISOString(),
        success: true,
      });

      const sessionToken = createAdminSessionToken();

      const response = NextResponse.json({
        success: true,
        message: 'Authenticated successfully',
        token: sessionToken,
      });

      // Set secure HttpOnly session cookie
      response.cookies.set('meravote_admin_token', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 4 * 60 * 60, // 4 hours
      });

      return response;
    }

    // 3. Failed attempt: Record failure & increment brute-force counter
    recordAdminAuthFailure(ip);

    await db.recordAuditEvent('admin_login', undefined, {
      timestamp: new Date().toISOString(),
      success: false,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Invalid administrative passcode. Access denied.',
      },
      { status: 401 }
    );
  } catch (err) {
    console.error('Admin auth error:', err);
    return NextResponse.json(
      { success: false, error: 'Authentication service error' },
      { status: 500 }
    );
  }
}
