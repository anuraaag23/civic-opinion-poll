import { describe, it, expect } from 'vitest';
import { normalizePhone, generatePhoneFingerprint } from '../crypto';
import { generateOtp, verifyOtp } from './otp';
import { sendWhatsAppOtp, formatWhatsAppJid, cleanIndianPhone, pingBaileysGateway } from '../whatsapp/baileys';
import { db } from '../db';

describe('WhatsApp OTP Verification & Baileys Dispatch', () => {
  const pollId = 'poll-national-2029';
  const cleanPhone = '9876543210';

  it('correctly normalizes Indian phone numbers and JID formats', () => {
    const { isValid, normalized } = normalizePhone('+91 98765-43210');
    expect(isValid).toBe(true);
    expect(normalized).toBe('9876543210');

    const jid = formatWhatsAppJid(normalized);
    expect(jid).toBe('919876543210@s.whatsapp.net');

    expect(cleanIndianPhone('+91 98765 43210')).toBe('9876543210');
  });

  it('rejects invalid mobile numbers', () => {
    const res1 = normalizePhone('12345');
    expect(res1.isValid).toBe(false);

    const res2 = normalizePhone('5876543210'); // Starts with 5 (invalid in India)
    expect(res2.isValid).toBe(false);
  });

  it('generates a 6-digit OTP and verifies it', () => {
    const { code, expiresAt } = generateOtp(cleanPhone, pollId);
    expect(code).toMatch(/^[0-9]{6}$/);
    expect(expiresAt).toBeGreaterThan(Date.now());

    // Verify correct OTP
    const verifySuccess = verifyOtp(cleanPhone, pollId, code);
    expect(verifySuccess.success).toBe(true);
  });

  it('rejects an incorrect OTP code', () => {
    generateOtp(cleanPhone, pollId);
    const verifyFail = verifyOtp(cleanPhone, pollId, '000000');
    expect(verifyFail.success).toBe(false);
    expect(verifyFail.error).toContain('Incorrect verification code');
  });

  it('dispatches WhatsApp message via Baileys service simulator', async () => {
    const otp = '849201';
    const dispatch = await sendWhatsAppOtp(cleanPhone, otp, 'Prime Minister Poll 2029');
    expect(dispatch.success).toBe(true);
    expect(dispatch.deliveredVia).toBeDefined();
    expect(dispatch.devOtp).toBe(otp);
  });

  it('guarantees irreversible anonymous fingerprint and duplicate protection', async () => {
    const fingerprint = generatePhoneFingerprint(cleanPhone, pollId);
    expect(fingerprint).toMatch(/^[0-9a-f]{64}$/);

    // Record vote
    await db.recordParticipation(pollId, fingerprint);

    // Subsequent vote from same phone should be blocked
    const hasVoted = await db.hasParticipated(pollId, fingerprint);
    expect(hasVoted).toBe(true);
  });

  it('allows admin to dynamically switch WhatsApp gateway settings in db', async () => {
    // 1. Update gateway settings
    await db.updateSiteSettings({
      whatsappGateway: {
        provider: 'dev_simulator',
        baileysGatewayUrl: 'http://localhost:8000',
        baileysApiKey: 'test-admin-secret-key',
        fallbackToSimulator: true,
      },
    });

    // 2. Fetch and verify persistence
    const settings = await db.getSiteSettings();
    expect(settings.whatsappGateway).toBeDefined();
    expect(settings.whatsappGateway?.provider).toBe('dev_simulator');
    expect(settings.whatsappGateway?.baileysGatewayUrl).toBe('http://localhost:8000');
    expect(settings.whatsappGateway?.baileysApiKey).toBe('test-admin-secret-key');

    // 3. Dispatch works dynamically
    const dispatch = await sendWhatsAppOtp(cleanPhone, '123456', 'Admin Test Verification');
    expect(dispatch.success).toBe(true);
    expect(dispatch.deliveredVia).toBe('dev_simulator');
  });

  it('pingBaileysGateway gracefully handles unreachable endpoints', async () => {
    const ping = await pingBaileysGateway('http://127.0.0.1:54321', 'test');
    expect(ping.online).toBe(false);
    expect(ping.status).toBeDefined();
    expect(ping.error).toBeDefined();
  });
});
