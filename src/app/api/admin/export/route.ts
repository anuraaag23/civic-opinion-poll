import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';

    if (format === 'csv') {
      const csv = await db.exportPollsCsv();
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="meravote-polls-export-${Date.now()}.csv"`,
        },
      });
    }

    const data = await db.exportAllData();
    return new NextResponse(JSON.stringify(data, null, 2), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="meravote-full-backup-${Date.now()}.json"`,
      },
    });
  } catch (err) {
    console.error('Failed to export data:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to export platform data' },
      { status: 500 }
    );
  }
}
