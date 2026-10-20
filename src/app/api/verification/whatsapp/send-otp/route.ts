import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { normalizePhone, generateParticipationFingerprint } from '@/lib/crypto';
import { generateOtp } from '@/lib/verification/otp';
import { sendWhatsAppOtp } from '@/lib/whatsapp/baileys';

// In-memory rate limiter for WhatsApp OTP requests: max 3 per 5 minutes per phone
const phoneRateLimits = new Map<string, { count: number; resetAt: number }>();

function checkPhoneRateLimit(phone: string): boolean {
  const now = Date.now();
  const entry = phoneRateLimits.get(phone);

  if (!entry || now > entry.resetAt) {
    phoneRateLimits.set(phone, { count: 1, resetAt: now + 5 * 60 * 1000 });
    return true;
  }

  if (entry.count >= 3) {
    return false;
  }

  entry.count += 1;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pollId, phoneNumber, mathChallenge } = body;

    if (!pollId || typeof pollId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid poll identifier' },
        { status: 400 }
      );
    }

    const cleanPollId = pollId.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);
    const poll = await db.getPollById(cleanPollId);

    if (!poll || poll.status !== 'LIVE') {
      return NextResponse.json(
        { success: false, error: 'This poll is not currently active.' },
        { status: 400 }
      );
    }

    // Optional Anti-Bot Arithmetic Challenge Verification
    if (mathChallenge) {
      const { num1, num2, answer } = mathChallenge;
      if (typeof num1 === 'number' && typeof num2 === 'number' && typeof answer === 'number') {
        if (num1 + num2 !== answer) {
          return NextResponse.json(
            { success: false, error: 'Security arithmetic verification failed. Please enter the correct sum.' },
            { status: 400 }
          );
        }
      }
    }

    // Normalize Indian phone number
    const { isValid, normalized, error: phoneError } = normalizePhone(phoneNumber || '');
    if (!isValid || !normalized) {
      return NextResponse.json(
        { success: false, error: phoneError || 'Please enter a valid 10-digit Indian mobile number.' },
        { status: 400 }
      );
    }

    // Rate limiting check
    if (!checkPhoneRateLimit(normalized)) {
      return NextResponse.json(
        { success: false, error: 'Too many OTP requests for this phone number. Please wait 5 minutes before trying again.' },
        { status: 429 }
      );
    }

    // Pre-check deduplication: Check if this phone number has already voted in this poll
    const voterFingerprint = generateParticipationFingerprint(`WHATSAPP:${normalized}`, cleanPollId);
    const alreadyVoted = await db.hasParticipated(cleanPollId, voterFingerprint);

    if (alreadyVoted) {
      await db.recordAuditEvent('duplicate_vote_blocked', cleanPollId, { method: 'WHATSAPP_PHONE_PRECHECK' });
      return NextResponse.json(
        {
          success: false,
          reason: 'ALREADY_VOTED',
          error: 'This WhatsApp mobile number has already cast a vote in this election. To ensure 1 Citizen = 1 Vote, duplicate voting is strictly prohibited.',
        },
        { status: 409 }
      );
    }

    // Generate 6-digit OTP
    const { code, expiresAt } = generateOtp(normalized, cleanPollId);

    // Send OTP via Baileys WhatsApp Service
    const dispatchResult = await sendWhatsAppOtp(normalized, code, poll.title_en);

    if (!dispatchResult.success) {
      return NextResponse.json(
        { success: false, error: dispatchResult.error || 'Failed to dispatch WhatsApp OTP. Please try again.' },
        { status: 500 }
      );
    }

    await db.recordAuditEvent('verification_otp_dispatched', cleanPollId, {
      method: 'WHATSAPP_BAILEYS',
      deliveredVia: dispatchResult.deliveredVia,
    });

    return NextResponse.json({
      success: true,
      message: 'Verification OTP sent to your WhatsApp number.',
      expiresAt: new Date(expiresAt).toISOString(),
      deliveredVia: dispatchResult.deliveredVia,
      devOtp: dispatchResult.devOtp, // Only in development/test
    });
  } catch (err) {
    console.error('WhatsApp send-otp error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal failure while dispatching WhatsApp verification code.' },
      { status: 500 }
    );
  }
}
