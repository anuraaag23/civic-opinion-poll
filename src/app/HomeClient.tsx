'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n/context';
import { LiquidGlassHeroVisual } from '@/components/home/LiquidGlassHeroVisual';
import { KeyGuaranteesSection } from '@/components/home/KeyGuaranteesSection';
import { AboutCreatorSection } from '@/components/home/AboutCreatorSection';
import { HomeTopPollLiveResult } from '@/components/home/HomeTopPollLiveResult';
import { VoterAssuranceCard } from '@/components/verification/VoterAssuranceCard';
import { StateSelector } from '@/components/common/StateSelector';
import { NATIONAL_PARTIES, getPartiesForState, getStateById } from '@/lib/data/parties';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassBadge } from '@/components/ui/GlassBadge';
import { ArrowRight, BarChart3, ShieldCheck, Users, Clock, Vote, Globe, Building2, MapPin, Calendar } from 'lucide-react';

export function HomeClient() {
  const { t, language } = useI18n();
  const [homeStateId, setHomeStateId] = useState('uttar-pradesh');
  const currentState = getStateById(homeStateId) || getStateById('uttar-pradesh')!;
  const stateParties = getPartiesForState(homeStateId);

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* Hero Section */}
      <section className="pt-4 sm:pt-8 pb-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Hero Typography & CTAs */}
          <div className="lg:col-span-6 space-y-6 text-left">
            {/* Live Badges */}
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 flex-wrap">
                <GlassBadge variant="accent">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]" />
                  </span>
                  <span>{t.common.liveBadge}</span>
                </GlassBadge>
                <GlassBadge variant="success">
                  <ShieldCheck className="w-3.5 h-3.5 text-[var(--success)] shrink-0" />
                  <span>{language === 'hi' ? 'शून्य आईडी भंडारण' : 'Zero ID Storage Guaranteed'}</span>
                </GlassBadge>
              </div>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[var(--text-primary)] leading-[1.12]">
              <span className="text-[var(--accent)]">{language === 'hi' ? 'मेरा वोट' : 'Mera Vote'}</span>
              <span className="block text-2xl sm:text-4xl lg:text-5xl mt-1 text-[var(--text-primary)]">
                {language === 'hi'
                  ? 'आपकी आवाज़। आपका जनमत।'
                  : 'Your Voice. Your Opinion.'}
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed max-w-2xl font-normal">
              {language === 'hi'
                ? 'राष्ट्रीय (प्रधानमंत्री) और राज्य-स्तरीय (मुख्यमंत्री) प्राथमिकताओं के लिए एक स्वतंत्र नागरिक जनमत मंच। आधिकारिक चुनाव चिह्नों के साथ अपनी राय गोपनीय रूप से दर्ज करें।'
                : 'An independent public opinion platform for national and state-level political preferences. Share your confidential opinion with authentic party election symbols.'}
            </p>

            {/* Direct Dual CTAs: PM Poll & CM Poll */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
              <Link href="/pm" className="w-full sm:w-auto">
                <GlassButton size="lg" className="w-full sm:w-auto gap-2 shadow-md font-bold">
                  <Globe className="w-4 h-4 text-white" />
                  <span>{language === 'hi' ? 'PM जनमत में भाग लें' : 'Participate in PM Poll'}</span>
                  <ArrowRight className="w-4 h-4" />
                </GlassButton>
              </Link>
              <Link href="/cm" className="w-full sm:w-auto">
                <GlassButton variant="secondary" size="lg" className="w-full sm:w-auto gap-2 font-bold border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                  <Building2 className="w-4 h-4" />
                  <span>{language === 'hi' ? 'CM जनमत में भाग लें' : 'Participate in CM Poll'}</span>
                  <ArrowRight className="w-4 h-4" />
                </GlassButton>
              </Link>
              <Link href="/polls/national-opinion-poll-2029/results" className="w-full sm:w-auto">
                <GlassButton
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto gap-2 font-bold bg-[var(--bg-surface)] hover:bg-[var(--border-glass)] border border-[var(--border-glass)] text-[var(--text-primary)] shadow-xs"
                >
                  <BarChart3 className="w-4 h-4 text-[var(--accent)]" />
                  <span>{language === 'hi' ? 'लाइव परिणाम' : 'Results'}</span>
                </GlassButton>
              </Link>
              <Link href="/polls" className="w-full sm:w-auto">
                <GlassButton
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto gap-2 font-bold bg-[var(--bg-surface)] hover:bg-[var(--border-glass)] border border-[var(--border-glass)] text-[var(--text-primary)] shadow-xs"
                >
                  <Vote className="w-4 h-4 text-purple-500" />
                  <span>{language === 'hi' ? 'सभी जनमत' : 'All Polls'}</span>
                </GlassButton>
              </Link>
            </div>

            {/* Trust Metrics Pill */}
            <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-[var(--text-secondary)] font-medium">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[var(--accent)]" />
                <span>
                  <strong>223,230+</strong> {language === 'hi' ? 'कुल सत्यापित मत (राष्ट्रीय + राज्य जनमत)' : 'Platform Votes (National + State Combined)'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[var(--success)]" />
                <span>
                  <strong>{language === 'hi' ? 'सक्रिय' : 'Live'}</strong> {language === 'hi' ? 'अक्टूबर 2026 सर्वेक्षण चक्र' : 'October 2026 Monthly Edition'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Liquid Glass Visual (Centered 50/50 balance) */}
          <div className="lg:col-span-6 flex items-center justify-center self-center w-full">
            <LiquidGlassHeroVisual />
          </div>
        </div>
      </section>

      {/* Prominent Voter Assurance Card */}
      <section className="-mt-8 sm:-mt-14">
        <VoterAssuranceCard />
      </section>

      {/* ── TWO DEDICATED SECTIONS: PM & CM SHOWCASE ───────────────────────── */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-1.5">
          <span className="text-xs font-bold text-[var(--accent)]">
            {language === 'hi' ? 'दो अलग-अलग सर्वेक्षण वर्ग' : 'Two Distinct Polling Sections'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-primary)]">
            {language === 'hi'
              ? 'राष्ट्रीय नेतृत्व (PM) एवं राज्य नेतृत्व (CM)'
              : 'Choose Your Sphere: Prime Minister or Chief Minister'}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            {language === 'hi'
              ? 'PM पेज पर संपूर्ण भारत की राष्ट्रीय पार्टियां देखें, और CM पेज पर अपने राज्य का चयन करके अपने राज्य के दल देखें।'
              : 'The PM section represents All-India national choice, while the CM section lets you pick your state for assembly candidates.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* SECTION 1: PRIME MINISTER (PM) POLL */}
          <GlassCard elevated className="space-y-5 border-t-4 border-t-[var(--accent)] flex flex-col justify-between h-full">
            <div className="space-y-4 flex-1 flex flex-col justify-between">
              <div className="flex items-center justify-between gap-2">
                <GlassBadge variant="accent" size="sm" interactive>
                  <Globe className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 shrink-0" />
                  <span>{language === 'hi' ? '1. प्रधानमंत्री (PM) वर्ग' : '1. Prime Minister (PM) Section'}</span>
                </GlassBadge>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <GlassBadge variant="neutral" size="sm" interactive>
                    <Globe className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 shrink-0" />
                    <span>{language === 'hi' ? 'संपूर्ण भारत' : 'India Only'}</span>
                  </GlassBadge>
                  <GlassBadge variant="warning" size="sm" interactive>
                    <Calendar className="w-3 h-3 text-amber-500 shrink-0" />
                    <span>{language === 'hi' ? 'अक्टूबर 2026' : 'October 2026'}</span>
                  </GlassBadge>
                </div>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
                  {language === 'hi'
                    ? 'प्रधानमंत्री जनमत सर्वेक्षण (लोकसभा)'
                    : 'Prime Minister (PM) Civic Poll — Lok Sabha'}
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 leading-relaxed">
                  {language === 'hi'
                    ? 'संपूर्ण भारत के लिए एक राष्ट्रीय सर्वेक्षण। इसमें सभी राष्ट्रीय मान्यता प्राप्त दल अपने आधिकारिक चुनाव चिह्नों के साथ उपस्थित हैं।'
                    : 'Covers all 28 states and 8 union territories at the national level. Features national parties with their official election symbols.'}
                </p>
              </div>

              {/* National Scope Card (Mirrors CM StateSelector for equal height) */}
              <div className="w-full glass-panel p-3.5 sm:p-4 rounded-2xl flex items-center justify-between gap-3 border-2 border-[var(--accent)]/40 shadow-xs">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center font-black text-sm shrink-0 border border-[var(--accent)]/30">
                    IND
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-bold text-[var(--accent)] block mb-0.5">
                      {language === 'hi' ? 'राष्ट्रीय स्तर • 543 लोकसभा सीटें' : 'National Scope • 543 Lok Sabha Seats'}
                    </span>
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="text-base sm:text-lg font-black text-[var(--text-primary)] truncate leading-normal">
                        {language === 'hi' ? 'संपूर्ण भारत जनमत' : 'All-India National Scope'}
                      </h4>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="hidden sm:inline-flex items-center text-xs font-semibold text-[var(--accent)] px-2.5 py-1 rounded-full bg-[var(--accent-soft)]">
                          {language === 'hi' ? 'राष्ट्रीय वर्ग' : 'National'}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-[var(--text-secondary)] font-medium block">
                      {language === 'hi' ? '28 राज्य एवं 8 केंद्र शासित प्रदेश' : '28 States & 8 Union Territories'}
                    </span>
                  </div>
                </div>
              </div>

              {/* National Parties Logos Preview */}
              <div className="space-y-2 pt-1">
                <span className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider block">
                  {language === 'hi' ? 'शामिल राष्ट्रीय दल (असली चुनाव चिह्न):' : 'Contesting National Parties with Official Logos:'}
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {NATIONAL_PARTIES.slice(0, 6).map((p) => (
                    <div
                      key={p.id}
                      className="p-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] flex items-center gap-2"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white p-0.5 flex items-center justify-center shrink-0 border border-[var(--border-glass)] shadow-2xs overflow-hidden">
                        {p.logo_url && (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={p.logo_url} alt={p.name_en} className="w-full h-full object-contain" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-[var(--text-primary)] block truncate">{p.short_name}</span>
                        {(p.candidate_name_en || p.candidate_name_hi) && (
                          <span className="text-[10px] text-[var(--accent)] font-semibold block truncate">
                            {language === 'hi' ? p.candidate_name_hi || p.candidate_name_en : p.candidate_name_en}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* PM Card Actions */}
            <div className="pt-3 border-t border-[var(--border-glass)] flex flex-col sm:flex-row items-center gap-2.5 mt-auto">
              <Link href="/pm" className="w-full sm:flex-1">
                <GlassButton variant="primary" size="md" className="w-full gap-2 font-bold justify-center shadow-md">
                  <Vote className="w-4 h-4" />
                  <span>{language === 'hi' ? 'PM जनमत में भाग लें' : 'Participate in PM Poll'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </GlassButton>
              </Link>
              <Link href="/polls/national-opinion-poll-2029/results" className="w-full sm:w-auto">
                <GlassButton
                  variant="secondary"
                  size="md"
                  className="w-full justify-center gap-1.5 font-bold border-2 border-[var(--border-glass)] bg-[var(--bg-primary)]/80 hover:bg-[var(--accent-soft)]/40 shadow-xs"
                >
                  <BarChart3 className="w-4 h-4 text-[var(--accent)]" />
                  <span>{language === 'hi' ? 'राष्ट्रीय परिणाम' : 'National Results'}</span>
                </GlassButton>
              </Link>
            </div>
          </GlassCard>

          {/* SECTION 2: CHIEF MINISTER (CM) POLL */}
          <GlassCard elevated className="space-y-5 border-t-4 border-t-emerald-500 flex flex-col justify-between h-full">
            <div className="space-y-4 flex-1 flex flex-col justify-between">
              <div className="flex items-center justify-between gap-2">
                <GlassBadge variant="success" size="sm" interactive>
                  <Building2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{language === 'hi' ? '2. मुख्यमंत्री (CM) वर्ग' : '2. Chief Minister (CM) Section'}</span>
                </GlassBadge>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <GlassBadge variant="neutral" size="sm" interactive>
                    <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{language === 'hi' ? 'राज्यवार चयन' : 'State-by-State'}</span>
                  </GlassBadge>
                  <GlassBadge variant="warning" size="sm" interactive>
                    <Calendar className="w-3 h-3 text-amber-500 shrink-0" />
                    <span>{language === 'hi' ? 'अक्टूबर 2026' : 'October 2026'}</span>
                  </GlassBadge>
                </div>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
                  {language === 'hi'
                    ? 'मुख्यमंत्री जनमत सर्वेक्षण (विधानसभा)'
                    : 'Chief Minister (CM) Civic Poll — State Assembly'}
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 leading-relaxed">
                  {language === 'hi'
                    ? 'अपने राज्य का चयन करें और उस राज्य के अनुसार चुनाव लड़ने वाले दलों को उनके असली चुनाव चिह्न के साथ देखकर वोट करें।'
                    : 'Pick any Indian state to see the exact political parties and official symbols active in that state assembly election.'}
                </p>
              </div>

              {/* Interactive State Selector Inline Preview */}
              <div className="space-y-2 pt-1">
                <span className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider block">
                  {language === 'hi' ? 'राज्य का चयन करें:' : 'Select State / Union Territory:'}
                </span>
                <StateSelector
                  compact
                  selectedStateId={homeStateId}
                  onSelectState={(id) => setHomeStateId(id)}
                />

                {/* State Parties Preview with Logos */}
                <div className="pt-2">
                  <span className="text-xs text-[var(--text-tertiary)] font-bold uppercase tracking-wider block mb-1">
                    {language === 'hi'
                      ? `${currentState.name_hi} में सक्रिय दल (${stateParties.length} विकल्प):`
                      : `Parties active in ${currentState.name_en} (${stateParties.length} choices):`}
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {stateParties.slice(0, 6).map((p) => (
                      <div
                        key={p.id}
                        className="p-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] flex items-center gap-2"
                      >
                        <div className="w-10 h-10 rounded-xl bg-white p-0.5 flex items-center justify-center shrink-0 border border-[var(--border-glass)] shadow-2xs overflow-hidden">
                          {p.logo_url && (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={p.logo_url} alt={p.name_en} className="w-full h-full object-contain" />
                          )}
                        </div>
                        <div className="min-w-0">
                        <span className="text-xs font-bold text-[var(--text-primary)] block truncate">{p.short_name}</span>
                        {(p.candidate_name_en || p.candidate_name_hi) && (
                          <span className="text-[10px] text-[var(--accent)] font-semibold block truncate">
                            {language === 'hi' ? p.candidate_name_hi || p.candidate_name_en : p.candidate_name_en}
                          </span>
                        )}
                      </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* CM Card Actions */}
            <div className="pt-3 border-t border-[var(--border-glass)] flex flex-col sm:flex-row items-center gap-2.5 mt-auto">
              <Link href="/cm" className="w-full sm:flex-1">
                <GlassButton variant="primary" size="md" className="w-full gap-2 font-bold justify-center shadow-md">
                  <Vote className="w-4 h-4" />
                  <span>{language === 'hi' ? `${currentState.name_hi} CM जनमत में भाग लें` : `Participate in ${currentState.code} CM Poll`}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </GlassButton>
              </Link>
              <Link href={`/polls/national-opinion-poll-2029/results?state=${currentState.id}`} className="w-full sm:w-auto">
                <GlassButton
                  variant="secondary"
                  size="md"
                  className="w-full justify-center gap-1.5 font-bold border-2 border-[var(--border-glass)] bg-[var(--bg-primary)]/80 hover:bg-[var(--accent-soft)]/40 shadow-xs"
                >
                  <BarChart3 className="w-4 h-4 text-[var(--accent)]" />
                  <span>{language === 'hi' ? 'राज्य परिणाम' : 'State Results'}</span>
                </GlassButton>
              </Link>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* ── LIVE LEADERBOARD: SINGLE POLL WITH MOST VOTERS ──────────────── */}
      <HomeTopPollLiveResult />


      {/* Consolidated 3-Step Walkthrough */}
      <section className="space-y-4">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
            {language === 'hi' ? 'सहज भागीदारी' : 'How Participation Works'}
          </span>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            {language === 'hi' ? 'अपनी राय साझा करें' : 'Share Your Opinion'}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            {language === 'hi'
              ? 'तीन सरल और गोपनीय चरणों में अपनी नागरिक राय दर्ज करें।'
              : 'A transparent, confidential, and direct process in three clear steps.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <GlassCard className="space-y-2 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[var(--accent)] text-white text-xs font-black flex items-center justify-center shrink-0">1</span>
                <h3 className="font-bold text-sm text-[var(--text-primary)]">
                  {language === 'hi' ? '1. पात्रता सत्यापन' : '1. Verify Participation'}
                </h3>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed pl-11 pt-1">
                {language === 'hi'
                  ? 'व्हाट्सएप पर 6-अंकों का निःशुल्क कोड प्राप्त करें। फोन नंबर गुप्त कुंजी द्वारा हैश हो जाता है और कभी वोट से नहीं जुड़ता।'
                  : 'Receive a confidential 6-digit OTP on WhatsApp. Mobile numbers are converted into server-keyed cryptographic hashes and discarded.'}
              </p>
            </div>
          </GlassCard>

          <GlassCard className="space-y-2 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[var(--accent)] text-white text-xs font-black flex items-center justify-center shrink-0">2</span>
                <h3 className="font-bold text-sm text-[var(--text-primary)]">
                  {language === 'hi' ? '2. अपनी पसंद चुनें' : '2. Select a Poll Option'}
                </h3>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed pl-11 pt-1">
                {language === 'hi'
                  ? 'राष्ट्रीय अथवा अपने राज्य की विधानसभा के लिए आधिकारिक चुनाव चिह्नों के साथ स्वतंत्र रूप से अपना पसंदीदा दल चुनें।'
                  : 'Choose your preferred national or state assembly choice presented neutrally with authentic election symbols.'}
              </p>
            </div>
          </GlassCard>

          <GlassCard className="space-y-2 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-emerald-600 text-white text-xs font-black flex items-center justify-center shrink-0">3</span>
                <h3 className="font-bold text-sm text-[var(--text-primary)]">
                  {language === 'hi' ? '3. पुष्टि करें और परिणाम देखें' : '3. Confirm & View Results'}
                </h3>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed pl-11 pt-1">
                {language === 'hi'
                  ? 'अपने मत की पुष्टि करें। आपका वोट सुरक्षित रूप से सील हो जाता है और तुरंत लाइव राष्ट्रीय और राज्य-वार मतगणना में जुड़ जाता है।'
                  : 'Confirm your choice to seal your response. Aggregate counts update transparently across India.'}
              </p>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Trust & Architecture Guarantees */}
      <KeyGuaranteesSection />

      {/* About Creator Section (At the very bottom of the page) */}
      <AboutCreatorSection />
    </div>
  );
}
