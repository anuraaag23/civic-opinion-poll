'use client';

import React from 'react';
import { Coffee } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { BUYMEACHAI_CONFIG } from '@/lib/buymeachai/config';

interface SupportButtonProps {
  className?: string;
  variant?: 'primary' | 'secondary' | 'compact' | 'pill';
  showLabelOnMobile?: boolean;
}

export function SupportButton({
  className = '',
  variant = 'primary',
  showLabelOnMobile = true,
}: SupportButtonProps) {
  const { language } = useI18n();

  const label =
    language === 'hi'
      ? 'डेवलपर का समर्थन करें'
      : 'Support Developer';

  const shortLabel =
    language === 'hi'
      ? 'समर्थन'
      : 'Support';

  const titleText =
    language === 'hi'
      ? 'इस वेबसाइट को जीवित रखने के लिए डेवलपर का समर्थन करें'
      : 'support to developer for make alive this website';

  if (variant === 'compact') {
    return (
      <a
        href={BUYMEACHAI_CONFIG.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`group inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-95 border border-amber-300/40 select-none ${className}`}
        title={titleText}
        aria-label={label}
      >
        <span className="relative flex items-center justify-center shrink-0">
          <Coffee className="w-3.5 h-3.5 text-white animate-cup-tilt" />
        </span>
        <span className={`text-white drop-shadow-2xs ${showLabelOnMobile ? 'inline' : 'hidden sm:inline'}`}>
          {label}
        </span>
      </a>
    );
  }

  if (variant === 'pill') {
    return (
      <a
        href={BUYMEACHAI_CONFIG.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`group inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white text-xs sm:text-sm font-black shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-95 border border-amber-300/40 select-none ${className}`}
        title={titleText}
        aria-label={label}
      >
        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0 shadow-inner">
          <Coffee className="w-3.5 h-3.5 text-white animate-cup-tilt" />
        </div>
        <span className="text-white drop-shadow-2xs">{label}</span>
      </a>
    );
  }

  return (
    <a
      href={BUYMEACHAI_CONFIG.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white text-xs sm:text-sm font-black shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-95 border border-amber-300/40 select-none ${className}`}
      title={titleText}
      aria-label={label}
    >
      <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center shrink-0 shadow-inner">
        <Coffee className="w-4 h-4 text-white animate-cup-tilt" />
      </div>
      <span className="text-white drop-shadow-2xs">{label}</span>
    </a>
  );
}

