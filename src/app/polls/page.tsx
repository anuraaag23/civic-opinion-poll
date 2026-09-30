'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Poll } from '@/lib/types';
import { useI18n } from '@/lib/i18n/context';
import { PollCard } from '@/components/polls/PollCard';
import { DisclaimerBanner } from '@/components/layout/DisclaimerBanner';
import { GlassCard } from '@/components/ui/GlassCard';
import { ShieldCheck, Vote, Loader2 } from 'lucide-react';

export default function PollsPage() {
  const { t, language } = useI18n();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPolls() {
      try {
        const res = await fetch('/api/polls');
        const data = await res.json();
        if (data.success) {
          setPolls(data.polls);
        }
      } catch (err) {
        console.error('Failed to load polls', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadPolls();
  }, []);

  return (
    <div className="space-y-10 sm:space-y-14 py-4">
      {/* Page Header with Mera Vote Logo */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-5">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white dark:bg-white/95 border border-[var(--border-glass)] p-1.5 flex items-center justify-center shrink-0 shadow-md overflow-hidden">
          <Image
            src="/meravote-logo.png"
            alt="Mera Vote Logo"
            width={64}
            height={64}
            className="w-full h-full object-contain"
            priority
          />
        </div>
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent)] px-3 py-1 rounded-full bg-[var(--accent-soft)]">
              {language === 'hi' ? 'मेरा वोट • नागरिक सर्वेक्षण' : 'Mera Vote • Civic Inquiry'}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
            {t.polls.title}
          </h1>
          <p className="text-base text-[var(--text-secondary)] max-w-2xl">
            {t.polls.subtitle}
          </p>
        </div>
      </div>

      {/* Mandatory Disclaimer */}
      <DisclaimerBanner />

      {/* Poll Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 text-[var(--accent)] animate-spin" />
          <p className="text-sm text-[var(--text-secondary)]">{t.common.loading}</p>
        </div>
      ) : polls.length === 0 ? (
        <GlassCard className="text-center py-16">
          <Vote className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-3" />
          <p className="text-base text-[var(--text-secondary)]">{t.polls.noActivePolls}</p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {polls.map((poll) => (
            <PollCard key={poll.id} poll={poll} />
          ))}
        </div>
      )}

      {/* Participation Guidelines Card */}
      <GlassCard className="bg-[var(--bg-glass-elevated)] space-y-4">
        <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-[var(--border-glass)]">
          <div className="flex items-center gap-2.5 text-sm font-bold text-[var(--text-primary)]">
            <div className="w-8 h-8 rounded-xl bg-white dark:bg-white/95 border border-[var(--border-glass)] p-1 flex items-center justify-center shrink-0 shadow-xs">
              <Image src="/meravote-logo.png" alt="Mera Vote" width={28} height={28} className="w-full h-full object-contain" />
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[var(--success)]" />
              <span>{t.polls.rulesTitle}</span>
            </div>
          </div>
          <span className="text-[11px] font-bold text-[var(--accent)] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--accent-soft)]">
            {language === 'hi' ? 'मेरा वोट दिशानिर्देश' : 'Mera Vote Guidelines'}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[var(--text-secondary)] leading-relaxed">
          <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)]">
            <span className="font-semibold text-[var(--text-primary)] block mb-1">01. {t.howItWorks.step1Title}</span>
            {t.polls.rule1}
          </div>
          <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)]">
            <span className="font-semibold text-[var(--text-primary)] block mb-1">02. {t.howItWorks.step2Title}</span>
            {t.polls.rule2}
          </div>
          <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)]">
            <span className="font-semibold text-[var(--text-primary)] block mb-1">03. {t.howItWorks.step3Title}</span>
            {t.polls.rule3}
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
