'use client';

import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  elevated?: boolean;
  interactive?: boolean;
  className?: string;
}

export function GlassCard({
  children,
  elevated = false,
  interactive = false,
  className = '',
  ...props
}: GlassCardProps) {
  const baseClass = elevated ? 'glass-panel-elevated' : 'glass-panel';
  const interactiveClass = interactive ? 'glass-card-interactive cursor-pointer' : '';

  return (
    <div
      className={`${baseClass} ${interactiveClass} p-6 sm:p-8 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
