import type { Metadata } from 'next';
import { PMClient } from './PMClient';

export const metadata: Metadata = {
  title: 'PM Poll — Mera Vote',
  description:
    'Independent national opinion inquiry for Prime Minister of India on Mera Vote across all 28 States and 8 Union Territories for Lok Sabha 2029. Fully privacy-preserving with cryptographic decoupling and zero ID storage.',
  keywords: [
    'PM Opinion Poll',
    'Lok Sabha 2029 Poll',
    'India Prime Minister Poll',
    'प्रधानमंत्री जनमत सर्वेक्षण',
    'Mera Vote PM Poll',
  ],
};

export default function PMPage() {
  return <PMClient />;
}
