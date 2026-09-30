import { describe, it, expect } from 'vitest';
import {
  normalizeEpic,
  generateParticipationFingerprint,
  generateAnonymousToken,
  hashToken,
  isValidTokenFormat,
} from './index';

describe('Cryptographic & Normalization Primitives', () => {
  describe('normalizeEpic', () => {
    it('accepts and normalizes valid standard EPIC numbers', () => {
      const result = normalizeEpic('abc1234567');
      expect(result.isValid).toBe(true);
      expect(result.normalized).toBe('ABC1234567');
    });

    it('cleans whitespace and hyphens from valid input', () => {
      const result = normalizeEpic('  XYZ-9876543  ');
      expect(result.isValid).toBe(true);
      expect(result.normalized).toBe('XYZ9876543');
    });

    it('rejects invalid lengths or formats', () => {
      expect(normalizeEpic('AB1234567').isValid).toBe(false); // 2 letters
      expect(normalizeEpic('ABCD123456').isValid).toBe(false); // 4 letters
      expect(normalizeEpic('ABC123456').isValid).toBe(false);  // 6 digits
      expect(normalizeEpic('ABC12345678').isValid).toBe(false); // 8 digits
      expect(normalizeEpic('123ABC4567').isValid).toBe(false);
      expect(normalizeEpic('').isValid).toBe(false);
    });
  });

  describe('generateParticipationFingerprint', () => {
    it('generates consistent HMAC fingerprints for same EPIC and poll', () => {
      const secret = 'test-secret-key-1234567890123456';
      const fp1 = generateParticipationFingerprint('ABC1234567', 'poll-1', secret);
      const fp2 = generateParticipationFingerprint('ABC1234567', 'poll-1', secret);
      expect(fp1).toBe(fp2);
      expect(fp1.length).toBe(64);
    });

    it('generates completely different fingerprints for different polls', () => {
      const secret = 'test-secret-key-1234567890123456';
      const fp1 = generateParticipationFingerprint('ABC1234567', 'poll-1', secret);
      const fp2 = generateParticipationFingerprint('ABC1234567', 'poll-2', secret);
      expect(fp1).not.toBe(fp2);
    });
  });

  describe('generateAnonymousToken', () => {
    it('generates high entropy 64-char hex token and matching SHA-256 hash', () => {
      const { token, tokenHash } = generateAnonymousToken();
      expect(token.length).toBe(64);
      expect(isValidTokenFormat(token)).toBe(true);
      expect(tokenHash).toBe(hashToken(token));

      // Successive calls generate unique tokens
      const second = generateAnonymousToken();
      expect(second.token).not.toBe(token);
    });
  });
});
