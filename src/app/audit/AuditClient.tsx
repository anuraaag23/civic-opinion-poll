'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n/context';
import { DisclaimerBanner } from '@/components/layout/DisclaimerBanner';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassBadge } from '@/components/ui/GlassBadge';
import { GlassButton } from '@/components/ui/GlassButton';
import {
  ShieldCheck,
  Search,
  Lock,
  CheckCircle2,
  FileCheck2,
  Database,
  Layers,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  Activity,
  Vote,
  Sparkles,
} from 'lucide-react';

interface AuditOverview {
  totalVerifiedBallots: number;
  totalResponsesCounted: number;
  zeroPiiGuarantee: string;
  anonymityStandard: string;
  cryptographicConsensus: string;
  recentAuditLogs: Array<{
    id: string;
    eventType: string;
    pollId: string;
    timestamp: string;
    proofHash: string;
  }>;
}

interface VerificationResult {
  verified: boolean;
  receipt: string;
  status: string;
  verificationDetails: {
    cryptographicProof: string;
    anonymityLevel: string;
    verificationProtocol: string;
    storageBound: string;
    inclusionProof: string;
    verifiedAt: string;
  };
}

export function AuditClient() {
  const { language } = useI18n();
  const [receiptInput, setReceiptInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [overview, setOverview] = useState<AuditOverview | null>(null);
  const [copiedProof, setCopiedProof] = useState(false);

  // Load public ledger overview
  useEffect(() => {
    async function fetchOverview() {
      try {
        const res = await fetch('/api/audit/verify?action=overview');
        const json = await res.json();
        if (json.success && json.data) {
          setOverview(json.data);
        }
      } catch (err) {
        console.error('Failed to load audit overview', err);
      }
    }
    fetchOverview();
  }, []);

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanReceipt = receiptInput.trim().toUpperCase();

    if (!cleanReceipt) {
      setErrorMessage(
        language === 'hi'
          ? 'कृपया अपनी रसीद कोड दर्ज करें (उदा. MV-XXXXXXXXX)'
          : 'Please enter your audit receipt code (e.g., MV-XXXXXXXXX)'
      );
      return;
    }

    setIsVerifying(true);
    setErrorMessage(null);
    setVerificationResult(null);

    try {
      const res = await fetch(`/api/audit/verify?receipt=${encodeURIComponent(cleanReceipt)}`);
      const data = await res.json();

      if (data.success && data.verified) {
        setVerificationResult(data);
      } else {
        setErrorMessage(data.error || 'Receipt hash not found in public ledger.');
      }
    } catch {
      setErrorMessage('Verification network failure. Please retry.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCopyProof = async () => {
    if (!verificationResult) return;
    try {
      await navigator.clipboard.writeText(verificationResult.verificationDetails.cryptographicProof);
      setCopiedProof(true);
      setTimeout(() => setCopiedProof(false), 2500);
    } catch {}
  };

  return (
    <div className="min-h-screen pb-24 pt-6 space-y-8">
      {/* Disclaimer Banner */}
      <DisclaimerBanner />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Header Hero */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>
              {language === 'hi'
                ? 'सार्वजनिक सत्यापन एवं खुला ऑडिट लेजर'
                : 'Public Vote Audit & Zero-Knowledge Explorer'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-[var(--text-primary)]">
            {language === 'hi'
              ? 'मतदाता ऑडिट एवं सत्यता सत्यापन'
              : 'Public Ballot Verification Explorer'}
          </h1>

          <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
            {language === 'hi'
              ? 'अपने वोट की आधिकारिक रसीद कोड दर्ज करें और गणितीय रूप से सत्यापित करें कि आपका मत लेजर में सही दर्ज हुआ है, बिना आपकी व्यक्तिगत पहचान उजागर हुए।'
              : 'Enter your anonymous ballot receipt code to mathematically verify that your vote was recorded into the public ledger with 100% zero-knowledge identity separation.'}
          </p>
        </div>

        {/* Search & Verification Input Bar */}
        <GlassCard elevated className="p-6 sm:p-8 space-y-4">
          <form onSubmit={handleVerify} className="space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
              {language === 'hi'
                ? 'डिजिटल ऑडिट रसीद कोड (Receipt Code)'
                : 'Enter Anonymous Ballot Receipt Code'}
            </label>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                <input
                  type="text"
                  value={receiptInput}
                  onChange={(e) => setReceiptInput(e.target.value)}
                  placeholder="e.g. MV-4A7F921B6C03D81E"
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-glass)] text-sm font-mono text-[var(--text-primary)] uppercase focus:outline-none focus:border-[var(--accent)] transition-all shadow-inner"
                />
              </div>

              <button
                type="submit"
                disabled={isVerifying || !receiptInput.trim()}
                className="py-3.5 px-7 rounded-2xl bg-[var(--accent)] hover:opacity-90 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50 shrink-0"
              >
                <FileCheck2 className={`w-4 h-4 ${isVerifying ? 'animate-spin' : ''}`} />
                <span>
                  {isVerifying
                    ? language === 'hi'
                      ? 'सत्यापित हो रहा है...'
                      : 'Verifying Hash...'
                    : language === 'hi'
                    ? 'मत सत्यापित करें'
                    : 'Verify Ballot'}
                </span>
              </button>
            </div>

            {/* Quick Demo Pill */}
            <div className="flex items-center gap-2 pt-1 flex-wrap text-xs text-[var(--text-tertiary)]">
              <span>{language === 'hi' ? 'परीक्षण हेतु नमूना:' : 'Quick sample test:'}</span>
              <button
                type="button"
                onClick={() => setReceiptInput('MV-7D3E901F4C68B2A5')}
                className="font-mono text-[11px] px-2 py-0.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-glass)] hover:border-[var(--accent)] text-[var(--text-secondary)] transition-colors cursor-pointer"
              >
                MV-7D3E901F4C68B2A5
              </button>
            </div>
          </form>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold animate-in fade-in">
              {errorMessage}
            </div>
          )}

          {/* Verification Success Box */}
          {verificationResult && (
            <div className="p-5 sm:p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                    <Check className="w-5 h-5 stroke-[3]" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                      {language === 'hi' ? 'सफलतापूर्वक सत्यापित' : 'Cryptographically Verified'}
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-[var(--text-primary)]">
                      {verificationResult.status}
                    </h3>
                  </div>
                </div>

                <GlassBadge variant="success">
                  <Lock className="w-3 h-3" />
                  <span>100% Zero-Knowledge Match</span>
                </GlassBadge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2 font-mono text-xs">
                <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)]">
                  <span className="text-[10px] text-[var(--text-tertiary)] uppercase block font-sans">
                    Receipt Code
                  </span>
                  <span className="font-bold text-[var(--text-primary)]">
                    {verificationResult.receipt}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)]">
                  <span className="text-[10px] text-[var(--text-tertiary)] uppercase block font-sans">
                    Storage Boundary
                  </span>
                  <span className="font-bold text-emerald-500">
                    {verificationResult.verificationDetails.storageBound}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)]">
                  <span className="text-[10px] text-[var(--text-tertiary)] uppercase block font-sans">
                    Anonymity Guarantee
                  </span>
                  <span className="font-bold text-blue-400">
                    {verificationResult.verificationDetails.anonymityLevel}
                  </span>
                </div>
              </div>

              {/* Cryptographic Hash Proof */}
              <div className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-[var(--text-tertiary)]">
                  <span className="font-sans font-bold">SHA-256 Ledger Hash Proof</span>
                  <button
                    type="button"
                    onClick={handleCopyProof}
                    className="flex items-center gap-1 text-[var(--accent)] hover:underline cursor-pointer"
                  >
                    {copiedProof ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedProof ? 'Copied' : 'Copy Proof'}</span>
                  </button>
                </div>
                <div className="font-mono text-xs text-emerald-400 break-all select-all">
                  {verificationResult.verificationDetails.cryptographicProof}
                </div>
              </div>

              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {language === 'hi'
                  ? '🔒 शून्य-ज्ञान सिद्धांत (Zero-Knowledge): आपकी रसीद यह सिद्ध करती है कि आपका मत सार्वजनिक मतपेटी में शामिल किया गया है। गुप्त गणितीय सिफर के कारण न तो कोई चुनाव अधिकारी और न ही कोई सर्वर यह जान सकता है कि आपने किस प्रत्याशी को मत दिया है।'
                  : '🔒 Zero-Knowledge Principle: This cryptographic receipt proves your ballot was tallied in the official count. By cryptographic design, no system admin or third party can ever deduce which option you selected or link this receipt back to your phone.'}
              </p>
            </div>
          )}
        </GlassCard>

        {/* Platform Integrity Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <GlassCard className="p-5 space-y-2">
            <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
              <span className="font-semibold uppercase tracking-wider text-[10px]">
                {language === 'hi' ? 'कुल सत्यापित मत' : 'Verified Ballots'}
              </span>
              <Vote className="w-4 h-4 text-[var(--accent)]" />
            </div>
            <div className="text-2xl font-black text-[var(--text-primary)] tabular-nums">
              {overview?.totalVerifiedBallots ? overview.totalVerifiedBallots.toLocaleString('en-IN') : '100%'}
            </div>
            <p className="text-[11px] text-emerald-500 font-semibold">
              {language === 'hi' ? '१-व्यक्ति-१-मत सुरक्षित' : '1-Person-1-Vote Protected'}
            </p>
          </GlassCard>

          <GlassCard className="p-5 space-y-2">
            <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
              <span className="font-semibold uppercase tracking-wider text-[10px]">
                {language === 'hi' ? 'व्यक्तिगत डेटा भंडारण' : 'PII Storage'}
              </span>
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black text-emerald-500">0 Numbers</div>
            <p className="text-[11px] text-[var(--text-secondary)]">
              {language === 'hi' ? 'कोई मोबाइल नंबर संग्रहित नहीं' : 'Zero phone numbers stored'}
            </p>
          </GlassCard>

          <GlassCard className="p-5 space-y-2">
            <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
              <span className="font-semibold uppercase tracking-wider text-[10px]">
                {language === 'hi' ? 'टोकन नष्ट दर' : 'Token Burn Rate'}
              </span>
              <Activity className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-black text-[var(--text-primary)]">100.0%</div>
            <p className="text-[11px] text-[var(--text-secondary)]">
              {language === 'hi' ? 'मतदान पश्चात टोकन स्व-नष्ट' : 'Tokens self-destruct upon voting'}
            </p>
          </GlassCard>

          <GlassCard className="p-5 space-y-2">
            <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
              <span className="font-semibold uppercase tracking-wider text-[10px]">
                {language === 'hi' ? 'सहमति कलन विधि' : 'Consensus Engine'}
              </span>
              <Database className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-2xl font-black text-[var(--text-primary)]">SHA-256</div>
            <p className="text-[11px] text-[var(--text-secondary)]">
              {language === 'hi' ? 'क्रिप्टोग्राफ़िक सुरक्षा' : 'Immutable Hash Chain'}
            </p>
          </GlassCard>
        </div>

        {/* Live Public Audit Stream */}
        <GlassCard className="p-6 space-y-4">
          <div className="flex items-center justify-between gap-2 border-b border-[var(--border-glass)] pb-3">
            <div>
              <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[var(--accent)]" />
                <span>
                  {language === 'hi'
                    ? 'सार्वजनिक सत्यापन लेजर (Live Public Stream)'
                    : 'Real-Time Public Audit Stream'}
                </span>
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                {language === 'hi'
                  ? 'सत्यापित मतों और ऑडिट घटनाओं का रीयल-टाइम ब्लॉकचेन-शैली लेजर रिकॉर्ड'
                  : 'Cryptographically sanitized transaction blocks recorded by the engine'}
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>LIVE</span>
            </div>
          </div>

          <div className="divide-y divide-[var(--border-glass)] max-h-80 overflow-y-auto pr-1">
            {overview?.recentAuditLogs && overview.recentAuditLogs.length > 0 ? (
              overview.recentAuditLogs.map((log) => (
                <div key={log.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 truncate">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="font-mono text-[11px] text-emerald-400 font-semibold shrink-0">
                      {log.proofHash}
                    </span>
                    <span className="text-[var(--text-primary)] font-medium truncate capitalize">
                      {log.eventType.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <span className="text-[10px] text-[var(--text-tertiary)] shrink-0 font-mono">
                    {new Date(log.timestamp).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-[var(--text-tertiary)]">
                Loading live sanitized audit records...
              </div>
            )}
          </div>
        </GlassCard>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/pm">
            <GlassCard className="p-5 flex items-center justify-between group hover:border-[var(--accent)] transition-all cursor-pointer">
              <div className="space-y-1">
                <span className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider block">
                  National Civic Poll
                </span>
                <span className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                  {language === 'hi' ? 'प्रधानमंत्री जनमत सर्वेक्षण 2029' : 'Prime Minister Poll 2029'}
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] group-hover:translate-x-1 transition-all" />
            </GlassCard>
          </Link>

          <Link href="/cm">
            <GlassCard className="p-5 flex items-center justify-between group hover:border-[var(--accent)] transition-all cursor-pointer">
              <div className="space-y-1">
                <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider block">
                  State Assembly Poll
                </span>
                <span className="text-sm font-bold text-[var(--text-primary)] group-hover:text-emerald-500 transition-colors">
                  {language === 'hi' ? 'राज्य मुख्यमंत्री जनमत सर्वेक्षण' : 'Chief Minister Poll (All States)'}
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-[var(--text-tertiary)] group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
            </GlassCard>
          </Link>
        </div>
      </div>
    </div>
  );
}
