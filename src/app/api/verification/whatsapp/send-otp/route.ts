import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { normalizePhone, generateParticipationFingerprint } from '@/lib/crypto';
import { generateOtp } from '@/lib/verification/otp';
import { sendWhatsAppOtp } from '@/lib/whatsapp/baileys';

// In-memory rate limiter for WhatsApp OTP requests: max 3 per 5 minutes per phone
const phoneRateLimits = new Map<string, { count: number; resetAt: number }>();
// In-memory rate limiter for IP addresses: max 10 OTP requests per 10 minutes per IP
const ipRateLimits = new Map<string, { count: number; resetAt: number }>();

function checkPhoneRateLimit(phone: string): boolean {
  const now = Date.now();
  if (phoneRateLimits.size > 2000) {
    for (const [key, val] of phoneRateLimits.entries()) {
      if (now > val.resetAt) phoneRateLimits.delete(key);
    }
  }

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

function checkIpRateLimit(ip: string): boolean {
  const now = Date.now();
  if (ipRateLimits.size > 2000) {
    for (const [key, val] of ipRateLimits.entries()) {
      if (now > val.resetAt) ipRateLimits.delete(key);
    }
  }

  const entry = ipRateLimits.get(ip);
  if (!entry || now > entry.resetAt) {
    ipRateLimits.set(ip, { count: 1, resetAt: now + 10 * 60 * 1000 });
    return true;
  }

  if (entry.count >= 10) {
    return false;
  }

  entry.count += 1;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1';

    if (!checkIpRateLimit(ip)) {
      return NextResponse.json(
        { success: false, error: 'Too many OTP requests from your network. Please wait 10 minutes before trying again.' },
        { status: 429 }
      );
    }

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
      devOtp: process.env.NODE_ENV === 'production' ? undefined : dispatchResult.devOtp,
    });
  } catch (err) {
    console.error('WhatsApp send-otp error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal failure while dispatching WhatsApp verification code.' },
      { status: 500 }
    );
  }
}
