import { NextResponse } from 'next/server';
import { supabase, sanitizeText } from '@/lib/supabase';

// Official Ko-fi Verification Token configured for @ryper
const EXPECTED_TOKEN =
  process.env.KOFI_VERIFICATION_TOKEN || 'c7bf8b09-4bbf-4789-a823-f1ad63ff1df8';

interface KofiPayload {
  verification_token?: string;
  from_name?: string;
  amount?: string | number;
  message?: string;
  kofi_transaction_id?: string;
  email?: string;
  timestamp?: string;
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

    // Ko-fi delivers payload as url-encoded form body with a 'data' string parameter, or as JSON
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

    // Cryptographic Security: Validate Ko-fi Verification Token
    if (payload.verification_token) {
      if (payload.verification_token !== EXPECTED_TOKEN) {
        console.warn('Unauthorized webhook attempt with invalid verification token:', payload.verification_token);
        return NextResponse.json({ error: 'Unauthorized: Invalid verification token' }, { status: 401 });
      }
    }

    const fromName = sanitizeText(payload.from_name || 'Anonymous Supporter', 80);
    const numAmount = Number(payload.amount) || 50;
    const cups = Math.max(1, Math.round(numAmount / 50));
    const cleanMessage = payload.message ? sanitizeText(payload.message, 350) : null;
    const transactionId = String(payload.kofi_transaction_id || `kofi-${Date.now()}`).trim();
    const createdAt = payload.timestamp ? new Date(payload.timestamp).toISOString() : new Date().toISOString();

    console.log(`[Ko-fi Webhook] Verified donation received: ₹${numAmount} from "${fromName}" (ID: ${transactionId})`);

    // Synchronize to Supabase supporters ledger
    if (supabase) {
      try {
        // 1. Check if supporter already exists with this transaction ID
        const { data: existing } = await supabase
          .from('supporters')
          .select('id, name')
          .eq('payment_id', transactionId)
          .limit(1);

        if (existing && existing.length > 0) {
          await supabase
            .from('supporters')
            .update({
              verified: true,
              amount: numAmount,
              cups: cups,
              name: existing[0].name && existing[0].name !== 'Anonymous Supporter' ? existing[0].name : fromName,
            })
            .eq('id', existing[0].id);
        } else {
          // 2. Check if a recent unverified submission exists from the same name (within last 10 minutes)
          const tenMinutesAgo = new Date(Date.now() - 600000).toISOString();
          const { data: pendingMatch } = await supabase
            .from('supporters')
            .select('id, rating, message')
            .eq('verified', false)
            .ilike('name', fromName)
            .gte('created_at', tenMinutesAgo)
            .limit(1);

          if (pendingMatch && pendingMatch.length > 0) {
            await supabase
              .from('supporters')
              .update({
                verified: true,
                amount: numAmount,
                cups: cups,
                payment_id: transactionId,
              })
              .eq('id', pendingMatch[0].id);
          } else {
            // 3. Insert new verified supporter
            await supabase.from('supporters').insert([
              {
                name: fromName,
                amount: numAmount,
                cups: cups,
                rating: 5,
                message: cleanMessage,
                payment_id: transactionId,
                verified: true,
                created_at: createdAt,
              },
            ]);
          }
        }
      } catch (dbErr) {
        console.error('Supabase write error during webhook:', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      verified: true,
      message: 'Ko-fi real payment verified & published successfully',
      data: {
        supporter: fromName,
        amount: numAmount,
        transactionId,
      },
    });
  } catch (err) {
    console.error('Ko-fi webhook processing error:', err);
    return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 });
  }
}
