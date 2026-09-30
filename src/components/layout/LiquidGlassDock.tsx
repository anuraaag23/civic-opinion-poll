'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/lib/i18n/context';
import { Home, Vote, BarChart3, HeartHandshake, ShieldCheck } from 'lucide-react';

export function LiquidGlassDock() {
  const pathname = usePathname();
  const { language } = useI18n();

  const tabs = [
    {
      href: '/',
      label: language === 'hi' ? 'गृह' : 'Home',
      icon: Home,
      exact: true,
    },
    {
      href: '/polls/national-opinion-poll-2029',
      label: language === 'hi' ? 'मतदान' : 'Vote',
      exact: false,
    },
    {
      href: '/polls/national-opinion-poll-2029/results',
      label: language === 'hi' ? 'परिणाम' : 'Results',
      icon: BarChart3,
      exact: false,
    },
    {
      href: '/about',
      label: language === 'hi' ? 'निर्माता' : 'About',
      icon: HeartHandshake,
      exact: true,
    },
    {
      href: '/privacy',
      label: language === 'hi' ? 'गोपनीयता' : 'Privacy',
      icon: ShieldCheck,
      exact: true,
    },
  ];

  const isTabActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <nav
      className="lg-tabbar select-none"
      data-lg-stage="vibrant"
      aria-label="Mera Vote Quick Navigation Dock"
    >
      <span className="lg-tabbar-indicator" aria-hidden="true" />
      {tabs.map((tab) => {
        const active = isTabActive(tab.href, tab.exact);
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="lg-tab"
            aria-current={active ? 'page' : undefined}
            data-lg-value={tab.label}
          >
            <span className="lg-tab-content">
              {Icon ? (
                <span className="lg-tab-icon">
                  <Icon className="w-4 h-4" />
                </span>
              ) : (
                <span className="lg-tab-icon">
                  <Vote className="w-4 h-4" />
                </span>
              )}
              <span className="lg-tab-label">{tab.label}</span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
