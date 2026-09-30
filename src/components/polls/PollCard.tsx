'use client';

import React from 'react';
import Link from 'next/link';
import { Poll } from '@/lib/types';
import { useI18n } from '@/lib/i18n/context';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassBadge } from '@/components/ui/GlassBadge';
import { GlassButton } from '@/components/ui/GlassButton';
import { ArrowRight, BarChart3, Calendar, Users } from 'lucide-react';

interface PollCardProps {
  poll: Poll;
}

export function PollCard({ poll }: PollCardProps) {
  const { t, language } = useI18n();

  const title = language === 'hi' ? poll.title_hi : poll.title_en;
  const description = language === 'hi' ? poll.description_hi : poll.description_en;
  const isLive = poll.status === 'LIVE';

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
        <div className="flex items-center justify-between gap-2">
          <GlassBadge variant={statusVariant}>
            {isLive && <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse" />}
            {statusLabel}
          </GlassBadge>
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
              <strong>{poll.total_votes.toLocaleString()}</strong> {t.polls.totalResponses}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
            <span>{new Date(poll.end_at).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          {isLive ? (
            <Link href={`/polls/${poll.slug}`} className="flex-1">
              <GlassButton size="md" className="w-full gap-1.5">
                <span>{t.polls.participateButton}</span>
                <ArrowRight className="w-4 h-4" />
              </GlassButton>
            </Link>
          ) : (
            <GlassButton size="md" disabled className="flex-1">
              {statusLabel}
            </GlassButton>
          )}
          <Link href={`/polls/${poll.slug}/results`}>
            <GlassButton variant="secondary" size="md" className="gap-1.5" title={t.polls.viewResultsButton}>
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">{t.polls.viewResultsButton}</span>
            </GlassButton>
          </Link>
        </div>
      </div>
    </GlassCard>
  );
}
