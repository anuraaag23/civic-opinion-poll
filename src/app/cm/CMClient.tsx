'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n/context';
import { StateSelector } from '@/components/common/StateSelector';
import { INDIAN_STATES, getStateById, getPartiesForState } from '@/lib/data/parties';
import { Poll, PollOption } from '@/lib/types';
import { VerificationForm } from '@/components/verification/VerificationForm';
import { VotingView } from '@/components/voting/VotingView';
import { SuccessState } from '@/components/voting/SuccessState';
import { DuplicateState } from '@/components/voting/DuplicateState';
import { DisclaimerBanner } from '@/components/layout/DisclaimerBanner';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassBadge } from '@/components/ui/GlassBadge';
import { GlassButton } from '@/components/ui/GlassButton';
import { PollSkeleton } from '@/components/ui/PollSkeleton';
import { ShieldCheck, Vote, BarChart3, Lock, ArrowRight, MapPin, Building2, Calendar } from 'lucide-react';

type FlowStep = 'RULES' | 'VERIFY' | 'VOTE' | 'SUCCESS' | 'DUPLICATE';

export function CMClient() {
  const { language } = useI18n();
  const [selectedStateId, setSelectedStateId] = useState<string>('uttar-pradesh');
  const [rawPoll, setRawPoll] = useState<Poll | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [step, setStep] = useState<FlowStep>('RULES');
  const [anonymousToken, setAnonymousToken] = useState<string | null>(null);

  useEffect(() => {
    async function loadCMPoll() {
      try {
        const res = await fetch('/api/polls/poll-state-cm-2029');
        const data = await res.json();
        if (data.success && data.poll) {
          setRawPoll(data.poll);
        }
      } catch (err) {
        console.error('Failed to load CM poll', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadCMPoll();
  }, []);

  const currentState = useMemo(() => {
    return getStateById(selectedStateId) || INDIAN_STATES[0];
  }, [selectedStateId]);

  const stateParties = useMemo(() => {
    return getPartiesForState(selectedStateId);
  }, [selectedStateId]);

  // Construct state-tailored poll with only the parties active in this state
  const stateTailoredPoll = useMemo<Poll | null>(() => {
    if (!rawPoll) return null;

    const stateTitleEn = `Chief Minister (CM) Poll — ${currentState.name_en}`;
    const stateTitleHi = `मुख्यमंत्री (CM) जनमत सर्वेक्षण — ${currentState.name_hi}`;

    const options: PollOption[] = stateParties.map((party, index) => ({
      id: `opt-cm-${party.id}`,
      poll_id: `poll-cm-${currentState.id}`,
      party_id: party.id,
      party,
      display_order: index + 1,
      is_active: true,
    }));

    return {
      ...rawPoll,
      id: `poll-cm-${currentState.id}`,
      slug: `cm-${currentState.id}`,
      title_en: stateTitleEn,
      title_hi: stateTitleHi,
      description_en: `State Legislative Assembly opinion poll for ${currentState.name_en} (${currentState.assemblySeats || 'State'} seats). Cast your opinion among recognized parties contesting in ${currentState.name_en}.`,
      description_hi: `${currentState.name_hi} विधानसभा के लिए जनमत सर्वेक्षण (${currentState.assemblySeats || 'राज्य'} सीटें)। ${currentState.name_hi} में सक्रिय राजनीतिक दलों में से अपना विकल्प चुनें।`,
      options,
    };
  }, [rawPoll, currentState, stateParties]);

  return (
    <div className="space-y-8 sm:space-y-10 py-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
          <Building2 className="w-3.5 h-3.5" />
          <span>{language === 'hi' ? 'राज्य विधानसभा • मुख्यमंत्री जनमत' : 'State Assembly • Chief Minister Scope'}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[var(--text-primary)]">
          {language === 'hi'
            ? 'मुख्यमंत्री (CM) जनमत सर्वेक्षण'
            : 'Chief Minister (CM) Opinion Poll'}
        </h1>

        <p className="text-base sm:text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
          {language === 'hi'
            ? 'अपने राज्य का चयन करें और उस राज्य में चुनाव लड़ने वाली पार्टियों के असली चुनाव चिह्नों के साथ मुख्यमंत्री पद के लिए अपनी राय दर्ज करें।'
            : 'Select your state to view the exact contesting parties and official symbols active in your Legislative Assembly.'}
        </p>

        {/* Live Badges — iOS 27 Vision Glass Capsules */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
          <GlassBadge variant="success" interactive>
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            </span>
            <span>{language === 'hi' ? 'राज्यवार लाइव जनमत' : 'State-by-State Active Poll'}</span>
          </GlassBadge>
          <GlassBadge variant="accent" interactive>
            <Calendar className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 shrink-0" />
            <span>{language === 'hi' ? 'अक्टूबर 2026 चक्र' : 'October 2026 Edition'}</span>
          </GlassBadge>
          <GlassBadge variant="neutral" interactive>
            <MapPin className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 shrink-0" />
            <span>{language === 'hi' ? '28 राज्य एवं 8 केंद्र शासित प्रदेश' : 'All 28 States & UTs Supported'}</span>
          </GlassBadge>
          <GlassBadge variant="neutral" interactive>
            <Lock className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 shrink-0" />
            <span>{language === 'hi' ? 'शून्य व्यक्तिगत आईडी भंडारण' : 'Zero Personal ID Stored'}</span>
          </GlassBadge>
        </div>
      </div>

      <DisclaimerBanner />

      {/* ── STATE SELECTION COMPONENT ────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[var(--accent)]" />
            <span>{language === 'hi' ? '1. अपना राज्य / केंद्र शासित प्रदेश चुनें:' : '1. Select Your State or Union Territory:'}</span>
          </label>
          <span className="text-xs text-[var(--text-tertiary)] font-mono">
            {currentState.assemblySeats ? `${currentState.assemblySeats} Assembly Seats` : currentState.type}
          </span>
        </div>

        <StateSelector
          selectedStateId={selectedStateId}
          onSelectState={(id) => {
            setSelectedStateId(id);
            setStep('RULES');
            setAnonymousToken(null);
          }}
        />
      </div>

      {isLoading ? (
        <PollSkeleton cardCount={6} />
      ) : !stateTailoredPoll ? (
        <GlassCard className="text-center py-16">
          <Vote className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-3" />
          <p className="text-base text-[var(--text-secondary)]">Unable to load the CM Poll for this state.</p>
        </GlassCard>
      ) : (
        <>
          {/* FLOW: Step 1 Rules & Parties Showcase for Selected State */}
          {step === 'RULES' && (
            <div className="space-y-6">
              <GlassCard elevated className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-glass)]">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider">
                        {currentState.code} • {currentState.type}
                      </span>
                      {currentState.assemblySeats && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] font-bold">
                          {currentState.assemblySeats} {language === 'hi' ? 'सीटें' : 'Seats'}
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
                      {language === 'hi'
                        ? `${currentState.name_hi} में चुनाव लड़ने वाले दल`
                        : `Parties Contesting in ${currentState.name_en}`}
                    </h2>
                  </div>

                  <Link href={`/polls/national-opinion-poll-2029/results?state=${currentState.id}`}>
                    <GlassButton variant="secondary" size="md" className="gap-2 w-full sm:w-auto">
                      <BarChart3 className="w-4 h-4 text-[var(--accent)]" />
                      <span>
                        {language === 'hi'
                          ? `${currentState.name_hi} परिणाम देखें`
                          : `View ${currentState.code} Results`}
                      </span>
                    </GlassButton>
                  </Link>
                </div>

                {/* Grid of State Parties with Exact Official Logos */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
                    {language === 'hi'
                      ? `${currentState.name_hi} के आधिकारिक चुनाव चिह्न एवं दल:`
                      : `Official Party Symbols & Choices in ${currentState.name_en}:`}
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {stateParties.map((party) => (
                      <div
                        key={party.id}
                        className="p-3.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-glass)] flex items-center gap-3 shadow-xs hover:border-[var(--accent)]/50 transition-all"
                      >
                        {/* Authentic High-Quality Original Party Logo */}
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white dark:bg-white/95 border border-[var(--border-glass)] p-1 flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                          {party.logo_url ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={party.logo_url}
                              alt={party.name_en}
                              className="w-full h-full object-contain drop-shadow-2xs"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[var(--bg-surface)] text-[var(--accent)]">
                              <Vote className="w-6 h-6 text-[var(--accent)]" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                            <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-[var(--border-glass)] text-[var(--text-secondary)] inline-block">
                              {party.short_name}
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                              {language === 'hi' ? 'CM प्रत्याशी' : 'CM Candidate'}
                            </span>
                          </div>
                          <h3 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] leading-snug break-words">
                            {language === 'hi' ? party.name_hi : party.name_en}
                          </h3>
                          {(party.candidate_name_en || party.candidate_name_hi) && (
                            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 block truncate pt-0.5">
                              {language === 'hi'
                                ? `प्रत्याशी: ${party.candidate_name_hi || party.candidate_name_en}`
                                : `Candidate: ${party.candidate_name_en}`}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Privacy Guarantee Note */}
                <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] flex items-start gap-3 text-xs leading-relaxed">
                  <ShieldCheck className="w-5 h-5 text-[var(--success)] shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <strong className="text-[var(--text-primary)] block">
                      {language === 'hi' ? '1 नागरिक = 1 मत (राज्य विधानसभा):' : '1 Citizen = 1 Response (State Assembly):'}
                    </strong>
                    <p className="text-[var(--text-secondary)]">
                      {language === 'hi'
                        ? 'आपका वोट क्रिप्टोग्राफिक रूप से एन्क्रिप्ट किया गया है और आपकी व्यक्तिगत पहचान हमारे पास कभी स्टोर नहीं होती। केवल राज्य-स्तरीय समग्र आंकड़े प्रकाशित किए जाते हैं।'
                        : 'Your participation is cryptographically isolated and anonymous. Only aggregate state tallies are visible.'}
                    </p>
                  </div>
                </div>

                {/* CTA to start voting for CM */}
                <div className="pt-2 flex justify-center">
                  <GlassButton
                    size="lg"
                    className="w-full sm:w-auto min-w-[260px] max-w-sm gap-2 shadow-md font-bold px-8 justify-center"
                    onClick={() => setStep('VERIFY')}
                  >
                    <Vote className="w-5 h-5" />
                    <span>
                      {language === 'hi'
                        ? `${currentState.name_hi} CM के लिए अपना मत दर्ज करें`
                        : `Cast Your Opinion for ${currentState.name_en} CM`}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </GlassButton>
                </div>
              </GlassCard>
            </div>
          )}

          {/* FLOW: Step 2 Self Verification */}
          {step === 'VERIFY' && (
            <VerificationForm
              pollId={stateTailoredPoll.id}
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
              poll={stateTailoredPoll}
              anonymousToken={anonymousToken}
              onVoteSuccess={() => setStep('SUCCESS')}
            />
          )}

          {/* FLOW: Step 4 Success State */}
          {step === 'SUCCESS' && <SuccessState pollSlug={stateTailoredPoll.slug} />}

          {/* FLOW: Step 5 Duplicate State */}
          {step === 'DUPLICATE' && <DuplicateState pollSlug={stateTailoredPoll.slug} />}
        </>
      )}

      {/* Switch to PM Section Banner */}
      <GlassCard className="p-5 flex flex-col sm:flex-row items-center justify-between gap-4 border border-[var(--accent)]/30 bg-gradient-to-r from-[var(--accent-soft)] via-[var(--bg-glass)] to-transparent">
        <div className="space-y-1 text-center sm:text-left">
          <span className="text-xs font-bold text-[var(--accent)] tracking-normal block">
            {language === 'hi' ? 'राष्ट्रीय स्तर पर वोट करना चाहते हैं?' : 'Want to vote for Prime Minister (National)?'}
          </span>
          <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
            {language === 'hi' ? 'प्रधानमंत्री (PM) जनमत सर्वेक्षण में भाग लें' : 'Participate in Prime Minister (PM) Poll'}
          </h3>
          <p className="text-xs text-[var(--text-secondary)]">
            {language === 'hi'
              ? 'संपूर्ण भारत स्तर पर लोकसभा चुनाव 2029 के लिए अपनी राय दर्ज करें।'
              : 'All-India scope examining national political sentiment for Prime Minister of India.'}
          </p>
        </div>

        <Link href="/pm" className="w-full sm:w-auto shrink-0">
          <GlassButton variant="secondary" size="md" className="w-full sm:w-auto gap-2">
            <span>{language === 'hi' ? 'PM जनमत पेज खोलें' : 'Go to PM Poll'}</span>
            <ArrowRight className="w-4 h-4" />
          </GlassButton>
        </Link>
      </GlassCard>
    </div>
  );
}
