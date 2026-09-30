'use client';

import React from 'react';

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function GlassInput({
  label,
  error,
  helperText,
  className = '',
  id,
  ...props
}: GlassInputProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-medium text-[var(--text-secondary)] tracking-wide uppercase"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`glass-input px-4 py-3 text-sm placeholder:text-[var(--text-tertiary)] ${
          error ? 'border-[var(--error)] focus:border-[var(--error)] focus:ring-[var(--error-soft)]' : ''
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-[var(--error)] font-medium mt-0.5">{error}</p>}
      {!error && helperText && (
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">{helperText}</p>
      )}
    </div>
  );
}
