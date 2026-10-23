import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashToken, isValidTokenFormat } from '@/lib/crypto';

// Rate limiting for vote submissions: max 30 per 60 seconds per IP
const voteSubmissions = new Map<string, { count: number; resetAt: number }>();

function checkVoteRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = voteSubmissions.get(ip);

  if (!entry || now > entry.resetAt) {
    voteSubmissions.set(ip, { count: 1, resetAt: now + 60000 });
    return true;
  }

  if (entry.count >= 30) {
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

    if (!checkVoteRateLimit(ip)) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded. Please wait a moment.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { pollId, optionId, anonymousToken, idempotencyKey } = body;

    if (!pollId || typeof pollId !== 'string' || pollId.length > 80) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing poll identifier' },
        { status: 400 }
      );
    }

    if (!optionId || typeof optionId !== 'string' || optionId.length > 80) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing option identifier' },
        { status: 400 }
      );
    }

    // Check poll verification requirements
    const poll = await db.getPollById(pollId);
    if (!poll) {
      return NextResponse.json({ success: false, error: 'Poll not found' }, { status: 404 });
    }

    if (poll.status !== 'LIVE') {
      return NextResponse.json({ success: false, error: 'This opinion poll is no longer active' }, { status: 400 });
    }

    // If zero verification / open polling is enabled for this poll
    if (poll.requires_verification === false || poll.verification_mode === 'NONE') {
      const result = await db.incrementVoteOpen(pollId, optionId, ip);
      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error || 'Vote submission failed' },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Vote recorded anonymously without verification',
        idempotencyKey: typeof idempotencyKey === 'string' ? idempotencyKey.slice(0, 64) : undefined,
      });
    }

    // For verified polls: check cryptographic CSPRNG anonymous token
    if (!anonymousToken || !isValidTokenFormat(anonymousToken)) {
      return NextResponse.json(
        { success: false, error: 'Verification required. Please verify via WhatsApp OTP before submitting.' },
        { status: 400 }
      );
    }

    // Compute cryptographic SHA-256 hash of the anonymous token
    const tokenHash = hashToken(anonymousToken);

    // Execute atomic vote submission transaction
    const result = await db.consumeTokenAndIncrementVote(pollId, optionId, tokenHash);

    if (!result.success) {
      const statusCode =
        result.error === 'CREDENTIAL_ALREADY_USED'
          ? 409
          : result.error === 'CREDENTIAL_EXPIRED'
          ? 410
          : 400;

      return NextResponse.json(
        { success: false, error: result.error || 'Vote submission failed' },
        { status: statusCode }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Vote recorded anonymously',
      idempotencyKey: typeof idempotencyKey === 'string' ? idempotencyKey.slice(0, 64) : undefined,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal vote processing failure' },
      { status: 500 }
    );
  }
}
