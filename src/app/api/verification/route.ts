import { NextRequest, NextResponse } from 'next/server';
import { getVerificationProvider } from '@/lib/verification';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { epic, pollId } = body;

    if (!epic || !pollId) {
      return NextResponse.json(
        { verified: false, reason: 'INVALID_FORMAT', error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Extract sanitized client identifier for rate-limiting
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1';

    const provider = getVerificationProvider();
    const result = await provider.verifyEligibility(epic, pollId, ip);

    if (!result.verified) {
      return NextResponse.json(
        {
          verified: false,
          reason: result.reason,
        },
        { status: result.reason === 'ALREADY_VOTED' ? 409 : 400 }
      );
    }

    // Return ONLY the verification flag and decoupled anonymous credential
    // STRICT RULE: NEVER RETURN VOTER NAME, ADDRESS, DOB, OR CONSTITUENCY
    return NextResponse.json({
      verified: true,
      anonymousCredential: result.anonymous_token,
      expiresAt: result.expires_at,
    });
  } catch {
    return NextResponse.json(
      { verified: false, reason: 'SERVICE_UNAVAILABLE', error: 'Internal verification failure' },
      { status: 500 }
    );
  }
}
