import type { Metadata } from 'next';
import { AuditClient } from './AuditClient';

export const metadata: Metadata = {
  title: 'Public Vote Audit Explorer | Mera Vote',
  description:
    'Cryptographically verify your anonymous ballot receipt code in the public ledger. 100% zero-knowledge identity separation and mathematical counting proof.',
  keywords: [
    'Vote Audit',
    'Ballot Verification',
    'Zero Knowledge Proof',
    'Mera Vote Ledger',
    'Civic Opinion Poll Audit',
  ],
};

export default function AuditPage() {
  return <AuditClient />;
}
