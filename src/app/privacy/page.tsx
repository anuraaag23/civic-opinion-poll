import type { Metadata } from 'next';
import { PrivacyClient } from './PrivacyClient';

export const metadata: Metadata = {
  title: 'Privacy Architecture & Data Guarantees',
  description:
    'Our unbreakable pledge: zero EPIC or voter ID storage, keyed HMAC participation fingerprints, and complete cryptographic identity separation. 100% anonymous.',
  keywords: [
    'Privacy Policy Mera Vote',
    'Zero ID Storage Guarantee',
    'Decoupled Voting System',
    'HMAC Fingerprints',
    'गोपनीयता नीति',
  ],
};

export default function PrivacyPage() {
  return <PrivacyClient />;
}
