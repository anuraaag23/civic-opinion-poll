'use client';

import React, { useState, useEffect, useSyncExternalStore } from 'react';
import { Download, Share2, PlusSquare, X, Smartphone } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function subscribeStandalone(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  const mq = window.matchMedia('(display-mode: standalone)');
  mq.addEventListener('change', callback);
  return () => mq.removeEventListener('change', callback);
}

function getStandaloneSnapshot(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function getStandaloneServerSnapshot(): boolean {
  return false;
}

function checkIsIos(): boolean {
  if (typeof window === 'undefined') return false;
  return /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
}

export function InstallAppPrompt() {
  const { language } = useI18n();
  const isStandalone = useSyncExternalStore(
    subscribeStandalone,
    getStandaloneSnapshot,
    getStandaloneServerSnapshot
  );

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return sessionStorage.getItem('mera_vote_pwa_dismissed') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const isIos = typeof window !== 'undefined' ? checkIsIos() : false;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setDeferredPrompt(null);
        setBannerDismissed(true);
      }
    } else if (isIos) {
      setShowIosGuide(true);
    }
  };

  const handleDismiss = () => {
    setBannerDismissed(true);
    try {
      sessionStorage.setItem('mera_vote_pwa_dismissed', 'true');
    } catch {}
  };

  if (isStandalone) {
    return null;
  }

  return (
    <>
      {/* Smart Mobile/Tablet Install App Banner */}
      {!bannerDismissed && (deferredPrompt || isIos) && (
        <aside
          aria-label="App installation banner"
          className="fixed bottom-16 sm:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-40 bg-[var(--bg-glass-elevated)] backdrop-blur-xl border border-[var(--border-glass)] rounded-2xl p-3.5 shadow-2xl animate-in slide-in-from-bottom-4 duration-300 transition-all"
        >
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shrink-0 shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/meravote-logo.png" alt="Mera Vote Logo" className="w-8 h-8 rounded-lg object-contain" />
            </div>

            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-[var(--text-primary)]">Mera Vote App</span>
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400">
                  {language === 'hi' ? 'आधिकारिक ऐप' : 'Official App'}
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] leading-tight mt-0.5 line-clamp-2">
                {language === 'hi'
                  ? 'अपने फोन पर ऐप इंस्टॉल करें — 1-टैप में त्वरित मतदान व लाइव परिणाम।'
                  : 'Install on your phone for instant 1-tap voting and live results without browser bar.'}
              </p>

              <div className="flex items-center gap-2 mt-2.5">
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="px-3.5 py-1.5 rounded-lg bg-[var(--accent)] hover:opacity-90 active:scale-95 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{language === 'hi' ? 'ऐप डाउनलोड करें' : 'Download App'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-glass)] transition-all cursor-pointer"
                >
                  {language === 'hi' ? 'बाद में' : 'Maybe Later'}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDismiss}
              className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] p-1 rounded-lg transition-colors cursor-pointer"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </aside>
      )}

      {/* iOS Safari Add to Home Screen Instructions Modal */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-glass)] p-5 space-y-4 shadow-2xl text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm">
                  MV
                </div>
                <div>
                  <h3 className="text-sm font-black text-[var(--text-primary)]">
                    {language === 'hi' ? 'आईफोन पर ऐप इंस्टॉल करें' : 'Install on iPhone / iPad'}
                  </h3>
                  <p className="text-[11px] text-[var(--text-secondary)]">Apple Safari Instructions</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowIosGuide(false)}
                className="p-1 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 pt-1 text-xs text-[var(--text-secondary)] leading-relaxed">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-[var(--bg-glass)] border border-[var(--border-glass)]">
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 font-bold">
                  1
                </div>
                <div>
                  <span className="font-bold text-[var(--text-primary)] block">
                    {language === 'hi' ? 'सफारी का शेयर बटन दबाएं' : 'Tap the Safari Share button'}
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5 text-[11px]">
                    <span>{language === 'hi' ? 'स्क्रीन के नीचे' : 'Located at the bottom:'}</span>
                    <Share2 className="w-3.5 h-3.5 text-blue-500 inline" />
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-[var(--bg-glass)] border border-[var(--border-glass)]">
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 font-bold">
                  2
                </div>
                <div>
                  <span className="font-bold text-[var(--text-primary)] block">
                    {language === 'hi' ? '"Add to Home Screen" चुनें' : 'Select "Add to Home Screen"'}
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5 text-[11px]">
                    <PlusSquare className="w-3.5 h-3.5 text-blue-500 inline" />
                    <span>{language === 'hi' ? 'सूची में नीचे स्क्रॉल करके टैप करें' : 'Scroll down the menu & tap Add'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-[var(--bg-glass)] border border-[var(--border-glass)]">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 font-bold">
                  ✓
                </div>
                <div>
                  <span className="font-bold text-[var(--text-primary)] block">
                    {language === 'hi' ? 'नेटिव ऐप की तरह खोलें' : 'Enjoy Native Fullscreen App'}
                  </span>
                  <span className="text-[11px]">
                    {language === 'hi'
                      ? 'Mera Vote आपकी होम स्क्रीन पर वास्तविक ऐप आइकन की तरह दिखेगा।'
                      : 'Mera Vote will appear on your home screen with its official icon.'}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIosGuide(false)}
              className="w-full py-2.5 rounded-xl bg-[var(--accent)] text-white font-bold text-xs transition-transform active:scale-95 cursor-pointer shadow-xs"
            >
              {language === 'hi' ? 'समझ गया' : 'Got It'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export function InstallAppNavButton({ className = '' }: { className?: string }) {
  const { language } = useI18n();
  const isStandalone = useSyncExternalStore(
    subscribeStandalone,
    getStandaloneSnapshot,
    getStandaloneServerSnapshot
  );

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  if (isStandalone) return null;

  const handleClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      setDeferredPrompt(null);
    } else {
      setShowIosGuide(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xs transition-all active:scale-95 cursor-pointer ${className}`}
        title="Download Mera Vote Native App"
      >
        <Smartphone className="w-3.5 h-3.5" />
        <span>{language === 'hi' ? 'ऐप इंस्टॉल करें' : 'Download App'}</span>
      </button>

      {showIosGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-[var(--bg-surface)] p-5 space-y-3 shadow-2xl border border-[var(--border-glass)]">
            <h4 className="text-sm font-bold text-[var(--text-primary)]">
              {language === 'hi' ? 'होम स्क्रीन पर ऐप जोड़ें' : 'Add to Home Screen'}
            </h4>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {language === 'hi'
                ? 'ब्राउज़र के शेयर बटन (नीचे या ऊपर) पर टैप करें और "Add to Home Screen" चुनें।'
                : 'Tap the browser Share button and select "Add to Home Screen" to install.'}
            </p>
            <button
              type="button"
              onClick={() => setShowIosGuide(false)}
              className="w-full py-2 rounded-xl bg-[var(--accent)] text-white font-bold text-xs cursor-pointer"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </>
  );
}
