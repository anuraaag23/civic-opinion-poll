'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  X,
  ExternalLink,
  ShieldCheck,
  Star,
  CheckCircle2,
  Coffee,
  Heart,
  Loader2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useI18n } from '@/lib/i18n/context';
import { KOFI_CONFIG, addSupporter } from '@/lib/kofi/config';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultAmount?: number;
}

export function SupportModal({ isOpen, onClose, defaultAmount = 100 }: SupportModalProps) {
  const { language } = useI18n();

  const [step, setStep] = useState<'form' | 'success'>('form');
  const [selectedAmount, setSelectedAmount] = useState<number>(defaultAmount);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [supporterName, setSupporterName] = useState<string>('');
  const [starRating, setStarRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [message, setMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasOpenedKofi, setHasOpenedKofi] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
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
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentAmount = customAmount ? Math.max(1, Number(customAmount) || 0) : selectedAmount;
  const estimatedCups = Math.max(1, Math.round(currentAmount / 50));

  const handleModalClose = () => {
    setStep('form');
    setCustomAmount('');
    setHasOpenedKofi(false);
    onClose();
  };

  const handleOpenKofi = () => {
    setHasOpenedKofi(true);
    // Open official Ko-fi page in a new secure window
    window.open(KOFI_CONFIG.url, '_blank', 'noopener,noreferrer');
  };

  const handleCompleteSupport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { supporter } = addSupporter(
        supporterName || 'Anonymous Citizen',
        currentAmount,
        estimatedCups,
        starRating,
        message,
        `kofi-${Date.now()}`,
        true
      );

      // Also record to server
      try {
        await fetch('/api/support', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: supporter.name,
            amount: supporter.amount,
            cups: supporter.cups,
            rating: supporter.rating,
            message: supporter.message,
            paymentRef: supporter.paymentRef,
          }),
        });
      } catch {
        // Fallback silently if offline, local storage has it
      }

      setStep('success');

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2457D6', '#22C55E', '#F59E0B', '#F97316', '#60A5FA'],
      });
    } catch (err) {
      console.error('Error completing support:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
    >
      {/* Translucent Backdrop */}
      <div
        className="fixed inset-0 bg-black/55 backdrop-blur-sm transition-opacity"
        onClick={handleModalClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div className="relative z-10 w-full max-w-lg glass-panel-elevated p-6 sm:p-8 shadow-2xl transition-all my-8 max-h-[92vh] overflow-y-auto border border-amber-500/20">
        {/* Close Button */}
        <button
          onClick={handleModalClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-glass)] transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {step === 'form' ? (
          <div className="space-y-6">
            {/* Header with Mera Vote Logo */}
            <div className="text-center space-y-2.5 pt-1">
              <div className="flex items-center justify-center gap-2 mb-1">
                <div className="w-10 h-10 rounded-2xl bg-white dark:bg-white/95 border border-[var(--border-glass)] p-1 flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                  <Image
                    src="/meravote-logo.png"
                    alt="Mera Vote Logo"
                    width={40}
                    height={40}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
                  <Coffee className="w-3.5 h-3.5" />
                  <span>Ko-fi • Buy a Coffee</span>
                </div>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] tracking-tight">
                {language === 'hi'
                  ? 'इस वेबसाइट को जीवित रखने के लिए डेवलपर का समर्थन करें'
                  : 'support to developer for make alive this website'}
              </h3>

              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed max-w-md mx-auto">
                {language === 'hi'
                  ? 'यह स्वतंत्र मंच उत्तर प्रदेश के एक 20 वर्षीय युवा द्वारा बनाया गया है। बिना किसी कॉर्पोरेट या राजनीतिक फंडिंग के सर्वर चालू रखने में अपना योगदान दें।'
                  : 'Mera Vote is an independent civic platform built by a 20-year-old student from Uttar Pradesh with zero corporate or party funding. Your support keeps our servers live and ad-free.'}
              </p>
            </div>

            {/* Contribution Amount Preset Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider block">
                {language === 'hi' ? 'योगदान राशि चुनें' : 'Select Amount'}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[50, 100, 250, 500].map((amt) => {
                  const cups = Math.max(1, Math.round(amt / 50));
                  const isSelected = selectedAmount === amt && !customAmount;
                  return (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setSelectedAmount(amt);
                        setCustomAmount('');
                      }}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)] font-bold shadow-xs scale-102 ring-1 ring-[var(--accent)]'
                          : 'border-[var(--border-glass)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 text-[var(--text-primary)] font-medium'
                      }`}
                    >
                      <div className="text-sm sm:text-base font-extrabold">₹{amt}</div>
                      <div className="text-[10px] text-[var(--text-tertiary)]">
                        {cups} {cups === 1 ? 'cup ☕' : 'cups ☕'}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Custom Amount Input */}
              <div className="pt-1">
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[var(--text-secondary)]">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="10"
                    max="100000"
                    placeholder={language === 'hi' ? 'अन्य राशि (INR)' : 'Custom Amount (INR)'}
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 text-sm rounded-xl border border-[var(--border-glass)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-all font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Supporter Details Form */}
            <form onSubmit={handleCompleteSupport} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-primary)] block">
                  {language === 'hi' ? 'आपका नाम (या उपनाम)' : 'Your Name or Nickname'}
                </label>
                <input
                  type="text"
                  maxLength={60}
                  placeholder={language === 'hi' ? 'उदा. जागरूक नागरिक' : 'e.g. Proud Indian Citizen'}
                  value={supporterName}
                  onChange={(e) => setSupporterName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-[var(--border-glass)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-all font-medium"
                />
              </div>

              {/* Star Rating */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-primary)] block">
                  {language === 'hi' ? 'मंच को रेटिंग दें' : 'Rate Mera Vote'}
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setStarRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 text-amber-400 hover:scale-115 transition-transform cursor-pointer"
                      aria-label={`${star} star`}
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= (hoverRating || starRating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-[var(--text-tertiary)] opacity-40'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-[var(--text-secondary)] ml-2">
                    {starRating} / 5
                  </span>
                </div>
              </div>

              {/* Optional Encouragement Message */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[var(--text-primary)]">
                    {language === 'hi' ? 'डेवलपर के लिए संदेश (वैकल्पिक)' : 'Message to Developer (Optional)'}
                  </label>
                  <span className="text-[10px] text-[var(--text-tertiary)]">
                    {message.length}/350
                  </span>
                </div>
                <textarea
                  rows={2}
                  maxLength={350}
                  placeholder={
                    language === 'hi'
                      ? 'वेबसाइट को चालू रखने के लिए अपना संदेश या सुझाव लिखें...'
                      : 'Leave a word of encouragement to keep this platform alive and independent...'
                  }
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[var(--border-glass)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-all resize-none font-medium"
                />
              </div>

              {/* Step 1: Open Ko-fi Button */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleOpenKofi}
                  className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group cursor-pointer active:scale-98"
                >
                  <Coffee className="w-4 h-4 transition-transform group-hover:rotate-12" />
                  <span>
                    {language === 'hi'
                      ? `Ko-fi पर ₹${currentAmount} का समर्थन करें`
                      : `Pay ₹${currentAmount} on Ko-fi (${estimatedCups} ${estimatedCups === 1 ? 'Cup' : 'Cups'})`}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </button>

                <p className="text-[11px] text-center text-[var(--text-tertiary)]">
                  {language === 'hi'
                    ? 'सुरक्षित Ko-fi पेज (UPI, कार्ड और नेट बैंकिंग समर्थित)'
                    : 'Opens secure Ko-fi checkout (UPI, Cards, and NetBanking supported)'}
                </p>
              </div>

              {/* Step 2: Confirmation / Finalize */}
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    hasOpenedKofi
                      ? 'bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] shadow-sm'
                      : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-glass)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-[var(--success)]" />
                  )}
                  <span>
                    {language === 'hi'
                      ? 'मैंने Ko-fi पर योगदान पूरा कर लिया है'
                      : "I've completed my contribution on Ko-fi"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Step: Success Screen */
          <div className="space-y-6 text-center py-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-white dark:bg-white/95 border border-[var(--border-glass)] p-1 flex items-center justify-center shrink-0 shadow-xs">
                <Image src="/meravote-logo.png" alt="Mera Vote" width={28} height={28} className="w-full h-full object-contain" />
              </div>
              <span className="text-xs font-black tracking-wide uppercase px-2.5 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]/20">
                {language === 'hi' ? 'मेरा वोट' : 'Mera Vote'}
              </span>
            </div>

            <div className="w-16 h-16 rounded-full bg-[var(--success-soft)] text-[var(--success)] flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold">
                <Heart className="w-3.5 h-3.5 fill-current" />
                <span>{language === 'hi' ? 'दिल से धन्यवाद!' : 'Heartfelt Thanks!'}</span>
              </div>
              <h3 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">
                {language === 'hi' ? 'आपका समर्थन दर्ज हो गया है' : 'Thank You for Keeping Us Alive!'}
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-sm mx-auto leading-relaxed">
                {language === 'hi'
                  ? `आपकी ₹${currentAmount} की सहायता से 'मेरा वोट' पूरी तरह स्वतंत्र, निष्पक्ष और लाइव बना रहेगा।`
                  : `Your contribution of ₹${currentAmount} helps keep Mera Vote independent, transparent, and operational for every Indian citizen.`}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] text-xs text-[var(--text-secondary)] leading-relaxed text-left flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[var(--success)] shrink-0 mt-0.5" />
              <span>
                {language === 'hi'
                  ? 'आपकी सहायता सीधे सर्वर लागत और डेटा सुरक्षा में उपयोग की जाती है।'
                  : 'Your generous contribution directly funds hosting infrastructure and security integrity.'}
              </span>
            </div>

            <button
              onClick={handleModalClose}
              className="w-full py-3 px-5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              {language === 'hi' ? 'वापस जाएँ' : 'Back to Mera Vote'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
