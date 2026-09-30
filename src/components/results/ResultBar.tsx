'use client';

import React from 'react';
import { OptionResult } from '@/lib/types';
import { useI18n } from '@/lib/i18n/context';

interface ResultBarProps {
  result: OptionResult;
  maxPercentage: number;
}

export function ResultBar({ result, maxPercentage }: ResultBarProps) {
  const { language } = useI18n();

  const partyName = language === 'hi' ? result.party_name_hi : result.party_name_en;

  return (
    <div className="space-y-2 p-3 sm:p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] shadow-xs transition-all hover:border-[var(--accent)]/40">
      <div className="flex items-center justify-between gap-4">
        {/* Party Identity */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg p-1.5 bg-white dark:bg-white/95 border border-[var(--border-glass)] flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
            {result.logo_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={result.logo_url}
                alt={result.party_short_name}
                className="w-full h-full object-contain"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                dangerouslySetInnerHTML={{ __html: result.symbol_svg }}
              />
            )}
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-[var(--border-glass)] text-[var(--text-secondary)]">
              {result.party_short_name}
            </span>
            <span className="text-sm font-bold text-[var(--text-primary)] truncate">
              {partyName}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-baseline gap-2 shrink-0 text-right">
          <span className="text-sm sm:text-base font-black text-[var(--text-primary)]">
            {result.percentage.toFixed(1)}%
          </span>
          <span className="text-xs text-[var(--text-tertiary)]">
            ({result.count.toLocaleString()})
          </span>
        </div>
      </div>

      {/* Clean 2D Horizontal Bar */}
      <div className="w-full h-2.5 rounded-full bg-[var(--border-glass)] overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] transition-all duration-500 ease-out"
          style={{
            width: `${Math.min(
              100,
              Math.max(2, maxPercentage > 0 ? (result.percentage / maxPercentage) * 100 : result.percentage)
            )}%`,
          }}
        />
      </div>
    </div>
  );
}
