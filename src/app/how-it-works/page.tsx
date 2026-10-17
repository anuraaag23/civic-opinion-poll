import type { Metadata } from 'next';
import { HowItWorksClient } from './HowItWorksClient';

export const metadata: Metadata = {
  title: 'How It Works — Cryptographic Privacy Architecture',
  description:
    'Discover the cryptographic architecture behind Mera Vote: self-verification directly on the ECI portal, keyed HMAC participation fingerprints, and zero ID storage.',
  keywords: [
    'How Mera Vote Works',
    'Civic Opinion Poll Architecture',
    'Cryptographic Anonymity India',
    'यह कैसे काम करता है',
    'Privacy-Preserving Polling',
  ],
};

export default function HowItWorksPage() {
  return <HowItWorksClient />;
}
