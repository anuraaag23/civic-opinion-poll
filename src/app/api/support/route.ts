import { NextResponse } from 'next/server';
import { sanitizeInput, sanitizeMessage } from '@/lib/kofi/config';

// In-memory server ledger of verified supporters for Mera Vote
interface ServerSupporter {
  id: string;
  name: string;
  amount: number;
  cups: number;
  rating: number;
  message?: string;
  timestamp: number;
}

const serverSupporters: ServerSupporter[] = [
  {
    id: 'sup-init-1',
    name: 'Deshbhakt Citizen',
    amount: 100,
    cups: 2,
    rating: 5,
    message: 'Keep this independent and alive! We need honest opinion polls in India.',
    timestamp: Date.now() - 3600000 * 24,
  },
  {
    id: 'sup-init-2',
    name: 'Anonymous Voter (UP)',
    amount: 50,
    cups: 1,
    rating: 5,
    message: 'Proud of you, brother. Politics needs young minds.',
    timestamp: Date.now() - 3600000 * 12,
  },
];

export async function GET() {
  const totalAmountInr = serverSupporters.reduce((sum, s) => sum + s.amount, 0);
  const totalCups = serverSupporters.reduce((sum, s) => sum + s.cups, 0);

  return NextResponse.json({
    success: true,
    stats: {
      totalAmountInr,
      totalCups,
      supporterCount: serverSupporters.length,
      lastUpdated: Date.now(),
    },
    supporters: serverSupporters.slice(0, 20),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, amount, cups, rating, message, paymentRef } = body;

    const numAmount = Math.max(1, Math.min(100000, Number(amount) || 50));
    const numCups = Math.max(1, Math.min(2000, Number(cups) || Math.round(numAmount / 50)));
    const numRating = Math.min(5, Math.max(1, Math.round(Number(rating)) || 5));
    const cleanName = sanitizeInput(name || 'Anonymous Citizen', 80);
    const cleanMessage = message ? sanitizeMessage(message, 350) : undefined;

    const newRecord: ServerSupporter = {
      id: `sup-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: cleanName,
      amount: numAmount,
      cups: numCups,
      rating: numRating,
      message: cleanMessage,
      timestamp: Date.now(),
    };

    serverSupporters.unshift(newRecord);

    const totalAmountInr = serverSupporters.reduce((sum, s) => sum + s.amount, 0);
    const totalCups = serverSupporters.reduce((sum, s) => sum + s.cups, 0);

    return NextResponse.json({
      success: true,
      supporter: newRecord,
      stats: {
        totalAmountInr,
        totalCups,
        supporterCount: serverSupporters.length,
        lastUpdated: Date.now(),
      },
      paymentRef: paymentRef ? sanitizeInput(paymentRef, 80) : undefined,
    });
  } catch (err) {
    console.error('Support API error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to record contribution' },
      { status: 500 }
    );
  }
}
