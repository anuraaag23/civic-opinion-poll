'use client';

import React from 'react';
import { useI18n } from '@/lib/i18n/context';

export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { language, setLanguage } = useI18n();

  return (
    <div
      className={`inline-flex items-center p-1 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] shadow-sm text-xs font-semibold ${className}`}
      role="group"
      aria-label="Language selector"
    >
      <div className="pl-2 pr-1 text-[var(--text-tertiary)] flex items-center">
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
          <path d="M2 12h20" />
        </svg>
      </div>
      <button
        onClick={() => setLanguage('en')}
        className={`px-2.5 py-1.5 rounded-lg min-h-[36px] min-w-[36px] flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
          language === 'en'
            ? 'bg-[var(--accent)] text-white shadow-xs font-bold'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
        }`}
        aria-pressed={language === 'en'}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage('hi')}
        className={`px-2.5 py-1.5 rounded-lg min-h-[36px] min-w-[42px] flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
          language === 'hi'
            ? 'bg-[var(--accent)] text-white shadow-xs font-bold'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
        }`}
        aria-pressed={language === 'hi'}
      >
        हिन्दी
      </button>
    </div>
  );
}
