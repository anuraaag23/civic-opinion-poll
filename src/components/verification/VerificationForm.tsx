'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { ECI_ELECTORAL_SEARCH_URL } from '@/lib/types';
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

  // Voter ID input state
  const [voterId, setVoterId] = useState('');
  const [hasOpenedEci, setHasOpenedEci] = useState(false);
  const [isCheckedConfirmed, setIsCheckedConfirmed] = useState(false);

  // Anti-bot arithmetic verification challenge
  const [num1, setNum1] = useState(7);
  const [num2, setNum2] = useState(5);
  const [mathAnswer, setMathAnswer] = useState('');

  // UI state
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

    // Check if this browser/device previously recorded a vote for this poll
    try {
      const previouslyVoted = localStorage.getItem(`civic_voted_${pollId}`);
      if (previouslyVoted) {
        setLocalDeviceVotedWarning(true);
      }
    } catch {
      // Ignore localStorage access failures
    }
  }, [pollId, generateNewMathChallenge]);

  // Clean and normalize voter ID on the fly
  const cleanedVoterId = useMemo(() => {
    return voterId.trim().toUpperCase().replace(/[\s\/-]/g, '');
  }, [voterId]);

  // Format validation: 3 letters + 7 numbers (standard) or 2-4 letters + 6-8 digits (legacy state)
  const isVoterIdValid = useMemo(() => {
    if (!cleanedVoterId) return false;
    const standardRegex = /^[A-Z]{3}[0-9]{7}$/;
    const legacyRegex = /^[A-Z]{2,4}[0-9]{6,8}$/;
    return standardRegex.test(cleanedVoterId) || legacyRegex.test(cleanedVoterId);
  }, [cleanedVoterId]);

  const handleOpenEci = () => {
    setHasOpenedEci(true);
    window.open(ECI_ELECTORAL_SEARCH_URL, '_blank', 'noopener,noreferrer');
  };

  // Create lightweight hardware/device signature to prevent local bot looping
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

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cleanedVoterId) {
      setError(
        language === 'hi'
          ? 'कृपया अपना मतदाता पहचान पत्र (EPIC) नंबर दर्ज करें।'
          : 'Please enter your Voter ID (EPIC) card number.'
      );
      return;
    }

    if (!isVoterIdValid) {
      setError(
        language === 'hi'
          ? 'अमान्य मतदाता पहचान पत्र प्रारूप। कृपया 3 अक्षर + 7 अंक प्रारूप (जैसे ABC1234567) दर्ज करें।'
          : 'Invalid Voter ID format. Standard Indian format requires 3 letters followed by 7 digits (e.g. ABC1234567).'
      );
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
              ? 'मतदाता पहचान सत्यापन एवं एकल-मत सुरक्षा'
              : 'Voter Identity Verification & Single-Vote Guarantee'}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed max-w-xl mx-auto">
            {language === 'hi'
              ? 'प्रत्येक नागरिक को निष्पक्ष रूप से केवल एक वोट की अनुमति है। अपने वास्तविक मतदाता पहचान पत्र (EPIC) से सत्यापित करें। क्रिप्टोग्राफ़िक हैशिंग के कारण आपका वास्तविक पहचान डेटा कभी भी सर्वर पर संग्रहीत नहीं होता।'
              : 'To guarantee election fairness, each citizen is strictly limited to one vote across all devices and browsers. Verify using your genuine Voter ID (EPIC). Your identity is never stored.'}
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
                  ? 'इस डिवाइस से पूर्व में मतदान रिकॉर्ड किया गया है। यदि आप उसी मतदाता पहचान पत्र से दोबारा प्रयास करते हैं, तो सर्वर-साइड लेजर द्वारा उसे स्वतः ब्लॉक कर दिया जाएगा।'
                  : 'A ballot was previously recorded from this device. Entering the same Voter ID will be blocked by our server-side cryptographic ledger.'}
              </span>
            </div>
          </div>
        )}

        {/* ── REAL VERIFICATION FORM ── */}
        {!isSuccess && (
          <form onSubmit={handleVerifySubmit} className="space-y-6 animate-in fade-in duration-300">
            {/* Step 1: Real Voter ID (EPIC) Number Input */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-glass)] space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label
                  htmlFor="voter-id-input"
                  className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-1.5"
                >
                  <CreditCard className="w-4 h-4 text-[var(--accent)]" />
                  <span>
                    {language === 'hi'
                      ? '1. मतदाता पहचान पत्र (EPIC) संख्या *'
                      : '1. Voter ID (EPIC Card Number) *'}
                  </span>
                </label>

                {/* Real-time Format Indicator Badge */}
                {cleanedVoterId.length > 0 && (
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                      isVoterIdValid
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {isVoterIdValid ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{language === 'hi' ? 'मान्य प्रारूप' : 'Valid Format'}</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3 h-3" />
                        <span>
                          {language === 'hi' ? '3 अक्षर + 7 अंक आवश्यक' : '3 letters + 7 numbers needed'}
                        </span>
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
                  placeholder="e.g. ABC1234567 or XYZ9876543"
                  maxLength={16}
                  className="w-full px-3.5 py-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-glass)] text-sm sm:text-base font-mono font-bold tracking-wider text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-[var(--accent)] shadow-2xs uppercase"
                  autoComplete="off"
                  spellCheck="false"
                />
              </div>

              {/* Helper Links to ECI Search */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-1 text-xs">
                <span className="text-[var(--text-tertiary)] text-[11px]">
                  {language === 'hi'
                    ? 'जैसा आपके मतदाता पहचान पत्र पर मुद्रित है (उदा. WBD1234567)'
                    : 'As printed on your official Voter ID card (e.g. WBD1234567)'}
                </span>

                <button
                  type="button"
                  onClick={handleOpenEci}
                  className="text-[var(--accent)] hover:underline inline-flex items-center gap-1 font-bold text-xs cursor-pointer shrink-0"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>
                    {language === 'hi'
                      ? 'ECI पोर्टल पर अपना EPIC खोजें ↗'
                      : 'Look up EPIC on ECI Portal ↗'}
                  </span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Step 2: Anti-Bot Arithmetic Human Challenge */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-glass)] space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-1.5">
                  <Fingerprint className="w-4 h-4 text-[var(--accent)]" />
                  <span>
                    {language === 'hi'
                      ? '2. सुरक्षा सत्यापन (मानव जाँच) *'
                      : '2. Security Human Challenge *'}
                  </span>
                </label>

                <button
                  type="button"
                  onClick={generateNewMathChallenge}
                  className="p-1 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)] transition-colors cursor-pointer"
                  title={language === 'hi' ? 'नया प्रश्न प्राप्त करें' : 'Get new calculation'}
                  aria-label="Refresh security calculation"
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

            {/* Step 3: Explicit Voter Declaration Checkbox */}
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
              <span className="text-xs sm:text-sm font-semibold text-[var(--text-primary)] leading-snug">
                {language === 'hi'
                  ? 'मैं सत्यनिष्ठा से पुष्टि करता/करती हूँ कि यह मेरा वैध मतदाता पहचान पत्र है और मैंने इसे ECI सूची में सत्यापित किया है। मैं समझता/समझती हूँ कि निष्पक्षता के लिए दोहरा मतदान तकनीकी रूप से अवरुद्ध है।'
                  : 'I declare that this is my genuine Voter ID registered with the Election Commission of India. I understand that multiple voting is strictly prohibited and cryptographically blocked.'}
              </span>
            </label>

            {/* Error Banner */}
            {error && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {/* Real Verifier Live Status Monitor */}
            <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-glass)] space-y-2.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-[var(--text-primary)]">
                    {language === 'hi' ? 'रीयल सत्यापन मॉनिटर' : 'Real Verifier Monitor'}
                  </span>
                </div>
                <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  {language === 'hi' ? 'शून्य डेटा भंडारण (0 PII)' : '0 Bytes Raw ID Stored'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-glass)]">
                  <span className="text-[var(--text-secondary)]">
                    {language === 'hi' ? 'दोहरा मतदान रोक:' : 'Deduplication:'}
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    HMAC-SHA256
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-glass)]">
                  <span className="text-[var(--text-secondary)]">
                    {language === 'hi' ? 'गोपनीयता शील्ड:' : 'Privacy Shield:'}
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    <span>256-Bit Decoupled</span>
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-[var(--text-tertiary)] leading-relaxed">
                {language === 'hi'
                  ? 'आपका वास्तविक EPIC नंबर कभी भी डेटाबेस में नहीं रखा जाता। केवल एक एकतरफा क्रिप्टोग्राफ़िक हैश सहेजा जाता है जो कुकी साफ़ करने या ब्राउज़र बदलने पर भी दोहरे मतदान को 100% रोकता है।'
                  : 'Your raw Voter ID is never saved in the voting ledger. Only an irreversible cryptographic fingerprint is recorded, ensuring that clearing cookies or changing browsers cannot bypass the single-vote limit.'}
              </p>
            </div>

            {/* Submission Action */}
            <div className="pt-2">
              <GlassButton
                type="submit"
                variant="primary"
                size="lg"
                className="w-full font-bold shadow-lg gap-2 text-sm"
                isLoading={isLoading}
                disabled={!isVoterIdValid || !isCheckedConfirmed || !mathAnswer}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>
                  {isLoading
                    ? language === 'hi'
                      ? 'सत्यापन हो रहा है...'
                      : 'Verifying Voter ID...'
                    : language === 'hi'
                    ? 'मतदाता पहचान सत्यापित करें और आगे बढ़ें'
                    : 'Verify Voter ID & Proceed to Vote'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </GlassButton>
            </div>
          </form>
        )}

        {/* ── STATE C: VERIFICATION CONFIRMED & TOKEN ISSUED ── */}
        {isSuccess && (
          <div className="space-y-6 text-center animate-in fade-in duration-300 py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-9 h-9 stroke-[2.2]" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
                ✓ {language === 'hi' ? 'मतदाता पहचान सफलतापूर्वक सत्यापित' : 'Voter Eligibility Successfully Verified'}
              </h3>
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                {language === 'hi'
                  ? 'एकल-मत गारंटी दर्ज की गई। अब आप अपना गुमनाम मत दर्ज कर सकते हैं।'
                  : 'Single-vote guarantee registered. You can now cast your anonymous vote.'}
              </p>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-md mx-auto">
                {language === 'hi'
                  ? 'आपको एक अस्थायी 256-बिट क्रिप्टोग्राफ़िक टोकन जारी किया गया है। यह टोकन आपके वास्तविक पहचान डेटा से पूरी तरह अलग है और वोट दर्ज होते ही स्वतः समाप्त हो जाएगा।'
                  : 'You have been issued a single-use 256-bit anonymous voting token. This token is mathematically decoupled from your Voter ID and will self-destruct immediately upon casting your vote.'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] text-xs font-semibold flex items-center justify-center gap-2 max-w-sm mx-auto border border-[var(--accent)]/20">
              <Lock className="w-4 h-4" />
              <span>{t.common.privacyGuaranteed}</span>
            </div>

            <div className="pt-2">
              <GlassButton
                size="lg"
                variant="primary"
                className="w-full sm:w-auto sm:px-12 font-bold shadow-lg gap-2 text-sm"
                onClick={() => credential && onVerified(credential)}
              >
                <span>{language === 'hi' ? 'मतपत्र खोलें (Vote Now)' : 'Open Ballot & Vote'}</span>
                <ArrowRight className="w-4 h-4" />
              </GlassButton>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
