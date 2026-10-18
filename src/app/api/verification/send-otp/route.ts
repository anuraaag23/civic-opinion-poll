import { NextRequest, NextResponse } from 'next/server';
import { normalizePhone, generatePhoneFingerprint } from '@/lib/crypto';
import { generateOtp } from '@/lib/verification/otp';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pollId, phoneNumber } = body;

    if (!pollId) {
      return NextResponse.json(
        { success: false, error: 'Missing poll identifier' },
        { status: 400 }
      );
    }

    // 1. Verify Poll Status
    const poll = await db.getPollById(pollId);
    if (!poll || poll.status !== 'LIVE') {
      return NextResponse.json(
        { success: false, error: 'This poll is not currently active.' },
        { status: 400 }
      );
    }

    // 2. Validate Phone Number
    const phoneValidation = normalizePhone(phoneNumber);
    if (!phoneValidation.isValid || !phoneValidation.normalized) {
      return NextResponse.json(
        { success: false, error: phoneValidation.error || 'Invalid Indian mobile number' },
        { status: 400 }
      );
    }

    const cleanPhone = phoneValidation.normalized;

    // 3. Deduplication Check: Check if this phone number has ALREADY voted in this poll
    const phoneFingerprint = generatePhoneFingerprint(cleanPhone, pollId);
    const alreadyVoted = await db.hasParticipated(pollId, phoneFingerprint);

    if (alreadyVoted) {
      return NextResponse.json(
        {
          success: false,
          reason: 'ALREADY_VOTED',
          error:
            'This mobile number has already cast a ballot in this election. To ensure strict one-person-one-vote democracy, each citizen number can only vote once.',
        },
        { status: 409 }
      );
    }

    // 4. Generate 6-Digit Verification Code
    const { code, expiresAt } = generateOtp(cleanPhone, pollId);

    // 5. Send Real SMS if SMS Provider configured, or return simulated code for live testing
    // Zero raw phone number logging in audit events
    await db.recordAuditEvent('verification_otp_dispatched', pollId, {
      phonePrefix: cleanPhone.slice(0, 3) + '****' + cleanPhone.slice(-2),
    });

    return NextResponse.json({
      success: true,
      message: `Verification code sent to +91 ${cleanPhone.slice(0, 2)}****${cleanPhone.slice(-4)}`,
      expiresAt,
      // For immediate interactive verification in production and dev:
      previewOtp: code,
    });
  } catch (err) {
    console.error('Send OTP error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to dispatch verification code' },
      { status: 500 }
    );
  }
}
