'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n/context';
import { GlassCard } from '@/components/ui/GlassCard';
import { BUYMEACHAI_CONFIG, CHAI_TIERS } from '@/lib/buymeachai/config';
import {
  MapPin,
  Shield,
  User,
  Coffee,
  ArrowRight,
  Mail,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  HeartHandshake,
} from 'lucide-react';

export function AboutCreatorSection() {
  const { language } = useI18n();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section id="about" className="py-6 sm:py-10 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <GlassCard
          elevated
          className="relative overflow-hidden border-t-4 border-t-[var(--accent)] transition-all duration-300"
        >
          {/* ── ALWAYS VISIBLE COMPACT BAR (Default 1-line state) ── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-1">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Link
                href="/"
                className="w-10 h-10 rounded-xl bg-white dark:bg-white/95 border border-[var(--border-glass)] p-1 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform"
                aria-label="Mera Vote Home"
              >
                <Image
                  src="/meravote-logo.png"
                  alt="Mera Vote Logo"
                  width={36}
                  height={36}
                  className="w-full h-full object-contain"
                />
              </Link>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-[var(--accent)]">
                    {language === 'hi' ? 'निर्माता की कहानी' : 'Story & Creator'}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/25">
                    {language === 'hi' ? '100% स्वतंत्र • किसी से कोई फंडिंग नहीं' : '100% Independent • Not Funded by Anyone'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-[var(--text-primary)] leading-snug mt-1">
                  {language === 'hi'
                    ? 'अनुराग (20 वर्ष, UP): "Mera Vote भारतीय राजनीति की हताशा से बनाई एक स्वतंत्र नागरिक पहल है — शून्य फंडिंग, शून्य पार्टी संबंध।"'
                    : 'Anurag (20, UP): "Mera Vote is 100% independent — I am not funded by anyone (zero corporate/party money)."' }
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="py-2 px-4 rounded-xl bg-[var(--accent-soft)] hover:bg-[var(--accent-soft)]/80 text-[var(--accent)] font-bold text-xs flex items-center gap-2 self-start sm:self-auto shrink-0 transition-all cursor-pointer border border-[var(--accent)]/30 active:scale-95 shadow-xs"
              aria-expanded={isExpanded}
            >
              <span>
                {isExpanded
                  ? language === 'hi'
                    ? 'संक्षिप्त करें'
                    : 'Show Less'
                  : language === 'hi'
                  ? 'पूरी कहानी एवं समर्थन पढ़ें'
                  : 'Read Full Story & Support'}
              </span>
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* ── EXPANDABLE CONTENT: THE WHOLE STORY, PROMISE & CHAI SUPPORT ── */}
          {isExpanded && (
            <div className="pt-6 mt-4 border-t border-[var(--border-glass)] space-y-6 animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Creator Metadata Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-glass)]">
                <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] font-medium flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] font-bold border border-[var(--accent)]/30">
                    <User className="w-3.5 h-3.5" />
                    {language === 'hi' ? 'अनुराग (आयु: 20 वर्ष)' : 'Anurag (Age: 20)'}
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[var(--error)]" />
                    {language === 'hi' ? 'उत्तर प्रदेश, भारत' : 'Uttar Pradesh, India'}
                  </span>
                  <span>•</span>
                  {/* Clickable Email */}
                  <a
                    href="mailto:contact@meravote.in"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] font-semibold border border-[var(--accent)]/25 hover:bg-[var(--accent-soft)]/40 transition-colors"
                    title="Email Anurag"
                  >
                    <Mail className="w-3 h-3" />
                    <span>contact@meravote.in</span>
                  </a>
                </div>

                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1 self-start sm:self-auto cursor-pointer"
                >
                  <span>{language === 'hi' ? 'ऊपर समेटें' : 'Collapse'}</span>
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Main Heading */}
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
                  {language === 'hi'
                    ? 'भारतीय राजनीति की हताशा से जन्मी एक स्वतंत्र नागरिक पहल — अनुराग द्वारा'
                    : 'Built Out of Frustration with Indian Politics — By Anurag (20, Uttar Pradesh)'}
                </h2>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">
                  {language === 'hi'
                    ? 'निर्माता: अनुराग (20 वर्ष, उत्तर प्रदेश) • शून्य पार्टी संबंध • पूर्णतः स्वतंत्र नागरिक प्रौद्योगिकी • किसी से कोई फंडिंग नहीं'
                    : 'Built by Anurag (20 years old, from Uttar Pradesh) • Zero political party affiliation • 100% independent civic initiative • Not funded by anyone.'}
                </p>
              </div>

              {/* 100% NOT FUNDED BY ANYONE BANNER */}
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm font-semibold flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>
                  {language === 'hi'
                    ? 'मैं किसी से भी फंडेड नहीं हूँ (I am not funded by anyone): शून्य कॉर्पोरेट फंडिंग, शून्य राजनीतिक पार्टी चंदा, शून्य बाहरी निवेशक। यह प्लेटफॉर्म 100% आत्मनिर्भर है और केवल नागरिकों द्वारा चाय के सहयोग से चलता है।'
                    : 'I am not funded by anyone: Zero corporate sponsors, zero political parties, zero venture capital, and zero external grants. Powered 100% independently by citizens.'}
                </span>
              </div>

              {/* Narrative Content */}
              <div className="space-y-4 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed font-normal">
                {language === 'hi' ? (
                  <>
                    <p>
                      नमस्ते, मैं <strong>अनुराग</strong> हूँ — उत्तर प्रदेश (UP) का एक 20 वर्षीय छात्र और डेवलपर। मैंने &quot;मेरा वोट&quot; (Mera Vote) भारतीय राजनीति के मौजूदा माहौल, पक्षपाती मीडिया सर्वेक्षणों, ज़हरीली टीवी बहसों और सोशल मीडिया के प्रायोजित एजेंडों से गहरी हताशा और निराशा के बाद बनाया है।
                    </p>
                    <p>
                      आज की राजनीति में आम नागरिक केवल एक &quot;वोट बैंक&quot; बनकर रह गया है। मुख्यधारा के मीडिया सर्वे अक्सर पहले से तय राजनीतिक एजेंडे को सच बताकर जनता पर थोपते हैं। नागरिकों के पास ऐसा कोई पारदर्शी, निष्पक्ष और सुरक्षित मंच नहीं था जहाँ वे बिना किसी डर या निगरानी के अपनी सच्ची राय दर्ज कर सकें।
                    </p>
                    <p>
                      इसलिए मैंने अपने कोडिंग ज्ञान का उपयोग करके <strong>&quot;मेरा वोट&quot; (Mera Vote)</strong> खड़ा किया। यहाँ मतदाता पंजीकरण की जांच सीधे आधिकारिक ECI पोर्टल पर होती है, आपका कोई भी पहचान पत्र (EPIC) हमारे पास कभी सेव नहीं होता, और आपकी राय 100% अपरिवर्तनीय और गुमनाम रहती है। यह मंच किसी पार्टी के लिए नहीं, बल्कि <strong>आपकी वास्तविक नागरिक राय</strong> के लिए है।
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      Hi, I am <strong>Anurag</strong> — a 20-year-old student and developer from Uttar Pradesh, India. I built <strong>Mera Vote</strong> out of sheer, genuine frustration with the state of Indian politics, polarized news channels, sponsored social media narratives, and biased opinion polls that claim to speak on behalf of millions without transparency.
                    </p>
                    <p>
                      In modern political discourse, everyday citizens are treated as mere statistics and vote banks. People are afraid to voice their true opinions because of tracking, social stigma, or surveillance. I wanted to prove that modern web engineering and cryptography can solve this problem once and for all.
                    </p>
                    <p>
                      That is why I created <strong>Mera Vote</strong>. Electoral registration checks are performed directly by you on the official ECI portal, and our database never receives or stores your EPIC. I built this independent platform to give India a real, uncorrupted, untampered citizen mirror.
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

              {/* Dedicated Buy Me a Chai Support Banner for Developer */}
              <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-xs">
                <div className="space-y-2 max-w-lg">
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-bold uppercase tracking-wider">
                    <Coffee className="w-3.5 h-3.5" />
                    <span>Buy Me a Chai • Community Supported</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-[var(--text-primary)] tracking-tight">
                    {language === 'hi'
                      ? 'इस वेबसाइट को जीवित रखने के लिए डेवलपर का समर्थन करें'
                      : 'support to developer for make alive this website'}
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                    {language === 'hi'
                      ? 'सर्वर लागत और निष्पक्षता बनाए रखने के लिए 20 वर्षीय युवा को सीधे Buy Me a Chai पर एक कप चाय भेंट करें। शून्य कॉरपोरेट या पार्टी फंडिंग।'
                      : 'Every single rupee helps pay for cloud servers, zero-lag databases, and anti-abuse safeguards. Keep Mera Vote 100% free, alive, and uncompromised.'}
                  </p>
                </div>

                <div className="flex flex-col sm:items-end gap-3 shrink-0 w-full sm:w-auto">
                  <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                    {CHAI_TIERS.map((tier) => (
                      <a
                        key={tier.amount}
                        href={BUYMEACHAI_CONFIG.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 sm:flex-initial px-3.5 py-2 sm:py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-xs font-bold text-amber-700 dark:text-amber-300 transition-all cursor-pointer active:scale-95 text-center min-h-[38px] flex items-center justify-center gap-1"
                        title={`Buy ${tier.chais} Chai (${tier.label})`}
                      >
                        <span>{tier.label}</span>
                        <span className="text-[10px] opacity-75">({tier.chais} {tier.chais === 1 ? 'chai' : 'chais'})</span>
                      </a>
                    ))}
                  </div>

                  <a
                    href={BUYMEACHAI_CONFIG.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto min-h-[42px] py-2 px-5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/35 text-amber-800 dark:text-amber-200 text-xs sm:text-sm font-bold shadow-xs hover:shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                    title={
                      language === 'hi'
                        ? 'इस वेबसाइट को जीवित रखने के लिए डेवलपर का समर्थन करें'
                        : 'support to developer for make alive this website'
                    }
                  >
                    <Coffee className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                    <span>{language === 'hi' ? 'डेवलपर को चाय भेंट करें' : 'Buy Developer a Chai'}</span>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </GlassCard>
      </div>
    </section>
  );
}
