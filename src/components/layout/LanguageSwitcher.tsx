'use client';

import React from 'react';
import { useI18n } from '@/lib/i18n/context';

export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { language, setLanguage } = useI18n();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  const isEn = language === 'en';

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className={`h-[38px] px-2.5 sm:px-3 rounded-xl inline-flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 bg-[var(--bg-surface)] hover:bg-[var(--accent-soft)] hover:border-[var(--accent)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-glass)] shadow-2xs select-none shrink-0 ${className}`}
      title={isEn ? 'Switch to Hindi (हिन्दी में बदलें)' : 'Switch to English (Switch language)'}
      aria-label={isEn ? 'Switch to Hindi' : 'Switch to English'}
    >
      {/* Universal Translation Glyph Icon (A / अ) */}
      <span className="w-5 h-5 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center font-bold text-[10px] shrink-0 border border-[var(--accent)]/30">
        {isEn ? 'अ' : 'A'}
      </span>

      <span className="text-xs font-bold text-[var(--text-primary)] tracking-tight">
        {isEn ? 'हिन्दी' : 'English'}
      </span>

      {/* Mini Toggle indicator */}
      <span className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase hidden xs:inline">
        {isEn ? 'HI' : 'EN'}
      </span>
    </button>
  );
}
