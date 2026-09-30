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
    neutral: 'bg-[var(--border-glass)] text-[var(--text-secondary)] border-[var(--border-glass)]',
    success: 'bg-[var(--success-soft)] text-[var(--success)] border-[var(--success-soft)]',
    accent: 'bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent-soft)]',
    warning: 'bg-[var(--warning-soft)] text-[var(--warning)] border-[var(--warning-soft)]',
    error: 'bg-[var(--error-soft)] text-[var(--error)] border-[var(--error-soft)]',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-medium',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border backdrop-blur-md ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
