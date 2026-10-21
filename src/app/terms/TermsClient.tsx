'use client';

import React from 'react';
import { useI18n } from '@/lib/i18n/context';
import { DisclaimerBanner } from '@/components/layout/DisclaimerBanner';
import { GlassCard } from '@/components/ui/GlassCard';
import { Scale, ShieldAlert, Accessibility, CheckCircle2, Mail } from 'lucide-react';

export function TermsClient() {
  const { t, language } = useI18n();

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-4">
      {/* Header */}
      <div className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent)] px-3 py-1 rounded-full bg-[var(--accent-soft)]">
          {language === 'hi' ? 'शर्तें एवं कार्यप्रणाली' : 'Governance & Standards'}
        </span>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--text-primary)]">
          {language === 'hi' ? 'पद्धति, नियम एवं कानूनी सीमाएं' : 'Methodology, Terms & Accessibility'}
        </h1>
        <p className="text-base text-[var(--text-secondary)] leading-relaxed">
          {language === 'hi'
            ? 'इस नागरिक मंच के संचालन सिद्धांत, व्याख्या की सीमाएं और निष्पक्षता दिशानिर्देश।'
            : 'Operating principles, sample interpretation boundaries, and accessibility commitments.'}
        </p>
      </div>

      <DisclaimerBanner />

      <div className="space-y-8">
        {/* 1. Legal Boundaries & Non-Affiliation */}
        <GlassCard elevated className="space-y-4">
          <div className="flex items-center gap-3 text-lg font-bold text-[var(--text-primary)]">
            <div className="p-2 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
              <Scale className="w-5 h-5" />
            </div>
            <h2>{language === 'hi' ? 'कानूनी सीमाएं और गैर-संबद्धता' : 'Legal Boundaries & Non-Affiliation'}</h2>
          </div>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            {language === 'hi'
              ? 'मेरा वोट (Mera Vote) एक स्वतंत्र नागरिक अनुसंधान और जनमत सर्वेक्षण मंच है। यह भारत निर्वाचन आयोग (ECI) या भारत सरकार के किसी भी विभाग से संबद्ध, संचालित या समर्थित नहीं है।'
              : 'Mera Vote ("मेरा वोट") is an independent civic research and public opinion platform. It is not affiliated with, operated by, or commissioned by the Election Commission of India (ECI) or any department of the Government of India.'}
          </p>
          <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] text-xs text-[var(--text-secondary)] space-y-2">
            <p className="font-semibold text-[var(--text-primary)]">
              Crucial Terms:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Participation in these polls does NOT constitute an official election vote.</li>
              <li>Responses recorded do not alter or affect official Indian electoral rolls or outcomes.</li>
              <li>Users must not attempt automated scraping, DDoS attacks, or reverse-engineering.</li>
              <li>False or deceptive impersonation of governmental electoral procedures is strictly prohibited.</li>
            </ul>
          </div>
        </GlassCard>

        {/* WhatsApp OTP Verification Principles */}
        <section id="self-verification">
          <GlassCard className="space-y-4 border-l-4 border-l-emerald-500 bg-[var(--bg-glass-elevated)]">
            <div className="flex items-center gap-3 text-lg font-bold text-[var(--text-primary)]">
              <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h2>
                {language === 'hi'
                  ? 'व्हाट्सएप ओटीपी सत्यापन कार्यप्रणाली एवं सुरक्षा मानक'
                  : 'WhatsApp OTP Verification & Sybil-Proof Safeguards'}
              </h2>
            </div>
            <p className="text-sm text-[var(--text-primary)] font-semibold leading-relaxed">
              {language === 'hi'
                ? 'प्रत्येक नागरिक का सत्यापन उनके सक्रिय भारतीय व्हाट्सएप नंबर पर 6-अंकों के निःशुल्क ओटीपी द्वारा किया जाता है।'
                : 'Each participant is authenticated via a free, single-use 6-digit OTP delivered directly to their WhatsApp.'}
            </p>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              {language === 'hi'
                ? 'निष्पक्षता सुनिश्चित करने हेतु प्रति व्हाट्सएप नंबर केवल एक मत की अनुमति है (1 WhatsApp Number = 1 Vote)। आपका मोबाइल नंबर कभी भी वोटिंग डेटाबेस में संग्रहीत नहीं होता; मतपत्र से असंबंधित रखने के लिए एकतरफा गणितीय HMAC-SHA256 हैश का उपयोग किया जाता है।'
                : 'To ensure integrity and prevent duplicate voting, only one vote is permitted per verified WhatsApp mobile number. Phone numbers are never stored alongside cast ballots; the system utilizes an irreversible, keyed HMAC-SHA256 cryptographic fingerprint solely for deduplication.'}
            </p>
          </GlassCard>
        </section>

        {/* 2. Results Methodology (Requirement 53 & 54) */}
        <section id="methodology">
          <GlassCard className="space-y-4 border-l-4 border-l-[var(--warning)] bg-[var(--bg-glass-elevated)]">
            <div className="flex items-center gap-3 text-lg font-bold text-[var(--warning)]">
              <ShieldAlert className="w-5 h-5" />
              <h2>{language === 'hi' ? 'सर्वेक्षण कार्यप्रणाली एवं व्याख्या की सीमाएं' : 'Methodology & Sample Representation'}</h2>
            </div>
            <p className="text-sm text-[var(--text-primary)] font-medium leading-relaxed">
              {t.results.methodologyDisclaimer}
            </p>
            <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] text-xs text-[var(--text-secondary)] space-y-2">
              <span className="font-bold text-[var(--text-primary)] block">Interpretation Guidelines:</span>
              <p>
                Poll findings should always be stated as: <em>&quot;Among 128,420 verified participants in this independent opinion poll...&quot;</em>
              </p>
              <p className="text-[var(--error)] font-medium">
                ✕ Findings must NEVER be reported as: <em>&quot;India has decided...&quot;</em> or <em>&quot;The nation has voted for...&quot;</em>
              </p>
            </div>
          </GlassCard>
        </section>

        {/* 3. Accessibility Standards (WCAG 2.2 AA) */}
        <section id="accessibility">
          <GlassCard className="space-y-4">
            <div className="flex items-center gap-3 text-lg font-bold text-[var(--text-primary)]">
              <div className="p-2 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
                <Accessibility className="w-5 h-5" />
              </div>
              <h2>{language === 'hi' ? 'सुगमता (Accessibility - WCAG 2.2 AA)' : 'Accessibility Commitment (WCAG 2.2 AA)'}</h2>
            </div>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Civic technology must be accessible to every citizen regardless of physical ability, device, or visual impairment.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[var(--success)] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[var(--text-primary)] block">Reduced Motion</strong>
                  <span className="text-[var(--text-tertiary)]">Strictly respects prefers-reduced-motion media query by disabling parallax and bounce.</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[var(--success)] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[var(--text-primary)] block">High Contrast & Visual Depth</strong>
                  <span className="text-[var(--text-tertiary)]">WCAG 2.2 AA compliant contrast ratios in both light and dark modes.</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[var(--success)] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[var(--text-primary)] block">Keyboard Navigation</strong>
                  <span className="text-[var(--text-tertiary)]">Complete focus indicators and Enter/Space support across all voting choices.</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[var(--success)] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[var(--text-primary)] block">Screen Reader Semantics</strong>
                  <span className="text-[var(--text-tertiary)]">ARIA radio groups, descriptive alt text for party symbols in both English and Hindi.</span>
                </div>
              </div>
            </div>
          </GlassCard>
        </section>

        {/* Legal Inquiries Contact Box */}
        <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-[var(--text-secondary)]">
            Legal inquiries, methodology reviews, or compliance:
          </span>
          <div className="flex items-center gap-3">
            <a href="mailto:itsryperhere@gmail.com" className="inline-flex items-center gap-1.5 font-bold text-[var(--accent)] hover:underline" title="Email itsryperhere@gmail.com">
              <Mail className="w-3.5 h-3.5" />
              <span>itsryperhere@gmail.com</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
