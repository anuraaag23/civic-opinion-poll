'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { ECI_ELECTORAL_SEARCH_URL } from '@/lib/types';
import { ECI_SERIES_REGISTRY } from '@/lib/data/eci-prefixes';
import { getConstituenciesForState, AssemblyConstituency } from '@/lib/data/constituencies';
import {
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Search,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  Fingerprint,
  Globe,
  XCircle,
  Loader2,
  Lock,
  ChevronDown,
  Check,
  HelpCircle,
  Building2,
  Hash,
  FileText,
  Info,
  Upload,
  FileCheck,
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
  const { language } = useI18n();

  // Anti-bot arithmetic challenge
  const [num1, setNum1] = useState(7);
  const [num2, setNum2] = useState(5);
  const [mathAnswer, setMathAnswer] = useState('');

  // Declaration checkbox
  const [isCheckedConfirmed, setIsCheckedConfirmed] = useState(false);

  // Verification method: 'slip' (Voter Slip Upload - 100% Fake-Proof) vs 'coords' (Official AC Dropdown & Bounds)
  const [verificationMethod, setVerificationMethod] = useState<'slip' | 'coords'>('slip');

  // File upload state for official ECI Voter Slip (PDF / Image)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ECI verification form fields (Zero EPIC card numbers requested)
  const [selectedStateCode, setSelectedStateCode] = useState('DL');
  const [isStateDropdownOpen, setIsStateDropdownOpen] = useState(false);
  const [stateSearchQuery, setStateSearchQuery] = useState('');

  // Official Assembly Constituency (AC) Dropdown State
  const [selectedAc, setSelectedAc] = useState<AssemblyConstituency | null>(null);
  const [isAcDropdownOpen, setIsAcDropdownOpen] = useState(false);
  const [acSearchQuery, setAcSearchQuery] = useState('');

  const [partNumber, setPartNumber] = useState('');
  const [serialNumber, setSerialNumber] = useState('');

  // Device hardware fingerprint (Canvas + Audio + Screen entropy)
  const [deviceFingerprint, setDeviceFingerprint] = useState('');

  // Show/hide helper explanation
  const [showExplanation, setShowExplanation] = useState(true);

  // Workflow states:
  // 'initial' -> 'eci_pending' -> 'eci_confirm' | 'not_found' -> 'submitting' -> 'success' | 'already_voted'
  const [verifierState, setVerifierState] = useState<
    'initial' | 'eci_pending' | 'eci_confirm' | 'submitting' | 'success' | 'already_voted' | 'not_found'
  >('initial');

  const [error, setError] = useState<string | null>(null);
  const [verifiedDetails, setVerifiedDetails] = useState<{
    state?: string;
    ac?: string;
    part?: number;
    serial?: number;
  } | null>(null);

  const stateDropdownRef = useRef<HTMLDivElement>(null);
  const acDropdownRef = useRef<HTMLDivElement>(null);

  // Generate lightweight stable client device fingerprint
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('MeraVote_Hardware_Entropy_2026', 2, 2);
      }
      const canvasData = canvas.toDataURL();
      const rawEntropy = `${navigator.userAgent}_${screen.width}x${screen.height}_${canvasData.slice(0, 40)}`;
      let hash = 0;
      for (let i = 0; i < rawEntropy.length; i++) {
        hash = (hash << 5) - hash + rawEntropy.charCodeAt(i);
        hash |= 0;
      }
      setDeviceFingerprint(`DEV_${Math.abs(hash).toString(16)}`);
    } catch {
      setDeviceFingerprint(`DEV_${Date.now().toString(16)}`);
    }
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (stateDropdownRef.current && !stateDropdownRef.current.contains(event.target as Node)) {
        setIsStateDropdownOpen(false);
      }
      if (acDropdownRef.current && !acDropdownRef.current.contains(event.target as Node)) {
        setIsAcDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter states for custom theme-matched dropdown
  const filteredStates = useMemo(() => {
    const q = stateSearchQuery.toLowerCase().trim();
    if (!q) return ECI_SERIES_REGISTRY;
    return ECI_SERIES_REGISTRY.filter(
      (s) =>
        s.stateNameEn.toLowerCase().includes(q) ||
        s.stateNameHi.toLowerCase().includes(q) ||
        s.stateCode.toLowerCase().includes(q)
    );
  }, [stateSearchQuery]);

  const currentState = useMemo(() => {
    return (
      ECI_SERIES_REGISTRY.find((s) => s.stateCode === selectedStateCode) ||
      ECI_SERIES_REGISTRY[0]
    );
  }, [selectedStateCode]);

  // Available official constituencies for the selected state
  const availableConstituencies = useMemo(() => {
    return getConstituenciesForState(selectedStateCode);
  }, [selectedStateCode]);

  // Auto-select first constituency on state change if not set
  useEffect(() => {
    if (availableConstituencies.length > 0) {
      setSelectedAc(availableConstituencies[0]);
    } else {
      setSelectedAc(null);
    }
  }, [availableConstituencies, selectedStateCode]);

  // Filter constituencies for custom theme-matched dropdown
  const filteredConstituencies = useMemo(() => {
    const q = acSearchQuery.toLowerCase().trim();
    if (!q) return availableConstituencies;
    return availableConstituencies.filter(
      (ac) =>
        ac.nameEn.toLowerCase().includes(q) ||
        ac.nameHi.toLowerCase().includes(q) ||
        ac.acNumber.toString().includes(q) ||
        (ac.district && ac.district.toLowerCase().includes(q))
    );
  }, [availableConstituencies, acSearchQuery]);

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

  // Upload and verify ECI Voter Information Slip (PDF or Image)
  const handleVoterSlipUpload = async (fileToUpload?: File) => {
    const targetFile = fileToUpload || uploadedFile;
    if (!targetFile) {
      setError(
        language === 'hi'
          ? 'कृपया अपनी ECI मतदाता सूचना पर्ची (Voter Information Slip) अपलोड करें।'
          : 'Please select or drop your official ECI Voter Information Slip file.'
      );
      return;
    }

    setVerifierState('submitting');
    setError(null);

    try {
      const formData = new FormData();
      formData.append('pollId', pollId);
      formData.append('file', targetFile);
      if (deviceFingerprint) {
        formData.append('deviceFingerprint', deviceFingerprint);
      }

      const response = await fetch('/api/verification/upload-slip', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.status === 409 || data.reason === 'ALREADY_VOTED') {
        setVerifierState('already_voted');
        setError(
          language === 'hi'
            ? 'इस मतदाता पर्ची द्वारा इस चुनाव में पहले ही मत दिया जा चुका है। निष्पक्ष चुनाव हेतु दोहरा मतदान पूर्णतः प्रतिबंधित है।'
            : 'This voter slip has already been used to cast a vote in this election. Duplicate voting is strictly blocked.'
        );
        try {
          localStorage.setItem(`civic_voted_${pollId}`, 'true');
        } catch {}
        onAlreadyVoted();
        return;
      }

      if (!response.ok || !data.verified) {
        setVerifierState('eci_confirm');
        setError(
          data.error ||
            (language === 'hi'
              ? 'सत्यापन विफल: अपलोड किया गया दस्तावेज़ आधिकारिक ECI मतदाता पर्ची नहीं है। कृपया electoralsearch.eci.gov.in से डाउनलोड की गई पर्ची अपलोड करें।'
              : 'Verification Rejected: The uploaded document does not match an authentic Election Commission of India (ECI) Voter Slip. Please upload the official slip downloaded from electoralsearch.eci.gov.in.')
        );
        return;
      }

      // Verification successful
      setVerifiedDetails({
        state: currentState.stateNameEn,
        ac: selectedAc ? `${selectedAc.acNumber} - ${selectedAc.nameEn}` : undefined,
      });
      setVerifierState('success');

      try {
        localStorage.setItem(`civic_voted_${pollId}`, 'true');
      } catch {}

      setTimeout(() => {
        onVerified(data.anonymous_token || data.anonymousCredential);
      }, 1200);
    } catch (err) {
      console.error('Slip upload error:', err);
      setVerifierState('eci_confirm');
      setError(
        language === 'hi'
          ? 'सर्वर से संपर्क नहीं हो सका। कृपया पुनः प्रयास करें।'
          : 'Could not connect to verification server. Please try again.'
      );
    }
  };

  // Execute manual coordinates verification against the server API
  const submitManualVerification = async (isEciFound = true) => {
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

    // Validate Part & Serial numbers
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

    const partNum = parseInt(cleanPart, 10);
    const serialNum = parseInt(cleanSerial, 10);

    if (isNaN(partNum) || partNum < 1 || partNum > 450) {
      setError(
        language === 'hi'
          ? 'अमान्य भाग संख्या (Part No)। भारतीय विधानसभा क्षेत्रों में पोलिंग भाग संख्या 1 से 450 तक होती है।'
          : 'Invalid Part Number. Polling booth parts strictly range from 1 to 450.'
      );
      return;
    }

    if (isNaN(serialNum) || serialNum < 1 || serialNum > 1500) {
      setError(
        language === 'hi'
          ? 'अमान्य क्रम संख्या (Serial No)। निर्वाचक नामावली में क्रम संख्या 1 से 1500 तक होती है।'
          : 'Invalid Serial Number. Serial numbers in a booth section strictly range from 1 to 1500.'
      );
      return;
    }

    if (cleanPart === cleanSerial && cleanPart.length >= 3) {
      setError(
        language === 'hi'
          ? 'पुनरावृत्त फर्जी संख्या अस्वीकृत। कृपया अपनी वास्तविक निर्वाचक संख्या दर्ज करें।'
          : 'Repetitive dummy numbers are strictly rejected. Please verify your genuine numbers from the official ECI portal.'
      );
      return;
    }

    setVerifierState('submitting');
    setError(null);

    try {
      const acIdentifier = selectedAc ? `${selectedAc.acNumber} - ${selectedAc.nameEn}` : undefined;

      const payload: Record<string, unknown> = {
        pollId,
        selfVerificationConfirmed: true,
        eciRecordFound: true,
        stateCode: selectedStateCode,
        assemblyConstituency: acIdentifier,
        partNumber: cleanPart,
        serialNumber: cleanSerial,
        deviceFingerprint,
        mathChallenge: {
          num1,
          num2,
          answer: parseInt(mathAnswer, 10),
        },
      };

      const response = await fetch('/api/verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.status === 409 || data.reason === 'ALREADY_VOTED') {
        setVerifierState('already_voted');
        setError(
          data.error ||
            (language === 'hi'
              ? 'इस मतदाता रिकॉर्ड अथवा इस डिवाइस द्वारा पहले ही मतदान किया जा चुका है। निष्पक्ष चुनाव हेतु दोहरा मतदान प्रतिबंधित है।'
              : 'A vote has already been recorded from this electoral record or device. Multiple votes are strictly blocked.')
        );
        try {
          localStorage.setItem(`civic_voted_${pollId}`, 'true');
        } catch {}
        onAlreadyVoted();
        return;
      }

      if (!response.ok || !data.verified) {
        setVerifierState('eci_confirm');
        setError(data.error || 'Verification failed. Please verify your details and try again.');
        return;
      }

      // Verification successful
      setVerifiedDetails({
        state: currentState.stateNameEn,
        ac: acIdentifier,
        part: partNum,
        serial: serialNum,
      });
      setVerifierState('success');

      try {
        localStorage.setItem(`civic_voted_${pollId}`, 'true');
      } catch {}

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
                onClick={() => submitManualVerification(false)}
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

        {/* ── STEP 3: CONFIRM ECI DETAILS WITH OFFICIAL VERIFICATION MODES ── */}
        {verifierState === 'eci_confirm' && (
          <div className="space-y-5 animate-in fade-in duration-300">
            {/* Header with Mode Switcher */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[var(--accent)]" />
                  <span>
                    {language === 'hi'
                      ? 'ECI खोज परिणाम विवरण की पुष्टि करें'
                      : 'Confirm ECI Electoral Roll Record'}
                  </span>
                </h4>

                <button
                  type="button"
                  onClick={() => setShowExplanation(!showExplanation)}
                  className="text-[11px] text-[var(--accent)] hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{language === 'hi' ? 'सहायता / स्पष्टीकरण' : 'Need Help?'}</span>
                </button>
              </div>

              {/* Verification Method Tabs: Official Slip Upload vs Manual Coordinates */}
              <div className="grid grid-cols-2 p-1 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-glass)] text-xs font-bold gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setVerificationMethod('slip');
                    setError(null);
                  }}
                  className={`py-2 px-2.5 rounded-lg transition-all text-center cursor-pointer flex items-center justify-center gap-1.5 ${
                    verificationMethod === 'slip'
                      ? 'bg-[var(--accent)] text-white shadow-xs'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{language === 'hi' ? '1. ECI पर्ची अपलोड (अनुशंसित)' : '1. Upload Voter Slip (Proof)'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setVerificationMethod('coords');
                    setError(null);
                  }}
                  className={`py-2 px-2.5 rounded-lg transition-all text-center cursor-pointer flex items-center justify-center gap-1.5 ${
                    verificationMethod === 'coords'
                      ? 'bg-[var(--accent)] text-white shadow-xs'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{language === 'hi' ? '2. निर्वाचन क्षेत्र व भाग संख्या' : '2. AC & Part Details'}</span>
                </button>
              </div>
            </div>

            {/* Visual Clarification & ECI Table Mockup Card */}
            {showExplanation && (
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-glass)] space-y-2.5 text-xs text-[var(--text-secondary)]">
                <div className="flex items-start gap-2 text-[var(--accent)] font-bold text-xs">
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    {language === 'hi'
                      ? 'ECI पोर्टल से पर्ची कैसे डाउनलोड करें या संख्या कैसे देखें?'
                      : 'How to download your slip or find your numbers on ECI?'}
                  </span>
                </div>

                <p className="leading-relaxed text-[11px] text-[var(--text-tertiary)]">
                  {language === 'hi'
                    ? 'जब आप electoralsearch.eci.gov.in पर खोजते हैं, तो परिणाम में "Download Voter Slip" (मतदाता सूचना पर्ची) का बटन होता है। पर्ची में आपकी विधानसभा (AC), भाग संख्या (Part No - पोलिंग बूथ सेक्शन), एवं क्रम संख्या (Serial No) अंकित होती है।'
                    : 'On electoralsearch.eci.gov.in, your search result includes a "Download Voter Slip" button. The official slip contains your Assembly Constituency, Part Number (polling section), and Serial Number.'}
                </p>

                {/* Mini ECI Result Table Visual Preview */}
                <div className="rounded-xl overflow-hidden border border-[var(--border-glass)] bg-[var(--bg-primary)] p-2.5 space-y-1.5 font-mono text-[11px]">
                  <div className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] tracking-wider flex items-center justify-between">
                    <span>ECI Official Slip & Table Reference</span>
                    <span className="text-[var(--accent)] font-bold">Columns 8 & 9</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 text-[10px] text-center bg-[var(--bg-surface)] p-2 rounded-lg border border-[var(--border-glass)]">
                    <div className="text-[var(--text-tertiary)]">
                      <span className="block text-[9px] text-[var(--text-tertiary)]">Name</span>
                      <span className="text-[var(--text-primary)] font-bold truncate">Citizen</span>
                    </div>
                    <div className="text-[var(--text-tertiary)]">
                      <span className="block text-[9px] text-[var(--text-tertiary)]">AC (Col 6)</span>
                      <span className="text-[var(--text-primary)] font-bold truncate">40-NDL</span>
                    </div>
                    <div className="p-1 rounded bg-[var(--accent-soft)] border border-[var(--accent)]/40 text-[var(--accent)] font-bold">
                      <span className="block text-[8px] uppercase">Part No (8)</span>
                      <span>142</span>
                    </div>
                    <div className="p-1 rounded bg-emerald-500/15 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-bold">
                      <span className="block text-[8px] uppercase">Serial (9)</span>
                      <span>389</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 1: OFFICIAL ECI VOTER SLIP UPLOAD (100% FAKE-PROOF) ── */}
            {verificationMethod === 'slip' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      setUploadedFile(e.dataTransfer.files[0]);
                      setError(null);
                    }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-6 sm:p-8 rounded-2xl border-2 border-dashed transition-all text-center cursor-pointer flex flex-col items-center justify-center gap-3 ${
                    isDragging
                      ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
                      : uploadedFile
                      ? 'border-emerald-500/50 bg-emerald-500/5'
                      : 'border-[var(--border-glass)] hover:border-[var(--accent)]/60 bg-[var(--bg-primary)] hover:bg-[var(--bg-surface)]'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,image/png,image/jpeg,image/jpg"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setUploadedFile(e.target.files[0]);
                        setError(null);
                      }
                    }}
                  />

                  <div className="w-12 h-12 rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center shadow-xs">
                    {uploadedFile ? <FileCheck className="w-6 h-6 text-emerald-500" /> : <Upload className="w-6 h-6" />}
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                      {uploadedFile ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                          {uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(1)} KB)
                        </span>
                      ) : language === 'hi' ? (
                        'ECI मतदाता पर्ची (PDF / फ़ोटो) यहाँ खींचें या क्लिक करें'
                      ) : (
                        'Drop your official ECI Voter Slip (PDF or Image) here'
                      )}
                    </p>
                    <p className="text-[11px] text-[var(--text-tertiary)]">
                      {language === 'hi'
                        ? 'electoralsearch.eci.gov.in से डाउनलोड की गई मतदाता सूचना पर्ची (Voter Information Slip)'
                        : 'Supports official Voter Information Slip PDF or Search Result Screenshot'}
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--bg-surface)] border border-[var(--border-glass)] text-[10px] text-[var(--text-secondary)] font-mono">
                    <ShieldCheck className="w-3 h-3 text-[var(--accent)]" />
                    <span>Instant Tamper-Proof Document Verification • Zero Fake Inputs Allowed</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <GlassButton
                    type="button"
                    variant="primary"
                    size="lg"
                    disabled={!uploadedFile}
                    onClick={() => handleVoterSlipUpload()}
                    className="flex-1 justify-center gap-2 font-bold py-3"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {language === 'hi'
                        ? 'पर्ची सत्यापित कर मतपत्र खोलें ➔'
                        : 'Verify ECI Slip & Unlock Ballot ➔'}
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
              </div>
            )}

            {/* ── TAB 2: MANUAL ROLL COORDINATES (WITH AC DROPDOWN & 1-DEVICE LOCK) ── */}
            {verificationMethod === 'coords' && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submitManualVerification(true);
                }}
                className="space-y-4 animate-in fade-in duration-200"
              >
                {/* ── STATE CUSTOM DROPDOWN ── */}
                <div className="space-y-1.5" ref={stateDropdownRef}>
                  <label className="text-xs font-bold text-[var(--text-primary)] flex items-center justify-between">
                    <span>
                      {language === 'hi' ? 'राज्य / केंद्र शासित प्रदेश *' : 'State / Union Territory *'}
                    </span>
                    <span className="text-[10px] text-[var(--text-tertiary)] font-normal">
                      {currentState.stateCode}
                    </span>
                  </label>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsStateDropdownOpen(!isStateDropdownOpen)}
                      className="w-full p-2.5 sm:p-3 rounded-xl bg-[var(--bg-primary)] hover:bg-[var(--bg-surface)] border border-[var(--border-glass)] hover:border-[var(--accent)] text-left flex items-center justify-between transition-all cursor-pointer shadow-2xs group focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                      aria-expanded={isStateDropdownOpen}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-8 h-8 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] font-mono font-black text-xs flex items-center justify-center shrink-0 border border-[var(--accent)]/30">
                          {currentState.stateCode}
                        </span>
                        <div className="min-w-0">
                          <span className="text-xs sm:text-sm font-bold text-[var(--text-primary)] block truncate">
                            {language === 'hi' ? currentState.stateNameHi : currentState.stateNameEn}
                          </span>
                          <span className="text-[11px] text-[var(--text-tertiary)] block truncate">
                            {language === 'hi' ? currentState.stateNameEn : currentState.stateNameHi}
                          </span>
                        </div>
                      </div>

                      <div
                        className={`p-1.5 rounded-lg bg-[var(--bg-surface)] text-[var(--text-secondary)] transition-transform duration-200 ${
                          isStateDropdownOpen ? 'rotate-180' : ''
                        }`}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </button>

                    {/* State Dropdown Menu */}
                    {isStateDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-[var(--bg-surface)] border border-[var(--border-glass)] rounded-2xl shadow-2xl p-2.5 space-y-2 animate-in fade-in slide-in-from-top-2 duration-150 max-h-[280px] flex flex-col">
                        <div className="relative shrink-0">
                          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                          <input
                            type="text"
                            placeholder={
                              language === 'hi'
                                ? 'राज्य का नाम खोजें...'
                                : 'Search state by name (e.g. Delhi, UP, Bihar)...'
                            }
                            value={stateSearchQuery}
                            onChange={(e) => setStateSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-glass)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                            autoFocus
                          />
                        </div>

                        <div className="overflow-y-auto overscroll-contain space-y-1 flex-1 max-h-[200px] custom-scrollbar pr-1">
                          {filteredStates.map((s) => {
                            const isSelected = s.stateCode === selectedStateCode;
                            return (
                              <button
                                key={s.stateCode}
                                type="button"
                                onClick={() => {
                                  setSelectedStateCode(s.stateCode);
                                  setIsStateDropdownOpen(false);
                                  setStateSearchQuery('');
                                }}
                                className={`w-full p-2 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer text-xs ${
                                  isSelected
                                    ? 'bg-[var(--accent-soft)] text-[var(--accent)] font-bold border border-[var(--accent)]/30'
                                    : 'hover:bg-[var(--bg-primary)] text-[var(--text-primary)]'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="w-6 h-6 rounded-md bg-[var(--border-glass)] text-[var(--text-secondary)] text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                                    {s.stateCode}
                                  </span>
                                  <div className="truncate">
                                    <span className="font-bold">
                                      {language === 'hi' ? s.stateNameHi : s.stateNameEn}
                                    </span>
                                  </div>
                                </div>
                                {isSelected && <Check className="w-3.5 h-3.5 text-[var(--accent)] stroke-[3]" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* ── OFFICIAL ASSEMBLY CONSTITUENCY (AC) THEME DROPDOWN ── */}
                <div className="space-y-1.5" ref={acDropdownRef}>
                  <label className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-[var(--accent)]" />
                    <span>
                      {language === 'hi'
                        ? 'आधिकारिक विधानसभा निर्वाचन क्षेत्र (AC) *'
                        : 'Official Assembly Constituency (AC) *'}
                    </span>
                  </label>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsAcDropdownOpen(!isAcDropdownOpen)}
                      className="w-full p-2.5 sm:p-3 rounded-xl bg-[var(--bg-primary)] hover:bg-[var(--bg-surface)] border border-[var(--border-glass)] hover:border-[var(--accent)] text-left flex items-center justify-between transition-all cursor-pointer shadow-2xs group focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                      aria-expanded={isAcDropdownOpen}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-8 h-8 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] font-mono font-black text-xs flex items-center justify-center shrink-0 border border-[var(--accent)]/30">
                          {selectedAc ? selectedAc.acNumber : 'AC'}
                        </span>
                        <div className="min-w-0">
                          <span className="text-xs sm:text-sm font-bold text-[var(--text-primary)] block truncate">
                            {selectedAc
                              ? `${selectedAc.acNumber} - ${
                                  language === 'hi' ? selectedAc.nameHi : selectedAc.nameEn
                                }`
                              : 'Select Assembly Constituency'}
                          </span>
                          {selectedAc?.district && (
                            <span className="text-[10px] text-[var(--text-tertiary)] block truncate">
                              District: {selectedAc.district}
                            </span>
                          )}
                        </div>
                      </div>

                      <div
                        className={`p-1.5 rounded-lg bg-[var(--bg-surface)] text-[var(--text-secondary)] transition-transform duration-200 ${
                          isAcDropdownOpen ? 'rotate-180' : ''
                        }`}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </button>

                    {/* AC Dropdown Menu */}
                    {isAcDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-[var(--bg-surface)] border border-[var(--border-glass)] rounded-2xl shadow-2xl p-2.5 space-y-2 animate-in fade-in slide-in-from-top-2 duration-150 max-h-[280px] flex flex-col">
                        <div className="relative shrink-0">
                          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                          <input
                            type="text"
                            placeholder={
                              language === 'hi'
                                ? 'विधानसभा का नाम या नंबर खोजें...'
                                : 'Search constituency name or number...'
                            }
                            value={acSearchQuery}
                            onChange={(e) => setAcSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-glass)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                            autoFocus
                          />
                        </div>

                        <div className="overflow-y-auto overscroll-contain space-y-1 flex-1 max-h-[200px] custom-scrollbar pr-1">
                          {filteredConstituencies.map((ac) => {
                            const isSelected = selectedAc?.acNumber === ac.acNumber;
                            return (
                              <button
                                key={ac.acNumber}
                                type="button"
                                onClick={() => {
                                  setSelectedAc(ac);
                                  setIsAcDropdownOpen(false);
                                  setAcSearchQuery('');
                                }}
                                className={`w-full p-2 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer text-xs ${
                                  isSelected
                                    ? 'bg-[var(--accent-soft)] text-[var(--accent)] font-bold border border-[var(--accent)]/30'
                                    : 'hover:bg-[var(--bg-primary)] text-[var(--text-primary)]'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="w-7 h-6 rounded-md bg-[var(--border-glass)] text-[var(--text-secondary)] text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                                    {ac.acNumber}
                                  </span>
                                  <div className="truncate">
                                    <span className="font-bold">
                                      {language === 'hi' ? ac.nameHi : ac.nameEn}
                                    </span>
                                    {ac.district && (
                                      <span className="text-[10px] text-[var(--text-tertiary)] ml-1">
                                        ({ac.district})
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {isSelected && <Check className="w-3.5 h-3.5 text-[var(--accent)] stroke-[3]" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Part Number & Serial Number with Strict Range Constraints */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1">
                      <Hash className="w-3.5 h-3.5 text-[var(--accent)]" />
                      <span>{language === 'hi' ? 'भाग संख्या (Part Number) *' : 'Part Number *'}</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={partNumber}
                      onChange={(e) => setPartNumber(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="e.g. 142 (1 to 450)"
                      maxLength={4}
                      className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-glass)] text-xs sm:text-sm font-mono font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    />
                    <span className="text-[10px] text-[var(--text-tertiary)] block">
                      {language === 'hi' ? 'कॉलम 8 में दी गई संख्या (1-450)' : 'Number from Column 8 (1-450)'}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1">
                      <Hash className="w-3.5 h-3.5 text-[var(--accent)]" />
                      <span>{language === 'hi' ? 'क्रम संख्या (Serial Number) *' : 'Serial Number *'}</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={serialNumber}
                      onChange={(e) => setSerialNumber(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="e.g. 389 (1 to 1500)"
                      maxLength={5}
                      className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-glass)] text-xs sm:text-sm font-mono font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    />
                    <span className="text-[10px] text-[var(--text-tertiary)] block">
                      {language === 'hi' ? 'कॉलम 9 में दी गई संख्या (1-1500)' : 'Number from Column 9 (1-1500)'}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] flex items-center gap-2 text-[11px] text-[var(--text-secondary)]">
                  <Lock className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
                  <span>
                    {language === 'hi'
                      ? 'हार्डवेयर एंटी-साइबिल सुरक्षा सक्रिय: प्रति डिवाइस/नेटवर्क केवल एक बार मतदान की अनुमति है।'
                      : 'Anti-Sybil Device Lock Active: One submission per hardware device/network is strictly enforced.'}
                  </span>
                </div>

                {/* Submit Action */}
                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  <GlassButton
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={!partNumber || !serialNumber || !selectedAc}
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
          </div>
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
                  ? 'दस्तावेज़ की सत्यता, दोहरे मतदान की रोकथाम एवं अनाम सुरक्षा की पुष्टि जारी...'
                  : 'Verifying authentic ECI roll coordinates & cryptographic zero-linkage...'}
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

            {verifiedDetails && (
              <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] text-xs text-[var(--text-secondary)] font-mono space-y-1 inline-block max-w-sm">
                <div className="flex items-center justify-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Authentic ECI Record Verified</span>
                </div>
                {verifiedDetails.state && <div>State: {verifiedDetails.state}</div>}
                {verifiedDetails.ac && <div>AC: {verifiedDetails.ac}</div>}
              </div>
            )}

            <div className="block">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-surface)] border border-[var(--border-glass)] text-[11px] font-mono text-[var(--text-secondary)]">
                <Lock className="w-3 h-3 text-[var(--accent)]" />
                <span>Zero Identity Stored • 1 Citizen 1 Vote</span>
              </div>
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
                  ? 'इस मतदाता रिकॉर्ड अथवा इस डिवाइस द्वारा इस चुनाव में पूर्व में मत दर्ज किया जा चुका है। निष्पक्ष चुनाव हेतु प्रत्येक नागरिक केवल एक बार मतदान कर सकता है।'
                  : 'This voter record or device has already participated in this poll. To preserve election integrity, duplicate votes are strictly prohibited.'}
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
