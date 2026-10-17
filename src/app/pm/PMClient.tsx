'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n/context';
import { NATIONAL_PARTIES } from '@/lib/data/parties';
import { Poll } from '@/lib/types';
import { VerificationForm } from '@/components/verification/VerificationForm';
import { VotingView } from '@/components/voting/VotingView';
import { SuccessState } from '@/components/voting/SuccessState';
import { DuplicateState } from '@/components/voting/DuplicateState';
import { DisclaimerBanner } from '@/components/layout/DisclaimerBanner';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassBadge } from '@/components/ui/GlassBadge';
import { GlassButton } from '@/components/ui/GlassButton';
import { ShieldCheck, Vote, Loader2, BarChart3, Lock, ArrowRight, Globe } from 'lucide-react';

type FlowStep = 'RULES' | 'VERIFY' | 'VOTE' | 'SUCCESS' | 'DUPLICATE';

export function PMClient() {
  const { language } = useI18n();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [step, setStep] = useState<FlowStep>('RULES');
  const [anonymousToken, setAnonymousToken] = useState<string | null>(null);

  useEffect(() => {
    async function loadPMPoll() {
      try {
        const res = await fetch('/api/polls/poll-national-2029');
        const data = await res.json();
        if (data.success && data.poll) {
          setPoll(data.poll);
        }
      } catch (err) {
        console.error('Failed to load PM poll', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadPMPoll();
  }, []);

  return (
    <div className="space-y-8 sm:space-y-10 py-4 max-w-4xl mx-auto">
      {/* Scope Header: All India / National */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--accent-soft)] border border-[var(--accent)]/30 text-[var(--accent)] text-xs font-semibold">
          <Globe className="w-3.5 h-3.5" />
          <span>{language === 'hi' ? 'संपूर्ण भारत • राष्ट्रीय जनमत (केवल भारत)' : 'All India • National Scope (India Only)'}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[var(--text-primary)]">
          {language === 'hi'
            ? 'प्रधानमंत्री (PM) नागरिक जनमत सर्वेक्षण'
            : 'Prime Minister (PM) Civic Opinion Poll'}
        </h1>

        <p className="text-base sm:text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
          {language === 'hi'
            ? 'संपूर्ण भारत स्तर पर 2029 लोकसभा चुनाव के लिए स्वतंत्र नागरिक सर्वेक्षण। 100% गुमनाम, शून्य आईडी भंडारण।'
            : 'Independent national civic inquiry for Prime Minister of India across all 28 States and 8 Union Territories. Cryptographically decoupled, 100% anonymous.'}
        </p>

        {/* Live India Only Badge Banner */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <GlassBadge variant="success">
            <span className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse" />
            <span>{language === 'hi' ? 'सक्रिय राष्ट्रीय सर्वेक्षण' : 'Live National Poll'}</span>
          </GlassBadge>
          <GlassBadge variant="neutral">
            <Globe className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
            <span className="font-bold text-[var(--accent)]">{language === 'hi' ? 'केवल भारत स्तर' : 'India Only'}</span>
          </GlassBadge>
          <GlassBadge variant="neutral">
            <Lock className="w-3 h-3 text-[var(--accent)]" />
            <span>{language === 'hi' ? 'शून्य व्यक्तिगत डेटा' : 'Zero Personal Data Stored'}</span>
          </GlassBadge>
        </div>
      </div>

      <DisclaimerBanner />

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 text-[var(--accent)] animate-spin" />
          <p className="text-sm text-[var(--text-secondary)]">Loading Prime Minister Poll...</p>
        </div>
      ) : !poll ? (
        <GlassCard className="text-center py-16">
          <Vote className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-3" />
          <p className="text-base text-[var(--text-secondary)]">Unable to load the PM Opinion Poll.</p>
        </GlassCard>
      ) : (
        <>
          {/* FLOW: Step 1 Rules & Parties Showcase */}
          {step === 'RULES' && (
            <div className="space-y-6">
              <GlassCard elevated className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-glass)]">
                  <div>
                    <span className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider block">
                      {language === 'hi' ? 'लोकसभा 2029' : 'Lok Sabha 2029'}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
                      {language === 'hi' ? 'राष्ट्रीय स्तर पर चुनाव लड़ने वाले दल' : 'Contesting National Parties'}
                    </h2>
                  </div>

                  <Link href="/polls/national-opinion-poll-2029/results">
                    <GlassButton variant="secondary" size="md" className="gap-2 w-full sm:w-auto">
                      <BarChart3 className="w-4 h-4 text-[var(--accent)]" />
                      <span>{language === 'hi' ? 'राष्ट्रीय लाइव परिणाम देखें' : 'View National Results'}</span>
                    </GlassButton>
                  </Link>
                </div>

                {/* Grid of National Parties with Original Logos */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
                    {language === 'hi' ? 'मतदान सूची में शामिल सभी 9 राष्ट्रीय विकल्प:' : 'All 9 National Choices with Official Logos:'}
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {NATIONAL_PARTIES.map((party) => (
                      <div
                        key={party.id}
                        className="p-3 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-glass)] flex items-center gap-3 shadow-xs"
                      >
                        <div className="w-12 h-12 rounded-xl bg-white dark:bg-white/95 border border-[var(--border-glass)] p-1.5 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
                          {party.logo_url ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={party.logo_url}
                              alt={party.name_en}
                              className="w-full h-full object-contain"
                              loading="lazy"
                            />
                          ) : (
                            <div
                              className="w-full h-full flex items-center justify-center"
                              dangerouslySetInnerHTML={{ __html: party.symbol_svg }}
                            />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-[var(--border-glass)] text-[var(--text-secondary)] inline-block mb-0.5">
                            {party.short_name}
                          </span>
                          <h3 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] leading-snug break-words">
                            {language === 'hi' ? party.name_hi : party.name_en}
                          </h3>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Voting Guarantee Card */}
                <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] flex items-start gap-3 text-xs leading-relaxed">
                  <ShieldCheck className="w-5 h-5 text-[var(--success)] shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <strong className="text-[var(--text-primary)] block">
                      {language === 'hi' ? 'एक नागरिक, एक मत — 100% गुमनाम:' : 'One Citizen, One Response — 100% Decoupled:'}
                    </strong>
                    <p className="text-[var(--text-secondary)]">
                      {language === 'hi'
                        ? 'आधिकारिक ECI पोर्टल पर स्व-सत्यापन के बाद, आपके पहचान टोकन को हमेशा के लिए नष्ट कर दिया जाता है। आपके और आपके वोट के बीच कोई संबंध कभी दर्ज नहीं होता।'
                        : 'After in-browser eligibility confirmation, an ephemeral cryptographic token is generated. No link exists between your identity and your party preference.'}
                    </p>
                  </div>
                </div>

                {/* CTA to start voting */}
                <div className="pt-2 flex justify-center">
                  <GlassButton
                    size="lg"
                    className="w-full sm:w-auto min-w-[260px] max-w-sm gap-2 shadow-md font-bold px-8 justify-center"
                    onClick={() => setStep('VERIFY')}
                  >
                    <Vote className="w-5 h-5" />
                    <span>{language === 'hi' ? 'प्रधानमंत्री के लिए अपना मत दर्ज करें' : 'Participate in PM Poll'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </GlassButton>
                </div>
              </GlassCard>
            </div>
          )}

          {/* FLOW: Step 2 Self Verification */}
          {step === 'VERIFY' && (
            <VerificationForm
              pollId={poll.id}
              onVerified={(token) => {
                setAnonymousToken(token);
                setStep('VOTE');
              }}
              onAlreadyVoted={() => setStep('DUPLICATE')}
            />
          )}

          {/* FLOW: Step 3 Voting View */}
          {step === 'VOTE' && anonymousToken && (
            <VotingView
              poll={poll}
              anonymousToken={anonymousToken}
              onVoteSuccess={() => setStep('SUCCESS')}
            />
          )}

          {/* FLOW: Step 4 Success State */}
          {step === 'SUCCESS' && <SuccessState pollSlug={poll.slug} />}

          {/* FLOW: Step 5 Duplicate State */}
          {step === 'DUPLICATE' && <DuplicateState pollSlug={poll.slug} />}
        </>
      )}

      {/* Switch to CM Section Banner */}
      <GlassCard className="p-5 flex flex-col sm:flex-row items-center justify-between gap-4 border border-[var(--accent)]/30 bg-gradient-to-r from-[var(--accent-soft)] via-[var(--bg-glass)] to-transparent">
        <div className="space-y-1 text-center sm:text-left">
          <span className="text-xs font-bold text-[var(--accent)] tracking-normal block">
            {language === 'hi' ? 'राज्य स्तर पर वोट करना चाहते हैं?' : 'Want to vote for your State Assembly?'}
          </span>
          <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
            {language === 'hi' ? 'मुख्यमंत्री (CM) जनमत सर्वेक्षण में भाग लें' : 'Participate in Chief Minister (CM) Poll'}
          </h3>
          <p className="text-xs text-[var(--text-secondary)]">
            {language === 'hi'
              ? 'अपना राज्य चुनें और अपनी क्षेत्रीय पार्टियों के असली चुनाव चिह्नों के साथ वोट करें।'
              : 'Select your state and cast your vote among regional parties contesting in your state.'}
          </p>
        </div>

        <Link href="/cm" className="w-full sm:w-auto shrink-0">
          <GlassButton variant="secondary" size="md" className="w-full sm:w-auto gap-2">
            <span>{language === 'hi' ? 'CM जनमत पेज खोलें' : 'Go to CM Poll'}</span>
            <ArrowRight className="w-4 h-4" />
          </GlassButton>
        </Link>
      </GlassCard>
    </div>
  );
}
