'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { DisclaimerBanner } from '@/components/layout/DisclaimerBanner';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassBadge } from '@/components/ui/GlassBadge';
import { OFFICIAL_PARTIES, INDIAN_STATES, IndianState, Party } from '@/lib/data/parties';
import { Poll, OptionResult, SiteSettings, AuditEvent, DbSupporter } from '@/lib/types';
import {
  ShieldCheck,
  Users,
  Vote,
  AlertTriangle,
  Lock,
  Layers,
  RefreshCw,
  Settings,
  Coffee,
  Download,
  Plus,
  Trash2,
  Edit3,
  XCircle,
  Sliders,
  Bell,
  Radio,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Star,
  KeyRound,
  LogOut,
  Save,
  Check,
  AlertCircle,
  Info,
  Upload,
  Image as ImageIcon,
  Languages,
  Sparkles,
  Search,
} from 'lucide-react';
import { translateEnToHi, translateHiToEn } from '@/lib/utils/translation';

interface DetailedPoll extends Poll {
  optionResults?: OptionResult[];
}

interface AdminStats {
  totalVerified: number;
  totalResponses: number;
  totalFailures: number;
  partiesCount: number;
  activePollsCount: number;
  lastUpdated: string;
}

export function AdminClient() {
  const { language } = useI18n();

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    'overview' | 'polls' | 'settings' | 'supporters' | 'parties' | 'export'
  >('overview');

  // Core Data
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [polls, setPolls] = useState<DetailedPoll[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [supporters, setSupporters] = useState<DbSupporter[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  // Poll Editing & Inspection State
  const [selectedPollId, setSelectedPollId] = useState<string | null>(null);
  const [expandedPollTallyId, setExpandedPollTallyId] = useState<string | null>(null);
  const [editingPoll, setEditingPoll] = useState<DetailedPoll | null>(null);
  const [isSavingPoll, setIsSavingPoll] = useState(false);

  // New Poll Creation State
  const [isCreatingPoll, setIsCreatingPoll] = useState(false);
  const [autoTranslateEnabled, setAutoTranslateEnabled] = useState(true);
  const [newPollTitleEn, setNewPollTitleEn] = useState('');
  const [newPollTitleHi, setNewPollTitleHi] = useState('');
  const [newPollSlug, setNewPollSlug] = useState('');
  const [newPollDescEn, setNewPollDescEn] = useState('');
  const [newPollDescHi, setNewPollDescHi] = useState('');
  const [newPollStatus, setNewPollStatus] = useState<Poll['status']>('LIVE');
  const [newPollVisibility, setNewPollVisibility] = useState<Poll['results_visibility']>('PUBLIC');
  const [newPollVotingPolicy, setNewPollVotingPolicy] = useState<'STRICT_SINGLE_VOTE' | 'ALLOW_ONE_REVOTE' | 'ALLOW_MULTIPLE_VOTES'>('STRICT_SINGLE_VOTE');
  const [newPollMaxVotes, setNewPollMaxVotes] = useState<number>(1);
  const [newPollPartyIds, setNewPollPartyIds] = useState<string[]>(['party-bjp', 'party-inc', 'party-aap', 'party-sp']);

  // Parties directory & dedicated party creation state
  const [allParties, setAllParties] = useState<Party[]>(OFFICIAL_PARTIES);
  const [partySearchQuery, setPartySearchQuery] = useState('');
  const [isAddingPartyModal, setIsAddingPartyModal] = useState(false);
  const [createPartyNameEn, setCreatePartyNameEn] = useState('');
  const [createPartyNameHi, setCreatePartyNameHi] = useState('');
  const [createPartyShort, setCreatePartyShort] = useState('');
  const [createPartyColor, setCreatePartyColor] = useState('#3B82F6');
  const [createPartyLogo, setCreatePartyLogo] = useState('');
  const [isSavingParty, setIsSavingParty] = useState(false);

  // Custom Options & Party Logo Upload State
  interface CustomPartyDraft {
    id: string;
    name_en: string;
    name_hi: string;
    short_name: string;
    logo_url: string;
    color: string;
  }
  const [customParties, setCustomParties] = useState<CustomPartyDraft[]>([]);
  const [newPartyNameEn, setNewPartyNameEn] = useState('');
  const [newPartyNameHi, setNewPartyNameHi] = useState('');
  const [newPartyShort, setNewPartyShort] = useState('');
  const [newPartyLogo, setNewPartyLogo] = useState('');
  const [newPartyColor, setNewPartyColor] = useState('#1D4ED8');

  // Settings State
  const [tempSettings, setTempSettings] = useState<SiteSettings | null>(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Vote tally edit map: pollId -> optionId -> count
  const [tallyInputs, setTallyInputs] = useState<Record<string, Record<string, number>>>({});

  // Confirm Reset modal
  const [resetModalPollId, setResetModalPollId] = useState<string | null>(null);

  // Check existing session
  useEffect(() => {
    let isMounted = true;
    Promise.resolve().then(() => {
      if (!isMounted) return;
      const savedSession = sessionStorage.getItem('meravote_admin_auth');
      if (savedSession === 'true') {
        setIsAuthenticated(true);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const showToast = (msg: string, isError = false) => {
    if (isError) {
      setErrorToast(msg);
      setTimeout(() => setErrorToast(null), 4000);
    } else {
      setSuccessToast(msg);
      setTimeout(() => setSuccessToast(null), 4000);
    }
  };

  // Data Fetchers
  const fetchAllData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [statsRes, pollsRes, settingsRes, supportersRes, auditRes, partiesRes] = await Promise.all([
        fetch('/api/admin/stats').catch(() => null),
        fetch('/api/admin/polls').catch(() => null),
        fetch('/api/admin/settings').catch(() => null),
        fetch('/api/admin/supporters').catch(() => null),
        fetch('/api/admin/audit?limit=40').catch(() => null),
        fetch('/api/admin/parties').catch(() => null),
      ]);

      if (statsRes?.status === 401) {
        setIsAuthenticated(false);
        sessionStorage.removeItem('meravote_admin_auth');
        sessionStorage.removeItem('meravote_admin_token');
        return;
      }

      if (statsRes?.ok) {
        const d = await statsRes.json();
        if (d.success) setStats(d.data);
      }

      if (partiesRes?.ok) {
        const d = await partiesRes.json();
        if (d.success && Array.isArray(d.parties)) {
          setAllParties(d.parties);
        }
      }

      if (pollsRes?.ok) {
        const d = await pollsRes.json();
        if (d.success && Array.isArray(d.data)) {
          setPolls(d.data);
          // populate tally inputs
          const map: Record<string, Record<string, number>> = {};
          d.data.forEach((p: DetailedPoll) => {
            map[p.id] = {};
            if (p.optionResults) {
              p.optionResults.forEach((opt) => {
                map[p.id][opt.option_id] = opt.count;
              });
            }
          });
          setTallyInputs(map);
        }
      }

      if (settingsRes?.ok) {
        const d = await settingsRes.json();
        if (d.success && d.data) {
          setSettings(d.data);
          setTempSettings(d.data);
        }
      }

      if (supportersRes?.ok) {
        const d = await supportersRes.json();
        if (d.success && Array.isArray(d.data)) {
          setSupporters(d.data);
        }
      }

      if (auditRes?.ok) {
        const d = await auditRes.json();
        if (d.success && Array.isArray(d.data)) {
          setAuditEvents(d.data);
        }
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    if (isAuthenticated) {
      Promise.resolve().then(() => {
        if (isMounted) fetchAllData();
      });
    }
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, fetchAllData]);

  // Handle Passcode Unlock
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsAuthenticating(true);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode }),
      });
      const data = await res.json();

      if (data.success) {
        if (data.token) {
          sessionStorage.setItem('meravote_admin_token', data.token);
        }
        sessionStorage.setItem('meravote_admin_auth', 'true');
        setIsAuthenticated(true);
        showToast(language === 'hi' ? 'व्यवस्थापक पैनल अनलॉक हो गया' : 'Admin Panel Unlocked');
      } else {
        setAuthError(
          data.error ||
          (language === 'hi'
            ? 'अमान्य व्यवस्थापक पासकोड। पहुंच अस्वीकृत।'
            : 'Invalid administrative passcode. Access denied.')
        );
      }
    } catch {
      setAuthError('Authentication server error');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSignOut = () => {
    sessionStorage.removeItem('meravote_admin_auth');
    setIsAuthenticated(false);
    setPasscode('');
  };

  // Poll Management Handlers
  const handleTogglePollStatus = async (pollId: string, currentStatus: Poll['status']) => {
    const nextStatus: Poll['status'] =
      currentStatus === 'LIVE' ? 'PAUSED' : currentStatus === 'PAUSED' ? 'CLOSED' : 'LIVE';
    try {
      const res = await fetch('/api/admin/polls', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_status', pollId, status: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Poll status set to ${nextStatus}`);
        fetchAllData();
      } else {
        showToast(data.error || 'Failed to update status', true);
      }
    } catch {
      showToast('Error updating poll status', true);
    }
  };

  const handleSavePollDetails = async () => {
    if (!editingPoll) return;
    setIsSavingPoll(true);
    try {
      const res = await fetch('/api/admin/polls', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_details',
          pollId: editingPoll.id,
          title_en: editingPoll.title_en,
          title_hi: editingPoll.title_hi,
          description_en: editingPoll.description_en,
          description_hi: editingPoll.description_hi,
          status: editingPoll.status,
          end_at: editingPoll.end_at,
          results_visibility: editingPoll.results_visibility,
          voting_policy: editingPoll.voting_policy,
          max_votes_per_citizen: editingPoll.max_votes_per_citizen,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(language === 'hi' ? 'पोल विवरण सफलतापूर्वक सहेजा गया' : 'Poll details updated successfully');
        setEditingPoll(null);
        fetchAllData();
      } else {
        showToast(data.error || 'Failed to update poll', true);
      }
    } catch {
      showToast('Error saving poll details', true);
    } finally {
      setIsSavingPoll(false);
    }
  };

  const handleUpdateOptionTally = async (pollId: string, optionId: string) => {
    const val = tallyInputs[pollId]?.[optionId];
    if (val === undefined || isNaN(val)) return;

    try {
      const res = await fetch('/api/admin/polls', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_option_count',
          pollId,
          optionId,
          count: val,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(language === 'hi' ? 'मत गणना अद्यतित की गई' : 'Vote tally updated');
        fetchAllData();
      } else {
        showToast(data.error || 'Failed to update count', true);
      }
    } catch {
      showToast('Error updating tally', true);
    }
  };

  const handleResetPollVotes = async (pollId: string) => {
    try {
      const res = await fetch('/api/admin/polls', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset_votes', pollId }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(language === 'hi' ? 'पोल के सभी वोट शून्य पर रीसेट हो गए' : 'All votes reset to zero');
        setResetModalPollId(null);
        fetchAllData();
      } else {
        showToast(data.error || 'Failed to reset votes', true);
      }
    } catch {
      showToast('Error resetting votes', true);
    }
  };

  // Bidirectional auto-translation handlers
  const handleTitleEnChange = (val: string) => {
    setNewPollTitleEn(val);
    if (autoTranslateEnabled) {
      const hi = translateEnToHi(val);
      setNewPollTitleHi(hi);
    }
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    if (!newPollSlug || newPollSlug.startsWith('poll-') || newPollSlug === generatedSlug.slice(0, -1)) {
      setNewPollSlug(generatedSlug);
    }
  };

  const handleTitleHiChange = (val: string) => {
    setNewPollTitleHi(val);
    if (autoTranslateEnabled) {
      const en = translateHiToEn(val);
      setNewPollTitleEn(en);
      const generatedSlug = en
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      if (!newPollSlug || newPollSlug.startsWith('poll-')) {
        setNewPollSlug(generatedSlug);
      }
    }
  };

  const handleDescEnChange = (val: string) => {
    setNewPollDescEn(val);
    if (autoTranslateEnabled) {
      setNewPollDescHi(translateEnToHi(val));
    }
  };

  const handleDescHiChange = (val: string) => {
    setNewPollDescHi(val);
    if (autoTranslateEnabled) {
      setNewPollDescEn(translateHiToEn(val));
    }
  };

  const handlePartyNameEnChange = (val: string) => {
    setNewPartyNameEn(val);
    if (autoTranslateEnabled) {
      setNewPartyNameHi(translateEnToHi(val));
    }
    if (!newPartyShort) {
      const words = val.trim().split(/\s+/);
      const abbr = words.map((w) => w[0]).join('').toUpperCase().slice(0, 5);
      setNewPartyShort(abbr);
    }
  };

  const handlePartyNameHiChange = (val: string) => {
    setNewPartyNameHi(val);
    if (autoTranslateEnabled) {
      setNewPartyNameEn(translateHiToEn(val));
    }
  };

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast('Logo image must be smaller than 2MB', true);
      return;
    }
    const reader = new FileReader();
    reader.onload = (uploadEvt) => {
      const dataUrl = uploadEvt.target?.result as string;
      setNewPartyLogo(dataUrl);
      showToast(language === 'hi' ? 'लोगो सफलतापूर्वक लोड हुआ' : 'Logo image loaded successfully');
    };
    reader.readAsDataURL(file);
  };

  const handleAddCustomParty = () => {
    if (!newPartyNameEn.trim() && !newPartyNameHi.trim()) {
      showToast('Please enter a party name in English or Hindi', true);
      return;
    }
    const nameEn = newPartyNameEn.trim() || translateHiToEn(newPartyNameHi.trim());
    const nameHi = newPartyNameHi.trim() || translateEnToHi(newPartyNameEn.trim());
    const short = newPartyShort.trim() || nameEn.slice(0, 4).toUpperCase();

    setCustomParties([
      ...customParties,
      {
        id: `cust-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        name_en: nameEn,
        name_hi: nameHi,
        short_name: short,
        logo_url: newPartyLogo,
        color: newPartyColor,
      },
    ]);

    setNewPartyNameEn('');
    setNewPartyNameHi('');
    setNewPartyShort('');
    setNewPartyLogo('');
    showToast(language === 'hi' ? 'कस्टम पार्टी विकल्प जोड़ा गया' : 'Custom party option added');
  };

  const handleRemoveCustomParty = (id: string) => {
    setCustomParties(customParties.filter((p) => p.id !== id));
  };

  const handleCreateNewPoll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPollTitleEn || !newPollTitleHi) {
      showToast('English and Hindi titles are required', true);
      return;
    }

    if (newPollPartyIds.length === 0 && customParties.length === 0) {
      showToast('Please select at least one party or add a custom choice', true);
      return;
    }

    try {
      const res = await fetch('/api/admin/polls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: newPollSlug || `poll-${Date.now()}`,
          title_en: newPollTitleEn,
          title_hi: newPollTitleHi,
          description_en: newPollDescEn,
          description_hi: newPollDescHi,
          status: newPollStatus,
          results_visibility: newPollVisibility,
          voting_policy: newPollVotingPolicy,
          max_votes_per_citizen: newPollMaxVotes,
          party_ids: newPollPartyIds,
          custom_options: customParties.map((p) => ({
            name_en: p.name_en,
            name_hi: p.name_hi,
            short_name: p.short_name,
            logo_url: p.logo_url || undefined,
            color: p.color,
          })),
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(language === 'hi' ? 'नया जनमत सर्वेक्षण सफलतापूर्वक बनाया गया' : 'New Poll Created Successfully');
        setIsCreatingPoll(false);
        setNewPollTitleEn('');
        setNewPollTitleHi('');
        setNewPollSlug('');
        setNewPollDescEn('');
        setNewPollDescHi('');
        setNewPollStatus('LIVE');
        setNewPollVisibility('PUBLIC');
        setNewPollVotingPolicy('STRICT_SINGLE_VOTE');
        setNewPollMaxVotes(1);
        setCustomParties([]);
        fetchAllData();
      } else {
        showToast(data.error || 'Failed to create poll', true);
      }
    } catch {
      showToast('Error creating new poll', true);
    }
  };

  const handleDeletePoll = async (pollId: string) => {
    if (!confirm('Are you sure you want to permanently delete this poll?')) return;
    try {
      const res = await fetch(`/api/admin/polls?id=${pollId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Poll deleted');
        fetchAllData();
      } else {
        showToast(data.error || 'Failed to delete poll', true);
      }
    } catch {
      showToast('Error deleting poll', true);
    }
  };

  // Party Management Handlers
  const handlePartyLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast('Image size should be under 2MB', true);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCreatePartyLogo(reader.result);
        showToast(language === 'hi' ? 'लोगो चुना गया' : 'Logo uploaded successfully');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreateParty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createPartyNameEn || !createPartyNameHi) {
      showToast('English and Hindi names are required', true);
      return;
    }
    setIsSavingParty(true);
    try {
      const res = await fetch('/api/admin/parties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name_en: createPartyNameEn,
          name_hi: createPartyNameHi,
          short_name: createPartyShort,
          color: createPartyColor,
          logo_url: createPartyLogo,
        }),
      });
      const d = await res.json();
      if (d.success) {
        showToast(language === 'hi' ? 'राजनीतिक दल सफलतापूर्वक जोड़ा गया' : 'Political party added and saved to database successfully');
        setIsAddingPartyModal(false);
        setCreatePartyNameEn('');
        setCreatePartyNameHi('');
        setCreatePartyShort('');
        setCreatePartyLogo('');
        fetchAllData();
      } else {
        showToast(d.error || 'Failed to create party', true);
      }
    } catch {
      showToast('Error creating party', true);
    } finally {
      setIsSavingParty(false);
    }
  };

  const handleDeleteParty = async (partyId: string) => {
    if (!confirm('Are you sure you want to delete / deactivate this party?')) return;
    try {
      const res = await fetch(`/api/admin/parties?id=${partyId}`, { method: 'DELETE' });
      const d = await res.json();
      if (d.success) {
        showToast('Party deleted');
        fetchAllData();
      } else {
        showToast(d.error || 'Failed to delete party', true);
      }
    } catch {
      showToast('Error deleting party', true);
    }
  };

  const handleUpdatePollVotingPolicy = async (
    pollId: string,
    policy: 'STRICT_SINGLE_VOTE' | 'ALLOW_ONE_REVOTE' | 'ALLOW_MULTIPLE_VOTES'
  ) => {
    try {
      const res = await fetch('/api/admin/polls', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_details',
          pollId,
          voting_policy: policy,
          max_votes_per_citizen: policy === 'ALLOW_ONE_REVOTE' ? 2 : policy === 'ALLOW_MULTIPLE_VOTES' ? 999999 : 1,
        }),
      });
      const d = await res.json();
      if (d.success) {
        showToast(
          policy === 'STRICT_SINGLE_VOTE'
            ? 'Strict 1-Vote Policy Active (Users can NEVER vote again)'
            : policy === 'ALLOW_ONE_REVOTE'
            ? '1-Time Revote Allowed (Users can change vote only once)'
            : 'Multiple Votes Allowed'
        );
        fetchAllData();
      } else {
        showToast(d.error || 'Failed to update voting policy', true);
      }
    } catch {
      showToast('Error updating voting policy', true);
    }
  };

  // Settings Handlers
  const handleSaveSettings = async () => {
    if (!tempSettings) return;
    setIsSavingSettings(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tempSettings),
      });
      const data = await res.json();
      if (data.success) {
        setSettings(data.data);
        showToast(language === 'hi' ? 'वेबसाइट सेटिंग्स सुरक्षित की गईं' : 'Platform settings saved successfully');
      } else {
        showToast(data.error || 'Failed to save settings', true);
      }
    } catch {
      showToast('Error saving settings', true);
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Supporter & Review Handlers
  const handleToggleVerifySupporter = async (id: string, currentVerified: boolean) => {
    try {
      const res = await fetch('/api/admin/supporters', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, verified: !currentVerified }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Supporter ${!currentVerified ? 'verified & published' : 'unverified'}`);
        fetchAllData();
      } else {
        showToast('Failed to update supporter', true);
      }
    } catch {
      showToast('Error updating supporter', true);
    }
  };

  const handleDeleteSupporter = async (id: string) => {
    if (!confirm('Delete this supporter review?')) return;
    try {
      const res = await fetch(`/api/admin/supporters?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Supporter review deleted');
        fetchAllData();
      } else {
        showToast('Failed to delete supporter', true);
      }
    } catch {
      showToast('Error deleting supporter', true);
    }
  };

  // Passcode Gate UI
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-12 sm:py-20 px-4 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[var(--accent)]/10 border border-[var(--accent)]/30 flex items-center justify-center mx-auto text-[var(--accent)] shadow-md">
            <KeyRound className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
            {language === 'hi' ? 'व्यवस्थापक नियंत्रण कक्ष' : 'Platform Administration'}
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            {language === 'hi'
              ? 'वेबसाइट और सर्वेक्षणों के पूर्ण नियंत्रण के लिए पासकोड दर्ज करें'
              : 'Enter master administrator passcode to unlock full platform controls'}
          </p>
        </div>

        <GlassCard elevated className="p-6 space-y-5">
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
                {language === 'hi' ? 'मास्टर पासकोड' : 'Master Passcode'}
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter passcode..."
                  className="w-full px-4 py-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-all font-mono"
                  autoFocus
                />
              </div>
              <p className="text-[11px] text-[var(--text-tertiary)] flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-[var(--accent)] shrink-0" />
                <span>{language === 'hi' ? 'सुरक्षित सत्र • केवल अधिकृत पहुंच' : 'Encrypted session • Authorized personnel only'}</span>
              </p>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full py-3 px-4 rounded-xl bg-[var(--accent)] hover:opacity-90 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {isAuthenticating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>{language === 'hi' ? 'पैनल अनलॉक करें' : 'Unlock Admin Panel'}</span>
                </>
              )}
            </button>
          </form>
        </GlassCard>

        <DisclaimerBanner />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 py-4 px-2 sm:px-4">
      {/* Toast Notifications */}
      {successToast && (
        <div className="fixed top-5 right-5 z-50 p-4 rounded-xl bg-emerald-500 text-white font-bold text-xs shadow-2xl flex items-center gap-2 animate-in slide-in-from-top duration-300">
          <Check className="w-4 h-4 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}
      {errorToast && (
        <div className="fixed top-5 right-5 z-50 p-4 rounded-xl bg-red-500 text-white font-bold text-xs shadow-2xl flex items-center gap-2 animate-in slide-in-from-top duration-300">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorToast}</span>
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--border-glass)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <GlassBadge variant="neutral">
              <Lock className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>Master Admin Active</span>
            </GlassBadge>
            {settings?.allowVoting ? (
              <GlassBadge variant="success">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Voting Live</span>
              </GlassBadge>
            ) : (
              <GlassBadge variant="warning">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Voting Paused</span>
              </GlassBadge>
            )}
            {settings?.emergencyBannerEnabled && (
              <GlassBadge variant="warning">
                <Bell className="w-3.5 h-3.5 text-amber-500" />
                <span>Alert Banner Active</span>
              </GlassBadge>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-primary)]">
            {language === 'hi' ? 'वेबसाइट नियंत्रण एवं प्रबंधन' : 'Platform Control & Management'}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            {language === 'hi'
              ? 'पोल, मत गणना, आपातकालीन सूचनाएँ एवं चाय समर्थकों का संपूर्ण संपादन और नियंत्रण।'
              : 'Full edit and operational control over opinion polls, vote counts, emergency banners, and supporters.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-center flex-wrap">
          <button
            type="button"
            onClick={fetchAllData}
            disabled={isRefreshing}
            className="py-2 px-3.5 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--border-glass)] border border-[var(--border-glass)] text-xs font-bold text-[var(--text-primary)] transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-60"
            title="Refresh All Server Data"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 transition-transform duration-500 ${
                isRefreshing ? 'animate-spin text-[var(--accent)]' : ''
              }`}
            />
            <span>{isRefreshing ? (language === 'hi' ? 'रीफ्रेश...' : 'Refreshing...') : 'Refresh'}</span>
          </button>

          <button
            type="button"
            onClick={handleSignOut}
            className="py-2 px-3.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-xs font-bold text-red-500 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Lock</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-[var(--border-glass)]">
        {[
          { id: 'overview', label: language === 'hi' ? 'अवलोकन' : 'Overview', icon: Sliders },
          { id: 'polls', label: language === 'hi' ? 'सर्वेक्षण एवं मत नियंत्रण' : 'Polls & Ballots', icon: Vote },
          { id: 'settings', label: language === 'hi' ? 'साइट सेटिंग्स एवं अलर्ट' : 'Site Controls', icon: Settings },
          { id: 'supporters', label: language === 'hi' ? 'चाय समर्थक समीक्षाएँ' : 'Chai Supporters', icon: Coffee },
          { id: 'parties', label: language === 'hi' ? 'मान्यता प्राप्त दल' : 'Official Parties', icon: Layers },
          { id: 'export', label: language === 'hi' ? 'डेटा बैकअप' : 'Export & Backup', icon: Download },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[var(--accent)] text-white shadow-md'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Strict Privacy Bound */}
          <div className="p-4 rounded-2xl bg-[var(--accent-soft)] border border-[var(--accent)]/30 text-xs text-[var(--accent)] flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <strong className="block text-sm">Zero-PII Sovereign Architecture Guarantee:</strong>
              <p className="text-[var(--text-secondary)]">
                This administration dashboard operates on aggregate cryptographic tallies. Zero voter names, zero mobile numbers, zero WhatsApp identities, and zero traceable vote selections are ever recorded or accessible.
              </p>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <GlassCard elevated className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-[var(--text-tertiary)] font-bold">
                  {language === 'hi' ? 'कुल सत्यापित नागरिक' : 'Verified Citizens'}
                </span>
                <Users className="w-4 h-4 text-[var(--accent)]" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
                {(stats?.totalVerified || 0).toLocaleString()}
              </p>
              <span className="text-xs text-[var(--text-tertiary)] font-mono">HMAC Unique Fingerprints</span>
            </GlassCard>

            <GlassCard elevated className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-[var(--text-tertiary)] font-bold">
                  Total Recorded Votes
                </span>
                <Vote className="w-4 h-4 text-[var(--success)]" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
                {(stats?.totalResponses || 0).toLocaleString()}
              </p>
              <span className="text-xs text-[var(--success)] font-medium">100% Atomic Ledger</span>
            </GlassCard>

            <GlassCard elevated className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-[var(--text-tertiary)] font-bold">
                  Active Live Polls
                </span>
                <Radio className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
                {polls.filter((p) => p.status === 'LIVE').length}
              </p>
              <span className="text-xs text-[var(--text-tertiary)]">PM National & CM State Assembly</span>
            </GlassCard>

            <GlassCard elevated className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-[var(--text-tertiary)] font-bold">
                  Chai Support Pool
                </span>
                <Coffee className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
                ₹{supporters.reduce((acc, s) => acc + (Number(s.amount) || 0), 0)}
              </p>
              <span className="text-xs text-amber-800 dark:text-amber-300 font-semibold">
                {supporters.reduce((acc, s) => acc + (Number(s.cups) || 0), 0)} cups contributed
              </span>
            </GlassCard>
          </div>

          {/* Live Security & Audit Trail */}
          <GlassCard className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-glass)]">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                  {language === 'hi' ? 'वास्तविक समय सुरक्षा एवं ऑडिट लॉग' : 'Live Security & Audit Trail'}
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Cryptographically sanitized event log of platform actions (Zero PII)
                </p>
              </div>
              <GlassBadge variant="neutral">
                <span>{auditEvents.length} events logged</span>
              </GlassBadge>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {auditEvents.length === 0 ? (
                <p className="text-xs text-[var(--text-tertiary)] py-4 text-center">No audit events recorded yet.</p>
              ) : (
                auditEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                      <span className="font-mono font-bold text-[var(--text-primary)] truncate">
                        {evt.event_type}
                      </span>
                      {evt.poll_id && (
                        <span className="px-2 py-0.5 rounded bg-[var(--bg-primary)] text-[var(--text-secondary)] font-mono text-[11px] shrink-0">
                          {evt.poll_id}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[var(--text-tertiary)] shrink-0 font-mono">
                      {new Date(evt.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </GlassCard>
        </div>
      )}

      {/* TAB 2: POLLS & BALLOTS CONTROL */}
      {activeTab === 'polls' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                {language === 'hi' ? 'सर्वेक्षण प्रबंधन एवं मत नियंत्रण' : 'Poll Schedules & Ballot Control'}
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Edit poll schedules, adjust party vote tallies, reset tallies, or launch new polls
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsCreatingPoll(true)}
              className="py-2.5 px-4 rounded-xl bg-[var(--accent)] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'hi' ? 'नया पोल बनाएं' : 'Create New Poll'}</span>
            </button>
          </div>

          {/* List of Polls */}
          <div className="space-y-4">
            {polls.map((poll) => {
              const isExpanded = expandedPollTallyId === poll.id;
              return (
                <GlassCard key={poll.id} className="space-y-4">
                  {/* Top Bar of Poll Card */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-glass)]">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs text-[var(--accent)] font-bold">{poll.id}</span>
                        <GlassBadge
                          variant={
                            poll.status === 'LIVE'
                              ? 'success'
                              : poll.status === 'PAUSED'
                              ? 'warning'
                              : 'neutral'
                          }
                        >
                          {poll.status}
                        </GlassBadge>
                        <span className="text-xs text-[var(--text-tertiary)]">
                          Total: <strong className="text-[var(--text-primary)]">{poll.total_votes.toLocaleString()}</strong> votes
                        </span>
                      </div>

                      {/* Voting Restriction Policy Controls */}
                      <div className="flex items-center gap-2 flex-wrap pt-1">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-glass)] shadow-2xs">
                          <ShieldCheck className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
                          <span className="text-[11px] font-bold text-[var(--text-secondary)]">Voting Policy:</span>
                          <select
                            value={poll.voting_policy || 'STRICT_SINGLE_VOTE'}
                            onChange={(e) =>
                              handleUpdatePollVotingPolicy(
                                poll.id,
                                e.target.value as 'STRICT_SINGLE_VOTE' | 'ALLOW_ONE_REVOTE' | 'ALLOW_MULTIPLE_VOTES'
                              )
                            }
                            className="bg-transparent text-[11px] font-bold text-[var(--text-primary)] focus:outline-none cursor-pointer"
                          >
                            <option value="STRICT_SINGLE_VOTE">
                              🛡️ Strict 1-Vote (User Never Votes Again)
                            </option>
                            <option value="ALLOW_ONE_REVOTE">
                              🔄 Allow 1 Revote (Max 2 Votes)
                            </option>
                            <option value="ALLOW_MULTIPLE_VOTES">
                              ♾️ Allow Multiple Votes
                            </option>
                          </select>
                        </div>
                        {poll.voting_policy === 'STRICT_SINGLE_VOTE' && (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                            ✓ Permanent single-vote lock active
                          </span>
                        )}
                        {poll.voting_policy === 'ALLOW_ONE_REVOTE' && (
                          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                            ✓ 1 vote change permitted
                          </span>
                        )}
                        {poll.voting_policy === 'ALLOW_MULTIPLE_VOTES' && (
                          <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
                            ✓ Continuous sentiment polling
                          </span>
                        )}
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                        {language === 'hi' ? poll.title_hi : poll.title_en}
                      </h3>
                      <p className="text-xs text-[var(--text-secondary)] line-clamp-1">
                        {language === 'hi' ? poll.description_hi : poll.description_en}
                      </p>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="flex items-center gap-2 flex-wrap shrink-0">
                      <button
                        type="button"
                        onClick={() => handleTogglePollStatus(poll.id, poll.status)}
                        className="py-1.5 px-3 rounded-lg bg-[var(--bg-surface)] hover:bg-[var(--border-glass)] border border-[var(--border-glass)] text-xs font-semibold text-[var(--text-primary)] transition-all cursor-pointer"
                        title="Cycle Status (LIVE -> PAUSED -> CLOSED)"
                      >
                        {poll.status === 'LIVE' ? 'Pause' : poll.status === 'PAUSED' ? 'Close' : 'Set Live'}
                      </button>

                      <button
                        type="button"
                        onClick={() => setEditingPoll(poll)}
                        className="py-1.5 px-3 rounded-lg bg-[var(--bg-surface)] hover:bg-[var(--border-glass)] border border-[var(--border-glass)] text-xs font-semibold text-[var(--text-primary)] transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setResetModalPollId(poll.id)}
                        className="py-1.5 px-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-xs font-semibold text-red-500 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset Votes</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setExpandedPollTallyId(isExpanded ? null : poll.id)}
                        className="py-1.5 px-3 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <span>{isExpanded ? 'Hide Tallies' : 'Inspect Tallies'}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Party Tallies & Manual Adjustments */}
                  {isExpanded && (
                    <div className="pt-2 space-y-3 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                          Party Breakdown & Vote Count Adjuster
                        </span>
                        <span className="text-xs text-[var(--text-secondary)]">
                          Enter custom value &amp; click &apos;Update&apos; to adjust individual counts
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {poll.optionResults?.map((opt) => {
                          const currentVal = tallyInputs[poll.id]?.[opt.option_id] ?? opt.count;
                          return (
                            <div
                              key={opt.option_id}
                              className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] flex items-center justify-between gap-3"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div
                                  className="w-8 h-8 rounded-lg p-1 bg-[var(--bg-primary)] border border-[var(--border-glass)] flex items-center justify-center shrink-0"
                                  dangerouslySetInnerHTML={{ __html: opt.symbol_svg }}
                                />
                                <div className="min-w-0">
                                  <div className="text-xs font-bold text-[var(--text-primary)] truncate">
                                    {language === 'hi' ? opt.party_name_hi : opt.party_name_en}
                                  </div>
                                  <span className="text-[11px] text-[var(--text-tertiary)] font-mono">
                                    {opt.percentage}% of total
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <input
                                  type="number"
                                  value={currentVal}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value, 10) || 0;
                                    setTallyInputs((prev) => ({
                                      ...prev,
                                      [poll.id]: {
                                        ...(prev[poll.id] || {}),
                                        [opt.option_id]: val,
                                      },
                                    }));
                                  }}
                                  className="w-24 px-2 py-1.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-glass)] text-xs font-mono font-bold text-[var(--text-primary)] text-right focus:outline-none focus:border-[var(--accent)]"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleUpdateOptionTally(poll.id, opt.option_id)}
                                  className="py-1.5 px-2.5 rounded-lg bg-[var(--accent)] hover:opacity-90 text-white font-bold text-[11px] transition-all cursor-pointer active:scale-95"
                                  title="Save new vote tally"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </GlassCard>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: SITE CONTROLS & EMERGENCY ANNOUNCEMENT */}
      {activeTab === 'settings' && tempSettings && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                {language === 'hi' ? 'वेबसाइट सेटिंग्स एवं आपातकालीन सूचना' : 'Platform Governance & Alert Controls'}
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Configure platform-wide voting switches, emergency announcement banners, and rate limits
              </p>
            </div>
            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={isSavingSettings}
              className="py-2.5 px-5 rounded-xl bg-[var(--accent)] hover:opacity-90 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-60 self-start sm:self-auto"
            >
              <Save className="w-4 h-4" />
              <span>{isSavingSettings ? 'Saving...' : 'Save All Settings'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Core Switches */}
            <GlassCard elevated className="space-y-5">
              <h3 className="text-base font-bold text-[var(--text-primary)] pb-2 border-b border-[var(--border-glass)]">
                Platform Operational Switches
              </h3>

              {/* Allow Voting Switch */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)]">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">Platform Voting Active</h4>
                  <p className="text-xs text-[var(--text-secondary)]">
                    When toggled off, voting submission is locked platform-wide
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tempSettings.allowVoting}
                    onChange={(e) => setTempSettings({ ...tempSettings, allowVoting: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              {/* Maintenance Mode */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)]">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">Maintenance Mode</h4>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Display maintenance notice to incoming visitors
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tempSettings.maintenanceMode}
                    onChange={(e) => setTempSettings({ ...tempSettings, maintenanceMode: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                </label>
              </div>

              {/* Rate Limit Per Hour */}
              <div className="space-y-1.5 p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)]">
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
                  Rate Limit Per Voter (PerHour)
                </label>
                <input
                  type="number"
                  value={tempSettings.rateLimitPerHour}
                  onChange={(e) =>
                    setTempSettings({
                      ...tempSettings,
                      rateLimitPerHour: Math.max(1, parseInt(e.target.value, 10) || 60),
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-glass)] text-xs text-[var(--text-primary)] font-mono"
                />
                <span className="text-[11px] text-[var(--text-tertiary)]">
                  Prevents automated DDoS ballot submissions
                </span>
              </div>
            </GlassCard>

            {/* Emergency Alert Banner Config */}
            <GlassCard elevated className="space-y-5">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border-glass)]">
                <h3 className="text-base font-bold text-[var(--text-primary)]">Site-Wide Alert Banner</h3>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tempSettings.emergencyBannerEnabled}
                    onChange={(e) =>
                      setTempSettings({ ...tempSettings, emergencyBannerEnabled: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent)]"></div>
                </label>
              </div>

              {/* Banner Severity Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
                  Alert Severity
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['info', 'warning', 'alert'] as const).map((sev) => (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setTempSettings({ ...tempSettings, emergencyBannerType: sev })}
                      className={`py-2 px-3 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                        tempSettings.emergencyBannerType === sev
                          ? 'bg-[var(--accent)] text-white shadow-sm'
                          : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-glass)]'
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>

              {/* English Text */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
                  English Banner Announcement
                </label>
                <input
                  type="text"
                  value={tempSettings.emergencyBannerTextEn}
                  onChange={(e) => setTempSettings({ ...tempSettings, emergencyBannerTextEn: e.target.value })}
                  placeholder="e.g. Server maintenance scheduled tonight at 11:00 PM IST."
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-glass)] text-xs text-[var(--text-primary)]"
                />
              </div>

              {/* Hindi Text */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
                  Hindi Banner Announcement
                </label>
                <input
                  type="text"
                  value={tempSettings.emergencyBannerTextHi}
                  onChange={(e) => setTempSettings({ ...tempSettings, emergencyBannerTextHi: e.target.value })}
                  placeholder="उदा. आज रात 11:00 बजे सर्वर रखरखाव निर्धारित है।"
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-glass)] text-xs text-[var(--text-primary)]"
                />
              </div>

              {/* Live Preview */}
              {tempSettings.emergencyBannerEnabled && (
                <div className="space-y-1 pt-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                    Live Preview
                  </span>
                  <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-900 dark:text-blue-200 text-xs flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-500 shrink-0" />
                    <span>
                      {language === 'hi' && tempSettings.emergencyBannerTextHi
                        ? tempSettings.emergencyBannerTextHi
                        : tempSettings.emergencyBannerTextEn || 'Your announcement will appear here.'}
                    </span>
                  </div>
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      )}

      {/* TAB 4: CHAI SUPPORTERS & REVIEWS MODERATION */}
      {activeTab === 'supporters' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                {language === 'hi' ? 'चाय समर्थक एवं नागरिक समीक्षाएँ' : 'Chai Supporters & Citizen Reviews'}
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Moderate, verify, or remove supporter messages and citizen reviews (Buy Me a Chai)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <GlassBadge variant="neutral">
                <span>{supporters.length} total supporters</span>
              </GlassBadge>
            </div>
          </div>

          {/* Supporters Table */}
          <GlassCard className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--border-glass)] text-[var(--text-tertiary)]">
                    <th className="py-3 px-4 font-semibold">Citizen Name</th>
                    <th className="py-3 px-4 font-semibold">Amount & Cups</th>
                    <th className="py-3 px-4 font-semibold">Rating</th>
                    <th className="py-3 px-4 font-semibold">Citizen Review</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-glass)]">
                  {supporters.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-[var(--text-tertiary)]">
                        No supporters recorded in database yet.
                      </td>
                    </tr>
                  ) : (
                    supporters.map((sup, index) => (
                      <tr key={sup.id || index} className="hover:bg-[var(--bg-surface)] transition-colors">
                        <td className="py-3 px-4 font-bold text-[var(--text-primary)]">{sup.name}</td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-amber-800 dark:text-amber-300">₹{sup.amount}</span>
                          <span className="text-[11px] text-[var(--text-tertiary)] block">({sup.cups} cups)</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-0.5 text-amber-500">
                            {Array.from({ length: sup.rating || 5 }).map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4 max-w-xs text-[var(--text-secondary)]">
                          {sup.message || <span className="text-[var(--text-tertiary)] italic">No message</span>}
                        </td>
                        <td className="py-3 px-4">
                          <GlassBadge variant={sup.verified ? 'success' : 'warning'}>
                            {sup.verified ? 'Verified & Public' : 'Pending'}
                          </GlassBadge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {sup.id && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleToggleVerifySupporter(sup.id!, sup.verified ?? false)}
                                  className="py-1 px-2.5 rounded-lg bg-[var(--bg-surface)] hover:bg-[var(--border-glass)] text-[11px] font-bold text-[var(--text-primary)] border border-[var(--border-glass)] cursor-pointer"
                                >
                                  {sup.verified ? 'Unpublish' : 'Verify'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSupporter(sup.id!)}
                                  className="p-1 rounded-lg text-red-500 hover:bg-red-500/10 cursor-pointer"
                                  title="Delete Review"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      )}

      {/* TAB 5: OFFICIAL PARTIES DIRECTORY */}
      {activeTab === 'parties' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                {language === 'hi' ? 'मान्यता प्राप्त राजनीतिक दल एवं प्रतीक' : 'Political Parties & Custom Candidates'}
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Recognized political parties directory and custom political parties with logos saved in the database
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAddingPartyModal(true)}
              className="py-2.5 px-4 rounded-xl bg-[var(--accent)] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'hi' ? 'नई पार्टी / उम्मीदवार जोड़ें' : 'Add New Party / Choice'}</span>
            </button>
          </div>

          {/* Search Filter Bar */}
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-[var(--text-tertiary)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={partySearchQuery}
              onChange={(e) => setPartySearchQuery(e.target.value)}
              placeholder="Search parties by name or short code (e.g. BJP, AAP, Congress)..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
            />
          </div>

          {/* Parties Grid */}
          {(() => {
            const partyMap = new Map<string, Party>();
            OFFICIAL_PARTIES.forEach((p) => partyMap.set(p.id, p));
            allParties.forEach((p) => partyMap.set(p.id, p));
            const combined = Array.from(partyMap.values());
            const filtered = combined.filter((p) => {
              if (!partySearchQuery.trim()) return true;
              const q = partySearchQuery.toLowerCase();
              return (
                p.name_en.toLowerCase().includes(q) ||
                p.name_hi.toLowerCase().includes(q) ||
                (p.short_name && p.short_name.toLowerCase().includes(q))
              );
            });

            if (filtered.length === 0) {
              return (
                <div className="p-8 text-center text-xs text-[var(--text-tertiary)] rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-glass)]">
                  No parties found matching &quot;{partySearchQuery}&quot;. Click &apos;Add New Party&apos; to register one.
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {filtered.map((party) => {
                  const isBuiltIn = OFFICIAL_PARTIES.some((op) => op.id === party.id);
                  return (
                    <div
                      key={party.id}
                      className="p-3.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-glass)] flex items-center justify-between gap-3 shadow-sm relative group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-12 h-12 rounded-xl p-1 bg-[var(--bg-primary)] border border-[var(--border-glass)] flex items-center justify-center shrink-0 overflow-hidden">
                          {party.logo_url ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={party.logo_url} alt={party.name_en} className="w-full h-full object-contain" />
                          ) : party.symbol_svg ? (
                            <div
                              className="w-full h-full flex items-center justify-center p-1"
                              dangerouslySetInnerHTML={{ __html: party.symbol_svg }}
                            />
                          ) : (
                            <span className="font-bold text-xs text-[var(--accent)] font-mono">
                              {party.short_name?.slice(0, 3) || 'P'}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-[var(--accent)] font-mono">
                              {party.short_name || party.id.toUpperCase()}
                            </span>
                            {party.color && (
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: party.color }} />
                            )}
                            {!isBuiltIn && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-[var(--accent-soft)] text-[var(--accent)] font-bold">
                                Custom
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-bold text-[var(--text-primary)] truncate block">
                            {language === 'hi' ? party.name_hi : party.name_en}
                          </span>
                          <span className="text-[11px] text-[var(--text-tertiary)] block truncate">
                            {language === 'hi' ? party.name_en : party.name_hi}
                          </span>
                        </div>
                      </div>

                      {!isBuiltIn && (
                        <button
                          type="button"
                          onClick={() => handleDeleteParty(party.id)}
                          className="opacity-70 group-hover:opacity-100 p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-all cursor-pointer shrink-0"
                          title="Delete / Deactivate Party"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })()}

          {/* State Scope Directory */}
          <GlassCard className="space-y-4">
            <h3 className="text-base font-bold text-[var(--text-primary)] pb-2 border-b border-[var(--border-glass)]">
              State Legislative Assemblies Reference
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {INDIAN_STATES.slice(0, 24).map((state: IndianState) => (
                <div
                  key={state.code}
                  className="p-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-glass)] text-xs space-y-0.5"
                >
                  <span className="font-mono text-[10px] text-[var(--accent)] font-bold">{state.code}</span>
                  <div className="font-bold text-[var(--text-primary)] truncate">{state.name_en}</div>
                  <div className="text-[11px] text-[var(--text-tertiary)]">
                    {state.assemblySeats ? `${state.assemblySeats} seats` : 'Assembly Scope'}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}

      {/* TAB 6: DATA EXPORT & AUDIT BACKUP */}
      {activeTab === 'export' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              {language === 'hi' ? 'डेटा बैकअप एवं संपूर्ण निर्यात' : 'Cryptographic Data Export & Backups'}
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Download sanitized aggregate platform data and poll results for transparent public verification
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassCard elevated className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center">
                <Download className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">Complete Platform JSON Backup</h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Includes all detailed polls, options, real-time vote tallies, active site settings, and audit event logs. Fully zero-PII and compliant.
              </p>
              <a
                href="/api/admin/export?format=json"
                download
                className="w-full py-3 px-4 rounded-xl bg-[var(--accent)] hover:opacity-90 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 inline-flex"
              >
                <Download className="w-4 h-4" />
                <span>Download JSON Backup</span>
              </a>
            </GlassCard>

            <GlassCard elevated className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">Poll Results CSV Spreadsheet</h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Structured tabular CSV export of all poll options, recognized party codes, percentages, and vote counts for easy analysis in Excel or Google Sheets.
              </p>
              <a
                href="/api/admin/export?format=csv"
                download
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 inline-flex"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Download Results CSV</span>
              </a>
            </GlassCard>
          </div>
        </div>
      )}

      {/* EDIT POLL MODAL */}
      {editingPoll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-glass)] p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-glass)]">
              <h3 className="text-lg font-bold text-[var(--text-primary)]">Edit Opinion Poll</h3>
              <button
                type="button"
                onClick={() => setEditingPoll(null)}
                className="p-1 rounded-lg hover:bg-[var(--bg-surface)] text-[var(--text-tertiary)] cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
                  Title (English)
                </label>
                <input
                  type="text"
                  value={editingPoll.title_en}
                  onChange={(e) => setEditingPoll({ ...editingPoll, title_en: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-glass)] text-xs text-[var(--text-primary)]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
                  Title (Hindi)
                </label>
                <input
                  type="text"
                  value={editingPoll.title_hi}
                  onChange={(e) => setEditingPoll({ ...editingPoll, title_hi: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-glass)] text-xs text-[var(--text-primary)]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
                  Description (English)
                </label>
                <textarea
                  rows={2}
                  value={editingPoll.description_en}
                  onChange={(e) => setEditingPoll({ ...editingPoll, description_en: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-glass)] text-xs text-[var(--text-primary)]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
                  Description (Hindi)
                </label>
                <textarea
                  rows={2}
                  value={editingPoll.description_hi}
                  onChange={(e) => setEditingPoll({ ...editingPoll, description_hi: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-glass)] text-xs text-[var(--text-primary)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
                    Status
                  </label>
                  <select
                    value={editingPoll.status}
                    onChange={(e) => setEditingPoll({ ...editingPoll, status: e.target.value as Poll['status'] })}
                    className="w-full glass-select rounded-xl text-xs font-bold"
                  >
                    <option value="LIVE">LIVE (सक्रिय)</option>
                    <option value="PAUSED">PAUSED (स्थगित)</option>
                    <option value="CLOSED">CLOSED (बंद)</option>
                    <option value="DRAFT">DRAFT (प्रारूप)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
                    Results Visibility
                  </label>
                  <select
                    value={editingPoll.results_visibility}
                    onChange={(e) =>
                      setEditingPoll({
                        ...editingPoll,
                        results_visibility: e.target.value as Poll['results_visibility'],
                      })
                    }
                    className="w-full glass-select rounded-xl text-xs font-bold"
                  >
                    <option value="PUBLIC">PUBLIC (सार्वजनिक)</option>
                    <option value="ADMIN_ONLY">ADMIN_ONLY (केवल एडमिन)</option>
                    <option value="AFTER_CLOSE">AFTER_CLOSE (समाप्ति के बाद)</option>
                  </select>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
                    Voting Limit Policy (मतदान प्रतिबंध एवं सीमा)
                  </label>
                  <select
                    value={editingPoll.voting_policy || 'STRICT_SINGLE_VOTE'}
                    onChange={(e) =>
                      setEditingPoll({
                        ...editingPoll,
                        voting_policy: e.target.value as 'STRICT_SINGLE_VOTE' | 'ALLOW_ONE_REVOTE' | 'ALLOW_MULTIPLE_VOTES',
                        max_votes_per_citizen:
                          e.target.value === 'ALLOW_ONE_REVOTE'
                            ? 2
                            : e.target.value === 'ALLOW_MULTIPLE_VOTES'
                            ? 999999
                            : 1,
                      })
                    }
                    className="w-full glass-select rounded-xl text-xs font-bold"
                  >
                    <option value="STRICT_SINGLE_VOTE">
                      🛡️ Strict 1-Vote Limit (User can NEVER vote again in this poll)
                    </option>
                    <option value="ALLOW_ONE_REVOTE">
                      🔄 Allow 1 Revote (User can change/re-cast vote once, max 2 votes)
                    </option>
                    <option value="ALLOW_MULTIPLE_VOTES">
                      ♾️ Allow Multiple Votes (Multiple submissions permitted)
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-glass)]">
              <button
                type="button"
                onClick={() => setEditingPoll(null)}
                className="py-2 px-4 rounded-xl text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSavingPoll}
                onClick={handleSavePollDetails}
                className="py-2 px-4 rounded-xl bg-[var(--accent)] hover:opacity-90 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {isSavingPoll ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW POLL MODAL */}
      {isCreatingPoll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-2xl rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-glass)] p-5 sm:p-7 space-y-5 shadow-2xl max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-glass)]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] shrink-0">
                  <Vote className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-[var(--text-primary)]">
                    {language === 'hi' ? 'नया नागरिक जनमत सर्वेक्षण बनाएं' : 'Launch New Opinion Poll'}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {language === 'hi'
                      ? 'द्विभाषी स्वतः-अनुवाद, कस्टम पार्टियां, लोगो अपलोड और पूर्ण प्रशासनिक नियंत्रण'
                      : 'Full freedom with bidirectional auto-translation, custom party logos, and lifecycle control'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreatingPoll(false)}
                className="p-1.5 rounded-xl hover:bg-[var(--bg-glass-elevated)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
                aria-label="Close dialog"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewPoll} className="space-y-4 text-xs">
              {/* SECTION: TITLES WITH REAL-TIME BIDIRECTIONAL AUTO-TRANSLATION */}
              <div className="p-3.5 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-glass)] space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[var(--accent)] flex items-center gap-1.5 uppercase tracking-wider">
                    <Languages className="w-3.5 h-3.5" />
                    <span>{language === 'hi' ? 'द्विभाषी शीर्षक' : 'Poll Titles'}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setAutoTranslateEnabled(!autoTranslateEnabled)}
                    className={`text-[11px] px-3 py-1 rounded-full font-bold flex items-center gap-1.5 border transition-all cursor-pointer shadow-xs active:scale-95 ${
                      autoTranslateEnabled
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/25'
                        : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/40 hover:bg-amber-500/25'
                    }`}
                    title={
                      autoTranslateEnabled
                        ? 'Click to turn OFF auto-translation and write custom independent text in both boxes'
                        : 'Click to turn ON automatic English ⇄ Hindi translation'
                    }
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        autoTranslateEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                      }`}
                    />
                    <Sparkles className="w-3 h-3 shrink-0" />
                    <span>
                      {autoTranslateEnabled
                        ? language === 'hi'
                          ? 'Auto EN ⮂ HI: चालू (बंद करें)'
                          : 'Auto EN ⮂ HI: ON (Click to Off)'
                        : language === 'hi'
                        ? 'मैन्युअल मोड: अनुवाद बंद (चालू करें)'
                        : 'Manual Mode: Auto Sync OFF (Click to On)'}
                    </span>
                  </button>
                </div>

                {!autoTranslateEnabled && (
                  <div className="px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-300 flex items-center gap-2">
                    <span className="font-bold shrink-0">✓ {language === 'hi' ? 'मैन्युअल मोड सक्रिय:' : 'Manual Mode Active:'}</span>
                    <span>
                      {language === 'hi'
                        ? 'अंग्रेजी और हिंदी बॉक्स पूरी तरह स्वतंत्र हैं। आप दोनों में अपनी पसंद का कोई भी अलग टेक्स्ट लिख सकते हैं।'
                        : 'English and Hindi fields are completely independent. Enter whatever custom text you want in each box.'}
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-[var(--text-secondary)] block">
                      Title in English *
                    </label>
                    <input
                      type="text"
                      required
                      value={newPollTitleEn}
                      onChange={(e) => handleTitleEnChange(e.target.value)}
                      placeholder="e.g. 2029 Delhi Assembly Opinion Poll"
                      className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] shadow-2xs font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-[var(--text-secondary)] block">
                      Title in Hindi (शीर्षक हिंदी में) *
                    </label>
                    <input
                      type="text"
                      required
                      value={newPollTitleHi}
                      onChange={(e) => handleTitleHiChange(e.target.value)}
                      placeholder="उदा. 2029 दिल्ली विधानसभा जनमत सर्वेक्षण"
                      className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] shadow-2xs font-medium"
                    />
                  </div>
                </div>

                {/* Slug */}
                <div className="space-y-1 pt-1">
                  <label className="font-bold text-[var(--text-secondary)] block">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={newPollSlug}
                    onChange={(e) => setNewPollSlug(e.target.value)}
                    placeholder="delhi-assembly-opinion-poll-2029"
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] text-xs text-[var(--text-primary)] font-mono shadow-2xs"
                  />
                </div>
              </div>

              {/* SECTION: DESCRIPTIONS WITH BIDIRECTIONAL AUTO-TRANSLATION */}
              <div className="p-3.5 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-glass)] space-y-3">
                <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
                  {language === 'hi'
                    ? autoTranslateEnabled
                      ? 'विवरण (स्वतः अनुवाद)'
                      : 'विवरण (मैन्युअल मोड)'
                    : autoTranslateEnabled
                    ? 'Descriptions (Auto-Sync)'
                    : 'Descriptions (Manual Mode)'}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[var(--text-tertiary)] block">
                      Description (English)
                    </label>
                    <textarea
                      rows={2}
                      value={newPollDescEn}
                      onChange={(e) => handleDescEnChange(e.target.value)}
                      placeholder="Cast your verified anonymous vote for the upcoming 2029 Delhi Assembly."
                      className="w-full px-3 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] resize-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[var(--text-tertiary)] block">
                      विवरण (हिंदी में)
                    </label>
                    <textarea
                      rows={2}
                      value={newPollDescHi}
                      onChange={(e) => handleDescHiChange(e.target.value)}
                      placeholder="2029 दिल्ली विधानसभा के लिए अपना सत्यापित और गुमनाम मत दर्ज करें।"
                      className="w-full px-3 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION: STATUS & RESULTS VISIBILITY */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-glass)]">
                <div className="space-y-1.5">
                  <label className="font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
                    {language === 'hi' ? 'पोल स्थिति (Status)' : 'Poll Status'}
                  </label>
                  <select
                    value={newPollStatus}
                    onChange={(e) => setNewPollStatus(e.target.value as Poll['status'])}
                    className="w-full glass-select rounded-xl text-xs font-bold"
                  >
                    <option value="LIVE">LIVE (सक्रिय - मतदान खुला)</option>
                    <option value="DRAFT">DRAFT (प्रारूप / आगामी)</option>
                    <option value="SCHEDULED">SCHEDULED (अनुसूचित)</option>
                    <option value="CLOSED">CLOSED (समाप्त / बंद)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
                    {language === 'hi' ? 'परिणाम दृश्यता (Visibility)' : 'Results Visibility'}
                  </label>
                  <select
                    value={newPollVisibility}
                    onChange={(e) => setNewPollVisibility(e.target.value as Poll['results_visibility'])}
                    className="w-full glass-select rounded-xl text-xs font-bold"
                  >
                    <option value="PUBLIC">PUBLIC (सार्वजनिक - सभी को दिखे)</option>
                    <option value="ADMIN_ONLY">ADMIN_ONLY (केवल व्यवस्थापक)</option>
                    <option value="AFTER_CLOSE">AFTER_CLOSE (समाप्ति के बाद)</option>
                  </select>
                </div>
              </div>

              {/* SECTION: VOTING RESTRICTION / LIMIT POLICY */}
              <div className="p-3.5 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-glass)] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--accent)] flex items-center gap-1.5 uppercase tracking-wider">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{language === 'hi' ? 'मतदान सीमा एवं कड़े नियम' : 'Voting Limit & Prevention Policy'}</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] font-bold">
                    Anti-Fraud Engine
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <label
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex flex-col justify-between ${
                      newPollVotingPolicy === 'STRICT_SINGLE_VOTE'
                        ? 'bg-[var(--accent-soft)] border-[var(--accent)] ring-1 ring-[var(--accent)]'
                        : 'bg-[var(--bg-surface)] border-[var(--border-glass)] hover:bg-[var(--bg-glass-elevated)]'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[var(--text-primary)]">Strict 1-Vote Only</span>
                        <input
                          type="radio"
                          name="newPollVotingPolicy"
                          value="STRICT_SINGLE_VOTE"
                          checked={newPollVotingPolicy === 'STRICT_SINGLE_VOTE'}
                          onChange={() => {
                            setNewPollVotingPolicy('STRICT_SINGLE_VOTE');
                            setNewPollMaxVotes(1);
                          }}
                          className="text-[var(--accent)]"
                        />
                      </div>
                      <p className="text-[11px] text-[var(--text-secondary)] leading-tight">
                        {language === 'hi'
                          ? 'नागरिक इस पोल में दोबारा कभी वोट नहीं दे सकता (कुकीज हटाने या ब्राउज़र बदलने पर भी ब्लॉक)'
                          : 'User can NEVER vote again in this poll (blocked across incognito, cookie clear & browser changes)'}
                      </p>
                    </div>
                    <span className="mt-2 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      🛡️ Recommended for Elections
                    </span>
                  </label>

                  <label
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex flex-col justify-between ${
                      newPollVotingPolicy === 'ALLOW_ONE_REVOTE'
                        ? 'bg-[var(--accent-soft)] border-[var(--accent)] ring-1 ring-[var(--accent)]'
                        : 'bg-[var(--bg-surface)] border-[var(--border-glass)] hover:bg-[var(--bg-glass-elevated)]'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[var(--text-primary)]">Allow 1 Revote</span>
                        <input
                          type="radio"
                          name="newPollVotingPolicy"
                          value="ALLOW_ONE_REVOTE"
                          checked={newPollVotingPolicy === 'ALLOW_ONE_REVOTE'}
                          onChange={() => {
                            setNewPollVotingPolicy('ALLOW_ONE_REVOTE');
                            setNewPollMaxVotes(2);
                          }}
                          className="text-[var(--accent)]"
                        />
                      </div>
                      <p className="text-[11px] text-[var(--text-secondary)] leading-tight">
                        {language === 'hi'
                          ? 'नागरिक अपना वोट केवल 1 बार बदल सकता है (कुल अधिकतम 2 वोट)'
                          : 'Voters can re-cast or change their vote exactly one time (total 2 submissions maximum)'}
                      </p>
                    </div>
                    <span className="mt-2 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                      🔄 1 Vote-Change Allowed
                    </span>
                  </label>

                  <label
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex flex-col justify-between ${
                      newPollVotingPolicy === 'ALLOW_MULTIPLE_VOTES'
                        ? 'bg-[var(--accent-soft)] border-[var(--accent)] ring-1 ring-[var(--accent)]'
                        : 'bg-[var(--bg-surface)] border-[var(--border-glass)] hover:bg-[var(--bg-glass-elevated)]'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[var(--text-primary)]">Multiple Votes</span>
                        <input
                          type="radio"
                          name="newPollVotingPolicy"
                          value="ALLOW_MULTIPLE_VOTES"
                          checked={newPollVotingPolicy === 'ALLOW_MULTIPLE_VOTES'}
                          onChange={() => {
                            setNewPollVotingPolicy('ALLOW_MULTIPLE_VOTES');
                            setNewPollMaxVotes(999999);
                          }}
                          className="text-[var(--accent)]"
                        />
                      </div>
                      <p className="text-[11px] text-[var(--text-secondary)] leading-tight">
                        {language === 'hi'
                          ? 'नागरिक जितनी बार चाहें मत दे सकते हैं (सामान्य जनमत सर्वेक्षण)'
                          : 'Multiple votes permitted for continuous pulse and sentiment tracking'}
                      </p>
                    </div>
                    <span className="mt-2 text-[10px] font-bold text-purple-600 dark:text-purple-400">
                      ♾️ Continuous Polling
                    </span>
                  </label>
                </div>
              </div>

              {/* SECTION: ADD CUSTOM PARTIES & LOGO UPLOAD */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-glass)] space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5 uppercase tracking-wider">
                      <Plus className="w-3.5 h-3.5 text-[var(--accent)]" />
                      <span>{language === 'hi' ? 'कस्टम पार्टियां / उम्मीदवार जोड़ें' : 'Add Custom Parties / Choices'}</span>
                    </span>
                    <p className="text-[11px] text-[var(--text-secondary)]">
                      {language === 'hi'
                        ? 'कोई भी अन्य पार्टी नाम लिखें, लोगो अपलोड करें या इमेज URL दें'
                        : 'Write any other party name and upload custom party logos'}
                    </p>
                  </div>
                  {customParties.length > 0 && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
                      {customParties.length} {language === 'hi' ? 'कस्टम' : 'custom added'}
                    </span>
                  )}
                </div>

                {/* Form to add a new custom party */}
                <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-[var(--text-secondary)] block">
                        Party Name (English)
                      </label>
                      <input
                        type="text"
                        value={newPartyNameEn}
                        onChange={(e) => handlePartyNameEnChange(e.target.value)}
                        placeholder="e.g. Kalyana Rajya Pragathi Paksha"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-glass)] text-xs text-[var(--text-primary)]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-[var(--text-secondary)] block">
                        पार्टी का नाम (हिंदी)
                      </label>
                      <input
                        type="text"
                        value={newPartyNameHi}
                        onChange={(e) => handlePartyNameHiChange(e.target.value)}
                        placeholder="कल्याण राज्य प्रगति पक्ष"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-glass)] text-xs text-[var(--text-primary)]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-[var(--text-secondary)] block">
                        Short Code
                      </label>
                      <input
                        type="text"
                        value={newPartyShort}
                        onChange={(e) => setNewPartyShort(e.target.value.toUpperCase())}
                        placeholder="e.g. KRPP"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-glass)] text-xs text-[var(--text-primary)] font-mono font-bold"
                      />
                    </div>
                  </div>

                  {/* Logo Upload & Color Picker */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 items-center">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-[var(--text-secondary)] flex items-center gap-1">
                        <Upload className="w-3 h-3 text-[var(--accent)]" />
                        <span>Upload Logo or Paste Image URL</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <label className="px-3 py-1.5 rounded-lg bg-[var(--accent-soft)] hover:bg-[var(--accent-soft)]/80 text-[var(--accent)] font-bold text-xs cursor-pointer flex items-center gap-1.5 border border-[var(--accent)]/30 shrink-0 transition-colors">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Choose Image</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoFileUpload}
                            className="hidden"
                          />
                        </label>
                        <input
                          type="text"
                          value={newPartyLogo.startsWith('data:') ? 'Image selected from device' : newPartyLogo}
                          onChange={(e) => setNewPartyLogo(e.target.value)}
                          placeholder="or paste https://...logo.png"
                          className="flex-1 px-2.5 py-1.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-glass)] text-xs text-[var(--text-primary)] truncate"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0">
                      {/* Logo Preview */}
                      {newPartyLogo ? (
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-xl bg-white border border-[var(--border-glass)] p-1 flex items-center justify-center overflow-hidden shadow-xs shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={newPartyLogo} alt="Party Logo" className="w-full h-full object-contain" />
                          </div>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Logo Ready</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-tertiary)]">
                          <ImageIcon className="w-4 h-4" />
                          <span>Optional (auto monogram if none)</span>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={handleAddCustomParty}
                        className="py-1.5 px-3.5 rounded-xl bg-[var(--accent)] hover:opacity-90 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0 transition-all active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Party</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* List of currently added custom parties */}
                {customParties.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
                      Added Custom Choices:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {customParties.map((cp) => (
                        <div
                          key={cp.id}
                          className="p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] flex items-center justify-between gap-2 shadow-2xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-white border border-[var(--border-glass)] p-0.5 flex items-center justify-center shrink-0 overflow-hidden">
                              {cp.logo_url ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img src={cp.logo_url} alt={cp.name_en} className="w-full h-full object-contain" />
                              ) : (
                                <span className="font-bold text-[10px] text-[var(--accent)]">{cp.short_name.slice(0, 3)}</span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-xs text-[var(--text-primary)] truncate block">
                                {cp.name_en} ({cp.short_name})
                              </span>
                              <span className="text-[10px] text-[var(--text-secondary)] truncate block">
                                {cp.name_hi}
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveCustomParty(cp.id)}
                            className="p-1 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer shrink-0"
                            title="Remove option"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION: SELECT RECOGNIZED PARTIES */}
              <div className="p-3.5 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-glass)] space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
                    {language === 'hi' ? 'मान्यता प्राप्त दलों का चयन करें:' : 'Include Recognized Parties:'}
                  </label>
                  <span className="text-[11px] text-[var(--text-tertiary)] font-mono">
                    {newPollPartyIds.length} selected
                  </span>
                </div>

                {(() => {
                  const partyMap = new Map<string, Party>();
                  OFFICIAL_PARTIES.forEach((p) => partyMap.set(p.id, p));
                  allParties.forEach((p) => partyMap.set(p.id, p));
                  const combined = Array.from(partyMap.values());
                  const filtered = combined.filter((p) => {
                    if (!partySearchQuery.trim()) return true;
                    const q = partySearchQuery.toLowerCase();
                    return (
                      p.name_en.toLowerCase().includes(q) ||
                      p.name_hi.toLowerCase().includes(q) ||
                      (p.short_name && p.short_name.toLowerCase().includes(q))
                    );
                  });

                  return (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <Search className="w-3.5 h-3.5 text-[var(--text-tertiary)] absolute left-2.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={partySearchQuery}
                            onChange={(e) => setPartySearchQuery(e.target.value)}
                            placeholder="Filter parties by name or code..."
                            className="w-full pl-8 pr-2.5 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-glass)] text-xs text-[var(--text-primary)]"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (newPollPartyIds.length === combined.length) {
                              setNewPollPartyIds([]);
                            } else {
                              setNewPollPartyIds(combined.map((p) => p.id));
                            }
                          }}
                          className="py-1 px-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-glass)] text-[11px] font-semibold text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-colors shrink-0"
                        >
                          {newPollPartyIds.length === combined.length ? 'Deselect All' : 'Select All'}
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)]">
                        {filtered.map((party) => {
                          const isChecked = newPollPartyIds.includes(party.id);
                          return (
                            <label
                              key={party.id}
                              className={`flex items-center gap-2 cursor-pointer text-xs p-1.5 rounded-lg border transition-all ${
                                isChecked
                                  ? 'bg-[var(--accent-soft)] border-[var(--accent)]/40 text-[var(--text-primary)] font-bold'
                                  : 'border-transparent hover:bg-[var(--bg-primary)] text-[var(--text-secondary)]'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setNewPollPartyIds([...newPollPartyIds, party.id]);
                                  } else {
                                    setNewPollPartyIds(newPollPartyIds.filter((id) => id !== party.id));
                                  }
                                }}
                                className="rounded text-[var(--accent)] focus:ring-[var(--accent)] shrink-0"
                              />
                              <div className="w-5 h-5 rounded bg-white border border-[var(--border-glass)] p-0.5 flex items-center justify-center shrink-0 overflow-hidden">
                                {party.logo_url ? (
                                  /* eslint-disable-next-line @next/next/no-img-element */
                                  <img src={party.logo_url} alt={party.name_en} className="w-full h-full object-contain" />
                                ) : party.symbol_svg ? (
                                  <div
                                    className="w-full h-full flex items-center justify-center"
                                    dangerouslySetInnerHTML={{ __html: party.symbol_svg }}
                                  />
                                ) : (
                                  <span className="font-bold text-[9px] text-[var(--accent)]">{party.short_name?.slice(0, 2) || 'P'}</span>
                                )}
                              </div>
                              <span className="truncate text-[11px]">
                                {party.short_name ? `${party.short_name} - ` : ''}
                                {language === 'hi' ? party.name_hi : party.name_en}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border-glass)]">
                <button
                  type="button"
                  onClick={() => setIsCreatingPoll(false)}
                  className="py-2.5 px-4 rounded-xl text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] cursor-pointer transition-colors"
                >
                  {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-6 rounded-xl bg-[var(--accent)] hover:opacity-90 text-white font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95 flex items-center gap-2"
                >
                  <Vote className="w-4 h-4" />
                  <span>{language === 'hi' ? 'जनमत सर्वेक्षण प्रकाशित करें' : 'Create & Launch Poll'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD NEW PARTY MODAL */}
      {isAddingPartyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-glass)] p-5 sm:p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-glass)]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] shrink-0">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                    {language === 'hi' ? 'नया राजनीतिक दल / उम्मीदवार पंजीकृत करें' : 'Register New Political Party / Choice'}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {language === 'hi'
                      ? 'डेटाबेस में सहेजें ताकि यह सभी जनमत सर्वेक्षणों में चयन हेतु उपलब्ध हो'
                      : 'Saved into database and selectable across all current and future polls'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingPartyModal(false)}
                className="p-1 rounded-lg hover:bg-[var(--bg-glass-elevated)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateParty} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[var(--text-secondary)] block">
                    Party Name (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={createPartyNameEn}
                    onChange={(e) => {
                      setCreatePartyNameEn(e.target.value);
                      if (autoTranslateEnabled) {
                        setCreatePartyNameHi(translateEnToHi(e.target.value));
                      }
                      if (!createPartyShort) {
                        const words = e.target.value.trim().split(/\s+/);
                        const abbr = words.map((w) => w[0]).join('').toUpperCase().slice(0, 5);
                        setCreatePartyShort(abbr);
                      }
                    }}
                    placeholder="e.g. Rashtriya Lok Dal"
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-glass)] text-xs text-[var(--text-primary)] font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[var(--text-secondary)] block">
                    पार्टी का नाम (हिंदी में) *
                  </label>
                  <input
                    type="text"
                    required
                    value={createPartyNameHi}
                    onChange={(e) => {
                      setCreatePartyNameHi(e.target.value);
                      if (autoTranslateEnabled && !createPartyNameEn) {
                        setCreatePartyNameEn(translateHiToEn(e.target.value));
                      }
                    }}
                    placeholder="उदा. राष्ट्रीय लोक दल"
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-glass)] text-xs text-[var(--text-primary)] font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[var(--text-secondary)] block">
                    Short Abbreviation / Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={createPartyShort}
                    onChange={(e) => setCreatePartyShort(e.target.value.toUpperCase())}
                    placeholder="e.g. RLD"
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-glass)] text-xs text-[var(--text-primary)] font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[var(--text-secondary)] block">
                    Brand Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={createPartyColor}
                      onChange={(e) => setCreatePartyColor(e.target.value)}
                      className="w-9 h-9 rounded-xl border border-[var(--border-glass)] cursor-pointer p-0.5 bg-[var(--bg-primary)]"
                    />
                    <input
                      type="text"
                      value={createPartyColor}
                      onChange={(e) => setCreatePartyColor(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-glass)] text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Logo Upload / URL */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-glass)]">
                <label className="font-bold text-[var(--text-secondary)] flex items-center gap-1.5 uppercase tracking-wider block">
                  <Upload className="w-3.5 h-3.5 text-[var(--accent)]" />
                  <span>Upload Party Logo / Symbol</span>
                </label>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <label className="py-2 px-3 rounded-xl bg-[var(--accent-soft)] hover:bg-[var(--accent-soft)]/80 text-[var(--accent)] font-bold text-xs cursor-pointer flex items-center justify-center gap-2 border border-[var(--accent)]/30 transition-colors shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Logo File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePartyLogoFileUpload}
                      className="hidden"
                    />
                  </label>
                  <input
                    type="text"
                    value={createPartyLogo.startsWith('data:') ? 'Image selected from device' : createPartyLogo}
                    onChange={(e) => setCreatePartyLogo(e.target.value)}
                    placeholder="or paste image URL (https://...)"
                    className="flex-1 px-3 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] text-xs text-[var(--text-primary)] truncate"
                  />
                </div>

                {/* Logo Preview */}
                <div className="flex items-center gap-3 pt-1">
                  <div className="w-12 h-12 rounded-xl bg-white border border-[var(--border-glass)] p-1 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                    {createPartyLogo ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={createPartyLogo} alt="Party Logo Preview" className="w-full h-full object-contain" />
                    ) : (
                      <span className="font-bold text-xs text-[var(--accent)] font-mono">
                        {createPartyShort.slice(0, 3) || 'LOGO'}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)]">
                    {createPartyLogo ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                        ✓ Logo ready to save
                      </span>
                    ) : (
                      <span>Optional. If not provided, an official monogram badge will be generated.</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[var(--border-glass)]">
                <button
                  type="button"
                  onClick={() => setIsAddingPartyModal(false)}
                  className="py-2.5 px-4 rounded-xl text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingParty}
                  className="py-2.5 px-6 rounded-xl bg-[var(--accent)] hover:opacity-90 text-white font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95 disabled:opacity-50 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingParty ? 'Saving...' : 'Save Party to Database'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM RESET VOTES MODAL */}
      {resetModalPollId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[var(--bg-primary)] border border-red-500/30 p-6 space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-[var(--text-primary)]">Reset All Votes to Zero?</h3>
              <p className="text-xs text-[var(--text-secondary)]">
                This will set all party tallies in poll <strong className="text-red-500 font-bold">{resetModalPollId}</strong> to 0 and clear existing voter participation tokens. This action is irreversible.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setResetModalPollId(null)}
                className="py-2.5 px-4 rounded-xl text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleResetPollVotes(resetModalPollId)}
                className="py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Yes, Reset Votes to 0
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
