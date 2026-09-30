import { NextRequest, NextResponse } from 'next/server';
import { selfVerificationService } from '@/lib/verification';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pollId, selfVerificationConfirmed } = body;

    if (!pollId) {
      return NextResponse.json(
        { verified: false, reason: 'INVALID_POLL', error: 'Missing poll identifier' },
        { status: 400 }
      );
    }

    if (!selfVerificationConfirmed) {
      return NextResponse.json(
        {
          verified: false,
          reason: 'UNCONFIRMED',
          error: 'You must confirm that you performed the electoral registration check on the official ECI portal.',
        },
        { status: 400 }
      );
    }

    // Extract sanitized client identifier for rate-limiting (hashed or truncated)
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1';

    // Process Mode A self-verification confirmation
    // STRICT RULE: NEVER ACCEPT, LOG, STORE, OR TRANSMIT RAW EPIC OR VOTER PII
    const result = await selfVerificationService.processSelfVerification(
      pollId,
      selfVerificationConfirmed,
      ip
    );

    if (!result.verified) {
      const statusCode =
        result.reason === 'RATE_LIMITED'
          ? 429
          : result.reason === 'ALREADY_VOTED'
          ? 409
          : 400;

      return NextResponse.json(
        {
          verified: false,
          reason: result.reason,
        },
        { status: statusCode }
      );
    }

    // Return the anonymous credential to the client for immediate poll submission
    const response = NextResponse.json({
      verified: true,
      status: 'SELF_VERIFICATION_CONFIRMED',
      anonymousCredential: result.anonymous_token,
      expiresAt: result.expires_at,
    });

    // Set secure HttpOnly session cookie indicating self-verification completed
    response.cookies.set(`civic_verified_${pollId}`, '1', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60, // 15 minutes
    });

    return response;
  } catch (err) {
    console.error('Verification route error:', err);
    return NextResponse.json(
      { verified: false, reason: 'SERVICE_UNAVAILABLE', error: 'Internal verification failure' },
      { status: 500 }
    );
  }
}
