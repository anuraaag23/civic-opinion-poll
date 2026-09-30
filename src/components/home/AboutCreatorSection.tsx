'use client';

import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { GlassCard } from '@/components/ui/GlassCard';
import { SupportModal } from '@/components/support/SupportModal';
import { HeartHandshake, MapPin, Shield, User, Coffee, ArrowRight } from 'lucide-react';

export function AboutCreatorSection() {
  const { language } = useI18n();
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [supportAmount, setSupportAmount] = useState(100);

  const openSupport = (amt: number) => {
    setSupportAmount(amt);
    setSupportModalOpen(true);
  };

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
                  इसलिए मैंने अपने कोडिंग ज्ञान का उपयोग करके <strong>&quot;मेरा वोट&quot; (Mera Vote)</strong> खड़ा किया। यहाँ मतदाता पंजीकरण की जांच सीधे ECI पोर्टल पर होती है और आपकी राय 100% गुमनाम रहती है। मैंने जानबूझकर अपना नाम और पहचान पूरी तरह गुप्त रखी है — क्योंकि यह मंच मेरे बारे में नहीं है, यह <strong>आपकी स्वतंत्र नागरिक राय</strong> के बारे में है।
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
                  That is why I created <strong>Mera Vote</strong>. Electoral registration checks are performed directly by you on the official ECI portal, and our database never receives or stores your EPIC. I choose to remain completely anonymous because this project is not about personal credit or fame — it is about giving India a real, uncorrupted, untampered citizen mirror.
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

          {/* Dedicated Ko-fi Support Banner for Developer */}
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-xs">
            <div className="space-y-2 max-w-lg">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-bold uppercase tracking-wider">
                <Coffee className="w-3.5 h-3.5" />
                <span>Ko-fi • Community Supported</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-[var(--text-primary)] tracking-tight">
                {language === 'hi'
                  ? 'इस वेबसाइट को जीवित रखने के लिए डेवलपर का समर्थन करें'
                  : 'support to developer for make alive this website'}
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                {language === 'hi'
                  ? 'सर्वर लागत और निष्पक्षता बनाए रखने के लिए 20 वर्षीय युवा को सीधे Ko-fi पर एक कप कॉफी भेंट करें। शून्य कॉरपोरेट या पार्टी फंडिंग।'
                  : 'Every single rupee helps pay for cloud servers, zero-lag databases, and anti-abuse safeguards. Keep Mera Vote 100% free, alive, and uncompromised.'}
              </p>
            </div>

            <div className="flex flex-col sm:items-end gap-2.5 shrink-0">
              <div className="flex items-center gap-1.5">
                {[50, 100, 250].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => openSupport(amt)}
                    className="px-3 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-xs font-bold text-amber-700 dark:text-amber-300 transition-all cursor-pointer active:scale-95"
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => openSupport(100)}
                className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Coffee className="w-4 h-4" />
                <span>{language === 'hi' ? 'डेवलपर को कॉफी दें' : 'Buy Developer a Coffee'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </GlassCard>
      </div>

      <SupportModal
        isOpen={supportModalOpen}
        onClose={() => setSupportModalOpen(false)}
        defaultAmount={supportAmount}
      />
    </section>
  );
}
