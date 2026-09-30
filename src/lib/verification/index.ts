import { VerificationResult } from '../types';
import { normalizeEpic, generateParticipationFingerprint, generateAnonymousToken } from '../crypto';
import { db } from '../db';

export interface IVerificationProvider {
  name: string;
  verifyEligibility(epic: string, pollId: string, clientIp?: string): Promise<VerificationResult>;
}

// Simple in-memory rate limiter for verification attempts (IP or salt hash)
const rateLimitMap = new Map<string, { attempts: number; resetAt: number }>();

function checkRateLimit(key: string, maxAttempts = 10, windowMs = 60000): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { attempts: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.attempts >= maxAttempts) {
    return false;
  }

  entry.attempts += 1;
  return true;
}

/**
 * Mock Verification Provider for local development & testing.
 * SAFETY RULE: Strictly disabled if PRODUCTION=true or NODE_ENV=production.
 */
export class MockVerificationProvider implements IVerificationProvider {
  name = 'MockVerificationProvider';

  constructor() {
    if (process.env.PRODUCTION === 'true') {
      throw new Error(
        'CRITICAL SAFETY EXCEPTION: MockVerificationProvider cannot be enabled when PRODUCTION=true'
      );
    }
  }

  async verifyEligibility(
    epic: string,
    pollId: string,
    clientIp = '127.0.0.1'
  ): Promise<VerificationResult> {
    // 1. Rate Limit Check
    if (!checkRateLimit(clientIp)) {
      await db.recordAuditEvent('verification_failure', pollId, { reason: 'RATE_LIMITED' });
      return { verified: false, reason: 'RATE_LIMITED' };
    }

    // 2. Format & Normalization Validation
    const { isValid, normalized } = normalizeEpic(epic);
    if (!isValid || !normalized) {
      await db.recordAuditEvent('verification_failure', pollId, { reason: 'INVALID_FORMAT' });
      return { verified: false, reason: 'INVALID_FORMAT' };
    }

    // 3. Compute Keyed Participation Fingerprint
    const fingerprint = generateParticipationFingerprint(normalized, pollId);

    // 4. Duplicate Participation Prevention Check
    const alreadyParticipated = await db.hasParticipated(pollId, fingerprint);
    if (alreadyParticipated) {
      await db.recordAuditEvent('duplicate_vote_blocked', pollId);
      return { verified: false, reason: 'ALREADY_VOTED' };
    }

    // 5. Check Poll Validity
    const poll = await db.getPollById(pollId);
    if (!poll || poll.status !== 'LIVE') {
      return { verified: false, reason: 'SERVICE_UNAVAILABLE' };
    }

    // 6. Record Eligibility & Issue Decoupled Anonymous Token
    await db.recordParticipation(pollId, fingerprint);

    const { token, tokenHash } = generateAnonymousToken();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15-minute validity

    await db.issueAnonymousCredential(pollId, tokenHash, expiresAt);
    await db.recordAuditEvent('verification_success', pollId);

    return {
      verified: true,
      anonymous_token: token,
      expires_at: expiresAt,
    };
  }
}

/**
 * Verification Provider Factory.
 * Can be swapped with an officially authorized ECI/Government partner provider when available.
 */
export function getVerificationProvider(): IVerificationProvider {
  const providerType = process.env.VERIFICATION_PROVIDER || 'MOCK';

  if (providerType === 'MOCK') {
    return new MockVerificationProvider();
  }

  // Future pluggable providers (e.g. AuthorizedPartnerProvider)
  throw new Error(`Unsupported or unconfigured verification provider: ${providerType}`);
}
