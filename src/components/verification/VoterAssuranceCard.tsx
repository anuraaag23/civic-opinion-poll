'use client';

import React from 'react';
import { useI18n } from '@/lib/i18n/context';
import { GlassCard } from '@/components/ui/GlassCard';
import { ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';

export function VoterAssuranceCard() {
  const { language } = useI18n();

  return (
    <GlassCard elevated className="border-l-4 border-l-[var(--accent)] space-y-4 bg-[var(--bg-glass-elevated)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[var(--border-glass)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center shrink-0 shadow-xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
              {language === 'hi'
                ? 'नागरिक गोपनीयता एवं सत्यापन अखंडता'
                : 'Participant Privacy & Verification Integrity'}
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              {language === 'hi'
                ? 'पारदर्शी सुरक्षा नियम जो आपकी राय को सुरक्षित रखते हैं और एक नागरिक-एक मत सुनिश्चित करते हैं'
                : 'Transparent safeguards protecting your voice and ensuring one response per verified citizen'}
            </p>
          </div>
        </div>
        <span className="text-xs font-bold text-[var(--accent)] px-2.5 py-1 rounded-full bg-[var(--accent-soft)] border border-[var(--accent)]/30 self-start sm:self-auto select-none">
          {language === 'hi' ? 'गोपनीयता सुरक्षा मानक' : 'Privacy Safeguards'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1 items-stretch">
        {/* Assurance 1: Keyed Cryptographic Hashing */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-glass)] space-y-2 flex flex-col justify-between shadow-xs">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[var(--accent)]">
              <Lock className="w-4 h-4 shrink-0" />
              <span>{language === 'hi' ? '1. एकतरफा क्रिप्टोग्राफिक हैशिंग' : '1. Keyed Cryptographic Hashing'}</span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              {language === 'hi'
                ? 'आपका मोबाइल नंबर केवल एकल-उपयोग ओटीपी भेजने के काम आता है। सत्यापन के तुरंत बाद इसे गुप्त कुंजी युक्त HMAC-SHA256 हैश में बदल दिया जाता है और आपके वोट से पूर्णतः अलग रखा जाता है।'
                : 'Your mobile number is solely used to deliver your single-use WhatsApp OTP. It is immediately converted to a server-keyed HMAC-SHA256 fingerprint and discarded from memory without linking to your response.'}
            </p>
          </div>
        </div>

        {/* Assurance 2: Single Response Policy */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-glass)] space-y-2 flex flex-col justify-between shadow-xs">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{language === 'hi' ? '2. एकल प्रतिक्रिया नीति' : '2. Single Response Policy'}</span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              {language === 'hi'
                ? 'प्रत्येक सत्यापित नागरिक को प्रति सर्वेक्षण केवल एक प्रतिक्रिया की अनुमति है। पुष्टि के बाद आपका मत समग्र गणना में दर्ज हो जाता है और पुनः बदला या मिटाया नहीं जा सकता।'
                : 'Each verified citizen is permitted one response per poll. Once confirmed, your response is recorded into the aggregate tally and cannot be overwritten, altered, or re-cast.'}
            </p>
          </div>
        </div>

        {/* Assurance 3: Direct WhatsApp OTP */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-glass)] space-y-2 flex flex-col justify-between shadow-xs">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{language === 'hi' ? '3. सीधा व्हाट्सएप ओटीपी' : '3. Direct WhatsApp OTP'}</span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              {language === 'hi'
                ? 'सत्यापन सीधे मानक व्हाट्सएप संदेश द्वारा होता है। किसी बाहरी ऐप या ट्रैकिंग कुकीज़ की आवश्यकता नहीं है, और आपके विवरण कभी किसी तीसरे पक्ष को साझा नहीं किए जाते।'
                : 'Verification runs directly via standard WhatsApp OTP without external apps, tracking cookies, or advertising scripts. Contact details are never used for marketing or sold.'}
            </p>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
