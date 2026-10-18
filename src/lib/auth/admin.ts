import crypto from 'crypto';
import { NextRequest } from 'next/server';

const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || 'meravote2026';
const SESSION_SECRET =
  process.env.ADMIN_SESSION_SECRET ||
  process.env.VOTING_HMAC_SECRET ||
  'meravote_admin_secure_session_key_2026_salt';

// In-memory rate limiting bucket for admin authentication attempts
interface RateLimitRecord {
  attempts: number;
  firstAttempt: number;
  lockedUntil?: number;
}

const loginAttempts = new Map<string, RateLimitRecord>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes lockout

/**
 * Checks if the IP is currently rate-limited or locked out.
 */
export function checkAdminRateLimit(ip: string): { allowed: boolean; remainingAttempts: number; retryAfterSeconds?: number } {
  const now = Date.now();
  const record = loginAttempts.get(ip);

  if (!record) {
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
  }

  // Check if locked out
  if (record.lockedUntil && record.lockedUntil > now) {
    const retryAfterSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    return { allowed: false, remainingAttempts: 0, retryAfterSeconds };
  }

  // Check if window expired
  if (now - record.firstAttempt > WINDOW_MS) {
    loginAttempts.delete(ip);
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_MS;
    return { allowed: false, remainingAttempts: 0, retryAfterSeconds: Math.ceil(LOCKOUT_MS / 1000) };
  }

  return { allowed: true, remainingAttempts: MAX_ATTEMPTS - record.attempts };
}

/**
 * Records a failed attempt for the given IP.
 */
export function recordAdminAuthFailure(ip: string) {
  const now = Date.now();
  const record = loginAttempts.get(ip);

  if (!record || now - record.firstAttempt > WINDOW_MS) {
    loginAttempts.set(ip, { attempts: 1, firstAttempt: now });
  } else {
    record.attempts += 1;
    if (record.attempts >= MAX_ATTEMPTS) {
      record.lockedUntil = now + LOCKOUT_MS;
    }
  }
}

/**
 * Clears rate limiting record on successful authentication.
 */
export function clearAdminRateLimit(ip: string) {
  loginAttempts.delete(ip);
}

/**
 * Timing-safe comparison of provided passcode against expected passcode.
 */
export function verifyAdminPasscode(provided: string): boolean {
  if (!provided || typeof provided !== 'string') return false;

  const providedHash = crypto.createHash('sha256').update(provided.trim()).digest();
  const expectedHash = crypto.createHash('sha256').update(ADMIN_PASSCODE).digest();

  return crypto.timingSafeEqual(providedHash, expectedHash);
}

/**
 * Generates a cryptographically signed session token for authenticated admins.
 */
export function createAdminSessionToken(): string {
  const payload = {
    role: 'admin',
    iat: Date.now(),
    exp: Date.now() + 4 * 60 * 60 * 1000, // 4 hours
    nonce: crypto.randomBytes(16).toString('hex'),
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payloadB64)
    .digest('base64url');

  return `${payloadB64}.${signature}`;
}

/**
 * Verifies the validity and signature of an admin session token.
 */
export function verifyAdminSessionToken(token: string): boolean {
  if (!token || typeof token !== 'string') return false;

  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [payloadB64, signature] = parts;

  // Verify signature in constant time
  const expectedSignature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payloadB64)
    .digest('base64url');

  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (sigBuffer.length !== expectedBuffer.length) return false;
  if (!crypto.timingSafeEqual(sigBuffer, expectedBuffer)) return false;

  // Verify expiration
  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    if (!payload || payload.role !== 'admin') return false;
    if (typeof payload.exp !== 'number' || Date.now() > payload.exp) return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * Helper to authenticate incoming Next.js API requests.
 * Extracts token from cookie or Authorization header.
 */
export function verifyAdminRequest(request: Request | NextRequest): boolean {
  // 1. Check Authorization Bearer header
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const bearerToken = authHeader.slice(7).trim();
    if (verifyAdminSessionToken(bearerToken)) {
      return true;
    }
  }

  // 2. Check Cookie
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(/meravote_admin_token=([^;]+)/);
  if (match && match[1]) {
    const cookieToken = decodeURIComponent(match[1]);
    if (verifyAdminSessionToken(cookieToken)) {
      return true;
    }
  }

  return false;
}
