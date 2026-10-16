'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useI18n } from '@/lib/i18n/context';
import { SupportButton } from '@/components/support/SupportButton';
import { ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';

export function Footer() {
  const { t, language } = useI18n();

  return (
    <footer className="w-full mt-auto border-t border-[var(--border-glass)] bg-[var(--bg-glass)] backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-28 sm:pb-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand & Purpose */}
          <div className="md:col-span-2 space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-white/10 to-white/5 border border-white/30 p-1 flex items-center justify-center shadow-md overflow-hidden backdrop-blur-md shrink-0">
                    <Image
                      src="/meravote-logo.png"
                      alt="Mera Vote Logo"
                      width={36}
                      height={36}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-lg font-black tracking-tight text-[var(--text-primary)]">
                    {language === 'hi' ? 'मेरा वोट (Mera Vote)' : 'Mera Vote'}
                  </span>
                </div>
                <SupportButton variant="compact" />
              </div>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed max-w-md">
                {t.common.tagline}. {t.hero.subtitle}
              </p>
              <div className="flex flex-wrap items-center gap-2.5 text-xs text-[var(--text-tertiary)]">
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
          <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] space-y-1">
            <p className="text-xs sm:text-sm text-[var(--accent)] font-bold text-center">
              {t.footer.persistentStatement}
            </p>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed text-center font-medium">
              <strong className="text-[var(--text-primary)]">
                {language === 'hi' ? 'कानूनी अस्वीकरण: ' : 'Legal Disclaimer: '}
              </strong>
              {t.footer.disclaimer}
            </p>
          </div>
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--text-tertiary)] gap-2">
            <span>© 2026 Mera Vote. {t.footer.copyright}</span>
            <span>{language === 'hi' ? 'गोपनीयता-प्रथम वास्तुकला' : 'Privacy-First Architecture'}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
