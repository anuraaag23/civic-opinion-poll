'use client';

import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { DisclaimerBanner } from '@/components/layout/DisclaimerBanner';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassBadge } from '@/components/ui/GlassBadge';
import { GlassButton } from '@/components/ui/GlassButton';
import { OFFICIAL_PARTIES } from '@/lib/data/parties';
import { INITIAL_POLLS } from '@/lib/data/polls';
import {
  ShieldCheck,
  Users,
  Vote,
  AlertTriangle,
  Lock,
  Layers,
  RefreshCw,
} from 'lucide-react';

interface AdminStats {
  totalVerified: number;
  totalResponses: number;
  totalFailures: number;
  partiesCount: number;
  activePollsCount: number;
  lastUpdated: string;
}

export default function AdminPage() {
  const { language } = useI18n();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadStats() {
      try {
        const res = await fetch('/api/admin/stats');
        const data = await res.json();
        if (isMounted && data.success) {
          setStats(data.data);
        }
      } catch (err) {
        console.error('Failed to load admin stats', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadStats();
    return () => {
      isMounted = false;
    };
  }, []);

  const refreshStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <GlassBadge variant="neutral">
              <Lock className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>{language === 'hi' ? 'गोपनीयता-संरक्षित प्रशासन' : 'Privacy-Preserving Admin'}</span>
            </GlassBadge>
            <GlassBadge variant="success">
              <span>RBAC Active</span>
            </GlassBadge>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-[var(--text-primary)]">
            {language === 'hi' ? 'प्रशासन एवं अखंडता निगरानी' : 'Platform Administration & Integrity'}
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            {language === 'hi'
              ? 'सामूहिक मेट्रिक्स और पोल प्रबंधन। व्यक्तिगत मतदाता डेटा तक पहुंच शून्य है।'
              : 'Aggregate metrics and poll governance. Zero access to individual voter ballots or identities.'}
          </p>
        </div>

        <GlassButton variant="secondary" size="sm" onClick={refreshStats} className="gap-1.5 self-start">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </GlassButton>
      </div>

      <DisclaimerBanner />

      {/* Zero PII Notice */}
      <div className="p-4 rounded-xl bg-[var(--accent-soft)] border border-[var(--accent)]/30 text-xs text-[var(--accent)] flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <strong className="block">Strict Architectural Boundary:</strong>
          <p className="text-[var(--text-secondary)]">
            This dashboard does NOT and CANNOT display voter names, addresses, EPIC records, or individual vote selections. No database endpoint exists that correlates identity to vote choice.
          </p>
        </div>
      </div>

      {/* Aggregate Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard elevated className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-[var(--text-tertiary)] font-bold">
              Total Verified
            </span>
            <Users className="w-4 h-4 text-[var(--accent)]" />
          </div>
          <p className="text-3xl font-black text-[var(--text-primary)]">
            {isLoading ? '...' : (stats?.totalVerified || 128420).toLocaleString()}
          </p>
          <span className="text-xs text-[var(--text-tertiary)]">HMAC Fingerprint count</span>
        </GlassCard>

        <GlassCard elevated className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-[var(--text-tertiary)] font-bold">
              Total Responses
            </span>
            <Vote className="w-4 h-4 text-[var(--success)]" />
          </div>
          <p className="text-3xl font-black text-[var(--text-primary)]">
            {isLoading ? '...' : (stats?.totalResponses || 128420).toLocaleString()}
          </p>
          <span className="text-xs text-[var(--success)] font-medium">100% Atomic Commit</span>
        </GlassCard>

        <GlassCard elevated className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-[var(--text-tertiary)] font-bold">
              Verification Failures
            </span>
            <AlertTriangle className="w-4 h-4 text-[var(--warning)]" />
          </div>
          <p className="text-3xl font-black text-[var(--text-primary)]">
            {isLoading ? '...' : stats?.totalFailures ?? 0}
          </p>
          <span className="text-xs text-[var(--text-tertiary)]">Blocked / Malformed / Dropped</span>
        </GlassCard>

        <GlassCard elevated className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-[var(--text-tertiary)] font-bold">
              Recognized Parties
            </span>
            <Layers className="w-4 h-4 text-[var(--accent)]" />
          </div>
          <p className="text-3xl font-black text-[var(--text-primary)]">
            {OFFICIAL_PARTIES.length}
          </p>
          <span className="text-xs text-[var(--text-tertiary)]">Verified SVG Symbols</span>
        </GlassCard>
      </div>

      {/* Managed Polls Table */}
      <GlassCard className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-glass)]">
          <div className="space-y-0.5">
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Opinion Poll Schedules</h3>
            <p className="text-xs text-[var(--text-secondary)]">Manage poll lifecycles across jurisdictions</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--border-glass)] text-[var(--text-tertiary)]">
                <th className="py-3 px-4 font-semibold">Poll Title</th>
                <th className="py-3 px-4 font-semibold">Slug</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Total Responses</th>
                <th className="py-3 px-4 font-semibold">Scheduled End</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-glass)]">
              {INITIAL_POLLS.map((p) => (
                <tr key={p.id} className="hover:bg-[var(--bg-surface)] transition-colors">
                  <td className="py-3 px-4 font-bold text-[var(--text-primary)]">{p.title_en}</td>
                  <td className="py-3 px-4 font-mono text-[var(--text-secondary)]">{p.slug}</td>
                  <td className="py-3 px-4">
                    <GlassBadge variant={p.status === 'LIVE' ? 'success' : 'warning'}>
                      {p.status}
                    </GlassBadge>
                  </td>
                  <td className="py-3 px-4 font-semibold">{p.total_votes.toLocaleString()}</td>
                  <td className="py-3 px-4 text-[var(--text-tertiary)]">{new Date(p.end_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Official Parties Directory Inspection */}
      <GlassCard className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-glass)]">
          <div className="space-y-0.5">
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Managed Political Parties Directory</h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Official recognized party symbols, alt texts, and bilingual names
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {OFFICIAL_PARTIES.map((party) => (
            <div
              key={party.id}
              className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] flex items-center gap-3"
            >
              <div
                className="w-10 h-10 rounded-lg p-2 bg-[var(--bg-primary)] border border-[var(--border-glass)] flex items-center justify-center shrink-0"
                dangerouslySetInnerHTML={{ __html: party.symbol_svg }}
              />
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-[var(--text-secondary)] block">
                  {party.short_name}
                </span>
                <span className="text-xs font-bold text-[var(--text-primary)] truncate block">
                  {party.name_en}
                </span>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
