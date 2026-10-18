import type { Metadata } from 'next';
import { HomeClient } from './HomeClient';

export const metadata: Metadata = {
  title: 'Mera Vote',
  description:
    'Mera Vote (मेरा वोट) — Independent public opinion poll platform for India. Participate with privacy-preserving self-verification and cryptographically anonymous responses. Zero personal ID storage.',
  keywords: [
    'Mera Vote',
    'मेरा वोट',
    'Mera Vote India',
    'Public Opinion Polls',
    'Civic Technology',
    'Anonymous Opinion Poll',
    'स्वतंत्र जनमत सर्वेक्षण',
    'PM Opinion Poll',
    'CM Opinion Poll',
  ],
};

export default function HomePage() {
  return <HomeClient />;
}
