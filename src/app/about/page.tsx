'use client';

import React from 'react';
import { useI18n } from '@/lib/i18n/context';
import { AboutCreatorSection } from '@/components/home/AboutCreatorSection';
import { VoterAssuranceCard } from '@/components/verification/VoterAssuranceCard';
import { DisclaimerBanner } from '@/components/layout/DisclaimerBanner';
import { GlassButton } from '@/components/ui/GlassButton';
import Link from 'next/link';
import { Vote, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  const { language } = useI18n();

  return (
    <div className="space-y-8 py-4">
      <DisclaimerBanner />

      <AboutCreatorSection />

      <div className="max-w-4xl mx-auto">
        <VoterAssuranceCard />
      </div>

      <div className="text-center pt-4">
        <Link href="/polls/national-opinion-poll-2029">
          <GlassButton size="lg" className="gap-2 shadow-md">
            <Vote className="w-5 h-5" />
            <span>{language === 'hi' ? 'सक्रिय सर्वेक्षण में अपनी राय दें' : 'Cast Your Opinion in Active Poll'}</span>
            <ArrowRight className="w-4 h-4" />
          </GlassButton>
        </Link>
      </div>
    </div>
  );
}
