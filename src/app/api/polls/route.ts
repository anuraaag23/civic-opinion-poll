import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const polls = await db.getPolls();
    return NextResponse.json({ success: true, polls });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve polls' },
      { status: 500 }
    );
  }
}
