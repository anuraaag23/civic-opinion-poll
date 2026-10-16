'use client';

import React from 'react';
import { useTheme } from '@/lib/theme/context';
import { Sun, Moon, Laptop } from 'lucide-react';

export function ThemeSwitcher({ className = '' }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  const isDark = theme === 'dark';
  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark');

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-xl min-w-[38px] min-h-[38px] flex items-center justify-center transition-all cursor-pointer active:scale-95 bg-[var(--bg-surface)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] text-[var(--text-secondary)] border border-[var(--border-glass)] shadow-sm ${className}`}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400" />
      ) : (
        <Moon className="w-4 h-4 text-slate-700 dark:text-slate-200" />
      )}
    </button>
  );
}
