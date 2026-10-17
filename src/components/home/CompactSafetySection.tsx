'use client';

import React from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n/context';
import { ShieldCheck, Lock, CheckCircle2, ArrowRight } from 'lucide-react';

export function CompactSafetySection() {
  const { language } = useI18n();

  return (
    <section className="py-2">
      <div className="p-5 sm:p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-glass)] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-glass)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                {language === 'hi'
                  ? 'नागरिक सुरक्षा एवं 100% गोपनीयता गारंटी'
                  : '100% Privacy & Safety Assured'}
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                {language === 'hi'
                  ? 'शून्य डेटा भंडारण और सुरक्षित स्वतंत्र मतदान के तीन बुनियादी नियम'
                  : 'Three simple commitments protecting every participant with zero data storage'}
              </p>
            </div>
          </div>

          <Link
            href="/safety"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--accent)] hover:underline shrink-0"
          >
            <span>{language === 'hi' ? 'पूर्ण सुरक्षा वास्तुकला पढ़ें' : 'View Full Safety Architecture'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 3 Simple, Short & Easy Points */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[var(--bg-primary)]/50 border border-[var(--border-glass)]">
            <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-[var(--text-primary)] block">
                {language === 'hi' ? '1. शून्य पहचान भंडारण' : '1. Zero ID Storage'}
              </span>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {language === 'hi'
                  ? 'हम कभी भी आपका EPIC नंबर, आईडी या व्यक्तिगत विवरण नहीं मांगते और न ही सहेजते हैं।'
                  : 'We never request, collect, or store your EPIC number, ID, or personal identity.'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[var(--bg-primary)]/50 border border-[var(--border-glass)]">
            <CheckCircle2 className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-[var(--text-primary)] block">
                {language === 'hi' ? '2. केवल 1 बार मत' : '2. One Citizen, One Vote'}
              </span>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {language === 'hi'
                  ? 'एक सर्वेक्षण में केवल एक बार मत दर्ज हो सकता है। सबमिट के बाद इसे बदला नहीं जा सकता।'
                  : 'Each citizen can vote once per poll. Responses are final and permanently locked.'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[var(--bg-primary)]/50 border border-[var(--border-glass)]">
            <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-[var(--text-primary)] block">
                {language === 'hi' ? '3. रीयल मॉनिटर सत्यापन' : '3. Real Monitored Verification'}
              </span>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {language === 'hi'
                  ? 'ECI पोर्टल पर सत्यापन की पुष्टि रीयल-टाइम में जांची जाती है, बिना कोई डेटा रिकॉर्ड किए।'
                  : 'ECI voter verification status is strictly monitored in real time with 0 bytes recorded.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
