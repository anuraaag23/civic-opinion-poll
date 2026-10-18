'use client';

import React from 'react';

interface GlassBadgeProps {
  variant?: 'neutral' | 'success' | 'accent' | 'warning' | 'error';
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}

export function GlassBadge({
  variant = 'neutral',
  children,
  className = '',
  size = 'md',
}: GlassBadgeProps) {
  const variantStyles = {
    neutral: 'bg-[var(--bg-surface)] text-[var(--text-primary)] border-[var(--border-glass)] shadow-2xs font-semibold',
    success: 'bg-[var(--success-soft)] text-[var(--success)] border-[var(--success-soft)] font-bold',
    accent: 'bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent-soft)] font-bold',
    warning: 'bg-[var(--warning-soft)] text-[var(--warning)] border-[var(--warning-soft)] font-bold',
    error: 'bg-[var(--error-soft)] text-[var(--error)] border-[var(--error-soft)] font-bold',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span
      className={`inline-flex items-center justify-center gap-1.5 rounded-full border backdrop-blur-md leading-none select-none whitespace-nowrap shrink-0 ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
