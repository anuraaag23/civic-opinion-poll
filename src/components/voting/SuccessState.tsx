'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { useI18n } from '@/lib/i18n/context';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { CheckCircle2, BarChart3, Home, ShieldCheck, Share2, Check } from 'lucide-react';

interface SuccessStateProps {
  pollSlug: string;
}

export function SuccessState({ pollSlug }: SuccessStateProps) {
  const { t, language } = useI18n();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2457D6', '#2E8B57', '#F59E0B', '#38BDF8', '#FFFFFF'],
      });
    } catch {}
  }, []);

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/polls/${pollSlug}/results` : '';
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: 'Mera Vote',
          text: 'I just participated anonymously in Mera Vote opinion poll! Check out live results:',
          url,
        });
      } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="max-w-lg mx-auto py-8 text-center animate-in fade-in duration-300">
      <GlassCard elevated className="space-y-6">
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

        {/* Success Alert Banner */}
        <div className="p-3 rounded-xl bg-[var(--success-soft)] border border-[var(--success)]/30 text-xs font-semibold text-[var(--success)] flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>
            {language === 'hi'
              ? 'आपका वोट सुरक्षित रूप से दर्ज कर लिया गया है और टोकन नष्ट हो चुका है।'
              : 'Response recorded atomically. Participation token self-destructed.'}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] text-xs text-[var(--text-secondary)] leading-relaxed text-left space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-[var(--text-primary)]">
            <ShieldCheck className="w-4 h-4 text-[var(--accent)]" />
            <span>{language === 'hi' ? 'गोपनीयता पुष्टिकरण' : 'Cryptographic Anonymity Confirmed'}</span>
          </div>
          <p>{t.success.privacyNote}</p>
        </div>

        {/* Share Button with Live Feedback */}
        <div className="pt-1">
          <button
            type="button"
            onClick={handleShare}
            className="w-full py-2.5 px-4 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--border-glass)] border border-[var(--border-glass)] text-xs font-semibold text-[var(--text-primary)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-xs"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-[var(--success)]" />
                <span className="text-[var(--success)] font-bold">
                  {language === 'hi' ? 'लिंक क्लिपबोर्ड पर कॉपी हो गया!' : 'Link copied to clipboard!'}
                </span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-[var(--accent)]" />
                <span>
                  {language === 'hi' ? 'अपने दोस्तों के साथ परिणाम साझा करें' : 'Share Poll Results with Friends'}
                </span>
              </>
            )}
          </button>
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
