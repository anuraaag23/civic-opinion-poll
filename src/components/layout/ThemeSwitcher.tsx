'use client';

import React, { useSyncExternalStore } from 'react';
import { useTheme } from '@/lib/theme/context';
import { Sun, Moon } from 'lucide-react';

function subscribeMounted() {
  return () => {};
}

function getMountedSnapshot() {
  return true;
}

function getMountedServerSnapshot() {
  return false;
}

export function ThemeSwitcher({ className = '' }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribeMounted, getMountedSnapshot, getMountedServerSnapshot);

  const isDark = mounted ? resolvedTheme === 'dark' : true;

  const toggleTheme = () => {
    const nextTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`w-[38px] h-[38px] min-w-[38px] min-h-[38px] rounded-xl inline-flex items-center justify-center transition-all cursor-pointer active:scale-95 bg-[var(--bg-surface)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] text-[var(--text-secondary)] border border-[var(--border-glass)] shadow-2xs select-none shrink-0 ${className}`}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400 transition-transform duration-200 hover:rotate-45" aria-hidden="true" />
      ) : (
        <Moon className="w-4 h-4 text-indigo-600 transition-transform duration-200 hover:-rotate-12" aria-hidden="true" />
      )}
    </button>
  );
}
