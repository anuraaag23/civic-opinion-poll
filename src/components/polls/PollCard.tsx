'use client';

import React from 'react';
import Link from 'next/link';
import { Poll } from '@/lib/types';
import { useI18n } from '@/lib/i18n/context';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassBadge } from '@/components/ui/GlassBadge';
import { GlassButton } from '@/components/ui/GlassButton';
import { ArrowRight, Calendar, Users, Globe, Building2, Vote, Zap } from 'lucide-react';

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
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <GlassBadge variant={statusVariant} size="sm" interactive>
              {isLive && (
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                </span>
              )}
              <span>{statusLabel}</span>
            </GlassBadge>

            {isPM && (
              <GlassBadge variant="accent" size="sm" interactive>
                <Globe className="w-3 h-3 text-blue-500 shrink-0" />
                <span>{language === 'hi' ? 'PM • संपूर्ण भारत' : 'PM • India Only'}</span>
              </GlassBadge>
            )}

            {poll.requires_verification === false && (
              <GlassBadge variant="success" size="sm" interactive>
                <Zap className="w-3 h-3 text-emerald-500 fill-emerald-500/20 shrink-0" />
                <span>{language === 'hi' ? 'ओपन पोल' : 'Open (No Phone)'}</span>
              </GlassBadge>
            )}

            {isCM && (
              <GlassBadge variant="success" size="sm" interactive>
                <Building2 className="w-3 h-3 text-emerald-500 shrink-0" />
                <span>{language === 'hi' ? 'CM • राज्य विधानसभा' : 'CM • State Assembly'}</span>
              </GlassBadge>
            )}

            <GlassBadge variant="warning" size="sm" interactive>
              <Calendar className="w-3 h-3 text-amber-500 shrink-0" />
              <span>{language === 'hi' ? `${poll.poll_month === 'October' ? 'अक्टूबर' : (poll.poll_month || 'अक्टूबर')} ${poll.poll_year || 2026}` : `${poll.poll_month || 'October'} ${poll.poll_year || 2026}`}</span>
            </GlassBadge>
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
