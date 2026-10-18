'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { DisclaimerBanner } from '@/components/layout/DisclaimerBanner';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassBadge } from '@/components/ui/GlassBadge';
import { GlassButton } from '@/components/ui/GlassButton';
import { OFFICIAL_PARTIES, INDIAN_STATES, IndianState } from '@/lib/data/parties';
import { Poll, OptionResult, SiteSettings, AuditEvent } from '@/lib/types';
import { DbSupporter } from '@/lib/supabase';
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
  CheckCircle2,
  XCircle,
  Eye,
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
} from 'lucide-react';

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
  const [newPollTitleEn, setNewPollTitleEn] = useState('');
  const [newPollTitleHi, setNewPollTitleHi] = useState('');
  const [newPollSlug, setNewPollSlug] = useState('');
  const [newPollDescEn, setNewPollDescEn] = useState('');
  const [newPollDescHi, setNewPollDescHi] = useState('');
  const [newPollPartyIds, setNewPollPartyIds] = useState<string[]>(['bjp', 'inc', 'aap', 'bsp', 'cpi-m']);

  // Settings State
  const [tempSettings, setTempSettings] = useState<SiteSettings | null>(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Vote tally edit map: pollId -> optionId -> count
  const [tallyInputs, setTallyInputs] = useState<Record<string, Record<string, number>>>({});

  // Confirm Reset modal
  const [resetModalPollId, setResetModalPollId] = useState<string | null>(null);

  // Check existing session
  useEffect(() => {
    const savedSession = sessionStorage.getItem('meravote_admin_auth');
    if (savedSession === 'true') {
      setIsAuthenticated(true);
    }
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
      const [statsRes, pollsRes, settingsRes, supportersRes, auditRes] = await Promise.all([
        fetch('/api/admin/stats').catch(() => null),
        fetch('/api/admin/polls').catch(() => null),
        fetch('/api/admin/settings').catch(() => null),
        fetch('/api/admin/supporters').catch(() => null),
        fetch('/api/admin/audit?limit=40').catch(() => null),
      ]);

      if (statsRes?.ok) {
        const d = await statsRes.json();
        if (d.success) setStats(d.data);
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
    if (isAuthenticated) {
      fetchAllData();
    }
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

  const handleCreateNewPoll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPollTitleEn || !newPollTitleHi) {
      showToast('English and Hindi titles are required', true);
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
          status: 'LIVE',
          party_ids: newPollPartyIds,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(language === 'hi' ? 'नया जनमत सर्वेक्षण बनाया गया' : 'New Poll Created Successfully');
        setIsCreatingPoll(false);
        setNewPollTitleEn('');
        setNewPollTitleHi('');
        setNewPollSlug('');
        setNewPollDescEn('');
        setNewPollDescHi('');
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
                This administration dashboard operates on aggregate cryptographic tallies. Zero voter names, zero mobile numbers, zero EPIC voter IDs, and zero traceable vote selections are ever recorded or accessible.
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
              <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
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
                          Enter custom value & click 'Update' to adjust individual counts
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
                          <span className="font-bold text-amber-600 dark:text-amber-400">₹{sup.amount}</span>
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
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              {language === 'hi' ? 'मान्यता प्राप्त राजनीतिक दल एवं प्रतीक' : 'Official Recognized Political Parties'}
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              ECI recognized national and state political parties directory with verified SVG symbols
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {OFFICIAL_PARTIES.map((party) => (
              <div
                key={party.id}
                className="p-3.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-glass)] flex items-center gap-3.5 shadow-sm"
              >
                <div
                  className="w-12 h-12 rounded-xl p-2 bg-[var(--bg-primary)] border border-[var(--border-glass)] flex items-center justify-center shrink-0"
                  dangerouslySetInnerHTML={{ __html: party.symbol_svg }}
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-[var(--accent)] font-mono">
                      {party.short_name || party.id.toUpperCase()}
                    </span>
                    {party.color && (
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: party.color }} />
                    )}
                  </div>
                  <span className="text-xs font-bold text-[var(--text-primary)] truncate block">
                    {language === 'hi' ? party.name_hi : party.name_en}
                  </span>
                  <span className="text-[11px] text-[var(--text-tertiary)] block truncate">
                    {party.symbol_alt_en}
                  </span>
                </div>
              </div>
            ))}
          </div>

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
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-glass)] text-xs text-[var(--text-primary)]"
                  >
                    <option value="LIVE">LIVE</option>
                    <option value="PAUSED">PAUSED</option>
                    <option value="CLOSED">CLOSED</option>
                    <option value="DRAFT">DRAFT</option>
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
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-glass)] text-xs text-[var(--text-primary)]"
                  >
                    <option value="PUBLIC">PUBLIC</option>
                    <option value="ADMIN_ONLY">ADMIN_ONLY</option>
                    <option value="AFTER_CLOSE">AFTER_CLOSE</option>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-glass)] p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-glass)]">
              <h3 className="text-lg font-bold text-[var(--text-primary)]">Launch New Opinion Poll</h3>
              <button
                type="button"
                onClick={() => setIsCreatingPoll(false)}
                className="p-1 rounded-lg hover:bg-[var(--bg-surface)] text-[var(--text-tertiary)] cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewPoll} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
                  Poll Title (English) *
                </label>
                <input
                  type="text"
                  required
                  value={newPollTitleEn}
                  onChange={(e) => setNewPollTitleEn(e.target.value)}
                  placeholder="e.g. 2029 Delhi Assembly Civic Opinion Poll"
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-glass)] text-xs text-[var(--text-primary)]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
                  Poll Title (Hindi) *
                </label>
                <input
                  type="text"
                  required
                  value={newPollTitleHi}
                  onChange={(e) => setNewPollTitleHi(e.target.value)}
                  placeholder="उदा. 2029 दिल्ली विधानसभा नागरिक जनमत सर्वेक्षण"
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-glass)] text-xs text-[var(--text-primary)]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
                  URL Slug
                </label>
                <input
                  type="text"
                  value={newPollSlug}
                  onChange={(e) => setNewPollSlug(e.target.value)}
                  placeholder="e.g. delhi-assembly-poll-2029"
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-glass)] text-xs text-[var(--text-primary)] font-mono"
                />
              </div>

              {/* Select Parties */}
              <div className="space-y-1">
                <label className="font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
                  Include Recognized Parties
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-glass)]">
                  {OFFICIAL_PARTIES.map((party) => {
                    const isChecked = newPollPartyIds.includes(party.id);
                    return (
                      <label key={party.id} className="flex items-center gap-2 cursor-pointer text-xs">
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
                          className="rounded text-[var(--accent)]"
                        />
                        <span className="truncate">{party.short_name || party.name_en}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-glass)]">
                <button
                  type="button"
                  onClick={() => setIsCreatingPoll(false)}
                  className="py-2 px-4 rounded-xl text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 rounded-xl bg-[var(--accent)] hover:opacity-90 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Create & Launch Poll
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
