'use client';

import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassInput } from '@/components/ui/GlassInput';
import { GlassButton } from '@/components/ui/GlassButton';
import { ShieldCheck, CheckCircle2, Info, Lock } from 'lucide-react';

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
  const { t } = useI18n();
  const [epic, setEpic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [credential, setCredential] = useState<string | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleaned = epic.trim().toUpperCase().replace(/[\s-]/g, '');
    if (!/^[A-Z]{3}[0-9]{7}$/.test(cleaned)) {
      setError(t.verification.invalidFormat);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ epic: cleaned, pollId }),
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
        setError(t.verification.notFound);
        return;
      }

      if (data.verified && data.anonymousCredential) {
        setIsSuccess(true);
        setCredential(data.anonymousCredential);
      } else {
        setError(t.verification.notFound);
      }
    } catch {
      setError(t.verification.serviceUnavailable);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <GlassCard elevated className="space-y-6">
        {/* Verification Form Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center mx-auto mb-2">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            {t.verification.title}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
            {t.verification.subtitle}
          </p>
        </div>

        {/* Development Helper Notice */}
        <div className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] text-xs text-[var(--text-secondary)] flex items-start gap-2.5">
          <Info className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
          <p>{t.verification.testModeNotice}</p>
        </div>

        {!isSuccess ? (
          <form onSubmit={handleVerify} className="space-y-5">
            <GlassInput
              label={t.verification.epicLabel}
              placeholder={t.verification.epicPlaceholder}
              helperText={t.verification.epicHelp}
              value={epic}
              onChange={(e) => {
                setEpic(e.target.value.toUpperCase());
                if (error) setError(null);
              }}
              error={error || undefined}
              maxLength={12}
              autoComplete="off"
              autoFocus
              required
            />

            <GlassButton
              type="submit"
              size="lg"
              className="w-full font-bold shadow-md"
              isLoading={isLoading}
            >
              {isLoading ? t.verification.verifying : t.verification.verifyButton}
            </GlassButton>
          </form>
        ) : (
          /* Success Verified View - NO NAME, NO ADDRESS */
          <div className="space-y-6 text-center animate-in fade-in duration-300">
            <div className="w-14 h-14 rounded-full bg-[var(--success-soft)] text-[var(--success)] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-[var(--success)]">
                ✓ {t.common.verifiedBadge}
              </h3>
              <p className="text-sm font-medium text-[var(--text-primary)]">
                {t.verification.verifiedSuccess}
              </p>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-xs mx-auto">
                {t.verification.anonymousNotice}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] text-xs font-medium flex items-center justify-center gap-2">
              <Lock className="w-4 h-4" />
              <span>{t.common.privacyGuaranteed}</span>
            </div>

            <GlassButton
              size="lg"
              className="w-full font-bold shadow-md"
              onClick={() => credential && onVerified(credential)}
            >
              {t.verification.continueToVoting}
            </GlassButton>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
