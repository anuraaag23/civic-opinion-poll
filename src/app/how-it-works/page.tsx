import type { Metadata } from 'next';
import { HowItWorksClient } from './HowItWorksClient';

export const metadata: Metadata = {
  title: 'How It Works — Mera Vote',
  description:
    'Discover the cryptographic architecture behind Mera Vote: WhatsApp OTP verification, keyed HMAC participation fingerprints, and zero ID storage.',
  keywords: [
    'How Mera Vote Works',
    'Mera Vote Architecture',
    'WhatsApp OTP Polling',
    'Cryptographic Anonymity India',
    'यह कैसे काम करता है',
    'Privacy-Preserving Polling',
  ],
};

export default function HowItWorksPage() {
  return <HowItWorksClient />;
}
