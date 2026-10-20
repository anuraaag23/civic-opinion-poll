'use client';

import React from 'react';
import { useI18n } from '@/lib/i18n/context';
import { DisclaimerBanner } from '@/components/layout/DisclaimerBanner';
import { GlassCard } from '@/components/ui/GlassCard';
import { Lock, AlertTriangle, Database, Trash2, Mail } from 'lucide-react';

export function PrivacyClient() {
  const { t, language } = useI18n();

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-4">
      {/* Header */}
      <div className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--success)] px-3 py-1 rounded-full bg-[var(--success-soft)]">
          {language === 'hi' ? 'गोपनीयता नीति एवं वास्तुकला' : 'Privacy Architecture & Guarantees'}
        </span>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--text-primary)]">
          {t.privacy.title}
        </h1>
        <p className="text-base text-[var(--text-secondary)] leading-relaxed">
          {t.privacy.subtitle}
        </p>
      </div>

      <DisclaimerBanner />

      {/* Core Architectural Pillars */}
      <div className="space-y-8">
        {/* Section: What We Do Not Collect */}
        <GlassCard elevated className="border-l-4 border-l-emerald-500 space-y-4 bg-[var(--bg-glass-elevated)]">
          <div className="flex items-center gap-3 text-lg font-bold text-[var(--text-primary)]">
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <Lock className="w-5 h-5" />
            </div>
            <h2>
              {language === 'hi' ? 'हम क्या एकत्र नहीं करते (Zero PII Guarantee)' : 'What We Do Not Collect (Zero PII Guarantee)'}
            </h2>
          </div>
          <p className="text-sm text-[var(--text-primary)] font-semibold leading-relaxed">
            {language === 'hi'
              ? 'हम आपका मोबाइल नंबर, नाम, या व्यक्तिगत पहचान कभी भी वोटिंग डेटाबेस में संग्रहीत नहीं करते हैं।'
              : 'We never store your raw mobile number, voter name, or personal identity alongside your vote.'}
          </p>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            {language === 'hi'
              ? 'व्हाट्सएप पर ओटीपी सत्यापन पूर्ण होते ही आपके नंबर को अपरिवर्तनीय एकतरफा क्रिप्टोग्राफिक हैश (HMAC-SHA256) में बदल दिया जाता है, जिससे कोई भी यह नहीं जान सकता कि किस नंबर ने किस दल को मत दिया।'
              : 'Upon OTP verification via WhatsApp, your phone number is instantly converted into an irreversible one-way cryptographic hash (HMAC-SHA256), strictly isolating identity from voting choices.'}
          </p>
          <p className="text-xs text-[var(--text-tertiary)] leading-relaxed">
            {language === 'hi'
              ? 'हमने व्यक्तिगत जानकारी के संग्रह को शून्य करने के लिए इस प्रणाली को पूर्णतः अनाम डिज़ाइन किया है।'
              : 'The platform is architected to guarantee zero linkage between voter identity and confidential ballots.'}
          </p>
        </GlassCard>

        {/* 1. Identity Separation Guarantee */}
        <GlassCard elevated className="space-y-4">
          <div className="flex items-center gap-3 text-lg font-bold text-[var(--text-primary)]">
            <div className="p-2 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
              <Lock className="w-5 h-5" />
            </div>
            <h2>{t.privacy.architectureTitle}</h2>
          </div>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            {t.privacy.architectureDesc}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
            <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)]">
              <span className="font-bold text-[var(--error)] block mb-1">
                ✕ {language === 'hi' ? 'कभी संग्रहीत नहीं किया जाता' : 'Never Stored'}
              </span>
              <ul className="text-[var(--text-tertiary)] space-y-1 list-disc list-inside">
                <li>Voter Name or Father&apos;s Name</li>
                <li>Residential Address / Polling Booth</li>
                <li>Date of Birth or Gender</li>
                <li>Raw EPIC number in the voting database</li>
                <li>Any link between identity and chosen party</li>
              </ul>
            </div>
            <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)]">
              <span className="font-bold text-[var(--success)] block mb-1">
                ✓ {language === 'hi' ? 'केवल न्यूनतम अवयव' : 'Retained with Minimization'}
              </span>
              <ul className="text-[var(--text-tertiary)] space-y-1 list-disc list-inside">
                <li>Server-keyed HMAC participation fingerprint</li>
                <li>Ephemeral anonymous token hash (expires in 15m)</li>
                <li>Aggregate vote counters per party</li>
                <li>Sanitized security audit counters</li>
              </ul>
            </div>
          </div>
        </GlassCard>

        {/* 2. Keyed Participation Fingerprints */}
        <GlassCard className="space-y-4">
          <div className="flex items-center gap-3 text-lg font-bold text-[var(--text-primary)]">
            <div className="p-2 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
              <Database className="w-5 h-5" />
            </div>
            <h2>{t.privacy.fingerprintTitle}</h2>
          </div>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            {t.privacy.fingerprintDesc}
          </p>
        </GlassCard>

        {/* 3. Responsible Privacy */}
        <GlassCard className="border-l-4 border-l-[var(--warning)] space-y-4 bg-[var(--bg-glass-elevated)]">
          <div className="flex items-center gap-3 text-lg font-bold text-[var(--warning)]">
            <AlertTriangle className="w-5 h-5" />
            <h2>
              {language === 'hi'
                ? 'महत्वपूर्ण: हैश को निरपेक्ष रूप से गुमनाम नहीं माना जाता'
                : 'Responsible Privacy: We Do Not Claim Hash Equals Anonymity'}
            </h2>
          </div>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            {t.privacy.noClaimAbsolute}
          </p>
          <p className="text-xs text-[var(--text-tertiary)] leading-relaxed">
            Cryptographic fingerprints can still be subject to correlation under sophisticated threat models if secrets are compromised. Therefore, our security defense is layered: strict access controls, short token lifecycles, absence of identity-vote tables, and scheduled cryptographic purge routines.
          </p>
        </GlassCard>

        {/* 4. Data Retention Policy */}
        <GlassCard className="space-y-4">
          <div className="flex items-center gap-3 text-lg font-bold text-[var(--text-primary)]">
            <div className="p-2 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
              <Trash2 className="w-5 h-5" />
            </div>
            <h2>{t.privacy.retentionTitle}</h2>
          </div>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            {t.privacy.retentionDesc}
          </p>
          <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] text-xs text-[var(--text-secondary)] space-y-2">
            <div className="flex justify-between items-center py-1 border-b border-[var(--border-glass)]">
              <span className="font-semibold text-[var(--text-primary)]">Active Poll:</span>
              <span>Retains participation fingerprints to prevent ballot stuffing</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-[var(--border-glass)]">
              <span className="font-semibold text-[var(--text-primary)]">Post Poll Closure:</span>
              <span>Fingerprints scheduled for permanent deletion</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="font-semibold text-[var(--text-primary)]">Aggregate Results:</span>
              <span>Retained indefinitely as public historical civic data</span>
            </div>
          </div>
        </GlassCard>

        {/* Privacy Inquiries Contact */}
        <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-[var(--text-secondary)]">
            Questions regarding cryptographic privacy or architecture?
          </span>
          <div className="flex items-center gap-3">
            <a href="mailto:contact@meravote.in" className="inline-flex items-center gap-1.5 font-bold text-[var(--accent)] hover:underline" title="Email contact@meravote.in">
              <Mail className="w-3.5 h-3.5" />
              <span>contact@meravote.in</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
