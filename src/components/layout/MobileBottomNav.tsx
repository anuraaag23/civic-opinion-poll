'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Globe, Building2, Vote, BarChart3 } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';

export function MobileBottomNav() {
  const pathname = usePathname();
  const { language } = useI18n();

  // If in admin portal, don't show the public mobile nav bar
  if (pathname.startsWith('/admin')) {
    return null;
  }

  const navItems = [
    {
      href: '/',
      label: language === 'hi' ? 'होम' : 'Home',
      icon: Home,
      exact: true,
    },
    {
      href: '/pm',
      label: language === 'hi' ? 'PM जनमत' : 'PM Poll',
      icon: Globe,
      exact: false,
    },
    {
      href: '/cm',
      label: language === 'hi' ? 'CM जनमत' : 'CM Poll',
      icon: Building2,
      exact: false,
    },
    {
      href: '/polls',
      label: language === 'hi' ? 'सभी पोल' : 'Polls',
      icon: Vote,
      exact: true,
    },
    {
      href: '/polls/national-opinion-poll-2029/results',
      label: language === 'hi' ? 'परिणाम' : 'Results',
      icon: BarChart3,
      exact: false,
      isResults: true,
    },
  ];

  const isItemActive = (item: typeof navItems[0]) => {
    if (item.isResults) {
      return pathname.includes('/results');
    }
    if (pathname.includes('/results')) {
      return false;
    }
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  };

  return (
    <nav
      aria-label="Mobile Bottom App Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg-glass-elevated)] backdrop-blur-2xl border-t border-[var(--border-glass)] shadow-2xl pb-safe transition-all select-none"
    >
      <div className="grid grid-cols-5 items-center justify-around h-15 max-w-md mx-auto px-1">
        {navItems.map((item) => {
          const active = isItemActive(item);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center h-full py-1 px-1 rounded-xl transition-all duration-150 active:scale-90 cursor-pointer ${
                active
                  ? 'text-[var(--accent)] font-bold'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
              }`}
            >
              <div
                className={`relative flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                  active ? 'bg-[var(--accent-soft)]' : ''
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform ${active ? 'scale-110 stroke-[2.5]' : 'stroke-2'}`} />
                {active && (
                  <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-[var(--accent)]" />
                )}
              </div>
              <span className={`text-[10px] tracking-tight mt-0.5 leading-none truncate max-w-full ${active ? 'font-bold' : 'font-medium'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
