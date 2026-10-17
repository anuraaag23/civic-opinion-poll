import type { Metadata } from 'next';
import { AboutClient } from './AboutClient';

export const metadata: Metadata = {
  title: 'About the Creator — Anurag & The Mera Vote Initiative',
  description:
    'Discover the story behind Mera Vote (मेरा वोट): built by 20-year-old student Anurag from Uttar Pradesh out of genuine frustration with biased political polls. Zero corporate or party funding.',
  keywords: [
    'About Anurag',
    'Mera Vote Creator',
    'Independent Civic Technology',
    'Anurag Uttar Pradesh',
    'मेरा वोट निर्माता',
  ],
};

export default function AboutPage() {
  return <AboutClient />;
}
