'use client';

import React from 'react';
import { useTheme } from '@/lib/theme/context';
import { Sun, Moon, Laptop } from 'lucide-react';

export function ThemeSwitcher({ className = '' }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className={`inline-flex items-center p-1 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] shadow-sm text-xs font-medium ${className}`}
      role="group"
      aria-label="Theme selector"
    >
      <button
        onClick={() => setTheme('light')}
        className={`p-1.5 rounded-lg transition-all ${
          theme === 'light'
            ? 'bg-[var(--accent-soft)] text-[var(--accent)] font-semibold'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
        }`}
        title="Light Mode"
        aria-label="Light Mode"
        aria-pressed={theme === 'light'}
      >
        <Sun className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`p-1.5 rounded-lg transition-all ${
          theme === 'dark'
            ? 'bg-[var(--accent-soft)] text-[var(--accent)] font-semibold'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
        }`}
        title="Dark Mode"
        aria-label="Dark Mode"
        aria-pressed={theme === 'dark'}
      >
        <Moon className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => setTheme('system')}
        className={`p-1.5 rounded-lg transition-all ${
          theme === 'system'
            ? 'bg-[var(--accent-soft)] text-[var(--accent)] font-semibold'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
        }`}
        title="System Preference"
        aria-label="System Preference"
        aria-pressed={theme === 'system'}
      >
        <Laptop className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
