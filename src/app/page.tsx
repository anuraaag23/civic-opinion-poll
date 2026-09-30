'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useI18n } from '@/lib/i18n/context';
import { LiquidGlassHeroVisual } from '@/components/home/LiquidGlassHeroVisual';
import { HowItWorksSection } from '@/components/home/HowItWorksSection';
import { KeyGuaranteesSection } from '@/components/home/KeyGuaranteesSection';
import { AboutCreatorSection } from '@/components/home/AboutCreatorSection';
import { VoterAssuranceCard } from '@/components/verification/VoterAssuranceCard';
import { DisclaimerBanner } from '@/components/layout/DisclaimerBanner';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassBadge } from '@/components/ui/GlassBadge';
import { ArrowRight, BarChart3, ShieldCheck, Users, Clock, Vote } from 'lucide-react';

export default function HomePage() {
  const { t, language } = useI18n();

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* Hero Section */}
      <section className="pt-4 sm:pt-8 pb-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Hero Typography & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Prominent Mera Vote Logo & Live Badges */}
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl p-1.5 bg-white dark:bg-white/95 border border-[var(--border-glass)] shadow-md flex items-center justify-center overflow-hidden shrink-0">
                <Image
                  src="/meravote-logo.png"
                  alt="Mera Vote Logo"
                  width={64}
                  height={64}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 flex-wrap">
                  <GlassBadge variant="accent">
                    <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-ping" />
                    {t.common.liveBadge}
                  </GlassBadge>
                  <GlassBadge variant="success">
                    <ShieldCheck className="w-3.5 h-3.5 text-[var(--success)]" />
                    <span>{language === 'hi' ? 'शून्य आईडी भंडारण' : 'Zero ID Storage Guaranteed'}</span>
                  </GlassBadge>
                </div>
                <div className="text-[11px] font-bold text-[var(--accent)] tracking-wide uppercase">
                  {language === 'hi' ? 'मेरा वोट • स्वतंत्र नागरिक जनमत' : 'Mera Vote • Independent Civic Platform'}
                </div>
              </div>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[var(--text-primary)] leading-[1.12]">
              <span className="text-[var(--accent)]">{language === 'hi' ? 'मेरा वोट' : 'Mera Vote'}</span>
              <span className="block text-2xl sm:text-4xl lg:text-5xl mt-1 text-[var(--text-primary)]">
                {language === 'hi'
                  ? 'स्वतंत्र नागरिक जनमत सर्वेक्षण'
                  : 'Independent India Civic Opinion Polls'}
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed max-w-2xl font-normal">
              {language === 'hi'
                ? 'गोपनीयता-केंद्रित सत्यापन और 100% गुमनाम प्रतिक्रियाओं के साथ स्वतंत्र जनमत सर्वेक्षण में भाग लें। आपकी राय अपरिवर्तनीय और सुरक्षित है।'
                : 'Participate in independent public opinion polls with verified eligibility and 100% anonymous responses. Your voice is permanent, immutable, and tamper-proof.'}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link href="/polls/national-opinion-poll-2029">
                <GlassButton size="lg" className="gap-2 shadow-md font-bold">
                  <Vote className="w-5 h-5" />
                  <span>{t.hero.primaryCta}</span>
                  <ArrowRight className="w-4 h-4" />
                </GlassButton>
              </Link>
              <Link href="/polls/national-opinion-poll-2029/results">
                <GlassButton variant="secondary" size="lg" className="gap-2">
                  <BarChart3 className="w-4 h-4 text-[var(--accent)]" />
                  <span>{language === 'hi' ? 'लाइव मतगणना देखें' : 'View Live Results'}</span>
                </GlassButton>
              </Link>
            </div>

            {/* Trust Metrics Pill */}
            <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-[var(--text-secondary)] font-medium">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[var(--accent)]" />
                <span>
                  <strong>128,420+</strong> {language === 'hi' ? 'सत्यापित नागरिक मत' : 'Verified Citizen Responses'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[var(--success)]" />
                <span>
                  <strong>{language === 'hi' ? 'सक्रिय' : 'Live'}</strong> {language === 'hi' ? 'राष्ट्रीय जनमत' : 'National Poll 2029'}
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

      {/* Prominent Voter Assurance Card (Crucial User Requirement) */}
      <section>
        <VoterAssuranceCard />
      </section>

      {/* Super Simple 3-Step Walkthrough For Any User */}
      <section className="space-y-4">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
            {language === 'hi' ? 'आसान प्रक्रिया' : 'Simple 3-Step Process'}
          </span>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            {language === 'hi' ? 'केवल 30 सेकंड में अपना मत दर्ज करें' : 'Cast Your Opinion in 30 Seconds'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <GlassCard className="space-y-2 p-5">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-[var(--accent)] text-white text-xs font-black flex items-center justify-center">1</span>
              <h3 className="font-bold text-sm text-[var(--text-primary)]">
                {language === 'hi' ? '1. ECI पोर्टल पर पंजीकरण जांचें' : '1. Check Registration on ECI'}
              </h3>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed pl-11">
              {language === 'hi'
                ? 'आधिकारिक ECI पोर्टल पर सीधे अपनी स्थिति जांचें और स्व-सत्यापन पूरा करें। 100% शून्य आईडी भंडारण।'
                : 'Check registration directly on official ECI portal and confirm. Zero ID stored.'}
            </p>
          </GlassCard>

          <GlassCard className="space-y-2 p-5">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-[var(--accent)] text-white text-xs font-black flex items-center justify-center">2</span>
              <h3 className="font-bold text-sm text-[var(--text-primary)]">
                {language === 'hi' ? '2. पार्टी या नोटा चुनें' : '2. Select Your Party or NOTA'}
              </h3>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed pl-11">
              {language === 'hi'
                ? 'असली चुनाव चिन्हों के साथ निष्पक्ष सूची। 1 व्यक्ति 1 मत।'
                : 'Clear official symbols. One response per verified citizen.'}
            </p>
          </GlassCard>

          <GlassCard className="space-y-2 p-5">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-[var(--success)] text-white text-xs font-black flex items-center justify-center">3</span>
              <h3 className="font-bold text-sm text-[var(--text-primary)]">
                {language === 'hi' ? '3. पुष्टि करें और परिणाम देखें' : '3. Confirm & View Live Results'}
              </h3>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed pl-11">
              {language === 'hi'
                ? 'मतदान के बाद आपका वोट कभी नहीं बदलेगा। तुरंत लाइव मतगणना देखें।'
                : 'Response is permanently locked. Watch real-time vote counting.'}
            </p>
          </GlassCard>
        </div>
      </section>

      {/* Mandatory Non-Affiliation Disclaimer Banner */}
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
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl p-1 bg-white dark:bg-white/95 border border-[var(--border-glass)] shadow-xs flex items-center justify-center shrink-0">
                <Image src="/meravote-logo.png" alt="Mera Vote Logo" width={48} height={48} className="w-full h-full object-contain" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[var(--accent)] px-2 py-0.5 rounded-full bg-[var(--accent-soft)]">
                    {language === 'hi' ? 'मेरा वोट' : 'Mera Vote'}
                  </span>
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
                  <span>{language === 'hi' ? 'लाइव परिणाम देखें' : 'View Live Results'}</span>
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
                {language === 'hi' ? 'शून्य आईडी भंडारण' : 'Zero ID Storage'}
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

      {/* About Creator Section (Moved to the very bottom of the page as requested by Anurag) */}
      <AboutCreatorSection />
    </div>
  );
}
