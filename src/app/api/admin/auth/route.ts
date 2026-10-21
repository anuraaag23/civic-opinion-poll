import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
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

    const body = await request.json().catch(() => ({}));
    const { loginId, password, passcode } = body;

    let isValid = false;

    // A) If Login ID and Password provided:
    if (loginId && password && typeof loginId === 'string' && typeof password === 'string') {
      isValid = await db.verifyAdminLogin(loginId.trim(), password);
    } else if (passcode && typeof passcode === 'string') {
      // B) Passcode-only fallback (checks against default or primary admin account)
      const account = await db.getAdminAccount();
      isValid = await db.verifyAdminLogin(account.loginId, passcode);
    } else {
      return NextResponse.json(
        { success: false, error: 'Login ID and password are required' },
        { status: 400 }
      );
    }

    // 2. Successful authentication
    if (isValid) {
      clearAdminRateLimit(ip);

      await db.recordAuditEvent('admin_login', undefined, {
        timestamp: new Date().toISOString(),
        loginId: loginId || 'admin',
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
      loginId: loginId || 'unknown',
      success: false,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Invalid administrative credentials. Access denied.',
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
