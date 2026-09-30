'use client';

import React from 'react';
import { Party } from '@/lib/types';
import { useI18n } from '@/lib/i18n/context';
import { GlassModal } from '@/components/ui/GlassModal';
import { GlassButton } from '@/components/ui/GlassButton';
import { ShieldCheck } from 'lucide-react';

interface VoteConfirmationSheetProps {
  isOpen: boolean;
  onClose: () => void;
  selectedParty: Party | null;
  onConfirm: () => void;
  isSubmitting: boolean;
}

export function VoteConfirmationSheet({
  isOpen,
  onClose,
  selectedParty,
  onConfirm,
  isSubmitting,
}: VoteConfirmationSheetProps) {
  const { t, language } = useI18n();

  if (!selectedParty) return null;

  const partyName = language === 'hi' ? selectedParty.name_hi : selectedParty.name_en;

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title={t.voting.confirmTitle}
      isBottomSheetOnMobile={true}
    >
      <div className="space-y-6 pt-2">
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          {t.voting.confirmSubtitle}
        </p>

        {/* Selected Party Summary Card */}
        <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-glass)] flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl p-2 bg-white dark:bg-white/95 border border-[var(--border-glass)] flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
            {selectedParty.logo_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={selectedParty.logo_url}
                alt={selectedParty.short_name}
                className="w-full h-full object-contain"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                dangerouslySetInnerHTML={{ __html: selectedParty.symbol_svg }}
              />
            )}
          </div>
          <div className="space-y-0.5 min-w-0">
            <span className="text-xs text-[var(--text-tertiary)] uppercase font-semibold">
              {t.voting.confirmSelectedParty}
            </span>
            <h4 className="text-lg font-bold text-[var(--text-primary)] truncate">
              {partyName}
            </h4>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[var(--border-glass)] text-[var(--text-secondary)]">
              {selectedParty.short_name}
            </span>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="p-3.5 rounded-xl bg-[var(--accent-soft)] text-xs text-[var(--accent)] font-medium flex items-center gap-2.5 border border-[var(--accent)]/15">
          <ShieldCheck className="w-5 h-5 text-[var(--accent)] shrink-0" />
          <div className="space-y-0.5 min-w-0">
            <span className="font-bold block text-[var(--text-primary)]">
              {t.common.privacyGuaranteed}
            </span>
            <span className="text-[var(--text-secondary)]">
              {t.polls.rule2}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-center gap-3 pt-2">
          <GlassButton
            variant="ghost"
            size="md"
            className="w-full sm:w-auto"
            onClick={onClose}
            disabled={isSubmitting}
          >
            {t.voting.backButton}
          </GlassButton>
          <GlassButton
            size="lg"
            className="w-full sm:flex-1 font-bold shadow-md"
            onClick={onConfirm}
            isLoading={isSubmitting}
          >
            {isSubmitting ? t.voting.recording : t.voting.submitResponse}
          </GlassButton>
        </div>
      </div>
    </GlassModal>
  );
}
