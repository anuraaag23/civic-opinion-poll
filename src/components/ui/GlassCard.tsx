'use client';

import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  elevated?: boolean;
  interactive?: boolean;
  variant?: 'clear' | 'regular';
  className?: string;
}

export function GlassCard({
  children,
  elevated = false,
  interactive = false,
  variant = 'clear',
  className = '',
  ...props
}: GlassCardProps) {
  const baseClass = elevated ? 'glass-panel-elevated' : 'glass-panel';
  const interactiveClass = interactive ? 'glass-card-interactive cursor-pointer' : '';

  return (
    <div
      className={`lg-card lg-surface ${baseClass} ${interactiveClass} p-6 sm:p-8 ${className}`}
      data-lg-variant={variant}
      {...props}
    >
      {children}
    </div>
  );
}
