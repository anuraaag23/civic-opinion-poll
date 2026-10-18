'use client';

import React from 'react';
import { useI18n } from '@/lib/i18n/context';
import { HowItWorksSection } from '@/components/home/HowItWorksSection';
import { KeyGuaranteesSection } from '@/components/home/KeyGuaranteesSection';
import { DisclaimerBanner } from '@/components/layout/DisclaimerBanner';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { ArrowRight, Globe, Building2 } from 'lucide-react';
import Link from 'next/link';

export function HowItWorksClient() {
  const { t, language } = useI18n();

  return (
    <div className="space-y-12 sm:space-y-16 py-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] text-xs font-semibold">
          <span>{language === 'hi' ? 'तकनीकी वास्तुकला एवं कार्यप्रणाली' : 'Cryptographic Architecture & Workflow'}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[var(--text-primary)]">
          {t.howItWorks.title}
        </h1>
        <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed">
          {t.howItWorks.subtitle}
        </p>
      </div>

      <DisclaimerBanner />

      {/* 4-Step Process Section */}
      <HowItWorksSection />

      {/* Identity Separation Architecture (Clean, code-free overview) */}
      <section className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">
            {language === 'hi' ? 'पहचान एवं गोपनीयता सुरक्षा का सिद्धांत' : 'The Four Pillars of Voter Protection'}
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            {language === 'hi'
              ? 'पात्रता सत्यापन और मत गणना के बीच पूर्ण तकनीकी अलगाव रहता है।'
              : 'Complete structural decoupling between eligibility verification and anonymous vote tallies.'}
          </p>
        </div>

        <GlassCard elevated className="space-y-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-glass)] space-y-1.5 shadow-xs">
            <span className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider block">
              {language === 'hi' ? '1. स्वतंत्र मतदाता सत्यापन' : '1. Independent Voter Check'}
            </span>
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              {language === 'hi' ? 'आधिकारिक पोर्टल पर सीधा स्व-सत्यापन' : 'Direct Verification on Official ECI Portal'}
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              {language === 'hi'
                ? 'नागरिक आधिकारिक चुनाव आयोग पोर्टल पर सीधे अपना पंजीकरण जांचते हैं। कोई भी व्यक्तिगत पहचान, नाम या पता हमारे सर्वर पर कभी दर्ज नहीं होता।'
                : 'Participants confirm registration directly on the official electoral portal. Zero personal records, voter names, or addresses ever reach our databases.'}
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-glass)] space-y-1.5 shadow-xs">
            <span className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider block">
              {language === 'hi' ? '2. दोहरा मतदान निषेध' : '2. Single Response Guarantee'}
            </span>
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              {language === 'hi' ? 'एक नागरिक, एक मत का सुरक्षित तंत्र' : 'One Citizen, One Voice Safeguard'}
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              {language === 'hi'
                ? 'बिना किसी व्यक्तिगत जानकारी को संग्रहीत किए, मंच यह सुनिश्चित करता है कि प्रत्येक नागरिक केवल एक ही बार मत दर्ज कर सके।'
                : 'To prevent duplicate entries without storing personal information, the system uses one-way mathematical tokens that cannot be reversed or read by anyone.'}
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-glass)] space-y-1.5 shadow-xs">
            <span className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider block">
              {language === 'hi' ? '3. क्षणिक गुमनाम सत्र' : '3. Ephemeral Anonymous Session'}
            </span>
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              {language === 'hi' ? 'पहचान-मुक्त अल्पकालिक मतदान टोकन' : 'Unlinkable Short-Lived Voting Pass'}
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              {language === 'hi'
                ? 'सत्यापन के बाद केवल एक बार इस्तेमाल होने वाला अल्पकालिक सत्र टोकन जारी होता है, जिसका आपके पहचान से कोई संबंध नहीं होता।'
                : 'Upon self-verification, an anonymous session token is generated with a 15-minute lifespan. It contains zero identifying details and dissolves once used.'}
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-glass)] space-y-1.5 shadow-xs">
            <span className="text-xs font-bold text-[var(--success)] uppercase tracking-wider block">
              {language === 'hi' ? '4. सुरक्षित गणना' : '4. Tamper-Proof Tallying'}
            </span>
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              {language === 'hi' ? 'अखंड सार्वजनिक मतगणना' : 'Instant Aggregate-Only Increment'}
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              {language === 'hi'
                ? 'आपका वोट केवल संबंधित दल के कुल योग को 1 से बढ़ाता है। डेटाबेस में कभी यह रिकॉर्ड नहीं होता कि किस व्यक्ति ने किस दल को चुना।'
                : 'Submissions instantly advance the total count for the selected choice. The database maintains only cumulative totals, making it physically impossible to associate any ballot with a participant.'}
            </p>
          </div>
        </GlassCard>
      </section>

      <KeyGuaranteesSection />

      {/* Dual Participation Links */}
      <div className="text-center space-y-3 pt-4">
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent)] block">
          {language === 'hi' ? 'सक्रिय जनमत में भाग लें' : 'Participate in Active Opinion Polls'}
        </span>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/pm" className="w-full sm:w-auto">
            <GlassButton size="lg" className="w-full sm:w-auto gap-2 shadow-md font-bold">
              <Globe className="w-4 h-4" />
              <span>{language === 'hi' ? 'PM जनमत (संपूर्ण भारत)' : 'PM Poll (All India)'}</span>
              <ArrowRight className="w-4 h-4" />
            </GlassButton>
          </Link>
          <Link href="/cm" className="w-full sm:w-auto">
            <GlassButton variant="secondary" size="lg" className="w-full sm:w-auto gap-2 font-bold text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
              <Building2 className="w-4 h-4" />
              <span>{language === 'hi' ? 'CM जनमत (राज्यवार)' : 'CM Poll (State-wise)'}</span>
              <ArrowRight className="w-4 h-4" />
            </GlassButton>
          </Link>
        </div>
      </div>
    </div>
  );
}
