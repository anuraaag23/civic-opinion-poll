import { NextResponse } from 'next/server';
import { checkForAutoVerifiedPayment } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { initiatedAt, name, amount } = body;

    const timestamp = Number(initiatedAt) || Date.now() - 30000;
    const result = await checkForAutoVerifiedPayment(
      timestamp,
      typeof name === 'string' ? name : undefined,
      typeof amount === 'number' ? amount : undefined
    );

    return NextResponse.json({
      success: true,
      verified: result.verified,
      supporter: result.supporter || null,
    });
  } catch (err) {
    console.error('Verify payment endpoint error:', err);
    return NextResponse.json(
      { success: false, verified: false, error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
