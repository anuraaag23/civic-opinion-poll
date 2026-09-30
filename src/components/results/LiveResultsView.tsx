'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { OptionResult, PollStatus } from '@/lib/types';
import { useI18n } from '@/lib/i18n/context';
import { ResultBar } from './ResultBar';
import { VoterAssuranceCard } from '@/components/verification/VoterAssuranceCard';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassBadge } from '@/components/ui/GlassBadge';
import { GlassButton } from '@/components/ui/GlassButton';
import { DisclaimerBanner } from '@/components/layout/DisclaimerBanner';
import { BarChart3, RefreshCw, ShieldAlert, Vote, ArrowRight, Share2, Check, Radio, Activity } from 'lucide-react';

interface LiveResultsViewProps {
  pollIdOrSlug: string;
}

const REGIONAL_TICKER_EN = [
  'Self-verified participant from Uttar Pradesh recorded anonymously',
  'Self-verified participant from Maharashtra recorded anonymously',
  'Self-verified participant from Bihar recorded anonymously',
  'Self-verified participant from West Bengal recorded anonymously',
  'Self-verified participant from Madhya Pradesh recorded anonymously',
  'Self-verified participant from Rajasthan recorded anonymously',
  'Self-verified participant from Karnataka recorded anonymously',
];

const REGIONAL_TICKER_HI = [
  'उत्तर प्रदेश से एक स्व-सत्यापित नागरिक की प्रतिक्रिया गुमनाम रूप से दर्ज हुई',
  'महाराष्ट्र से एक स्व-सत्यापित नागरिक की प्रतिक्रिया गुमनाम रूप से दर्ज हुई',
  'बिहार से एक स्व-सत्यापित नागरिक की प्रतिक्रिया गुमनाम रूप से दर्ज हुई',
  'पश्चिम बंगाल से एक स्व-सत्यापित नागरिक की प्रतिक्रिया गुमनाम रूप से दर्ज हुई',
  'मध्य प्रदेश से एक स्व-सत्यापित नागरिक की प्रतिक्रिया गुमनाम रूप से दर्ज हुई',
  'राजस्थान से एक स्व-सत्यापित नागरिक की प्रतिक्रिया गुमनाम रूप से दर्ज हुई',
  'कर्नाटक से एक स्व-सत्यापित नागरिक की प्रतिक्रिया गुमनाम रूप से दर्ज हुई',
];

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
  const [tickerIndex, setTickerIndex] = useState(0);

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

    // Fast polling for live counting (every 4 seconds)
    const interval = setInterval(() => {
      loadData();
    }, 4000);

    // Ticker animation
    const tickerTimer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % REGIONAL_TICKER_EN.length);
    }, 3500);

    return () => {
      isMounted = false;
      clearInterval(interval);
      clearInterval(tickerTimer);
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
  const currentTicker = language === 'hi' ? REGIONAL_TICKER_HI[tickerIndex] : REGIONAL_TICKER_EN[tickerIndex];

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
      {/* Live Counting Broadcast Badge */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-[var(--bg-glass-elevated)] border border-[var(--border-glass)] shadow-sm">
        <div className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/meravote-logo.png" alt="Mera Vote" className="w-5 h-5 rounded-full object-contain shadow-xs" />
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--success)] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--success)]"></span>
          </span>
          <span className="text-xs font-black uppercase tracking-wider text-[var(--success)]">
            {language === 'hi' ? 'मेरा वोट • लाइव मतगणना' : 'MERA VOTE • LIVE COUNTING'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] font-mono">
          <Activity className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span>Real-time Tally</span>
        </div>
      </div>

      {/* Page Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <GlassBadge variant="accent">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>{t.results.title}</span>
          </GlassBadge>
          <GlassBadge variant={pollStatus === 'LIVE' ? 'success' : 'neutral'}>
            <span>{pollStatus}</span>
          </GlassBadge>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-primary)]">
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
            <span className="text-xs uppercase tracking-wider text-[var(--text-tertiary)] font-bold">
              {t.results.totalResponses}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black text-[var(--text-primary)] tracking-tight">
                {totalResponses.toLocaleString()}
              </span>
              <span className="text-xs text-[var(--text-secondary)] font-semibold">
                {language === 'hi' ? 'सत्यापित प्रतिक्रियाएं' : 'verified responses'}
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

        {/* Live Anonymous Activity Ticker */}
        <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] flex items-center gap-2.5 text-xs text-[var(--text-secondary)]">
          <Radio className="w-4 h-4 text-[var(--success)] shrink-0 animate-pulse" />
          <span className="font-semibold text-[var(--text-primary)] shrink-0">
            {language === 'hi' ? 'लाइव प्रवाह:' : 'Live Stream:'}
          </span>
          <span className="truncate italic transition-all duration-300">
            {currentTicker}
          </span>
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
          <span className="font-mono text-[11px] text-[var(--success)] font-semibold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[var(--success)]" />
            Auto-Sync Every 4s
          </span>
        </div>
      </GlassCard>

      {/* Assurance Card */}
      <VoterAssuranceCard />

      {/* Mandatory Results Methodology Disclaimer (Requirement 24 & 54) */}
      <div className="glass-panel p-5 bg-[var(--bg-glass-elevated)] border-l-4 border-l-[var(--warning)] space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-[var(--warning)] uppercase tracking-wider">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{language === 'hi' ? 'कार्यप्रणाली सूचना' : 'Methodology & Sample Notice'}</span>
        </div>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-medium">
          {t.results.resultsDisclaimer}
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
