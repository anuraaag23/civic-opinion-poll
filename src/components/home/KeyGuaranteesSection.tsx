'use client';

import React from 'react';
import { useI18n } from '@/lib/i18n/context';
import { GlassCard } from '@/components/ui/GlassCard';
import { Shield, KeyRound, Cpu, Scale } from 'lucide-react';

export function KeyGuaranteesSection() {
  const { language } = useI18n();

  const guarantees = [
    {
      icon: Shield,
      title: language === 'hi' ? 'पहचान और मत का पृथक्करण' : 'Strict Identity Separation',
      desc:
        language === 'hi'
          ? 'व्हाट्सएप ओटीपी केवल नागरिक पात्रता की पुष्टि करता है। आपका फोन नंबर कभी भी आपके चुने गए मत के साथ संग्रहीत नहीं होता।'
          : 'Eligibility is confirmed via WhatsApp OTP, but contact details are never attached to your ballot. The system tallies only anonymous choices.',
    },
    {
      icon: KeyRound,
      title: language === 'hi' ? 'क्रिप्टोग्राफिक दोहराव रोकथाम' : 'Duplicate Prevention via Hashing',
      desc:
        language === 'hi'
          ? 'एक व्यक्ति-एक मत लागू करने के लिए नंबर को एकतरफा क्रिप्टोग्राफिक हैश में बदला जाता है। कच्चा फोन नंबर मेमोरी से तुरंत मिटा दिया जाता है।'
          : 'To enforce one submission per person, phone numbers are transformed into one-way cryptographic hashes. Raw numbers are immediately cleared from memory.',
    },
    {
      icon: Cpu,
      title: language === 'hi' ? 'अखंड सुरक्षित डेटाबेस लेनदेन' : 'Atomic Response Processing',
      desc:
        language === 'hi'
          ? 'प्रत्येक मत एक ही सुरक्षित डेटाबेस लेनदेन में दर्ज होता है। उपयोग के तुरंत बाद सत्र टोकन समाप्त हो जाता है, जिससे दोहराव असंभव है।'
          : 'Submissions are tallied through strict atomic database operations. Verification tokens expire immediately upon use to prevent race conditions.',
    },
    {
      icon: Scale,
      title: language === 'hi' ? 'निष्पक्ष और समान प्रस्तुति' : 'Strict Political Neutrality',
      desc:
        language === 'hi'
          ? 'कोई प्रायोजित प्रचार नहीं, कोई वरीयता नहीं। सभी राजनीतिक दलों और उम्मीदवारों को समान आकार, फ़ॉन्ट और तटस्थ पदानुक्रम में दिखाया जाता है।'
          : 'Zero sponsored placements, zero algorithmic favoritism. All political parties receive uniform card dimensions, typography, and visual weight.',
    },
  ];

  return (
    <section className="py-12 sm:py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--success)] px-3 py-1 rounded-full bg-[var(--success-soft)]">
            {language === 'hi' ? 'नागरिक विश्वास मानक' : 'Civic Trust Standards'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            {language === 'hi' ? 'नागरिक सुरक्षा एवं गोपनीयता प्रतिज्ञा' : 'Civic Privacy & Trust Guarantees'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {guarantees.map((g, idx) => {
            const Icon = g.icon;
            return (
              <GlassCard key={idx} className="flex gap-4 items-start h-full p-5 sm:p-6">
                <div className="p-3 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] shrink-0">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="space-y-1.5 flex-1">
                  <h3 className="text-base font-bold text-[var(--text-primary)]">
                    {g.title}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    {g.desc}
                  </p>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
