'use client';

import React, { useState, useEffect } from 'react';
import { Coffee } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { SupportModal } from './SupportModal';
import { getStoredSupportStats, SupportStats } from '@/lib/kofi/config';

export function FloatingSupportWidget() {
  const { language } = useI18n();
  const [modalOpen, setModalOpen] = useState(false);
  const [stats, setStats] = useState<SupportStats>(() => getStoredSupportStats());

  useEffect(() => {
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
  }, []);

  return (
    <>
      <div className="fixed bottom-5 right-5 z-40">
        <button
          onClick={() => setModalOpen(true)}
          className="group relative flex items-center gap-2.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-amber-300/30"
          aria-label={
            language === 'hi'
              ? 'इस वेबसाइट को जीवित रखने के लिए डेवलपर का समर्थन करें'
              : 'Support developer for make alive this website'
          }
          title={
            language === 'hi'
              ? 'इस वेबसाइट को जीवित रखने के लिए डेवलपर का समर्थन करें'
              : 'Support developer for make alive this website'
          }
        >
          {/* Animated Coffee Icon */}
          <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-white/20 text-white shadow-inner shrink-0">
            <Coffee className="w-4 h-4 transition-transform group-hover:rotate-12" />
          </div>

          {/* Text and stats */}
          <div className="flex flex-col text-left pr-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-tight text-white">
                {language === 'hi' ? 'डेवलपर का समर्थन करें' : 'Support Developer'}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
            </div>
            <span className="text-[10px] text-white/80 font-medium leading-none mt-0.5">
              {stats.totalCups > 0
                ? `${stats.totalCups} ☕ · ₹${stats.totalAmountInr.toLocaleString()}`
                : language === 'hi'
                ? 'वेबसाइट चालू रखें'
                : 'Keep this alive'}
            </span>
          </div>
        </button>
      </div>

      <SupportModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
