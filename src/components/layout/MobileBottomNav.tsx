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
    <div
      aria-label="Mobile Navigation Dock Container"
      className="lg:hidden fixed bottom-[calc(0.75rem+env(safe-area-inset-bottom))] inset-x-0 mx-auto w-[calc(100%-1.25rem)] max-w-sm sm:max-w-md z-40 select-none pointer-events-none"
    >
      <nav
        aria-label="iOS 27 Dynamic Navigation Dock"
        className="pointer-events-auto relative w-full grid grid-cols-5 items-center gap-0.5 p-1 rounded-full backdrop-blur-2xl backdrop-saturate-[200%] border transition-all duration-300 shadow-[0_16px_36px_-4px_rgba(0,0,0,0.65),0_0_0_1px_rgba(0,0,0,0.4),inset_0_1px_1px_0_rgba(255,255,255,0.28),inset_0_-1px_1px_0_rgba(0,0,0,0.6)] bg-gradient-to-b from-[#161c26]/90 via-[#0e131d]/95 to-[#090c13]/98 border-white/[0.14] dark:border-white/[0.12]"
      >
        {navItems.map((item) => {
          const active = isItemActive(item);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`min-w-0 w-full relative flex flex-col items-center justify-center py-1.5 px-0.5 rounded-full transition-all duration-200 active:scale-92 cursor-pointer group ${
                active
                  ? 'bg-gradient-to-b from-blue-500/30 via-blue-600/18 to-blue-950/30 border border-blue-400/40 shadow-[inset_0_1px_1px_0_rgba(147,197,253,0.5),0_2px_12px_rgba(59,130,246,0.3)] text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              <div className="relative flex items-center justify-center w-6 h-6 transition-all">
                <Icon
                  className={`w-[18px] h-[18px] transition-all duration-200 ${
                    active
                      ? 'stroke-[2.4] text-blue-400 scale-110 drop-shadow-[0_0_8px_rgba(96,165,250,0.6)]'
                      : 'stroke-2 text-slate-400 group-hover:text-slate-200 group-hover:scale-105'
                  }`}
                />
              </div>
              <span
                className={`text-[9.5px] sm:text-[10px] tracking-tight mt-0.5 leading-none truncate max-w-full transition-all ${
                  active
                    ? 'font-bold text-blue-200 drop-shadow-[0_0_6px_rgba(59,130,246,0.4)]'
                    : 'font-medium text-slate-400 group-hover:text-slate-200'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
