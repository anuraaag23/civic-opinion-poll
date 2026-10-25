import { NextRequest, NextResponse } from 'next/server';
import { sanitizeText, fetchSupporters, submitSupporter } from '@/lib/supabase';
import { verifyAdminRequest } from '@/lib/auth/admin';

// In-memory rate limiting: max 5 public supporter submissions per 10 minutes per IP
const supportSubmissions = new Map<string, { count: number; resetAt: number }>();

function checkSupportRateLimit(ip: string): boolean {
  const now = Date.now();
  // Prune expired entries if map grows
  if (supportSubmissions.size > 1000) {
    for (const [key, val] of supportSubmissions.entries()) {
      if (now > val.resetAt) supportSubmissions.delete(key);
    }
  }

  const entry = supportSubmissions.get(ip);
  if (!entry || now > entry.resetAt) {
    supportSubmissions.set(ip, { count: 1, resetAt: now + 10 * 60 * 1000 });
    return true;
  }

  if (entry.count >= 5) {
    return false;
  }

  entry.count += 1;
  return true;
}

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

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1';

    if (!checkSupportRateLimit(ip)) {
      return NextResponse.json(
        { success: false, error: 'Too many submissions. Please wait before submitting again.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { name, amount, cups, rating, message, paymentRef, verified } = body;

    // Security Hardening: Only an authenticated administrator can mark a supporter verified via POST.
    // Public user submissions are strictly unverified pending webhook or creator approval.
    const isAdmin = verifyAdminRequest(request);
    const isVerified = isAdmin && verified === true;

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
      verified: isVerified,
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

export async function PATCH(request: NextRequest) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1';

    if (!checkSupportRateLimit(ip)) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please wait a moment.' },
        { status: 429 }
      );
    }

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
