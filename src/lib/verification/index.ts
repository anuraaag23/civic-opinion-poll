import { VerificationResult, ECI_ELECTORAL_SEARCH_URL } from '../types';
import {
  normalizeEpic,
  normalizePhone,
  generateParticipationFingerprint,
  generatePhoneFingerprint,
  generateAnonymousToken,
} from '../crypto';
import { verifyOtp } from './otp';
import { db } from '../db';

export { ECI_ELECTORAL_SEARCH_URL };

// In-memory rate limiter for verification attempts to prevent spam
const rateLimitMap = new Map<string, { attempts: number; resetAt: number }>();

function checkRateLimit(key: string, maxAttempts = 20, windowMs = 60000): boolean {
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

export class SelfVerificationService {
  readonly eciSearchUrl = ECI_ELECTORAL_SEARCH_URL;

  async processSelfVerification(
    pollId: string,
    selfVerificationConfirmed: boolean,
    clientIp = '127.0.0.1',
    voterId?: string,
    deviceFingerprint?: string,
    voterName?: string,
    stateCode?: string,
    assemblyConstituency?: string,
    partNumber?: string,
    serialNumber?: string,
    eciRecordFound = true
  ): Promise<VerificationResult> {
    // 1. Rate Limit Check
    if (!checkRateLimit(clientIp)) {
      await db.recordAuditEvent('self_verification_failure', pollId, { reason: 'RATE_LIMITED' });
      return { verified: false, reason: 'RATE_LIMITED', error: 'Too many requests. Please wait a few moments.' };
    }

    // 2. Explicit User Confirmation Check
    if (!selfVerificationConfirmed) {
      await db.recordAuditEvent('self_verification_failure', pollId, { reason: 'UNCONFIRMED' });
      return {
        verified: false,
        reason: 'UNCONFIRMED',
        error: 'You must confirm the voter declaration before continuing.',
      };
    }

    // 3. Validate Poll Status
    const poll = await db.getPollById(pollId);
    if (!poll || poll.status !== 'LIVE') {
      return { verified: false, reason: 'INVALID_POLL', error: 'This poll is not currently active.' };
    }

    // 4. Check if citizen reported that record was NOT found on ECI
    if (eciRecordFound === false) {
      await db.recordAuditEvent('self_verification_failure', pollId, { reason: 'ECI_NOT_FOUND' });
      return {
        verified: false,
        reason: 'ECI_NOT_FOUND',
        error:
          'Your Voter ID details were not found on the official Election Commission of India portal (electoralsearch.eci.gov.in). Only citizens with an active electoral roll record can participate in this election.',
      };
    }

    // 5. Genuine Voter ID (EPIC) Verification & ECI Regional Series Validation
    if (!voterId || voterId.trim().length === 0) {
      return {
        verified: false,
        reason: 'INVALID_FORMAT',
        error: 'Voter ID (EPIC Card Number) is strictly required to verify your eligibility on the electoral roll.',
      };
    }

    const { isValid, normalized, error, stateNameEn } = normalizeEpic(voterId);
    if (!isValid || !normalized) {
      await db.recordAuditEvent('self_verification_failure', pollId, { reason: 'INVALID_FORMAT' });
      return {
        verified: false,
        reason: 'INVALID_FORMAT',
        error: error || 'Invalid Voter ID (EPIC) format. Must be an official ECI card number (e.g. DLH2891042).',
      };
    }

    // 6. Compute Keyed Cryptographic Participation Fingerprint
    const voterFingerprint = generateParticipationFingerprint(normalized, pollId);

    // 7. Deduplication Check: Check whether this Voter ID has already participated in this poll
    const alreadyVoted = await db.hasParticipated(pollId, voterFingerprint);
    if (alreadyVoted) {
      await db.recordAuditEvent('duplicate_vote_blocked', pollId, { method: 'HMAC_KEYED_EPIC' });
      return {
        verified: false,
        reason: 'ALREADY_VOTED',
        error:
          'This Voter ID has already cast a vote in this election. Duplicate voting is strictly blocked across all devices and browsers to keep elections fair.',
      };
    }

    // 8. ECI Electoral Record Details Validation
    if (!voterName || voterName.trim().length < 2) {
      return {
        verified: false,
        reason: 'INVALID_FORMAT',
        error: 'Please enter your full name as found on the official ECI electoral search portal.',
      };
    }

    if (!assemblyConstituency || assemblyConstituency.trim().length < 2) {
      return {
        verified: false,
        reason: 'INVALID_FORMAT',
        error:
          'Assembly Constituency (as displayed on the ECI electoral search portal) is required to verify your voter registration.',
      };
    }

    // 9. Generate 256-bit CSPRNG Anonymous Participation Credential
    const { token, tokenHash } = generateAnonymousToken();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15-minute token TTL

    // 10. Store Participation Record (Irreversible HMAC fingerprint only, ZERO PII, ZERO RAW DATA)
    await db.recordParticipation(pollId, voterFingerprint);
    await db.issueAnonymousCredential(pollId, tokenHash, expiresAt);

    // 11. Record Audit Log (Sanitized, ZERO identifying information)
    await db.recordAuditEvent('self_verification_confirmed', pollId, {
      method: 'ECI_ELECTORAL_SEARCH_PORTAL',
      hasDeviceFingerprint: Boolean(deviceFingerprint),
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

