import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashToken, isValidTokenFormat } from '@/lib/crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pollId, optionId, anonymousToken, idempotencyKey } = body;

    if (!pollId || !optionId || !anonymousToken) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    if (!isValidTokenFormat(anonymousToken)) {
      return NextResponse.json(
        { success: false, error: 'Invalid anonymous credential token format' },
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
      idempotencyKey: idempotencyKey || undefined,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal vote processing failure' },
      { status: 500 }
    );
  }
}
