import type { Metadata, Viewport } from 'next';
import './globals.css';
import { I18nProvider } from '@/lib/i18n/context';
import { ThemeProvider } from '@/lib/theme/context';
import { GlassNavbar } from '@/components/layout/GlassNavbar';
import { DisclaimerBanner } from '@/components/layout/DisclaimerBanner';
import { SiteAnnouncementBanner } from '@/components/layout/SiteAnnouncementBanner';
import { MaintenanceGuard } from '@/components/layout/MaintenanceGuard';
import { Footer } from '@/components/layout/Footer';
import { FloatingSupportWidget } from '@/components/support/FloatingSupportWidget';
import { OfflineDetector } from '@/components/common/OfflineDetector';
import { PwaRegister } from '@/components/pwa/PwaRegister';
import { InstallAppPrompt } from '@/components/pwa/InstallAppPrompt';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';

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
  title: {
    default: 'Mera Vote',
    template: '%s | Mera Vote',
  },
  description:
    'Mera Vote (मेरा वोट) — Independent public opinion poll platform for India. Participate with privacy-preserving self-verification and cryptographically anonymous responses. Zero ID storage. Not affiliated with the Election Commission of India.',
  keywords: [
    'Mera Vote',
    'मेरा वोट',
    'Mera Vote India',
    'Public Opinion Polls',
    'Civic Technology',
    'Anonymous Opinion Poll',
    'स्वतंत्र जनमत सर्वेक्षण',
    'Prime Minister Opinion Poll 2029',
    'Chief Minister Opinion Poll',
    'Lok Sabha Polls',
    'State Assembly Polls',
  ],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/meravote-logo.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  authors: [{ name: 'Anurag (Civic Technology Research)' }],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Mera Vote',
    description:
      'Mera Vote (मेरा वोट) — Participate in independent public opinion polls with verified eligibility and cryptographically anonymous responses.',
    type: 'website',
    images: ['/meravote-logo.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" data-theme="dark" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="application-name" content="Mera Vote" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Mera Vote" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Mukta:wght@400;500;600;700;800&family=Noto+Sans+Devanagari:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('civic_poll_theme');
                  var isDark = stored === 'dark' || (!stored || stored === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (stored === 'light') { isDark = false; }
                  var root = document.documentElement;
                  if (isDark) {
                    root.classList.add('dark');
                    root.setAttribute('data-theme', 'dark');
                  } else {
                    root.classList.remove('dark');
                    root.setAttribute('data-theme', 'light');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen min-h-[100dvh] flex flex-col antialiased overflow-x-hidden selection:bg-[var(--accent)] selection:text-white">
        <ThemeProvider>
          <I18nProvider>
            <MaintenanceGuard>
              {/* Ambient depth lighting */}
              <div className="civic-ambient-depth" aria-hidden="true" />

              {/* Permanent Top Legal Disclaimer */}
              <DisclaimerBanner compact />

              {/* Dynamic Emergency / Platform Announcement Banner */}
              <SiteAnnouncementBanner />

              {/* Glass Navigation */}
              <GlassNavbar />

              {/* Main Application Content */}
              <main className="flex-1 w-full max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 lg:pb-8 relative z-10 overflow-x-hidden">
                {children}
              </main>

              {/* Footer */}
              <Footer />

              {/* Native Mobile Bottom Navigation Bar */}
              <MobileBottomNav />

              {/* Native PWA Installation Prompt */}
              <InstallAppPrompt />

              {/* PWA Service Worker Registration */}
              <PwaRegister />

              {/* Persistent Floating Support Widget (homepage only) */}
              <FloatingSupportWidget />

              {/* Global Real-Time Offline / No Internet Window & Detector */}
              <OfflineDetector />

              {/* Accessible Dedicated Custom Portal Root for Modals & Dialogs */}
              <div id="modal-root" />
            </MaintenanceGuard>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
