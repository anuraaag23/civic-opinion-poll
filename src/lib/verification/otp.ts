import crypto from 'crypto';

interface OtpRecord {
  code: string;
  expiresAt: number;
  attempts: number;
}

// In-memory OTP store (keyed by phone + pollId)
const otpStore = new Map<string, OtpRecord>();

/**
 * Generates a cryptographically secure 6-digit verification code.
 */
export function generateOtp(phoneNumber: string, pollId: string): { code: string; expiresAt: number } {
  const key = `${phoneNumber}:${pollId}`;
  
  // Generate random 6 digits between 100000 and 999999
  const randomBytes = crypto.randomBytes(4);
  const randomNumber = randomBytes.readUInt32BE(0);
  const code = (100000 + (randomNumber % 900000)).toString();

  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  otpStore.set(key, {
    code,
    expiresAt,
    attempts: 0,
  });

  return { code, expiresAt };
}

/**
 * Validates the 6-digit OTP for the given phone number and poll.
 */
export function verifyOtp(phoneNumber: string, pollId: string, inputCode: string): {
  success: boolean;
  error?: string;
} {
  const key = `${phoneNumber}:${pollId}`;
  const record = otpStore.get(key);

  if (!record) {
    return {
      success: false,
      error: 'No active verification code found for this phone number. Please request a new code.',
    };
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(key);
    return {
      success: false,
      error: 'Verification code has expired. Please request a fresh OTP.',
    };
  }

  if (record.attempts >= 4) {
    otpStore.delete(key);
    return {
      success: false,
      error: 'Too many incorrect attempts. Please request a new verification code.',
    };
  }

  if (record.code !== inputCode.trim()) {
    record.attempts += 1;
    return {
      success: false,
      error: `Incorrect verification code. Please check your WhatsApp messages and try again (${4 - record.attempts} attempts remaining).`,
    };
  }

  // Successfully verified: remove OTP record to prevent replay
  otpStore.delete(key);
  return { success: true };
}
