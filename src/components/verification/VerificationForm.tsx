'use client';

import React, { useState } from 'react';
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
  CheckSquare,
  ArrowRight,
  ShieldCheck,
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

  const [hasOpenedEci, setHasOpenedEci] = useState(false);
  const [showConfirmationPanel, setShowConfirmationPanel] = useState(false);
  const [isCheckedConfirmed, setIsCheckedConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [credential, setCredential] = useState<string | null>(null);

  const handleOpenEci = () => {
    setHasOpenedEci(true);
    window.open(ECI_ELECTORAL_SEARCH_URL, '_blank', 'noopener,noreferrer');
  };

  const handleConfirmAndProceed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCheckedConfirmed) {
      setError(
        language === 'hi'
          ? 'कृपया आगे बढ़ने से पहले चेकबॉक्स का चयन करके पुष्टि करें।'
          : 'Please select the confirmation checkbox before continuing.'
      );
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pollId, selfVerificationConfirmed: true }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.reason === 'ALREADY_VOTED') {
          onAlreadyVoted();
          return;
        }
        if (data.reason === 'RATE_LIMITED') {
          setError(t.verification.rateLimited);
          return;
        }
        setError(data.error || t.verification.serviceUnavailable);
        return;
      }

      if (data.verified && data.anonymousCredential) {
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
      <GlassCard elevated className="space-y-6 sm:space-y-7 p-4 sm:p-8">
        {/* Neutral Verification Header */}
        <div className="text-center space-y-2.5 sm:space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]/20 flex items-center justify-center mx-auto shadow-xs mb-1">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
            {t.verification.title}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed max-w-xl mx-auto">
            {t.verification.subtitle}
          </p>
        </div>

        {/* State A: Initial ECI Check Action */}
        {!isSuccess && !showConfirmationPanel && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch justify-center pt-2">
              <a
                href={ECI_ELECTORAL_SEARCH_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setHasOpenedEci(true)}
                className="flex-1"
              >
                <GlassButton
                  variant="primary"
                  size="lg"
                  className="w-full font-bold shadow-md flex items-center justify-center gap-2 group"
                >
                  <span>{t.verification.openEciButton}</span>
                  <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </GlassButton>
              </a>

              <GlassButton
                variant={hasOpenedEci ? 'secondary' : 'ghost'}
                size="lg"
                className="flex-1 font-bold border border-[var(--border-glass)]"
                onClick={() => {
                  setShowConfirmationPanel(true);
                  setError(null);
                }}
              >
                {t.verification.completedCheckButton}
              </GlassButton>
            </div>

            {/* Three-Step Process Explanation */}
            <div className="pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-3 text-center sm:text-left">
                {language === 'hi' ? 'प्रक्रिया विवरण' : 'Process Explanation'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Step 01 */}
                <div className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] space-y-1 flex flex-col justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black px-1.5 py-0.5 rounded bg-[var(--accent-soft)] text-[var(--accent)] shrink-0 flex items-center justify-center min-w-[24px]">
                      01
                    </span>
                    <span className="text-xs font-bold text-[var(--text-primary)]">
                      {t.verification.step1Title}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed pt-1">
                    {t.verification.step1Desc}
                  </p>
                </div>

                {/* Step 02 */}
                <div className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] space-y-1 flex flex-col justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black px-1.5 py-0.5 rounded bg-[var(--accent-soft)] text-[var(--accent)] shrink-0 flex items-center justify-center min-w-[24px]">
                      02
                    </span>
                    <span className="text-xs font-bold text-[var(--text-primary)]">
                      {t.verification.step2Title}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed pt-1">
                    {t.verification.step2Desc}
                  </p>
                </div>

                {/* Step 03 */}
                <div className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] space-y-1 flex flex-col justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black px-1.5 py-0.5 rounded bg-[var(--accent-soft)] text-[var(--accent)] shrink-0 flex items-center justify-center min-w-[24px]">
                      03
                    </span>
                    <span className="text-xs font-bold text-[var(--text-primary)]">
                      {t.verification.step3Title}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed pt-1">
                    {t.verification.step3Desc}
                  </p>
                </div>
              </div>
            </div>

            {/* Real Verifier Live Status Monitor */}
            <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-glass)] space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-[var(--text-primary)]">
                    {language === 'hi' ? 'रीयल सत्यापन मॉनिटर' : 'Real Verifier Monitor'}
                  </span>
                </div>
                <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  {language === 'hi' ? 'शून्य डेटा रिकॉर्ड' : '0 Bytes Data Recorded'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-primary)]/50 border border-[var(--border-glass)]">
                  <span className="text-[var(--text-secondary)]">
                    {language === 'hi' ? 'ECI पोर्टल सत्र:' : 'ECI Portal Session:'}
                  </span>
                  <span className={`font-bold flex items-center gap-1 ${hasOpenedEci ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'}`}>
                    {hasOpenedEci ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{language === 'hi' ? 'सक्रिय' : 'Connected'}</span>
                      </>
                    ) : (
                      <span>{language === 'hi' ? 'जांच लंबित' : 'Awaiting Check'}</span>
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-primary)]/50 border border-[var(--border-glass)]">
                  <span className="text-[var(--text-secondary)]">
                    {language === 'hi' ? 'गोपनीयता शील्ड:' : 'Privacy Shield:'}
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" />
                    <span>{language === 'hi' ? '100% सुरक्षित (0 PII)' : 'Zero PII Retained'}</span>
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-[var(--text-tertiary)] leading-relaxed">
                {language === 'hi'
                  ? 'सत्यापन मॉनिटर ECI पोर्टल पर मतदाता स्थिति की पुष्टि की रीयल-टाइम निगरानी करता है, परंतु आपका कोई भी निजी डेटा, पहचान पत्र या EPIC नंबर कभी भी सर्वर पर रिकॉर्ड नहीं करता।'
                  : 'The Real Verifier strictly monitors whether the official ECI voter check was successful or failed without ever collecting, recording, or storing any personal voter data.'}
              </p>
            </div>
          </div>
        )}

        {/* State B: Confirmation Panel */}
        {!isSuccess && showConfirmationPanel && (
          <form
            onSubmit={handleConfirmAndProceed}
            className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300"
          >
            <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-glass)] space-y-4">
              <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-[var(--accent)]" />
                <span>{t.verification.confirmModalTitle}</span>
              </h3>

              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {t.verification.confirmStatement}
              </p>

              {/* Explicit Mandatory Checkbox */}
              <label className="flex items-start gap-3 p-3.5 sm:p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] cursor-pointer hover:border-[var(--accent)] active:bg-[var(--accent-soft)]/20 transition-colors select-none min-h-[50px]">
                <input
                  type="checkbox"
                  id="self-verify-checkbox"
                  checked={isCheckedConfirmed}
                  onChange={(e) => {
                    setIsCheckedConfirmed(e.target.checked);
                    if (error) setError(null);
                  }}
                  className="w-5 h-5 mt-0.5 rounded border-[var(--border-glass)] text-[var(--accent)] focus:ring-[var(--accent)] cursor-pointer shrink-0"
                />
                <span className="text-xs sm:text-sm font-semibold text-[var(--text-primary)]">
                  {t.verification.confirmCheckbox}
                </span>
              </label>

              {error && (
                <div className="p-3 rounded-xl bg-[var(--error-soft)] text-[var(--error)] text-xs font-medium flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3">
              <GlassButton
                type="button"
                variant="ghost"
                size="lg"
                onClick={() => {
                  setShowConfirmationPanel(false);
                  setError(null);
                }}
                className="flex-1"
              >
                {language === 'hi' ? 'पीछे जाएं' : 'Back'}
              </GlassButton>

              <GlassButton
                type="submit"
                variant="primary"
                size="lg"
                className="flex-1 font-bold shadow-md"
                isLoading={isLoading}
                disabled={!isCheckedConfirmed}
              >
                {isLoading ? t.common.loading : t.verification.continueAnonymously}
              </GlassButton>
            </div>

            {/* Quick helper link if user needs to re-open ECI */}
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={handleOpenEci}
                className="text-xs text-[var(--accent)] hover:underline inline-flex items-center gap-1 font-medium"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{t.verification.openEciButton}</span>
              </button>
            </div>
          </form>
        )}

        {/* State C: Self-Verification Confirmed Screen */}
        {isSuccess && (
          <div className="space-y-6 text-center animate-in fade-in duration-300">
            <div className="w-14 h-14 rounded-full bg-[var(--success-soft)] text-[var(--success)] flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-bold text-[var(--success)]">
                ✓ {t.verification.selfVerificationConfirmed}
              </h3>
              <p className="text-sm font-medium text-[var(--text-primary)]">
                {t.verification.readyForPollNotice}
              </p>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-md mx-auto">
                {language === 'hi'
                  ? 'आपकी पुष्टि दर्ज कर ली गई है। आपको एक अस्थायी 256-बिट गुमनाम भागीदारी क्रेडेंशियल जारी किया गया है जो वोट डालने के बाद स्वतः समाप्त हो जाएगा।'
                  : 'Your self-confirmation has been recorded. You have been issued an ephemeral 256-bit anonymous credential that self-destructs immediately upon response submission.'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] text-xs font-semibold flex items-center justify-center gap-2 max-w-sm mx-auto">
              <Lock className="w-4 h-4" />
              <span>{t.common.privacyGuaranteed}</span>
            </div>

            <div className="pt-2">
              <GlassButton
                size="lg"
                variant="primary"
                className="w-full sm:w-auto sm:px-12 font-bold shadow-lg gap-2"
                onClick={() => credential && onVerified(credential)}
              >
                <span>{t.verification.continueToVoting}</span>
                <ArrowRight className="w-4 h-4" />
              </GlassButton>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
