'use client';

import React from 'react';
import { useI18n } from '@/lib/i18n/context';
import { HowItWorksSection } from '@/components/home/HowItWorksSection';
import { KeyGuaranteesSection } from '@/components/home/KeyGuaranteesSection';
import { DisclaimerBanner } from '@/components/layout/DisclaimerBanner';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function HowItWorksPage() {
  const { t, language } = useI18n();

  return (
    <div className="space-y-12 sm:space-y-16 py-4">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent)] px-3 py-1 rounded-full bg-[var(--accent-soft)]">
          {language === 'hi' ? 'तकनीकी वास्तुकला' : 'Cryptographic Architecture'}
        </span>
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
              Participant inputs an EPIC number (e.g. ABC1234567). The provider verifies format and eligibility in-memory. No voter names, addresses, or electoral roll records are retrieved or stored.
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

      <div className="text-center pt-4">
        <Link href="/polls">
          <GlassButton size="lg" className="gap-2 shadow-md">
            <span>{t.hero.primaryCta}</span>
            <ArrowRight className="w-4 h-4" />
          </GlassButton>
        </Link>
      </div>
    </div>
  );
}
