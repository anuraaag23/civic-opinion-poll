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

    const pollStatus = async () => {
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
            setSiteStatus(json.data);
            // Broadcast to other components like SiteAnnouncementBanner
            if (typeof window !== 'undefined') {
              window.dispatchEvent(
                new CustomEvent('site_settings_updated', { detail: json.data })
              );
            }
          }
        }
      } catch {
        // Ignore background network error
      }
    };

    pollStatus();

    // 1. Real-time background status polling every 3 seconds
    const interval = setInterval(pollStatus, 3000);

    // 2. Immediate local event listener (e.g. when admin toggles setting in another tab or same window)
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
