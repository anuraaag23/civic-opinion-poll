import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdminRequest } from '@/lib/auth/admin';
import { supabaseAdmin } from '@/lib/supabase';
import { ALL_PARTIES, Party } from '@/lib/data/parties';

export async function GET(request: Request) {
  try {
    if (!verifyAdminRequest(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin authentication required' },
        { status: 401 }
      );
    }

    const parties = await db.getAllParties();
    return NextResponse.json({ success: true, parties });
  } catch (err) {
    console.error('Failed to get parties:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve political parties' },
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

    const body = await request.json();
    const {
      name_en,
      name_hi,
      short_name,
      color,
      logo_url,
      symbol_svg,
      description_en,
      description_hi,
    } = body;

    if (!name_en || !name_hi) {
      return NextResponse.json(
        { success: false, error: 'Party English and Hindi names are required' },
        { status: 400 }
      );
    }

    const shortCode = (short_name || name_en.slice(0, 4)).trim().toUpperCase();
    const partyColor = color || '#3B82F6';
    const partyId = `party-${shortCode.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now().toString().slice(-4)}`;

    // Build SVG or use provided SVG / image data
    const finalSvg =
      symbol_svg ||
      (logo_url?.startsWith('data:image') || logo_url?.startsWith('http')
        ? `<image href="${logo_url}" width="64" height="64" />`
        : `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="30" fill="${partyColor}" fill-opacity="0.15" stroke="${partyColor}" stroke-width="2.5"/><text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" fill="${partyColor}" font-size="18" font-family="sans-serif" font-weight="900">${shortCode.slice(0, 4)}</text></svg>`);

    const newParty: Party = {
      id: partyId,
      name_en: name_en.trim(),
      name_hi: name_hi.trim(),
      short_name: shortCode,
      color: partyColor,
      logo_url: logo_url || undefined,
      symbol_svg: finalSvg,
      symbol_alt_en: `${name_en} Election Symbol`,
      symbol_alt_hi: `${name_hi} चुनाव चिह्न`,
      description_en: description_en || `Political party: ${name_en}`,
      description_hi: description_hi || `राजनीतिक दल: ${name_hi}`,
      source_ref: 'Admin Custom Party Registry',
      is_active: true,
      display_order: 99,
    };

    // Save to database
    await db.saveParty(newParty);

    return NextResponse.json({ success: true, party: newParty });
  } catch (err) {
    console.error('Failed to create party:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to create political party' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    if (!verifyAdminRequest(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const partyId = searchParams.get('id');

    if (!partyId) {
      return NextResponse.json(
        { success: false, error: 'Party ID is required' },
        { status: 400 }
      );
    }

    await db.deleteParty(partyId);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Failed to delete party:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to delete political party' },
      { status: 500 }
    );
  }
}
