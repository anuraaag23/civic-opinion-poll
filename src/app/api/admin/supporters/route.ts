import { NextResponse } from 'next/server';
import { fetchAllSupporters, updateSupporter, deleteSupporter, submitSupporter } from '@/lib/supabase';
import { verifyAdminRequest } from '@/lib/auth/admin';

export async function GET(request: Request) {
  try {
    if (!verifyAdminRequest(request)) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Admin authentication required' }, { status: 401 });
    }
    const list = await fetchAllSupporters();
    return NextResponse.json({
      success: true,
      data: list,
    });
  } catch (err) {
    console.error('Failed to get supporters for admin:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve supporters' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    if (!verifyAdminRequest(request)) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Admin authentication required' }, { status: 401 });
    }
    const body = await request.json();
    const { name, amount, cups, rating, message, verified } = body;

    const ok = await submitSupporter({
      name,
      amount: Number(amount) || 20,
      cups: Number(cups) || 1,
      rating: Number(rating) || 5,
      message,
      verified: verified !== false,
    });

    return NextResponse.json({ success: ok });
  } catch (err) {
    console.error('Failed to create supporter:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to create supporter' },
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
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Supporter ID is required' },
        { status: 400 }
      );
    }

    const ok = await updateSupporter(id, updates);
    return NextResponse.json({ success: ok });
  } catch (err) {
    console.error('Failed to update supporter:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to update supporter' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    if (!verifyAdminRequest(request)) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Admin authentication required' }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Supporter ID is required' },
        { status: 400 }
      );
    }

    const ok = await deleteSupporter(id);
    return NextResponse.json({ success: ok });
  } catch (err) {
    console.error('Failed to delete supporter:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to delete supporter' },
      { status: 500 }
    );
  }
}
