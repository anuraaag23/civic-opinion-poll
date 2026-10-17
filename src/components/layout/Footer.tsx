'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useI18n } from '@/lib/i18n/context';
import { SupportButton } from '@/components/support/SupportButton';
import { ShieldCheck, Lock, CheckCircle2, Phone, Mail, MapPin, User, HeartHandshake } from 'lucide-react';

export function Footer() {
  const { t, language } = useI18n();

  return (
    <footer className="w-full mt-auto border-t border-[var(--border-glass)] bg-[var(--bg-glass)] backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-28 sm:pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Col 1: Brand & Purpose with Clickable Logo */}
          <div className="space-y-4">
            <div className="space-y-3">
              <Link
                href="/"
                className="inline-flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-[var(--accent)] rounded-xl"
                aria-label="Mera Vote Home"
              >
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-white/10 to-white/5 border border-white/30 p-1 flex items-center justify-center shadow-md overflow-hidden backdrop-blur-md shrink-0 group-hover:scale-105 transition-transform">
                  <Image
                    src="/meravote-logo.png"
                    alt="Mera Vote Logo"
                    width={36}
                    height={36}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-lg font-black tracking-tight text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                  {language === 'hi' ? 'मेरा वोट (Mera Vote)' : 'Mera Vote'}
                </span>
              </Link>

              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                {t.common.tagline}. {t.hero.subtitle}
              </p>

              <div className="pt-1">
                <SupportButton variant="compact" />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-tertiary)] pt-1">
              <span className="inline-flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[var(--success)]" />
                {language === 'hi' ? 'पहचान पृथक्करण' : 'Identity Separation'}
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[var(--accent)]" />
                {language === 'hi' ? 'शून्य आईडी भंडारण' : 'Zero ID Storage'}
              </span>
            </div>
          </div>

          {/* Col 2: Platform Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              {language === 'hi' ? 'मंच नेविगेशन' : 'Platform Navigation'}
            </h4>
            <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
              <li>
                <Link href="/pm" className="hover:text-[var(--accent)] transition-colors flex items-center gap-1.5">
                  <span>{language === 'hi' ? 'PM जनमत (संपूर्ण भारत)' : 'PM Poll (All India)'}</span>
                </Link>
              </li>
              <li>
                <Link href="/cm" className="hover:text-[var(--accent)] transition-colors flex items-center gap-1.5">
                  <span>{language === 'hi' ? 'CM जनमत (राज्यवार)' : 'CM Poll (State-wise)'}</span>
                </Link>
              </li>
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
            </ul>
          </div>

          {/* Col 3: Governance & Security */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              {language === 'hi' ? 'सुरक्षा एवं नीतियां' : 'Security & Policy'}
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
              <li>
                <Link href="/admin" className="hover:text-[var(--accent)] transition-colors">
                  {t.nav.admin}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Inquiries (Clickable Phone & Email) */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              {language === 'hi' ? 'संपर्क एवं नागरिक पूछताछ' : 'Contact & Citizen Inquiries'}
            </h4>
            <div className="space-y-2.5 text-xs text-[var(--text-secondary)]">
              <div className="flex items-start gap-2">
                <User className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[var(--text-primary)] block">Anurag (Developer)</strong>
                  <span>20-year-old student, Uttar Pradesh</span>
                </div>
              </div>

              {/* Clickable Email */}
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[var(--accent)] shrink-0" />
                <a
                  href="mailto:contact@meravote.in"
                  className="font-medium hover:text-[var(--accent)] hover:underline transition-colors"
                  title="Send email to Mera Vote"
                >
                  contact@meravote.in
                </a>
              </div>

              {/* Clickable Phone */}
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[var(--success)] shrink-0" />
                <a
                  href="tel:+918005552026"
                  className="font-medium hover:text-[var(--success)] hover:underline transition-colors"
                  title="Call civic helpline"
                >
                  +91 800 555 2026
                </a>
              </div>

              <div className="flex items-center gap-2 pt-1 text-[11px] text-[var(--text-tertiary)]">
                <MapPin className="w-3.5 h-3.5 text-[var(--error)] shrink-0" />
                <span>Uttar Pradesh, India (शून्य पार्टी फंडिंग)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mandatory Prominent Disclaimer & Copyright */}
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
            <span>© 2026 Mera Vote. All rights reserved. Independent Civic Opinion Poll Platform.</span>
            <span>{language === 'hi' ? 'गोपनीयता-प्रथम वास्तुकला • WCAG 2.2 AA' : 'Privacy-First Architecture • WCAG 2.2 AA'}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
