import type { Metadata } from 'next';
import { PollsClient } from './PollsClient';

export const metadata: Metadata = {
  title: 'All Polls — Mera Vote',
  description:
    'Explore active independent opinion polls on national and state electoral governance across India on Mera Vote. Fully decoupled, verified, and 100% anonymous.',
  keywords: [
    'Mera Vote Polls',
    'Independent Public Opinion',
    'Lok Sabha Poll',
    'Assembly Election Poll',
    'सक्रिय जनमत सर्वेक्षण',
  ],
};

export default function PollsPage() {
  return <PollsClient />;
}
