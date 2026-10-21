import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await db.getSiteSettings();
    return NextResponse.json(
      {
        success: true,
        data: {
          maintenanceMode: Boolean(settings.maintenanceMode),
          maintenanceTitleEn:
            settings.maintenanceTitleEn || 'Platform Under Scheduled Maintenance',
          maintenanceTitleHi:
            settings.maintenanceTitleHi || 'मंच पर तकनीकी रखरखाव जारी है',
          maintenanceMessageEn:
            settings.maintenanceMessageEn ||
            'We are performing routine maintenance and security updates. Voting will resume shortly.',
          maintenanceMessageHi:
            settings.maintenanceMessageHi ||
            'हम नियमित तकनीकी रखरखाव कर रहे हैं। मतदान शीघ्र पुनः प्रारंभ होगा।',
          emergencyBannerEnabled: Boolean(settings.emergencyBannerEnabled),
          emergencyBannerTextEn: settings.emergencyBannerTextEn || '',
          emergencyBannerTextHi: settings.emergencyBannerTextHi || '',
          emergencyBannerType: settings.emergencyBannerType || 'info',
          allowVoting: settings.allowVoting !== false,
          lastUpdated: settings.lastUpdated,
        },
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  } catch (err) {
    console.error('Site status error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve site status' },
      { status: 500 }
    );
  }
}
