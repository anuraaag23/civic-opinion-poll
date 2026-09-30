import type { Metadata, Viewport } from 'next';
import './globals.css';
import { I18nProvider } from '@/lib/i18n/context';
import { ThemeProvider } from '@/lib/theme/context';
import { TopSloganBanner } from '@/components/layout/TopSloganBanner';
import { GlassNavbar } from '@/components/layout/GlassNavbar';
import { DisclaimerBanner } from '@/components/layout/DisclaimerBanner';
import { Footer } from '@/components/layout/Footer';
import { FloatingSupportWidget } from '@/components/support/FloatingSupportWidget';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F5F6F8' },
    { media: '(prefers-color-scheme: dark)', color: '#0D0F12' },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL('https://meravote.in'),
  title: 'Mera Vote | Independent Civic Opinion Poll Platform',
  description:
    'Mera Vote (मेरा वोट) — Independent civic opinion poll platform for India. Participate with privacy-preserving self-verification and cryptographically anonymous responses. Not affiliated with the Election Commission of India.',
  keywords: [
    'Mera Vote',
    'मेरा वोट',
    'Independent Civic Opinion Polls',
    'India Public Opinion',
    'Civic Technology',
    'Anonymous Opinion Poll',
    'स्वतंत्र नागरिक जनमत सर्वेक्षण',
  ],
  icons: {
    icon: [
      { url: '/meravote-logo.png' },
      { url: '/favicon.ico' },
    ],
    shortcut: '/meravote-logo.png',
    apple: '/meravote-logo.png',
  },
  authors: [{ name: 'Civic Technology Research' }],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Mera Vote | Independent Civic Opinion Polls',
    description:
      'Mera Vote (मेरा वोट) — Participate in independent public opinion polls with verified eligibility and cryptographically anonymous responses.',
    type: 'website',
    images: ['/meravote-logo.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen min-h-[100dvh] flex flex-col antialiased overflow-x-hidden selection:bg-[var(--accent)] selection:text-white">
        <ThemeProvider>
          <I18nProvider>
            {/* Ambient depth lighting */}
            <div className="civic-ambient-depth" aria-hidden="true" />

            {/* Inspiring Bilingual Slogan & Guarantee Banner */}
            <TopSloganBanner />

            {/* Permanent Top Legal Disclaimer */}
            <DisclaimerBanner compact />

            {/* Glass Navigation */}
            <GlassNavbar />

            {/* Main Application Content */}
            <main className="flex-1 w-full max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6 relative z-10 overflow-x-hidden">
              {children}
            </main>

            {/* Floating Ko-fi Support Widget */}
            <FloatingSupportWidget />

            {/* Footer */}
            <Footer />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
