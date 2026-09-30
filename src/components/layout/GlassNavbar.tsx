'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/lib/i18n/context';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeSwitcher } from './ThemeSwitcher';
import { SupportButton } from '@/components/support/SupportButton';
import { Menu, X, BarChart3, Vote, HelpCircle, ShieldCheck, HeartHandshake } from 'lucide-react';

export function GlassNavbar() {
  const { t, language } = useI18n();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/polls', label: t.nav.polls, icon: Vote },
    { href: '/polls/national-opinion-poll-2029/results', label: t.nav.results, icon: BarChart3 },
    { href: '/how-it-works', label: t.nav.howItWorks, icon: HelpCircle },
    { href: '/about', label: language === 'hi' ? 'निर्माता' : 'About Creator', icon: HeartHandshake },
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
          {/* Authentic 3D Liquid Glass Mera Vote Logo */}
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-white/10 to-white/5 border border-white/30 p-1 flex items-center justify-center shadow-md transition-transform duration-200 group-hover:scale-105 overflow-hidden backdrop-blur-md shrink-0">
            <Image
              src="/meravote-logo.png"
              alt="Mera Vote Logo"
              width={40}
              height={40}
              className="w-full h-full object-contain drop-shadow"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-black tracking-tight text-[var(--text-primary)] flex items-center gap-1.5">
              <span>{language === 'hi' ? 'मेरा वोट' : 'Mera Vote'}</span>
              <span className="text-[var(--accent)] font-bold text-[10px] px-2 py-0.5 rounded-full bg-[var(--accent-soft)] border border-[var(--accent)]/30">
                {language === 'hi' ? 'Mera Vote' : 'भारत'}
              </span>
            </span>
            <span className="text-[10px] tracking-wide text-[var(--text-secondary)] font-medium">
              {language === 'hi' ? 'स्वतंत्र नागरिक जनमत' : 'Independent Civic Polls'}
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

        {/* Controls: Language, Theme, Ko-fi Support & Mobile Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          <SupportButton variant="compact" className="hidden sm:inline-flex" />
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
          <div className="pt-2">
            <SupportButton variant="pill" className="w-full justify-center" />
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
