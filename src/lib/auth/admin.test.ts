import { describe, it, expect, beforeEach } from 'vitest';
import {
  verifyAdminPasscode,
  verifyAdminCredentials,
  createAdminSessionToken,
  verifyAdminSessionToken,
  checkAdminRateLimit,
  recordAdminAuthFailure,
  clearAdminRateLimit,
  verifyAdminRequest,
} from './admin';
import { db } from '../db';

describe('Admin Authentication & Security', () => {
  const testIp = '192.168.1.100';

  beforeEach(() => {
    clearAdminRateLimit(testIp);
  });

  describe('Database-Backed Admin Credential Verification', () => {
    it('should verify the initial admin account credentials', async () => {
      const account = await db.getAdminAccount();
      expect(account.loginId).toBeDefined();
      // Default seed or configured password verification
      const isValid = await verifyAdminCredentials(account.loginId, process.env.ADMIN_PASSWORD || 'MeraVote@2026');
      expect(isValid).toBe(true);
    });

    it('should reject incorrect credentials', async () => {
      expect(await verifyAdminCredentials('admin', 'wrongpassword')).toBe(false);
      expect(await verifyAdminCredentials('', '')).toBe(false);
      expect(await verifyAdminCredentials('wrong_user_id', 'somepassword')).toBe(false);
    });
  });

  describe('Session Token Lifecycle', () => {
    it('should generate and verify a valid admin session token', () => {
      const token = createAdminSessionToken();
      expect(typeof token).toBe('string');
      expect(token).toContain('.');

      const isValid = verifyAdminSessionToken(token);
      expect(isValid).toBe(true);
    });

    it('should reject tampered session tokens', () => {
      const token = createAdminSessionToken();
      const parts = token.split('.');
      const tampered = `${parts[0]}.invalid_signature`;

      expect(verifyAdminSessionToken(tampered)).toBe(false);
      expect(verifyAdminSessionToken('completely.invalid')).toBe(false);
      expect(verifyAdminSessionToken('')).toBe(false);
    });
  });

  describe('Brute Force Rate Limiting', () => {
    it('should lock out an IP after 5 consecutive failed attempts', () => {
      expect(checkAdminRateLimit(testIp).allowed).toBe(true);

      for (let i = 1; i <= 4; i++) {
        recordAdminAuthFailure(testIp);
        expect(checkAdminRateLimit(testIp).allowed).toBe(true);
      }

      // 5th failure triggers lockout
      recordAdminAuthFailure(testIp);
      const limitStatus = checkAdminRateLimit(testIp);
      expect(limitStatus.allowed).toBe(false);
      expect(limitStatus.remainingAttempts).toBe(0);
      expect(limitStatus.retryAfterSeconds).toBeGreaterThan(0);
    });

    it('should allow clearing rate limits upon successful login', () => {
      recordAdminAuthFailure(testIp);
      recordAdminAuthFailure(testIp);
      clearAdminRateLimit(testIp);

      expect(checkAdminRateLimit(testIp).allowed).toBe(true);
      expect(checkAdminRateLimit(testIp).remainingAttempts).toBe(5);
    });
  });

  describe('Request Authorization Verification', () => {
    it('should authorize requests with valid Bearer token', () => {
      const token = createAdminSessionToken();
      const req = new Request('http://localhost:3000/api/admin/polls', {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(verifyAdminRequest(req)).toBe(true);
    });

    it('should authorize requests with valid cookie', () => {
      const token = createAdminSessionToken();
      const req = new Request('http://localhost:3000/api/admin/polls', {
        headers: { Cookie: `meravote_admin_token=${token}` },
      });

      expect(verifyAdminRequest(req)).toBe(true);
    });

    it('should reject requests without credentials or with invalid credentials', () => {
      const unauthReq = new Request('http://localhost:3000/api/admin/polls');
      expect(verifyAdminRequest(unauthReq)).toBe(false);

      const invalidReq = new Request('http://localhost:3000/api/admin/polls', {
        headers: { Authorization: 'Bearer invalid-token' },
      });
      expect(verifyAdminRequest(invalidReq)).toBe(false);
    });
  });
});
