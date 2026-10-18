'use client';

import React from 'react';
import Link from 'next/link';
import { Poll } from '@/lib/types';
import { useI18n } from '@/lib/i18n/context';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassBadge } from '@/components/ui/GlassBadge';
import { GlassButton } from '@/components/ui/GlassButton';
import { ArrowRight, BarChart3, Calendar, Users, Globe, Building2, Vote } from 'lucide-react';

interface PollCardProps {
  poll: Poll;
}

export function PollCard({ poll }: PollCardProps) {
  const { t, language } = useI18n();

  const title = language === 'hi' ? poll.title_hi : poll.title_en;
  const description = language === 'hi' ? poll.description_hi : poll.description_en;
  const isLive = poll.status === 'LIVE';

  const isPM = poll.id === 'poll-national-2029' || poll.slug.includes('pm') || poll.slug.includes('national');
  const isCM = poll.id === 'poll-state-cm-2029' || poll.slug.includes('cm') || poll.slug.includes('state');

  const targetLink = isPM ? '/pm' : isCM ? '/cm' : `/polls/${poll.slug}`;
  const resultsLink = isPM
    ? '/polls/national-opinion-poll-2029/results'
    : isCM
    ? '/polls/national-opinion-poll-2029/results?state=uttar-pradesh'
    : `/polls/${poll.slug}/results`;

  const statusVariant = isLive ? 'success' : poll.status === 'CLOSED' ? 'neutral' : 'warning';
  const statusLabel =
    poll.status === 'LIVE'
      ? t.common.liveBadge
      : poll.status === 'CLOSED'
      ? t.common.closedBadge
      : poll.status;

  return (
    <GlassCard interactive className="flex flex-col justify-between space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <GlassBadge variant={statusVariant}>
              {isLive && <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse" />}
              {statusLabel}
            </GlassBadge>

            {isPM && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]/30">
                <Globe className="w-3 h-3" />
                <span>{language === 'hi' ? 'PM • संपूर्ण भारत' : 'PM • India Only'}</span>
              </span>
            )}

            {isCM && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                <Building2 className="w-3 h-3" />
                <span>{language === 'hi' ? 'CM • राज्य विधानसभा' : 'CM • State Assembly'}</span>
              </span>
            )}
          </div>

          <span className="text-xs text-[var(--text-tertiary)] font-mono">
            {poll.slug}
          </span>
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
            {title}
          </h3>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-3">
            {description}
          </p>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-[var(--border-glass)]">
        <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-[var(--accent)]" />
            <span>
              <strong suppressHydrationWarning>{poll.total_votes.toLocaleString('en-IN')}</strong> {t.polls.totalResponses}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
            <span suppressHydrationWarning>{new Date(poll.end_at).toLocaleDateString('en-IN')}</span>
          </div>
        </div>

        <div className="pt-2">
          {isLive ? (
            <Link href={targetLink} className="w-full block">
              <GlassButton variant="primary" size="md" className="w-full gap-2 justify-center font-bold shadow-md">
                <Vote className="w-4 h-4" />
                <span>{language === 'hi' ? 'पोल देखें और वोट करें' : 'Open Poll & Vote'}</span>
                <ArrowRight className="w-4 h-4" />
              </GlassButton>
            </Link>
          ) : (
            <Link href={targetLink} className="w-full block">
              <GlassButton variant="secondary" size="md" className="w-full justify-center font-bold">
                <span>{statusLabel} — {language === 'hi' ? 'विवरण देखें' : 'View Poll Details'}</span>
              </GlassButton>
            </Link>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
