'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import {
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  Fingerprint,
  Phone,
  MessageSquare,
  Lock,
  Loader2,
  Clock,
  Sparkles,
} from 'lucide-react';

interface VerificationFormProps {
  pollId: string;
  onVerified: (anonymousCredential: string) => void;
  onAlreadyVoted: () => void;
}

export function VerificationForm({
  pollId,
  onVerified,
  onAlreadyVoted,
}: VerificationFormProps) {
  const { language } = useI18n();

  // Workflow steps: 'phone' -> 'otp' -> 'submitting' -> 'success' | 'already_voted'
  const [step, setStep] = useState<'phone' | 'otp' | 'submitting' | 'success' | 'already_voted'>('phone');

  // Phone input state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [cleanPhone, setCleanPhone] = useState('');

  // Anti-bot arithmetic challenge
  const [num1, setNum1] = useState(7);
  const [num2, setNum2] = useState(4);
  const [mathAnswer, setMathAnswer] = useState('');

  // Citizen declaration checkbox
  const [isDeclarationChecked, setIsDeclarationChecked] = useState(false);

  // OTP input state
  const [otpCode, setOtpCode] = useState('');
  const [devOtp, setDevOtp] = useState<string | null>(null);

  // Resend cooldown timer (60 seconds)
  const [resendCooldown, setResendCooldown] = useState(0);

  // Device hardware fingerprint ref
  const deviceFingerprintRef = useRef('');

  // Status and error handling
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const otpInputRef = useRef<HTMLInputElement>(null);

  // Generate lightweight stable client device fingerprint
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('MeraVote_WhatsApp_Entropy_2026', 2, 2);
      }
      const canvasData = canvas.toDataURL();
      const rawEntropy = `${navigator.userAgent}_${screen.width}x${screen.height}_${canvasData.slice(0, 40)}`;
      let hash = 0;
      for (let i = 0; i < rawEntropy.length; i++) {
        hash = (hash << 5) - hash + rawEntropy.charCodeAt(i);
        hash |= 0;
      }
      deviceFingerprintRef.current = `DEV_${Math.abs(hash).toString(16)}`;
    } catch {
      deviceFingerprintRef.current = `DEV_${Date.now().toString(16)}`;
    }
  }, []);

  // Cooldown countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Generate anti-bot arithmetic challenge
  const generateNewMathChallenge = useCallback(() => {
    const n1 = Math.floor(Math.random() * 8) + 3;
    const n2 = Math.floor(Math.random() * 8) + 2;
    setNum1(n1);
    setNum2(n2);
    setMathAnswer('');
  }, []);

  // Handle phone number input with formatting
  const handlePhoneChange = (val: string) => {
    const digitsOnly = val.replace(/[^0-9]/g, '').slice(0, 10);
    setCleanPhone(digitsOnly);
    setPhoneNumber(digitsOnly);
    if (error) setError(null);
  };

  // STEP 1: Send WhatsApp OTP via Baileys API
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (cleanPhone.length !== 10 || !/^[6-9]/.test(cleanPhone)) {
      setError(
        language === 'hi'
          ? 'कृपया वैध 10-अंकों का भारतीय मोबाइल नंबर दर्ज करें (6, 7, 8 या 9 से प्रारंभ)।'
          : 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.'
      );
      return;
    }

    const expectedAnswer = num1 + num2;
    if (parseInt(mathAnswer, 10) !== expectedAnswer) {
      setError(
        language === 'hi'
          ? 'सुरक्षा जोड़ गलत है। कृपया सही उत्तर दर्ज करें।'
          : 'Security arithmetic verification failed. Please enter the correct sum.'
      );
      return;
    }

    if (!isDeclarationChecked) {
      setError(
        language === 'hi'
          ? 'कृपया जारी रखने से पहले मतदाता घोषणा की पुष्टि करें।'
          : 'Please confirm the citizen declaration before proceeding.'
      );
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/verification/whatsapp/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pollId,
          phoneNumber: cleanPhone,
          mathChallenge: {
            num1,
            num2,
            answer: parseInt(mathAnswer, 10),
          },
        }),
      });

      const data = await response.json();

      if (response.status === 409 || data.reason === 'ALREADY_VOTED') {
        setStep('already_voted');
        setError(
          data.error ||
            (language === 'hi'
              ? 'इस व्हाट्सएप नंबर द्वारा इस चुनाव में पहले ही मत दिया जा चुका है।'
              : 'This WhatsApp number has already voted in this election.')
        );
        try {
          localStorage.setItem(`civic_voted_${pollId}`, 'true');
        } catch {}
        onAlreadyVoted();
        return;
      }

      if (!response.ok || !data.success) {
        setError(data.error || 'Failed to dispatch WhatsApp OTP. Please try again.');
        return;
      }

      // OTP sent successfully!
      if (data.devOtp) {
        setDevOtp(data.devOtp);
      }
      setStep('otp');
      setResendCooldown(60);
      setTimeout(() => {
        otpInputRef.current?.focus();
      }, 200);
    } catch (err) {
      console.error('Send OTP error:', err);
      setError(
        language === 'hi'
          ? 'सर्वर से संपर्क नहीं हो सका। कृपया पुनः प्रयास करें।'
          : 'Failed to communicate with verification server. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // STEP 2: Verify WhatsApp OTP and obtain confidential voting credential
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const cleanOtp = otpCode.trim().replace(/[^0-9]/g, '');
    if (cleanOtp.length !== 6) {
      setError(
        language === 'hi'
          ? 'कृपया व्हाट्सएप पर प्राप्त 6-अंकों का सत्यापन कोड दर्ज करें।'
          : 'Please enter the 6-digit verification code sent to your WhatsApp.'
      );
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/verification/whatsapp/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pollId,
          phoneNumber: cleanPhone,
          otpCode: cleanOtp,
          selfVerificationConfirmed: true,
          deviceFingerprint: deviceFingerprintRef.current || 'BROWSER_DEFAULT',
        }),
      });

      const data = await response.json();

      if (response.status === 409 || data.reason === 'ALREADY_VOTED') {
        setStep('already_voted');
        setError(
          data.error ||
            (language === 'hi'
              ? 'इस मोबाइल नंबर द्वारा इस चुनाव में पहले ही मत दिया जा चुका है।'
              : 'This mobile number has already cast a vote in this election.')
        );
        try {
          localStorage.setItem(`civic_voted_${pollId}`, 'true');
        } catch {}
        onAlreadyVoted();
        return;
      }

      if (!response.ok || !data.verified) {
        setError(data.error || 'Invalid or expired OTP. Please try again.');
        return;
      }

      // Verification successful!
      setStep('success');

      try {
        localStorage.setItem(`civic_voted_${pollId}`, 'true');
      } catch {}

      setTimeout(() => {
        onVerified(data.anonymousCredential);
      }, 1200);
    } catch (err) {
      console.error('Verify OTP error:', err);
      setError(
        language === 'hi'
          ? 'सर्वर से संपर्क नहीं हो सका। कृपया पुनः प्रयास करें।'
          : 'Failed to communicate with verification server. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <GlassCard elevated className="space-y-6 p-5 sm:p-8 relative overflow-hidden">
        {/* Subtle decorative ambient glow */}
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-36 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-xs">
            <MessageSquare className="w-6 h-6" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold mx-auto">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>
              {language === 'hi'
                ? 'व्हाट्सएप ओटीपी द्वारा सुरक्षित सत्यापन'
                : 'WhatsApp OTP Verification • 1 Citizen 1 Vote'}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-[var(--text-primary)]">
            {language === 'hi' ? 'व्हाट्सएप द्वारा मतदाता सत्यापन' : 'Verify via WhatsApp OTP'}
          </h2>

          <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
            {language === 'hi'
              ? 'निष्पक्ष चुनाव हेतु अपने व्हाट्सएप नंबर पर निःशुल्क सुरक्षा कोड प्राप्त करें। गोपनीयता सुनिश्चित करने हेतु आपका नंबर कभी भी डेटाबेस में सहेजा नहीं जाता है।'
              : 'Receive a free, confidential 6-digit OTP directly on your WhatsApp. To protect voter privacy, your phone number is never stored or linked to your vote.'}
          </p>
        </div>

        {/* Dynamic Alert Banner */}
        {error && (
          <div
            role="alert"
            className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-start gap-2.5 animate-in fade-in duration-200"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed font-medium">{error}</span>
          </div>
        )}

        {/* ── STEP 1: PHONE NUMBER & ANTI-BOT CHALLENGE ── */}
        {step === 'phone' && (
          <form onSubmit={handleSendOtp} className="space-y-5 animate-in fade-in duration-200">
            {/* Phone Number Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--text-primary)] flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-500" />
                  <span>
                    {language === 'hi'
                      ? 'व्हाट्सएप मोबाइल नंबर (WhatsApp Number) *'
                      : 'WhatsApp Mobile Number *'}
                  </span>
                </span>
                <span className="text-[10px] text-[var(--text-tertiary)] font-normal">
                  {language === 'hi' ? 'केवल भारत (+91)' : 'India (+91)'}
                </span>
              </label>

              <div className="flex items-center gap-2">
                {/* Country Code Pill */}
                <div className="px-3.5 py-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-glass)] font-mono font-bold text-xs sm:text-sm text-[var(--text-primary)] select-none shrink-0 flex items-center gap-1.5">
                  <span>🇮🇳</span>
                  <span>+91</span>
                </div>

                {/* 10-Digit Mobile Number Input */}
                <input
                  type="tel"
                  required
                  autoFocus
                  value={phoneNumber}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="98765 43210"
                  maxLength={10}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-glass)] text-sm sm:text-base font-mono font-bold text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <span className="text-[10px] text-[var(--text-tertiary)] block">
                {language === 'hi'
                  ? 'अपना 10 अंकों का सक्रिय व्हाट्सएप नंबर दर्ज करें।'
                  : 'Enter your active 10-digit mobile number connected to WhatsApp.'}
              </span>
            </div>

            {/* Anti-Bot Arithmetic Challenge */}
            <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-glass)] space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-1.5">
                  <Fingerprint className="w-4 h-4 text-emerald-500" />
                  <span>
                    {language === 'hi'
                      ? 'सुरक्षा सत्यापन (Anti-Bot Challenge) *'
                      : 'Security Verification (Anti-Bot Challenge) *'}
                  </span>
                </label>
                <button
                  type="button"
                  onClick={generateNewMathChallenge}
                  className="text-[11px] text-emerald-500 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>{language === 'hi' ? 'बदलें' : 'Refresh'}</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-3 py-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-glass)] font-mono font-bold text-sm text-[var(--text-primary)] select-none">
                  {num1} + {num2} = ?
                </div>
                <input
                  type="number"
                  required
                  value={mathAnswer}
                  onChange={(e) => {
                    setMathAnswer(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="?"
                  className="w-24 px-3 py-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-glass)] text-sm font-bold text-center text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
            </div>

            {/* Legal Citizen Declaration Checkbox */}
            <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-glass)] cursor-pointer hover:bg-[var(--bg-surface-hover)] transition-colors">
              <input
                type="checkbox"
                required
                checked={isDeclarationChecked}
                onChange={(e) => {
                  setIsDeclarationChecked(e.target.checked);
                  if (error) setError(null);
                }}
                className="mt-0.5 w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 cursor-pointer accent-emerald-500"
              />
              <span className="text-[11px] sm:text-xs text-[var(--text-secondary)] leading-relaxed">
                {language === 'hi'
                  ? 'मैं प्रमाणित करता हूँ कि मैं भारतीय नागरिक हूँ एवं यह मेरा व्यक्तिगत व्हाट्सएप नंबर है। मैं इस चुनाव में केवल एक बार निष्पक्ष मत दूंगा।'
                  : 'I declare that I am an Indian citizen and this is my active personal WhatsApp number. I understand that only one vote is permitted per citizen.'}
              </span>
            </label>

            {/* Action Button: Send WhatsApp OTP */}
            <GlassButton
              type="submit"
              variant="primary"
              size="lg"
              disabled={isLoading || cleanPhone.length !== 10 || !isDeclarationChecked || !mathAnswer}
              className="w-full gap-2 font-bold justify-center shadow-md py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500/40"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{language === 'hi' ? 'ओटीपी भेजा जा रहा है...' : 'Sending WhatsApp OTP...'}</span>
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4" />
                  <span>
                    {language === 'hi' ? 'व्हाट्सएप ओटीपी भेजें ➔' : 'Send WhatsApp OTP ➔'}
                  </span>
                </>
              )}
            </GlassButton>
          </form>
        )}

        {/* ── STEP 2: ENTER 6-DIGIT OTP ── */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-5 animate-in fade-in duration-200">
            {/* Phone Info Banner */}
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-500 shrink-0" />
                <div>
                  <span className="font-bold text-[var(--text-primary)] block">
                    +91 {cleanPhone.slice(0, 5)} {cleanPhone.slice(5)}
                  </span>
                  <span className="text-[11px] text-[var(--text-secondary)]">
                    {language === 'hi' ? 'व्हाट्सएप पर ओटीपी भेजा गया' : 'Verification code sent to WhatsApp'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setStep('phone');
                  setOtpCode('');
                  setError(null);
                }}
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold cursor-pointer"
              >
                {language === 'hi' ? 'नंबर बदलें' : 'Change'}
              </button>
            </div>

            {/* Development / Test Helper Mode Pill */}
            {devOtp && (
              <div
                onClick={() => {
                  setOtpCode(devOtp);
                  if (error) setError(null);
                }}
                className="p-3 rounded-xl bg-[var(--accent-soft)] border border-[var(--accent)]/30 text-xs text-[var(--text-primary)] flex items-center justify-between cursor-pointer hover:bg-[var(--accent)]/20 transition-all shadow-xs"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
                  <span className="text-[11px]">
                    {language === 'hi' ? 'परीक्षण कोड:' : 'Test Mode Auto-Fill:'}{' '}
                    <strong className="font-mono text-[var(--accent)]">{devOtp}</strong>
                  </span>
                </div>
                <span className="text-[10px] text-[var(--accent)] underline font-bold">
                  {language === 'hi' ? 'भरें' : 'Fill OTP'}
                </span>
              </div>
            )}

            {/* OTP Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--text-primary)] flex items-center justify-between">
                <span>
                  {language === 'hi'
                    ? '6-अंकों का व्हाट्सएप ओटीपी (6-Digit OTP) *'
                    : '6-Digit WhatsApp OTP *'}
                </span>
                <span className="text-[10px] text-[var(--text-tertiary)] font-normal">
                  {language === 'hi' ? '10 मिनट के लिए मान्य' : 'Valid for 10 min'}
                </span>
              </label>

              <input
                ref={otpInputRef}
                type="text"
                required
                value={otpCode}
                onChange={(e) => {
                  setOtpCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6));
                  if (error) setError(null);
                }}
                placeholder="• • • • • •"
                maxLength={6}
                className="w-full px-4 py-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-glass)] text-center font-mono font-black text-xl sm:text-2xl tracking-[0.5em] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>

            {/* Cooldown Timer & Resend Action */}
            <div className="flex items-center justify-between text-xs pt-1">
              <div className="flex items-center gap-1.5 text-[var(--text-tertiary)]">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {resendCooldown > 0
                    ? `${language === 'hi' ? 'पुनः भेजने में शेष:' : 'Resend in:'} ${resendCooldown}s`
                    : language === 'hi'
                    ? 'ओटीपी प्राप्त नहीं हुआ?'
                    : "Didn't receive code?"}
                </span>
              </div>

              <button
                type="button"
                disabled={resendCooldown > 0 || isLoading}
                onClick={() => handleSendOtp()}
                className={`font-semibold cursor-pointer transition-colors ${
                  resendCooldown > 0
                    ? 'text-[var(--text-tertiary)] cursor-not-allowed'
                    : 'text-emerald-600 dark:text-emerald-400 hover:underline'
                }`}
              >
                {language === 'hi' ? 'ओटीपी पुनः भेजें' : 'Resend OTP'}
              </button>
            </div>

            {/* Submit Action: Verify OTP */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <GlassButton
                type="submit"
                variant="primary"
                size="lg"
                disabled={isLoading || otpCode.trim().length !== 6}
                className="flex-1 justify-center gap-2 font-bold py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500/40"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{language === 'hi' ? 'सत्यापित हो रहा है...' : 'Verifying Code...'}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {language === 'hi'
                        ? 'ओटीपी सत्यापित कर मतपत्र खोलें ➔'
                        : 'Verify OTP & Unlock Ballot ➔'}
                    </span>
                  </>
                )}
              </GlassButton>

              <GlassButton
                type="button"
                variant="outline"
                onClick={() => {
                  setStep('phone');
                  setError(null);
                }}
                className="text-xs font-bold"
              >
                {language === 'hi' ? 'वापस' : 'Back'}
              </GlassButton>
            </div>
          </form>
        )}

        {/* ── STEP 3: VERIFICATION SUCCESS ── */}
        {step === 'success' && (
          <div className="py-6 text-center space-y-4 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400">
                {language === 'hi'
                  ? 'व्हाट्सएप सत्यापन सफलतापूर्वक संपन्न!'
                  : 'WhatsApp Number Successfully Verified!'}
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                {language === 'hi'
                  ? 'अनाम क्रिप्टोग्राफिक टोकन जारी किया गया। मतपत्र खोला जा रहा है...'
                  : 'Anonymous cryptographic voting token issued. Unlocking confidential ballot...'}
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[var(--bg-surface)] border border-[var(--border-glass)] text-[11px] font-mono text-[var(--text-secondary)]">
              <Lock className="w-3.5 h-3.5 text-emerald-500" />
              <span>1 WhatsApp Number = 1 Vote • Zero PII Stored</span>
            </div>
          </div>
        )}

        {/* ── STEP 4: ALREADY VOTED (DUPLICATE BLOCKED) ── */}
        {step === 'already_voted' && (
          <div className="py-6 text-center space-y-4 animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto shadow-md">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-black text-[var(--text-primary)]">
                {language === 'hi' ? 'दोहरा मतदान प्रतिबंधित है' : 'Duplicate Vote Blocked'}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto leading-relaxed">
                {language === 'hi'
                  ? 'इस व्हाट्सएप मोबाइल नंबर द्वारा इस चुनाव में पूर्व में मत दर्ज किया जा चुका है। निष्पक्ष चुनाव हेतु प्रत्येक नागरिक केवल एक बार मतदान कर सकता है।'
                  : 'This WhatsApp mobile number has already participated in this poll. To preserve election integrity, duplicate voting is strictly prohibited.'}
              </p>
            </div>

            <div className="pt-2">
              <GlassButton
                type="button"
                variant="outline"
                onClick={() => {
                  setStep('phone');
                  setPhoneNumber('');
                  setCleanPhone('');
                  setOtpCode('');
                  setError(null);
                }}
                className="text-xs font-bold"
              >
                {language === 'hi' ? 'दूसरा नंबर आज़माएं' : 'Try Another Number'}
              </GlassButton>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
