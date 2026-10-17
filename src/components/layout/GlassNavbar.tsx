'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/lib/i18n/context';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeSwitcher } from './ThemeSwitcher';
import { SupportButton } from '@/components/support/SupportButton';
import { BarChart3, HelpCircle, HeartHandshake, Globe, Building2, Vote, Phone, Mail } from 'lucide-react';

export function GlassNavbar() {
  const { t, language } = useI18n();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

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
          {/* Logo and Brand - Fully Clickable to Home */}
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 sm:gap-3 group focus:outline-none focus:ring-2 focus:ring-[var(--accent)] rounded-xl min-w-0"
            aria-label="Mera Vote Home"
          >
            {/* Authentic 3D Liquid Glass Mera Vote Logo */}
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-white/10 to-white/5 border border-white/30 p-1 flex items-center justify-center shadow-md transition-transform duration-200 group-hover:scale-105 overflow-hidden backdrop-blur-md shrink-0">
              <Image
                src="/meravote-logo.png"
                alt="Mera Vote Logo"
                width={40}
                height={40}
                className="w-full h-full object-contain drop-shadow"
                priority
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm sm:text-lg font-black tracking-tight text-[var(--text-primary)] flex items-center gap-1.5 truncate">
                <span>{language === 'hi' ? 'मेरा वोट' : 'Mera Vote'}</span>
                <span className="hidden sm:inline-block text-[var(--accent)] font-bold text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--accent-soft)] border border-[var(--accent)]/30 shrink-0">
                  {language === 'hi' ? 'Mera Vote' : 'भारत'}
                </span>
              </span>
              <span className="text-xs tracking-normal text-[var(--text-secondary)] font-medium truncate">
                {language === 'hi' ? 'स्वतंत्र नागरिक जनमत' : 'Independent Civic Polls'}
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
                  className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
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

          {/* Controls: Language, Theme, Buy Me a Chai Support & Mobile Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <SupportButton variant="compact" className="hidden sm:inline-flex" />
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

            {/* Support Developer CTA */}
            <div className="pt-2">
              <SupportButton variant="pill" className="w-full justify-center min-h-[48px]" />
            </div>

            {/* Clickable Mobile Contact Channels */}
            <div className="pt-3 border-t border-[var(--border-glass)] grid grid-cols-2 gap-2 text-xs">
              <a
                href="tel:+918005552026"
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] text-[var(--text-secondary)] hover:text-[var(--accent)] min-h-[44px]"
              >
                <Phone className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span className="font-semibold">+91 800 555 2026</span>
              </a>
              <a
                href="mailto:contact@meravote.in"
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] text-[var(--text-secondary)] hover:text-[var(--accent)] min-h-[44px]"
              >
                <Mail className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span className="font-semibold">contact@meravote.in</span>
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
