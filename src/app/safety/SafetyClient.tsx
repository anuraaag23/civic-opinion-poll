'use client';

import React from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n/context';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassBadge } from '@/components/ui/GlassBadge';
import {
  ShieldCheck,
  CheckCircle2,
  KeyRound,
  EyeOff,
  Cpu,
  ArrowRight,
} from 'lucide-react';

export function SafetyClient() {
  const { language } = useI18n();

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-4">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2">
          <GlassBadge variant="success">
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--success)]" />
            <span>{language === 'hi' ? 'नागरिक सुरक्षा एवं संरक्षा' : 'Citizen Safety & Data Protection'}</span>
          </GlassBadge>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--text-primary)]">
          {language === 'hi'
            ? 'सुरक्षा, गोपनीयता एवं मतदाता सुरक्षा वास्तुकला'
            : 'Safety, Privacy & Voter Protection Architecture'}
        </h1>
        <p className="text-base text-[var(--text-secondary)] leading-relaxed max-w-2xl">
          {language === 'hi'
            ? 'मेरा वोट मंच पर आपकी भागीदारी 100% सुरक्षित और पूरी तरह से गुमनाम है। यहां हमारे सुरक्षा सिद्धांतों और तकनीकों का विस्तृत बिंदुवार विवरण है।'
            : 'Your participation on Mera Vote is 100% protected and strictly anonymous. Here is an organized, point-by-point breakdown of our security guarantees.'}
        </p>
      </div>

      {/* Point 1: Zero Personal Data Storage Guarantee */}
      <GlassCard className="space-y-4 p-5 sm:p-7">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <EyeOff className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
              {language === 'hi' ? 'बिंदु 01 • शून्य डेटा नीति' : 'Point 01 • Zero Data Policy'}
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">
              {language === 'hi'
                ? 'शून्य व्यक्तिगत डेटा भंडारण (0 बाइट्स सहेजे गए)'
                : 'Zero Personal Data Storage (0 Bytes Retained)'}
            </h2>
          </div>
        </div>

        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          {language === 'hi'
            ? 'मेरा वोट कभी भी आपका EPIC (मतदाता पहचान पत्र) नंबर, नाम, पिता का नाम, जन्म तिथि, मोबाइल नंबर या आवासीय पता न तो मांगता है और न ही हमारे सर्वर पर सहेजता है।'
            : 'Mera Vote never requests, accepts, or stores your EPIC voter card number, full name, father’s name, date of birth, mobile number, or residential address.'}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
          <div className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] space-y-1.5">
            <span className="font-bold text-[var(--error)] flex items-center gap-1.5">
              <span>✕</span> {language === 'hi' ? 'जो हम कभी एकत्र नहीं करते:' : 'What We NEVER Collect:'}
            </span>
            <ul className="text-[var(--text-tertiary)] space-y-1 list-disc list-inside">
              <li>{language === 'hi' ? 'EPIC नंबर या मतदाता पहचान पत्र' : 'Raw EPIC or Voter ID number'}</li>
              <li>{language === 'hi' ? 'नागरिक का नाम या पिता का नाम' : 'Citizen or father\'s name'}</li>
              <li>{language === 'hi' ? 'फोन नंबर या ईमेल पता' : 'Phone numbers or email addresses'}</li>
              <li>{language === 'hi' ? 'मतदान केंद्र या बूथ विवरण' : 'Polling station or booth details'}</li>
              <li>{language === 'hi' ? 'पहचान और मत के बीच कोई भी संबंध' : 'Any link between identity and chosen vote'}</li>
            </ul>
          </div>

          <div className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] space-y-1.5">
            <span className="font-bold text-[var(--success)] flex items-center gap-1.5">
              <span>✓</span> {language === 'hi' ? 'सुरक्षा हेतु केवल न्यूनतम सुरक्षित अवयव:' : 'What We Retain Strictly for Security:'}
            </span>
            <ul className="text-[var(--text-tertiary)] space-y-1 list-disc list-inside">
              <li>{language === 'hi' ? '15 मिनट में स्वतः नष्ट होने वाला टोकन हैश' : 'Ephemeral anonymous token hash (expires in 15m)'}</li>
              <li>{language === 'hi' ? 'दोहरा मतदान रोकने हेतु HMAC फिंगरप्रिंट' : 'Salted HMAC participation fingerprint'}</li>
              <li>{language === 'hi' ? 'दलों के कुल मतों की समग्र संख्या' : 'Aggregate vote counter per party'}</li>
              <li>{language === 'hi' ? 'पारदर्शी सुरक्षा ऑडिट लॉग' : 'Sanitized security audit counters'}</li>
            </ul>
          </div>
        </div>
      </GlassCard>

      {/* Point 2: Real Verifier & Live Monitoring Engine */}
      <GlassCard className="space-y-4 p-5 sm:p-7">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]/20 flex items-center justify-center shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider block">
              {language === 'hi' ? 'बिंदु 02 • रीयल सत्यापन मॉनिटर' : 'Point 02 • Real Verifier Monitoring'}
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">
              {language === 'hi'
                ? 'रीयल सत्यापन मॉनिटर (सफल/विफल निगरानी बिना डेटा रिकॉर्डिंग)'
                : 'Real Verifier Monitor (Monitors Success/Failure with Zero Tracking)'}
            </h2>
          </div>
        </div>

        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          {language === 'hi'
            ? 'मतदान की निष्पक्षता बनाए रखने के लिए, हमारा रीयल सत्यापन इंजन यह सुनिश्चित करता है कि भाग लेने वाला व्यक्ति एक वास्तविक नागरिक है। सत्यापन सीधे आधिकारिक ECI वेबसाइट (electoralsearch.eci.gov.in) पर होता है। हमारा मॉनिटर केवल सत्यापन की सफलता अथवा विफलता की निगरानी करता है, लेकिन उपयोगकर्ता का कोई भी व्यक्तिगत डेटा कभी रिकॉर्ड नहीं करता।'
            : 'To ensure genuine democratic representation, our Real Verifier actively monitors the verification process to validate genuine citizen participation. Verification occurs directly on the official ECI portal (electoralsearch.eci.gov.in). The monitor strictly verifies success or failure in real time without recording any personal data.'}
        </p>

        <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[var(--text-primary)]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {language === 'hi' ? 'रीयल सत्यापनकर्ता मॉनिटर कार्यप्रणाली:' : 'How the Real Verifier Engine Operates:'}
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-mono">0 BYTES RECORDED</span>
          </div>
          <ol className="text-xs text-[var(--text-secondary)] space-y-1.5 list-decimal list-inside leading-relaxed">
            <li>
              <strong className="text-[var(--text-primary)]">{language === 'hi' ? 'आधिकारिक ECI लिंक:' : 'Official ECI Link:'}</strong>{' '}
              {language === 'hi' ? 'नागरिक आधिकारिक ECI सर्च पोर्टल पर सीधे अपनी मतदाता स्थिति जांचते हैं।' : 'Citizens directly check electoral status on the official ECI search portal.'}
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">{language === 'hi' ? 'रीयल-टाइम स्थिति निगरानी:' : 'Real-Time Status Monitoring:'}</strong>{' '}
              {language === 'hi' ? 'सत्यापनकर्ता जाँचता है कि नागरिक ने ECI सत्र पूरा किया या नहीं।' : 'The engine monitors whether the verification lifecycle succeeded or failed.'}
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">{language === 'hi' ? 'गुमनाम क्रेडेंशियल का आवंटन:' : 'Anonymous Credential Issuance:'}</strong>{' '}
              {language === 'hi' ? 'सफल पुष्टि पर 256-बिट सुरक्षित अस्थायी टोकन जारी होता है जो वोट डालने के तुरंत बाद मिट जाता है।' : 'Upon confirmation, an ephemeral 256-bit token is granted and destroyed right after submission.'}
            </li>
          </ol>
        </div>
      </GlassCard>

      {/* Point 3: 256-Bit Cryptographic Anonymity */}
      <GlassCard className="space-y-4 p-5 sm:p-7">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block">
              {language === 'hi' ? 'बिंदु 03 • क्रिप्टोग्राफिक गोपनीयता' : 'Point 03 • Cryptographic Separation'}
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">
              {language === 'hi'
                ? '256-बिट क्रिप्टोग्राफिक पहचान पृथक्करण'
                : '256-Bit Decoupled Cryptographic Credential'}
            </h2>
          </div>
        </div>

        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          {language === 'hi'
            ? 'जब आप मत देते हैं, तो आपका मत केवल एक एकतरफा हैश के साथ पंजीकृत होता है। गणितीय रूप से यह असंभव है कि सर्वर या कोई भी व्यक्ति यह पता लगा सके कि किस नागरिक ने किस दल को मत दिया।'
            : 'When you cast your response, your vote is recorded solely against a one-way cryptographic hash. It is mathematically impossible for anyone—including platform administrators—to link your identity to your chosen vote.'}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
          <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] space-y-1">
            <span className="font-bold text-[var(--text-primary)] block">CSPRNG Entropy</span>
            <p className="text-[var(--text-secondary)]">256-bit cryptographic pseudorandom tokens generated client-side.</p>
          </div>
          <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] space-y-1">
            <span className="font-bold text-[var(--text-primary)] block">15-Minute TTL</span>
            <p className="text-[var(--text-secondary)]">Tokens expire in 15 minutes, ensuring no long-term persistence.</p>
          </div>
          <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] space-y-1">
            <span className="font-bold text-[var(--text-primary)] block">Single Use</span>
            <p className="text-[var(--text-secondary)]">Credential is permanently burned immediately after vote confirmation.</p>
          </div>
        </div>
      </GlassCard>

      {/* Point 4: One Citizen, One Vote Integrity */}
      <GlassCard className="space-y-4 p-5 sm:p-7">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/25 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider block">
              {language === 'hi' ? 'बिंदु 04 • एक नागरिक, एक मत' : 'Point 04 • One Citizen, One Vote'}
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">
              {language === 'hi'
                ? 'दोहरा मतदान एवं बॉट हेरफेर की रोकथाम'
                : 'Sybil Defense & Double Voting Prevention'}
            </h2>
          </div>
        </div>

        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          {language === 'hi'
            ? 'एक नागरिक एक सर्वेक्षण में केवल एक ही बार मत दर्ज कर सकता है। हमारी प्रणाली स्वचालित बॉट्स, स्पैम और एक ही व्यक्ति द्वारा बार-बार वोट डालने के प्रयासों को तुरंत रोकती है।'
            : 'Each participant can only vote once per poll. Our system prevents automated bots, bulk submissions, and duplicate ballot stuffing through in-memory cryptographic rate limiting.'}
        </p>
      </GlassCard>

      {/* Quick Navigation Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-glass)]">
        <div>
          <h3 className="text-sm font-bold text-[var(--text-primary)]">
            {language === 'hi' ? 'उपयोग करने का तरीका जानें' : 'Learn How to Use Mera Vote'}
          </h3>
          <p className="text-xs text-[var(--text-secondary)]">
            {language === 'hi'
              ? 'आसान 4 चरणों में मतदान प्रक्रिया समझें।'
              : 'Read our simple 4-step walkthrough guide.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/how-to-use"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent)] text-white text-xs font-bold shadow-xs hover:bg-[var(--accent-hover)] transition-colors"
          >
            <span>{language === 'hi' ? 'उपयोग गाइड देखें' : 'View How to Use Guide'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/terms"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] text-xs font-bold text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors"
          >
            <span>{language === 'hi' ? 'नियम व शर्तें' : 'Terms & Conditions'}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
