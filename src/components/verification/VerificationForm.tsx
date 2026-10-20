'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { ECI_ELECTORAL_SEARCH_URL } from '@/lib/types';
import { validateEciPrefix, isDummyNumber } from '@/lib/data/eci-prefixes';
import { INDIAN_STATES } from '@/lib/data/parties';
import {
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Search,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  RefreshCw,
  AlertTriangle,
  Fingerprint,
  User,
  Globe,
  ClipboardCopy,
  Check,
  XCircle,
  FileText,
  Info,
  Sparkles,
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
  const { t, language } = useI18n();

  // Step 1: Voter Identity Inputs
  const [voterId, setVoterId] = useState('');
  const [selectedState, setSelectedState] = useState('');

  // Step 2 & 3: ECI Search Verification & Electoral Roll Details
  const [hasOpenedEci, setHasOpenedEci] = useState(false);
  const [copiedNotice, setCopiedNotice] = useState(false);
  const [eciRecordStatus, setEciRecordStatus] = useState<'FOUND' | 'NOT_FOUND' | null>(null);

  // Electoral Roll details fetched from ECI
  const [voterName, setVoterName] = useState('');
  const [assemblyConstituency, setAssemblyConstituency] = useState('');
  const [partNumber, setPartNumber] = useState('');
  const [serialNumber, setSerialNumber] = useState('');

  // Smart Paste / Slip Parser Modal
  const [isSmartPasteOpen, setIsSmartPasteOpen] = useState(false);
  const [pastedEciText, setPastedEciText] = useState('');

  // Step 4: Anti-bot arithmetic challenge
  const [num1, setNum1] = useState(8);
  const [num2, setNum2] = useState(6);
  const [mathAnswer, setMathAnswer] = useState('');

  // Step 5: Checkbox confirmation
  const [isCheckedConfirmed, setIsCheckedConfirmed] = useState(false);

  // UI status
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [credential, setCredential] = useState<string | null>(null);
  const [localDeviceVotedWarning, setLocalDeviceVotedWarning] = useState(false);

  // Generate new math challenge
  const generateNewMathChallenge = useCallback(() => {
    const n1 = Math.floor(Math.random() * 8) + 3;
    const n2 = Math.floor(Math.random() * 8) + 2;
    setNum1(n1);
    setNum2(n2);
    setMathAnswer('');
  }, []);

  useEffect(() => {
    generateNewMathChallenge();

    try {
      const previouslyVoted = localStorage.getItem(`civic_voted_${pollId}`);
      if (previouslyVoted) {
        setLocalDeviceVotedWarning(true);
      }
    } catch {}
  }, [pollId, generateNewMathChallenge]);

  // Clean and normalize voter ID on the fly
  const cleanedVoterId = useMemo(() => {
    return voterId.trim().toUpperCase().replace(/[\s\/-]/g, '');
  }, [voterId]);

  // Real-time ECI series prefix validation
  const eciValidation = useMemo(() => {
    if (!cleanedVoterId || cleanedVoterId.length < 3) return null;
    const prefix = cleanedVoterId.slice(0, 3);
    const check = validateEciPrefix(prefix);
    if (check.isValid) return check;
    // Check 2-letter legacy
    const legacyPrefix = cleanedVoterId.slice(0, 2);
    return validateEciPrefix(legacyPrefix);
  }, [cleanedVoterId]);

  // Auto-fill state if ECI prefix matches
  useEffect(() => {
    if (eciValidation?.isValid && eciValidation.stateCode && !selectedState) {
      const found = INDIAN_STATES.find(
        (s) => s.code.toUpperCase() === eciValidation.stateCode?.toUpperCase()
      );
      if (found) {
        setSelectedState(found.id);
      }
    }
  }, [eciValidation, selectedState]);

  // Strict Voter ID validation
  const voterIdAnalysis = useMemo(() => {
    if (!cleanedVoterId) return { isValid: false, reason: 'empty' };

    const standardRegex = /^[A-Z]{3}[0-9]{7}$/;
    const legacyRegex = /^[A-Z]{2}[0-9]{7,8}$/;

    if (!standardRegex.test(cleanedVoterId) && !legacyRegex.test(cleanedVoterId)) {
      return { isValid: false, reason: 'format', message: 'Must be 3 letters + 7 numbers (e.g. DLH2891042)' };
    }

    if (!eciValidation || !eciValidation.isValid) {
      return {
        isValid: false,
        reason: 'fake_prefix',
        message: `"${cleanedVoterId.slice(0, 3)}" is not an official ECI regional series prefix`,
      };
    }

    const digits = cleanedVoterId.replace(/^[A-Z]+/, '');
    if (isDummyNumber(digits)) {
      return { isValid: false, reason: 'dummy', message: 'Sequential or repetitive dummy numbers are strictly blocked' };
    }

    return { isValid: true, stateNameEn: eciValidation.stateNameEn, stateNameHi: eciValidation.stateNameHi };
  }, [cleanedVoterId, eciValidation]);

  // 1-Click Redirect to Official ECI Portal with Auto-Copy
  const handleOpenEciPortal = async () => {
    if (cleanedVoterId) {
      try {
        await navigator.clipboard.writeText(cleanedVoterId);
        setCopiedNotice(true);
        setTimeout(() => setCopiedNotice(false), 6000);
      } catch {}
    }
    setHasOpenedEci(true);
    if (!eciRecordStatus) {
      setEciRecordStatus('FOUND');
    }
    window.open(ECI_ELECTORAL_SEARCH_URL, '_blank', 'noopener,noreferrer');
  };

  // Smart Parser for pasted ECI Search Result text or downloaded Voter Slip
  const handleParseEciText = () => {
    if (!pastedEciText.trim()) return;

    const text = pastedEciText;

    // 1. Try to find EPIC if present
    const epicMatch = text.match(/\b([A-Z]{2,3}[0-9]{7,8})\b/i);
    if (epicMatch && !voterId) {
      setVoterId(epicMatch[1].toUpperCase());
    }

    // 2. Try to find Name (lines like "Name : ..." or "नाम : ...")
    const nameMatch = text.match(/(?:Name|Full Name|Voter Name|नाम)\s*[:\-]\s*([^\n\r,]+)/i);
    if (nameMatch) {
      setVoterName(nameMatch[1].trim());
    }

    // 3. Try to find Assembly Constituency
    const acMatch = text.match(/(?:Assembly Constituency|AC Name|विधानसभा)\s*[:\-]\s*([^\n\r,]+)/i);
    if (acMatch) {
      setAssemblyConstituency(acMatch[1].trim());
    }

    // 4. Try to find Part Number
    const partMatch = text.match(/(?:Part No|Part Number|भाग संख्या)\s*[:\-]\s*([0-9A-Z\/\-]+)/i);
    if (partMatch) {
      setPartNumber(partMatch[1].trim());
    }

    // 5. Try to find Serial Number in Roll
    const serialMatch = text.match(/(?:Serial No|Sl\.?\s*No|क्रमांक|अनुक्रमांक)\s*[:\-]\s*([0-9]+)/i);
    if (serialMatch) {
      setSerialNumber(serialMatch[1].trim());
    }

    setEciRecordStatus('FOUND');
    setIsSmartPasteOpen(false);
    setPastedEciText('');
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!voterIdAnalysis.isValid) {
      setError(
        language === 'hi'
          ? voterIdAnalysis.message || 'कृपया वास्तविक और मान्य मतदाता पहचान पत्र (EPIC) संख्या दर्ज करें।'
          : voterIdAnalysis.message || 'Please enter a genuine, official Voter ID (EPIC) card number.'
      );
      return;
    }

    if (eciRecordStatus === 'NOT_FOUND') {
      setError(
        language === 'hi'
          ? 'आपका मतदाता पहचान पत्र आधिकारिक ECI पोर्टल पर नहीं मिला। केवल निर्वाचक नामावली में सक्रिय नागरिक ही मतदान कर सकते हैं।'
          : 'Your Voter ID was not found on the official Election Commission of India portal. Only citizens active in the electoral roll are eligible to participate.'
      );
      return;
    }

    if (!voterName || voterName.trim().length < 2) {
      setError(
        language === 'hi'
          ? 'कृपया ECI पोर्टल पर प्रदर्शित अपना पूरा नाम दर्ज करें।'
          : 'Please enter your full name as found on the official ECI electoral roll.'
      );
      return;
    }

    if (!assemblyConstituency || assemblyConstituency.trim().length < 2) {
      setError(
        language === 'hi'
          ? 'कृपया ECI पोर्टल पर प्रदर्शित विधानसभा क्षेत्र (Assembly Constituency) दर्ज करें।'
          : 'Please enter your Assembly Constituency as shown on the ECI electoral search portal.'
      );
      return;
    }

    const expectedAnswer = num1 + num2;
    if (parseInt(mathAnswer, 10) !== expectedAnswer) {
      setError(
        language === 'hi'
          ? 'सुरक्षा सत्यापन (गणित प्रश्न) का उत्तर गलत है। कृपया पुनः प्रयास करें।'
          : 'Security calculation challenge failed. Please enter the correct sum.'
      );
      generateNewMathChallenge();
      return;
    }

    if (!isCheckedConfirmed) {
      setError(
        language === 'hi'
          ? 'मतदान से पहले घोषणा पत्र पर टिक करना अनिवार्य है।'
          : 'Please confirm the voter declaration checkbox before continuing.'
      );
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pollId,
          selfVerificationConfirmed: isCheckedConfirmed,
          voterId: cleanedVoterId,
          voterName: voterName.trim(),
          stateCode: selectedState,
          assemblyConstituency: assemblyConstituency.trim(),
          partNumber: partNumber.trim(),
          serialNumber: serialNumber.trim(),
          eciRecordFound: eciRecordStatus === 'FOUND',
          mathChallenge: {
            num1,
            num2,
            answer: parseInt(mathAnswer, 10),
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.reason === 'ALREADY_VOTED' || response.status === 409) {
          try {
            localStorage.setItem(`civic_voted_${pollId}`, '1');
          } catch {}
          onAlreadyVoted();
          return;
        }

        if (data.reason === 'ECI_NOT_FOUND') {
          setError(
            language === 'hi'
              ? 'मतदाता विवरण ECI पोर्टल पर सक्रिय नहीं मिला। मतदान की अनुमति नहीं दी जा सकती।'
              : 'Voter details could not be verified on the official ECI portal. Participation cannot be authorized.'
          );
          return;
        }

        if (data.reason === 'RATE_LIMITED') {
          setError(t.verification.rateLimited);
          return;
        }

        setError(data.error || t.verification.serviceUnavailable);
        return;
      }

      if (data.verified && data.anonymousCredential) {
        try {
          localStorage.setItem(`civic_voted_${pollId}`, '1');
        } catch {}
        setIsSuccess(true);
        setCredential(data.anonymousCredential);
        onVerified(data.anonymousCredential);
      } else {
        setError(t.verification.serviceUnavailable);
      }
    } catch {
      setError(t.verification.serviceUnavailable);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <GlassCard elevated className="space-y-6 sm:space-y-7 p-4 sm:p-8 relative overflow-hidden">
        {/* Subtle decorative ambient glow */}
        <div
          className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-40 bg-[var(--accent)]/10 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        {/* Real ECI Portal Verification Header */}
        <div className="text-center space-y-2.5 sm:space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]/20 flex items-center justify-center mx-auto shadow-xs mb-1">
            <Globe className="w-6 h-6" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold mx-auto">
            <Sparkles className="w-3.5 h-3.5" />
            <span>100% Free Forever • Zero OTP Cost • Zero SMS Charges</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
            {language === 'hi'
              ? 'ECI पोर्टल द्वारा वास्तविक मतदाता सत्यापन'
              : 'Official ECI Electoral Search Verification'}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed max-w-xl mx-auto">
            {language === 'hi'
              ? 'शून्य लागत और पूर्ण निष्पक्षता। भारत निर्वाचन आयोग के आधिकारिक पोर्टल (electoralsearch.eci.gov.in) पर अपना मतदाता पहचान पत्र खोजें और वास्तविक निर्वाचक नामावली रिकॉर्ड की पुष्टि करके अपना स्वतंत्र एवं सुरक्षित मत दें।'
              : 'Zero cost and strict one-vote democracy. Search your EPIC on the official Election Commission of India portal (electoralsearch.eci.gov.in), verify your active electoral roll record, and cast your sovereign anonymous vote.'}
          </p>
        </div>

        {/* Warning if previous vote detected in this browser/device */}
        {localDeviceVotedWarning && !isSuccess && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <div>
              <span className="font-bold block">
                {language === 'hi' ? 'पूर्व मतदान सूचना:' : 'Previous Participation Note:'}
              </span>
              <span>
                {language === 'hi'
                  ? 'इस डिवाइस से पूर्व में मतदान रिकॉर्ड किया गया है। यदि यह पोल कड़े एकल मत (Strict Single Vote) पर सेट है, तो दोबारा मतदान स्वतः ब्लॉक रहेगा।'
                  : 'A ballot was previously recorded from this device. If strict single-vote policy is enabled, duplicate votes are automatically blocked across all browsers and devices.'}
              </span>
            </div>
          </div>
        )}

        {/* ── REAL ECI VERIFICATION FORM ── */}
        {!isSuccess && (
          <form onSubmit={handleVerifySubmit} className="space-y-5 animate-in fade-in duration-300">
            {/* STEP 1: Enter Voter ID (EPIC) Number */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-glass)] space-y-3.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label
                  htmlFor="voter-id-input"
                  className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-1.5"
                >
                  <CreditCard className="w-4 h-4 text-[var(--accent)]" />
                  <span>
                    {language === 'hi'
                      ? '1. मतदाता पहचान पत्र (EPIC) संख्या दर्ज करें *'
                      : '1. Genuine Voter ID (EPIC Card Number) *'}
                  </span>
                </label>

                {/* Real-time ECI Series Badge */}
                {cleanedVoterId.length >= 3 && (
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 transition-all ${
                      voterIdAnalysis.isValid
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {voterIdAnalysis.isValid ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        <span>
                          {language === 'hi'
                            ? `मान्य ECI सीरीज: ${voterIdAnalysis.stateNameHi || voterIdAnalysis.stateNameEn}`
                            : `Valid ECI Series: ${voterIdAnalysis.stateNameEn}`}
                        </span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                        <span>{voterIdAnalysis.message}</span>
                      </>
                    )}
                  </span>
                )}
              </div>

              {/* Input Field */}
              <div className="relative">
                <input
                  id="voter-id-input"
                  type="text"
                  required
                  value={voterId}
                  onChange={(e) => {
                    setVoterId(e.target.value.toUpperCase());
                    if (error) setError(null);
                  }}
                  placeholder="e.g. DLH2891042, WBG1482910, UP1234567"
                  maxLength={16}
                  className="w-full px-3.5 py-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-glass)] text-sm sm:text-base font-mono font-bold tracking-wider text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-[var(--accent)] shadow-2xs uppercase"
                  autoComplete="off"
                  spellCheck="false"
                />
              </div>

              <span className="text-[var(--text-tertiary)] text-[11px] block">
                {language === 'hi'
                  ? 'असली ECI मतदाता कार्ड कोड (उदा. DLH, WBG, UP, BOM, PAT, JAI, AHM)। फर्जी या रैंडम स्ट्रिंग्स अस्वीकार होंगी।'
                  : 'Official ECI regional series (e.g. DLH, WBG, UP, BOM, PAT, JAI). Random prefixes like ABC/XYZ are rejected.'}
              </span>
            </div>

            {/* STEP 2: 1-Click Search on Official ECI Portal */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[var(--accent-soft)]/40 to-transparent border border-[var(--accent)]/30 space-y-3.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[var(--accent)] text-white">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                      {language === 'hi'
                        ? '2. ECI पोर्टल पर निर्वाचक नामावली में खोजें'
                        : '2. Search Official ECI Electoral Roll'}
                    </h3>
                    <p className="text-[11px] text-[var(--text-secondary)]">
                      electoralsearch.eci.gov.in (Official Election Commission of India)
                    </p>
                  </div>
                </div>

                {copiedNotice && (
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 animate-in fade-in">
                    <Check className="w-3.5 h-3.5" />
                    <span>EPIC ID Copied!</span>
                  </span>
                )}
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handleOpenEciPortal}
                disabled={!cleanedVoterId || cleanedVoterId.length < 5}
                className="w-full py-3 px-4 rounded-xl bg-[var(--accent)] hover:opacity-95 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Search className="w-4 h-4" />
                <span>
                  {language === 'hi'
                    ? 'ECI पोर्टल खोलें एवं वोटर विवरण खोजें (1-क्लिक कॉपी) ↗'
                    : 'Open Official ECI Electoral Search & Search EPIC ↗'}
                </span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              {/* Step Checklist Box */}
              <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] space-y-1.5 text-[11px] text-[var(--text-secondary)]">
                <div className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-[var(--accent)]" />
                  <span>{language === 'hi' ? 'सत्यापन के 3 आसान चरण:' : 'Quick Verification Steps on ECI Portal:'}</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 pl-1">
                  <li>
                    {language === 'hi'
                      ? 'ऊपर दिए गए बटन पर क्लिक करें। आपका EPIC नंबर स्वतः कॉपी हो जाएगा।'
                      : 'Click the button above. Your EPIC card number is copied to clipboard automatically.'}
                  </li>
                  <li>
                    {language === 'hi'
                      ? 'ECI पोर्टल पर "Search by EPIC" चुनें, पेस्ट करें, राज्य चुनें और कैप्चा भरें।'
                      : 'On the ECI Portal, select "Search by EPIC", paste the EPIC, pick state, and solve captcha.'}
                  </li>
                  <li>
                    {language === 'hi'
                      ? 'विवरण मिलने पर नीचे अपना नाम, विधानसभा और भाग/क्रम संख्या की पुष्टि करें।'
                      : 'When details appear, confirm your Name, Assembly Constituency, and Serial Number below.'}
                  </li>
                </ol>
              </div>
            </div>

            {/* STEP 3: Confirm Fetched Electoral Record */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-glass)] space-y-3.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-1.5 block">
                  <User className="w-4 h-4 text-[var(--accent)]" />
                  <span>
                    {language === 'hi'
                      ? '3. ECI पोर्टल पर प्राप्त निर्वाचक रिकॉर्ड की पुष्टि *'
                      : '3. Confirm Verified ECI Electoral Record *'}
                  </span>
                </span>

                <button
                  type="button"
                  onClick={() => setIsSmartPasteOpen(!isSmartPasteOpen)}
                  className="text-xs text-[var(--accent)] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <ClipboardCopy className="w-3 h-3" />
                  <span>{isSmartPasteOpen ? 'Close Auto-fill' : '📋 Quick Auto-fill from Slip / Text'}</span>
                </button>
              </div>

              {/* Smart Paste Drawer */}
              {isSmartPasteOpen && (
                <div className="p-3.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-glass)] space-y-2.5 animate-in fade-in">
                  <label className="text-[11px] font-bold text-[var(--text-secondary)] block">
                    Paste text from ECI Result Card or Voter Slip:
                  </label>
                  <textarea
                    rows={3}
                    value={pastedEciText}
                    onChange={(e) => setPastedEciText(e.target.value)}
                    placeholder="Paste the copied text from electoralsearch.eci.gov.in here..."
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-glass)] text-xs text-[var(--text-primary)] font-mono resize-none focus:outline-none focus:border-[var(--accent)]"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={handleParseEciText}
                      disabled={!pastedEciText.trim()}
                      className="py-1 px-3 rounded-lg bg-[var(--accent)] text-white text-xs font-bold disabled:opacity-50 cursor-pointer"
                    >
                      Auto-Extract Fields
                    </button>
                  </div>
                </div>
              )}

              {/* Status Radio Choice: Record Found vs Record Not Found */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setEciRecordStatus('FOUND')}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    eciRecordStatus === 'FOUND'
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-800 dark:text-emerald-300 shadow-2xs'
                      : 'bg-[var(--bg-primary)] border-[var(--border-glass)] text-[var(--text-secondary)] hover:bg-[var(--bg-glass-elevated)]'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>
                    {language === 'hi'
                      ? '✓ ECI पोर्टल पर रिकॉर्ड मिल गया (सत्यापित)'
                      : '✓ Record Found on ECI Portal'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setEciRecordStatus('NOT_FOUND')}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    eciRecordStatus === 'NOT_FOUND'
                      ? 'bg-red-500/15 border-red-500 text-red-800 dark:text-red-300 shadow-2xs'
                      : 'bg-[var(--bg-primary)] border-[var(--border-glass)] text-[var(--text-secondary)] hover:bg-[var(--bg-glass-elevated)]'
                  }`}
                >
                  <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>
                    {language === 'hi'
                      ? '✗ ECI पोर्टल पर रिकॉर्ड नहीं मिला'
                      : '✗ No Record Found on ECI Portal'}
                  </span>
                </button>
              </div>

              {/* If Not Found is selected: Warning notice that voting is blocked */}
              {eciRecordStatus === 'NOT_FOUND' && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-700 dark:text-red-300 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                    <span>
                      {language === 'hi' ? 'मतदान की अनुमति नहीं है:' : 'Participation Not Permitted:'}
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    {language === 'hi'
                      ? 'यदि आपका मतदाता पहचान पत्र आधिकारिक ECI पोर्टल पर सक्रिय नहीं है, तो आप इस पोल में वोट नहीं दे सकते। फर्जी नंबरों से मतदान पूर्णतः प्रतिबंधित है।'
                      : 'If your Voter ID is not found on the official ECI Electoral Search portal, you cannot participate in this civic poll. Random or unregistered numbers are strictly blocked.'}
                  </p>
                </div>
              )}

              {/* If Found: Show details fields to confirm */}
              {eciRecordStatus === 'FOUND' && (
                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-[var(--text-secondary)] block">
                        {language === 'hi' ? 'मतदाता का नाम (ECI रिकॉर्ड अनुसार) *' : 'Voter Name (As shown on ECI) *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={voterName}
                        onChange={(e) => {
                          setVoterName(e.target.value);
                          if (error) setError(null);
                        }}
                        placeholder="e.g. Rajesh Kumar Sharma"
                        className="w-full px-3 py-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-glass)] text-xs font-semibold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-[var(--text-secondary)] block">
                        {language === 'hi' ? 'राज्य / केंद्र शासित प्रदेश *' : 'State / Union Territory *'}
                      </label>
                      <select
                        value={selectedState}
                        onChange={(e) => setSelectedState(e.target.value)}
                        className="w-full glass-select rounded-xl text-xs font-semibold"
                      >
                        <option value="">{language === 'hi' ? '-- राज्य चुनें --' : '-- Select State --'}</option>
                        {INDIAN_STATES.map((st) => (
                          <option key={st.id} value={st.id}>
                            {language === 'hi' ? st.name_hi : st.name_en} ({st.code})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-[var(--text-secondary)] block">
                        {language === 'hi' ? 'विधानसभा क्षेत्र (AC Name or No.) *' : 'Assembly Constituency (AC Name / No.) *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={assemblyConstituency}
                        onChange={(e) => {
                          setAssemblyConstituency(e.target.value);
                          if (error) setError(null);
                        }}
                        placeholder="e.g. 40 - New Delhi, Varanasi Cantt"
                        className="w-full px-3 py-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-glass)] text-xs font-semibold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-[var(--text-secondary)] block">
                        {language === 'hi' ? 'भाग संख्या एवं क्रम संख्या (Part & Sl. No.)' : 'Part No. & Serial No. (In Roll)'}
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={partNumber}
                          onChange={(e) => setPartNumber(e.target.value)}
                          placeholder="Part No. (e.g. 124)"
                          className="w-1/2 px-2.5 py-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-glass)] text-xs font-mono text-[var(--text-primary)]"
                        />
                        <input
                          type="text"
                          value={serialNumber}
                          onChange={(e) => setSerialNumber(e.target.value)}
                          placeholder="Sl. No. (e.g. 562)"
                          className="w-1/2 px-2.5 py-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-glass)] text-xs font-mono text-[var(--text-primary)]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* STEP 4: Anti-Bot Arithmetic Human Challenge */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-glass)] space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-1.5">
                  <Fingerprint className="w-4 h-4 text-[var(--accent)]" />
                  <span>
                    {language === 'hi'
                      ? '4. सुरक्षा सत्यापन (मानव जाँच) *'
                      : '4. Security Human Challenge *'}
                  </span>
                </label>

                <button
                  type="button"
                  onClick={generateNewMathChallenge}
                  className="p-1 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)] transition-colors cursor-pointer"
                  title="New calculation"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-4 py-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-glass)] font-mono font-black text-sm text-[var(--text-primary)] tracking-wider shrink-0 select-none">
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
                  placeholder={language === 'hi' ? 'उत्तर लिखें' : 'Answer'}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-glass)] text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                />
              </div>
            </div>

            {/* STEP 5: Explicit Voter Declaration Checkbox */}
            <label className="flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-glass)] cursor-pointer hover:border-[var(--accent)] active:bg-[var(--accent-soft)]/20 transition-colors select-none">
              <input
                type="checkbox"
                id="voter-declaration-checkbox"
                checked={isCheckedConfirmed}
                onChange={(e) => {
                  setIsCheckedConfirmed(e.target.checked);
                  if (error) setError(null);
                }}
                className="w-5 h-5 mt-0.5 rounded border-[var(--border-glass)] text-[var(--accent)] focus:ring-[var(--accent)] cursor-pointer shrink-0"
              />
              <span className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {language === 'hi' ? (
                  <>
                    मैं सत्यनिष्ठा से घोषणा करता/करती हूँ कि मैंने ECI पोर्टल (electoralsearch.eci.gov.in) पर अपना निर्वाचक विवरण सत्यापित किया है, यह मेरा असली मतदाता पहचान पत्र है, और मैं इस जनमत सर्वेक्षण में केवल एक बार अपना स्वतंत्र मत दर्ज कर रहा/रही हूँ।
                  </>
                ) : (
                  <>
                    I solemnly declare that I have verified my active electoral roll record on the official ECI portal (electoralsearch.eci.gov.in), this is my genuine Voter ID, and I am casting strictly my single, independent vote in this civic election.
                  </>
                )}
              </span>
            </label>

            {/* Error Message Display */}
            {error && (
              <div
                role="alert"
                className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-600 dark:text-red-400 flex items-start gap-2.5"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Verification Action */}
            <GlassButton
              type="submit"
              variant="primary"
              size="lg"
              disabled={
                isLoading ||
                !voterIdAnalysis.isValid ||
                eciRecordStatus !== 'FOUND' ||
                !isCheckedConfirmed
              }
              className="w-full justify-center gap-2 font-black text-sm sm:text-base py-3.5 shadow-md active:scale-98 transition-all"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>
                    {language === 'hi' ? 'क्रिप्टोग्राफिक सत्यापन प्रगति पर है...' : 'Verifying ECI Electoral Record...'}
                  </span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  <span>
                    {language === 'hi'
                      ? 'ECI रिकॉर्ड से सत्यापित करें एवं मतपत्र खोलें'
                      : 'Verify with ECI Record & Unlock Ballot'}
                  </span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </GlassButton>
          </form>
        )}

        {/* ── SUCCESS STATE VIEW ── */}
        {isSuccess && credential && (
          <div className="text-center space-y-5 py-4 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 border-2 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-2xl font-black text-[var(--text-primary)]">
                {language === 'hi' ? 'ECI मतदाता सत्यापन सफल!' : 'ECI Electoral Verification Successful!'}
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-md mx-auto">
                {language === 'hi'
                  ? 'आपका वास्तविक निर्वाचक रिकॉर्ड सत्यापित हो चुका है एवं एकल-मत लेजर पर दर्ज है। अब आप अपना गोपनीय मत दर्ज कर सकते हैं।'
                  : 'Your genuine electoral roll record has been verified and registered on the cryptographic single-vote ledger. Proceed to vote.'}
              </p>
            </div>

            <div className="pt-2">
              <GlassButton
                variant="primary"
                size="lg"
                onClick={() => onVerified(credential)}
                className="gap-2 font-bold px-8 shadow-md"
              >
                <span>{language === 'hi' ? 'मतदान की ओर आगे बढ़ें' : 'Proceed to Cast Ballot'}</span>
                <ArrowRight className="w-4 h-4" />
              </GlassButton>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
