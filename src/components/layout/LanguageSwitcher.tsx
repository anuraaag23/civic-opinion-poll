'use client';

import React from 'react';
import { useI18n } from '@/lib/i18n/context';
import { Globe } from 'lucide-react';

export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { language, setLanguage } = useI18n();

  return (
    <div
      className={`inline-flex items-center p-1 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] shadow-sm text-xs font-semibold ${className}`}
      role="group"
      aria-label="Language selector"
    >
      <div className="pl-2 pr-1 text-[var(--text-tertiary)] flex items-center">
        <Globe className="w-3.5 h-3.5" />
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
