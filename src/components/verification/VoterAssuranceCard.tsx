'use client';

import React from 'react';
import { useI18n } from '@/lib/i18n/context';
import { GlassCard } from '@/components/ui/GlassCard';
import { ShieldCheck, Lock, AlertTriangle, CheckCircle2 } from 'lucide-react';

export function VoterAssuranceCard() {
  const { language } = useI18n();

  return (
    <GlassCard elevated className="border-l-4 border-l-[var(--success)] space-y-4 bg-[var(--bg-glass-elevated)]">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[var(--success-soft)] text-[var(--success)] flex items-center justify-center shrink-0">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
            {language === 'hi'
              ? 'नागरिक गोपनीयता एवं मतदान अखंडता आश्वासन'
              : 'Our 100% Assurance to Every Single Participant'}
          </h3>
          <p className="text-xs text-[var(--text-secondary)]">
            {language === 'hi'
              ? 'स्वतंत्र, सुरक्षित और वास्तविक नागरिक जनमत के तीन अटूट नियम'
              : 'Three inviolable rules guaranteeing your privacy and election integrity'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
        {/* Assurance 1: We NEVER store your EPIC or ID */}
        <div className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--success)]">
            <Lock className="w-4 h-4 shrink-0" />
            <span>{language === 'hi' ? '1. कभी सेव नहीं होता' : '1. We NEVER Save Your ID'}</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            {language === 'hi'
              ? 'हम आपका EPIC नंबर या कोई भी पहचान प्रमाण पत्र कहीं भी सेव नहीं करते हैं। यह केवल मेमोरी में जाँचा जाता है और तुरंत नष्ट कर दिया जाता है। आपके वोट और पहचान में कोई संबंध नहीं होता।'
              : 'We NEVER store your EPIC number or any ID proof in any database. It is validated in memory and discarded in milliseconds. Your identity is 100% decoupled from your vote.'}
          </p>
        </div>

        {/* Assurance 2: Vote Once, Never Changes - Be Smart */}
        <div className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--accent)]">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{language === 'hi' ? '2. केवल 1 बार वोट, कभी नहीं बदलेगा' : '2. Vote Once, Never Changes'}</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            {language === 'hi'
              ? 'एक सर्वेक्षण में आप केवल एक ही बार अपनी राय दर्ज कर सकते हैं। सबमिट करने के बाद आपका मत कभी भी बदला या मिटाया नहीं जा सकता — इसलिए अपनी राय समझदारी से चुनें।'
              : 'You can only vote ONCE per poll. Once confirmed, your response is final and can NEVER be changed or re-cast — so choose thoughtfully and be smart with your opinion.'}
          </p>
        </div>

        {/* Assurance 3: 100% Real - No Fake EPIC */}
        <div className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--warning)]">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{language === 'hi' ? '3. 100% वास्तविक नागरिक' : '3. 100% Real Citizens'}</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            {language === 'hi'
              ? 'यह मंच असली नागरिकों की सच्ची आवाज है। कृपया किसी भी नकली, उत्पन्न या फर्जी पहचान पत्र का उपयोग न करें। हर असली नागरिक की एक आवाज, एक मत।'
              : 'This platform reflects real people. Do NOT use fake, fabricated, or duplicate EPIC numbers. We rely on genuine citizens to show authentic public opinion.'}
          </p>
        </div>
      </div>
    </GlassCard>
  );
}
