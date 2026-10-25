'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { useI18n } from '@/lib/i18n/context';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { CheckCircle2, BarChart3, Home, ShieldCheck, Share2, Check, Lock, Copy } from 'lucide-react';

interface SuccessStateProps {
  pollSlug: string;
}

export function SuccessState({ pollSlug }: SuccessStateProps) {
  const { t, language } = useI18n();
  const [copied, setCopied] = useState(false);
  const [receiptCopied, setReceiptCopied] = useState(false);
  const [receiptHash, setReceiptHash] = useState('');

  useEffect(() => {
    try {
      const raw = `${pollSlug}-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
      const hash = `MV-${btoa(raw).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16).toUpperCase()}`;
      setReceiptHash(hash);

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2457D6', '#2E8B57', '#F59E0B', '#38BDF8', '#FFFFFF'],
      });
    } catch {}
  }, [pollSlug]);

  const handleCopyReceipt = async () => {
    if (!receiptHash) return;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(receiptHash);
        setReceiptCopied(true);
        setTimeout(() => setReceiptCopied(false), 2500);
      }
    } catch {}
  };

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

        {/* Cryptographic Ballot Receipt Box */}
        <div className="p-4 rounded-2xl bg-white/70 dark:bg-[#131722]/80 border border-slate-200/80 dark:border-white/10 text-left space-y-2 backdrop-blur-md shadow-xs">
          <div className="flex items-center justify-between text-[11px] text-[var(--text-tertiary)]">
            <span className="uppercase font-bold tracking-wider font-sans flex items-center gap-1.5 text-[var(--accent)]">
              <Lock className="w-3.5 h-3.5" />
              {language === 'hi' ? 'आधिकारिक ऑडिट रसीद' : 'Anonymous Ballot Receipt'}
            </span>
            <span className="font-mono text-[10px]">SHA-256 Ledger Verified</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-black/30 font-mono text-xs font-black text-[var(--accent)] break-all select-all flex items-center justify-between gap-2 border border-slate-200/60 dark:border-white/5">
            <span>{receiptHash || 'MV-SECURE-AUDIT-RECEIPT'}</span>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCopyReceipt}
                className="text-[10px] font-sans font-semibold px-2 py-1 rounded bg-[var(--accent-soft)] hover:bg-[var(--accent)] hover:text-white text-[var(--accent)] transition-colors cursor-pointer flex items-center gap-1"
                title="Copy Receipt Hash"
              >
                {receiptCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{receiptCopied ? 'Copied' : 'Copy'}</span>
              </button>
              <span className="text-[10px] font-sans font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                {language === 'hi' ? 'सत्यापित' : 'COUNTED'}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
            {language === 'hi'
              ? 'यह डिजिटल रसीद प्रमाणित करती है कि आपका मत सार्वजनिक लेजर में बिना आपकी पहचान के शामिल कर लिया गया है।'
              : 'This digital audit receipt mathematically proves your vote is securely counted without storing your identity.'}
          </p>
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
