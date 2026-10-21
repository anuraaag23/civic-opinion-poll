import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdminRequest } from '@/lib/auth/admin';

export async function GET(request: NextRequest) {
  try {
    if (!verifyAdminRequest(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Administrative session required.' },
        { status: 401 }
      );
    }

    const users = await db.listAdminUsers();
    return NextResponse.json({ success: true, users });
  } catch (err) {
    console.error('Failed to retrieve admin users:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error retrieving admin users.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!verifyAdminRequest(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Administrative session required.' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { loginId, password, displayName, role } = body;

    if (!loginId || typeof loginId !== 'string' || loginId.trim().length < 3) {
      return NextResponse.json(
        { success: false, error: 'Admin Login ID must be at least 3 characters.' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string' || password.trim().length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters.' },
        { status: 400 }
      );
    }

    const newUser = await db.createAdminUser({
      loginId: loginId.trim(),
      password: password.trim(),
      displayName: typeof displayName === 'string' ? displayName.trim() : undefined,
      role: role === 'poll_manager' || role === 'moderator' ? role : 'super_admin',
    });

    return NextResponse.json({
      success: true,
      message: 'New administrator account created successfully.',
      user: newUser,
    });
  } catch (err) {
    console.error('Failed to create admin user:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to create administrator account.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!verifyAdminRequest(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Administrative session required.' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { id } = body;

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Missing admin user ID.' },
        { status: 400 }
      );
    }

    await db.deleteAdminUser(id);

    return NextResponse.json({
      success: true,
      message: 'Administrator account deleted successfully.',
    });
  } catch (err) {
    console.error('Failed to delete admin user:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to delete administrator account.' },
      { status: 500 }
    );
  }
}
