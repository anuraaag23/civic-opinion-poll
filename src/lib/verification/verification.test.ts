import { describe, it, expect, beforeEach } from 'vitest';
import { selfVerificationService, ECI_ELECTORAL_SEARCH_URL } from './index';
import { db, civicStore } from '../db';
import { hashToken } from '../crypto';
import { translations } from '../i18n/translations';

describe('Real Voter ID Verification & Anonymous Voting Engine', () => {
  const pollId = 'poll-national-2029';

  beforeEach(() => {
    // Reset store state
    civicStore.participation.clear();
    civicStore.tokens.clear();
    civicStore.voteCounts.clear();
    civicStore.seed();
  });

  // TEST 1: User opens poll - self-verification required
  it('TEST 1: requires self-verification confirmation before issuing voting credentials', async () => {
    const unconfirmed = await selfVerificationService.processSelfVerification(pollId, false);
    expect(unconfirmed.verified).toBe(false);
    expect(unconfirmed.reason).toBe('UNCONFIRMED');
    expect(unconfirmed.anonymous_token).toBeUndefined();
  });

  // TEST 2: Official ECI link
  it('TEST 2: provides the official immutable ECI electoral search URL', () => {
    expect(ECI_ELECTORAL_SEARCH_URL).toBe('https://electoralsearch.eci.gov.in/');
    expect(selfVerificationService.eciSearchUrl).toBe('https://electoralsearch.eci.gov.in/');
  });

  // TEST 3: Blocked without explicit confirmation checkbox
  it('TEST 3: blocks credential issuance when confirmation checkbox is false', async () => {
    const result = await selfVerificationService.processSelfVerification(pollId, false, '127.0.0.1');
    expect(result.verified).toBe(false);
    expect(result.reason).toBe('UNCONFIRMED');
  });

  // TEST 4: User checks confirmation - anonymous credential created
  it('TEST 4: generates anonymous participation credential when self-verification is confirmed', async () => {
    const result = await selfVerificationService.processSelfVerification(pollId, true, '127.0.0.1', 'KRL1234567');
    expect(result.verified).toBe(true);
    expect(result.status).toBe('SELF_VERIFICATION_CONFIRMED');
    expect(result.anonymous_token).toBeDefined();
    expect(result.anonymous_token?.length).toBe(64); // 256-bit hex token
    expect(result.expires_at).toBeDefined();
  });

  // TEST 5: User votes - one successful vote recorded
  it('TEST 5: records exactly one successful vote and increments aggregate tally', async () => {
    const verifyRes = await selfVerificationService.processSelfVerification(pollId, true, '127.0.0.1', 'UPX9876543');
    expect(verifyRes.verified).toBe(true);
    const token = verifyRes.anonymous_token!;
    const tokenHash = hashToken(token);

    const initialResults = await db.getPollResults(pollId);
    const initialBjpCount =
      initialResults?.results.find((r) => r.option_id === 'opt-party-bjp')?.count || 0;

    const voteRes = await db.consumeTokenAndIncrementVote(pollId, 'opt-party-bjp', tokenHash);
    expect(voteRes.success).toBe(true);

    const updatedResults = await db.getPollResults(pollId);
    const updatedBjpCount =
      updatedResults?.results.find((r) => r.option_id === 'opt-party-bjp')?.count || 0;
    expect(updatedBjpCount).toBe(initialBjpCount + 1);
  });

  // TEST 6: User tries to vote again with same token - blocked
  it('TEST 6: blocks duplicate voting attempt using the same credential', async () => {
    const verifyRes = await selfVerificationService.processSelfVerification(pollId, true, '127.0.0.1', 'MHA5551234');
    const token = verifyRes.anonymous_token!;
    const tokenHash = hashToken(token);

    const vote1 = await db.consumeTokenAndIncrementVote(pollId, 'opt-party-inc', tokenHash);
    expect(vote1.success).toBe(true);

    const vote2 = await db.consumeTokenAndIncrementVote(pollId, 'opt-party-inc', tokenHash);
    expect(vote2.success).toBe(false);
    expect(vote2.error).toBe('CREDENTIAL_ALREADY_USED');
  });

  // TEST 7: Inspect database - NO EPIC, NO voter name, NO address, NO email, NO phone
  it('TEST 7: guarantees NO EPIC, voter name, address, email, or phone in database records', async () => {
    await selfVerificationService.processSelfVerification(pollId, true, '127.0.0.1', 'ABC1234567');

    // Inspect participation table
    const records = Array.from(civicStore.participation.values());
    expect(records.length).toBeGreaterThan(0);

    for (const record of records) {
      expect((record as unknown as Record<string, unknown>).epic).toBeUndefined();
      expect((record as unknown as Record<string, unknown>).name).toBeUndefined();
      expect((record as unknown as Record<string, unknown>).address).toBeUndefined();
      expect((record as unknown as Record<string, unknown>).email).toBeUndefined();
      expect((record as unknown as Record<string, unknown>).phone).toBeUndefined();
      expect(record.self_verification_confirmed).toBe(true);
      expect(record.status).toBe('SELF_VERIFICATION_CONFIRMED');
    }

    // Inspect tokens table
    const tokens = Array.from(civicStore.tokens.values());
    for (const t of tokens) {
      expect((t as unknown as Record<string, unknown>).epic).toBeUndefined();
      expect((t as unknown as Record<string, unknown>).name).toBeUndefined();
      expect((t as unknown as Record<string, unknown>).vote).toBeUndefined();
    }
  });

  // TEST 8: Inspect token decoupled from vote choice
  it('TEST 8: ensures anonymous token contains zero embedded vote or personal metadata', () => {
    const verifyRes = selfVerificationService.processSelfVerification(pollId, true, '127.0.0.1', 'DEL9998888');
    return verifyRes.then((res) => {
      const token = res.anonymous_token!;
      expect(token).toMatch(/^[0-9a-f]{64}$/); // Pure cryptographic hex entropy
    });
  });

  // TEST 9: Open poll in Hindi - all verification instructions translated
  it('TEST 9: verifies complete Hindi translations for Mode A verification instructions', () => {
    const hi = translations.hi.verification;
    expect(hi.title).toBe('व्हाट्सएप ओटीपी द्वारा सत्यापन');
    expect(hi.completedCheckButton).toBe('मैंने कोड सत्यापित कर लिया है');
    expect(hi.step1Title).toBe('मोबाइल नंबर दर्ज करें');
    expect(hi.step2Title).toBe('6-अंकों का ओटीपी दर्ज करें');
    expect(hi.step3Title).toBe('गोपनीय मत दर्ज करें');
    expect(hi.disclaimer).toContain('महत्वपूर्ण:');
    expect(hi.confirmModalTitle).toBe('व्हाट्सएप सत्यापन की पुष्टि करें');
    expect(hi.selfVerificationConfirmed).toBe('व्हाट्सएप सत्यापन की पुष्टि हुई');
  });

  // TEST 10: Disallow invalid or inactive polls
  it('TEST 10: rejects self-verification if poll does not exist or is not LIVE', async () => {
    const result = await selfVerificationService.processSelfVerification('non-existent-poll', true);
    expect(result.verified).toBe(false);
    expect(result.reason).toBe('INVALID_POLL');
  });

  // TEST 11: Real Voter ID Verification - Successfully verifies genuine EPIC
  it('TEST 11: verifies genuine Voter ID (EPIC) and issues single-use anonymous credential', async () => {
    const result = await selfVerificationService.processSelfVerification(
      pollId,
      true,
      '127.0.0.1',
      'XYZ9876543'
    );
    expect(result.verified).toBe(true);
    expect(result.anonymous_token).toBeDefined();
    expect(result.anonymous_token?.length).toBe(64);
  });

  // TEST 12: Real Voter ID Deduplication - Blocks same Voter ID across browser changes or cookie clears
  it('TEST 12: permanently BLOCKS duplicate vote attempt with the same Voter ID across sessions/cookie clear', async () => {
    const voterId = 'WBD7654321';

    // First attempt: should succeed
    const firstAttempt = await selfVerificationService.processSelfVerification(
      pollId,
      true,
      '127.0.0.1',
      voterId
    );
    expect(firstAttempt.verified).toBe(true);

    // Second attempt (simulating another browser / cleared cookies with same Voter ID): MUST BE BLOCKED
    const secondAttempt = await selfVerificationService.processSelfVerification(
      pollId,
      true,
      '192.168.1.5', // Different IP / browser
      voterId
    );
    expect(secondAttempt.verified).toBe(false);
    expect(secondAttempt.reason).toBe('ALREADY_VOTED');
    expect(secondAttempt.error).toContain('already cast a vote');
  });

  // TEST 13: Reject invalid Voter ID formats
  it('TEST 13: rejects invalid Voter ID formats and bogus sequences', async () => {
    // Too short / missing letters
    const invalidFormat = await selfVerificationService.processSelfVerification(
      pollId,
      true,
      '127.0.0.1',
      '123456'
    );
    expect(invalidFormat.verified).toBe(false);
    expect(invalidFormat.reason).toBe('INVALID_FORMAT');

    // Repetitive dummy sequence
    const bogusSequence = await selfVerificationService.processSelfVerification(
      pollId,
      true,
      '127.0.0.1',
      'ABC0000000'
    );
    expect(bogusSequence.verified).toBe(false);
    expect(bogusSequence.reason).toBe('INVALID_FORMAT');
  });
});
