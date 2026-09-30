'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { OptionResult, PollStatus } from '@/lib/types';
import { useI18n } from '@/lib/i18n/context';
import { ResultBar } from './ResultBar';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassBadge } from '@/components/ui/GlassBadge';
import { GlassButton } from '@/components/ui/GlassButton';
import { DisclaimerBanner } from '@/components/layout/DisclaimerBanner';
import { BarChart3, RefreshCw, ShieldAlert, Vote, ArrowRight, Share2, Check } from 'lucide-react';

interface LiveResultsViewProps {
  pollIdOrSlug: string;
}

export function LiveResultsView({ pollIdOrSlug }: LiveResultsViewProps) {
  const { t, language } = useI18n();
  const [results, setResults] = useState<OptionResult[]>([]);
  const [totalResponses, setTotalResponses] = useState<number>(0);
  const [updatedAt, setUpdatedAt] = useState<string>('');
  const [pollTitleEn, setPollTitleEn] = useState<string>('');
  const [pollTitleHi, setPollTitleHi] = useState<string>('');
  const [pollStatus, setPollStatus] = useState<PollStatus>('LIVE');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const res = await fetch(`/api/polls/${pollIdOrSlug}/results`);
        const data = await res.json();
        if (isMounted && data.success) {
          setResults(data.results);
          setTotalResponses(data.totalResponses);
          setUpdatedAt(data.updatedAt);
          setPollTitleEn(data.pollTitleEn);
          setPollTitleHi(data.pollTitleHi);
          setPollStatus(data.status);
        }
      } catch (err) {
        console.error('Failed to fetch results', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();

    const interval = setInterval(() => {
      loadData();
    }, 10000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [pollIdOrSlug]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/polls/${pollIdOrSlug}/results`);
      const data = await res.json();
      if (data.success) {
        setResults(data.results);
        setTotalResponses(data.totalResponses);
        setUpdatedAt(data.updatedAt);
        setPollTitleEn(data.pollTitleEn);
        setPollTitleHi(data.pollTitleHi);
        setPollStatus(data.status);
      }
    } catch (err) {
      console.error('Failed to refresh results', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const maxPercentage = Math.max(...results.map((r) => r.percentage), 1);
  const pollTitle = language === 'hi' ? pollTitleHi : pollTitleEn;

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: pollTitle,
          text: `${pollTitle} - Independent Civic Opinion Poll Results`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // Ignore share abort
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      {/* Page Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <GlassBadge variant="accent">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>{t.results.title}</span>
          </GlassBadge>
          <GlassBadge variant={pollStatus === 'LIVE' ? 'success' : 'neutral'}>
            {pollStatus === 'LIVE' && <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse" />}
            <span>{pollStatus}</span>
          </GlassBadge>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
          {pollTitle || t.results.title}
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          {t.results.subtitle}
        </p>
      </div>

      {/* Mandatory Non-Affiliation Disclaimer */}
      <DisclaimerBanner />

      {/* Aggregate Overview Card */}
      <GlassCard elevated className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-glass)]">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider text-[var(--text-tertiary)] font-semibold">
              {t.results.totalResponses}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-[var(--text-primary)]">
                {totalResponses.toLocaleString()}
              </span>
              <span className="text-xs text-[var(--text-secondary)] font-medium">
                {language === 'hi' ? 'सत्यापित प्रतिक्रियाएं' : 'verified participants'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <GlassButton
              variant="secondary"
              size="sm"
              onClick={handleManualRefresh}
              isLoading={isRefreshing}
              className="gap-1.5 text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{t.results.refreshResults}</span>
            </GlassButton>
            <GlassButton
              variant="secondary"
              size="sm"
              onClick={handleShare}
              className="gap-1.5 text-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[var(--success)]" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? (language === 'hi' ? 'कॉपी हुआ!' : 'Copied!') : t.results.shareResults}</span>
            </GlassButton>
          </div>
        </div>

        {/* Results List */}
        {isLoading ? (
          <div className="py-12 text-center text-sm text-[var(--text-secondary)]">
            {t.common.loading}
          </div>
        ) : results.length === 0 ? (
          <div className="py-12 text-center text-sm text-[var(--text-secondary)]">
            {t.results.noVotesYet}
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((result) => (
              <ResultBar
                key={result.option_id}
                result={result}
                maxPercentage={maxPercentage}
              />
            ))}
          </div>
        )}

        <div className="text-xs text-[var(--text-tertiary)] flex items-center justify-between pt-2">
          <span>
            {t.results.lastUpdated}: {updatedAt ? new Date(updatedAt).toLocaleTimeString() : t.results.justNow}
          </span>
          <span className="font-mono text-[11px]">Realtime Active Sync</span>
        </div>
      </GlassCard>

      {/* Mandatory Results Methodology Disclaimer (Requirement 54) */}
      <div className="glass-panel p-5 bg-[var(--bg-glass-elevated)] border-l-4 border-l-[var(--warning)] space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-[var(--warning)] uppercase tracking-wider">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{language === 'hi' ? 'कार्यप्रणाली सूचना' : 'Methodology & Sample Notice'}</span>
        </div>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-medium">
          {t.results.methodologyDisclaimer}
        </p>
      </div>

      {/* Action to Participate if user hasn't yet */}
      {pollStatus === 'LIVE' && (
        <div className="text-center pt-2">
          <Link href={`/polls/${pollIdOrSlug}`}>
            <GlassButton size="lg" className="gap-2 shadow-md">
              <Vote className="w-4 h-4" />
              <span>{t.polls.participateButton}</span>
              <ArrowRight className="w-4 h-4" />
            </GlassButton>
          </Link>
        </div>
      )}
    </div>
  );
}
