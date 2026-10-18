'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { ECI_ELECTORAL_SEARCH_URL } from '@/lib/types';
import { validateEciPrefix, isDummyNumber } from '@/lib/data/eci-prefixes';
import { INDIAN_STATES } from '@/lib/data/parties';
import {
  ExternalLink,
  CheckCircle2,
  Lock,
  AlertCircle,
  Search,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  RefreshCw,
  AlertTriangle,
  Fingerprint,
  Phone,
  KeyRound,
  User,
  MapPin,
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
  const { t, language } = useI18n();

  // Voter Identity inputs
  const [voterId, setVoterId] = useState('');
  const [voterName, setVoterName] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');

  // OTP State
  const [isOtpSending, setIsOtpSending] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpPreviewNotice, setOtpPreviewNotice] = useState<string | null>(null);

  // Checkbox confirmation
  const [isCheckedConfirmed, setIsCheckedConfirmed] = useState(false);

  // Anti-bot arithmetic verification challenge
  const [num1, setNum1] = useState(7);
  const [num2, setNum2] = useState(5);
  const [mathAnswer, setMathAnswer] = useState('');

  // UI status
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [credential, setCredential] = useState<string | null>(null);
  const [localDeviceVotedWarning, setLocalDeviceVotedWarning] = useState(false);

  // Generate new math challenge
  const generateNewMathChallenge = useCallback(() => {
    const n1 = Math.floor(Math.random() * 8) + 3;
    const n2 = Math.floor(Math.random() * 8) + 2;
    setNum1(n1);
    setNum2(n2);
    setMathAnswer('');
  }, []);

  useEffect(() => {
    generateNewMathChallenge();

    try {
      const previouslyVoted = localStorage.getItem(`civic_voted_${pollId}`);
      if (previouslyVoted) {
        setLocalDeviceVotedWarning(true);
      }
    } catch {}
  }, [pollId, generateNewMathChallenge]);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (otpTimer <= 0) return;
    const interval = setInterval(() => {
      setOtpTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [otpTimer]);

  // Clean and normalize voter ID on the fly
  const cleanedVoterId = useMemo(() => {
    return voterId.trim().toUpperCase().replace(/[\s\/-]/g, '');
  }, [voterId]);

  // Real-time ECI series prefix validation
  const eciValidation = useMemo(() => {
    if (!cleanedVoterId || cleanedVoterId.length < 3) return null;
    const prefix = cleanedVoterId.slice(0, 3);
    const check = validateEciPrefix(prefix);
    if (check.isValid) return check;
    // Check 2-letter legacy
    const legacyPrefix = cleanedVoterId.slice(0, 2);
    return validateEciPrefix(legacyPrefix);
  }, [cleanedVoterId]);

  // Auto-fill state if ECI prefix matches
  useEffect(() => {
    if (eciValidation?.isValid && eciValidation.stateCode && !selectedState) {
      const found = INDIAN_STATES.find(
        (s) => s.code.toUpperCase() === eciValidation.stateCode?.toUpperCase()
      );
      if (found) {
        setSelectedState(found.id);
      }
    }
  }, [eciValidation, selectedState]);

  // Strict Voter ID validation
  const voterIdAnalysis = useMemo(() => {
    if (!cleanedVoterId) return { isValid: false, reason: 'empty' };

    const standardRegex = /^[A-Z]{3}[0-9]{7}$/;
    const legacyRegex = /^[A-Z]{2}[0-9]{7,8}$/;

    if (!standardRegex.test(cleanedVoterId) && !legacyRegex.test(cleanedVoterId)) {
      return { isValid: false, reason: 'format', message: 'Must be 3 letters + 7 numbers (e.g. DLH2891042)' };
    }

    if (!eciValidation || !eciValidation.isValid) {
      return {
        isValid: false,
        reason: 'fake_prefix',
        message: `"${cleanedVoterId.slice(0, 3)}" is not an official ECI series prefix`,
      };
    }

    const digits = cleanedVoterId.replace(/^[A-Z]+/, '');
    if (isDummyNumber(digits)) {
      return { isValid: false, reason: 'dummy', message: 'Sequential or repeated dummy numbers are not allowed' };
    }

    return { isValid: true, stateNameEn: eciValidation.stateNameEn, stateNameHi: eciValidation.stateNameHi };
  }, [cleanedVoterId, eciValidation]);

  // Clean 10-digit phone
  const cleanPhone = useMemo(() => {
    let p = phoneNumber.trim().replace(/[\s-]/g, '');
    if (p.startsWith('+91')) p = p.slice(3);
    if (p.startsWith('91') && p.length === 12) p = p.slice(2);
    if (p.startsWith('0') && p.length === 11) p = p.slice(1);
    return p;
  }, [phoneNumber]);

  const isPhoneValid = /^[6-9][0-9]{9}$/.test(cleanPhone);

  const handleOpenEci = () => {
    window.open(ECI_ELECTORAL_SEARCH_URL, '_blank', 'noopener,noreferrer');
  };

  // Hardware/canvas client fingerprint
  const getDeviceFingerprint = (): string => {
    if (typeof window === 'undefined') return 'server';
    try {
      const parts = [
        window.screen.width,
        window.screen.height,
        window.screen.colorDepth,
        navigator.hardwareConcurrency || 2,
        Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
        navigator.language || 'en',
      ];
      return parts.join(':');
    } catch {
      return 'generic-client';
    }
  };

  // Send Verification Code (OTP)
  const handleSendOtp = async () => {
    if (!isPhoneValid) {
      setError(language === 'hi' ? 'कृपया मान्य 10-अंकों का भारतीय मोबाइल नंबर दर्ज करें।' : 'Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setIsOtpSending(true);
    setError(null);

    try {
      const res = await fetch('/api/verification/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pollId, phoneNumber: cleanPhone }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.reason === 'ALREADY_VOTED' || res.status === 409) {
          try {
            localStorage.setItem(`civic_voted_${pollId}`, '1');
          } catch {}
          onAlreadyVoted();
          return;
        }
        setError(data.error || 'Failed to dispatch verification code');
        return;
      }

      setIsOtpSent(true);
      setOtpTimer(60);
      if (data.previewOtp) {
        setOtpPreviewNotice(data.previewOtp);
        // Pre-fill or give visual code
        setOtpCode(data.previewOtp);
      }
    } catch {
      setError('Network error while requesting verification code');
    } finally {
      setIsOtpSending(false);
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!voterIdAnalysis.isValid) {
      setError(
        language === 'hi'
          ? voterIdAnalysis.message || 'कृपया वास्तविक और मान्य मतदाता पहचान पत्र (EPIC) नंबर दर्ज करें।'
          : voterIdAnalysis.message || 'Please enter a genuine, registered Voter ID (EPIC) card number.'
      );
      return;
    }

    if (!isPhoneValid) {
      setError(language === 'hi' ? 'कृपया अपना 10-अंकों का मोबाइल नंबर दर्ज करें।' : 'Please enter your 10-digit mobile number for verification.');
      return;
    }

    if (!otpCode || otpCode.trim().length < 6) {
      setError(language === 'hi' ? 'कृपया 6-अंकों का सत्यापन कोड दर्ज करें।' : 'Please enter the 6-digit OTP verification code.');
      return;
    }

    // Verify arithmetic challenge
    const expected = num1 + num2;
    if (parseInt(mathAnswer.trim(), 10) !== expected) {
      setError(
        language === 'hi'
          ? 'सुरक्षा जोड़ (Math Challenge) का उत्तर गलत है। कृपया पुनः प्रयास करें।'
          : 'Incorrect security math answer. Please solve the calculation correctly.'
      );
      return;
    }

    if (!isCheckedConfirmed) {
      setError(
        language === 'hi'
          ? 'कृपया आगे बढ़ने से पहले घोषणा चेकबॉक्स का चयन करके पुष्टि करें।'
          : 'Please check the voter declaration checkbox before continuing.'
      );
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pollId,
          voterId: cleanedVoterId,
          phoneNumber: cleanPhone,
          otpCode: otpCode.trim(),
          voterName: voterName.trim(),
          stateCode: selectedState,
          selfVerificationConfirmed: true,
          deviceFingerprint: getDeviceFingerprint(),
          mathChallenge: {
            num1,
            num2,
            answer: parseInt(mathAnswer.trim(), 10),
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.reason === 'ALREADY_VOTED' || response.status === 409) {
          try {
            localStorage.setItem(`civic_voted_${pollId}`, '1');
          } catch {}
          onAlreadyVoted();
          return;
        }

        if (data.reason === 'RATE_LIMITED') {
          setError(t.verification.rateLimited);
          return;
        }

        if (data.reason === 'INVALID_OTP') {
          setError(data.error || 'Incorrect verification code. Please check SMS.');
          return;
        }

        if (data.reason === 'BOT_CHALLENGE_FAILED') {
          setError(
            language === 'hi'
              ? 'सुरक्षा सत्यापन विफल हुआ। कृपया नया गणित प्रश्न हल करें।'
              : 'Security verification failed. Please try again with the new calculation.'
          );
          generateNewMathChallenge();
          return;
        }

        setError(data.error || t.verification.serviceUnavailable);
        return;
      }

      if (data.verified && data.anonymousCredential) {
        try {
          localStorage.setItem(`civic_voted_${pollId}`, '1');
        } catch {}
        setIsSuccess(true);
        setCredential(data.anonymousCredential);
        onVerified(data.anonymousCredential);
      } else {
        setError(t.verification.serviceUnavailable);
      }
    } catch {
      setError(t.verification.serviceUnavailable);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <GlassCard elevated className="space-y-6 sm:space-y-7 p-4 sm:p-8 relative overflow-hidden">
        {/* Subtle decorative ambient glow */}
        <div
          className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-40 bg-[var(--accent)]/10 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        {/* Real Verification Header */}
        <div className="text-center space-y-2.5 sm:space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]/20 flex items-center justify-center mx-auto shadow-xs mb-1">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
            {language === 'hi'
              ? 'वास्तविक मतदाता पहचान एवं एकल-मत सुरक्षा'
              : 'Real Voter ID Verification & Single-Vote Guarantee'}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed max-w-xl mx-auto">
            {language === 'hi'
              ? 'फर्जी या रैंडम नंबर से मतदान रोकने के लिए आधिकारिक ECI सीरीज एवं मोबाइल सत्यापन अनिवार्य है। क्रिप्टोग्राफिक लेजर के कारण कोई भी नागरिक एक से अधिक बार वोट नहीं कर सकता।'
              : 'To eliminate fake or random number voting, genuine ECI series verification and mobile confirmation are enforced. Cryptographic hashing ensures strictly one vote per verified citizen.'}
          </p>
        </div>

        {/* Warning if previous vote detected in this browser/device */}
        {localDeviceVotedWarning && !isSuccess && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <div>
              <span className="font-bold block">
                {language === 'hi' ? 'पूर्व मतदान सूचना:' : 'Previous Participation Note:'}
              </span>
              <span>
                {language === 'hi'
                  ? 'इस डिवाइस से पूर्व में मतदान रिकॉर्ड किया गया है। यदि यह पोल कड़े एकल मत (Strict Single Vote) पर सेट है, तो दोबारा मतदान स्वतः ब्लॉक रहेगा।'
                  : 'A ballot was previously recorded from this device. If strict single-vote policy is enabled, duplicate votes are automatically blocked across all browsers and devices.'}
              </span>
            </div>
          </div>
        )}

        {/* ── REAL VERIFICATION FORM ── */}
        {!isSuccess && (
          <form onSubmit={handleVerifySubmit} className="space-y-5 animate-in fade-in duration-300">
            {/* Step 1: Real Voter ID (EPIC) Number with ECI Regional Series Detection */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-glass)] space-y-3.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label
                  htmlFor="voter-id-input"
                  className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-1.5"
                >
                  <CreditCard className="w-4 h-4 text-[var(--accent)]" />
                  <span>
                    {language === 'hi'
                      ? '1. मतदाता पहचान पत्र (EPIC) संख्या *'
                      : '1. Genuine Voter ID (EPIC Card Number) *'}
                  </span>
                </label>

                {/* Real-time ECI Series Badge */}
                {cleanedVoterId.length >= 3 && (
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 transition-all ${
                      voterIdAnalysis.isValid
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {voterIdAnalysis.isValid ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        <span>
                          {language === 'hi'
                            ? `मान्य ECI सीरीज: ${voterIdAnalysis.stateNameHi || voterIdAnalysis.stateNameEn}`
                            : `Valid ECI Series: ${voterIdAnalysis.stateNameEn}`}
                        </span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                        <span>{voterIdAnalysis.message}</span>
                      </>
                    )}
                  </span>
                )}
              </div>

              {/* Input Field */}
              <div className="relative">
                <input
                  id="voter-id-input"
                  type="text"
                  required
                  value={voterId}
                  onChange={(e) => {
                    setVoterId(e.target.value.toUpperCase());
                    if (error) setError(null);
                  }}
                  placeholder="e.g. DLH2891042, WBG1482910, UP1234567"
                  maxLength={16}
                  className="w-full px-3.5 py-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-glass)] text-sm sm:text-base font-mono font-bold tracking-wider text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-[var(--accent)] shadow-2xs uppercase"
                  autoComplete="off"
                  spellCheck="false"
                />
              </div>

              {/* ECI Search & Series Guidance */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-1 text-xs">
                <span className="text-[var(--text-tertiary)] text-[11px]">
                  {language === 'hi'
                    ? 'असली ECI मतदाता कार्ड कोड (उदा. DLH, WBG, UP, BOM, PAT, JAI, AHM)'
                    : 'Real ECI state series prefix (e.g. DLH, WBG, UP, BOM, PAT, JAI, AHM). Random strings like ABC/XYZ rejected.'}
                </span>

                <button
                  type="button"
                  onClick={handleOpenEci}
                  className="text-[var(--accent)] hover:underline inline-flex items-center gap-1 font-bold text-xs cursor-pointer shrink-0"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>
                    {language === 'hi' ? 'ECI पोर्टल पर खोजें ↗' : 'ECI Electoral Search ↗'}
                  </span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Step 2: Full Name & State Selection */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-glass)] space-y-3.5">
              <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-1.5 block">
                <User className="w-4 h-4 text-[var(--accent)]" />
                <span>
                  {language === 'hi'
                    ? '2. मतदाता का पूरा नाम एवं राज्य *'
                    : '2. Voter Name & Registered State *'}
                </span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[var(--text-secondary)] block">
                    {language === 'hi' ? 'मतदाता पहचान पत्र पर दर्ज नाम *' : 'Name as per Voter Card *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={voterName}
                    onChange={(e) => {
                      setVoterName(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="e.g. Rajesh Kumar Sharma"
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-glass)] text-xs font-semibold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[var(--text-secondary)] block">
                    {language === 'hi' ? 'राज्य / केंद्र शासित प्रदेश *' : 'State / Union Territory *'}
                  </label>
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full glass-select rounded-xl text-xs font-semibold"
                  >
                    <option value="">{language === 'hi' ? '-- राज्य चुनें --' : '-- Select State --'}</option>
                    {INDIAN_STATES.map((st) => (
                      <option key={st.id} value={st.id}>
                        {language === 'hi' ? st.name_hi : st.name_en} ({st.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Step 3: Multi-Factor Mobile Phone & 6-Digit OTP Verification */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-glass)] space-y-3.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-[var(--accent)]" />
                  <span>
                    {language === 'hi'
                      ? '3. मोबाइल नंबर एवं OTP सत्यापन *'
                      : '3. Mobile Number & Security OTP *'}
                  </span>
                </label>
                <span className="text-[11px] text-[var(--text-tertiary)]">
                  {language === 'hi' ? '1 नंबर = केवल 1 वोट' : '1 Mobile Number = Strict 1 Vote'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[11px] font-semibold text-[var(--text-secondary)] block">
                    {language === 'hi' ? '10-अंकों का भारतीय मोबाइल नंबर' : '10-Digit Mobile Number'}
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-glass)] text-xs font-mono font-bold text-[var(--text-tertiary)] select-none">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => {
                        setPhoneNumber(e.target.value);
                        if (error) setError(null);
                      }}
                      placeholder="9876543210"
                      maxLength={10}
                      className="flex-1 px-3 py-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-glass)] text-xs font-mono font-bold tracking-wider text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    />
                    <button
                      type="button"
                      disabled={!isPhoneValid || isOtpSending || otpTimer > 0}
                      onClick={handleSendOtp}
                      className="px-3 py-2.5 rounded-xl bg-[var(--accent)] hover:opacity-90 disabled:opacity-40 text-white font-bold text-xs shrink-0 cursor-pointer transition-all active:scale-95 flex items-center gap-1.5"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>
                        {isOtpSending
                          ? language === 'hi'
                            ? 'भेज रहे हैं...'
                            : 'Sending...'
                          : otpTimer > 0
                          ? `${otpTimer}s`
                          : isOtpSent
                          ? language === 'hi'
                            ? 'पुनः भेजें'
                            : 'Resend'
                          : language === 'hi'
                          ? 'OTP भेजें'
                          : 'Get OTP'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* OTP Input */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[var(--text-secondary)] block">
                    {language === 'hi' ? '6-अंकों का OTP कोड *' : '6-Digit OTP Code *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={otpCode}
                    onChange={(e) => {
                      setOtpCode(e.target.value.replace(/[^0-9]/g, ''));
                      if (error) setError(null);
                    }}
                    placeholder="123456"
                    maxLength={6}
                    className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-glass)] text-xs font-mono font-bold tracking-widest text-[var(--text-primary)] text-center focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  />
                </div>
              </div>

              {/* Instant Verification Notice Badge */}
              {otpPreviewNotice && (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>
                      {language === 'hi' ? 'सत्यापन कोड तैयार है:' : 'Verification OTP Ready:'}{' '}
                      <strong className="font-mono text-sm tracking-widest bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-950 dark:text-emerald-100">
                        {otpPreviewNotice}
                      </strong>
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Auto-Verified</span>
                </div>
              )}
            </div>

            {/* Step 4: Anti-Bot Arithmetic Human Challenge */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-glass)] space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-1.5">
                  <Fingerprint className="w-4 h-4 text-[var(--accent)]" />
                  <span>
                    {language === 'hi'
                      ? '4. सुरक्षा सत्यापन (मानव जाँच) *'
                      : '4. Security Human Challenge *'}
                  </span>
                </label>

                <button
                  type="button"
                  onClick={generateNewMathChallenge}
                  className="p-1 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)] transition-colors cursor-pointer"
                  title="New calculation"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-4 py-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-glass)] font-mono font-black text-sm text-[var(--text-primary)] tracking-wider shrink-0 select-none">
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
                  placeholder={language === 'hi' ? 'उत्तर लिखें' : 'Answer'}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-glass)] text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                />
              </div>
            </div>

            {/* Step 5: Explicit Voter Declaration Checkbox */}
            <label className="flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-glass)] cursor-pointer hover:border-[var(--accent)] active:bg-[var(--accent-soft)]/20 transition-colors select-none">
              <input
                type="checkbox"
                id="voter-declaration-checkbox"
                checked={isCheckedConfirmed}
                onChange={(e) => {
                  setIsCheckedConfirmed(e.target.checked);
                  if (error) setError(null);
                }}
                className="w-5 h-5 mt-0.5 rounded border-[var(--border-glass)] text-[var(--accent)] focus:ring-[var(--accent)] cursor-pointer shrink-0"
              />
              <span className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {language === 'hi' ? (
                  <>
                    मैं पुष्टि करता/करती हूँ कि मैं भारत का 18+ वर्ष का नागरिक हूँ, यह मेरा वास्तविक मतदाता पहचान पत्र है, और मैं इस सर्वेक्षण में केवल एक बार अपना स्वतंत्र मत दर्ज कर रहा/रही हूँ।
                  </>
                ) : (
                  <>
                    I solemnly declare that I am an Indian citizen aged 18+, this is my genuine Voter ID, and I am casting strictly my single, independent opinion in this civic poll.
                  </>
                )}
              </span>
            </label>

            {/* Error Message Display */}
            {error && (
              <div
                role="alert"
                className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-600 dark:text-red-400 flex items-start gap-2.5"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Verification Action */}
            <GlassButton
              type="submit"
              variant="primary"
              size="lg"
              disabled={isLoading || !voterIdAnalysis.isValid || !isCheckedConfirmed}
              className="w-full justify-center gap-2 font-black text-sm sm:text-base py-3.5 shadow-md active:scale-98 transition-all"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>
                    {language === 'hi' ? 'क्रिप्टोग्राफिक सत्यापन प्रगति पर है...' : 'Verifying Identity & Deduplicating...'}
                  </span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  <span>
                    {language === 'hi'
                      ? 'सत्यापन पूर्ण करें एवं मतदान मतपत्र खोलें'
                      : 'Complete Real Verification & Unlock Ballot'}
                  </span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </GlassButton>
          </form>
        )}

        {/* ── SUCCESS STATE VIEW ── */}
        {isSuccess && credential && (
          <div className="text-center space-y-5 py-4 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 border-2 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-2xl font-black text-[var(--text-primary)]">
                {language === 'hi' ? 'सत्यापन सफल!' : 'Real Verification Successful!'}
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-md mx-auto">
                {language === 'hi'
                  ? 'आपका वास्तविक पहचान सत्यापन पूरा हो चुका है। अब आप अपना गुमनाम मत दर्ज कर सकते हैं।'
                  : 'Your identity has been verified and registered on the cryptographic single-vote ledger. Proceed to vote.'}
              </p>
            </div>

            <div className="pt-2">
              <GlassButton
                variant="primary"
                size="lg"
                onClick={() => onVerified(credential)}
                className="gap-2 font-bold px-8 shadow-md"
              >
                <span>{language === 'hi' ? 'मतदान की ओर आगे बढ़ें' : 'Proceed to Cast Ballot'}</span>
                <ArrowRight className="w-4 h-4" />
              </GlassButton>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
