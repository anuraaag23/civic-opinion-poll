import type { Metadata } from 'next';
import { HowToUseClient } from './HowToUseClient';

export const metadata: Metadata = {
  title: 'How to Use Mera Vote — Step-by-Step Guide | Mera Vote',
  description:
    'A simple, organized point-by-point guide on how to participate in Mera Vote: selecting polls, verifying via WhatsApp OTP, casting an anonymous ballot, and viewing live results.',
  keywords: [
    'How to use Mera Vote',
    'Mera Vote participation guide',
    'WhatsApp OTP verification guide',
    'Anonymous civic voting India',
    'मेरा वोट का उपयोग कैसे करें',
  ],
};

export default function HowToUsePage() {
  return <HowToUseClient />;
}
