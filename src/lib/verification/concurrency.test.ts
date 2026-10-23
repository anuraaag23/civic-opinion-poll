import { describe, it, expect, beforeEach } from 'vitest';
import { db, civicStore } from '../db';
import { generateAnonymousToken } from '../crypto';

describe('Concurrency & Race-Condition Safeguards', () => {
  const pollId = 'poll-national-2029';

  beforeEach(() => {
    civicStore.seed();
  });

  it('permits EXACTLY ONE successful vote when 100 simultaneous submissions hit the same credential', async () => {
    // Generate a fresh anonymous token
    const { tokenHash } = generateAnonymousToken();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    await db.issueAnonymousCredential(pollId, tokenHash, expiresAt);

    // Launch 100 concurrent vote submissions with the identical token hash
    const attempts = Array.from({ length: 100 }).map(() =>
      db.consumeTokenAndIncrementVote(pollId, 'opt-party-inc', tokenHash)
    );

    const results = await Promise.all(attempts);

    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);

    // EXACTLY 1 must succeed
    expect(successful.length).toBe(1);
    // EXACTLY 99 must be rejected as already used
    expect(failed.length).toBe(99);
    expect(failed.every((f) => f.error === 'CREDENTIAL_ALREADY_USED')).toBe(true);
  });

  it('correctly increments vote counters under concurrent distinct token submissions with zero lost updates', async () => {
    const concurrencyBatch = 50;
    const tokens = Array.from({ length: concurrencyBatch }).map(() => generateAnonymousToken());

    for (const t of tokens) {
      await db.issueAnonymousCredential(
        pollId,
        t.tokenHash,
        new Date(Date.now() + 10 * 60 * 1000).toISOString()
      );
    }

    const initialResults = await db.getPollResults(pollId);
    const initialAapCount =
      initialResults?.results.find((r) => r.option_id === 'opt-party-aap')?.count || 0;

    // Concurrently submit 50 distinct votes for AAP
    await Promise.all(
      tokens.map((t) => db.consumeTokenAndIncrementVote(pollId, 'opt-party-aap', t.tokenHash))
    );

    const updatedResults = await db.getPollResults(pollId);
    const updatedAapCount =
      updatedResults?.results.find((r) => r.option_id === 'opt-party-aap')?.count || 0;

    // Verify all 50 votes are counted with 0 lost updates
    expect(updatedAapCount).toBe(initialAapCount + concurrencyBatch);
  });

  it('correctly increments vote count for zero-verification open polling', async () => {
    const customPollId = 'poll-one-nation-one-election';
    const optionId = 'opt-onoe-yes';

    const initialResults = await db.getPollResults(customPollId);
    const initialCount = initialResults?.results.find((r) => r.option_id === optionId)?.count || 0;

    // Submit 10 open votes concurrently without tokens or phone numbers
    const openVotes = Array.from({ length: 10 }).map((_, i) =>
      db.incrementVoteOpen(customPollId, optionId, `fingerprint-${i}`)
    );

    const outcomes = await Promise.all(openVotes);
    expect(outcomes.every((o) => o.success)).toBe(true);

    const updatedResults = await db.getPollResults(customPollId);
    const updatedCount = updatedResults?.results.find((r) => r.option_id === optionId)?.count || 0;

    expect(updatedCount).toBe(initialCount + 10);
  });
});
