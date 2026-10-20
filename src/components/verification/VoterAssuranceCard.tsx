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
            <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
              {language === 'hi'
                ? 'नागरिक गोपनीयता एवं मतदान अखंडता आश्वासन'
                : 'Our 100% Assurance to Every Single Participant'}
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              {language === 'hi'
                ? 'स्वतंत्र, सुरक्षित और वास्तविक नागरिक जनमत के तीन अटूट नियम'
                : 'Three inviolable rules guaranteeing your privacy and election integrity'}
            </p>
          </div>
        </div>
        <span className="text-xs font-bold text-[var(--success)] px-2.5 py-1 rounded-full bg-[var(--success-soft)] self-start sm:self-auto select-none">
          {language === 'hi' ? '100% सत्यापित गोपनीयता' : '100% Privacy Assured'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1 items-stretch">
        {/* Assurance 1: We NEVER store your phone number */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-glass)] space-y-2 flex flex-col justify-between shadow-xs">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-500">
              <Lock className="w-4 h-4 shrink-0" />
              <span>{language === 'hi' ? '1. नंबर कभी सहेजा नहीं जाता' : '1. Zero Phone Numbers Stored'}</span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              {language === 'hi'
                ? 'आपका मोबाइल नंबर केवल व्हाट्सएप पर एकल-उपयोग ओटीपी भेजने के लिए काम आता है। सत्यापन के तुरंत बाद इसे एकतरफा हैश में बदल दिया जाता है। आपकी पहचान पूर्णतः निजी है।'
                : 'Your mobile number is solely used to send your single-use WhatsApp OTP. It is immediately hashed cryptographically and never stored alongside your vote.'}
            </p>
          </div>
        </div>

        {/* Assurance 2: Vote Once, Never Changes */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-glass)] space-y-2 flex flex-col justify-between shadow-xs">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[var(--accent)]">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{language === 'hi' ? '2. केवल 1 बार मत, कभी नहीं बदलेगा' : '2. Vote Once, Never Changes'}</span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              {language === 'hi'
                ? 'एक सर्वेक्षण में प्रति व्हाट्सएप नंबर केवल एक ही बार मत दर्ज किया जा सकता है। सबमिट करने के बाद आपका मत कभी भी बदला या मिटाया नहीं जा सकता।'
                : 'Only ONE vote is permitted per verified WhatsApp number. Once confirmed, your response is final and can NEVER be changed or re-cast.'}
            </p>
          </div>
        </div>

        {/* Assurance 3: 100% Free Forever */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-glass)] space-y-2 flex flex-col justify-between shadow-xs">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{language === 'hi' ? '3. 100% निःशुल्क एवं सुरक्षित' : '3. 100% Free WhatsApp OTP'}</span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              {language === 'hi'
                ? 'व्हाट्सएप ओटीपी सेवा सभी नागरिकों के लिए पूरी तरह से निःशुल्क है। बॉट और फर्जी खातों से मुक्त, असली भारतीय नागरिकों की सच्ची राय।'
                : 'WhatsApp OTP delivery is completely free forever. Protected against automated bots, sybil attacks, and fake entries.'}
            </p>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
