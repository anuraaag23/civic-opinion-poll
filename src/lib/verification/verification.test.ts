import { describe, it, expect, beforeEach } from 'vitest';
import { MockVerificationProvider } from './index';
import { db, civicStore } from '../db';
import { hashToken } from '../crypto';

describe('Verification & Anonymous Voting Engine', () => {
  let provider: MockVerificationProvider;
  const pollId = 'poll-national-2029';

  beforeEach(() => {
    // Reset store state
    civicStore.participation.clear();
    civicStore.tokens.clear();
    civicStore.voteCounts.clear();
    civicStore.seed();
    provider = new MockVerificationProvider();
  });

  it('successfully verifies a valid EPIC and returns an anonymous token', async () => {
    const result = await provider.verifyEligibility('ABC1234567', pollId);
    expect(result.verified).toBe(true);
    expect(result.anonymous_token).toBeDefined();
    expect(result.anonymous_token?.length).toBe(64);
  });

  it('rejects a second verification attempt for the same EPIC in the same poll', async () => {
    const first = await provider.verifyEligibility('ABC1234567', pollId);
    expect(first.verified).toBe(true);

    const second = await provider.verifyEligibility('ABC1234567', pollId);
    expect(second.verified).toBe(false);
    expect(second.reason).toBe('ALREADY_VOTED');
  });

  it('allows the same EPIC to participate in a distinct poll', async () => {
    const poll2Id = 'poll-state-reforms-2027';
    // Temporarily set poll2 to LIVE for testing
    const poll2 = civicStore.polls.get(poll2Id);
    if (poll2) poll2.status = 'LIVE';

    const res1 = await provider.verifyEligibility('XYZ9876543', pollId);
    const res2 = await provider.verifyEligibility('XYZ9876543', poll2Id);

    expect(res1.verified).toBe(true);
    expect(res2.verified).toBe(true);
  });

  it('rejects malformed EPIC formats without issuing tokens', async () => {
    const result = await provider.verifyEligibility('INVALID123', pollId);
    expect(result.verified).toBe(false);
    expect(result.reason).toBe('INVALID_FORMAT');
    expect(result.anonymous_token).toBeUndefined();
  });

  it('allows voting once with an anonymous token, then rejects duplicate use', async () => {
    const verifyRes = await provider.verifyEligibility('DEF1234567', pollId);
    expect(verifyRes.verified).toBe(true);
    const token = verifyRes.anonymous_token!;
    const tokenHash = hashToken(token);

    const initialResults = await db.getPollResults(pollId);
    const initialBjpCount =
      initialResults?.results.find((r) => r.option_id === 'opt-party-bjp')?.count || 0;

    // First Vote Submission
    const vote1 = await db.consumeTokenAndIncrementVote(pollId, 'opt-party-bjp', tokenHash);
    expect(vote1.success).toBe(true);

    const updatedResults = await db.getPollResults(pollId);
    const updatedBjpCount =
      updatedResults?.results.find((r) => r.option_id === 'opt-party-bjp')?.count || 0;
    expect(updatedBjpCount).toBe(initialBjpCount + 1);

    // Second Vote Submission with the same token MUST FAIL
    const vote2 = await db.consumeTokenAndIncrementVote(pollId, 'opt-party-bjp', tokenHash);
    expect(vote2.success).toBe(false);
    expect(vote2.error).toBe('CREDENTIAL_ALREADY_USED');
  });

  it('prevents MockVerificationProvider from running if PRODUCTION=true', () => {
    process.env.PRODUCTION = 'true';
    expect(() => new MockVerificationProvider()).toThrow('CRITICAL SAFETY EXCEPTION');
    delete process.env.PRODUCTION;
  });
});
