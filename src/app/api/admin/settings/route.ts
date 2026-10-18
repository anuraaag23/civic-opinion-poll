import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdminRequest } from '@/lib/auth/admin';

export async function GET() {
  try {
    const settings = await db.getSiteSettings();
    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (err) {
    console.error('Failed to get site settings:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve site settings' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    if (!verifyAdminRequest(request)) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Admin authentication required' }, { status: 401 });
    }
    const body = await request.json();
    const updated = await db.updateSiteSettings(body);
    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    console.error('Failed to update site settings:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to update site settings' },
      { status: 500 }
    );
  }
}
