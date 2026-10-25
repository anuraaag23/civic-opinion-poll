'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { MaintenanceScreen } from './MaintenanceScreen';
import { SiteSettings } from '@/lib/types';

interface MaintenanceGuardProps {
  children: React.ReactNode;
}

export function MaintenanceGuard({ children }: MaintenanceGuardProps) {
  const pathname = usePathname();
  const [siteStatus, setSiteStatus] = useState<SiteSettings | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  // Administrative paths are NEVER blocked by maintenance mode so the admin can always manage the platform
  const isAdminPath =
    pathname.includes('admin') ||
    pathname.includes('admin-ctrl-pnl') ||
    pathname.includes('@admin-ctrl-pnl') ||
    pathname.includes('%40admin-ctrl-pnl');

  const checkStatus = async () => {
    setIsChecking(true);
    try {
      const res = await fetch('/api/site-status', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setSiteStatus(json.data);
        }
      }
    } catch {
      // ignore
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    let active = true;
    let lastSettingsJson = '';

    const pollStatus = async () => {
      // If the tab is in the background, skip polling to save CPU and battery
      if (typeof document !== 'undefined' && document.hidden) {
        return;
      }

      try {
        const res = await fetch('/api/site-status', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
          },
        });
        if (res.ok) {
          const json = await res.json();
          if (active && json.success && json.data) {
            const currentJson = JSON.stringify(json.data);
            // Only trigger React state update and event broadcast if settings actually changed
            if (currentJson !== lastSettingsJson) {
              lastSettingsJson = currentJson;
              setSiteStatus(json.data);
              if (typeof window !== 'undefined') {
                window.dispatchEvent(
                  new CustomEvent('site_settings_updated', { detail: json.data })
                );
              }
            }
          }
        }
      } catch {
        // Ignore background network error
      }
    };

    pollStatus();

    // Relaxed, non-blocking polling interval (60 seconds) instead of battery-draining 3s
    const interval = setInterval(pollStatus, 60000);

    // Refresh immediately when tab regains focus or becomes visible
    const handleVisibilityOrFocus = () => {
      if (typeof document !== 'undefined' && !document.hidden) {
        pollStatus();
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);

    // Immediate local event listener (e.g. when admin toggles setting in another tab or same window)
    const handleLocalUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<SiteSettings>;
      if (customEvent.detail) {
        setSiteStatus(customEvent.detail);
      }
    };
    window.addEventListener('site_settings_updated', handleLocalUpdate);

    return () => {
      active = false;
      clearInterval(interval);
      window.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      window.removeEventListener('site_settings_updated', handleLocalUpdate);
    };
  }, []);

  // If maintenance mode is active AND the current user is NOT on an admin management route:
  if (siteStatus?.maintenanceMode && !isAdminPath) {
    return (
      <MaintenanceScreen
        status={siteStatus}
        onRefresh={checkStatus}
        isChecking={isChecking}
      />
    );
  }

  return <>{children}</>;
}
