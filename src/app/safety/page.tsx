import type { Metadata } from 'next';
import { SafetyClient } from './SafetyClient';

export const metadata: Metadata = {
  title: 'Safety, Privacy & Voter Protection Guarantees | Mera Vote',
  description:
    'Detailed breakdown of Mera Vote safety architecture: zero personal data recording, WhatsApp OTP verification, decoupled 256-bit cryptographic tokens, and bot defense.',
  keywords: [
    'Mera Vote Safety Guarantees',
    'Voter Protection India',
    'Zero Data Storage',
    'WhatsApp OTP Verification',
    'Anonymous Civic Polling',
    'नागरिक सुरक्षा गारंटी',
  ],
};

export default function SafetyPage() {
  return <SafetyClient />;
}
