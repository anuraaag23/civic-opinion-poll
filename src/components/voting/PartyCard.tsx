'use client';

import React from 'react';
import { Party } from '@/lib/types';
import { useI18n } from '@/lib/i18n/context';
import { Check } from 'lucide-react';

interface PartyCardProps {
  party: Party;
  optionId: string;
  isSelected: boolean;
  onSelect: (optionId: string) => void;
  disabled?: boolean;
}

export function PartyCard({
  party,
  optionId,
  isSelected,
  onSelect,
  disabled = false,
}: PartyCardProps) {
  const { language } = useI18n();

  const partyName = language === 'hi' ? party.name_hi : party.name_en;
  const symbolAlt = language === 'hi' ? party.symbol_alt_hi : party.symbol_alt_en;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onSelect(optionId);
    }
  };

  const [imgError, setImgError] = React.useState(false);

  return (
    <div
      role="radio"
      aria-checked={isSelected}
      aria-label={`${partyName} (${party.short_name})`}
      tabIndex={disabled ? -1 : 0}
      onClick={() => !disabled && onSelect(optionId)}
      onKeyDown={handleKeyDown}
      className={`glass-panel p-3 sm:p-5 flex items-center justify-between gap-3 sm:gap-4 transition-all duration-150 cursor-pointer select-none active:scale-[0.98] ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${
        isSelected
          ? 'border-[var(--accent)] ring-2 ring-[var(--accent)]/30 bg-[var(--bg-glass-elevated)] shadow-md'
          : 'hover:border-[var(--border-glass)] hover:bg-[var(--bg-glass-elevated)]'
      }`}
    >
      {/* Party Symbol & Information */}
      <div className="flex items-center gap-3 sm:gap-5 min-w-0">
        {/* Verified Authentic High-Quality Party Logo - Highly Visible */}
        <div
          className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl p-1 sm:p-1.5 bg-white dark:bg-white/95 border border-[var(--border-glass)] flex items-center justify-center shrink-0 shadow-sm overflow-hidden"
          title={symbolAlt}
        >
          {party.logo_url && !imgError ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={party.logo_url}
              alt={symbolAlt}
              className="w-full h-full object-contain drop-shadow-xs"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              dangerouslySetInnerHTML={{ __html: party.symbol_svg }}
            />
          )}
        </div>

        {/* Text Metadata */}
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[var(--border-glass)] text-[var(--text-secondary)]">
              {party.short_name}
            </span>
            {party.candidate_role_en && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]/30">
                {language === 'hi' ? party.candidate_role_hi || party.candidate_role_en : party.candidate_role_en}
              </span>
            )}
          </div>
          <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)] leading-snug">
            {partyName}
          </h3>
          {(party.candidate_name_en || party.candidate_name_hi) && (
            <div className="text-xs font-semibold text-[var(--accent)] flex items-center gap-1.5 pt-0.5">
              <span className="text-[11px] text-[var(--text-secondary)] font-normal">
                {language === 'hi' ? 'उम्मीदवार:' : 'Candidate:'}
              </span>
              <span className="truncate font-bold">
                {language === 'hi'
                  ? party.candidate_name_hi || party.candidate_name_en
                  : party.candidate_name_en}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Neutral Selection Indicator */}
      <div className="shrink-0 flex items-center">
        <div
          className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${
            isSelected
              ? 'bg-[var(--accent)] border-[var(--accent)] text-white shadow-xs'
              : 'border-[var(--border-glass)] bg-[var(--bg-surface)]'
          }`}
        >
          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </div>
      </div>
    </div>
  );
}
