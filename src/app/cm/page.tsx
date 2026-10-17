import type { Metadata } from 'next';
import { CMClient } from './CMClient';

export const metadata: Metadata = {
  title: 'Chief Minister (CM) Civic Poll — State Assembly',
  description:
    'State-by-state civic opinion poll for Chief Minister. Select any Indian state or union territory to participate among active state parties with authentic election symbols. 100% anonymous.',
  keywords: [
    'CM Opinion Poll',
    'State Assembly Election Poll',
    'Chief Minister Opinion Poll India',
    'मुख्यमंत्री जनमत सर्वेक्षण',
    'Mera Vote CM Poll',
  ],
};

export default function CMPage() {
  return <CMClient />;
}
