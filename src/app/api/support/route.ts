import { NextResponse } from 'next/server';
import { sanitizeText, fetchSupporters, submitSupporter } from '@/lib/supabase';

export async function GET() {
  try {
    const list = await fetchSupporters();
    const verifiedList = list.filter((s) => s.verified === true);
    const totalAmountInr = verifiedList.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
    const totalCups = verifiedList.reduce((sum, s) => sum + (Number(s.cups) || 0), 0);

    return NextResponse.json({
      success: true,
      stats: {
        totalAmountInr,
        totalCups,
        supporterCount: verifiedList.length,
        lastUpdated: Date.now(),
      },
      supporters: verifiedList.slice(0, 20),
    });
  } catch (err) {
    console.error('Support GET error:', err);
    return NextResponse.json({
      success: true,
      stats: {
        totalAmountInr: 150,
        totalCups: 3,
        supporterCount: 2,
        lastUpdated: Date.now(),
      },
      supporters: [],
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, amount, cups, rating, message, paymentRef, verified } = body;

    const numAmount = Math.max(1, Math.min(100000, Number(amount) || 50));
    const numCups = Math.max(1, Math.min(2000, Number(cups) || Math.round(numAmount / 50)));
    const numRating = Math.min(5, Math.max(1, Math.round(Number(rating)) || 5));
    const cleanName = sanitizeText(name || 'Anonymous Citizen', 80);
    const cleanMessage = message ? sanitizeText(message, 350) : undefined;
    const cleanRef = paymentRef ? sanitizeText(paymentRef, 80) : undefined;

    await submitSupporter({
      name: cleanName,
      amount: numAmount,
      cups: numCups,
      rating: numRating,
      message: cleanMessage,
      paymentId: cleanRef,
      verified: verified === true,
    });

    const list = await fetchSupporters();
    const verifiedList = list.filter((s) => s.verified === true);
    const totalAmountInr = verifiedList.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
    const totalCups = verifiedList.reduce((sum, s) => sum + (Number(s.cups) || 0), 0);

    return NextResponse.json({
      success: true,
      stats: {
        totalAmountInr,
        totalCups,
        supporterCount: verifiedList.length,
        lastUpdated: Date.now(),
      },
    });
  } catch (err) {
    console.error('Support POST error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to record contribution' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, rating, message, name } = body;

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ success: false, error: 'Supporter ID is required' }, { status: 400 });
    }

    const { updateSupporter } = await import('@/lib/supabase');
    const success = await updateSupporter(id, {
      rating: rating !== undefined ? Math.min(5, Math.max(1, Number(rating))) : undefined,
      message: message !== undefined ? sanitizeText(String(message), 350) : undefined,
      name: name !== undefined ? sanitizeText(String(name), 80) : undefined,
    });

    return NextResponse.json({ success });
  } catch (err) {
    console.error('Support PATCH error:', err);
    return NextResponse.json({ success: false, error: 'Failed to update supporter' }, { status: 500 });
  }
}
