'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { GlassBadge } from './GlassBadge';

export interface GlassDropdownOption<T extends string = string> {
  value: T;
  label: string;
  sublabel?: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeVariant?: 'neutral' | 'success' | 'accent' | 'warning' | 'error';
}

export interface GlassDropdownProps<T extends string = string> {
  value: T;
  onChange: (value: T) => void;
  options: GlassDropdownOption<T>[];
  label?: string;
  helperText?: string;
  placeholder?: string;
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  size?: 'sm' | 'md';
  align?: 'left' | 'right';
  id?: string;
}

export function GlassDropdown<T extends string = string>({
  value,
  onChange,
  options,
  label,
  helperText,
  placeholder = 'Select an option...',
  icon: DefaultIcon,
  disabled = false,
  className = '',
  buttonClassName = '',
  menuClassName = '',
  size = 'md',
  align = 'left',
  id,
}: GlassDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close on outside click or Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const sizeClasses = {
    sm: 'py-1.5 px-3 text-xs rounded-xl min-h-[34px]',
    md: 'py-2.5 px-3.5 text-xs sm:text-sm rounded-xl min-h-[42px]',
  };

  const IconToRender = selectedOption?.icon || DefaultIcon;

  return (
    <div ref={containerRef} className={`relative text-left ${className}`} id={id}>
      {label && (
        <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
          {label}
        </label>
      )}

      {/* Main Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full flex items-center justify-between gap-2.5 text-left transition-all cursor-pointer border shadow-2xs select-none ${
          sizeClasses[size]
        } ${
          isOpen
            ? 'border-[var(--accent)] bg-[var(--bg-surface)] ring-2 ring-[var(--accent-soft)]'
            : 'border-[var(--border-glass)] bg-[var(--bg-surface)] hover:bg-[var(--bg-glass-elevated)] hover:border-[var(--accent)]/50 text-[var(--text-primary)]'
        } ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''} ${buttonClassName}`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {IconToRender && (
            <IconToRender className="w-4 h-4 text-[var(--accent)] shrink-0" />
          )}
          <span className="truncate font-semibold text-[var(--text-primary)]">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.badge && (
            <GlassBadge
              variant={selectedOption.badgeVariant || 'neutral'}
              size="sm"
              className="shrink-0"
            >
              {selectedOption.badge}
            </GlassBadge>
          )}
        </div>

        <div
          className={`shrink-0 text-[var(--text-secondary)] transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[var(--accent)]' : ''
          }`}
        >
          <ChevronDown className="w-4 h-4" />
        </div>
      </button>

      {/* Dropdown Floating Popover */}
      {isOpen && (
        <div
          role="listbox"
          tabIndex={-1}
          className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} top-full mt-1.5 z-50 min-w-full w-max max-w-[min(90vw,24rem)] bg-[var(--bg-surface)] dark:bg-[#131720] border border-[var(--border-glass)] rounded-2xl shadow-2xl backdrop-blur-xl p-1.5 space-y-1 max-h-72 overflow-y-auto animate-in fade-in zoom-in-95 duration-150 ${menuClassName}`}
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            const OptionIcon = option.icon;

            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between gap-3 px-3 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[var(--accent-soft)] text-[var(--accent)] font-bold ring-1 ring-[var(--accent)]/30'
                    : 'text-[var(--text-primary)] hover:bg-[var(--accent-soft)]/50 hover:text-[var(--accent)]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  {OptionIcon && (
                    <OptionIcon
                      className={`w-4 h-4 shrink-0 ${
                        isSelected ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]'
                      }`}
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <span className="block truncate leading-tight font-medium">
                      {option.label}
                    </span>
                    {option.sublabel && (
                      <span className="block text-[10px] text-[var(--text-tertiary)] truncate mt-0.5 font-normal">
                        {option.sublabel}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {option.badge && (
                    <GlassBadge
                      variant={option.badgeVariant || 'neutral'}
                      size="sm"
                    >
                      {option.badge}
                    </GlassBadge>
                  )}
                  {isSelected && (
                    <Check className="w-4 h-4 text-[var(--accent)] shrink-0 animate-in zoom-in-75 duration-100" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {helperText && (
        <p className="text-[11px] text-[var(--text-tertiary)] mt-1">{helperText}</p>
      )}
    </div>
  );
}
