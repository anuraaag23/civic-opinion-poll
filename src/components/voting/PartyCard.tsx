'use client';

import React from 'react';
import { Party } from '@/lib/types';
import { useI18n } from '@/lib/i18n/context';
import { Check, Vote } from 'lucide-react';

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
      className={`group relative overflow-hidden rounded-2xl p-3.5 sm:p-5 flex items-center justify-between gap-3 sm:gap-4 transition-all duration-200 cursor-pointer select-none active:scale-[0.98] ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${
        isSelected
          ? 'bg-gradient-to-br from-blue-500/[0.08] via-transparent to-blue-600/[0.05] dark:from-blue-500/[0.12] dark:to-blue-900/[0.1] border-blue-500/80 dark:border-blue-400/80 ring-2 ring-blue-500/25 dark:ring-blue-400/20 shadow-[0_8px_30px_-6px_rgba(37,99,235,0.22),inset_0_1px_1px_rgba(255,255,255,0.5)] dark:shadow-[0_12px_36px_-6px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(147,197,253,0.3)]'
          : 'bg-white/70 dark:bg-[#131722]/80 hover:bg-white dark:hover:bg-[#181d2a] border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 shadow-xs hover:shadow-md'
      } border backdrop-blur-xl`}
    >
      {/* Specular top rim highlight */}
      <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent ${isSelected ? 'via-blue-400/60 dark:via-blue-300/60' : 'via-white/60 dark:via-white/15'} to-transparent pointer-events-none`} />

      {/* Party Symbol & Information */}
      <div className="flex items-center gap-3.5 sm:gap-5 min-w-0">
        {/* Verified Authentic High-Quality Party Logo */}
        <div
          className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl p-1.5 sm:p-2 bg-white dark:bg-white/95 border border-slate-200/90 dark:border-white/20 flex items-center justify-center shrink-0 shadow-sm overflow-hidden group-hover:scale-[1.02] transition-transform duration-200"
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
            <div className="w-full h-full flex items-center justify-center bg-[var(--bg-surface)] text-[var(--accent)]">
              <Vote className="w-6 h-6 text-[var(--accent)]" />
            </div>
          )}
        </div>

        {/* Text Metadata */}
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/[0.08] text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-white/10">
              {party.short_name}
            </span>
            {party.candidate_role_en && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]/30 leading-none">
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
          className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full border flex items-center justify-center transition-all duration-200 ${
            isSelected
              ? 'bg-gradient-to-br from-blue-500 to-blue-600 border-blue-400 text-white shadow-[0_2px_10px_rgba(37,99,235,0.45)] scale-105'
              : 'border-slate-300 dark:border-white/20 bg-slate-100/80 dark:bg-white/[0.05] group-hover:border-slate-400 dark:group-hover:border-white/30'
          }`}
        >
          {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
        </div>
      </div>
    </div>
  );
}
