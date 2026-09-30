'use client';

import React, { useState } from 'react';
import { Poll, Party } from '@/lib/types';
import { useI18n } from '@/lib/i18n/context';
import { PartyCard } from './PartyCard';
import { VoteConfirmationSheet } from './VoteConfirmationSheet';
import { GlassBadge } from '@/components/ui/GlassBadge';
import { Lock, AlertCircle } from 'lucide-react';

interface VotingViewProps {
  poll: Poll;
  anonymousToken: string;
  onVoteSuccess: () => void;
}

export function VotingView({ poll, anonymousToken, onVoteSuccess }: VotingViewProps) {
  const { t, language } = useI18n();
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const pollTitle = language === 'hi' ? poll.title_hi : poll.title_en;

  const selectedOption = poll.options.find((opt) => opt.id === selectedOptionId);
  const selectedParty: Party | null = selectedOption?.party || null;

  const handleSelectOption = (optionId: string) => {
    setSelectedOptionId(optionId);
    setSubmitError(null);
    setIsConfirmationOpen(true);
  };

  const handleConfirmVote = async () => {
    if (!selectedOptionId || !anonymousToken) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const idempotencyKey = `vote-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pollId: poll.id,
          optionId: selectedOptionId,
          anonymousToken,
          idempotencyKey,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsConfirmationOpen(false);
        onVoteSuccess();
      } else {
        setSubmitError(data.error || 'Failed to submit response. Please try again.');
      }
    } catch {
      setSubmitError('Connection interrupted. Please verify connectivity and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header & Progress Indicator */}
      <div className="text-center space-y-3">
        <div className="inline-flex flex-wrap items-center justify-center gap-2">
          <GlassBadge variant="success">
            <span>✓ {t.verification.selfVerificationConfirmed}</span>
          </GlassBadge>
          <GlassBadge variant="accent">
            <Lock className="w-3 h-3 text-[var(--accent)]" />
            <span>{t.voting.headerProgress}</span>
          </GlassBadge>
          <GlassBadge variant="neutral">
            <span>{t.common.privacyGuaranteed}</span>
          </GlassBadge>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight">
          {pollTitle}
        </h2>

        <p className="text-sm sm:text-base font-semibold text-[var(--accent)] max-w-lg mx-auto">
          {t.voting.question}
        </p>

        {/* Pre-Voting Independent Poll Disclaimer */}
        <div data-lg-variant="clear" className="lg-card lg-surface p-3 rounded-xl border border-[var(--border-glass)] text-xs text-[var(--text-secondary)] text-center leading-relaxed max-w-lg mx-auto">
          {t.verification.pollPreVoteDisclaimer}
        </div>
      </div>

      {submitError && (
        <div className="p-4 rounded-xl bg-[var(--error-soft)] border border-[var(--error)] text-xs text-[var(--error)] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      {/* List of Party Options (Single column, neutral ordering) */}
      <div className="space-y-3" role="radiogroup" aria-label={t.voting.question}>
        {poll.options.map((option) => (
          <PartyCard
            key={option.id}
            party={option.party}
            optionId={option.id}
            isSelected={selectedOptionId === option.id}
            onSelect={handleSelectOption}
            disabled={isSubmitting}
          />
        ))}
      </div>

      {/* Confirmation Bottom Sheet */}
      <VoteConfirmationSheet
        isOpen={isConfirmationOpen}
        onClose={() => setIsConfirmationOpen(false)}
        selectedParty={selectedParty}
        onConfirm={handleConfirmVote}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
