import type { Metadata } from 'next';
import { PollsClient } from './PollsClient';

export const metadata: Metadata = {
  title: 'Active Civic Opinion Polls',
  description:
    'Explore active independent civic inquiries on national and state electoral governance across India. Fully decoupled, verified, and 100% anonymous.',
  keywords: [
    'Civic Opinion Polls India',
    'Independent Public Opinion',
    'Lok Sabha Poll',
    'Assembly Election Poll',
    'सक्रिय जनमत सर्वेक्षण',
  ],
};

export default function PollsPage() {
  return <PollsClient />;
}
