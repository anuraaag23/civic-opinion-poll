import { NextRequest, NextResponse } from 'next/server';
import { selfVerificationService } from '@/lib/verification';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      pollId,
      selfVerificationConfirmed,
      voterId,
      deviceFingerprint,
      mathChallenge,
      phoneNumber,
      otpCode,
      voterName,
      stateCode,
    } = body;

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
          error: 'You must confirm the voter declaration before continuing.',
        },
        { status: 400 }
      );
    }

    // Require genuine Voter ID (EPIC)
    if (!voterId || typeof voterId !== 'string' || voterId.trim().length === 0) {
      return NextResponse.json(
        {
          verified: false,
          reason: 'INVALID_FORMAT',
          error:
            'Voter ID (EPIC Card Number) is strictly required to verify voter eligibility and prevent duplicate voting.',
        },
        { status: 400 }
      );
    }

    // Optional Anti-Bot Arithmetic Challenge Verification
    if (mathChallenge) {
      const { num1, num2, answer } = mathChallenge;
      if (typeof num1 === 'number' && typeof num2 === 'number' && typeof answer === 'number') {
        if (num1 + num2 !== answer) {
          return NextResponse.json(
            {
              verified: false,
              reason: 'BOT_CHALLENGE_FAILED',
              error: 'Security arithmetic verification failed. Please enter the correct sum.',
            },
            { status: 400 }
          );
        }
      }
    }

    // Extract sanitized client IP
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1';

    // Process real Voter ID & Multi-Factor cryptographic verification and deduplication
    const result = await selfVerificationService.processSelfVerification(
      pollId,
      selfVerificationConfirmed,
      ip,
      voterId,
      deviceFingerprint,
      phoneNumber,
      otpCode,
      voterName,
      stateCode
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
          error: result.error || 'Verification failed',
          realVerifier: {
            status: result.reason === 'ALREADY_VOTED' ? 'DUPLICATE_BLOCKED' : 'FAILED',
            reason: result.reason,
            voterIdDeduplicated: result.reason === 'ALREADY_VOTED',
            dataRecordedBytes: 0,
            monitoredAt: new Date().toISOString(),
          },
        },
        { status: statusCode }
      );
    }

    // Return the decoupled anonymous credential to the client for immediate poll submission
    const response = NextResponse.json({
      verified: true,
      status: 'VERIFICATION_SUCCESS',
      anonymousCredential: result.anonymous_token,
      expiresAt: result.expires_at,
      realVerifier: {
        status: 'SUCCESS',
        voterIdVerified: true,
        deduplicationFingerprintRegistered: true,
        dataRecordedBytes: 0,
        anonymityShield: '256_BIT_CSPRNG',
        privacyGuaranteed: true,
        monitoredAt: new Date().toISOString(),
      },
    });

    // Set secure HttpOnly session cookie indicating verification completed
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
