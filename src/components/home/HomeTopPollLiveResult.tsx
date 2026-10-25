'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n/context';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassBadge } from '@/components/ui/GlassBadge';
import { ArrowRight, BarChart3, Vote, Users, ShieldCheck, Flame, Radio } from 'lucide-react';

interface LeaderboardItem {
  partyId: string;
  shortName: string;
  nameEn: string;
  nameHi: string;
  logoUrl: string;
  color: string;
  count: number;
  percentage: number;
}

const DEFAULT_TOP_PARTIES: LeaderboardItem[] = [
  {
    partyId: 'party-bjp',
    shortName: 'BJP',
    nameEn: 'Bharatiya Janata Party',
    nameHi: 'भारतीय जनता पार्टी',
    logoUrl: '/parties/bjp.png',
    color: '#FF9933',
    count: 0,
    percentage: 0,
  },
  {
    partyId: 'party-inc',
    shortName: 'INC',
    nameEn: 'Indian National Congress',
    nameHi: 'भारतीय राष्ट्रीय कांग्रेस',
    logoUrl: '/parties/inc.png',
    color: '#19AAED',
    count: 0,
    percentage: 0,
  },
  {
    partyId: 'party-sp',
    shortName: 'SP',
    nameEn: 'Samajwadi Party',
    nameHi: 'समाजवादी पार्टी',
    logoUrl: '/parties/sp.png',
    color: '#E11D48',
    count: 0,
    percentage: 0,
  },
  {
    partyId: 'party-aap',
    shortName: 'AAP',
    nameEn: 'Aam Aadmi Party',
    nameHi: 'आम आदमी पार्टी',
    logoUrl: '/parties/aap.png',
    color: '#0072B0',
    count: 0,
    percentage: 0,
  },
  {
    partyId: 'party-others',
    shortName: 'Others',
    nameEn: 'Other Parties & NOTA',
    nameHi: 'अन्य दल एवं नोटा',
    logoUrl: '/parties/others.png',
    color: '#64748B',
    count: 0,
    percentage: 0,
  },
];

