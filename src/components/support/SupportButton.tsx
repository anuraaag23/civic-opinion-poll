'use client';

import { Coffee } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { BUYMEACHAI_CONFIG } from '@/lib/buymeachai/config';

interface SupportButtonProps {
  className?: string;
  variant?: 'primary' | 'secondary' | 'compact' | 'pill';
}

export function SupportButton({
  className = '',
  variant = 'primary',
}: SupportButtonProps) {
  const { language } = useI18n();

  const label =
    language === 'hi'
      ? 'समर्थन करें'
      : 'Support Developer';

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
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 transition-all cursor-pointer ${className}`}
        title={titleText}
      >
        <Coffee className="w-3.5 h-3.5" />
        <span>{label}</span>
      </a>
    );
  }

  if (variant === 'pill') {
    return (
      <a
        href={BUYMEACHAI_CONFIG.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs sm:text-sm font-bold shadow-sm hover:shadow-md transition-all cursor-pointer ${className}`}
        title={titleText}
      >
        <Coffee className="w-4 h-4" />
        <span>{label}</span>
      </a>
    );
  }

  return (
    <a
      href={BUYMEACHAI_CONFIG.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/35 text-amber-700 dark:text-amber-300 text-xs sm:text-sm font-bold transition-all cursor-pointer ${className}`}
      title={titleText}
    >
      <Coffee className="w-4 h-4" />
      <span>{titleText}</span>
    </a>
  );
}
