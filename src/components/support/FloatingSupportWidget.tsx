'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Coffee } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { BUYMEACHAI_CONFIG, getStoredSupportStats, SupportStats } from '@/lib/buymeachai/config';

export function FloatingSupportWidget() {
  const pathname = usePathname();
  const { language } = useI18n();
  const [stats, setStats] = useState<SupportStats>(() => getStoredSupportStats());
  const [isNearFooter, setIsNearFooter] = useState(false);

  useEffect(() => {
    if (pathname !== '/') return;

    // Observe footer to avoid covering footer links or legal disclaimers
    const footerEl = document.querySelector('footer');
    if (!footerEl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsNearFooter(entry.isIntersecting);
      },
      { root: null, threshold: 0.05 }
    );

    observer.observe(footerEl);
    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    if (pathname !== '/') return;

    // Fetch live stats from server
    fetch('/api/support')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.stats) {
          setStats(data.stats);
        }
      })
      .catch(() => {});

    // Listen to local update events
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<SupportStats>;
      if (customEvent.detail) setStats(customEvent.detail);
    };

    window.addEventListener('meravote_support_updated', handleUpdate);
    return () => window.removeEventListener('meravote_support_updated', handleUpdate);
  }, [pathname]);

  // Hide the floating support button on all other pages and especially on /admin
  if (pathname !== '/') {
    return null;
  }

  const titleText =
    language === 'hi'
      ? 'इस वेबसाइट को जीवित रखने के लिए डेवलपर का समर्थन करें'
      : 'Support the developer to keep this platform running';

  return (
    <div
      className={`fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 transition-all duration-300 ${
        isNearFooter ? 'opacity-0 pointer-events-none translate-y-4 scale-90' : 'opacity-100 translate-y-0 scale-100'
      }`}
    >
      {/* ── MOBILE VIEW: ANIMATED FLOATING CUP ICON BUTTON (< 640px) ── */}
      <a
        href={BUYMEACHAI_CONFIG.url}
        target="_blank"
        rel="noopener noreferrer"
        className="sm:hidden relative w-12 h-12 rounded-full bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-600 text-white shadow-2xl flex items-center justify-center border-2 border-amber-200/50 active:scale-90 transition-transform cursor-pointer"
        aria-label={titleText}
        title={titleText}
      >
        {/* Animated Chai Cup */}
        <div className="flex items-center justify-center animate-cup-tilt">
          <Coffee className="w-5 h-5 text-white" />
        </div>

        {/* Live Active Pulse Dot */}
        <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-amber-600 animate-pulse" />
      </a>

      {/* ── PC & TABLET VIEW: ANIMATED CUP WITH SUPPORT TEXT (>= 640px) ── */}
      <a
        href={BUYMEACHAI_CONFIG.url}
        target="_blank"
        rel="noopener noreferrer"
        className="hidden sm:flex group relative items-center gap-2.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-amber-300/40"
        aria-label={titleText}
        title={titleText}
      >
        {/* Animated Chai Cup in Circular Badge */}
        <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-white/20 text-white shadow-inner shrink-0">
          <Coffee className="w-4 h-4 text-white animate-cup-tilt" />
        </div>

        {/* Text and stats */}
        <div className="flex flex-col text-left pr-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black tracking-tight text-white drop-shadow-2xs">
              {language === 'hi' ? 'डेवलपर का समर्थन करें' : 'Support Developer'}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
          </div>
          <span className="text-[10px] text-white/90 font-medium leading-none mt-0.5 flex items-center gap-1">
            {stats.totalCups > 0
              ? `${stats.totalCups} Cups · ₹${stats.totalAmountInr.toLocaleString()}`
              : language === 'hi'
              ? 'वेबसाइट चालू रखें'
              : 'Keep this alive'}
          </span>
        </div>
      </a>
    </div>
  );
}
