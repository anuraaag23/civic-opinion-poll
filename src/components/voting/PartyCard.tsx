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

  return (
    <div
      role="radio"
      aria-checked={isSelected}
      aria-label={`${partyName} (${party.short_name})`}
      tabIndex={disabled ? -1 : 0}
      onClick={() => !disabled && onSelect(optionId)}
      onKeyDown={handleKeyDown}
      className={`glass-panel p-4 sm:p-5 flex items-center justify-between gap-4 transition-all duration-150 cursor-pointer select-none ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${
        isSelected
          ? 'border-[var(--accent)] ring-2 ring-[var(--accent)]/30 bg-[var(--bg-glass-elevated)] shadow-md'
          : 'hover:border-[var(--border-glass)] hover:bg-[var(--bg-glass-elevated)]'
      }`}
    >
      {/* Party Symbol & Information */}
      <div className="flex items-center gap-4 sm:gap-5 min-w-0">
        {/* Verified Party Symbol Container */}
        <div
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl p-2.5 bg-[var(--bg-surface)] border border-[var(--border-glass)] flex items-center justify-center shrink-0 shadow-xs"
          title={symbolAlt}
        >
          <div
            className="w-full h-full flex items-center justify-center"
            dangerouslySetInnerHTML={{ __html: party.symbol_svg }}
          />
        </div>

        {/* Text Metadata */}
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[var(--border-glass)] text-[var(--text-secondary)]">
              {party.short_name}
            </span>
          </div>
          <h4 className="text-base sm:text-lg font-bold text-[var(--text-primary)] truncate">
            {partyName}
          </h4>
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
