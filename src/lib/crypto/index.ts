import crypto from 'crypto';
import { validateEciPrefix, isDummyNumber } from '../data/eci-prefixes';

export interface EpicValidationResult {
  isValid: boolean;
  normalized: string;
  error?: string;
  stateCode?: string;
  stateNameEn?: string;
  stateNameHi?: string;
}

/**
 * Validates and normalizes an Indian EPIC (Electors Photo Identity Card) number.
 * Standard format: 3 uppercase letters followed by 7 numeric digits (e.g., DLH1234567, WBG1482910).
 * Rejects non-ECI series prefixes (e.g., ABC, XYZ, AAA) and dummy/sequential numbers.
 */
export function normalizeEpic(raw: string): EpicValidationResult {
  if (!raw || typeof raw !== 'string') {
    return { isValid: false, normalized: '', error: 'Voter ID (EPIC) number is required' };
  }

  // Trim whitespace and remove common separators like spaces or dashes
  const cleaned = raw.trim().toUpperCase().replace(/[\s\/-]/g, '');

  // Exact standard Indian EPIC regex: 3 uppercase letters + 7 digits (e.g. DLH1234567, WBG1482910)
  const standardEpicRegex = /^[A-Z]{3}[0-9]{7}$/;

  if (!standardEpicRegex.test(cleaned)) {
    return {
      isValid: false,
      normalized: cleaned,
      error: 'Invalid Voter ID format. Must be standard format (3 letters followed by 7 digits, e.g. DLH1234567 or WBG1482910).',
    };
  }

  // Extract 3-letter prefix
  const prefix = cleaned.slice(0, 3);
  const prefixCheck = validateEciPrefix(prefix);

  if (!prefixCheck || !prefixCheck.isValid) {
    return {
      isValid: false,
      normalized: cleaned,
      error: `Invalid Voter ID. "${prefix}" is not a recognized Election Commission of India (ECI) regional series. Please enter your genuine Voter ID card number.`,
    };
  }

  // Check for dummy or sequential numbers
  const digits = cleaned.replace(/^[A-Z]+/, '');
  if (isDummyNumber(digits)) {
    return {
      isValid: false,
      normalized: cleaned,
      error: 'Invalid Voter ID. Sequential, all-identical, or repetitive numbers are strictly blocked to protect poll integrity.',
    };
  }

  return {
    isValid: true,
    normalized: cleaned,
    stateCode: prefixCheck.stateCode,
    stateNameEn: prefixCheck.stateNameEn,
    stateNameHi: prefixCheck.stateNameHi,
  };
}

/**
 * Validates and normalizes an Indian 10-digit mobile phone number.
 */
export function normalizePhone(raw: string): { isValid: boolean; normalized: string; error?: string } {
  if (!raw || typeof raw !== 'string') {
    return { isValid: false, normalized: '', error: 'Mobile number is required for verification' };
  }

  // Remove spaces, hyphens, and leading +91 / 0
  let cleaned = raw.trim().replace(/[\s-]/g, '');
  if (cleaned.startsWith('+91')) {
    cleaned = cleaned.slice(3);
  } else if (cleaned.startsWith('91') && cleaned.length === 12) {
    cleaned = cleaned.slice(2);
  } else if (cleaned.startsWith('0') && cleaned.length === 11) {
    cleaned = cleaned.slice(1);
  }

  // Indian mobile numbers must be 10 digits starting with 6, 7, 8, or 9
  if (!/^[6-9][0-9]{9}$/.test(cleaned)) {
    return {
      isValid: false,
      normalized: cleaned,
      error: 'Invalid mobile number. Please enter a valid 10-digit Indian mobile number (e.g., 9876543210).',
    };
  }

  return { isValid: true, normalized: cleaned };
}

/**
 * Keyed HMAC-SHA256 generation for phone number duplicate-participation prevention.
 */
export function generatePhoneFingerprint(
  normalizedPhone: string,
  pollId: string,
  customSecret?: string
): string {
  const secret =
    customSecret ||
    process.env.VOTING_HMAC_SECRET ||
    'civic_voter_hmac_secret_meravote_2026_ledger!';

  const message = `phone:${normalizedPhone}:${pollId}`;
  return crypto.createHmac('sha256', secret).update(message).digest('hex');
}

/**
 * Keyed HMAC-SHA256 generation for duplicate-participation prevention.
 * Uses a server-side secret key to prevent dictionary attacks or rainbow tables on constrained EPIC formats.
 * Formula: HMAC-SHA256(server_secret, normalized_epic + ":" + poll_id)
 */
export function generateParticipationFingerprint(
  normalizedEpic: string,
  pollId: string,
  customSecret?: string
): string {
  const secret =
    customSecret ||
    process.env.VOTING_HMAC_SECRET ||
    'civic_voter_hmac_secret_meravote_2026_ledger!';

  const message = `${normalizedEpic}:${pollId}`;
  return crypto.createHmac('sha256', secret).update(message).digest('hex');
}

/**
 * Generates an anonymous, cryptographically secure 256-bit voting credential token.
 * The raw token is returned to the client browser once.
 * The SHA-256 hash of this token is stored in the database to prevent token theft from server compromise.
 */
export function generateAnonymousToken(): { token: string; tokenHash: string } {
  // 32 cryptographically secure random bytes = 256 bits entropy
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashToken(token);
  return { token, tokenHash };
}

/**
 * Calculates SHA-256 hash of an anonymous voting token.
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Validates token string format (must be 64-char hex string).
 */
export function isValidTokenFormat(token: string): boolean {
  return typeof token === 'string' && /^[0-9a-f]{64}$/i.test(token);
}

/**
 * Sanitizes IP addresses or identifiers for rate-limiting without storing raw IPs indefinitely.
 * Truncates IPv4 / IPv6 or hashes with salt.
 */
export function hashClientIdentifier(ip: string, userAgent: string): string {
  const salt = process.env.CLIENT_SALT || 'civic_client_salt_2026';
  return crypto
    .createHmac('sha256', salt)
    .update(`${ip}:${userAgent}`)
    .digest('hex')
    .slice(0, 16);
}
