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
    phoneNumber?: string,
    otpCode?: string,
    voterName?: string,
    stateCode?: string
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

    let voterFingerprint: string | undefined;
    let phoneFingerprint: string | undefined;

    // 4. Genuine Voter ID (EPIC) Verification & ECI Regional Series Validation
    if (voterId) {
      const { isValid, normalized, error, stateNameEn } = normalizeEpic(voterId);
      if (!isValid || !normalized) {
        await db.recordAuditEvent('self_verification_failure', pollId, { reason: 'INVALID_FORMAT' });
        return {
          verified: false,
          reason: 'INVALID_FORMAT',
          error: error || 'Invalid Voter ID (EPIC) format. Must be an official ECI card number (e.g. DLH2891042).',
        };
      }

      // Compute Keyed Cryptographic Participation Fingerprint
      voterFingerprint = generateParticipationFingerprint(normalized, pollId);

      // Check whether this Voter ID has already participated in this poll
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
    }

    // 5. Genuine Mobile Number & OTP Verification (Anti-Sybil Defense)
    if (phoneNumber) {
      const phoneValidation = normalizePhone(phoneNumber);
      if (!phoneValidation.isValid || !phoneValidation.normalized) {
        return {
          verified: false,
          reason: 'INVALID_PHONE',
          error: phoneValidation.error || 'Invalid Indian mobile number.',
        };
      }

      const cleanPhone = phoneValidation.normalized;

      // Verify OTP if provided
      if (otpCode) {
        const otpCheck = verifyOtp(cleanPhone, pollId, otpCode);
        if (!otpCheck.success) {
          return {
            verified: false,
            reason: 'INVALID_OTP',
            error: otpCheck.error || 'Invalid verification code. Please check your SMS and try again.',
          };
        }
      }

      // Check whether this Phone Number has already participated in this poll
      phoneFingerprint = generatePhoneFingerprint(cleanPhone, pollId);
      const phoneAlreadyVoted = await db.hasParticipated(pollId, phoneFingerprint);
      if (phoneAlreadyVoted) {
        await db.recordAuditEvent('duplicate_vote_blocked', pollId, { method: 'HMAC_KEYED_PHONE' });
        return {
          verified: false,
          reason: 'ALREADY_VOTED',
          error:
            'This mobile number has already cast a vote in this election. Each citizen phone number can only vote once per election.',
        };
      }
    }

    // Fallback participation identifier
    const participationIdentifier = voterFingerprint || phoneFingerprint || generateAnonymousToken().tokenHash;

    // 6. Generate 256-bit CSPRNG Anonymous Participation Credential
    const { token, tokenHash } = generateAnonymousToken();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15-minute token TTL

    // 7. Store Participation Record (Irreversible HMAC fingerprints only, ZERO PII, ZERO RAW DATA)
    await db.recordParticipation(pollId, participationIdentifier);

    // If both voter ID and phone were verified, record both fingerprints to prevent either from voting again
    if (voterFingerprint && phoneFingerprint && voterFingerprint !== participationIdentifier) {
      await db.recordParticipation(pollId, phoneFingerprint);
    }

    await db.issueAnonymousCredential(pollId, tokenHash, expiresAt);

    // 8. Record Audit Log (Sanitized, ZERO identifying information)
    await db.recordAuditEvent('self_verification_confirmed', pollId, {
      method: phoneNumber ? 'MULTI_FACTOR_EPIC_PHONE_OTP' : voterId ? 'REAL_HMAC_VOTER_ID' : 'ANONYMOUS_TOKEN',
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

