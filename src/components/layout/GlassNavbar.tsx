'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/lib/i18n/context';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeSwitcher } from './ThemeSwitcher';
import { SupportButton } from '@/components/support/SupportButton';
import { BarChart3, HelpCircle, HeartHandshake, Globe, Building2, Vote, Mail } from 'lucide-react';

export function GlassNavbar() {
  const { t, language } = useI18n();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileMenuOpen(false);
  }

  // Close on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    if (mobileMenuOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const navLinks = [
    { href: '/pm', label: language === 'hi' ? 'PM जनमत' : 'PM Poll', icon: Globe },
    { href: '/cm', label: language === 'hi' ? 'CM जनमत' : 'CM Poll', icon: Building2 },
    { href: '/polls', label: language === 'hi' ? 'सभी जनमत' : 'All Polls', icon: Vote },
    { href: '/polls/national-opinion-poll-2029/results', label: t.nav.results, icon: BarChart3 },
    { href: '/how-it-works', label: t.nav.howItWorks, icon: HelpCircle },
    { href: '/about', label: language === 'hi' ? 'निर्माता' : 'About Creator', icon: HeartHandshake },
  ];

  const isActive = (href: string) => {
    if (href === pathname) return true;
    if (href !== '/' && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full px-3 sm:px-6 lg:px-8 pt-2 sm:pt-3 pb-1 sm:pb-2">
        <nav className="max-w-7xl mx-auto glass-panel px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between transition-all">
          {/* Logo and Brand - Fully Clickable to Home without outline */}
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 sm:gap-3 group outline-none focus:outline-none focus:ring-0 focus-visible:outline-none active:outline-none select-none rounded-xl min-w-0"
            aria-label="Mera Vote Home"
          >
            {/* Authentic Mera Vote 3D Glass Logo */}
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/90 dark:bg-white/10 border border-[var(--border-glass)] p-1 flex items-center justify-center shadow-xs transition-transform duration-200 group-hover:scale-105 shrink-0">
              <Image
                src="/meravote-logo.png"
                alt="Mera Vote Logo"
                width={40}
                height={40}
                className="w-full h-full object-contain"
                priority
              />
            </div>

            {/* Brand Title and Subtitle - Clean & Vertically Centered */}
            <div className="flex flex-col justify-center min-w-0">
              <span className="text-base sm:text-xl font-black tracking-tight text-[var(--text-primary)] leading-tight">
                {language === 'hi' ? 'मेरा वोट' : 'Mera Vote'}
              </span>
              <span className="text-[11px] sm:text-xs tracking-normal text-[var(--text-secondary)] font-medium truncate leading-snug">
                {language === 'hi' ? 'जनमत सर्वेक्षण' : 'Opinion Polls'}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm transition-all ${
                    active
                      ? 'bg-[var(--accent)] text-white font-bold shadow-xs'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-glass-elevated)] font-medium'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Controls: Language, Theme, & Mobile Toggle (No SupportButton in header to preserve clean layout on phones) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <LanguageSwitcher />
            <ThemeSwitcher className="hidden sm:inline-flex" />

            {/* Mobile Menu Button with 44x44px minimum touch target */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-glass)] active:scale-95 transition-all cursor-pointer"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="4" x2="20" y1="12" y2="12" />
                  <line x1="4" x2="20" y1="6" y2="6" />
                  <line x1="4" x2="20" y1="18" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </nav>

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden max-w-7xl mx-auto mt-2 glass-panel-elevated p-4 sm:p-5 space-y-3 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150 rounded-2xl border border-[var(--border-glass)] relative z-50">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 min-h-[48px] rounded-xl text-sm font-medium transition-all active:scale-[0.98] ${
                      active
                        ? 'bg-[var(--accent-soft)] text-[var(--accent)] font-bold shadow-xs'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Support Developer CTA in Drawer */}
            <div className="pt-2">
              <SupportButton variant="pill" className="w-full justify-center min-h-[48px]" />
            </div>

            {/* Clickable Mobile Email Contact (Zero Phone Numbers) */}
            <div className="pt-3 border-t border-[var(--border-glass)]">
              <a
                href="mailto:contact@meravote.in"
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] text-[var(--text-secondary)] hover:text-[var(--accent)] min-h-[44px] transition-colors"
                title="Email contact@meravote.in"
              >
                <Mail className="w-4 h-4 text-[var(--accent)]" />
                <span className="font-semibold text-xs">contact@meravote.in</span>
              </a>
            </div>

            {/* Theme switcher toggle */}
            <div className="pt-2 border-t border-[var(--border-glass)] flex items-center justify-between">
              <span className="text-xs text-[var(--text-secondary)] font-medium">
                {t.common.theme}
              </span>
              <ThemeSwitcher />
            </div>
          </div>
        )}
      </header>

      {/* Backdrop overlay for mobile menu */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
