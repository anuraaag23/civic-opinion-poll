'use client';

import React from 'react';
import { useI18n } from '@/lib/i18n/context';
import { GlassCard } from '@/components/ui/GlassCard';
import { ShieldCheck, UserCheck, CheckSquare2, BarChart2 } from 'lucide-react';

export function HowItWorksSection() {
  const { t, language } = useI18n();

  const steps = [
    {
      number: '01',
      icon: ShieldCheck,
      title: t.howItWorks.step1Title,
      description: t.howItWorks.step1Desc,
      tag: language === 'hi' ? 'पात्रता सत्यापन' : 'Eligibility Check',
    },
    {
      number: '02',
      icon: UserCheck,
      title: t.howItWorks.step2Title,
      description: t.howItWorks.step2Desc,
      tag: language === 'hi' ? 'गोपनीयता सुरक्षा' : 'Identity Decoupled',
    },
    {
      number: '03',
      icon: CheckSquare2,
      title: t.howItWorks.step3Title,
      description: t.howItWorks.step3Desc,
      tag: language === 'hi' ? 'एकल प्रतिक्रिया' : 'Double-Vote Proof',
    },
    {
      number: '04',
      icon: BarChart2,
      title: t.howItWorks.step4Title,
      description: t.howItWorks.step4Desc,
      tag: language === 'hi' ? 'सार्वजनिक आंकड़े' : 'Aggregate Only',
    },
  ];

  return (
    <section id="how-it-works" className="py-16 sm:py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent)] px-3 py-1 rounded-full bg-[var(--accent-soft)]">
            {language === 'hi' ? 'सिद्धांत एवं कार्यप्रणाली' : 'Integrity & Architecture'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            {t.howItWorks.title}
          </h2>
          <p className="text-base text-[var(--text-secondary)] leading-relaxed">
            {t.howItWorks.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <GlassCard
                key={step.number}
                interactive
                className="flex flex-col justify-between relative group hover:border-[var(--accent)] transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-2xl font-black text-[var(--text-tertiary)] tracking-tight">
                      {step.number}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center transition-transform group-hover:scale-110">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    {step.description}
                  </p>
                </div>
                <div className="pt-6 mt-4 border-t border-[var(--border-glass)]">
                  <span className="text-xs font-semibold tracking-wide uppercase text-[var(--accent)]">
                    {step.tag}
                  </span>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
