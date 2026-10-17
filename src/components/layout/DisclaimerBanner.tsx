'use client';

import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';

interface DisclaimerBannerProps {
  compact?: boolean;
  className?: string;
}

export function DisclaimerBanner({ compact = false, className = '' }: DisclaimerBannerProps) {
  const { t, language } = useI18n();

  if (compact) {
    return (
      <div
        className={`w-full py-2 px-4 bg-[var(--accent-soft)] border-b border-[var(--border-glass)] text-xs text-[var(--text-secondary)] flex items-center justify-center text-center gap-2 ${className}`}
        role="note"
      >
        <ShieldAlert className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
        <span>{t.common.shortDisclaimer}</span>
      </div>
    );
  }

  return (
    <div
      className={`glass-panel p-4 sm:p-5 border-l-4 border-l-[var(--accent)] bg-[var(--bg-glass)] ${className}`}
      role="note"
    >
      <div className="flex items-center gap-3.5">
        <div className="p-2.5 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] shrink-0 flex items-center justify-center">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="space-y-1 max-w-3xl">
          <h2 className="text-xs font-bold text-[var(--text-secondary)]">
            {language === 'hi' ? 'कानूनी अस्वीकरण एवं गैर-संबद्धता सूचना' : 'Legal Disclaimer & Non-Affiliation Notice'}
          </h2>
          <p className="text-sm leading-relaxed text-[var(--text-primary)] font-medium max-w-3xl">
            {t.common.officialDisclaimer}
          </p>
        </div>
      </div>
    </div>
  );
}
