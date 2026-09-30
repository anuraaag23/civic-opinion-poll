'use client';

import React from 'react';
import { useI18n } from '@/lib/i18n/context';
import { GlassCard } from '@/components/ui/GlassCard';
import { ShieldCheck, Lock, AlertTriangle, CheckCircle2 } from 'lucide-react';

export function VoterAssuranceCard() {
  const { language } = useI18n();

  return (
    <GlassCard elevated className="border-l-4 border-l-[var(--success)] space-y-4 bg-[var(--bg-glass-elevated)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[var(--border-glass)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--success-soft)] text-[var(--success)] flex items-center justify-center shrink-0 shadow-xs">
            <ShieldCheck className="w-5 h-5" />
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
        <span className="text-[11px] font-bold text-[var(--success)] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[var(--success-soft)] self-start sm:self-auto">
          {language === 'hi' ? '100% सत्यापित गोपनीयता' : '100% Privacy Assured'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
        {/* Assurance 1: We NEVER ask for your EPIC or ID */}
        <div className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--success)]">
            <Lock className="w-4 h-4 shrink-0" />
            <span>{language === 'hi' ? '1. कभी ID नहीं मांगते' : '1. We NEVER Collect Your ID'}</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            {language === 'hi'
              ? 'हम आपसे इस मंच पर अपना EPIC नंबर या कोई भी पहचान पत्र जमा करने के लिए कभी नहीं कहते। मतदाता पंजीकरण की जांच सीधे आपके द्वारा आधिकारिक ECI वेबसाइट पर की जाती है। आपकी पहचान आपके पास सुरक्षित रहती है।'
              : 'We NEVER ask you to submit your EPIC number or any ID proof on this platform. Electoral registration checks are performed directly by you on the official ECI portal. Your identity stays private.'}
          </p>
        </div>

        {/* Assurance 2: Vote Once, Never Changes - Be Smart */}
        <div className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--accent)]">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{language === 'hi' ? '2. केवल 1 बार मत, कभी नहीं बदलेगा' : '2. Vote Once, Never Changes'}</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            {language === 'hi'
              ? 'एक सर्वेक्षण में आप केवल एक ही बार अपनी राय दर्ज कर सकते हैं। सबमिट करने के बाद आपका मत कभी भी बदला या मिटाया नहीं जा सकता — इसलिए अपनी राय समझदारी से चुनें।'
              : 'You can only vote ONCE per poll. Once confirmed, your response is final and can NEVER be changed or re-cast — so choose thoughtfully and be smart with your opinion.'}
          </p>
        </div>

        {/* Assurance 3: 100% Real - Honest Self-Verification */}
        <div className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--warning)]">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{language === 'hi' ? '3. 100% ईमानदार स्व-सत्यापन' : '3. 100% Honest Self-Verification'}</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            {language === 'hi'
              ? 'यह मंच असली नागरिकों की सच्ची आवाज है। आधिकारिक ECI पोर्टल पर सीधे जांच पूरी करें और ईमानदारी से पुष्टि करें। एक असली नागरिक, एक स्वतंत्र निष्पक्ष राय।'
              : 'This platform reflects real people. Complete the electoral check on the official ECI portal and confirm honestly. One genuine citizen, one voice, one opinion.'}
          </p>
        </div>
      </div>
    </GlassCard>
  );
}
