'use client';

import React from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n/context';
import { ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';

export function Footer() {
  const { t, language } = useI18n();

  return (
    <footer className="w-full mt-auto border-t border-[var(--border-glass)] bg-[var(--bg-glass)] backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand & Purpose */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[var(--accent)] flex items-center justify-center text-white">
                <svg
                  className="w-4 h-4 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <span className="text-base font-bold text-[var(--text-primary)]">
                {language === 'hi' ? 'सिविक पोल इंडिया' : 'CivicPoll India'}
              </span>
            </div>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-md">
              {t.common.tagline}. {t.hero.subtitle}
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-tertiary)] pt-1">
              <span className="inline-flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[var(--success)]" />
                {language === 'hi' ? 'पहचान पृथक्करण' : 'Identity Separation'}
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[var(--accent)]" />
                {language === 'hi' ? 'एक सत्यापित प्रतिक्रिया' : 'One Response Per Poll'}
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[var(--success)]" />
                {language === 'hi' ? 'सामूहिक सार्वजनिक परिणाम' : 'Aggregate Live Results'}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              {language === 'hi' ? 'मंच नेविगेशन' : 'Platform'}
            </h4>
            <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
              <li>
                <Link href="/polls" className="hover:text-[var(--accent)] transition-colors">
                  {t.nav.polls}
                </Link>
              </li>
              <li>
                <Link
                  href="/polls/national-opinion-poll-2029/results"
                  className="hover:text-[var(--accent)] transition-colors"
                >
                  {t.nav.results}
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-[var(--accent)] transition-colors">
                  {t.nav.howItWorks}
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[var(--accent)] transition-colors">
                  {language === 'hi' ? 'निर्माता के बारे में' : 'About the Creator'}
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-[var(--accent)] transition-colors">
                  {t.nav.admin}
                </Link>
              </li>
            </ul>
          </div>

          {/* Governance & Privacy */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              {language === 'hi' ? 'सुरक्षा एवं नीति' : 'Security & Policy'}
            </h4>
            <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
              <li>
                <Link href="/privacy" className="hover:text-[var(--accent)] transition-colors">
                  {t.nav.privacy}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[var(--accent)] transition-colors">
                  {t.nav.terms}
                </Link>
              </li>
              <li>
                <Link href="/terms#methodology" className="hover:text-[var(--accent)] transition-colors">
                  {language === 'hi' ? 'सर्वेक्षण कार्यप्रणाली' : 'Polling Methodology'}
                </Link>
              </li>
              <li>
                <Link href="/terms#accessibility" className="hover:text-[var(--accent)] transition-colors">
                  {language === 'hi' ? 'सुगमता (Accessibility)' : 'Accessibility (WCAG 2.2)'}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Mandatory Prominent Disclaimer */}
        <div className="pt-6 border-t border-[var(--border-glass)]">
          <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)]">
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed text-center font-medium">
              <strong className="text-[var(--text-primary)]">
                {language === 'hi' ? 'महत्वपूर्ण सूचना: ' : 'Legal Notice: '}
              </strong>
              {t.footer.disclaimer}
            </p>
          </div>
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--text-tertiary)] gap-2">
            <span>© 2026 CivicPoll India. {t.footer.copyright}</span>
            <span>{language === 'hi' ? 'गोपनीयता-प्रथम वास्तुकला' : 'Privacy-First Architecture'}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
