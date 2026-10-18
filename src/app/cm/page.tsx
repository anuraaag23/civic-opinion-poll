import type { Metadata } from 'next';
import { CMClient } from './CMClient';

export const metadata: Metadata = {
  title: 'CM Poll — Mera Vote',
  description:
    'State-by-state opinion poll for Chief Minister on Mera Vote. Select any Indian state or union territory to participate among active state parties with authentic election symbols. 100% anonymous.',
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
