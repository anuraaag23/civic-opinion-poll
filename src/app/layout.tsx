import type { Metadata } from 'next';
import './globals.css';
import { I18nProvider } from '@/lib/i18n/context';
import { ThemeProvider } from '@/lib/theme/context';
import { TopSloganBanner } from '@/components/layout/TopSloganBanner';
import { GlassNavbar } from '@/components/layout/GlassNavbar';
import { DisclaimerBanner } from '@/components/layout/DisclaimerBanner';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'CivicPoll India | Independent Civic Opinion Poll Platform',
  description:
    'An independent civic opinion poll platform for India. Participate with privacy-preserving verification and anonymous responses. Not affiliated with the Election Commission of India.',
  keywords: [
    'Independent Civic Opinion Polls',
    'India Public Opinion',
    'Civic Technology',
    'Anonymous Opinion Poll',
    'स्वतंत्र नागरिक जनमत सर्वेक्षण',
  ],
  authors: [{ name: 'Civic Technology Research' }],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'CivicPoll India | Independent Civic Opinion Polls',
    description:
      'Participate in independent public opinion polls with verified eligibility and cryptographically anonymous responses.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col antialiased">
        <ThemeProvider>
          <I18nProvider>
            {/* Ambient depth lighting */}
            <div className="civic-ambient-depth" aria-hidden="true" />

            {/* Inspiring Bilingual Slogan & Guarantee Banner */}
            <TopSloganBanner />

            {/* Permanent Top Legal Disclaimer */}
            <DisclaimerBanner compact />

            {/* Floating Glass Navigation */}
            <GlassNavbar />

            {/* Main Application Content */}
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
              {children}
            </main>

            {/* Footer */}
            <Footer />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
