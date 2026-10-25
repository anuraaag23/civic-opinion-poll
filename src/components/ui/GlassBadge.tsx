'use client';

import React from 'react';

interface GlassBadgeProps {
  variant?: 'neutral' | 'success' | 'accent' | 'warning' | 'error';
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
}

export function GlassBadge({
  variant = 'neutral',
  children,
  className = '',
  size = 'md',
  interactive = false,
}: GlassBadgeProps) {
  const variantStyles = {
    neutral:
      'bg-gradient-to-b from-white/[0.10] via-white/[0.04] to-black/[0.15] dark:from-white/[0.08] dark:via-white/[0.03] dark:to-white/[0.01] text-[var(--text-primary)] border-black/10 dark:border-white/[0.14] shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.22),0_2px_8px_rgba(0,0,0,0.16)] font-semibold',
    success:
      'bg-gradient-to-b from-emerald-500/[0.20] via-emerald-500/[0.08] to-emerald-950/[0.25] text-emerald-700 dark:text-emerald-300 border-emerald-400/35 dark:border-emerald-400/30 shadow-[inset_0_1px_1px_0_rgba(52,211,153,0.38),0_2px_10px_rgba(16,185,129,0.16)] font-bold',
    accent:
      'bg-gradient-to-b from-blue-500/[0.20] via-blue-500/[0.08] to-indigo-950/[0.25] text-blue-700 dark:text-blue-300 border-blue-400/35 dark:border-blue-400/30 shadow-[inset_0_1px_1px_0_rgba(96,165,250,0.38),0_2px_10px_rgba(37,99,235,0.16)] font-bold',
    warning:
      'bg-gradient-to-b from-amber-500/[0.20] via-amber-500/[0.08] to-amber-950/[0.25] text-amber-800 dark:text-amber-300 border-amber-400/35 dark:border-amber-400/30 shadow-[inset_0_1px_1px_0_rgba(251,191,36,0.38),0_2px_10px_rgba(245,158,11,0.16)] font-bold',
    error:
      'bg-gradient-to-b from-red-500/[0.20] via-red-500/[0.08] to-red-950/[0.25] text-red-700 dark:text-red-300 border-red-400/35 dark:border-red-400/30 shadow-[inset_0_1px_1px_0_rgba(248,113,113,0.38),0_2px_10px_rgba(239,68,68,0.16)] font-bold',
  };

  const sizeStyles = {
    sm: 'px-2.5 pt-[4px] pb-[3px] text-[11px] min-h-[24px]',
    md: 'px-3.5 pt-[5px] pb-[4px] text-xs min-h-[28px]',
    lg: 'px-4 pt-[6px] pb-[5px] text-sm min-h-[32px]',
  };

  return (
    <span
      className={`inline-flex items-center justify-center gap-1.5 rounded-full border backdrop-blur-xl backdrop-saturate-[180%] select-none whitespace-nowrap shrink-0 text-center leading-none tracking-tight [&>svg]:shrink-0 transition-all duration-200 ${
        interactive ? 'hover:scale-[1.03] active:scale-95 cursor-pointer' : 'hover:scale-[1.02]'
      } ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
