import crypto from 'crypto';

/**
 * Validates and normalizes an Indian EPIC (Electors Photo Identity Card) number.
 * Standard format: 3 uppercase letters followed by 7 numeric digits (e.g., ABC1234567).
 */
export function normalizeEpic(raw: string): { isValid: boolean; normalized: string; error?: string } {
  if (!raw || typeof raw !== 'string') {
    return { isValid: false, normalized: '', error: 'EPIC number is required' };
  }

  // Trim whitespace and remove common separators like spaces or dashes
  const cleaned = raw.trim().toUpperCase().replace(/[\s-]/g, '');

  // Exact standard EPIC regex: 3 uppercase letters + 7 digits
  const epicRegex = /^[A-Z]{3}[0-9]{7}$/;

  if (!epicRegex.test(cleaned)) {
    return {
      isValid: false,
      normalized: cleaned,
      error: 'Invalid EPIC format. Must be 3 letters followed by 7 digits (e.g. ABC1234567)',
    };
  }

  return { isValid: true, normalized: cleaned };
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
    'dev_hmac_secret_must_be_changed_in_production_32chars!';

  if (process.env.NODE_ENV === 'production' && secret.startsWith('dev_')) {
    throw new Error('FATAL: Production environment cannot use default VOTING_HMAC_SECRET');
  }

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
