import type { Metadata } from 'next';
import { TermsClient } from './TermsClient';

export const metadata: Metadata = {
  title: 'Polling Methodology, Governance & Accessibility',
  description:
    'Independent civic research methodology, sample interpretation boundaries, non-affiliation notice, and WCAG 2.2 AA accessibility commitments.',
  keywords: [
    'Terms of Service Mera Vote',
    'Civic Polling Methodology',
    'WCAG 2.2 AA Accessibility',
    'कार्यप्रणाली एवं शर्तें',
  ],
};

export default function TermsPage() {
  return <TermsClient />;
}
