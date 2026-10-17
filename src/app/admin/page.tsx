import type { Metadata } from 'next';
import { AdminClient } from './AdminClient';

export const metadata: Metadata = {
  title: 'Platform Governance & Integrity Monitor',
  description:
    'Audit aggregate verification metrics, participation tallies, and poll lifecycles. Zero voter PII accessible by design.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPage() {
  return <AdminClient />;
}
