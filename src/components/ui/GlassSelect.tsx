'use client';

import React, { forwardRef, SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';

export { GlassDropdown } from './GlassDropdown';
export type { GlassDropdownOption, GlassDropdownProps } from './GlassDropdown';

export interface GlassSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const GlassSelect = forwardRef<HTMLSelectElement, GlassSelectProps>(
  ({ className = '', label, error, helperText, children, disabled, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
            {label}
          </label>
        )}

        <div className="relative w-full">
          <select
            ref={ref}
            disabled={disabled}
            className={`w-full glass-select pl-3.5 pr-10 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] text-xs sm:text-sm text-[var(--text-primary)] font-semibold transition-all duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs ${
              error ? 'border-red-500 focus:ring-red-500/30' : ''
            } ${className}`}
            {...props}
          >
            {children}
          </select>

          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--text-secondary)]">
            <ChevronDown className="w-4 h-4 transition-transform" />
          </div>
        </div>

        {error ? (
          <p className="text-xs text-red-500 font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-[11px] text-[var(--text-tertiary)]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

GlassSelect.displayName = 'GlassSelect';
