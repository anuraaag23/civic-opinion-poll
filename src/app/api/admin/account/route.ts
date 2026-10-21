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

    const account = await db.getAdminAccount();
    return NextResponse.json({
      success: true,
      data: {
        loginId: account.loginId,
        adminPathSlug: account.adminPathSlug,
        updatedAt: account.updatedAt,
      },
    });
  } catch (err) {
    console.error('Failed to get admin account info:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve admin account' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    if (!verifyAdminRequest(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { currentPassword, newLoginId, newPassword, newAdminPathSlug } = body;

    if (!currentPassword || typeof currentPassword !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Current password is required to verify your identity' },
        { status: 400 }
      );
    }

    const currentAccount = await db.getAdminAccount();
    const isCurrentValid = await db.verifyAdminLogin(currentAccount.loginId, currentPassword);
    if (!isCurrentValid) {
      return NextResponse.json(
        { success: false, error: 'Current password is incorrect. Verification failed.' },
        { status: 403 }
      );
    }

    if (newPassword && newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: 'New password must be at least 8 characters long.' },
        { status: 400 }
      );
    }

    const updated = await db.updateAdminAccount({
      loginId: newLoginId,
      password: newPassword,
      adminPathSlug: newAdminPathSlug,
    });

    return NextResponse.json({
      success: true,
      message: 'Admin credentials and security path successfully updated in database.',
      data: {
        loginId: updated.loginId,
        adminPathSlug: updated.adminPathSlug,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (err) {
    console.error('Failed to update admin account:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to update admin account credentials' },
      { status: 500 }
    );
  }
}
