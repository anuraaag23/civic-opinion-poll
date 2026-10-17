import type { Metadata } from 'next';
import { SafetyClient } from './SafetyClient';

export const metadata: Metadata = {
  title: 'Safety, Privacy & Voter Protection Guarantees | Mera Vote',
  description:
    'Detailed, organized breakdown of Mera Vote safety architecture: zero personal data recording, real ECI verifier monitoring, decoupled 256-bit cryptographic tokens, and bot defense.',
  keywords: [
    'Mera Vote Safety Guarantees',
    'Voter Protection India',
    'Zero Data Storage',
    'ECI Real Verifier Monitor',
    'Anonymous Civic Polling',
    'नागरिक सुरक्षा गारंटी',
  ],
};

export default function SafetyPage() {
  return <SafetyClient />;
}
