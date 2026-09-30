import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const stats = await db.getAuditStats();

    // STRICT RULE: Only aggregate metrics. ZERO voter PII or voter lists.
    return NextResponse.json({
      success: true,
      data: {
        totalVerified: stats.totalVerified,
        totalResponses: stats.totalResponses,
        totalFailures: stats.totalFailures,
        partiesCount: stats.partiesCount,
        activePollsCount: stats.activePollsCount,
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve admin aggregate metrics' },
      { status: 500 }
    );
  }
}
