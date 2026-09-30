import { VerificationResult, ECI_ELECTORAL_SEARCH_URL } from '../types';
import { generateAnonymousToken } from '../crypto';
import { db } from '../db';

export { ECI_ELECTORAL_SEARCH_URL };

// In-memory rate limiter for self-verification attempts to prevent spam
const rateLimitMap = new Map<string, { attempts: number; resetAt: number }>();

function checkRateLimit(key: string, maxAttempts = 15, windowMs = 60000): boolean {
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
 * MODE A: SELF-VERIFICATION PROVIDER
 *
 * CRITICAL LEGAL & ARCHITECTURAL RULES:
 * 1. Do NOT scrape ECI or reverse-engineer ECI APIs.
 * 2. Do NOT bypass CAPTCHA or automate ECI portals.
 * 3. Do NOT collect, store, hash, or transmit user EPIC numbers.
 * 4. The user verifies their registration independently on https://electoralsearch.eci.gov.in/
 * 5. This service handles ONLY the participant's explicit self-confirmation and issues
 *    a decoupled, cryptographically random anonymous participation credential.
 */
export class SelfVerificationService {
  readonly eciSearchUrl = ECI_ELECTORAL_SEARCH_URL;

  async processSelfVerification(
    pollId: string,
    selfVerificationConfirmed: boolean,
    clientIp = '127.0.0.1'
  ): Promise<VerificationResult> {
    // 1. Rate Limit Check
    if (!checkRateLimit(clientIp)) {
      await db.recordAuditEvent('self_verification_failure', pollId, { reason: 'RATE_LIMITED' });
      return { verified: false, reason: 'RATE_LIMITED' };
    }

    // 2. Explicit User Confirmation Check
    if (!selfVerificationConfirmed) {
      await db.recordAuditEvent('self_verification_failure', pollId, { reason: 'UNCONFIRMED' });
      return { verified: false, reason: 'UNCONFIRMED' };
    }

    // 3. Validate Poll Status
    const poll = await db.getPollById(pollId);
    if (!poll || poll.status !== 'LIVE') {
      return { verified: false, reason: 'INVALID_POLL' };
    }

    // 4. Generate 256-bit CSPRNG Anonymous Participation Credential
    const { token, tokenHash } = generateAnonymousToken();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15-minute token TTL

    // 5. Store Participation Record (Mode A: Token Hash Only, NO EPIC, NO PII)
    await db.recordParticipation(pollId, tokenHash);
    await db.issueAnonymousCredential(pollId, tokenHash, expiresAt);

    // 6. Record Audit Log (ZERO identifying information)
    await db.recordAuditEvent('self_verification_confirmed', pollId, {
      method: 'MODE_A_ECI_SELF_VERIFICATION',
    });

    return {
      verified: true,
      status: 'SELF_VERIFICATION_CONFIRMED',
      anonymous_token: token,
      expires_at: expiresAt,
    };
  }
}

export const selfVerificationService = new SelfVerificationService();
