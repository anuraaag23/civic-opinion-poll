'use client';

import React from 'react';
import Image from 'next/image';
import { useI18n } from '@/lib/i18n/context';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeSwitcher } from './ThemeSwitcher';
import { SiteSettings } from '@/lib/types';
import {
  Wrench,
  ShieldCheck,
  RefreshCw,
  Mail,
  Lock,
  Clock,
  Sparkles,
} from 'lucide-react';

interface MaintenanceScreenProps {
  status: SiteSettings;
  onRefresh?: () => void;
  isChecking?: boolean;
}

export function MaintenanceScreen({
  status,
  onRefresh,
  isChecking = false,
}: MaintenanceScreenProps) {
  const { language } = useI18n();

  const title =
    language === 'hi' && status.maintenanceTitleHi
      ? status.maintenanceTitleHi
      : status.maintenanceTitleEn || 'Platform Under Scheduled Maintenance';

  const message =
    language === 'hi' && status.maintenanceMessageHi
      ? status.maintenanceMessageHi
      : status.maintenanceMessageEn ||
        'We are currently performing scheduled security and infrastructure enhancements. All voting records are cryptographically secured. The platform will be restored momentarily.';

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col justify-between p-4 sm:p-6 lg:p-8 bg-[var(--bg-primary)] relative overflow-hidden">
      {/* Ambient background blur circles */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-[var(--accent)]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar with Logo and Switchers */}
      <header className="w-full max-w-4xl mx-auto flex items-center justify-between gap-4 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/90 dark:bg-white/10 border border-[var(--border-glass)] p-1 flex items-center justify-center shadow-xs shrink-0">
            <Image
              src="/meravote-logo.png"
              alt="Mera Vote Logo"
              width={38}
              height={38}
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <span className="text-base sm:text-lg font-black text-[var(--text-primary)] block leading-tight">
              {language === 'hi' ? 'मेरा वोट' : 'Mera Vote'}
            </span>
            <span className="text-[11px] text-[var(--text-secondary)] font-medium">
              {language === 'hi' ? 'स्वतंत्र जनमत सर्वेक्षण' : 'Independent Civic Polls'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeSwitcher />
        </div>
      </header>

      {/* Main Center Maintenance Card */}
      <main className="w-full max-w-2xl mx-auto my-auto py-8 sm:py-12 z-10">
        <GlassCard
          elevated
          className="p-6 sm:p-10 space-y-6 text-center border-t-4 border-t-amber-500 shadow-xl"
        >
          {/* Animated Status Icon */}
          <div className="relative mx-auto w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
            <div className="absolute inset-0 rounded-3xl bg-amber-500/15 animate-ping opacity-35" />
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-amber-500/15 border-2 border-amber-500/35 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-md">
              <Wrench className="w-8 h-8 sm:w-10 sm:h-10 animate-bounce duration-1000" />
            </div>
          </div>

          {/* Live System Notice Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs font-bold tracking-wider uppercase">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>
              {language === 'hi'
                ? 'सिस्टम रखरखाव मोड सक्रिय है'
                : 'System Maintenance Mode Active'}
            </span>
          </div>

          {/* Dynamic Maintenance Title */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
              {title}
            </h1>
            {/* Custom Admin Announcement Message */}
            <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed max-w-xl mx-auto whitespace-pre-line font-normal">
              {message}
            </p>
          </div>

          {/* Realtime Live Check & Reconnect */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <GlassButton
              variant="primary"
              size="md"
              onClick={onRefresh}
              disabled={isChecking}
              className="w-full sm:w-auto gap-2 font-bold px-6 shadow-md"
            >
              <RefreshCw
                className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`}
              />
              <span>
                {language === 'hi'
                  ? 'लाइव स्थिति की पुनः जांच करें'
                  : 'Check Live Status'}
              </span>
            </GlassButton>

            <a
              href="mailto:itsryperhere@gmail.com"
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--accent-soft)] border border-[var(--border-glass)] text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--accent)] transition-all flex items-center justify-center gap-2 min-h-[42px]"
              title="Contact Administrator"
            >
              <Mail className="w-4 h-4 text-[var(--accent)]" />
              <span>itsryperhere@gmail.com</span>
            </a>
          </div>

          {/* Security & Integrity Reassurance */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-[var(--border-glass)] text-left text-xs">
            <div className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-[var(--text-primary)] block">
                  {language === 'hi' ? '100% डेटा सुरक्षित' : 'Zero Data Compromised'}
                </strong>
                <span className="text-[var(--text-tertiary)] leading-tight block mt-0.5">
                  {language === 'hi'
                    ? 'सभी दर्ज वोट, क्रिप्टोग्राफिक हैश और ऑडिट लॉग सुरक्षित हैं।'
                    : 'All cast responses and cryptographic tallies remain intact.'}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[var(--text-primary)] block">
                  {language === 'hi' ? 'स्वतः पुनः प्रारंभ' : 'Automatic Resumption'}
                </strong>
                <span className="text-[var(--text-tertiary)] leading-tight block mt-0.5">
                  {language === 'hi'
                    ? 'रखरखाव पूरा होते ही वेबसाइट स्वतः सामान्य रूप से खुल जाएगी।'
                    : 'The page will automatically resume once maintenance ends.'}
                </span>
              </div>
            </div>
          </div>
        </GlassCard>
      </main>

      {/* Footer info */}
      <footer className="w-full max-w-4xl mx-auto text-center text-xs text-[var(--text-tertiary)] py-2 z-10">
        <span>© 2026 Mera Vote • Independent Civic Opinion Polling</span>
      </footer>
    </div>
  );
}
