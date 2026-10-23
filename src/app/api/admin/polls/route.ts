import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdminRequest } from '@/lib/auth/admin';

export async function GET(request: Request) {
  try {
    if (!verifyAdminRequest(request)) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Admin authentication required' }, { status: 401 });
    }
    const detailedPolls = await db.getDetailedPolls();
    return NextResponse.json({
      success: true,
      data: detailedPolls,
    });
  } catch (err) {
    console.error('Failed to get admin polls:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve polls' },
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
    const {
      slug,
      title_en,
      title_hi,
      description_en,
      description_hi,
      status,
      start_at,
      end_at,
      party_ids,
      custom_options,
      results_visibility,
      voting_policy,
      max_votes_per_citizen,
      requires_verification,
      verification_mode,
      poll_type,
      category,
    } = body;

    if (!title_en || !title_hi) {
      return NextResponse.json(
        { success: false, error: 'English and Hindi titles are required' },
        { status: 400 }
      );
    }

    const { sanitizeText, sanitizeId } = await import('@/lib/utils/sanitize');

    const cleanTitleEn = sanitizeText(title_en, 150);
    const cleanTitleHi = sanitizeText(title_hi, 150);
    const cleanDescEn = description_en ? sanitizeText(description_en, 500) : '';
    const cleanDescHi = description_hi ? sanitizeText(description_hi, 500) : '';
    const cleanSlug = slug ? sanitizeId(slug, 80) : undefined;

    const newPoll = await db.createPoll({
      slug: cleanSlug,
      title_en: cleanTitleEn,
      title_hi: cleanTitleHi,
      description_en: cleanDescEn,
      description_hi: cleanDescHi,
      status,
      start_at,
      end_at,
      party_ids,
      custom_options,
      results_visibility,
      voting_policy,
      max_votes_per_citizen,
      requires_verification: requires_verification !== undefined ? Boolean(requires_verification) : true,
      verification_mode: verification_mode || (requires_verification === false ? 'NONE' : 'WHATSAPP_OTP'),
      poll_type: poll_type || 'CUSTOM',
      category: category ? sanitizeText(category, 50) : undefined,
    });

    return NextResponse.json({
      success: true,
      data: newPoll,
    });
  } catch (err) {
    console.error('Failed to create poll:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to create poll' },
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
    const { action, pollId } = body;

    if (!pollId) {
      return NextResponse.json(
        { success: false, error: 'Poll ID is required' },
        { status: 400 }
      );
    }

    if (action === 'update_option_count') {
      const { optionId, count } = body;
      if (!optionId || count === undefined) {
        return NextResponse.json(
          { success: false, error: 'Option ID and count are required' },
          { status: 400 }
        );
      }

      const updated = await db.updateOptionVoteCount(pollId, optionId, Number(count));
      if (!updated) {
        return NextResponse.json(
          { success: false, error: 'Failed to update vote count' },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true });
    }

    if (action === 'reset_votes') {
      const reset = await db.resetPollVotes(pollId);
      if (!reset) {
        return NextResponse.json(
          { success: false, error: 'Failed to reset poll votes' },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true });
    }

    if (action === 'toggle_status') {
      const { status } = body;
      const updated = await db.updatePoll(pollId, { status });
      if (!updated) {
        return NextResponse.json(
          { success: false, error: 'Poll not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, data: updated });
    }

    // Default: update general poll details
    const {
      title_en,
      title_hi,
      description_en,
      description_hi,
      status,
      end_at,
      start_at,
      results_visibility,
      voting_policy,
      max_votes_per_citizen,
      requires_verification,
      verification_mode,
      poll_type,
      category,
    } = body;

    const { sanitizeText } = await import('@/lib/utils/sanitize');

    const updated = await db.updatePoll(pollId, {
      title_en: title_en ? sanitizeText(title_en, 150) : undefined,
      title_hi: title_hi ? sanitizeText(title_hi, 150) : undefined,
      description_en: description_en !== undefined ? sanitizeText(description_en, 500) : undefined,
      description_hi: description_hi !== undefined ? sanitizeText(description_hi, 500) : undefined,
      status,
      end_at,
      start_at,
      results_visibility,
      voting_policy,
      max_votes_per_citizen,
      requires_verification: requires_verification !== undefined ? Boolean(requires_verification) : undefined,
      verification_mode,
      poll_type,
      category: category ? sanitizeText(category, 50) : undefined,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Poll not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error('Failed to update poll:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to update poll' },
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
    const pollId = searchParams.get('id');

    if (!pollId) {
      return NextResponse.json(
        { success: false, error: 'Poll ID is required' },
        { status: 400 }
      );
    }

    const deleted = await db.deletePoll(pollId);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Poll not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Failed to delete poll:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to delete poll' },
      { status: 500 }
    );
  }
}
