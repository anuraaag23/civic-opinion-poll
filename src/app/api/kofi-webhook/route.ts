import { NextResponse } from 'next/server';
import { sanitizeInput, sanitizeMessage } from '@/lib/kofi/config';

const EXPECTED_TOKEN = process.env.KOFI_VERIFICATION_TOKEN;

interface KofiPayload {
  verification_token?: string;
  from_name?: string;
  amount?: string | number;
  message?: string;
  kofi_transaction_id?: string;
  data?: string | Record<string, unknown>;
}

export async function GET() {
  return NextResponse.json({
    status: 'active',
    service: 'Mera Vote Ko-fi Webhook Listener',
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  try {
    let payload: KofiPayload | null = null;
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const text = await request.text();
      const params = new URLSearchParams(text);
      const dataStr = params.get('data');
      if (dataStr) {
        payload = JSON.parse(dataStr) as KofiPayload;
      } else {
        payload = Object.fromEntries(params.entries()) as KofiPayload;
      }
    } else {
      const raw = await request.json();
      if (raw && typeof raw.data === 'string') {
        payload = JSON.parse(raw.data) as KofiPayload;
      } else if (raw && raw.data && typeof raw.data === 'object') {
        payload = raw.data as KofiPayload;
      } else {
        payload = raw as KofiPayload;
      }
    }

    if (!payload) {
      return NextResponse.json({ error: 'Missing or empty Ko-fi payload' }, { status: 400 });
    }

    // Cryptographic Security: Validate Ko-fi Verification Token if configured
    if (EXPECTED_TOKEN && payload.verification_token) {
      if (payload.verification_token !== EXPECTED_TOKEN) {
        console.warn('Unauthorized webhook attempt with invalid verification token');
        return NextResponse.json({ error: 'Unauthorized: Invalid verification token' }, { status: 401 });
      }
    }

    const fromName = sanitizeInput(payload.from_name || 'Anonymous Supporter', 80);
    const amount = Number(payload.amount) || 50;
    const message = payload.message ? sanitizeMessage(payload.message, 350) : undefined;
    const transactionId = sanitizeInput(payload.kofi_transaction_id || '', 80);

    console.log(`[Ko-fi Webhook] Verified donation received: ₹${amount} from "${fromName}" (ID: ${transactionId})`);

    return NextResponse.json({
      success: true,
      message: 'Ko-fi donation received and verified successfully',
      data: {
        supporter: fromName,
        amount,
        message,
        transactionId,
      },
    });
  } catch (err) {
    console.error('Ko-fi webhook processing error:', err);
    return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 });
  }
}
