'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { SiteSettings } from '@/lib/types';

export function SiteAnnouncementBanner() {
  const { language } = useI18n();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [dismissed, setDismissed] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/site-status', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });
      const data = await res.json();
      if (data.success && data.data) {
        setSettings(data.data);
      }
    } catch {
      // ignore background fetch error
    }
  }, []);

  useEffect(() => {
    fetchSettings();

    // 1. Polling interval to ensure real-time alerts appear within 3 seconds
    const interval = setInterval(fetchSettings, 3000);

    // 2. Immediate local window event listener
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<SiteSettings>;
      if (customEvent.detail) {
        setSettings(customEvent.detail);
        // If settings changed, un-dismiss so newly published alert appears
        setDismissed(false);
      }
    };

    window.addEventListener('site_settings_updated', handleUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('site_settings_updated', handleUpdate);
    };
  }, [fetchSettings]);

  if (!settings || !settings.emergencyBannerEnabled || dismissed) {
    return null;
  }

  const message =
    language === 'hi' && settings.emergencyBannerTextHi
      ? settings.emergencyBannerTextHi
      : settings.emergencyBannerTextEn;

  if (!message) return null;

  const type = settings.emergencyBannerType || 'info';

  const typeConfig = {
    info: {
      bg: 'bg-blue-600/15 border-blue-500/30 text-blue-900 dark:text-blue-200',
      icon: <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />,
      badge: 'सूचना / Notice',
    },
    warning: {
      bg: 'bg-amber-500/15 border-amber-500/30 text-amber-900 dark:text-amber-200',
      icon: <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />,
      badge: 'चेतावनी / Alert',
    },
    alert: {
      bg: 'bg-red-600/15 border-red-500/30 text-red-900 dark:text-red-200',
      icon: <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />,
      badge: 'महत्वपूर्ण / Urgent',
    },
  }[type];

  return (
    <div
      role="alert"
      className={`w-full border-b backdrop-blur-md px-4 py-2.5 flex items-center justify-between gap-3 text-xs sm:text-sm font-medium ${typeConfig.bg}`}
    >
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {typeConfig.icon}
          <span className="font-bold text-xs uppercase px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 shrink-0">
            {typeConfig.badge}
          </span>
          <span className="truncate">{message}</span>
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
