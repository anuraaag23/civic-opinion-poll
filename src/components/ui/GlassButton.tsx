'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export function GlassButton({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  className = '',
  disabled,
  ...props
}: GlassButtonProps) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs font-medium rounded-lg min-h-[36px]',
    md: 'px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-xl min-h-[44px]',
    lg: 'px-5 sm:px-7 py-2.5 sm:py-3.5 text-sm sm:text-base font-bold rounded-2xl min-h-[48px]',
  };

  const variantClasses = {
    primary:
      'bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-sm border border-transparent',
    secondary:
      'bg-[var(--bg-surface)] hover:bg-[var(--bg-glass)] text-[var(--text-primary)] border border-[var(--border-glass)] shadow-sm',
    outline:
      'bg-transparent hover:bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]',
    ghost:
      'bg-transparent hover:bg-[var(--border-glass)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent',
    danger:
      'bg-[var(--error)] hover:opacity-90 text-white border border-transparent shadow-sm',
  };

  return (
    <button
      className={`glass-button-interactive inline-flex items-center justify-center transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin text-current" />}
      {children}
    </button>
  );
}
