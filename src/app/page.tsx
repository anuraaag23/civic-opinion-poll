'use client';

import React from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n/context';
import { LiquidGlassHeroVisual } from '@/components/home/LiquidGlassHeroVisual';
import { HowItWorksSection } from '@/components/home/HowItWorksSection';
import { KeyGuaranteesSection } from '@/components/home/KeyGuaranteesSection';
import { DisclaimerBanner } from '@/components/layout/DisclaimerBanner';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassBadge } from '@/components/ui/GlassBadge';
import { ArrowRight, BarChart3, ShieldCheck, Users, Clock } from 'lucide-react';

export default function HomePage() {
  const { t, language } = useI18n();

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* Hero Section */}
      <section className="pt-6 sm:pt-12 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Hero Typography & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2">
              <GlassBadge variant="accent">
                <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-ping" />
                {t.common.liveBadge}
              </GlassBadge>
              <GlassBadge variant="neutral">
                <ShieldCheck className="w-3.5 h-3.5 text-[var(--success)]" />
                {language === 'hi' ? 'गोपनीयता-सत्यापित' : 'Privacy-Preserving'}
              </GlassBadge>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[var(--text-primary)] leading-[1.12]">
              {t.hero.title}
            </h1>

            <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed max-w-2xl font-normal">
              {t.hero.subtitle}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link href="/polls/national-opinion-poll-2029">
                <GlassButton size="lg" className="gap-2 shadow-md">
                  <span>{t.hero.primaryCta}</span>
                  <ArrowRight className="w-4 h-4" />
                </GlassButton>
              </Link>
              <Link href="/how-it-works">
                <GlassButton variant="secondary" size="lg">
                  {t.hero.secondaryCta}
                </GlassButton>
              </Link>
              <Link href="/polls/national-opinion-poll-2029/results">
                <GlassButton variant="ghost" size="lg" className="gap-2">
                  <BarChart3 className="w-4 h-4 text-[var(--accent)]" />
                  <span>{t.results.title}</span>
                </GlassButton>
              </Link>
            </div>

            {/* Trust Metrics Pill */}
            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-[var(--text-secondary)] font-medium">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[var(--accent)]" />
                <span>
                  <strong>128,420+</strong> {language === 'hi' ? 'सत्यापित प्रतिक्रियाएं' : 'Verified Participants'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[var(--success)]" />
                <span>
                  <strong>{language === 'hi' ? 'सक्रिय' : 'Live'}</strong> {language === 'hi' ? 'राष्ट्रीय जनमत' : 'National Poll'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Liquid Glass Visual */}
          <div className="lg:col-span-5 flex justify-center">
            <LiquidGlassHeroVisual />
          </div>
        </div>
      </section>

      {/* Prominent Mandatory Non-Affiliation Disclaimer Banner */}
      <section>
        <DisclaimerBanner />
      </section>

      {/* Active Featured Poll Glass Card */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              {language === 'hi' ? 'विशेष सक्रिय जनमत सर्वेक्षण' : 'Featured Active Opinion Poll'}
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
              {language === 'hi'
                ? 'स्वतंत्र नागरिक अनुसंधान के लिए सार्वजनिक राय'
                : 'Independent civic public opinion research sample'}
            </p>
          </div>
          <Link
            href="/polls"
            className="text-xs sm:text-sm font-semibold text-[var(--accent)] hover:underline inline-flex items-center gap-1"
          >
            {language === 'hi' ? 'सभी सर्वेक्षण देखें' : 'View All Polls'}
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <GlassCard elevated className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-glass)]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <GlassBadge variant="success">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" />
                  {t.common.liveBadge}
                </GlassBadge>
                <span className="text-xs text-[var(--text-tertiary)]">
                  ID: POLL-2029-NAT
                </span>
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)]">
                {language === 'hi'
                  ? '2029 राष्ट्रीय नागरिक जनमत सर्वेक्षण'
                  : '2029 National Civic Opinion Poll'}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/polls/national-opinion-poll-2029">
                <GlassButton size="md" className="gap-2">
                  <span>{t.polls.participateButton}</span>
                  <ArrowRight className="w-4 h-4" />
                </GlassButton>
              </Link>
              <Link href="/polls/national-opinion-poll-2029/results">
                <GlassButton variant="secondary" size="md" className="gap-1.5">
                  <BarChart3 className="w-4 h-4" />
                  <span>{t.polls.viewResultsButton}</span>
                </GlassButton>
              </Link>
            </div>
          </div>

          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            {language === 'hi'
              ? 'एक गैर-बाध्यकारी, स्वतंत्र नागरिक सर्वेक्षण जो विभिन्न राजनीतिक दलों के प्रति भारतीय मतदाताओं के वर्तमान रुझानों और जनमत को मापता है। सभी प्रतिक्रियाएं पूरी तरह से गुमनाम और सुरक्षित हैं।'
              : 'A non-binding, independent civic public opinion poll measuring public sentiment and preference across major political parties. All responses are cryptographically decoupled from voter identity.'}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)]">
              <span className="text-[11px] text-[var(--text-tertiary)] uppercase font-semibold">
                {language === 'hi' ? 'कुल प्रतिक्रियाएं' : 'Total Responses'}
              </span>
              <p className="text-lg font-bold text-[var(--text-primary)] mt-0.5">128,420</p>
            </div>
            <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)]">
              <span className="text-[11px] text-[var(--text-tertiary)] uppercase font-semibold">
                {language === 'hi' ? 'पात्रता मानक' : 'Eligibility'}
              </span>
              <p className="text-lg font-bold text-[var(--text-primary)] mt-0.5">
                {language === 'hi' ? 'सत्यापित मतदाता' : 'Verified Citizens'}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)]">
              <span className="text-[11px] text-[var(--text-tertiary)] uppercase font-semibold">
                {language === 'hi' ? 'गोपनीयता स्तर' : 'Privacy Tier'}
              </span>
              <p className="text-lg font-bold text-[var(--success)] mt-0.5">
                {language === 'hi' ? 'शून्य ट्रैकिंग' : 'Zero Tracking'}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)]">
              <span className="text-[11px] text-[var(--text-tertiary)] uppercase font-semibold">
                {language === 'hi' ? 'समापन' : 'Poll Closes'}
              </span>
              <p className="text-lg font-bold text-[var(--text-primary)] mt-0.5">
                31 Dec 2029
              </p>
            </div>
          </div>
        </GlassCard>
      </section>

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Trust & Architecture Guarantees */}
      <KeyGuaranteesSection />
    </div>
  );
}
