import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdminRequest } from '@/lib/auth/admin';

export async function GET(request: Request) {
  try {
    if (!verifyAdminRequest(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';

    if (format === 'csv') {
      const csv = await db.exportPollsCsv();
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="meravote-polls-export-${Date.now()}.csv"`,
          'Cache-Control': 'no-store, max-age=0',
        },
      });
    }

    const data = await db.exportAllData();
    return new NextResponse(JSON.stringify(data, null, 2), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="meravote-full-backup-${Date.now()}.json"`,
        'Cache-Control': 'no-store, max-age=0',
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
