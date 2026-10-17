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

      {/* Deep-Dive Technical Blueprint */}
      <section className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">
            {language === 'hi' ? 'पहचान पृथक्करण का तकनीकी प्रवाह' : 'The Identity Separation Flow'}
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            {language === 'hi'
              ? 'सत्यापन प्रणाली पात्रता की पुष्टि करती है, जबकि वोटिंग प्रणाली पूर्णतः गुमनाम रहती है।'
              : 'The verification system handles eligibility, while the voting database stores only aggregate tallies.'}
          </p>
        </div>

        <GlassCard elevated className="space-y-6 font-mono text-xs sm:text-sm">
          <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] space-y-2">
            <span className="text-[var(--accent)] font-bold block">1. In-Memory Eligibility Check</span>
            <p className="text-[var(--text-secondary)] font-sans">
              Participant checks eligibility directly on the official ECI search portal in an isolated browser tab. No voter names, addresses, or electoral roll records ever touch our database.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] space-y-2">
            <span className="text-[var(--accent)] font-bold block">2. Keyed Participation Fingerprinting</span>
            <p className="text-[var(--text-secondary)] font-sans">
              To prevent duplicate participation without saving plain hashes, the system derives:
              <code className="block mt-1 p-2 rounded bg-[var(--bg-primary)] text-[var(--text-primary)]">
                HMAC-SHA256(server_secret, normalized_epic + &quot;:&quot; + poll_id)
              </code>
              The server secret never enters the database, protecting constrained alphanumeric strings from rainbow table guessing.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] space-y-2">
            <span className="text-[var(--accent)] font-bold block">3. Ephemeral Anonymous Token Issuance</span>
            <p className="text-[var(--text-secondary)] font-sans">
              A 256-bit CSPRNG token is issued exclusively to the participant&apos;s browser. The voting database receives only a SHA-256 hash of this token with a 15-minute expiration time.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] space-y-2">
            <span className="text-[var(--success)] font-bold block">4. Atomic Vote Submission</span>
            <p className="text-[var(--text-secondary)] font-sans">
              When the participant submits their choice, the database executes an atomic transaction: marks the anonymous token as consumed and increments the aggregate vote counter by 1. No identity link exists.
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
