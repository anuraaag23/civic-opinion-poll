'use client';

import React from 'react';
import { useI18n } from '@/lib/i18n/context';
import { GlassCard } from '@/components/ui/GlassCard';
import { HeartHandshake, MapPin, Shield, User } from 'lucide-react';

export function AboutCreatorSection() {
  const { language } = useI18n();

  return (
    <section id="about" className="py-12 sm:py-16 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <GlassCard elevated className="space-y-6 relative overflow-hidden border-t-4 border-t-[var(--accent)]">
          {/* Subtle Ambient Badge */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[var(--border-glass)]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center">
                <HeartHandshake className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
                {language === 'hi' ? 'निर्माता की बात' : 'The Story Behind This Platform'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] font-medium">
              <span className="inline-flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-[var(--accent)]" />
                {language === 'hi' ? 'आयु: 20 वर्ष' : 'Age: 20'}
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[var(--error)]" />
                {language === 'hi' ? 'उत्तर प्रदेश, भारत' : 'Uttar Pradesh, India'}
              </span>
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
              {language === 'hi'
                ? 'भारतीय राजनीति की हताशा से जन्मी एक स्वतंत्र नागरिक पहल'
                : 'Built Out of Frustration with Indian Politics — By a 20-Year-Old from Uttar Pradesh'}
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">
              {language === 'hi'
                ? 'कोई राजनीतिक दल नहीं, कोई कॉरपोरेट फंडिंग नहीं, कोई नाम या प्रसिद्धि की चाह नहीं।'
                : 'Zero political party affiliation. Zero corporate agenda. Strictly anonymous for civic integrity.'}
            </p>
          </div>

          {/* Narrative Content */}
          <div className="space-y-4 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed font-normal">
            {language === 'hi' ? (
              <>
                <p>
                  नमस्ते। मैं उत्तर प्रदेश (UP) का एक 20 वर्षीय युवा हूँ। मैंने यह वेबसाइट भारतीय राजनीति के मौजूदा माहौल, पक्षपाती मीडिया सर्वेक्षणों, ज़हरीली टीवी बहसों और सोशल मीडिया के प्रायोजित एजेंडों से गहरी हताशा और निराशा के बाद बनाई है।
                </p>
                <p>
                  आज की राजनीति में आम नागरिक केवल एक &quot;वोट बैंक&quot; बनकर रह गया है। मुख्यधारा के मीडिया सर्वे अक्सर पहले से तय राजनीतिक एजेंडे को सच बताकर जनता पर थोपते हैं। नागरिकों के पास ऐसा कोई पारदर्शी, निष्पक्ष और सुरक्षित मंच नहीं था जहाँ वे बिना किसी डर, बिना किसी पहचान के लीक होने के, अपनी सच्ची राजनीतिक पसंद दर्ज कर सकें।
                </p>
                <p>
                  इसलिए मैंने अपने कोडिंग ज्ञान का उपयोग करके यह मंच खड़ा किया। मैंने जानबूझकर अपना नाम और पहचान पूरी तरह गुप्त रखी है — क्योंकि यह मंच मेरे बारे में नहीं है, यह <strong>आपकी स्वतंत्र नागरिक राय</strong> के बारे में है।
                </p>
              </>
            ) : (
              <>
                <p>
                  I am a 20-year-old student and developer from Uttar Pradesh, India. I built this independent platform out of sheer, genuine frustration with the state of Indian politics, polarized news channels, sponsored social media narratives, and biased opinion polls that claim to speak on behalf of millions without transparency.
                </p>
                <p>
                  In modern political discourse, everyday citizens are treated as mere statistics and vote banks. People are afraid to voice their true opinions because of tracking, social stigma, or surveillance. I wanted to prove that modern web engineering and cryptography can solve this problem once and for all.
                </p>
                <p>
                  Here, your voter identity is verified in-memory and immediately destroyed. No database records your EPIC alongside your chosen party. I choose to remain completely anonymous because this project is not about personal credit or fame — it is about giving India a real, uncorrupted, untampered citizen mirror.
                </p>
              </>
            )}
          </div>

          {/* Core Personal Pledge */}
          <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] flex items-start gap-3 text-xs sm:text-sm">
            <Shield className="w-5 h-5 text-[var(--success)] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="text-[var(--text-primary)] block">
                {language === 'hi' ? 'निर्माता का निष्पक्ष संकल्प:' : 'My Unbreakable Promise:'}
              </strong>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                {language === 'hi'
                  ? 'यह मंच कभी भी किसी पार्टी को प्रमोट नहीं करेगा, न ही कभी आपका डेटा बेचेगा। आपका मत पूरी तरह अपरिवर्तनीय और गुमनाम रहेगा।'
                  : 'This platform will NEVER promote any party, will NEVER sell user data, and will NEVER compromise on identity separation. Your opinion remains yours alone.'}
              </p>
            </div>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}
