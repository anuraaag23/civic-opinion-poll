'use client';

import React from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n/context';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { CheckCircle2, BarChart3, Home, ShieldCheck } from 'lucide-react';

interface SuccessStateProps {
  pollSlug: string;
}

export function SuccessState({ pollSlug }: SuccessStateProps) {
  const { t, language } = useI18n();

  return (
    <div className="max-w-lg mx-auto py-8 text-center animate-in fade-in duration-300">
      <GlassCard elevated className="space-y-6">
        <div className="flex items-center justify-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/meravote-logo.png" alt="Mera Vote" className="w-6 h-6 rounded-full object-contain" />
          <span className="text-xs font-black tracking-wide uppercase px-2.5 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]/20">
            {language === 'hi' ? 'मेरा वोट' : 'Mera Vote'}
          </span>
        </div>

        <div className="w-16 h-16 rounded-full bg-[var(--success-soft)] text-[var(--success)] flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
            {t.success.title}
          </h2>
          <p className="text-base text-[var(--success)] font-semibold">
            {t.success.subtitle}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] text-xs text-[var(--text-secondary)] leading-relaxed text-left space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-[var(--text-primary)]">
            <ShieldCheck className="w-4 h-4 text-[var(--accent)]" />
            <span>{language === 'hi' ? 'गोपनीयता पुष्टिकरण' : 'Cryptographic Anonymity Confirmed'}</span>
          </div>
          <p>{t.success.privacyNote}</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <Link href={`/polls/${pollSlug}/results`} className="w-full sm:flex-1">
            <GlassButton size="lg" className="w-full gap-2 shadow-md">
              <BarChart3 className="w-4 h-4" />
              <span>{t.success.viewResults}</span>
            </GlassButton>
          </Link>
          <Link href="/" className="w-full sm:w-auto">
            <GlassButton variant="secondary" size="lg" className="w-full gap-1.5">
              <Home className="w-4 h-4" />
              <span>{t.success.returnHome}</span>
            </GlassButton>
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}
