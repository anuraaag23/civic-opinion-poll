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

    const { sanitizeText, sanitizeSvg, isValidHexColor } = await import('@/lib/utils/sanitize');

    const cleanNameEn = sanitizeText(name_en, 80);
    const cleanNameHi = sanitizeText(name_hi, 80);
    const cleanShort = sanitizeText(short_name || name_en.slice(0, 4), 10).toUpperCase().replace(/[^A-Z0-9]/g, '');
    const partyColor = isValidHexColor(color) ? color.trim() : '#3B82F6';
    const partyId = `party-${cleanShort.toLowerCase().replace(/[^a-z0-9]/g, '') || 'custom'}-${Date.now().toString().slice(-4)}`;

    // Validate safe image URL (http/https or safe data:image/)
    let safeLogoUrl: string | undefined = undefined;
    if (typeof logo_url === 'string' && logo_url.trim()) {
      const trimmed = logo_url.trim();
      if (/^https?:\/\//i.test(trimmed) || /^data:image\/(?:png|jpeg|jpg|webp|svg\+xml);base64,/i.test(trimmed)) {
        safeLogoUrl = trimmed;
      }
    }

    // Build SVG or use provided SVG / image data
    let finalSvg = '';
    if (typeof symbol_svg === 'string' && symbol_svg.trim()) {
      finalSvg = sanitizeSvg(symbol_svg);
    } else if (safeLogoUrl) {
      finalSvg = `<image href="${safeLogoUrl}" width="64" height="64" />`;
    } else {
      finalSvg = `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="30" fill="${partyColor}" fill-opacity="0.15" stroke="${partyColor}" stroke-width="2.5"/><text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" fill="${partyColor}" font-size="18" font-family="sans-serif" font-weight="900">${cleanShort.slice(0, 4)}</text></svg>`;
    }

    const newParty: Party = {
      id: partyId,
      name_en: cleanNameEn,
      name_hi: cleanNameHi,
      short_name: cleanShort,
      color: partyColor,
      logo_url: safeLogoUrl,
      symbol_svg: finalSvg,
      symbol_alt_en: `${cleanNameEn} Election Symbol`,
      symbol_alt_hi: `${cleanNameHi} चुनाव चिह्न`,
      description_en: description_en ? sanitizeText(description_en, 250) : `Political party: ${cleanNameEn}`,
      description_hi: description_hi ? sanitizeText(description_hi, 250) : `राजनीतिक दल: ${cleanNameHi}`,
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
