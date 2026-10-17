'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Portal } from '@/components/ui/Portal';
import {
  X,
  ExternalLink,
  ShieldCheck,
  Star,
  CheckCircle2,
  XCircle,
  Coffee,
  RotateCcw,
  Loader2,
  RefreshCw,
  Send,
  AlertTriangle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useI18n } from '@/lib/i18n/context';
import { BUYMEACHAI_CONFIG, CHAI_TIERS, addSupporter } from '@/lib/buymeachai/config';
import {
  containsLink,
  sanitizeText,
  checkForAutoVerifiedPayment,
  updateSupporter,
  submitSupporter,
  DbSupporter,
} from '@/lib/supabase';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultAmount?: number;
}

export function SupportModal({ isOpen, onClose, defaultAmount = 20 }: SupportModalProps) {
  const { language } = useI18n();

  // Modal flow states:
  // 1. 'form' -> Choose amount, enter name, rate 1-5 stars, write optional message, click Pay on Buy Me a Chai
  // 2. 'auto_verifying' -> Live real-time polling: automatically detects when payment is completed on Buy Me a Chai
  // 3. 'payment_success' -> Animated success: payment detected automatically, support recorded
  // 4. 'payment_failed' -> Animated failure: no payment was detected, no charge
  const [step, setStep] = useState<'form' | 'auto_verifying' | 'payment_success' | 'payment_failed'>('form');

  // Form states
  const [selectedAmount, setSelectedAmount] = useState<number>(defaultAmount);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [supporterName, setSupporterName] = useState<string>('');
  const [starRating, setStarRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [poppedStar, setPoppedStar] = useState<number>(0);
  const [message, setMessage] = useState<string>('');

  // Auto-verification tracking state
  const [paymentInitiatedAt, setPaymentInitiatedAt] = useState<number>(0);
  const [pollCountdown, setPollCountdown] = useState<number>(45);
  const [isManualChecking, setIsManualChecking] = useState<boolean>(false);
  const [isSubmittingApproval, setIsSubmittingApproval] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');

  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimers = useCallback(() => {
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
  }, []);

  // Safe close handler
  const handleModalClose = useCallback(() => {
    clearTimers();
    setStep('form');
    setCustomAmount('');
    setFormError('');
    setPollCountdown(45);
    onClose();
  }, [clearTimers, onClose]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleModalClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleModalClose]);

  const currentAmount = customAmount ? Math.max(1, Number(customAmount) || 0) : selectedAmount;
  const estimatedCups = Math.max(1, Math.round(currentAmount / 20));

  // Anti-spam link detection
  const nameHasLink = containsLink(supporterName);
  const messageHasLink = containsLink(message);
  const hasProhibitedLink = nameHasLink || messageHasLink;

  // ── AUTOMATIC PAYMENT VERIFICATION POLLING ────────────────────────────────
  useEffect(() => {
    if (step !== 'auto_verifying' || paymentInitiatedAt === 0) return;

    // 1. Countdown timer
    countdownTimerRef.current = setInterval(() => {
      setPollCountdown((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    // 2. Poll every 2.5 seconds for incoming payment verification
    const pollForVerification = async () => {
      try {
        let verified = false;
        let supporterData: DbSupporter | null = null;

        try {
          const res = await fetch('/api/support/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              initiatedAt: paymentInitiatedAt,
              name: supporterName,
              amount: currentAmount,
            }),
          });
          const data = await res.json();
          if (data.success && data.verified && data.supporter) {
            verified = true;
            supporterData = data.supporter;
          }
        } catch {
          // Direct Supabase fallback
          const directRes = await checkForAutoVerifiedPayment(
            paymentInitiatedAt,
            supporterName,
            currentAmount
          );
          if (directRes.verified && directRes.supporter) {
            verified = true;
            supporterData = directRes.supporter;
          }
        }

        if (verified && supporterData) {
          clearTimers();

          // Update supporter record with user's rating and message if provided
          if (supporterData.id) {
            const cleanMsg = message.trim() ? sanitizeText(message.trim(), 350) : undefined;
            await updateSupporter(supporterData.id, {
              rating: starRating,
              message: cleanMsg,
              name: supporterName.trim() ? sanitizeText(supporterName.trim(), 80) : supporterData.name,
            });
          }

          // Also update local storage and broadcast to update floating widget
          addSupporter(
            supporterName || 'Anonymous Citizen',
            currentAmount,
            estimatedCups,
            starRating,
            message,
            supporterData.payment_id || `chai-${Date.now()}`,
            true
          );

          // Advance automatically to Success view
          setStep('payment_success');

          try {
            confetti({
              particleCount: 120,
              spread: 85,
              origin: { y: 0.6 },
              colors: ['#ffffff', '#f59e0b', '#38bdf8', '#34d399', '#2457D6'],
            });
          } catch {}
        }
      } catch (err) {
        console.error('Error during automatic payment verification polling:', err);
      }
    };

    // Initial check right away
    pollForVerification();

    // Regular interval check
    pollTimerRef.current = setInterval(pollForVerification, 2500);

    return () => clearTimers();
  }, [step, paymentInitiatedAt, supporterName, currentAmount, starRating, message, estimatedCups, clearTimers]);

  if (!isOpen) return null;

  // STEP 1 -> STEP 2: Proceed to Pay on Buy Me a Chai & Start Auto-Verification
  const handleProceedToPayment = () => {
    setFormError('');
    if (hasProhibitedLink) {
      setFormError(
        language === 'hi'
          ? 'समीक्षा या नाम में वेबसाइट लिंक और URL की अनुमति नहीं है।'
          : 'Links and website URLs are not allowed in reviews or names.'
      );
      return;
    }

    const now = Date.now();
    setPaymentInitiatedAt(now);
    setPollCountdown(45);

    addSupporter(
      supporterName || 'Anonymous Citizen',
      currentAmount,
      estimatedCups,
      starRating,
      message,
      `chai-${now}`,
      true
    );

    // Redirect directly to the Buy Me a Chai payment page
    window.location.href = BUYMEACHAI_CONFIG.url;
  };

  // User manually triggers a check
  const handleManualCheckNow = async () => {
    setIsManualChecking(true);
    setFormError('');

    try {
      let verified = false;
      let supporterData: DbSupporter | null = null;

      try {
        const res = await fetch('/api/support/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            initiatedAt: paymentInitiatedAt || Date.now() - 60000,
            name: supporterName,
            amount: currentAmount,
          }),
        });
        const data = await res.json();
        if (data.success && data.verified && data.supporter) {
          verified = true;
          supporterData = data.supporter;
        }
      } catch {
        const directRes = await checkForAutoVerifiedPayment(
          paymentInitiatedAt || Date.now() - 60000,
          supporterName,
          currentAmount
        );
        if (directRes.verified && directRes.supporter) {
          verified = true;
          supporterData = directRes.supporter;
        }
      }

      if (verified && supporterData) {
        clearTimers();

        if (supporterData.id) {
          const cleanMsg = message.trim() ? sanitizeText(message.trim(), 350) : undefined;
          await updateSupporter(supporterData.id, {
            rating: starRating,
            message: cleanMsg,
            name: supporterName.trim() ? sanitizeText(supporterName.trim(), 80) : supporterData.name,
          });
        }

        addSupporter(
          supporterName || 'Anonymous Citizen',
          currentAmount,
          estimatedCups,
          starRating,
          message,
          supporterData.payment_id || `chai-${Date.now()}`,
          true
        );

        setStep('payment_success');

        try {
          confetti({
            particleCount: 120,
            spread: 85,
            origin: { y: 0.6 },
            colors: ['#ffffff', '#f59e0b', '#38bdf8', '#34d399', '#2457D6'],
          });
        } catch {}
      } else {
        setFormError(
          language === 'hi'
            ? 'भुगतान अभी तक सर्वर पर नहीं मिला। कृपया सुनिश्चित करें कि आपने Buy Me a Chai पर भुगतान पूरा कर लिया है।'
            : 'Payment not detected yet. Please ensure you completed payment on Buy Me a Chai.'
        );
        setTimeout(() => setFormError(''), 4500);
      }
    } catch {
      setFormError(
        language === 'hi'
          ? 'जांच के दौरान त्रुटि हुई। कृपया पुनः प्रयास करें।'
          : 'Error checking payment. Please try again.'
      );
    } finally {
      setIsManualChecking(false);
    }
  };

  // Fallback: User completed payment on Buy Me a Chai, but webhook is taking time
  const handleSubmitForCreatorApproval = async () => {
    setIsSubmittingApproval(true);
    setFormError('');

    try {
      const finalName = sanitizeText(supporterName.trim(), 80) || 'Anonymous Citizen';
      const cleanMessage = message.trim() ? sanitizeText(message.trim(), 350) : undefined;

      await submitSupporter({
        name: finalName,
        amount: currentAmount > 0 ? currentAmount : 50,
        cups: estimatedCups,
        rating: starRating,
        message: cleanMessage,
        paymentId: `chai-pending-${Date.now()}`,
        verified: false,
      });

      addSupporter(
        finalName,
        currentAmount,
        estimatedCups,
        starRating,
        message,
        `pending-${Date.now()}`,
        false
      );

      clearTimers();
      setStep('payment_success');
    } catch {
      setFormError(
        language === 'hi'
          ? 'समीक्षा सबमिट करने में विफल। कृपया पुनः प्रयास करें।'
          : 'Failed to submit review. Please try again.'
      );
    } finally {
      setIsSubmittingApproval(false);
    }
  };

  return (
    <Portal containerId="modal-root">
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
      >
        {/* Translucent Backdrop */}
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={handleModalClose}
          aria-hidden="true"
        />

        {/* Modal Dialog Card (Bottom-sheet on mobile, centered card on tablet/desktop) */}
        <div className="relative z-10 w-full max-w-lg glass-panel-elevated p-5 sm:p-8 shadow-2xl transition-all my-0 sm:my-8 max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto border border-amber-500/25 rounded-t-3xl sm:rounded-3xl pb-safe">
          {/* Mobile Pull / Drag Indicator */}
          <div className="w-12 h-1.5 rounded-full bg-[var(--text-tertiary)]/30 mx-auto mb-3 sm:hidden" />

          {/* Close Button with 40x40 tap target */}
          <button
            onClick={handleModalClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-glass)] active:scale-95 transition-all cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          {/* ── STAGE 1: CONTRIBUTION FORM ─────────────────────────────────── */}
          {step === 'form' && (
            <div className="space-y-6">
              {/* Header with Mera Vote Logo */}
              <div className="text-center space-y-2.5 pt-1">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Link
                    href="/"
                    onClick={handleModalClose}
                    className="w-11 h-11 rounded-2xl bg-white dark:bg-white/95 border border-[var(--border-glass)] p-1 flex items-center justify-center shrink-0 shadow-sm overflow-hidden hover:scale-105 transition-transform"
                    aria-label="Mera Vote Home"
                  >
                    <Image
                      src="/meravote-logo.png"
                      alt="Mera Vote Logo"
                      width={44}
                      height={44}
                      className="w-full h-full object-contain"
                    />
                  </Link>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
                    <Coffee className="w-3.5 h-3.5" />
                    <span>Buy Me a Chai • Automatic Verification</span>
                  </div>
                </div>

              <h3 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] tracking-tight">
                {language === 'hi'
                  ? 'इस वेबसाइट को जीवित रखने के लिए डेवलपर का समर्थन करें'
                  : 'support to developer for make alive this website'}
              </h3>

              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed max-w-md mx-auto">
                {language === 'hi'
                  ? 'यह स्वतंत्र मंच उत्तर प्रदेश के एक 20 वर्षीय युवा (अनुराग) द्वारा बनाया गया है। बिना किसी कॉर्पोरेट या राजनीतिक फंडिंग के सर्वर चालू रखने में एक कप चाय भेंट करें।'
                  : 'Mera Vote is an independent civic platform built by 20-year-old developer Anurag from Uttar Pradesh with zero corporate or party funding. Buy a chai to keep our servers live and independent.'}
              </p>
            </div>

            {/* Error Banner */}
            {formError && (
              <div className="p-3 rounded-xl bg-[var(--error-soft)] border border-[var(--error)] text-xs text-[var(--error)] flex items-center gap-2 animate-shake">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* 1. Contribution Amount Preset Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider block">
                {language === 'hi' ? '1. योगदान राशि चुनें' : '1. Select Contribution Amount'}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {CHAI_TIERS.map((tier) => (
                  <button
                    key={tier.amount}
                    type="button"
                    onClick={() => {
                      setSelectedAmount(tier.amount);
                      setCustomAmount('');
                    }}
                    className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                      selectedAmount === tier.amount && !customAmount
                        ? 'border-amber-500 bg-amber-500/15 shadow-sm text-amber-600 dark:text-amber-400 font-bold'
                        : 'border-[var(--border-glass)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-amber-500/50 hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <div className="text-sm font-bold">{tier.label}</div>
                    <div className="text-[10px] opacity-75">{tier.chais} ☕</div>
                  </button>
                ))}
              </div>

              {/* Custom Amount Input */}
              <div className="relative pt-1">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--text-tertiary)]">
                  ₹
                </span>
                <input
                  type="number"
                  min="1"
                  max="100000"
                  placeholder={
                    language === 'hi'
                      ? 'या अपनी इच्छानुसार राशि दर्ज करें (उदा. 500, 1000)'
                      : 'Or enter custom amount (e.g. 500, 1000)'
                  }
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] text-base sm:text-xs text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>
            </div>

            {/* 2. Supporter Name / Alias */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider block">
                {language === 'hi' ? '2. आपका नाम या उपनाम' : '2. Your Name or Alias'}{' '}
                <span className="text-[10px] text-[var(--text-tertiary)] font-normal">
                  ({language === 'hi' ? 'कोई लिंक मान्य नहीं' : 'No links allowed'})
                </span>
              </label>
              <input
                type="text"
                maxLength={80}
                placeholder={
                  language === 'hi'
                    ? 'उदा. राहुल शर्मा, अमित वर्मा या गुमनाम नागरिक'
                    : 'e.g. Rahul Sharma, Amit Verma, or Anonymous Citizen'
                }
                value={supporterName}
                onChange={(e) => setSupporterName(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl bg-[var(--bg-surface)] border text-base sm:text-xs text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-amber-500/40 ${
                  nameHasLink ? 'border-[var(--error)] focus:ring-[var(--error)]' : 'border-[var(--border-glass)]'
                }`}
              />
            </div>

            {/* 3. Star Rating (1 to 5 Stars) */}
            <div className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[var(--text-primary)]">
                  {language === 'hi' ? '3. मेरा वोट को रेटिंग दें' : '3. Rate Mera Vote'}
                </label>
                <span className="text-xs font-bold text-amber-500">
                  {starRating}.0 / 5.0 ★
                </span>
              </div>
              <div className="flex items-center gap-1 sm:gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => {
                      setStarRating(star);
                      setPoppedStar(star);
                      setTimeout(() => setPoppedStar(0), 400);
                    }}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-2 sm:p-1 min-w-[36px] min-h-[36px] flex items-center justify-center text-amber-400 hover:scale-115 active:scale-95 transition-transform cursor-pointer"
                    aria-label={`${star} star`}
                  >
                    <Star
                      className={`w-6 h-6 transition-all ${
                        star <= (hoverRating || starRating)
                          ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                          : 'text-[var(--text-tertiary)] opacity-40'
                      } ${poppedStar === star ? 'scale-125' : ''}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Encouragement Message */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[var(--text-primary)]">
                  {language === 'hi' ? '4. डेवलपर के लिए संदेश (वैकल्पिक)' : '4. Message to Developer (Optional)'}
                </label>
                <span className="text-[10px] text-[var(--text-tertiary)]">
                  {message.length} / 350
                </span>
              </div>
              <textarea
                rows={2}
                maxLength={350}
                placeholder={
                  language === 'hi'
                    ? 'नागरिक निष्पक्षता और सर्वर को जीवित रखने के लिए अपनी बात लिखें...'
                    : 'Leave a brief encouraging review or message for Anurag...'
                }
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl bg-[var(--bg-surface)] border text-base sm:text-xs text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-amber-500/40 resize-none ${
                  messageHasLink ? 'border-[var(--error)] focus:ring-[var(--error)]' : 'border-[var(--border-glass)]'
                }`}
              />
            </div>

            {/* CTA Button: Direct Redirect Link */}
            <div className="pt-2">
              <a
                href={BUYMEACHAI_CONFIG.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleProceedToPayment}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black text-sm shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Coffee className="w-4 h-4 shrink-0" />
                <span>
                  {language === 'hi'
                    ? `Buy Me a Chai पर ₹${currentAmount} का भुगतान करें (पेमेंट पेज)`
                    : `Pay ₹${currentAmount} on Buy Me a Chai (Payment Page)`}
                </span>
                <ExternalLink className="w-4 h-4 shrink-0 opacity-80" />
              </a>
            </div>

            <div className="text-center text-[11px] text-[var(--text-tertiary)] leading-relaxed font-normal">
              {language === 'hi'
                ? 'क्लिक करते ही आप सुरक्षित UPI भुगतान के लिए सीधे Buy Me a Chai (buymeachai.in/ryper) पर रीडायरेक्ट हो जाएंगे।'
                : 'Clicking will redirect you directly to Buy Me a Chai (buymeachai.in/ryper) to complete payment securely via UPI.'}
            </div>
          </div>
        )}

        {/* ── STAGE 2: 100% AUTOMATED VERIFICATION IN REAL TIME ───────────── */}
        {step === 'auto_verifying' && (
          <div className="py-6 text-center space-y-6 animate-in fade-in duration-300">
            {/* Pulsing Radar Container with Mera Vote Logo */}
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-amber-500/40 animate-pulse-ring" />
              <div className="absolute -inset-2 rounded-full border border-amber-500/20 animate-ping opacity-40" />
              <div className="w-16 h-16 rounded-2xl bg-white dark:bg-white/95 border border-[var(--border-glass)] p-1.5 flex items-center justify-center shadow-lg overflow-hidden shrink-0">
                <Image
                  src="/meravote-logo.png"
                  alt="Mera Vote Logo"
                  width={56}
                  height={56}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-mono text-[11px] font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                <span>
                  {language === 'hi' ? 'भुगतान का स्वतः पता लगाया जा रहा है...' : 'Auto-Detecting Payment...'}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] tracking-tight">
                {language === 'hi' ? 'Buy Me a Chai पर भुगतान पूरा करें' : 'Complete Payment on Buy Me a Chai'}
              </h3>

              <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-sm mx-auto leading-relaxed font-normal">
                {language === 'hi' ? (
                  <>
                    हमने एक नए टैब में <strong className="text-[var(--text-primary)]">buymeachai.in/ryper</strong> खोला है। कृपया वहां अपना <strong className="text-amber-600 dark:text-amber-400 font-bold">₹{currentAmount}</strong> का योगदान पूरा करें।
                  </>
                ) : (
                  <>
                    We opened <strong className="text-[var(--text-primary)]">buymeachai.in/ryper</strong> in a new tab. Please complete your <strong className="text-amber-600 dark:text-amber-400 font-bold">₹{currentAmount}</strong> contribution there.
                  </>
                )}
              </p>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs max-w-sm mx-auto animate-shake">
                {formError}
              </div>
            )}

            {/* Real-time Status Card */}
            <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-glass)] max-w-sm mx-auto text-left space-y-1.5 shadow-sm">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-[var(--text-secondary)]">
                  {language === 'hi' ? 'लाइव सर्वर जांच' : 'Live Server Check'}
                </span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active ({pollCountdown}s)
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-tertiary)] leading-relaxed">
                {language === 'hi'
                  ? 'किसी ट्रांजेक्शन आईडी की आवश्यकता नहीं है। जैसे ही Buy Me a Chai आपके योगदान की पुष्टि करेगा, यह विंडो स्वतः अनलॉक हो जाएगी।'
                  : 'No transaction ID required. As soon as Buy Me a Chai confirms your contribution, this window will automatically unlock and verify your support.'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2.5 max-w-xs mx-auto">
              <button
                type="button"
                disabled={isManualChecking}
                onClick={handleManualCheckNow}
                className="w-full py-2.5 px-4 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-60"
              >
                {isManualChecking ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>{language === 'hi' ? 'पेमेंट लेज़र की जांच जारी...' : 'Checking Payment Ledger...'}</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>
                      {language === 'hi'
                        ? 'मैंने भुगतान पूरा कर लिया — अभी सत्यापित करें'
                        : "I've Completed Payment — Verify Now"}
                    </span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => window.open(BUYMEACHAI_CONFIG.url, '_blank', 'noopener,noreferrer')}
                className="w-full py-2 px-4 rounded-full bg-[var(--bg-surface)] hover:bg-[var(--border-glass)] border border-[var(--border-glass)] text-amber-600 dark:text-amber-400 text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-1.5"
              >
                <span>{language === 'hi' ? 'Buy Me a Chai पेमेंट टैब फिर से खोलें' : 'Re-open Payment Tab'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              {/* 1-click fallback if 45s timer completes */}
              {pollCountdown === 0 && (
                <div className="pt-2 space-y-2">
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-[11px] text-amber-700 dark:text-amber-300 leading-relaxed text-left">
                    {language === 'hi'
                      ? 'यदि आपने भुगतान पूरा कर लिया है परंतु ऑटो-वेरिफिकेशन में समय लग रहा है, तो आप 1-क्लिक में अपनी समीक्षा अनुराग को अनुमोदन के लिए भेज सकते हैं:'
                      : 'If you finished payment but auto-verification is taking extra time, submit for 1-click creator approval:'}
                  </div>
                  <button
                    type="button"
                    disabled={isSubmittingApproval}
                    onClick={handleSubmitForCreatorApproval}
                    className="w-full py-2.5 px-4 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold text-xs shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    {isSubmittingApproval ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {language === 'hi'
                        ? 'अनुमोदन के लिए समीक्षा सबमिट करें'
                        : 'Submit Review for Approval'}
                    </span>
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => setStep('payment_failed')}
                className="text-[11px] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] underline cursor-pointer pt-1"
              >
                {language === 'hi' ? 'मैंने भुगतान रद्द कर दिया' : 'I cancelled or did not complete payment'}
              </button>
            </div>
          </div>
        )}

        {/* ── STAGE 3: PAYMENT DETECTED & VERIFIED ────────────────────────── */}
        {step === 'payment_success' && (
          <div className="text-center py-6 space-y-5 animate-in zoom-in-95 duration-300">
            {/* Meravote Badge with verified check */}
            <div className="w-16 h-16 rounded-2xl bg-white dark:bg-white/95 border border-[var(--border-glass)] p-1.5 flex items-center justify-center shadow-lg overflow-hidden mx-auto">
              <Image
                src="/meravote-logo.png"
                alt="Mera Vote Logo"
                width={56}
                height={56}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="w-16 h-16 rounded-full bg-[var(--success-soft)] text-[var(--success)] flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--success)] block font-mono">
                {language === 'hi' ? 'भुगतान स्वतः सत्यापित हुआ ✓' : 'Payment Automatically Verified ✓'}
              </span>

              <h3 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">
                {language === 'hi'
                  ? `दिल से धन्यवाद, ${supporterName || 'नागरिक'}!`
                  : `Thank You, ${supporterName || 'Supporter'}!`}
              </h3>

              <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-sm mx-auto leading-relaxed font-normal">
                {language === 'hi'
                  ? `आपका ₹${currentAmount} का योगदान Buy Me a Chai से सीधे सत्यापित हो गया है। आपका यह समर्थन 'मेरा वोट' को स्वतंत्र, निष्पक्ष और चालू रखने में अमूल्य है।`
                  : `Your contribution of ₹${currentAmount} was verified directly via Buy Me a Chai. Your generous support keeps Mera Vote independent, transparent, and operational for Indian citizens.`}
              </p>
            </div>

            {/* Review Summary Card */}
            <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-glass)] max-w-sm mx-auto text-left space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--text-primary)]">
                  {supporterName || 'Anonymous Citizen'}
                </span>
                <div className="flex items-center gap-1 text-amber-500 text-xs">
                  {[...Array(starRating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                  ))}
                </div>
              </div>
              {message && (
                <p className="text-xs text-[var(--text-secondary)] italic leading-relaxed">
                  &ldquo;{message}&rdquo;
                </p>
              )}
              <div className="pt-1 flex items-center gap-1 text-[10px] text-[var(--success)] font-semibold border-t border-[var(--border-glass)]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'सत्यापित नागरिक योगदानकर्ता' : 'Verified Civic Contributor'}</span>
              </div>
            </div>

            <div className="flex items-center justify-center pt-2">
              <button
                type="button"
                onClick={handleModalClose}
                className="px-8 py-3 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold text-xs cursor-pointer shadow-md transition-all active:scale-95"
              >
                {language === 'hi' ? 'विंडो बंद करें' : 'Close Window'}
              </button>
            </div>
          </div>
        )}

        {/* ── STAGE 4: PAYMENT NOT COMPLETED / CANCELLED ──────────────────── */}
        {step === 'payment_failed' && (
          <div className="text-center py-6 space-y-6 animate-in fade-in duration-300">
            <div className="relative w-16 h-16 mx-auto flex items-center justify-center animate-shake">
              <div className="w-16 h-16 rounded-full bg-[var(--error-soft)] text-[var(--error)] flex items-center justify-center shadow-md">
                <XCircle className="w-10 h-10" />
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--error)] block font-mono">
                {language === 'hi' ? 'भुगतान पूरा नहीं हुआ' : 'Payment Not Completed'}
              </span>

              <h3 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] tracking-tight">
                {language === 'hi' ? 'कोई भुगतान नहीं मिला' : 'No Payment Detected'}
              </h3>

              <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-sm mx-auto leading-relaxed font-normal">
                {language === 'hi'
                  ? 'हमें Buy Me a Chai से कोई पूर्ण भुगतान प्राप्त नहीं हुआ। आपसे कोई शुल्क नहीं लिया गया है।'
                  : 'We did not receive a completed payment from Buy Me a Chai. You were not charged, and no record was published.'}
              </p>
            </div>

            <div className="flex flex-col gap-2.5 max-w-xs mx-auto pt-2">
              <button
                type="button"
                onClick={() => setStep('form')}
                className="w-full py-3 px-4 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs cursor-pointer shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{language === 'hi' ? 'पुनः प्रयास करें' : 'Try Payment Again'}</span>
              </button>

              <button
                type="button"
                onClick={handleModalClose}
                className="w-full py-2.5 px-4 rounded-full bg-[var(--bg-surface)] hover:bg-[var(--border-glass)] border border-[var(--border-glass)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium text-xs cursor-pointer transition-all active:scale-95"
              >
                {language === 'hi' ? 'विंडो बंद करें' : 'Close Window'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
    </Portal>
  );
}