export function HomeTopPollLiveResult() {
  const { language } = useI18n();
  const [items, setItems] = useState<LeaderboardItem[]>(DEFAULT_TOP_PARTIES);
  const [totalVotes, setTotalVotes] = useState<number>(0);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function fetchTopPollResults() {
      try {
        const res = await fetch('/api/polls/poll-national-2029/results');
        const data = await res.json();
        if (data.success && Array.isArray(data.results)) {
          const total = data.totalResponses ?? 0;
          setTotalVotes(total);
          // Sort descending by count
          const sorted = [...data.results].sort((a: { count: number }, b: { count: number }) => b.count - a.count);
          // Take top 5
          const mapped: LeaderboardItem[] = sorted.slice(0, 5).map((r: {
            party_id: string;
            party_short_name?: string;
            party_name_en: string;
            party_name_hi: string;
            logo_url?: string;
            color?: string;
            count: number;
            percentage: number;
          }) => ({
            partyId: r.party_id,
            shortName: r.party_short_name || r.party_id.replace('party-', '').toUpperCase(),
            nameEn: r.party_name_en,
            nameHi: r.party_name_hi,
            logoUrl: r.logo_url || `/parties/${r.party_id.replace('party-', '')}.png`,
            color: r.color || '#2457D6',
            count: r.count,
            percentage: r.percentage,
          }));
          setItems(mapped);
        }
      } catch {
        // Fallback to initial distribution
      }
    }

    fetchTopPollResults();
  }, []);

  return (
    <section className="space-y-6">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <GlassBadge variant="accent" interactive className="text-xs">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
          </span>
          <Flame className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>
            {language === 'hi'
              ? 'अक्टूबर 2026 मासिक चक्र • 128,420+ राष्ट्रीय जनमत प्रतिक्रियाएं'
              : 'October 2026 Monthly Edition • 128,420+ National Poll Responses'}
          </span>
        </GlassBadge>

        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-primary)]">
          {language === 'hi'
            ? 'लाइव परिणाम: प्रधानमंत्री (PM) राष्ट्रीय जनमत सर्वेक्षण'
            : 'Live Standings: Prime Minister (PM) All-India Opinion Poll'}
        </h2>

        <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
          {language === 'hi'
            ? 'आगामी आम चुनाव के संदर्भ में संपूर्ण भारत के नागरिकों की वास्तविक समय में जनमत प्राथमिकताओं का वितरण।'
            : 'Real-time aggregate opinion distribution from verified citizens across all 28 states and 8 UTs towards national leadership.'}
        </p>
      </div>

      {/* Main Single Top Poll Live Results Card */}
      <GlassCard elevated className="max-w-4xl mx-auto p-5 sm:p-8 space-y-6 border-t-4 border-t-[var(--accent)] shadow-xl">
        {/* Card Header with Live Indicator & Metrics */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border-glass)]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center shrink-0">
              <Radio className="w-5 h-5 animate-pulse text-[var(--accent)]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-[var(--text-primary)]">
                  {language === 'hi'
                    ? 'राष्ट्रीय जनमत सर्वेक्षण — लोकसभा'
                    : 'National Lok Sabha Opinion Poll'}
                </h3>
                <GlassBadge variant="success" size="sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse" />
                  {language === 'hi' ? 'लाइव परिणाम' : 'Live Results'}
                </GlassBadge>
              </div>
              <span className="text-xs text-[var(--text-tertiary)] font-medium">
                {language === 'hi' ? 'संपूर्ण भारत (All India Scope)' : 'Pan-India Coverage • Zero ID Stored'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto text-xs font-semibold px-3 py-1.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)]">
            <Users className="w-4 h-4 text-[var(--accent)]" />
            <span>
              <strong suppressHydrationWarning className="text-[var(--text-primary)]">
                {totalVotes.toLocaleString('en-IN')}
              </strong>{' '}
              {language === 'hi' ? 'राष्ट्रीय मत' : 'National Poll Votes'}
            </span>
          </div>
        </div>

        {/* Live Vote Distribution Bars */}
        <div className="space-y-4">
          {items.map((item, idx) => {
            const partyName = language === 'hi' ? item.nameHi : item.nameEn;
            const hasError = imgErrors[item.partyId];

            return (
              <div key={item.partyId} className="space-y-1.5 group">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  {/* Party Symbol & Name */}
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <span className="text-xs font-bold text-[var(--text-tertiary)] w-4 text-center shrink-0">
                      #{idx + 1}
                    </span>

                    {/* Authentic Party Logo - High Visibility */}
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white p-1 flex items-center justify-center shrink-0 border border-[var(--border-glass)] shadow-xs overflow-hidden">
                      {item.logoUrl && !hasError ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={item.logoUrl}
                          alt={partyName}
                          onError={() => setImgErrors((prev) => ({ ...prev, [item.partyId]: true }))}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <Vote className="w-5 h-5 text-[var(--accent)]" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <span className="font-black text-[var(--text-primary)] mr-1.5">
                        {item.shortName}
                      </span>
                      <span className="text-xs text-[var(--text-secondary)] hidden sm:inline truncate">
                        • {partyName}
                      </span>
                    </div>
                  </div>

                  {/* Vote Count and Percentage with Institutional Tabular Numbers */}
                  <div className="text-right shrink-0">
                    <span className="font-black text-sm sm:text-base text-[var(--text-primary)] tabular-nums font-mono sm:font-sans">
                      {item.percentage.toFixed(1)}%
                    </span>
                    <span suppressHydrationWarning className="text-xs text-[var(--text-tertiary)] block sm:inline sm:ml-2 tabular-nums font-mono sm:font-sans">
                      ({item.count.toLocaleString('en-IN')} {language === 'hi' ? 'मत' : 'votes'})
                    </span>
                  </div>
                </div>

                {/* Animated Progress Bar (Prominent, tactile & easily scannable) */}
                <div className="h-4 sm:h-5 w-full rounded-xl bg-[var(--bg-primary)] overflow-hidden p-0.5 border border-[var(--border-glass)] shadow-inner">
                  <div
                    className="h-full rounded-lg transition-all duration-700 ease-out"
                    style={{
                      width: `${Math.max(item.percentage, 3)}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Row: Primary "View Full Results in Detail" & Secondary "Vote Now" */}
        <div className="pt-4 border-t border-[var(--border-glass)] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
            <ShieldCheck className="w-4 h-4 text-[var(--success)] shrink-0" />
            <span>
              {language === 'hi'
                ? '100% सार्वजनिक डेटा • ईसीआई से असंबद्ध'
                : '100% Open Civic Data • Independent & Unaffiliated'}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Primary Action: Participate in PM Poll */}
            <Link href="/pm" className="w-full sm:w-auto">
              <GlassButton
                variant="primary"
                size="md"
                className="w-full sm:w-auto gap-2 font-bold justify-center shadow-md"
              >
                <Vote className="w-4 h-4" />
                <span>{language === 'hi' ? 'PM जनमत में भाग लें' : 'Participate in PM Poll'}</span>
                <ArrowRight className="w-4 h-4" />
              </GlassButton>
            </Link>

            {/* Secondary Action: Explore Detailed Results */}
            <Link href="/polls/national-opinion-poll-2029/results" className="w-full sm:w-auto">
              <GlassButton
                variant="secondary"
                size="md"
                className="w-full sm:w-auto gap-1.5 font-bold justify-center"
              >
                <BarChart3 className="w-4 h-4 text-[var(--accent)]" />
                <span>
                  {language === 'hi'
                    ? 'सभी परिणाम विस्तार से देखें'
                    : 'Explore Detailed Results'}
                </span>
              </GlassButton>
            </Link>
          </div>
        </div>
      </GlassCard>
    </section>
  );
}
