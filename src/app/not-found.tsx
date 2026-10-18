'use client';

import React from 'react';
import Link from 'next/link';
import { Compass, Vote, Home, ArrowLeft, Building2, Globe, ShieldCheck } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { useI18n } from '@/lib/i18n/context';

export default function NotFound() {
  const { language } = useI18n();

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-10 px-3 sm:px-6">
      <GlassCard elevated className="max-w-2xl w-full text-center p-6 sm:p-10 space-y-8 relative overflow-hidden">
        {/* Subtle decorative background ambient glow */}
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 bg-[var(--accent)]/10 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]/30 text-xs font-black uppercase tracking-wider">
          <Compass className="w-3.5 h-3.5 animate-spin-slow" />
          <span>Error 404 • Page Not Found</span>
        </div>

        {/* Big Themed Typography */}
        <div className="space-y-3">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-[var(--text-primary)]">
            404
          </h1>
          <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
            {language === 'hi' ? 'यह पृष्ठ उपलब्ध नहीं है' : 'Page Not Found'}
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-lg mx-auto leading-relaxed">
            {language === 'hi'
              ? 'आप जिस जनमत सर्वेक्षण या पृष्ठ की तलाश कर रहे हैं, वह स्थानांतरित हो चुका है, समाप्त हो गया है या पता गलत दर्ज हुआ है।'
              : 'The opinion poll or page you are looking for does not exist, has been archived, or the link may have a typo.'}
          </p>
        </div>

        {/* Quick Nav Destination Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left pt-2">
          <Link href="/" className="group">
            <div className="p-3.5 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--accent-soft)] border border-[var(--border-glass)] hover:border-[var(--accent)] transition-all cursor-pointer h-full space-y-1">
              <div className="flex items-center gap-2 text-[var(--accent)] font-bold text-xs">
                <Home className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'मुख्य पृष्ठ' : 'Home Page'}</span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)]">
                {language === 'hi' ? 'राष्ट्रीय मंच पर लौटें' : 'Return to main civic hub'}
              </p>
            </div>
          </Link>

          <Link href="/polls" className="group">
            <div className="p-3.5 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--accent-soft)] border border-[var(--border-glass)] hover:border-[var(--accent)] transition-all cursor-pointer h-full space-y-1">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                <Vote className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'सभी पोल' : 'All Polls'}</span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)]">
                {language === 'hi' ? 'सक्रिय जनमत देखें' : 'Browse active civic surveys'}
              </p>
            </div>
          </Link>

          <Link href="/cm" className="group">
            <div className="p-3.5 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--accent-soft)] border border-[var(--border-glass)] hover:border-[var(--accent)] transition-all cursor-pointer h-full space-y-1">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                <Building2 className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'मुख्यमंत्री पोल' : 'CM Polls'}</span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)]">
                {language === 'hi' ? 'राज्यवार विधानसभा राय' : 'State Assembly opinions'}
              </p>
            </div>
          </Link>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-[var(--border-glass)]">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-4 py-2.5 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-primary)] border border-[var(--border-glass)] text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all flex items-center gap-2 cursor-pointer shadow-2xs active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'पीछे जाएं' : 'Go Back'}</span>
          </button>

          <Link href="/">
            <GlassButton variant="primary" size="sm" className="gap-2 font-bold shadow-xs">
              <Home className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'मुख्य पृष्ठ पर जाएं' : 'Go to Homepage'}</span>
            </GlassButton>
          </Link>

          <Link href="/pm">
            <GlassButton variant="secondary" size="sm" className="gap-2 font-bold shadow-xs">
              <Globe className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'प्रधानमंत्री पोल (Lok Sabha)' : 'PM Opinion Poll'}</span>
            </GlassButton>
          </Link>
        </div>

        {/* Trust Guarantee Note */}
        <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-[var(--text-tertiary)]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>
            {language === 'hi'
              ? 'मेरा वोट — 100% स्वतंत्र नागरिक जनमत मंच'
              : 'Mera Vote — Independent Civic Opinion Poll Platform'}
          </span>
        </div>
      </GlassCard>
    </div>
  );
}
