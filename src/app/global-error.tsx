'use client';

import React from 'react';
import { AlertOctagon, RefreshCw, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <head>
        <title>Application Error | Mera Vote</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        style={{
          margin: 0,
          padding: '24px',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0B0E14',
          color: '#F8FAFC',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        <div
          style={{
            maxWidth: '520px',
            width: '100%',
            backgroundColor: '#141822',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '24px',
            padding: '36px 28px',
            textAlign: 'center',
            boxShadow: '0 24px 48px -8px rgba(0,0,0,0.7)',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              color: '#F87171',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
              border: '1px solid rgba(239, 68, 68, 0.3)',
            }}
          >
            <AlertOctagon style={{ width: '28px', height: '28px' }} />
          </div>

          <h1 style={{ fontSize: '24px', fontWeight: 900, margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
            System Notice
          </h1>
          <h2 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 16px 0', color: '#F87171' }}>
            कुछ अप्रत्याशित समस्या उत्पन्न हुई
          </h2>

          <p style={{ fontSize: '13px', color: '#94A3B8', lineHeight: '1.6', margin: '0 0 24px 0' }}>
            Mera Vote encountered a fatal shell error. Voter privacy and cryptographic isolation remain completely secured.
          </p>

          {error.digest && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                fontSize: '11px',
                fontFamily: 'monospace',
                color: '#CBD5E1',
                marginBottom: '24px',
                wordBreak: 'break-all',
              }}
            >
              Digest: {error.digest}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => reset()}
              style={{
                backgroundColor: '#1D4ED8',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '12px',
                padding: '10px 20px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <RefreshCw style={{ width: '16px', height: '16px' }} />
              Try Again
            </button>

            <button
              type="button"
              onClick={() => {
                // eslint-disable-next-line @next/next/no-location-assign-relative-destination
                if (typeof window !== 'undefined') window.location.href = '/';
              }}
              style={{
                backgroundColor: 'rgba(255,255,255,0.08)',
                color: '#CBD5E1',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '12px',
                padding: '10px 20px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Home style={{ width: '16px', height: '16px' }} />
              Home
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
