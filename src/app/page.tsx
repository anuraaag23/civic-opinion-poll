import type { Metadata } from 'next';
import { HomeClient } from './HomeClient';

export const metadata: Metadata = {
  title: 'Mera Vote | Independent Civic Opinion Poll Platform',
  description:
    'Mera Vote (मेरा वोट) — Independent civic opinion poll platform for India. Participate with privacy-preserving self-verification and cryptographically anonymous responses. Zero personal ID storage.',
  keywords: [
    'Mera Vote',
    'मेरा वोट',
    'Independent Civic Opinion Polls',
    'India Public Opinion',
    'Civic Technology',
    'Anonymous Opinion Poll',
    'स्वतंत्र नागरिक जनमत सर्वेक्षण',
    'PM Opinion Poll',
    'CM Opinion Poll',
  ],
};

export default function HomePage() {
  return <HomeClient />;
}
