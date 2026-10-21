'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { OptionResult, PollStatus } from '@/lib/types';
import { useI18n } from '@/lib/i18n/context';
import { StateSelector } from '@/components/common/StateSelector';
import { getStateById } from '@/lib/data/parties';
import { ResultBar } from './ResultBar';
import { VoterAssuranceCard } from '@/components/verification/VoterAssuranceCard';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassBadge } from '@/components/ui/GlassBadge';
import { GlassButton } from '@/components/ui/GlassButton';
import { DisclaimerBanner } from '@/components/layout/DisclaimerBanner';
import {
  BarChart3,
  RefreshCw,
  ShieldAlert,
  Vote,
  ArrowRight,
  Share2,
  Check,
  Radio,
  Activity,
  Globe,
  Building2,
  MapPin,
  Calendar,
  Zap,
  Landmark,
} from 'lucide-react';

interface LiveResultsViewProps {
  pollIdOrSlug: string;
}

const MONTH_OPTIONS = [
  { key: '2026-10', nameEn: 'October 2026 (Current)', nameHi: 'अक्टूबर 2026 (वर्तमान)' },
  { key: '2026-09', nameEn: 'September 2026', nameHi: 'सितंबर 2026' },
  { key: '2026-08', nameEn: 'August 2026', nameHi: 'अगस्त 2026' },
  { key: '2026-07', nameEn: 'July 2026', nameHi: 'जुलाई 2026' },
  { key: '2026-06', nameEn: 'June 2026', nameHi: 'जून 2026' },
  { key: '2026-05', nameEn: 'May 2026', nameHi: 'मई 2026' },
  { key: '2026-04', nameEn: 'April 2026', nameHi: 'अप्रैल 2026' },
  { key: '2026-03', nameEn: 'March 2026', nameHi: 'मार्च 2026' },
  { key: '2026-02', nameEn: 'February 2026', nameHi: 'फरवरी 2026' },
  { key: '2026-01', nameEn: 'January 2026', nameHi: 'जनवरी 2026' },
];

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
  const searchParams = useSearchParams();
  const initialStateParam = searchParams.get('state');

  // View Scope: 'PM' (All India) or 'CM' (State Assembly)
  const [scope, setScope] = useState<'PM' | 'CM'>(initialStateParam ? 'CM' : 'PM');
  const [selectedStateId, setSelectedStateId] = useState<string>(initialStateParam || 'uttar-pradesh');

  // Timeframe Filter: 7 Days / Month / Year / All Time
  const [timeframe, setTimeframe] = useState<'7d' | 'month' | 'year' | 'all'>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-10');
  const [timeframeLabelEn, setTimeframeLabelEn] = useState<string>('All Time (Overall Results)');
  const [timeframeLabelHi, setTimeframeLabelHi] = useState<string>('कुल परिणाम (समग्र मत)');
  const [pollMonth, setPollMonth] = useState<string>('October');
  const [pollYear, setPollYear] = useState<number>(2026);

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

  const currentState = getStateById(selectedStateId);

  const loadResults = useCallback(async () => {
    try {
      const endpoint =
        scope === 'PM'
          ? `/api/polls/${pollIdOrSlug || 'poll-national-2029'}/results?timeframe=${timeframe}&month=${selectedMonth}`
          : `/api/polls/poll-state-cm-2029/results?state=${selectedStateId}&timeframe=${timeframe}&month=${selectedMonth}`;

      const res = await fetch(endpoint);
      const data = await res.json();
      if (data.success) {
        setResults(data.results);
        setTotalResponses(data.totalResponses);
        setUpdatedAt(data.updatedAt);
        setPollTitleEn(data.pollTitleEn);
        setPollTitleHi(data.pollTitleHi);
        setPollStatus(data.status);
        if (data.timeframeLabelEn) setTimeframeLabelEn(data.timeframeLabelEn);
        if (data.timeframeLabelHi) setTimeframeLabelHi(data.timeframeLabelHi);
        if (data.pollMonth) setPollMonth(data.pollMonth);
        if (data.pollYear) setPollYear(data.pollYear);
      }
    } catch (err) {
      console.error('Failed to fetch results', err);
    } finally {
      setIsLoading(false);
    }
  }, [scope, selectedStateId, pollIdOrSlug, timeframe, selectedMonth]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        loadResults(),
        new Promise((resolve) => setTimeout(resolve, 600)),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    let active = true;

    const endpoint =
      scope === 'PM'
        ? `/api/polls/${pollIdOrSlug || 'poll-national-2029'}/results?timeframe=${timeframe}&month=${selectedMonth}`
        : `/api/polls/poll-state-cm-2029/results?state=${selectedStateId}&timeframe=${timeframe}&month=${selectedMonth}`;

    fetch(endpoint)
      .then((res) => res.json())
      .then((data) => {
        if (active && data.success) {
          setResults(data.results);
          setTotalResponses(data.totalResponses);
          setUpdatedAt(data.updatedAt);
          setPollTitleEn(data.pollTitleEn);
          setPollTitleHi(data.pollTitleHi);
          setPollStatus(data.status);
          if (data.timeframeLabelEn) setTimeframeLabelEn(data.timeframeLabelEn);
          if (data.timeframeLabelHi) setTimeframeLabelHi(data.timeframeLabelHi);
          if (data.pollMonth) setPollMonth(data.pollMonth);
          if (data.pollYear) setPollYear(data.pollYear);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch results', err);
        if (active) setIsLoading(false);
      });

    const interval = setInterval(() => {
      loadResults();
    }, 4000);

    const tickerTimer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % REGIONAL_TICKER_EN.length);
    }, 3500);

    return () => {
      active = false;
      clearInterval(interval);
      clearInterval(tickerTimer);
    };
  }, [loadResults, scope, selectedStateId, pollIdOrSlug, timeframe, selectedMonth]);

  const maxPercentage = Math.max(...results.map((r) => r.percentage), 1);
  const pollTitle = language === 'hi' ? pollTitleHi : pollTitleEn;
  const currentTicker = language === 'hi' ? REGIONAL_TICKER_HI[tickerIndex] : REGIONAL_TICKER_EN[tickerIndex];

  const handleShare = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: `Mera Vote — ${pollTitle}`,
          text: `Check out live results on Mera Vote!`,
          url: window.location.href,
        });
      } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // Ignore share abort
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8 py-4">
      {/* Live Counting Broadcast Badge */}
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between p-3 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-glass)] shadow-sm gap-2">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--success)] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--success)]"></span>
          </span>
          <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-[var(--success)]">
            {language === 'hi' ? 'लाइव जनमत गणना' : 'LIVE PUBLIC COUNTING'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] font-mono">
          <Activity className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span>{language === 'hi' ? 'वास्तविक समय परिणाम' : 'Real-time Results'}</span>
        </div>
      </div>

      {/* ── PM vs CM SCOPE TOGGLE ─────────────────────────────────────────── */}
      <div className="p-1.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-glass)] grid grid-cols-2 gap-1.5 shadow-xs">
        <button
          type="button"
          onClick={() => setScope('PM')}
          className={`py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            scope === 'PM'
              ? 'bg-[var(--accent)] text-white shadow-md'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-glass)]'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>{language === 'hi' ? 'PM जनमत परिणाम (संपूर्ण भारत)' : 'PM Results (India Only)'}</span>
        </button>

        <button
          type="button"
          onClick={() => setScope('CM')}
          className={`py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            scope === 'CM'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-glass)]'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>{language === 'hi' ? 'CM जनमत परिणाम (राज्यवार)' : 'CM Results (State-wise)'}</span>
        </button>
      </div>

      {/* When in CM mode, show StateSelector */}
      {scope === 'CM' && (
        <div className="p-4 rounded-2xl glass-panel space-y-2 border border-emerald-500/30 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-[var(--text-primary)] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>{language === 'hi' ? 'राज्य चुनें जिसके परिणाम देखने हैं:' : 'Select state to view CM results:'}</span>
            </span>
            {currentState && (
              <span className="text-xs text-[var(--text-tertiary)] font-mono">
                {currentState.assemblySeats} Assembly Seats
              </span>
            )}
          </div>
          <StateSelector
            selectedStateId={selectedStateId}
            onSelectState={(id) => setSelectedStateId(id)}
          />
        </div>
      )}

      {/* Page Title & Scope Header - Centered Symmetric Layout */}
      <div className="space-y-2.5 text-center">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <GlassBadge variant="accent">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>{scope === 'PM' ? 'National Lok Sabha 2029' : `${currentState?.name_en || 'State'} Assembly`}</span>
          </GlassBadge>
          <GlassBadge variant={pollStatus === 'LIVE' ? 'success' : 'neutral'}>
            <span>{pollStatus}</span>
          </GlassBadge>
          {scope === 'PM' ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--accent)] px-2.5 py-0.5 rounded-full bg-[var(--accent-soft)]">
              <Globe className="w-3 h-3 shrink-0" />
              <span>India Only</span>
            </span>
          ) : (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
              {currentState ? `${currentState.name_en} (${currentState.code})` : 'State Level'}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30">
            <Calendar className="w-3 h-3 shrink-0" />
            <span>{language === 'hi' ? `${pollMonth} ${pollYear} (वर्ष: ${pollYear})` : `${pollMonth} ${pollYear} (Year: ${pollYear})`}</span>
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-primary)] text-center">
          {pollTitle || (scope === 'PM' ? 'Prime Minister Poll Results' : 'Chief Minister Poll Results')}
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] text-center max-w-xl mx-auto leading-relaxed">
          {scope === 'PM'
            ? language === 'hi'
              ? 'संपूर्ण भारत स्तर पर लोकसभा के लिए राष्ट्रीय नागरिक जनमत का लाइव वितरण।'
              : 'All-India voter preference distribution across national contesting parties.'
            : language === 'hi'
            ? `${currentState?.name_hi || 'राज्य'} विधानसभा के लिए पंजीकृत दलों का वास्तविक समय जनमत वितरण।`
            : `Real-time public opinion distribution among active parties contesting in ${currentState?.name_en || 'this state'}.`}
        </p>
      </div>

      {/* ── TIMEFRAME SELECTOR: 7 Days / Monthly / Yearly / All Time ── */}
      <div className="p-3 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-glass)] space-y-2.5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 px-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
            <span>{language === 'hi' ? 'समय अवधि परिणाम (Timeframe Analytics):' : 'Timeframe Analytics:'}</span>
          </span>
          <span className="text-[11px] font-bold text-[var(--accent)] px-2 py-0.5 rounded bg-[var(--accent-soft)] self-start sm:self-auto">
            {language === 'hi' ? timeframeLabelHi : timeframeLabelEn}
          </span>
        </div>

        {/* Real Icons (No Emojis) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { id: '7d', labelEn: 'Last 7 Days', labelHi: 'पिछले 7 दिन', icon: Zap, iconColor: 'text-amber-500' },
            { id: 'month', labelEn: 'Monthly', labelHi: 'मासिक परिणाम', icon: Calendar, iconColor: 'text-blue-500' },
            { id: 'year', labelEn: 'Yearly (2026)', labelHi: 'वर्ष 2026', icon: Landmark, iconColor: 'text-emerald-500' },
            { id: 'all', labelEn: 'All Time', labelHi: 'कुल परिणाम', icon: BarChart3, iconColor: 'text-[var(--accent)]' },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTimeframe(tab.id as any)}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  timeframe === tab.id
                    ? 'bg-[var(--accent)] text-white shadow-sm ring-1 ring-[var(--accent)] scale-[1.02]'
                    : 'bg-[var(--bg-primary)]/70 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)] border border-[var(--border-glass)]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${timeframe === tab.id ? 'text-white' : tab.iconColor}`} />
                <span>{language === 'hi' ? tab.labelHi : tab.labelEn}</span>
              </button>
            );
          })}
        </div>

        {/* Dedicated Monthly Filter Dropdown when viewing Monthly breakdown */}
        {timeframe === 'month' && (
          <div className="pt-2 border-t border-[var(--border-glass)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 animate-in fade-in duration-200">
            <span className="text-xs font-bold text-[var(--text-secondary)] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span>{language === 'hi' ? 'विशिष्ट माह का परिणाम देखें:' : 'Inspect Month Separately:'}</span>
            </span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="glass-select text-xs font-bold rounded-xl py-1.5 px-3 w-full sm:max-w-xs cursor-pointer"
            >
              {MONTH_OPTIONS.map((m) => (
                <option key={m.key} value={m.key}>
                  {language === 'hi' ? m.nameHi : m.nameEn}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Mandatory Non-Affiliation Disclaimer */}
      <DisclaimerBanner />

      {/* Aggregate Overview Card */}
      <GlassCard elevated className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-glass)]">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider text-[var(--text-tertiary)] font-bold">
              {scope === 'PM'
                ? language === 'hi' ? 'कुल राष्ट्रीय प्रतिक्रियाएं' : 'Total National Responses'
                : language === 'hi' ? `${currentState?.name_hi} कुल प्रतिक्रियाएं` : `${currentState?.name_en} Total Responses`}
            </span>
            <div className="flex items-baseline gap-2">
              <span suppressHydrationWarning className="text-4xl sm:text-5xl font-black text-[var(--text-primary)] tracking-tight">
                {totalResponses.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-[var(--text-secondary)] font-semibold">
                {language === 'hi' ? 'सत्यापित मत' : 'verified responses'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <GlassButton
              variant="secondary"
              size="sm"
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="gap-1.5 text-xs active:scale-95 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 transition-transform ${isRefreshing ? 'animate-spin text-[var(--accent)]' : ''}`} />
              <span>{isRefreshing ? (language === 'hi' ? 'रीफ्रेश हो रहा है...' : 'Refreshing...') : t.results.refreshResults}</span>
            </GlassButton>
            <GlassButton
              variant="secondary"
              size="sm"
              onClick={handleShare}
              className="gap-1.5 text-xs active:scale-95 transition-all cursor-pointer"
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

      {/* Mandatory Results Methodology Disclaimer */}
      <div className="glass-panel p-5 border-l-4 border-l-[var(--warning)] space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-[var(--warning)] uppercase tracking-wider">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{language === 'hi' ? 'कार्यप्रणाली सूचना' : 'Methodology & Sample Notice'}</span>
        </div>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-medium">
          {t.results.resultsDisclaimer}
        </p>
      </div>

      {/* Action to Participate in the active scope */}
      <div className="text-center pt-2">
        <Link href={scope === 'PM' ? '/pm' : `/cm`}>
          <GlassButton size="lg" className="gap-2 shadow-md">
            <Vote className="w-4 h-4" />
            <span>
              {scope === 'PM'
                ? language === 'hi' ? 'PM जनमत में अपना मत दें' : 'Participate in PM Poll'
                : language === 'hi' ? `${currentState?.name_hi || 'राज्य'} CM जनमत में वोट दें` : `Vote in ${currentState?.name_en || 'State'} CM Poll`}
            </span>
            <ArrowRight className="w-4 h-4" />
          </GlassButton>
        </Link>
      </div>
    </div>
  );
}
