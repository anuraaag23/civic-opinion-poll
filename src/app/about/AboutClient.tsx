'use client';

import React from 'react';
import { useI18n } from '@/lib/i18n/context';
import { AboutCreatorSection } from '@/components/home/AboutCreatorSection';
import { VoterAssuranceCard } from '@/components/verification/VoterAssuranceCard';
import { DisclaimerBanner } from '@/components/layout/DisclaimerBanner';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import Link from 'next/link';
import { Globe, Building2, ArrowRight, Mail, MapPin } from 'lucide-react';

export function AboutClient() {
  const { language } = useI18n();

  return (
    <div className="space-y-8 sm:space-y-12 py-4 max-w-4xl mx-auto">
      <DisclaimerBanner />

      {/* Creator Story Narrative (Always Fully Expanded on About Page) */}
      <AboutCreatorSection alwaysExpanded />

      {/* Direct Contact Card with Clickable Email & Phone */}
      <GlassCard elevated className="p-6 sm:p-8 space-y-5 border-l-4 border-l-[var(--accent)]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)] shrink-0">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] tracking-tight">
              {language === 'hi' ? 'निर्माता से सीधे संपर्क करें' : 'Get in Direct Touch with the Creator'}
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
              {language === 'hi'
                ? 'नागरिक सुझाव, बग रिपोर्ट, या स्वतंत्र सहयोग के लिए सीधे अनुराग से संपर्क करें:'
                : 'For civic suggestions, bug reports, or independent collaboration, reach out to Anurag:'}
            </p>
          </div>
        </div>

        <div className="pt-1">
          {/* Clickable Official Email Box */}
          <a
            href="mailto:itsryperhere@gmail.com"
            className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-glass)] hover:border-[var(--accent)] transition-all flex items-center gap-3.5 group cursor-pointer active:scale-98 shadow-xs max-w-md mx-auto"
          >
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Mail className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider block">
                {language === 'hi' ? 'आधिकारिक नागरिक ईमेल' : 'Official Citizen Email'}
              </span>
              <span className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate block">
                itsryperhere@gmail.com
              </span>
            </div>
          </a>
        </div>

        <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)] pt-1 border-t border-[var(--border-glass)]">
          <MapPin className="w-3.5 h-3.5 text-[var(--error)] shrink-0" />
          <span>Uttar Pradesh, India • Zero Corporate or Political Influence</span>
        </div>
      </GlassCard>

      {/* Assurance Card */}
      <VoterAssuranceCard />

      {/* Dual Participation Links */}
      <div className="text-center space-y-3 pt-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent)] block">
          {language === 'hi' ? 'अपनी राय दर्ज करें' : 'Cast Your Anonymous Opinion'}
        </span>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/pm" className="w-full sm:w-auto">
            <GlassButton size="lg" className="w-full sm:w-auto gap-2 shadow-md font-bold">
              <Globe className="w-4 h-4" />
              <span>{language === 'hi' ? 'PM जनमत (संपूर्ण भारत)' : 'PM Poll (All India)'}</span>
              <ArrowRight className="w-4 h-4" />
            </GlassButton>
          </Link>
          <Link href="/cm" className="w-full sm:w-auto">
            <GlassButton variant="secondary" size="lg" className="w-full sm:w-auto gap-2 font-bold text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
              <Building2 className="w-4 h-4" />
              <span>{language === 'hi' ? 'CM जनमत (राज्यवार)' : 'CM Poll (State-wise)'}</span>
              <ArrowRight className="w-4 h-4" />
            </GlassButton>
          </Link>
        </div>
      </div>
    </div>
  );
}
