'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/lib/i18n/context';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeSwitcher } from './ThemeSwitcher';
import { Menu, X, BarChart3, Vote, HelpCircle, ShieldCheck } from 'lucide-react';

export function GlassNavbar() {
  const { t, language } = useI18n();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/polls', label: t.nav.polls, icon: Vote },
    { href: '/polls/national-opinion-poll-2029/results', label: t.nav.results, icon: BarChart3 },
    { href: '/how-it-works', label: t.nav.howItWorks, icon: HelpCircle },
    { href: '/privacy', label: t.nav.privacy, icon: ShieldCheck },
  ];

  const isActive = (href: string) => {
    if (href === '/polls' && pathname === '/polls') return true;
    if (href !== '/polls' && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 w-full px-4 sm:px-6 lg:px-8 pt-3 pb-2">
      <nav className="max-w-7xl mx-auto glass-panel px-4 sm:px-6 py-3 flex items-center justify-between transition-all">
        {/* Logo and Brand */}
        <Link
          href="/"
          className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-[var(--accent)] rounded-xl"
        >
          {/* Original Neutral Civic Logo */}
          <div className="w-9 h-9 rounded-xl bg-[var(--accent)] flex items-center justify-center text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
            <svg
              className="w-5 h-5 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-[var(--text-primary)]">
              {language === 'hi' ? 'सिविक पोल' : 'CivicPoll'}
              <span className="text-[var(--accent)] font-semibold text-xs ml-1 px-1.5 py-0.5 rounded-md bg-[var(--accent-soft)]">
                {language === 'hi' ? 'भारत' : 'India'}
              </span>
            </span>
            <span className="text-[10px] tracking-wide text-[var(--text-secondary)] font-medium">
              {language === 'hi' ? 'स्वतंत्र जनमत' : 'Independent Civic Opinion'}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-[var(--accent-soft)] text-[var(--accent)] font-semibold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-glass-elevated)]'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Controls: Language, Theme & Mobile Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher />
          <ThemeSwitcher className="hidden sm:inline-flex" />

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-glass)] transition-colors"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden max-w-7xl mx-auto mt-2 glass-panel p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? 'bg-[var(--accent-soft)] text-[var(--accent)] font-semibold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
          <div className="pt-3 border-t border-[var(--border-glass)] flex items-center justify-between">
            <span className="text-xs text-[var(--text-secondary)] font-medium">
              {t.common.theme}
            </span>
            <ThemeSwitcher />
          </div>
        </div>
      )}
    </header>
  );
}
