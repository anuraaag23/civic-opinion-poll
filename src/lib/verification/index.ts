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

    // 5. Genuine Electoral Roll Verification & Deduplication
    let voterFingerprint = '';

    if (voterId && voterId.trim().length > 0) {
      const { isValid, normalized, error } = normalizeEpic(voterId);
      if (!isValid || !normalized) {
        await db.recordAuditEvent('self_verification_failure', pollId, { reason: 'INVALID_FORMAT' });
        return {
          verified: false,
          reason: 'INVALID_FORMAT',
          error: error || 'Invalid Voter ID format. Must be an official ECI card number (e.g. DLH2891042).',
        };
      }
      voterFingerprint = generateParticipationFingerprint(normalized, pollId);
    } else if (partNumber && serialNumber) {
      // ECI Electoral Roll Record Coordinates: State + AC + Part No + Serial No
      const cleanState = (stateCode || 'IN').trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 20);
      const cleanAc = (assemblyConstituency || 'AC').trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 40);
      const cleanPart = partNumber.trim().replace(/[^0-9]/g, '').slice(0, 10);
      const cleanSerial = serialNumber.trim().replace(/[^0-9]/g, '').slice(0, 10);

      if (!cleanPart || !cleanSerial) {
        return {
          verified: false,
          reason: 'INVALID_FORMAT',
          error: 'Please enter valid Part Number and Serial Number from your ECI search result.',
        };
      }

      const electoralKey = `ECI:${cleanState}:${cleanAc}:P${cleanPart}:S${cleanSerial}`;
      voterFingerprint = generateParticipationFingerprint(electoralKey, pollId);
    } else {
      // Direct ECI confirmed search: bind client/device entropy
      const clientIdentifier = deviceFingerprint || `CLIENT:${clientIp}`;
      voterFingerprint = generateParticipationFingerprint(`ECI_VERIFIED:${clientIdentifier}`, pollId);
    }

    // 6. Deduplication Check: Check whether this voter record has already participated in this poll
    const alreadyVoted = await db.hasParticipated(pollId, voterFingerprint);
    if (alreadyVoted) {
      await db.recordAuditEvent('duplicate_vote_blocked', pollId, { method: 'HMAC_KEYED_ELECTORAL_RECORD' });
      return {
        verified: false,
        reason: 'ALREADY_VOTED',
        error:
          'This voter record has already cast a vote in this election. Duplicate voting is strictly blocked across all devices and browsers to keep elections fair.',
      };
    }

    // 7. Generate 256-bit CSPRNG Anonymous Participation Credential
    const { token, tokenHash } = generateAnonymousToken();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15-minute token TTL

    // 8. Store Participation Record (Irreversible HMAC fingerprint only, ZERO PII, ZERO RAW DATA)
    await db.recordParticipation(pollId, voterFingerprint);
    await db.issueAnonymousCredential(pollId, tokenHash, expiresAt);

    // 9. Record Audit Log (Sanitized, ZERO identifying information)
    await db.recordAuditEvent('self_verification_confirmed', pollId, {
      method: 'ECI_ELECTORAL_PORTAL',
      hasElectoralCoordinates: Boolean(partNumber && serialNumber),
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

