'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { ECI_ELECTORAL_SEARCH_URL } from '@/lib/types';
import { ECI_SERIES_REGISTRY } from '@/lib/data/eci-prefixes';
import {
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Search,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  Fingerprint,
  Globe,
  XCircle,
  Loader2,
  Lock,
} from 'lucide-react';

interface VerificationFormProps {
  pollId: string;
  onVerified: (anonymousCredential: string) => void;
  onAlreadyVoted: () => void;
}

export function VerificationForm({
  pollId,
  onVerified,
  onAlreadyVoted,
}: VerificationFormProps) {
  const { language } = useI18n();

  // Anti-bot arithmetic challenge
  const [num1, setNum1] = useState(7);
  const [num2, setNum2] = useState(5);
  const [mathAnswer, setMathAnswer] = useState('');

  // Declaration checkbox
  const [isCheckedConfirmed, setIsCheckedConfirmed] = useState(false);

  // ECI verification form fields (Zero EPIC card numbers requested)
  const [selectedState, setSelectedState] = useState('DL');
  const [assemblyConstituency, setAssemblyConstituency] = useState('');
  const [partNumber, setPartNumber] = useState('');
  const [serialNumber, setSerialNumber] = useState('');

  // Workflow states:
  // 'initial' -> 'eci_pending' -> 'eci_confirm' | 'not_found' -> 'submitting' -> 'success' | 'already_voted'
  const [verifierState, setVerifierState] = useState<
    'initial' | 'eci_pending' | 'eci_confirm' | 'submitting' | 'success' | 'already_voted' | 'not_found'
  >('initial');

  const [error, setError] = useState<string | null>(null);

  // Generate anti-bot math challenge
  const generateNewMathChallenge = useCallback(() => {
    const n1 = Math.floor(Math.random() * 8) + 3;
    const n2 = Math.floor(Math.random() * 8) + 2;
    setNum1(n1);
    setNum2(n2);
    setMathAnswer('');
  }, []);

  useEffect(() => {
    generateNewMathChallenge();
  }, [generateNewMathChallenge]);

  // Execute verification against the server API
  const submitVerification = async (isEciFound = true) => {
    if (!isEciFound) {
      setVerifierState('not_found');
      setError(
        language === 'hi'
          ? 'आपका रिकॉर्ड ECI निर्वाचक नामावली में सक्रिय नहीं मिला। केवल आधिकारिक रूप से पंजीकृत सक्रिय मतदाता ही भाग ले सकते हैं।'
          : 'Your details were not found on the official ECI electoral roll. Only active registered citizens may vote.'
      );
      try {
        await fetch('/api/verification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pollId,
            selfVerificationConfirmed: true,
            eciRecordFound: false,
          }),
        });
      } catch {}
      return;
    }

    // Validate arithmetic challenge
    const expectedAnswer = num1 + num2;
    if (parseInt(mathAnswer, 10) !== expectedAnswer) {
      setError(
        language === 'hi'
          ? 'सुरक्षा जोड़ गलत है। कृपया सही उत्तर दर्ज करें।'
          : 'Security arithmetic verification failed. Please enter the correct sum.'
      );
      return;
    }

    // Validate ECI search coordinates
    const cleanPart = partNumber.trim();
    const cleanSerial = serialNumber.trim();

    if (!cleanPart || !cleanSerial) {
      setError(
        language === 'hi'
          ? 'कृपया ECI खोज परिणाम से अपना भाग संख्या (Part No) एवं क्रम संख्या (Serial No) दर्ज करें।'
          : 'Please enter your Part Number and Serial Number from your ECI search result.'
      );
      return;
    }

    setVerifierState('submitting');
    setError(null);

    try {
      const response = await fetch('/api/verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pollId,
          selfVerificationConfirmed: true,
          eciRecordFound: true,
          stateCode: selectedState,
          assemblyConstituency: assemblyConstituency.trim() || undefined,
          partNumber: cleanPart,
          serialNumber: cleanSerial,
          mathChallenge: {
            num1,
            num2,
            answer: parseInt(mathAnswer, 10),
          },
        }),
      });

      const data = await response.json();

      if (response.status === 409 || data.reason === 'ALREADY_VOTED') {
        setVerifierState('already_voted');
        setError(
          language === 'hi'
            ? 'इस मतदाता रिकॉर्ड द्वारा इस चुनाव में पहले ही मत दिया जा चुका है। निष्पक्ष चुनाव हेतु दोहरा मतदान पूर्णतः प्रतिबंधित है।'
            : 'This voter record has already cast a vote in this election. Duplicate voting is strictly blocked to keep elections fair.'
        );
        try {
          localStorage.setItem(`civic_voted_${pollId}`, 'true');
        } catch {}
        onAlreadyVoted();
        return;
      }

      if (response.status === 400 && data.reason === 'ECI_NOT_FOUND') {
        setVerifierState('not_found');
        setError(
          language === 'hi'
            ? 'आपका वोटर कार्ड ECI निर्वाचक नामावली में सक्रिय नहीं मिला।'
            : 'Your details were not found on the official ECI electoral roll.'
        );
        return;
      }

      if (!response.ok || !data.verified) {
        setVerifierState('eci_confirm');
        setError(data.error || 'Verification failed. Please verify your details and try again.');
        return;
      }

      // Verification successful
      setVerifierState('success');

      try {
        localStorage.setItem(`civic_voted_${pollId}`, 'true');
      } catch {}

      // Automatically transition into the voting booth
      setTimeout(() => {
        onVerified(data.anonymous_token || data.anonymousCredential);
      }, 1200);
    } catch (err) {
      console.error('Verification error:', err);
      setVerifierState('eci_confirm');
      setError(
        language === 'hi'
          ? 'सर्वर से संपर्क नहीं हो सका। कृपया पुनः प्रयास करें।'
          : 'Could not connect to verification server. Please try again.'
      );
    }
  };

  // 1-Click Redirect to Official ECI Portal
  const handleOpenEciPortal = () => {
    const expectedAnswer = num1 + num2;
    if (parseInt(mathAnswer, 10) !== expectedAnswer) {
      setError(
        language === 'hi'
          ? 'सुरक्षा जोड़ गलत है। कृपया सही उत्तर दर्ज करें।'
          : 'Security arithmetic verification failed. Please enter the correct sum.'
      );
      return;
    }

    if (!isCheckedConfirmed) {
      setError(
        language === 'hi'
          ? 'कृपया जारी रखने से पहले मतदाता घोषणा की पुष्टि करें।'
          : 'Please confirm the voter declaration before proceeding.'
      );
      return;
    }

    setError(null);
    setVerifierState('eci_pending');

    // Open official ECI portal in a new tab
    window.open(ECI_ELECTORAL_SEARCH_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <GlassCard elevated className="space-y-6 p-5 sm:p-8 relative overflow-hidden">
        {/* Subtle decorative ambient glow */}
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-36 bg-[var(--accent)]/10 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]/20 flex items-center justify-center mx-auto shadow-xs">
            <Globe className="w-6 h-6" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[var(--accent-soft)] border border-[var(--border-glass)] text-[var(--accent)] text-[11px] font-bold mx-auto">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>
              {language === 'hi'
                ? 'भारत निर्वाचन आयोग (ECI) द्वारा अधिकृत सत्यापन'
                : 'Official ECI Electoral Roll Verification'}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-[var(--text-primary)]">
            {language === 'hi' ? 'मतदाता पात्रता सत्यापन' : 'Verify Voter Eligibility'}
          </h2>

          <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
            {language === 'hi'
              ? 'निष्पक्ष चुनाव हेतु भारत निर्वाचन आयोग (ECI) की आधिकारिक निर्वाचक नामावली पर अपना पंजीकरण जांचें। इस वेबसाइट पर कोई कार्ड नंबर लिखने की आवश्यकता नहीं है।'
              : 'Verify your active electoral roll registration directly on the official ECI portal. No EPIC or card number is entered or stored on this website.'}
          </p>
        </div>

        {/* Dynamic Alert Banner */}
        {error && (
          <div
            role="alert"
            className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-start gap-2.5 animate-in fade-in duration-200"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed font-medium">{error}</span>
          </div>
        )}

        {/* ── STEP 1: INITIAL ECI REDIRECT INTENT ── */}
        {verifierState === 'initial' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleOpenEciPortal();
            }}
            className="space-y-5"
          >
            {/* Anti-Bot Arithmetic Human Challenge */}
            <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-glass)] space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-1.5">
                  <Fingerprint className="w-4 h-4 text-[var(--accent)]" />
                  <span>
                    {language === 'hi'
                      ? 'सुरक्षा सत्यापन (Anti-Bot Challenge) *'
                      : 'Security Verification (Anti-Bot Challenge) *'}
                  </span>
                </label>
                <button
                  type="button"
                  onClick={generateNewMathChallenge}
                  className="text-[11px] text-[var(--accent)] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>{language === 'hi' ? 'बदलें' : 'Refresh'}</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-3 py-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-glass)] font-mono font-bold text-sm text-[var(--text-primary)] select-none">
                  {num1} + {num2} = ?
                </div>
                <input
                  type="number"
                  required
                  value={mathAnswer}
                  onChange={(e) => {
                    setMathAnswer(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="?"
                  className="w-24 px-3 py-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-glass)] text-sm font-bold text-center text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                />
              </div>
            </div>

            {/* Voter Legal Declaration Checkbox */}
            <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-glass)] cursor-pointer hover:bg-[var(--bg-surface-hover)] transition-colors">
              <input
                type="checkbox"
                required
                checked={isCheckedConfirmed}
                onChange={(e) => {
                  setIsCheckedConfirmed(e.target.checked);
                  if (error) setError(null);
                }}
                className="mt-0.5 w-4 h-4 rounded text-[var(--accent)] focus:ring-[var(--accent)] cursor-pointer accent-[var(--accent)]"
              />
              <span className="text-[11px] sm:text-xs text-[var(--text-secondary)] leading-relaxed">
                {language === 'hi'
                  ? 'मैं प्रमाणित करता हूँ कि मैं भारत का नागरिक हूँ एवं निर्वाचक नामावली में पंजीकृत हूँ। मैं इस चुनाव में केवल एक बार निष्पक्ष मत दूंगा।'
                  : 'I declare that I am an eligible citizen registered in the Indian electoral roll. I understand that only one vote is permitted per voter.'}
              </span>
            </label>

            {/* Primary Action Button: Open ECI Portal */}
            <GlassButton
              type="submit"
              variant="primary"
              size="lg"
              disabled={!isCheckedConfirmed || !mathAnswer}
              className="w-full gap-2 font-bold justify-center shadow-md py-3.5"
            >
              <Search className="w-4 h-4" />
              <span>
                {language === 'hi'
                  ? 'ECI पोर्टल पर विवरण खोजें (electoralsearch.eci.gov.in) ↗'
                  : 'Search on Official ECI Portal (electoralsearch.eci.gov.in) ↗'}
              </span>
              <ExternalLink className="w-3.5 h-3.5" />
            </GlassButton>
          </form>
        )}

        {/* ── STEP 2: USER IS ON ECI TAB — CONFIRM WHAT WAS FOUND ── */}
        {verifierState === 'eci_pending' && (
          <div className="py-2 space-y-6 animate-in fade-in duration-300">
            <div className="p-4 rounded-2xl bg-[var(--accent-soft)] border border-[var(--accent)]/30 space-y-2 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--bg-primary)] text-[var(--accent)] font-bold text-xs">
                <ExternalLink className="w-3.5 h-3.5" />
                <span>ECI Portal Opened in New Tab</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-md mx-auto pt-1">
                {language === 'hi'
                  ? 'खुले हुए भारत निर्वाचन आयोग (ECI) के पोर्टल पर अपना मतदाता पंजीकरण खोजें (नाम, मोबाइल OTP या EPIC द्वारा)।'
                  : 'Search for your registration on the opened Election Commission of India portal (using Details, Mobile OTP, or EPIC).'}
              </p>
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)]">
                {language === 'hi'
                  ? 'क्या ECI पोर्टल पर आपका रिकॉर्ड सक्रिय मिला?'
                  : 'Did you find your active record on the official ECI portal?'}
              </h3>
              <p className="text-[11px] text-[var(--text-tertiary)]">
                {language === 'hi'
                  ? 'सत्यनिष्ठा बनाए रखने के लिए केवल सक्रिय रूप से मिले रिकॉर्ड ही मतदान कर सकते हैं।'
                  : 'Only records actively found on the electoral roll are eligible to participate.'}
              </p>
            </div>

            {/* Two Outcome Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => submitVerification(false)}
                className="p-4 rounded-2xl bg-red-500/10 hover:bg-red-500/15 border border-red-500/30 text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-xs">
                  <XCircle className="w-4 h-4 shrink-0" />
                  <span>
                    {language === 'hi' ? 'नहीं, रिकॉर्ड नहीं मिला' : 'No, Record NOT Found'}
                  </span>
                </div>
                <p className="text-[11px] text-[var(--text-tertiary)] pt-1.5 leading-relaxed">
                  {language === 'hi'
                    ? 'मेरा नाम या विवरण ECI निर्वाचक नामावली में उपलब्ध नहीं है।'
                    : 'My name or details were not listed in the electoral roll.'}
                </p>
              </button>

              <button
                type="button"
                onClick={() => setVerifierState('eci_confirm')}
                className="p-4 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/30 text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>
                    {language === 'hi' ? 'हाँ, विवरण सक्रिय मिला' : 'Yes, Details Were Found'}
                  </span>
                </div>
                <p className="text-[11px] text-[var(--text-tertiary)] pt-1.5 leading-relaxed">
                  {language === 'hi'
                    ? 'मेरा मतदाता पंजीकरण सक्रिय है (पुष्टि कर मतपत्र खोलें)।'
                    : 'My record is actively registered (confirm and unlock ballot).'}
                </p>
              </button>
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  window.open(ECI_ELECTORAL_SEARCH_URL, '_blank', 'noopener,noreferrer');
                }}
                className="text-xs text-[var(--accent)] hover:underline inline-flex items-center gap-1 cursor-pointer font-medium"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'ECI पोर्टल पुनः खोलें' : 'Re-open ECI Search Tab'}</span>
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: CONFIRM ECI ELECTORAL COORDINATES (ZERO EPIC ASKED) ── */}
        {verifierState === 'eci_confirm' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitVerification(true);
            }}
            className="space-y-4 animate-in fade-in duration-300"
          >
            <div className="p-3.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-glass)] space-y-1">
              <h4 className="text-xs font-bold text-[var(--text-primary)]">
                {language === 'hi' ? 'ECI खोज परिणाम विवरण की पुष्टि करें' : 'Confirm ECI Electoral Roll Details'}
              </h4>
              <p className="text-[11px] text-[var(--text-tertiary)] leading-relaxed">
                {language === 'hi'
                  ? 'ECI खोज परिणाम तालिका से अपना राज्य, भाग संख्या (Part No) एवं क्रम संख्या (Serial No) दर्ज करें। कोई निजी कार्ड नंबर नहीं मांगा जाता।'
                  : 'Enter your State, Part Number, and Serial Number from your ECI search result. Zero private card numbers are requested.'}
              </p>
            </div>

            {/* State Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--text-primary)]">
                {language === 'hi' ? 'राज्य / केंद्र शासित प्रदेश *' : 'State / Union Territory *'}
              </label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-glass)] text-xs sm:text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              >
                {ECI_SERIES_REGISTRY.map((s) => (
                  <option key={s.stateCode} value={s.stateCode}>
                    {language === 'hi' ? s.stateNameHi : s.stateNameEn}
                  </option>
                ))}
              </select>
            </div>

            {/* Assembly Constituency (AC) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--text-primary)]">
                {language === 'hi' ? 'विधानसभा निर्वाचन क्षेत्र (AC)' : 'Assembly Constituency (AC)'}
              </label>
              <input
                type="text"
                value={assemblyConstituency}
                onChange={(e) => setAssemblyConstituency(e.target.value)}
                placeholder={language === 'hi' ? 'उदा. 40 नई दिल्ली या वाराणसी' : 'e.g. 40 New Delhi or Varanasi'}
                className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-glass)] text-xs sm:text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              />
            </div>

            {/* Part Number & Serial Number */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-primary)]">
                  {language === 'hi' ? 'भाग संख्या (Part No) *' : 'Part Number *'}
                </label>
                <input
                  type="text"
                  required
                  value={partNumber}
                  onChange={(e) => setPartNumber(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="e.g. 142"
                  maxLength={6}
                  className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-glass)] text-xs sm:text-sm font-mono font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-primary)]">
                  {language === 'hi' ? 'क्रम संख्या (Serial No) *' : 'Serial Number *'}
                </label>
                <input
                  type="text"
                  required
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="e.g. 389"
                  maxLength={6}
                  className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-glass)] text-xs sm:text-sm font-mono font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                />
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <GlassButton
                type="submit"
                variant="primary"
                size="lg"
                disabled={!partNumber || !serialNumber}
                className="flex-1 justify-center gap-2 font-bold py-3"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {language === 'hi'
                    ? 'विवरण सत्यापित कर मतपत्र खोलें ➔'
                    : 'Confirm Details & Unlock Ballot ➔'}
                </span>
              </GlassButton>

              <GlassButton
                type="button"
                variant="outline"
                onClick={() => setVerifierState('eci_pending')}
                className="text-xs font-bold"
              >
                {language === 'hi' ? 'वापस' : 'Back'}
              </GlassButton>
            </div>
          </form>
        )}

        {/* ── STEP 4: SUBMITTING TRANSACTION ── */}
        {verifierState === 'submitting' && (
          <div className="py-8 text-center space-y-4 animate-in fade-in duration-200">
            <Loader2 className="w-10 h-10 animate-spin text-[var(--accent)] mx-auto" />
            <div className="space-y-1">
              <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)]">
                {language === 'hi'
                  ? 'क्रिप्टोग्राफिक टोकन जारी किया जा रहा है...'
                  : 'Issuing Anonymous Voter Credential...'}
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                {language === 'hi'
                  ? 'दोहरे मतदान की रोकथाम एवं अनाम सुरक्षा की पुष्टि जारी...'
                  : 'Verifying deduplication and cryptographic zero-linkage...'}
              </p>
            </div>
          </div>
        )}

        {/* ── STEP 5: VERIFICATION SUCCESS ── */}
        {verifierState === 'success' && (
          <div className="py-6 text-center space-y-4 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400">
                {language === 'hi'
                  ? 'मतदाता पात्रता सफलतापूर्वक सत्यापित!'
                  : 'Voter Eligibility Successfully Verified!'}
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                {language === 'hi'
                  ? 'अनाम क्रिप्टोग्राफिक टोकन जारी किया गया। मतपत्र पर पुनः निर्देशित किया जा रहा है...'
                  : 'Anonymous single-use credential issued. Unlocking confidential ballot...'}
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-surface)] border border-[var(--border-glass)] text-[11px] font-mono text-[var(--text-secondary)]">
              <Lock className="w-3 h-3 text-[var(--accent)]" />
              <span>Zero Identity Linked • 1 Citizen 1 Vote</span>
            </div>
          </div>
        )}

        {/* ── STEP 6: ALREADY VOTED (DUPLICATE BLOCKED) ── */}
        {verifierState === 'already_voted' && (
          <div className="py-6 text-center space-y-4 animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto shadow-md">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-black text-[var(--text-primary)]">
                {language === 'hi' ? 'दोहरा मतदान प्रतिबंधित है' : 'Duplicate Vote Blocked'}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto leading-relaxed">
                {language === 'hi'
                  ? 'इस मतदाता रिकॉर्ड द्वारा इस चुनाव में पूर्व में मत दर्ज किया जा चुका है। निष्पक्ष चुनाव हेतु प्रत्येक नागरिक केवल एक बार मतदान कर सकता है।'
                  : 'This voter record has already participated in this poll. To preserve election integrity, each voter is strictly limited to one vote.'}
              </p>
            </div>
          </div>
        )}

        {/* ── STEP 7: RECORD NOT FOUND ON ECI ── */}
        {verifierState === 'not_found' && (
          <div className="py-6 text-center space-y-4 animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-500 border border-red-500/30 flex items-center justify-center mx-auto shadow-md">
              <XCircle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-black text-[var(--text-primary)]">
                {language === 'hi' ? 'ECI निर्वाचक नामावली में रिकॉर्ड नहीं मिला' : 'No Electoral Record Found on ECI'}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto leading-relaxed">
                {language === 'hi'
                  ? 'आपका विवरण भारत निर्वाचन आयोग के आधिकारिक पोर्टल पर सक्रिय नहीं मिला। चुनाव आयोग के नियमानुसार केवल सक्रिय पंजीकृत मतदाता ही इस सर्वेक्षण में भाग ले सकते हैं।'
                  : 'Your details were not found active on the official Election Commission of India portal. In accordance with election standards, only active registered citizens are eligible to participate.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
              <GlassButton
                type="button"
                variant="primary"
                onClick={() => {
                  window.open(ECI_ELECTORAL_SEARCH_URL, '_blank', 'noopener,noreferrer');
                  setVerifierState('eci_pending');
                  setError(null);
                }}
                className="text-xs font-bold gap-1.5"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'ECI पोर्टल पर पुनः खोजें' : 'Search Again on ECI'}</span>
              </GlassButton>
              <GlassButton
                type="button"
                variant="outline"
                onClick={() => {
                  setVerifierState('initial');
                  setError(null);
                }}
                className="text-xs font-bold"
              >
                {language === 'hi' ? 'मुख्य पृष्ठ पर वापस' : 'Back to Start'}
              </GlassButton>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
