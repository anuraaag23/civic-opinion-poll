'use client';

import React from 'react';
import { useI18n } from '@/lib/i18n/context';
import { ShieldCheck, Lock, Sparkles } from 'lucide-react';

export function TopSloganBanner() {
  const { language } = useI18n();

  return (
    <div className="w-full bg-gradient-to-r from-[var(--accent)] via-[#1D46B0] to-[var(--accent)] text-white py-1.5 sm:py-2 px-3 sm:px-4 shadow-sm border-b border-white/10 select-none">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 sm:gap-4 text-center sm:text-left">
        {/* Main Slogan */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0 animate-pulse hidden sm:inline" />
          <p className="text-[11px] sm:text-xs md:text-sm font-bold tracking-tight sm:tracking-wide leading-tight">
            {language === 'hi'
              ? 'आपकी राय, आपका मत — जिसे यहां कभी बदला, दबाया या ट्रेस नहीं किया जा सकता।'
              : 'Your Vote, Your Opinion — It Can Never Be Changed, Tampered, or Traced Here.'}
          </p>
        </div>

        {/* Supporting Guarantees */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-[10px] sm:text-[11px] text-white/90 font-semibold tracking-tight">
          <span className="inline-flex items-center gap-1">
            <Lock className="w-3 h-3 text-emerald-300 shrink-0" />
            {language === 'hi' ? 'शून्य आईडी भंडारण' : 'Zero ID Stored'}
          </span>
          <span className="opacity-60">•</span>
          <span className="inline-flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-cyan-300 shrink-0" />
            {language === 'hi' ? '1 व्यक्ति 1 मत' : '1 Person 1 Vote'}
          </span>
          <span className="hidden sm:inline opacity-60">•</span>
          <span className="hidden sm:inline text-amber-200">
            {language === 'hi' ? 'सत्यापित वास्तविक नागरिक' : 'Verified Real Citizens'}
          </span>
        </div>
      </div>
    </div>
  );
}
