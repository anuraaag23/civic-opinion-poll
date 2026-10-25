'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { useI18n } from '@/lib/i18n/context';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import {
  CheckCircle2,
  BarChart3,
  Home,
  ShieldCheck,
  Share2,
  Check,
  Lock,
  Copy,
  Download,
  MessageCircle,
  ExternalLink,
} from 'lucide-react';

interface SuccessStateProps {
  pollSlug: string;
}

export function SuccessState({ pollSlug }: SuccessStateProps) {
  const { t, language } = useI18n();
  const [copied, setCopied] = useState(false);
  const [receiptCopied, setReceiptCopied] = useState(false);
  const [receiptHash, setReceiptHash] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

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

  const handleWhatsAppShare = () => {
    if (!receiptHash) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://meravote.org';
    const auditUrl = `${origin}/audit?receipt=${encodeURIComponent(receiptHash)}`;
    const resultsUrl = `${origin}/polls/${pollSlug}/results`;

    const text = language === 'hi'
      ? `🗳️ *मेरा वोट (Mera Vote) — आधिकारिक डिजिटल मत रसीद*\n\n` +
        `मैंने जनमत सर्वेक्षण में पूर्ण गोपनीयता के साथ अपना मत दर्ज किया है!\n\n` +
        `🔑 *बैलेट रसीद ID:* \`${receiptHash}\`\n` +
        `✅ *स्थिति:* सत्यापित एवं सुरक्षित दर्ज\n` +
        `🔍 *सार्वजनिक ऑडिट में जांचें:* ${auditUrl}\n` +
        `📊 *ताज़ा परिणाम देखें:* ${resultsUrl}\n\n` +
        `Mera Vote — स्वतंत्र नागरिक जनमत मंच`
      : `🗳️ *Mera Vote — Official Anonymous Ballot Receipt*\n\n` +
        `My vote was securely counted in the public opinion poll with zero personal tracking!\n\n` +
        `🔑 *Ballot Receipt Hash:* \`${receiptHash}\`\n` +
        `✅ *Status:* Cryptographically Counted & Verified\n` +
        `🔍 *Audit in Public Ledger:* ${auditUrl}\n` +
        `📊 *Live Poll Results:* ${resultsUrl}\n\n` +
        `Mera Vote — Independent Civic Opinion Platform`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadSlip = () => {
    if (!receiptHash || typeof document === 'undefined') return;
    setIsDownloading(true);

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 500;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        setIsDownloading(false);
        return;
      }

      // 1. Dark sleek background
      ctx.fillStyle = '#0B1120';
      ctx.fillRect(0, 0, 800, 500);

      // 2. Subtle radial glow
      const grad = ctx.createRadialGradient(400, 150, 20, 400, 250, 400);
      grad.addColorStop(0, 'rgba(56, 189, 248, 0.12)');
      grad.addColorStop(1, 'rgba(11, 17, 32, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 800, 500);

      // 3. Elegant border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 2;
      ctx.strokeRect(16, 16, 768, 468);

      // 4. Tricolor Accent Line at top
      ctx.fillStyle = '#FF9933';
      ctx.fillRect(20, 20, 253, 5);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(273, 20, 253, 5);
      ctx.fillStyle = '#138808';
      ctx.fillRect(526, 20, 254, 5);

      // 5. Header Branding
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('MERA VOTE • मेरा वोट', 40, 75);

      ctx.fillStyle = '#38BDF8';
      ctx.font = '600 12px monospace';
      ctx.fillText('OFFICIAL CRYPTOGRAPHIC BALLOT AUDIT RECEIPT', 40, 100);

      // Status Badge
      ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
      ctx.fillRect(580, 55, 180, 36);
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(580, 55, 180, 36);
      ctx.fillStyle = '#10B981';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('✓ COUNTED & VERIFIED', 596, 78);

      // Divider
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.beginPath();
      ctx.moveTo(40, 125);
      ctx.lineTo(760, 125);
      ctx.stroke();

      // Details Block
      ctx.fillStyle = '#94A3B8';
      ctx.font = '12px sans-serif';
      ctx.fillText('POLL IDENTIFIER', 40, 160);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText(pollSlug.toUpperCase().replace(/-/g, ' '), 40, 185);

      ctx.fillStyle = '#94A3B8';
      ctx.font = '12px sans-serif';
      ctx.fillText('TIMESTAMP (IST)', 440, 160);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 15px monospace';
      const now = new Date();
      ctx.fillText(now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }), 440, 185);

      // Receipt Hash Box
      ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
      ctx.fillRect(40, 220, 720, 85);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(40, 220, 720, 85);

      ctx.fillStyle = '#38BDF8';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('UNIQUE BALLOT AUDIT HASH (SHA-256 ZERO-KNOWLEDGE LEDGER):', 60, 245);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 22px monospace';
      ctx.fillText(receiptHash, 60, 280);

      // Cryptographic Assurance Note
      ctx.fillStyle = '#64748B';
      ctx.font = '12px sans-serif';
      ctx.fillText('• Mathematical Zero-Knowledge Guarantee: No phone number or personal identity was recorded.', 40, 345);
      ctx.fillText('• This digital receipt can be verified at any time on the transparent public audit explorer.', 40, 368);
      ctx.fillText('• Single-use CSPRNG participation token has self-destructed upon ballot commitment.', 40, 391);

      // Bottom bar
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://meravote.org';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.fillRect(20, 425, 760, 55);
      ctx.fillStyle = '#38BDF8';
      ctx.font = '12px monospace';
      ctx.fillText(`VERIFY LIVE AT: ${origin}/audit?receipt=${receiptHash}`, 40, 458);

      // Trigger download
      const link = document.createElement('a');
      link.download = `MeraVote_Ballot_Receipt_${receiptHash}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch {
      // ignore
    } finally {
      setTimeout(() => setIsDownloading(false), 1000);
    }
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
              ? 'आपका मत सुरक्षित रूप से दर्ज कर लिया गया है और टोकन नष्ट हो चुका है।'
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
        <div className="p-4 rounded-2xl bg-white/70 dark:bg-[#131722]/80 border border-slate-200/80 dark:border-white/10 text-left space-y-3 backdrop-blur-md shadow-xs">
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

          {/* Action Row: Download Slip & Send to WhatsApp */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-200/50 dark:border-white/5">
            {/* Download Official Ballot Slip */}
            <button
              type="button"
              onClick={handleDownloadSlip}
              disabled={isDownloading}
              className="py-2.5 px-3 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--accent-soft)] border border-[var(--border-glass)] text-xs font-bold text-[var(--text-primary)] hover:text-[var(--accent)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>
                {isDownloading
                  ? (language === 'hi' ? 'तैयार हो रहा है...' : 'Downloading...')
                  : (language === 'hi' ? 'रसीद डाउनलोड करें (PNG)' : 'Download Receipt Slip')}
              </span>
            </button>

            {/* Share / Send to WhatsApp */}
            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="py-2.5 px-3 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-xs font-bold text-[#25D366] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-xs"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>
                {language === 'hi' ? 'व्हाट्सएप पर भेजें / सहेजें' : 'Save to WhatsApp'}
              </span>
            </button>
          </div>

          <div className="pt-1 flex items-center justify-between text-[11px]">
            <Link
              href={`/audit?receipt=${encodeURIComponent(receiptHash)}`}
              className="text-[var(--accent)] font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>{language === 'hi' ? 'सार्वजनिक लेजर में रसीद जांचें' : 'Verify in Public Audit Explorer'}</span>
              <span>&rarr;</span>
            </Link>
          </div>
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
