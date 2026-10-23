'use client';

import React, { useState, useEffect } from 'react';
import { Poll } from '@/lib/types';
import { useI18n } from '@/lib/i18n/context';
import { VerificationForm } from '@/components/verification/VerificationForm';
import { VotingView } from '@/components/voting/VotingView';
import { SuccessState } from '@/components/voting/SuccessState';
import { DuplicateState } from '@/components/voting/DuplicateState';
import { DisclaimerBanner } from '@/components/layout/DisclaimerBanner';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassBadge } from '@/components/ui/GlassBadge';
import { GlassButton } from '@/components/ui/GlassButton';
import { ShieldCheck, Vote, Loader2, ArrowRight, Lock, BarChart3 } from 'lucide-react';
import Link from 'next/link';

type FlowStep = 'RULES' | 'VERIFY' | 'VOTE' | 'SUCCESS' | 'DUPLICATE';

interface PollDetailClientProps {
  idOrSlug: string;
}

export function PollDetailClient({ idOrSlug }: PollDetailClientProps) {
  const { t, language } = useI18n();

  const [poll, setPoll] = useState<Poll | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [step, setStep] = useState<FlowStep>('RULES');
  const [anonymousToken, setAnonymousToken] = useState<string | null>(null);

  useEffect(() => {
    async function loadPoll() {
      try {
        const res = await fetch(`/api/polls/${idOrSlug}`);
        const data = await res.json();
        if (data.success && data.poll) {
          setPoll(data.poll);
        }
      } catch (err) {
        console.error('Failed to load poll', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadPoll();
  }, [idOrSlug]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="w-8 h-8 text-[var(--accent)] animate-spin" />
        <p className="text-sm text-[var(--text-secondary)]">{t.common.loading}</p>
      </div>
    );
  }

  if (!poll) {
    return (
      <GlassCard className="max-w-md mx-auto text-center py-16 space-y-4">
        <Vote className="w-12 h-12 text-[var(--text-tertiary)] mx-auto" />
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Poll Not Found</h2>
        <p className="text-sm text-[var(--text-secondary)]">The requested opinion poll does not exist.</p>
        <Link href="/polls">
          <GlassButton size="md">Return to Polls</GlassButton>
        </Link>
      </GlassCard>
    );
  }

  const pollTitle = language === 'hi' ? poll.title_hi : poll.title_en;
  const pollDesc = language === 'hi' ? poll.description_hi : poll.description_en;

  return (
    <div className="space-y-8 py-4">
      {/* Prominent Legal Disclaimer */}
      <DisclaimerBanner />

      {/* Step 1: Poll Overview & Rules */}
      {step === 'RULES' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <GlassCard elevated className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <GlassBadge variant={poll.status === 'LIVE' ? 'success' : 'neutral'}>
                    {poll.status === 'LIVE' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse" />
                    )}
                    {poll.status}
                  </GlassBadge>
                  <GlassBadge variant="neutral">
                    <Lock className="w-3 h-3 text-[var(--accent)]" />
                    <span>{t.common.privacyGuaranteed}</span>
                  </GlassBadge>
                </div>
              </div>

              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
                  {pollTitle}
                </h1>
                <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                  {pollDesc}
                </p>
              </div>
            </div>

            {/* Core Privacy & Participation Rules */}
            <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[var(--success)]" />
                <span>{language === 'hi' ? 'सर्वेक्षण भागीदारी नियम' : 'Participation & Privacy Rules'}</span>
              </h2>
              {poll.requires_verification === false ? (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 space-y-1.5">
                  <div className="font-bold flex items-center gap-1.5">
                    <span className="text-sm">⚡</span>
                    <span>{language === 'hi' ? 'ओपन जनमत (शून्य सत्यापन)' : 'Open Opinion Poll (Zero Verification Required)'}</span>
                  </div>
                  <p className="leading-relaxed text-[11px] text-[var(--text-secondary)]">
                    {language === 'hi'
                      ? 'इस पोल में भाग लेने के लिए किसी भी मोबाइल नंबर या ओटीपी सत्यापन की आवश्यकता नहीं है। अपना विकल्प चुनें और तुरंत मत दर्ज करें।'
                      : 'No mobile number or OTP verification is required to participate in this poll. Select your preferred choice and cast your opinion instantly.'}
                  </p>
                </div>
              ) : (
                <ul className="text-xs text-[var(--text-secondary)] space-y-2 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-[var(--accent)] font-bold">•</span>
                    <span>{t.polls.rule1}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[var(--accent)] font-bold">•</span>
                    <span>{t.polls.rule2}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[var(--accent)] font-bold">•</span>
                    <span>{t.polls.rule3}</span>
                  </li>
                </ul>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <GlassButton
                size="lg"
                className="flex-1 gap-2 shadow-md font-bold"
                onClick={() => {
                  if (poll.requires_verification === false) {
                    setStep('VOTE');
                  } else {
                    setStep('VERIFY');
                  }
                }}
              >
                <span>
                  {poll.requires_verification === false
                    ? language === 'hi'
                      ? 'तुरंत मतदान करें (बिना किसी नंबर के)'
                      : 'Cast Your Vote (No Phone Required)'
                    : t.polls.continueToVerification}
                </span>
                <ArrowRight className="w-4 h-4" />
              </GlassButton>
              <Link href={`/polls/${poll.slug}/results`} className="w-full sm:w-auto">
                <GlassButton
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto gap-2 font-bold border-2 border-[var(--border-glass)] shadow-xs"
                >
                  <BarChart3 className="w-4 h-4 text-[var(--accent)]" />
                  <span>{language === 'hi' ? 'लाइव परिणाम देखें' : 'View Live Results'}</span>
                </GlassButton>
              </Link>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Step 2: Verification */}
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

      {/* Step 3: Voting View */}
      {step === 'VOTE' && (anonymousToken || poll.requires_verification === false) && (
        <VotingView
          poll={poll}
          anonymousToken={anonymousToken || 'anonymous-open'}
          onVoteSuccess={() => setStep('SUCCESS')}
        />
      )}

      {/* Step 4: Success View */}
      {step === 'SUCCESS' && <SuccessState pollSlug={poll.slug} />}

      {/* Step 5: Duplicate Notice */}
      {step === 'DUPLICATE' && <DuplicateState pollSlug={poll.slug} />}
    </div>
  );
}
