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
    } = body;

    if (!title_en || !title_hi) {
      return NextResponse.json(
        { success: false, error: 'English and Hindi titles are required' },
        { status: 400 }
      );
    }

    const newPoll = await db.createPoll({
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
    const { title_en, title_hi, description_en, description_hi, status, end_at, start_at, results_visibility } = body;
    const updated = await db.updatePoll(pollId, {
      title_en,
      title_hi,
      description_en,
      description_hi,
      status,
      end_at,
      start_at,
      results_visibility,
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
