'use client';

import React, { useState, useEffect } from 'react';
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
      {/* Page Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent)] px-3 py-1 rounded-full bg-[var(--accent-soft)]">
            {language === 'hi' ? 'नागरिक सर्वेक्षण' : 'Civic Inquiry'}
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          {t.polls.title}
        </h1>
        <p className="text-base text-[var(--text-secondary)] max-w-2xl">
          {t.polls.subtitle}
        </p>
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
        <div className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
          <ShieldCheck className="w-5 h-5 text-[var(--success)]" />
          <h3>{t.polls.rulesTitle}</h3>
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
