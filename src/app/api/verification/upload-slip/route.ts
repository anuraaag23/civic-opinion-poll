import { NextRequest, NextResponse } from 'next/server';
import { verifyUploadedEciSlip } from '@/lib/verification/slip-verifier';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const pollId = formData.get('pollId');
    const deviceFingerprint = formData.get('deviceFingerprint') as string | null;
    const file = formData.get('file') as File | null;

    if (!pollId || typeof pollId !== 'string') {
      return NextResponse.json(
        { verified: false, reason: 'INVALID_POLL', error: 'Missing or invalid poll identifier.' },
        { status: 400 }
      );
    }

    if (!file) {
      return NextResponse.json(
        { verified: false, reason: 'INVALID_ECI_SLIP', error: 'Please upload your official ECI Voter Slip file.' },
        { status: 400 }
      );
    }

    // Limit maximum upload size to 8MB to protect memory
    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json(
        { verified: false, reason: 'INVALID_ECI_SLIP', error: 'File size exceeds 8MB limit.' },
        { status: 400 }
      );
    }

    // Convert file to Node buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Client IP extraction
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1';

    const cleanPollId = pollId.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);

    const result = await verifyUploadedEciSlip(
      cleanPollId,
      buffer,
      ip,
      deviceFingerprint || undefined
    );

    if (!result.verified) {
      const status =
        result.reason === 'ALREADY_VOTED'
          ? 409
          : result.reason === 'RATE_LIMITED'
          ? 429
          : 400;

      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      {
        verified: false,
        reason: 'SERVICE_UNAVAILABLE',
        error: 'Failed to process voter slip upload. Please try again.',
      },
      { status: 500 }
    );
  }
}
