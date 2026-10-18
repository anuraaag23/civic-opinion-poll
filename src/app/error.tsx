'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home, ShieldCheck, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Log error securely to console
    console.error('Mera Vote Runtime Error Caught:', error);
  }, [error]);

  const copyErrorId = () => {
    const text = error.digest || error.message || 'Unknown Error Reference';
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-10 px-3 sm:px-6">
      <GlassCard elevated className="max-w-xl w-full text-center p-6 sm:p-10 space-y-6 relative overflow-hidden border-red-500/30">
        {/* Subtle decorative crimson glow */}
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 bg-red-500/10 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        {/* Themed Error Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30 text-xs font-bold uppercase tracking-wider">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>System Notice • तकनीकी त्रुटि</span>
        </div>

        {/* Headings */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-primary)]">
            Something Went Wrong
          </h1>
          <h2 className="text-sm sm:text-base font-bold text-red-600 dark:text-red-400">
            कुछ अप्रत्याशित समस्या उत्पन्न हुई
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed max-w-md mx-auto pt-1">
            An unexpected error occurred while rendering this view. Your cryptographic voter anonymity and identity protections remain 100% intact.
          </p>
        </div>

        {/* Security & Privacy Reassurance */}
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-left flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-0.5">
            <span className="font-bold text-emerald-800 dark:text-emerald-300 block">
              Voter Privacy & Ledger Safe
            </span>
            <p className="text-emerald-700 dark:text-emerald-400/90 leading-normal text-[11px]">
              No voter identity or response data is stored or compromised. All operations are isolated.
            </p>
          </div>
        </div>

        {/* Technical Reference Code */}
        {error.digest && (
          <div className="p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] flex items-center justify-between gap-2 text-left">
            <div className="min-w-0 flex-1">
              <span className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] block">
                Incident Reference ID
              </span>
              <span className="font-mono text-xs text-[var(--text-primary)] font-semibold truncate block">
                {error.digest}
              </span>
            </div>
            <button
              type="button"
              onClick={copyErrorId}
              className="p-1.5 rounded-lg bg-[var(--bg-primary)] hover:bg-[var(--accent-soft)] text-[var(--text-secondary)] hover:text-[var(--accent)] border border-[var(--border-glass)] transition-colors cursor-pointer shrink-0"
              title="Copy Incident ID"
              aria-label="Copy incident ID"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <GlassButton
            variant="primary"
            size="md"
            onClick={() => reset()}
            className="gap-2 font-bold shadow-xs"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again (पुनः प्रयास करें)</span>
          </GlassButton>

          <Link href="/">
            <GlassButton variant="secondary" size="md" className="gap-2 font-bold shadow-xs">
              <Home className="w-4 h-4" />
              <span>Go to Home (मुख्य पृष्ठ)</span>
            </GlassButton>
          </Link>
        </div>

        {/* Diagnostic Toggle */}
        <div className="pt-2 border-t border-[var(--border-glass)]">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="text-[11px] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] inline-flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>{showDetails ? 'Hide Technical Details' : 'View Diagnostic Details'}</span>
            {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {showDetails && (
            <div className="mt-3 p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] text-left font-mono text-[11px] text-red-600 dark:text-red-400 overflow-x-auto max-h-36 custom-scrollbar">
              <p className="font-bold">{error.name || 'Error'}: {error.message || 'An unexpected failure occurred'}</p>
              {error.digest && <p className="text-[10px] text-[var(--text-tertiary)] mt-1">Digest: {error.digest}</p>}
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
