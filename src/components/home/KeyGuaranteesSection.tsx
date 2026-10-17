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
      title: language === 'hi' ? 'पूर्ण पहचान पृथक्करण' : 'Absolute Identity Separation',
      desc:
        language === 'hi'
          ? 'सत्यापन सेवा केवल पात्रता की पुष्टि करती है। डेटाबेस में आपका नाम, पता या EPIC कभी भी आपके वोट के साथ नहीं जुड़ता।'
          : 'Verification confirms eligibility in memory. The voting database never records names, addresses, or EPIC numbers alongside vote choices.',
    },
    {
      icon: KeyRound,
      title: language === 'hi' ? 'कीड क्रिप्टोग्राफिक फिंगरप्रिंट' : 'Keyed Cryptographic Fingerprinting',
      desc:
        language === 'hi'
          ? 'दोहरे मतदान को रोकने के लिए गुप्त कुंजी युक्त HMAC-SHA256 का उपयोग होता है, जिससे डिक्शनरी अटैक से पूर्ण सुरक्षा मिलती है।'
          : 'Duplicate submissions are prevented via server-keyed HMAC-SHA256 fingerprints, protecting constrained EPIC strings against dictionary attacks.',
    },
    {
      icon: Cpu,
      title: language === 'hi' ? 'अखंड (Atomic) डेटाबेस लेनदेन' : 'Atomic Vote Increment',
      desc:
        language === 'hi'
          ? 'सभी वोट डेटाबेस में अखंड (atomic) ट्रांजेक्शन से गिने जाते हैं। टोकन की केवल एक बार खपत होती है, जिससे रेस कंडीशन असंभव है।'
          : 'Responses are tallied through strict atomic database operations. Credentials are consumed in the same transaction to eliminate race conditions.',
    },
    {
      icon: Scale,
      title: language === 'hi' ? 'पूर्ण राजनीतिक तटस्थता' : 'Uncompromising Neutrality',
      desc:
        language === 'hi'
          ? 'किसी भी दल की कोई सिफ़ारिश नहीं, कोई प्रायोजित कार्ड नहीं। सभी विकल्पों को समान दृश्य पदानुक्रम और तटस्थ क्रम में प्रस्तुत किया जाता है।'
          : 'Zero recommendations, zero sponsored cards, and zero persuasive framing. Every party is rendered with identical visual hierarchy.',
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
