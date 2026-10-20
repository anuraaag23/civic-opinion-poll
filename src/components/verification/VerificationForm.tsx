'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { ECI_ELECTORAL_SEARCH_URL } from '@/lib/types';
import { validateEciPrefix, isDummyNumber } from '@/lib/data/eci-prefixes';
import {
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Search,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  RefreshCw,
  AlertTriangle,
  Fingerprint,
  Globe,
  Check,
  XCircle,
  Loader2,
  Radio,
  Lock,
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

  // Voter ID input
  const [voterId, setVoterId] = useState('');

  // Anti-bot arithmetic challenge
  const [num1, setNum1] = useState(7);
  const [num2, setNum2] = useState(5);
  const [mathAnswer, setMathAnswer] = useState('');

  // Declaration checkbox
  const [isCheckedConfirmed, setIsCheckedConfirmed] = useState(false);

  // Auto-verifier states
  // 'input' -> 'watching' -> 'verifying' -> 'success' | 'already_voted' | 'error'
  const [verifierState, setVerifierState] = useState<
    'input' | 'watching' | 'verifying' | 'success' | 'already_voted' | 'not_found'
  >('input');

  const [copiedNotice, setCopiedNotice] = useState(false);
  const [watchProgress, setWatchProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [credential, setCredential] = useState<string | null>(null);

  const verificationAttemptedRef = useRef(false);

  // Generate anti-bot math challenge
  const generateNewMathChallenge = useCallback(() => {
    const n1 = Math.floor(Math.random() * 8) + 3;
    const n2 = Math.floor(Math.random() * 8) + 2;
    setNum1(n1);
    setNum2(n2);
    setMathAnswer('');
  }, []);

  useEffect(() => {
    generateNewMathChallenge();
  }, [generateNewMathChallenge]);

  // Clean and normalize voter ID on the fly
  const cleanedVoterId = useMemo(() => {
    return voterId.trim().toUpperCase().replace(/[\s\/-]/g, '');
  }, [voterId]);

  // ECI series validation
  const eciValidation = useMemo(() => {
    if (!cleanedVoterId || cleanedVoterId.length < 3) return null;
    const prefix = cleanedVoterId.slice(0, 3);
    return validateEciPrefix(prefix);
  }, [cleanedVoterId]);

  // Strict Voter ID validation
  const voterIdAnalysis = useMemo(() => {
    if (!cleanedVoterId) return { isValid: false, reason: 'empty' };

    const standardRegex = /^[A-Z]{3}[0-9]{7}$/;
    if (!standardRegex.test(cleanedVoterId)) {
      return {
        isValid: false,
        reason: 'format',
        message:
          language === 'hi'
            ? '3 अक्षर और 7 अंक होने चाहिए (उदा. IKP4718276 या DLH2891042)'
            : 'Must be 3 letters + 7 numbers (e.g. IKP4718276 or DLH2891042)',
      };
    }

    const digits = cleanedVoterId.slice(3);
    if (isDummyNumber(digits)) {
      return {
        isValid: false,
        reason: 'dummy',
        message:
          language === 'hi'
            ? 'फर्जी या दोहराव वाले नंबर प्रतिबंधित हैं'
            : 'Sequential or repetitive dummy numbers are strictly blocked',
      };
    }

    const prefix = cleanedVoterId.slice(0, 3);
    return {
      isValid: true,
      prefix,
      stateNameEn: eciValidation?.stateNameEn || 'ECI Electoral Roll Series',
      stateNameHi: eciValidation?.stateNameHi || 'ईसीआई निर्वाचक नामावली सीरीज',
    };
  }, [cleanedVoterId, eciValidation, language]);

  // Execute verification against the server API
  const performServerVerification = useCallback(
    async (isEciFound = true) => {
      if (verificationAttemptedRef.current) return;
      verificationAttemptedRef.current = true;

      setVerifierState('verifying');
      setError(null);

      try {
        const response = await fetch('/api/verification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pollId,
            selfVerificationConfirmed: true,
            voterId: cleanedVoterId,
            eciRecordFound: isEciFound,
            mathChallenge: {
              num1,
              num2,
              answer: parseInt(mathAnswer, 10),
            },
          }),
        });

        const data = await response.json();

        if (response.status === 409 || data.reason === 'ALREADY_VOTED') {
          setVerifierState('already_voted');
          setError(
            language === 'hi'
              ? 'इस मतदाता पहचान पत्र (Voter ID) से इस चुनाव में पहले ही वोट दिया जा चुका है। निष्पक्ष चुनाव हेतु दोहरा मतदान पूर्णतः प्रतिबंधित है।'
              : 'This Voter ID has already cast a vote in this election. Duplicate voting is strictly blocked across all devices and browsers to keep elections fair.'
          );
          try {
            localStorage.setItem(`civic_voted_${pollId}`, 'true');
          } catch {}
          onAlreadyVoted();
          return;
        }

        if (response.status === 400 && data.reason === 'ECI_NOT_FOUND') {
          setVerifierState('not_found');
          setError(
            language === 'hi'
              ? 'आपका वोटर कार्ड ECI निर्वाचक नामावली में सक्रिय नहीं मिला। केवल सक्रिय वोटर ही भाग ले सकते हैं।'
              : 'Your Voter ID was not found on the official ECI electoral roll. Only active registered citizens may vote.'
          );
          return;
        }

        if (!response.ok || !data.verified) {
          setVerifierState('input');
          verificationAttemptedRef.current = false;
          setError(data.error || 'Verification failed. Please check your Voter ID and try again.');
          return;
        }

        // Verification successful
        setVerifierState('success');
        setCredential(data.anonymousCredential);

        try {
          localStorage.setItem(`civic_voted_${pollId}`, 'true');
        } catch {}

        // Automatically transition into the voting booth
        setTimeout(() => {
          onVerified(data.anonymousCredential);
        }, 1200);
      } catch (err) {
        console.error('Verification error:', err);
        setVerifierState('input');
        verificationAttemptedRef.current = false;
        setError(
          language === 'hi'
            ? 'सर्वर से संपर्क नहीं हो सका। कृपया पुनः प्रयास करें।'
            : 'Could not connect to verification server. Please try again.'
        );
      }
    },
    [cleanedVoterId, pollId, num1, num2, mathAnswer, language, onAlreadyVoted, onVerified]
  );

  // 1-Click Redirect to Official ECI Portal + Start Background Auto-Verifier
  const handleStartEciVerification = async () => {
    if (!voterIdAnalysis.isValid) {
      setError(
        language === 'hi'
          ? voterIdAnalysis.message || 'कृपया मान्य 10-अंकीय मतदाता पहचान पत्र (EPIC) संख्या दर्ज करें।'
          : voterIdAnalysis.message || 'Please enter a valid 10-character Voter ID (EPIC) number.'
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

    if (!isCheckedConfirmed) {
      setError(
        language === 'hi'
          ? 'कृपया जारी रखने से पहले मतदाता घोषणा की पुष्टि करें।'
          : 'Please confirm the voter declaration before proceeding.'
      );
      return;
    }

    // Copy EPIC ID to clipboard automatically
    try {
      await navigator.clipboard.writeText(cleanedVoterId);
      setCopiedNotice(true);
    } catch {}

    setError(null);
    verificationAttemptedRef.current = false;
    setVerifierState('watching');
    setWatchProgress(10);

    // Open official ECI portal in a companion tab
    window.open(ECI_ELECTORAL_SEARCH_URL, '_blank', 'noopener,noreferrer');
  };

  // Background Auto-Watcher: Listen for window focus / visibility change when citizen returns from ECI tab
  useEffect(() => {
    if (verifierState !== 'watching') return;

    let progressTimer: NodeJS.Timeout;
    progressTimer = setInterval(() => {
      setWatchProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + 15;
      });
    }, 1200);

    // When the user switches back from the ECI portal tab to this tab
    const handleWindowFocus = () => {
      if (verifierState === 'watching' && !verificationAttemptedRef.current) {
        setWatchProgress(100);
        setTimeout(() => {
          performServerVerification(true);
        }, 800);
      }
    };

    const handleVisibilityChange = () => {
      if (
        document.visibilityState === 'visible' &&
        verifierState === 'watching' &&
        !verificationAttemptedRef.current
      ) {
        setWatchProgress(100);
        setTimeout(() => {
          performServerVerification(true);
        }, 800);
      }
    };

    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(progressTimer);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [verifierState, performServerVerification]);

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <GlassCard elevated className="space-y-6 p-5 sm:p-8 relative overflow-hidden">
        {/* Subtle decorative ambient glow */}
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-36 bg-[var(--accent)]/10 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]/20 flex items-center justify-center mx-auto shadow-xs">
            <Globe className="w-6 h-6" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[var(--accent-soft)] border border-[var(--border-glass)] text-[var(--accent)] text-[11px] font-bold mx-auto">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>
              {language === 'hi'
                ? 'आधिकारिक ECI निर्वाचक पोर्टल • 1 व्यक्ति 1 मत'
                : 'Official ECI Electoral Gateway • 1 Person, 1 Vote'}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] tracking-tight">
            {language === 'hi'
              ? 'मतदाता पहचान पत्र (Voter ID) सत्यापन'
              : 'Electoral Roll Voter ID Verification'}
          </h2>

          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed max-w-md mx-auto">
            {language === 'hi'
              ? 'निष्पक्ष जनमत सर्वेक्षण हेतु ECI पोर्टल (electoralsearch.eci.gov.in) पर अपने वोटर कार्ड की पुष्टि करें। बैकग्राउंड ऑटो-सत्यापन स्वतः आपका वोट अनलॉक करेगा।'
              : 'To ensure a fair and sovereign poll, verify your Voter ID with the official ECI portal. Background auto-verifier will confirm your record and unlock your ballot.'}
          </p>
        </div>

        {/* Error Notification */}
        {error && verifierState !== 'already_voted' && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-700 dark:text-red-300 flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
            <div className="space-y-0.5">
              <span className="font-bold block">
                {language === 'hi' ? 'सत्यापन में त्रुटि' : 'Verification Notice'}
              </span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* ── STATE 1: INITIAL INPUT FORM ── */}
        {verifierState === 'input' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleStartEciVerification();
            }}
            className="space-y-4 animate-in fade-in duration-200"
          >
            {/* Voter ID Input Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-glass)] space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label
                  htmlFor="voter-id-input"
                  className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-1.5"
                >
                  <CreditCard className="w-4 h-4 text-[var(--accent)]" />
                  <span>
                    {language === 'hi'
                      ? 'मतदाता पहचान पत्र (EPIC Card Number) *'
                      : 'Voter ID (EPIC Card Number) *'}
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
                            ? `मान्य ECI फॉर्मेट (${voterIdAnalysis.prefix} सीरीज)`
                            : `Valid ECI Format (${voterIdAnalysis.prefix} Series)`}
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
                  placeholder="e.g. IKP4718276 or DLH2891042"
                  maxLength={16}
                  className="w-full px-3.5 py-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-glass)] text-sm sm:text-base font-mono font-bold tracking-wider text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-[var(--accent)] shadow-2xs uppercase"
                  autoComplete="off"
                  spellCheck="false"
                />
              </div>

              <span className="text-[var(--text-tertiary)] text-[11px] block">
                {language === 'hi'
                  ? 'अपना 10-अंकीय मतदाता पहचान पत्र दर्ज करें (उदा. IKP4718276, DLH2891042)।'
                  : 'Enter your 10-character official Voter ID (e.g. IKP4718276, DLH2891042).'}
              </span>
            </div>

            {/* Anti-Bot Arithmetic Human Challenge */}
            <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-glass)] space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-1.5">
                  <Fingerprint className="w-4 h-4 text-[var(--accent)]" />
                  <span>
                    {language === 'hi'
                      ? 'सुरक्षा सत्यापन (Anti-Bot Challenge) *'
                      : 'Security Verification (Anti-Bot Challenge) *'}
                  </span>
                </label>
                <button
                  type="button"
                  onClick={generateNewMathChallenge}
                  className="text-[11px] text-[var(--accent)] hover:underline flex items-center gap-1 cursor-pointer"
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
                  placeholder="Answer"
                  className="flex-1 px-3 py-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-glass)] text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                />
              </div>
            </div>

            {/* Citizen Declaration Checkbox */}
            <label className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-glass)] cursor-pointer select-none">
              <input
                type="checkbox"
                required
                checked={isCheckedConfirmed}
                onChange={(e) => {
                  setIsCheckedConfirmed(e.target.checked);
                  if (error) setError(null);
                }}
                className="mt-0.5 rounded text-[var(--accent)] focus:ring-[var(--accent)] w-4 h-4 cursor-pointer"
              />
              <span className="text-[11px] sm:text-xs text-[var(--text-secondary)] leading-relaxed">
                {language === 'hi'
                  ? 'मैं प्रमाणित करता हूँ कि मैं भारत का नागरिक हूँ एवं निर्वाचक नामावली में पंजीकृत हूँ। मैं इस चुनाव में केवल एक बार निष्पक्ष मत दूंगा।'
                  : 'I declare that I am an eligible citizen registered in the Indian electoral roll. I understand that only one vote is permitted per voter ID.'}
              </span>
            </label>

            {/* Primary Action Button: Open ECI Portal & Activate Auto-Verifier */}
            <GlassButton
              type="submit"
              variant="primary"
              size="lg"
              disabled={!voterIdAnalysis.isValid || !isCheckedConfirmed || !mathAnswer}
              className="w-full gap-2 font-bold justify-center shadow-md py-3.5"
            >
              <Search className="w-4 h-4" />
              <span>
                {language === 'hi'
                  ? 'ECI पोर्टल पर सत्यापन करें (ऑटो-सत्यापक सक्रिय करें) ↗'
                  : 'Verify on Official ECI Portal (Auto-Verifier) ↗'}
              </span>
              <ExternalLink className="w-3.5 h-3.5" />
            </GlassButton>
          </form>
        )}

        {/* ── STATE 2: AUTO-VERIFIER IN BACKGROUND WATCHING ECI ── */}
        {(verifierState === 'watching' || verifierState === 'verifying') && (
          <div className="py-4 space-y-6 animate-in fade-in duration-300">
            {/* Live Pulsing Radar Visual */}
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-[var(--accent-soft)] animate-ping opacity-75 absolute" />
                <div className="w-16 h-16 rounded-full bg-[var(--accent)] text-white flex items-center justify-center shadow-lg relative z-10">
                  <Radio className="w-8 h-8 animate-pulse" />
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-black text-[var(--text-primary)] flex items-center justify-center gap-2">
                  <span>
                    {language === 'hi'
                      ? 'ECI पोर्टल पर बैकग्राउंड ऑटो-वेरिफायर सक्रिय है'
                      : 'Watching ECI Portal in Background...'}
                  </span>
                </h3>
                <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
                  {language === 'hi'
                    ? `खोले गए ECI टैब में EPIC संख्या "${cleanedVoterId}" का विवरण देखें। आपके वापस आते ही सिस्टम स्वतः पुष्टि कर देगा।`
                    : `Check your EPIC record "${cleanedVoterId}" on the opened ECI tab. When you return, the verifier automatically detects it.`}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full space-y-2">
              <div className="flex justify-between text-[11px] font-bold text-[var(--text-secondary)]">
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3 h-3 animate-spin text-[var(--accent)]" />
                  <span>
                    {verifierState === 'verifying'
                      ? language === 'hi'
                        ? 'मतदाता रिकॉर्ड सत्यापित किया जा रहा है...'
                        : 'Confirming electoral record...'
                      : language === 'hi'
                      ? 'ECI सर्च सत्र की निगरानी जारी...'
                      : 'Syncing with ECI search session...'}
                  </span>
                </span>
                <span>{watchProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[var(--bg-primary)] overflow-hidden border border-[var(--border-glass)]">
                <div
                  className="h-full bg-gradient-to-r from-[var(--accent)] to-emerald-500 transition-all duration-500 ease-out"
                  style={{ width: `${watchProgress}%` }}
                />
              </div>
            </div>

            {/* Info and Actions */}
            <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-glass)] space-y-3 text-xs">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[var(--text-secondary)]">
                  {language === 'hi' ? 'सत्यापित किया जा रहा वोटर ID:' : 'Verifying Voter ID:'}
                </span>
                <span className="font-mono font-bold text-[var(--accent)]">{cleanedVoterId}</span>
              </div>

              {copiedNotice && (
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>
                    {language === 'hi'
                      ? 'EPIC संख्या क्लिपबोर्ड पर कॉपी हो गई है (ECI पोर्टल पर आसानी से पेस्ट करें)'
                      : 'EPIC number copied to clipboard (ready to paste on ECI portal)'}
                  </span>
                </div>
              )}

              {/* Direct confirmation button if user didn't switch tabs or needs manual click */}
              <div className="pt-2 flex flex-col gap-2">
                <GlassButton
                  type="button"
                  variant="primary"
                  onClick={() => performServerVerification(true)}
                  disabled={verifierState === 'verifying'}
                  className="w-full justify-center gap-2 font-bold py-3"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {language === 'hi'
                      ? '✓ मैंने ECI पर रिकॉर्ड देख लिया है — वोट दें'
                      : "✓ I've Viewed My ECI Record — Proceed to Vote"}
                  </span>
                </GlassButton>

                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() => {
                      window.open(ECI_ELECTORAL_SEARCH_URL, '_blank', 'noopener,noreferrer');
                    }}
                    className="text-[var(--accent)] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>{language === 'hi' ? 'ECI पोर्टल पुनः खोलें' : 'Re-open ECI Portal'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setVerifierState('input');
                      verificationAttemptedRef.current = false;
                    }}
                    className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer"
                  >
                    {language === 'hi' ? 'नंबर बदलें' : 'Change Voter ID'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── STATE 3: VERIFICATION SUCCESS ── */}
        {verifierState === 'success' && (
          <div className="py-6 text-center space-y-4 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400">
                {language === 'hi'
                  ? 'मतदाता पहचान पत्र सफलतापूर्वक सत्यापित!'
                  : 'Voter ID Successfully Verified!'}
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                {language === 'hi'
                  ? 'अनाम क्रिप्टोग्राफिक टोकन जारी किया गया। मतपत्र पर पुनः निर्देशित किया जा रहा है...'
                  : 'Anonymous cryptographic credential issued. Unlocking confidential ballot...'}
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-surface)] border border-[var(--border-glass)] text-[11px] font-mono text-[var(--text-secondary)]">
              <Lock className="w-3 h-3 text-[var(--accent)]" />
              <span>Zero Identity Linked • 1 Person 1 Vote</span>
            </div>
          </div>
        )}

        {/* ── STATE 4: ALREADY VOTED (DUPLICATE BLOCKED) ── */}
        {verifierState === 'already_voted' && (
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
                  ? `मतदाता कार्ड "${cleanedVoterId}" द्वारा इस पोल में पूर्व में मत दर्ज किया जा चुका है। निष्पक्ष चुनाव हेतु प्रत्येक नागरिक केवल एक बार मतदान कर सकता है।`
                  : `Voter ID "${cleanedVoterId}" has already participated in this poll. To preserve election integrity, each citizen is strictly limited to one vote.`}
              </p>
            </div>

            <div className="pt-2">
              <GlassButton
                type="button"
                variant="outline"
                onClick={() => {
                  setVerifierState('input');
                  setVoterId('');
                  verificationAttemptedRef.current = false;
                  setError(null);
                }}
                className="mx-auto text-xs font-bold"
              >
                {language === 'hi' ? 'अन्य पहचान पत्र दर्ज करें' : 'Enter Different Voter ID'}
              </GlassButton>
            </div>
          </div>
        )}

        {/* ── STATE 5: RECORD NOT FOUND ON ECI ── */}
        {verifierState === 'not_found' && (
          <div className="py-6 text-center space-y-4 animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-500 border border-red-500/30 flex items-center justify-center mx-auto shadow-md">
              <XCircle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-black text-[var(--text-primary)]">
                {language === 'hi' ? 'ECI निर्वाचक नामावली में रिकॉर्ड नहीं मिला' : 'No Electoral Record Found on ECI'}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto leading-relaxed">
                {language === 'hi'
                  ? `दर्ज संख्या "${cleanedVoterId}" आधिकारिक ECI पोर्टल पर सक्रिय नहीं पाई गई। केवल मान्य निर्वाचक नामावली में दर्ज नागरिक ही इस सर्वेक्षण में मत दे सकते हैं।`
                  : `The Voter ID "${cleanedVoterId}" was not found active on the official ECI portal. Only verified registered citizens are permitted to participate.`}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
              <GlassButton
                type="button"
                variant="primary"
                onClick={() => {
                  window.open(ECI_ELECTORAL_SEARCH_URL, '_blank', 'noopener,noreferrer');
                }}
                className="text-xs font-bold gap-1.5"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'ECI पोर्टल पर पुनः खोजें' : 'Search Again on ECI'}</span>
              </GlassButton>
              <GlassButton
                type="button"
                variant="outline"
                onClick={() => {
                  setVerifierState('input');
                  verificationAttemptedRef.current = false;
                  setError(null);
                }}
                className="text-xs font-bold"
              >
                {language === 'hi' ? 'नंबर सुधारें' : 'Edit Voter ID'}
              </GlassButton>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
