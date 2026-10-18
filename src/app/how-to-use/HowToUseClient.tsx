'use client';

import React from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n/context';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassBadge } from '@/components/ui/GlassBadge';
import { GlassButton } from '@/components/ui/GlassButton';
import {
  Globe,
  Building2,
  BarChart3,
  ExternalLink,
  HelpCircle,
} from 'lucide-react';
import { ECI_ELECTORAL_SEARCH_URL } from '@/lib/types';

export function HowToUseClient() {
  const { language } = useI18n();

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-4">
      {/* Page Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2">
          <GlassBadge variant="accent">
            <HelpCircle className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>{language === 'hi' ? 'उपयोगकर्ता मार्गदर्शिका' : 'User Guide & Walkthrough'}</span>
          </GlassBadge>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--text-primary)]">
          {language === 'hi'
            ? 'मेरा वोट का उपयोग कैसे करें — चरण-दर-चरण गाइड'
            : 'How to Use Mera Vote — Step-by-Step Guide'}
        </h1>
        <p className="text-base text-[var(--text-secondary)] leading-relaxed max-w-2xl">
          {language === 'hi'
            ? 'केवल 4 आसान और पारदर्शी चरणों में स्वतंत्र नागरिक जनमत में भाग लें। 100% सुरक्षित, कोई डेटा रिकॉर्ड नहीं।'
            : 'Participate in independent civic opinion polls in 4 clear, transparent steps with 100% privacy and zero personal data stored.'}
        </p>
      </div>

      {/* 4 Point-Wise Organized Steps */}
      <div className="space-y-6">
        {/* Step 1 */}
        <GlassCard className="p-5 sm:p-7 space-y-3">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-[var(--accent)] text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
              01
            </span>
            <div>
              <span className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider block">
                {language === 'hi' ? 'चरण 1 • सर्वेक्षण चुनें' : 'Step 1 • Select Your Poll'}
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">
                {language === 'hi'
                  ? 'अपना मतदान वर्ग चुनें (PM राष्ट्रीय अथवा CM राज्य विधानसभा)'
                  : 'Choose Your Poll Category (PM National or CM State Assembly)'}
              </h2>
            </div>
          </div>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed pl-12">
            {language === 'hi'
              ? 'होमपेज अथवा "सर्वेक्षण" टैब से अपनी पसंद का क्षेत्र चुनें: प्रधानमंत्री (PM) वर्ग संपूर्ण भारत के राष्ट्रीय दलों को दिखाता है, जबकि मुख्यमंत्री (CM) वर्ग में आप अपना राज्य चुनकर उस राज्य के विधानसभा दलों को देख सकते हैं।'
              : 'From the homepage or Polls tab, pick your sphere: Prime Minister (PM) covers all-India national parties for Lok Sabha, while Chief Minister (CM) allows you to select any Indian state to view official contesting state assembly parties.'}
          </p>
          <div className="pl-12 pt-1 flex flex-wrap gap-2.5">
            <Link href="/pm">
              <GlassButton variant="primary" size="sm" className="gap-1.5 font-bold">
                <Globe className="w-3.5 h-3.5 text-white" />
                <span>{language === 'hi' ? 'PM जनमत देखें' : 'Go to PM Poll'}</span>
              </GlassButton>
            </Link>
            <Link href="/cm">
              <GlassButton variant="secondary" size="sm" className="gap-1.5 font-bold">
                <Building2 className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'CM जनमत देखें' : 'Go to CM Poll'}</span>
              </GlassButton>
            </Link>
          </div>
        </GlassCard>

        {/* Step 2 */}
        <GlassCard className="p-5 sm:p-7 space-y-3">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-[var(--accent)] text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
              02
            </span>
            <div>
              <span className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider block">
                {language === 'hi' ? 'चरण 2 • रीयल सत्यापन जांच' : 'Step 2 • Real Verifier Check via ECI'}
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">
                {language === 'hi'
                  ? 'ECI पोर्टल पर मतदाता स्थिति की पुष्टि (शून्य डेटा रिकॉर्डिंग)'
                  : 'Verify Voter Status on Official ECI Portal (Zero Data Recorded)'}
              </h2>
            </div>
          </div>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed pl-12">
            {language === 'hi'
              ? 'बॉट हेरफेर रोकने के लिए, सत्यापन सीधे भारत निर्वाचन आयोग की आधिकारिक वेबसाइट पर किया जाता है। हमारा "रीयल सत्यापन मॉनिटर" केवल यह जांचता है कि सत्यापन सफल हुआ या विफल, परंतु आपका EPIC नंबर या कोई भी व्यक्तिगत डेटा कभी सहेजता नहीं है।'
              : 'To prevent bots and duplicate votes, verification is conducted directly on the official Election Commission of India portal. Our Real Verifier monitors the verification status (success or failure) in real time without recording your EPIC number, name, or identity.'}
          </p>
          <div className="pl-12 pt-1">
            <a
              href={ECI_ELECTORAL_SEARCH_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--accent)] hover:underline"
            >
              <span>{language === 'hi' ? 'आधिकारिक ECI मतदाता खोज पोर्टल खोलें' : 'Open Official ECI Electoral Search Portal'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </GlassCard>

        {/* Step 3 */}
        <GlassCard className="p-5 sm:p-7 space-y-3">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-[var(--accent)] text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
              03
            </span>
            <div>
              <span className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider block">
                {language === 'hi' ? 'चरण 3 • सुरक्षित गुमनाम मतदान' : 'Step 3 • Cast Your Anonymous Vote'}
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">
                {language === 'hi'
                  ? 'अपने पसंदीदा दल या प्रत्याशी का चयन करें (एक नागरिक, केवल एक मत)'
                  : 'Select Your Choice (One Citizen, One Permanent Vote)'}
              </h2>
            </div>
          </div>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed pl-12">
            {language === 'hi'
              ? 'सत्यापन के बाद आपको एक 256-बिट अस्थायी गुमनाम पास मिलता है। सूची में से अपने पसंदीदा दल के चुनाव चिह्न पर क्लिक करें और अपने मत की पुष्टि करें। एक बार मत डालने के बाद इसे कभी बदला या मिटाया नहीं जा सकता।'
              : 'Upon successful verification, you receive an ephemeral 256-bit anonymous pass. Select your preferred party card featuring their official symbol and confirm. Once submitted, your vote is sealed and cannot be changed or recast.'}
          </p>
        </GlassCard>

        {/* Step 4 */}
        <GlassCard className="p-5 sm:p-7 space-y-3">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
              04
            </span>
            <div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                {language === 'hi' ? 'चरण 4 • लाइव परिणाम देखें' : 'Step 4 • View Live Results'}
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">
                {language === 'hi'
                  ? 'रीयल-टाइम मतगणना एवं प्रतिशत विस्तार से देखें'
                  : 'Inspect Real-Time Tallies, Percentages & Leaderboards'}
              </h2>
            </div>
          </div>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed pl-12">
            {language === 'hi'
              ? 'मतदान पूरा होते ही आप तुरंत लाइव परिणाम देख सकते हैं। "परिणाम" पृष्ठ पर प्रत्येक दल को मिले मतों की संख्या, प्रतिशत और राज्यवार परिणाम पारदर्शी रूप से प्रदर्शित होते हैं।'
              : 'Immediately after casting your vote, you are redirected to the live results. Track dynamic percentage bars, total verified votes, and filter by national or state assembly results.'}
          </p>
          <div className="pl-12 pt-1">
            <Link href="/polls/national-opinion-poll-2029/results">
              <GlassButton variant="secondary" size="sm" className="gap-1.5 font-bold">
                <BarChart3 className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>{language === 'hi' ? 'लाइव परिणाम पृष्ठ खोलें' : 'Open Live Results Page'}</span>
              </GlassButton>
            </Link>
          </div>
        </GlassCard>
      </div>

      {/* Frequently Asked Questions (FAQ) */}
      <GlassCard className="space-y-4 p-5 sm:p-7">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-[var(--accent)]" />
          <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">
            {language === 'hi' ? 'अक्सर पूछे जाने वाले प्रश्न (FAQ)' : 'Frequently Asked Questions (FAQ)'}
          </h2>
        </div>

        <div className="space-y-3 pt-2 text-xs sm:text-sm">
          <div className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] space-y-1">
            <strong className="text-[var(--text-primary)] block">
              {language === 'hi' ? 'क्या मेरा वोट सचमुच गुप्त और सुरक्षित है?' : 'Is my vote truly private and confidential?'}
            </strong>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              {language === 'hi'
                ? 'हाँ, 100%। मतदान के समय आपकी पहचान और आपके द्वारा चुने गए दल के बीच कोई भी लिंक सर्वर पर मौजूद नहीं होता। यह एकतरफा क्रिप्टोग्राफिक हैश द्वारा सुरक्षित है।'
                : 'Yes, 100%. We employ decoupled cryptographic tokens. There is zero link between your identity and your chosen candidate on our servers.'}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] space-y-1">
            <strong className="text-[var(--text-primary)] block">
              {language === 'hi' ? 'क्या मेरा वोट बदला जा सकता है?' : 'Can I change my vote after submitting?'}
            </strong>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              {language === 'hi'
                ? 'नहीं। मतदान की विश्वसनीयता और निष्पक्षता बनाए रखने के लिए, एक बार पुष्टि होने के बाद मत स्थायी हो जाता है और बदला नहीं जा सकता।'
                : 'No. To maintain polling integrity and prevent manipulation, each vote is permanent and cannot be modified or re-cast.'}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] space-y-1">
            <strong className="text-[var(--text-primary)] block">
              {language === 'hi' ? 'क्या यह भारत निर्वाचन आयोग का आधिकारिक चुनाव है?' : 'Is this an official election by the Election Commission?'}
            </strong>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              {language === 'hi'
                ? 'नहीं। "मेरा वोट" एक पूर्णतः स्वतंत्र नागरिक जनमत सर्वेक्षण मंच है। इसका किसी राजनीतिक दल या चुनाव आयोग से कोई औपचारिक संबंध नहीं है।'
                : 'No. Mera Vote is an independent civic opinion poll platform. It is not affiliated with the Election Commission of India (ECI) or any political party.'}
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
