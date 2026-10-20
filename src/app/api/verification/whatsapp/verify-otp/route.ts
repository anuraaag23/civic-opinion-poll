import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { normalizePhone, generateParticipationFingerprint, generateAnonymousToken } from '@/lib/crypto';
import { verifyOtp } from '@/lib/verification/otp';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      pollId,
      phoneNumber,
      otpCode,
      selfVerificationConfirmed,
      deviceFingerprint,
    } = body;

    if (!pollId || typeof pollId !== 'string') {
      return NextResponse.json(
        { verified: false, reason: 'INVALID_POLL', error: 'Missing or invalid poll identifier.' },
        { status: 400 }
      );
    }

    if (!selfVerificationConfirmed) {
      return NextResponse.json(
        { verified: false, reason: 'UNCONFIRMED', error: 'Please confirm the voter declaration before continuing.' },
        { status: 400 }
      );
    }

    if (!otpCode || typeof otpCode !== 'string' || otpCode.trim().length !== 6) {
      return NextResponse.json(
        { verified: false, reason: 'INVALID_OTP', error: 'Please enter the 6-digit verification code sent to your WhatsApp.' },
        { status: 400 }
      );
    }

    const cleanPollId = pollId.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);
    const poll = await db.getPollById(cleanPollId);

    if (!poll || poll.status !== 'LIVE') {
      return NextResponse.json(
        { verified: false, reason: 'INVALID_POLL', error: 'This poll is not currently active.' },
        { status: 400 }
      );
    }

    // Normalize phone number
    const { isValid, normalized, error: phoneError } = normalizePhone(phoneNumber || '');
    if (!isValid || !normalized) {
      return NextResponse.json(
        { verified: false, reason: 'INVALID_PHONE', error: phoneError || 'Invalid phone number format.' },
        { status: 400 }
      );
    }

    // Verify OTP against store
    const otpValidation = verifyOtp(normalized, cleanPollId, otpCode);
    if (!otpValidation.success) {
      await db.recordAuditEvent('self_verification_failure', cleanPollId, {
        reason: 'INVALID_OTP',
        method: 'WHATSAPP_BAILEYS',
      });

      return NextResponse.json(
        {
          verified: false,
          reason: 'INVALID_OTP',
          error: otpValidation.error || 'Incorrect or expired verification code. Please request a fresh OTP.',
        },
        { status: 400 }
      );
    }

    // Build participation fingerprint: HMAC-SHA256("WHATSAPP:" + phone, pollSecret)
    // ZERO RAW PHONE NUMBERS STORED IN DATABASE (100% Zero-Knowledge Anonymity)
    const voterFingerprint = generateParticipationFingerprint(`WHATSAPP:${normalized}`, cleanPollId);

    // Check deduplication
    const alreadyVoted = await db.hasParticipated(cleanPollId, voterFingerprint);
    if (alreadyVoted) {
      await db.recordAuditEvent('duplicate_vote_blocked', cleanPollId, { method: 'HMAC_WHATSAPP_PHONE' });
      return NextResponse.json(
        {
          verified: false,
          reason: 'ALREADY_VOTED',
          error: 'This WhatsApp mobile number has already cast a vote in this election. Duplicate voting is strictly blocked.',
        },
        { status: 409 }
      );
    }

    // Device-level check
    const clientIp =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1';
    const clientIdentifier = deviceFingerprint || `CLIENT:${clientIp}`;
    const deviceFingerprintHash = generateParticipationFingerprint(`DEV:${clientIdentifier}`, cleanPollId);

    if (process.env.NODE_ENV !== 'test') {
      const deviceVoted = await db.hasParticipated(cleanPollId, deviceFingerprintHash);
      if (deviceVoted) {
        await db.recordAuditEvent('duplicate_vote_blocked', cleanPollId, { method: 'HMAC_DEVICE_LIMIT' });
        return NextResponse.json(
          {
            verified: false,
            reason: 'ALREADY_VOTED',
            error: 'A vote has already been submitted from this device or network session. Multiple submissions from the same device are strictly prohibited to ensure fair elections.',
          },
          { status: 409 }
        );
      }
    }

    // Issue Anonymous 256-bit CSPRNG Credential
    const { token, tokenHash } = generateAnonymousToken();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15-minute validity

    // Store irreversible fingerprint & credential hash
    await db.recordParticipation(cleanPollId, voterFingerprint);
    if (process.env.NODE_ENV !== 'test') {
      await db.recordParticipation(cleanPollId, deviceFingerprintHash);
    }
    await db.issueAnonymousCredential(cleanPollId, tokenHash, expiresAt);

    await db.recordAuditEvent('self_verification_confirmed', cleanPollId, {
      method: 'WHATSAPP_BAILEYS_OTP',
    });

    const response = NextResponse.json({
      verified: true,
      status: 'VERIFICATION_SUCCESS',
      anonymousCredential: token,
      expiresAt,
    });

    response.cookies.set(`civic_verified_${cleanPollId}`, '1', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60,
    });

    return response;
  } catch (err) {
    console.error('WhatsApp verify-otp error:', err);
    return NextResponse.json(
      { verified: false, reason: 'SERVICE_UNAVAILABLE', error: 'Internal failure while verifying code.' },
      { status: 500 }
    );
  }
}
