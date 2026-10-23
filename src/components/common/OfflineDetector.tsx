'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { WifiOff, Wifi, RefreshCw, AlertCircle, ShieldAlert, X } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';

export function OfflineDetector() {
  const { language } = useI18n();
  const [isOffline, setIsOffline] = useState(() => (typeof navigator !== 'undefined' ? !navigator.onLine : false));
  const [isRetrying, setIsRetrying] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [retryFailed, setRetryFailed] = useState(false);

  // Connectivity check function (tries network ping)
  const checkRealConnection = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined') return true;
    if (!navigator.onLine) return false;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const res = await fetch(`/favicon.ico?_ping=${Date.now()}`, {
        method: 'HEAD',
        cache: 'no-store',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return res.ok || res.status < 500;
    } catch {
      return false;
    }
  }, []);

  const handleRetry = async () => {
    setIsRetrying(true);
    setRetryFailed(false);
    const online = await checkRealConnection();
    setIsRetrying(false);

    if (online) {
      setIsOffline(false);
      setIsDismissed(false);
      setWasOffline(true);
      setTimeout(() => setWasOffline(false), 4000);
    } else {
      setRetryFailed(true);
      setTimeout(() => setRetryFailed(false), 3000);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const onOnline = async () => {
      const isActuallyOnline = await checkRealConnection();
      if (isActuallyOnline) {
        setIsOffline(false);
        setIsDismissed(false);
        setWasOffline(true);
        setTimeout(() => setWasOffline(false), 4000);
      }
    };

    const onOffline = () => {
      setIsOffline(true);
      setIsDismissed(false);
      setWasOffline(false);
    };

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, [checkRealConnection]);

  // Back Online Notification Toast
  if (wasOffline && !isOffline) {
    return (
      <aside
        aria-label="Network Status Alert"
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-auto"
      >
        <div className="px-4 py-2.5 rounded-full bg-emerald-600 text-white shadow-2xl flex items-center gap-2.5 text-xs font-bold border border-emerald-400/40">
          <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <Wifi className="w-4 h-4 text-white" />
          <span>
            {language === 'hi'
              ? 'इंटरनेट कनेक्शन बहाल हो गया'
              : 'Internet Connection Restored'}
          </span>
        </div>
      </aside>
    );
  }

  if (!isOffline) {
    return null;
  }

  // If user dismissed modal, show persistent floating pill badge
  if (isDismissed) {
    return (
      <aside
        aria-label="Network Status Alert"
        className="fixed bottom-4 left-4 z-50 animate-in fade-in duration-200"
      >
        <button
          type="button"
          onClick={() => setIsDismissed(false)}
          className="px-3.5 py-2 rounded-full bg-red-600 text-white hover:bg-red-700 shadow-2xl flex items-center gap-2 text-xs font-bold border border-red-400/50 cursor-pointer active:scale-95 transition-transform"
        >
          <span className="w-2 h-2 rounded-full bg-amber-300 animate-ping" />
          <WifiOff className="w-3.5 h-3.5" />
          <span>{language === 'hi' ? 'ऑफलाइन • पुनः कनेक्ट करें' : 'Offline • Reconnect'}</span>
        </button>
      </aside>
    );
  }

  // Full-Screen Themed Offline Error Window
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="offline-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="max-w-md w-full glass-panel-elevated p-6 sm:p-8 space-y-6 text-center relative border-red-500/30 shadow-2xl">
        {/* Close / Dismiss button */}
        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors cursor-pointer"
          title={language === 'hi' ? 'सूचना छुपाएं' : 'Dismiss notice'}
          aria-label="Dismiss notice"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Pulsing Animated Icon */}
        <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
          <span className="absolute inset-0 rounded-full bg-red-500/20 animate-ping opacity-60" />
          <div className="relative w-14 h-14 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-500 flex items-center justify-center shadow-inner">
            <WifiOff className="w-7 h-7 stroke-[2.2]" />
          </div>
        </div>

        {/* Headings */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 pt-[4px] pb-[3px] rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 text-[11px] font-bold uppercase tracking-wider leading-none">
            <AlertCircle className="w-3 h-3" />
            <span>Connection Offline • नेटवर्क अनुपलब्ध</span>
          </div>

          <h2 id="offline-dialog-title" className="text-xl sm:text-2xl font-black tracking-tight text-[var(--text-primary)]">
            No Internet Connection
          </h2>
          <h3 className="text-sm font-bold text-red-600 dark:text-red-400">
            इंटरनेट कनेक्शन उपलब्ध नहीं है
          </h3>

          <p className="text-xs text-[var(--text-secondary)] leading-relaxed pt-1">
            {language === 'hi'
              ? 'आप वर्तमान में ऑफ़लाइन हैं। सटीक मतदान, क्रिप्टोग्राफ़िक टोकन सत्यापन और लाइव परिणामों के लिए इंटरनेट कनेक्शन आवश्यक है।'
              : 'You are currently disconnected from the internet. Mera Vote requires an active network connection to verify cryptographic voter tokens and record responses securely.'}
          </p>
        </div>

        {/* Privacy & Safety Note */}
        <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] text-left flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[11px] text-[var(--text-secondary)] leading-normal">
            {language === 'hi'
              ? 'चिंता न करें, आपका मतदान डेटा सुरक्षित रहेगा। नेटवर्क वापस आते ही आप मतदान जारी रख सकते हैं।'
              : 'Your voter isolation remains intact. Actions will automatically sync when your connection is restored.'}
          </p>
        </div>

        {/* Failure alert if retry was unsuccessful */}
        {retryFailed && (
          <div className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-xs font-semibold text-red-600 dark:text-red-400 animate-in fade-in duration-150">
            {language === 'hi'
              ? 'अभी भी कनेक्शन उपलब्ध नहीं है। कृपया अपना वाई-फाई या मोबाइल डेटा जांचें।'
              : 'Still unable to reach the network. Please verify your Wi-Fi or mobile data.'}
          </div>
        )}

        {/* Action Controls */}
        <div className="space-y-2.5 pt-1">
          <button
            type="button"
            onClick={handleRetry}
            disabled={isRetrying}
            className="w-full py-2.5 px-4 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
            <span>
              {isRetrying
                ? language === 'hi'
                  ? 'कनेक्शन जांच रहे हैं...'
                  : 'Testing Connection...'
                : language === 'hi'
                ? 'पुनः प्रयास करें (Retry Connection)'
                : 'Retry Connection'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="w-full py-2 px-3 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-primary)] border border-[var(--border-glass)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
          >
            {language === 'hi' ? 'ऑफ़लाइन पढ़ना जारी रखें' : 'Continue Reading Offline'}
          </button>
        </div>
      </div>
    </div>
  );
}
