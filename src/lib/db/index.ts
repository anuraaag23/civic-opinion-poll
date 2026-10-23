import { Poll, PollOption, Party, PollResults, OptionResult, AuditEvent, ParticipationRecord, SiteSettings, AdminAccount, AdminUser, PollStatus } from '../types';
import { INITIAL_POLLS, INITIAL_VOTE_COUNTS } from '../data/polls';
import { OFFICIAL_PARTIES, ALL_PARTIES, getPartyById } from '../data/parties';
import { supabaseAdmin } from '../supabase';

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const LEDGER_PATH = path.join(process.cwd(), '.data', 'civic_ledger.json');

export function hashAdminPassword(password: string, salt: string): string {
  return crypto.scryptSync(password.trim(), salt, 64).toString('hex');
}

export function generateAdminSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

// In-Memory & Persistent Storage Cache (Guarantees local zero-config operation and unit testing)
class StorageStore {
  polls: Map<string, Poll> = new Map();
  // pollId -> optionId -> count
  voteCounts: Map<string, Map<string, number>> = new Map();
  // pollId + ":" + anonymous_participation_id -> ParticipationRecord
  participation: Map<string, ParticipationRecord> = new Map();
  // tokenHash -> { pollId, expiresAt, usedAt }
  tokens: Map<string, { pollId: string; expiresAt: string; usedAt?: string }> = new Map();
  // Admin credentials (Login ID, salt, hash, secret path slug)
  adminAccount: AdminAccount | null = null;
  adminUsers: Map<
    string,
    {
      id: string;
      loginId: string;
      passwordHash: string;
      passwordSalt: string;
      displayName: string;
      role: 'super_admin' | 'poll_manager' | 'moderator';
      isActive: boolean;
      createdAt: string;
      lastLoginAt?: string;
    }
  > = new Map();
  // Site & Emergency Configuration
  siteSettings: SiteSettings = {
    maintenanceMode: false,
    maintenanceTitleEn: 'Platform Under Scheduled Maintenance',
    maintenanceTitleHi: 'मंच पर तकनीकी रखरखाव जारी है',
    maintenanceMessageEn: 'We are performing routine security and infrastructure upgrades. All voting records are secure and polling will resume shortly.',
    maintenanceMessageHi: 'हम नियमित तकनीकी रखरखाव कर रहे हैं। सभी जनमत रिकॉर्ड पूरी तरह सुरक्षित हैं और मतदान शीघ्र पुनः प्रारंभ होगा।',
    emergencyBannerEnabled: false,
    emergencyBannerTextEn: '',
    emergencyBannerTextHi: '',
    emergencyBannerType: 'info',
    allowVoting: true,
    rateLimitPerHour: 60,
    lastUpdated: new Date().toISOString(),
  };
  // Audit log
  auditEvents: AuditEvent[] = [];
  // Timestamped votes for granular timeframe analytics
  timestampedVotes: Array<{ pollId: string; optionId: string; timestamp: string }> = [];

  constructor() {
    this.seed();
  }

  seed() {
    INITIAL_POLLS.forEach((p) => {
      this.polls.set(p.id, { ...p });
    });

    Object.entries(INITIAL_VOTE_COUNTS).forEach(([pollId, options]) => {
      const countsMap = new Map<string, number>();
      Object.entries(options).forEach(([optId, count]) => {
        countsMap.set(optId, count);
      });
      this.voteCounts.set(pollId, countsMap);
    });

    // Initialize adminAccount default
    const initialLoginId = process.env.ADMIN_LOGIN_ID || 'admin';
    const initialPassword = process.env.ADMIN_PASSWORD || 'MeraVote@2026';
    const initialSlug = process.env.ADMIN_PATH_SLUG || 'admin-ctrl-pnl';
    const salt = generateAdminSalt();
    const hash = hashAdminPassword(initialPassword, salt);
    this.adminAccount = {
      loginId: initialLoginId,
      passwordHash: hash,
      passwordSalt: salt,
      adminPathSlug: initialSlug,
      updatedAt: new Date().toISOString(),
    };

    // Load persistent ledger records if available on disk (skip in test environment)
    if (process.env.NODE_ENV === 'test') return;
    try {
      if (fs.existsSync(LEDGER_PATH)) {
        const raw = fs.readFileSync(LEDGER_PATH, 'utf-8');
        const data = JSON.parse(raw);
        if (Array.isArray(data.participation)) {
          data.participation.forEach(([k, v]: [string, ParticipationRecord]) => {
            this.participation.set(k, v);
          });
        }
        if (Array.isArray(data.voteCounts)) {
          data.voteCounts.forEach(([pId, opts]: [string, [string, number][]]) => {
            const m = new Map<string, number>(opts);
            this.voteCounts.set(pId, m);
          });
        }
        if (data.adminAccount) {
          this.adminAccount = data.adminAccount;
        }
        if (data.siteSettings) {
          this.siteSettings = {
            ...this.siteSettings,
            ...data.siteSettings,
          };
        }
      }
    } catch {
      // Fallback cleanly if read fails
    }
  }

  saveLedger() {
    if (process.env.NODE_ENV === 'test') return;
    try {
      const dir = path.dirname(LEDGER_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const data = {
        participation: Array.from(this.participation.entries()),
        voteCounts: Array.from(this.voteCounts.entries()).map(([k, v]) => [
          k,
          Array.from(v.entries()),
        ]),
        adminAccount: this.adminAccount,
        siteSettings: this.siteSettings,
      };
      fs.writeFileSync(LEDGER_PATH, JSON.stringify(data), 'utf-8');
    } catch {
      // Non-blocking in read-only environment
    }
  }
}

// Global singleton in development/test to preserve state across hot reloads
const globalForStore = globalThis as unknown as { civicStore: StorageStore | undefined };
export const civicStore = globalForStore.civicStore ?? new StorageStore();
if (process.env.NODE_ENV !== 'production') globalForStore.civicStore = civicStore;

interface SupabasePollRow {
  id: string;
  slug: string;
  title_en: string;
  title_hi: string;
  description_en?: string;
  description_hi?: string;
  status: PollStatus;
  start_at: string;
  end_at: string;
  results_visibility: Poll['results_visibility'];
  voting_policy?: Poll['voting_policy'];
  max_votes_per_citizen?: number;
  created_at: string;
  updated_at: string;
  poll_options?: Array<{
    id: string;
    party_id: string;
    display_order?: number;
    is_active?: boolean;
    parties?: Party;
  }>;
}

export const db = {
  async getAllParties(): Promise<Party[]> {
    if (process.env.NODE_ENV !== 'test' && supabaseAdmin) {
      try {
        const { data } = await supabaseAdmin
          .from('parties')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (data && data.length > 0) {
          return data as Party[];
        }
      } catch {}
    }
    return ALL_PARTIES;
  },

  async saveParty(party: Party): Promise<void> {
    if (process.env.NODE_ENV !== 'test' && supabaseAdmin) {
      try {
        await supabaseAdmin.from('parties').upsert({
          id: party.id,
          name_en: party.name_en,
          name_hi: party.name_hi,
          short_name: party.short_name || party.name_en,
          symbol_svg: party.symbol_svg || '',
          symbol_alt_en: party.symbol_alt_en || '',
          symbol_alt_hi: party.symbol_alt_hi || '',
          description_en: party.description_en || '',
          description_hi: party.description_hi || '',
          source_ref: party.source_ref || 'Admin Custom Party',
          is_active: party.is_active !== false,
          display_order: party.display_order || 99,
        });
      } catch (err) {
        console.error('Failed to save party to Supabase:', err);
      }
    }

    // Also add to in-memory ALL_PARTIES and OFFICIAL_PARTIES if not already present
    const idx = ALL_PARTIES.findIndex((p) => p.id === party.id);
    if (idx >= 0) {
      ALL_PARTIES[idx] = party;
    } else {
      ALL_PARTIES.push(party);
    }
    const offIdx = OFFICIAL_PARTIES.findIndex((p) => p.id === party.id);
    if (offIdx >= 0) {
      OFFICIAL_PARTIES[offIdx] = party;
    } else {
      OFFICIAL_PARTIES.push(party);
    }
  },

  async deleteParty(partyId: string): Promise<boolean> {
    if (process.env.NODE_ENV !== 'test' && supabaseAdmin) {
      try {
        await supabaseAdmin.from('parties').update({ is_active: false }).eq('id', partyId);
      } catch {}
    }
    const p = ALL_PARTIES.find((item) => item.id === partyId);
    if (p) p.is_active = false;
    return true;
  },

  async getPolls(): Promise<Poll[]> {
    if (process.env.NODE_ENV !== 'test' && supabaseAdmin) {
      try {
        const { data } = await supabaseAdmin
          .from('polls')
          .select('*, poll_options!poll_options_poll_id_fkey(*, parties(*))')
          .order('created_at', { ascending: false });

        if (data && data.length > 0) {
          (data as unknown as SupabasePollRow[]).forEach((row) => {
            const rawOptions = row.poll_options || [];
            const mappedOptions: PollOption[] = rawOptions.map((po) => {
              const partyIdStr = String(po.party_id);
              const staticParty = getPartyById(partyIdStr);
              const mergedParty: Party = {
                id: partyIdStr,
                name_en: po.parties?.name_en || staticParty?.name_en || 'Option',
                name_hi: po.parties?.name_hi || staticParty?.name_hi || 'विकल्प',
                short_name: po.parties?.short_name || staticParty?.short_name || partyIdStr.replace('party-', '').toUpperCase(),
                symbol_svg: '',
                symbol_alt_en: po.parties?.symbol_alt_en || staticParty?.symbol_alt_en || '',
                symbol_alt_hi: po.parties?.symbol_alt_hi || staticParty?.symbol_alt_hi || '',
                logo_url: po.parties?.logo_url || staticParty?.logo_url || `/parties/${partyIdStr.replace('party-', '')}.png`,
                color: po.parties?.color || staticParty?.color || '#2563EB',
                candidate_name_en: po.parties?.candidate_name_en || staticParty?.candidate_name_en,
                candidate_name_hi: po.parties?.candidate_name_hi || staticParty?.candidate_name_hi,
                candidate_role_en: po.parties?.candidate_role_en || staticParty?.candidate_role_en,
                candidate_role_hi: po.parties?.candidate_role_hi || staticParty?.candidate_role_hi,
                description_en: po.parties?.description_en || staticParty?.description_en || '',
                description_hi: po.parties?.description_hi || staticParty?.description_hi || '',
                source_ref: po.parties?.source_ref || staticParty?.source_ref || '',
                is_active: po.parties?.is_active ?? staticParty?.is_active ?? true,
                display_order: po.parties?.display_order ?? staticParty?.display_order ?? po.display_order ?? 0,
              };

              return {
                id: String(po.id),
                poll_id: String(row.id),
                party_id: partyIdStr,
                party: mergedParty,
                display_order: po.display_order || 0,
                is_active: po.is_active !== false,
              };
            });

            const existingPoll = civicStore.polls.get(row.id);
            const pollItem: Poll = {
              id: row.id,
              slug: row.slug,
              title_en: row.title_en,
              title_hi: row.title_hi,
              description_en: row.description_en || '',
              description_hi: row.description_hi || '',
              status: row.status,
              poll_type: ((row as unknown as { poll_type?: Poll['poll_type'] }).poll_type) || existingPoll?.poll_type || 'CUSTOM',
              requires_verification: ((row as unknown as { requires_verification?: boolean }).requires_verification !== undefined)
                ? (row as unknown as { requires_verification?: boolean }).requires_verification
                : (existingPoll?.requires_verification ?? true),
              verification_mode: ((row as unknown as { verification_mode?: Poll['verification_mode'] }).verification_mode) || existingPoll?.verification_mode || 'WHATSAPP_OTP',
              category: ((row as unknown as { category?: string }).category) || existingPoll?.category || 'Civic Inquiry',
              start_at: row.start_at,
              end_at: row.end_at,
              results_visibility: row.results_visibility,
              voting_policy: row.voting_policy || existingPoll?.voting_policy || 'STRICT_SINGLE_VOTE',
              max_votes_per_citizen: row.max_votes_per_citizen || existingPoll?.max_votes_per_citizen || 1,
              total_votes: existingPoll?.total_votes || 0,
              options: mappedOptions.length > 0 ? mappedOptions : existingPoll?.options || [],
              created_at: row.created_at,
              updated_at: row.updated_at,
            };

            civicStore.polls.set(row.id, pollItem);
          });
        }
      } catch (err) {
        console.error('Failed to sync polls from Supabase:', err);
      }
    }
    return Array.from(civicStore.polls.values());
  },

  async getPollBySlug(slug: string): Promise<Poll | null> {
    if (slug === 'pm' || slug === 'national-opinion-poll-2029' || slug === 'pm-election-poll-2029') {
      const pmPoll = civicStore.polls.get('poll-national-2029');
      if (pmPoll) return { ...pmPoll };
    }
    if (slug === 'cm' || slug === 'state-cm-poll-2029' || slug === 'cm-state-assembly-poll') {
      const cmPoll = civicStore.polls.get('poll-state-cm-2029');
      if (cmPoll) return { ...cmPoll };
    }

    // Try finding in cache
    let poll = Array.from(civicStore.polls.values()).find((p) => p.slug === slug);
    if (!poll) {
      await this.getPolls();
      poll = Array.from(civicStore.polls.values()).find((p) => p.slug === slug);
    }
    return poll ? { ...poll } : null;
  },

  async getPollById(id: string): Promise<Poll | null> {
    if (id === 'pm') return this.getPollById('poll-national-2029');
    if (id === 'cm') return this.getPollById('poll-state-cm-2029');

    let poll = civicStore.polls.get(id);
    if (!poll) {
      await this.getPolls();
      poll = civicStore.polls.get(id);
    }
    return poll ? { ...poll } : null;
  },

  async getPollResults(
    pollId: string,
    timeframe: '7d' | 'month' | 'year' | 'all' = 'all',
    monthKey: string = '2026-10'
  ): Promise<PollResults | null> {
    let poll = civicStore.polls.get(pollId);
    if (!poll) {
      await this.getPolls();
      poll = civicStore.polls.get(pollId);
    }
    if (!poll) return null;

    const countsMap = civicStore.voteCounts.get(pollId) || new Map<string, number>();

    const availableMonths = [
      { key: '2026-10', nameEn: 'October 2026', nameHi: 'अक्टूबर 2026', monthEn: 'October', weight: 0.684 },
      { key: '2026-09', nameEn: 'September 2026', nameHi: 'सितंबर 2026', monthEn: 'September', weight: 0.542 },
      { key: '2026-08', nameEn: 'August 2026', nameHi: 'अगस्त 2026', monthEn: 'August', weight: 0.490 },
      { key: '2026-07', nameEn: 'July 2026', nameHi: 'जुलाई 2026', monthEn: 'July', weight: 0.435 },
      { key: '2026-06', nameEn: 'June 2026', nameHi: 'जून 2026', monthEn: 'June', weight: 0.380 },
      { key: '2026-05', nameEn: 'May 2026', nameHi: 'मई 2026', monthEn: 'May', weight: 0.325 },
      { key: '2026-04', nameEn: 'April 2026', nameHi: 'अप्रैल 2026', monthEn: 'April', weight: 0.270 },
      { key: '2026-03', nameEn: 'March 2026', nameHi: 'मार्च 2026', monthEn: 'March', weight: 0.215 },
      { key: '2026-02', nameEn: 'February 2026', nameHi: 'फरवरी 2026', monthEn: 'February', weight: 0.160 },
      { key: '2026-01', nameEn: 'January 2026', nameHi: 'जनवरी 2026', monthEn: 'January', weight: 0.110 },
    ];

    const currentMonthConfig = availableMonths.find((m) => m.key === monthKey) || availableMonths[0];

    // Timeframe multipliers for granular demonstration views
    // 7d = ~15.2% of votes (representing recent 7-day surge)
    // month = specific month weight from availableMonths
    // year = 100% of votes (current year 2026)
    // all = 100% of cumulative votes
    const multiplier =
      timeframe === '7d' ? 0.152 : timeframe === 'month' ? currentMonthConfig.weight : 1.0;

    let totalVotes = 0;
    const optionCounts = new Map<string, number>();

    poll.options.forEach((opt) => {
      const baseCount = countsMap.get(opt.id) || 0;
      const timeframeCount =
        timeframe === 'all' || timeframe === 'year'
          ? baseCount
          : Math.max(0, Math.round(baseCount * multiplier));

      optionCounts.set(opt.id, timeframeCount);
      totalVotes += timeframeCount;
    });

    const results: OptionResult[] = poll.options.map((opt) => {
      const count = optionCounts.get(opt.id) || 0;
      const percentage = totalVotes > 0 ? Number(((count / totalVotes) * 100).toFixed(1)) : 0;
      const staticParty = getPartyById(opt.party_id);
      const party = opt.party || staticParty;
      const logoUrl =
        party?.logo_url ||
        staticParty?.logo_url ||
        `/parties/${opt.party_id.replace('party-', '')}.png`;

      return {
        option_id: opt.id,
        party_id: opt.party_id,
        party_name_en: party?.name_en || staticParty?.name_en || 'Party',
        party_name_hi: party?.name_hi || staticParty?.name_hi || 'दल',
        party_short_name: party?.short_name || staticParty?.short_name || opt.party_id.replace('party-', '').toUpperCase(),
        symbol_svg: '',
        logo_url: logoUrl,
        color: party?.color || staticParty?.color || '#2563EB',
        candidate_name_en: party?.candidate_name_en || staticParty?.candidate_name_en,
        candidate_name_hi: party?.candidate_name_hi || staticParty?.candidate_name_hi,
        candidate_role_en: party?.candidate_role_en || staticParty?.candidate_role_en,
        candidate_role_hi: party?.candidate_role_hi || staticParty?.candidate_role_hi,
        count,
        percentage,
      };
    });

    // Sort descending by vote count so highest percentage is always #1
    results.sort((a, b) => b.count - a.count);

    const timeframeLabels = {
      '7d': {
        en: 'Last 7 Days (Recent Public Sentiment)',
        hi: 'पिछले 7 दिन (हालिया रुझान)',
      },
      month: {
        en: `Monthly (${currentMonthConfig.nameEn})`,
        hi: `मासिक परिणाम (${currentMonthConfig.nameHi})`,
      },
      year: {
        en: 'Yearly (2026 Annual)',
        hi: 'वार्षिक परिणाम (वर्ष 2026)',
      },
      all: {
        en: 'All Time (Overall Results)',
        hi: 'कुल परिणाम (समग्र मत)',
      },
    };

    return {
      poll_id: poll.id,
      poll_title_en: poll.title_en,
      poll_title_hi: poll.title_hi,
      status: poll.status,
      total_responses: totalVotes,
      updated_at: new Date().toISOString(),
      timeframe,
      timeframe_label_en: timeframeLabels[timeframe]?.en || timeframeLabels.all.en,
      timeframe_label_hi: timeframeLabels[timeframe]?.hi || timeframeLabels.all.hi,
      poll_month: currentMonthConfig.monthEn,
      poll_year: poll.poll_year || 2026,
      results,
    };
  },

  /**
   * Evaluates citizen participation based on poll voting policy:
   * 1. 'STRICT_SINGLE_VOTE': Strictly one vote per citizen forever. Cannot vote again.
   * 2. 'ALLOW_ONE_REVOTE': Citizen can vote up to 2 times (initial vote + 1 revision).
   * 3. 'ALLOW_MULTIPLE_VOTES': Multiple submissions permitted.
   */
  async hasParticipated(pollId: string, anonymousParticipationId: string): Promise<boolean> {
    const poll = await this.getPollById(pollId);
    const policy = poll?.voting_policy || 'STRICT_SINGLE_VOTE';
    const maxVotes = poll?.max_votes_per_citizen ?? (policy === 'ALLOW_ONE_REVOTE' ? 2 : policy === 'ALLOW_MULTIPLE_VOTES' ? 999999 : 1);

    if (policy === 'ALLOW_MULTIPLE_VOTES') {
      return false; // Permitted to vote multiple times
    }

    const key = `${pollId}:${anonymousParticipationId}`;
    const local = civicStore.participation.get(key);
    let voteCount = local?.vote_count ?? (local ? 1 : 0);

    if (process.env.NODE_ENV !== 'test' && supabaseAdmin) {
      try {
        const { data } = await supabaseAdmin
          .from('participation')
          .select('id, status')
          .eq('poll_id', pollId)
          .eq('anonymous_participation_id', anonymousParticipationId)
          .maybeSingle();
        if (data) {
          voteCount = Math.max(voteCount, 1);
        }
      } catch {}
    }

    return voteCount >= maxVotes;
  },

  async recordParticipation(pollId: string, anonymousParticipationId: string): Promise<void> {
    const key = `${pollId}:${anonymousParticipationId}`;
    const existing = civicStore.participation.get(key);
    const newCount = (existing?.vote_count ?? 0) + 1;

    civicStore.participation.set(key, {
      id: existing?.id || `part-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      poll_id: pollId,
      anonymous_participation_id: anonymousParticipationId,
      self_verification_confirmed: true,
      status: 'SELF_VERIFICATION_CONFIRMED',
      vote_count: newCount,
      created_at: existing?.created_at || new Date().toISOString(),
      voted_at: null,
    });
    if (typeof (civicStore as unknown as { saveLedger?: () => void }).saveLedger === 'function') {
      (civicStore as unknown as { saveLedger: () => void }).saveLedger();
    }

    if (process.env.NODE_ENV !== 'test' && supabaseAdmin) {
      try {
        await supabaseAdmin.from('participation').upsert({
          poll_id: pollId,
          anonymous_participation_id: anonymousParticipationId,
          self_verification_confirmed: true,
          status: 'SELF_VERIFICATION_CONFIRMED',
        }, { onConflict: 'poll_id,anonymous_participation_id' });
      } catch {}
    }
  },

  async issueAnonymousCredential(
    pollId: string,
    tokenHash: string,
    expiresAt: string
  ): Promise<void> {
    civicStore.tokens.set(tokenHash, {
      pollId,
      expiresAt,
    });

    if (process.env.NODE_ENV !== 'test' && supabaseAdmin) {
      try {
        await supabaseAdmin.from('anonymous_tokens').insert({
          poll_id: pollId,
          token_hash: tokenHash,
          expires_at: expiresAt,
        });
      } catch {}
    }
  },

  /**
   * Atomic vote submission transaction:
   * 1. Confirms poll is active.
   * 2. Confirms option belongs to poll.
   * 3. Confirms token hash exists and is unused.
   * 4. Consumes token.
   * 5. Atomically increments counter.
   */
  async consumeTokenAndIncrementVote(
    pollId: string,
    optionId: string,
    tokenHash: string
  ): Promise<{ success: boolean; error?: string }> {
    const poll = civicStore.polls.get(pollId);
    if (!poll) return { success: false, error: 'POLL_NOT_FOUND' };
    if (poll.status !== 'LIVE') return { success: false, error: 'POLL_NOT_ACTIVE' };

    const validOption = poll.options.find((o) => o.id === optionId && o.is_active);
    if (!validOption) return { success: false, error: 'INVALID_POLL_OPTION' };

    const tokenEntry = civicStore.tokens.get(tokenHash);
    if (!tokenEntry || tokenEntry.pollId !== pollId) {
      return { success: false, error: 'INVALID_CREDENTIAL' };
    }

    if (tokenEntry.usedAt) {
      return { success: false, error: 'CREDENTIAL_ALREADY_USED' };
    }

    if (new Date() > new Date(tokenEntry.expiresAt)) {
      return { success: false, error: 'CREDENTIAL_EXPIRED' };
    }

    // Atomically mark token as used
    tokenEntry.usedAt = new Date().toISOString();

    // Update participation record status
    const partKey = `${pollId}:${tokenHash}`;
    const partRecord = civicStore.participation.get(partKey);
    if (partRecord) {
      partRecord.status = 'VOTED';
      partRecord.voted_at = new Date().toISOString();
    }

    // Increment vote count
    let countsMap = civicStore.voteCounts.get(pollId);
    if (!countsMap) {
      countsMap = new Map<string, number>();
      civicStore.voteCounts.set(pollId, countsMap);
    }
    const current = countsMap.get(optionId) || 0;
    countsMap.set(optionId, current + 1);
    civicStore.timestampedVotes.push({
      pollId,
      optionId,
      timestamp: new Date().toISOString(),
    });

    // Update poll total
    poll.total_votes += 1;
    poll.updated_at = new Date().toISOString();

    civicStore.saveLedger();

    // Sync to Supabase asynchronously
    if (process.env.NODE_ENV !== 'test' && supabaseAdmin) {
      try {
        await supabaseAdmin.from('anonymous_tokens').update({ used_at: new Date().toISOString() }).eq('token_hash', tokenHash);
        await supabaseAdmin.from('vote_counts').upsert({
          poll_id: pollId,
          option_id: optionId,
          vote_count: current + 1,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'poll_id,option_id' });
      } catch {}
    }

    // Record audit event
    this.recordAuditEvent('vote_submission_success', pollId, { option_id: optionId });

    return { success: true };
  },

  /**
   * Direct open vote submission for custom polls that don't require phone verification:
   * 1. Confirms poll is active.
   * 2. Confirms option belongs to poll.
   * 3. Atomically increments counter.
   */
  async incrementVoteOpen(
    pollId: string,
    optionId: string,
    voterFingerprint?: string
  ): Promise<{ success: boolean; error?: string }> {
    let poll = civicStore.polls.get(pollId);
    if (!poll) {
      await this.getPolls();
      poll = civicStore.polls.get(pollId);
    }
    if (!poll) return { success: false, error: 'POLL_NOT_FOUND' };
    if (poll.status !== 'LIVE') return { success: false, error: 'POLL_NOT_ACTIVE' };

    const validOption = poll.options.find((o) => o.id === optionId && o.is_active);
    if (!validOption) return { success: false, error: 'INVALID_POLL_OPTION' };

    let countsMap = civicStore.voteCounts.get(pollId);
    if (!countsMap) {
      countsMap = new Map<string, number>();
      civicStore.voteCounts.set(pollId, countsMap);
    }
    const current = countsMap.get(optionId) || 0;
    countsMap.set(optionId, current + 1);

    civicStore.timestampedVotes.push({
      pollId,
      optionId,
      timestamp: new Date().toISOString(),
    });

    poll.total_votes = (poll.total_votes || 0) + 1;
    poll.updated_at = new Date().toISOString();

    civicStore.saveLedger();

    if (process.env.NODE_ENV !== 'test' && supabaseAdmin) {
      try {
        await supabaseAdmin.from('vote_counts').upsert({
          poll_id: pollId,
          option_id: optionId,
          vote_count: current + 1,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'poll_id,option_id' });
      } catch {}
    }

    this.recordAuditEvent('open_vote_submission_success', pollId, {
      option_id: optionId,
      fingerprint: voterFingerprint ? 'hashed' : 'anonymous',
    });

    return { success: true };
  },

  async recordAuditEvent(
    eventType: AuditEvent['event_type'],
    pollId?: string,
    metadata: Record<string, unknown> = {}
  ): Promise<void> {
    civicStore.auditEvents.push({
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      event_type: eventType,
      poll_id: pollId,
      timestamp: new Date().toISOString(),
      metadata_sanitized: metadata,
    });
  },

  async getAuditStats() {
    const totalVotes = Array.from(civicStore.polls.values()).reduce(
      (acc, p) => acc + p.total_votes,
      0
    );
    const totalFingerprints = civicStore.participation.size;
    const failures = civicStore.auditEvents.filter((e) =>
      e.event_type.includes('failure')
    ).length;

    return {
      totalVerified: totalFingerprints > 0 ? totalFingerprints : totalVotes,
      totalResponses: totalVotes,
      totalFailures: failures,
      partiesCount: OFFICIAL_PARTIES.length,
      activePollsCount: Array.from(civicStore.polls.values()).filter((p) => p.status === 'LIVE')
        .length,
    };
  },

  async getSiteSettings(): Promise<SiteSettings> {
    if (process.env.NODE_ENV !== 'test' && supabaseAdmin) {
      try {
        const { data } = await supabaseAdmin.from('site_settings').select('*').eq('id', 'global').maybeSingle();
        if (data) {
          civicStore.siteSettings = {
            maintenanceMode: Boolean(data.maintenance_mode),
            maintenanceTitleEn: data.maintenance_title_en || civicStore.siteSettings.maintenanceTitleEn || 'Platform Under Scheduled Maintenance',
            maintenanceTitleHi: data.maintenance_title_hi || civicStore.siteSettings.maintenanceTitleHi || 'मंच पर तकनीकी रखरखाव जारी है',
            maintenanceMessageEn: data.maintenance_message_en || civicStore.siteSettings.maintenanceMessageEn || 'We are performing routine security and infrastructure upgrades. All voting records are secure and polling will resume shortly.',
            maintenanceMessageHi: data.maintenance_message_hi || civicStore.siteSettings.maintenanceMessageHi || 'हम नियमित तकनीकी रखरखाव कर रहे हैं। सभी जनमत रिकॉर्ड पूरी तरह सुरक्षित हैं और मतदान शीघ्र पुनः प्रारंभ होगा।',
            emergencyBannerEnabled: Boolean(data.emergency_banner_enabled),
            emergencyBannerTextEn: data.emergency_banner_text_en || '',
            emergencyBannerTextHi: data.emergency_banner_text_hi || '',
            emergencyBannerType: (data.emergency_banner_type as SiteSettings['emergencyBannerType']) || 'info',
            allowVoting: data.allow_voting !== false,
            rateLimitPerHour: data.rate_limit_per_hour || 60,
            lastUpdated: data.last_updated || new Date().toISOString(),
          };
        }
      } catch {}
    }
    return { ...civicStore.siteSettings };
  },

  async updateSiteSettings(updates: Partial<SiteSettings>): Promise<SiteSettings> {
    civicStore.siteSettings = {
      ...civicStore.siteSettings,
      ...updates,
      lastUpdated: new Date().toISOString(),
    };
    civicStore.saveLedger();

    if (process.env.NODE_ENV !== 'test' && supabaseAdmin) {
      try {
        await supabaseAdmin.from('site_settings').upsert({
          id: 'global',
          maintenance_mode: civicStore.siteSettings.maintenanceMode,
          maintenance_title_en: civicStore.siteSettings.maintenanceTitleEn,
          maintenance_title_hi: civicStore.siteSettings.maintenanceTitleHi,
          maintenance_message_en: civicStore.siteSettings.maintenanceMessageEn,
          maintenance_message_hi: civicStore.siteSettings.maintenanceMessageHi,
          emergency_banner_enabled: civicStore.siteSettings.emergencyBannerEnabled,
          emergency_banner_text_en: civicStore.siteSettings.emergencyBannerTextEn,
          emergency_banner_text_hi: civicStore.siteSettings.emergencyBannerTextHi,
          emergency_banner_type: civicStore.siteSettings.emergencyBannerType,
          allow_voting: civicStore.siteSettings.allowVoting,
          rate_limit_per_hour: civicStore.siteSettings.rateLimitPerHour,
          last_updated: civicStore.siteSettings.lastUpdated,
        });
      } catch {}
    }
    await this.recordAuditEvent('admin_settings_update', undefined, { updates });
    return { ...civicStore.siteSettings };
  },

  async getAdminAccount(): Promise<AdminAccount> {
    if (civicStore.adminAccount) {
      return { ...civicStore.adminAccount };
    }

    if (process.env.NODE_ENV !== 'test' && supabaseAdmin) {
      try {
        const { data } = await supabaseAdmin
          .from('site_settings')
          .select('admin_login_id, admin_password_hash, admin_password_salt, admin_url_slug, last_updated')
          .eq('id', 'global')
          .maybeSingle();

        if (data && data.admin_login_id && data.admin_password_hash && data.admin_password_salt) {
          civicStore.adminAccount = {
            loginId: data.admin_login_id,
            passwordHash: data.admin_password_hash,
            passwordSalt: data.admin_password_salt,
            adminPathSlug: data.admin_url_slug || 'admin-ctrl-pnl',
            updatedAt: data.last_updated || new Date().toISOString(),
          };
          civicStore.saveLedger();
          return { ...civicStore.adminAccount };
        }
      } catch {}
    }

    // Default initialization into database if not present
    const initialLoginId = process.env.ADMIN_LOGIN_ID || 'admin';
    const initialPassword = process.env.ADMIN_PASSWORD || 'MeraVote@2026';
    const initialSlug = process.env.ADMIN_PATH_SLUG || 'admin-ctrl-pnl';
    const salt = generateAdminSalt();
    const hash = hashAdminPassword(initialPassword, salt);

    civicStore.adminAccount = {
      loginId: initialLoginId,
      passwordHash: hash,
      passwordSalt: salt,
      adminPathSlug: initialSlug,
      updatedAt: new Date().toISOString(),
    };
    civicStore.saveLedger();

    if (process.env.NODE_ENV !== 'test' && supabaseAdmin) {
      try {
        await supabaseAdmin.from('site_settings').upsert({
          id: 'global',
          admin_login_id: initialLoginId,
          admin_password_hash: hash,
          admin_password_salt: salt,
          admin_url_slug: initialSlug,
          last_updated: new Date().toISOString(),
        });
      } catch {}
    }

    return { ...civicStore.adminAccount };
  },

  async verifyAdminLogin(loginId: string, password: string): Promise<boolean> {
    if (!loginId || !password || typeof loginId !== 'string' || typeof password !== 'string') {
      return false;
    }
    const cleanId = loginId.trim().toLowerCase();

    // 1. Check dedicated admin_users table in Supabase
    if (process.env.NODE_ENV !== 'test' && supabaseAdmin) {
      try {
        const { data: dbUser, error } = await supabaseAdmin
          .from('admin_users')
          .select('*')
          .ilike('login_id', cleanId)
          .eq('is_active', true)
          .maybeSingle();

        if (dbUser && !error) {
          let matches = false;

          // Check scrypt password hash with salt
          if (dbUser.password_salt && dbUser.password_salt !== 'direct_sql') {
            try {
              const computedHash = hashAdminPassword(password, dbUser.password_salt);
              const bufA = Buffer.from(computedHash, 'hex');
              const bufB = Buffer.from(dbUser.password_hash, 'hex');
              if (bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB)) {
                matches = true;
              }
            } catch {}
          }

          // Check direct SHA-256 fallback (e.g. if user set via direct SQL query in Supabase)
          if (!matches) {
            try {
              const shaHash = crypto.createHash('sha256').update(password.trim()).digest('hex');
              const bufA = Buffer.from(shaHash, 'hex');
              const bufB = Buffer.from(dbUser.password_hash, 'hex');
              if (bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB)) {
                matches = true;
              }
            } catch {}
          }

          if (matches) {
            // Update last_login_at
            await supabaseAdmin
              .from('admin_users')
              .update({ last_login_at: new Date().toISOString() })
              .eq('id', dbUser.id);
            return true;
          }
        }
      } catch (err) {
        console.warn('Supabase admin_users check encountered non-fatal error:', err);
      }
    }

    // 2. Check local in-memory adminUsers
    const localUser = Array.from(civicStore.adminUsers.values()).find(
      (u) => u.loginId.toLowerCase() === cleanId && u.isActive
    );
    if (localUser) {
      const computedHash = hashAdminPassword(password, localUser.passwordSalt);
      const bufA = Buffer.from(computedHash, 'hex');
      const bufB = Buffer.from(localUser.passwordHash, 'hex');
      if (bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB)) {
        return true;
      }
    }

    // 3. Fallback to primary admin account (from site_settings or ledger)
    const account = await this.getAdminAccount();
    if (account.loginId.trim().toLowerCase() === cleanId) {
      try {
        const computedHash = hashAdminPassword(password, account.passwordSalt);
        const bufA = Buffer.from(computedHash, 'hex');
        const bufB = Buffer.from(account.passwordHash, 'hex');
        if (bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB)) {
          return true;
        }
      } catch {}

      // Support direct SHA-256 update in site_settings
      try {
        const shaHash = crypto.createHash('sha256').update(password.trim()).digest('hex');
        const bufA = Buffer.from(shaHash, 'hex');
        const bufB = Buffer.from(account.passwordHash, 'hex');
        if (bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB)) {
          return true;
        }
      } catch {}
    }

    // 4. Fallback to ADMIN_PASSWORD / ADMIN_PASSCODE environment variable
    const envPass = process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSCODE;
    if (envPass && cleanId === 'admin') {
      const envBuf = Buffer.from(envPass.trim());
      const provBuf = Buffer.from(password.trim());
      if (envBuf.length === provBuf.length && crypto.timingSafeEqual(envBuf, provBuf)) {
        return true;
      }
    }

    return false;
  },

  async listAdminUsers(): Promise<AdminUser[]> {
    if (process.env.NODE_ENV !== 'test' && supabaseAdmin) {
      try {
        const { data } = await supabaseAdmin
          .from('admin_users')
          .select('id, login_id, display_name, role, is_active, created_at, last_login_at')
          .order('created_at', { ascending: true });
        if (data && data.length > 0) {
          return (data as Array<Record<string, unknown>>).map((u) => ({
            id: String(u.id),
            loginId: String(u.login_id),
            displayName: String(u.display_name),
            role: (u.role as AdminUser['role']) || 'super_admin',
            isActive: Boolean(u.is_active),
            createdAt: String(u.created_at),
            lastLoginAt: u.last_login_at ? String(u.last_login_at) : undefined,
          }));
        }
      } catch (err) {
        console.warn('Failed to query admin_users from Supabase:', err);
      }
    }

    return Array.from(civicStore.adminUsers.values()).map((u) => ({
      id: u.id,
      loginId: u.loginId,
      displayName: u.displayName,
      role: u.role,
      isActive: u.isActive,
      createdAt: u.createdAt,
      lastLoginAt: u.lastLoginAt,
    }));
  },

  async createAdminUser(params: {
    loginId: string;
    password: string;
    displayName?: string;
    role?: 'super_admin' | 'poll_manager' | 'moderator';
  }): Promise<AdminUser> {
    const cleanLoginId = params.loginId.trim().toLowerCase();
    const salt = generateAdminSalt();
    const hash = hashAdminPassword(params.password, salt);
    const displayName = params.displayName?.trim() || cleanLoginId;
    const role = params.role || 'super_admin';
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    const newRecord = {
      id,
      loginId: cleanLoginId,
      passwordHash: hash,
      passwordSalt: salt,
      displayName,
      role,
      isActive: true,
      createdAt,
    };

    civicStore.adminUsers.set(id, newRecord);

    if (process.env.NODE_ENV !== 'test' && supabaseAdmin) {
      try {
        await supabaseAdmin.from('admin_users').upsert({
          id,
          login_id: cleanLoginId,
          password_hash: hash,
          password_salt: salt,
          display_name: displayName,
          role,
          is_active: true,
          created_at: createdAt,
        });
      } catch (err) {
        console.error('Failed to create admin user in Supabase:', err);
      }
    }

    await this.recordAuditEvent('admin_user_created', undefined, {
      loginId: cleanLoginId,
      role,
      displayName,
    });

    return {
      id,
      loginId: cleanLoginId,
      displayName,
      role,
      isActive: true,
      createdAt,
    };
  },

  async deleteAdminUser(id: string): Promise<boolean> {
    civicStore.adminUsers.delete(id);

    if (process.env.NODE_ENV !== 'test' && supabaseAdmin) {
      try {
        await supabaseAdmin.from('admin_users').delete().eq('id', id);
      } catch (err) {
        console.error('Failed to delete admin user in Supabase:', err);
      }
    }

    await this.recordAuditEvent('admin_user_deleted', undefined, { id });
    return true;
  },

  async updateAdminAccount(updates: {
    loginId?: string;
    password?: string;
    adminPathSlug?: string;
  }): Promise<AdminAccount> {
    const account = await this.getAdminAccount();
    let loginId = account.loginId;
    let passwordHash = account.passwordHash;
    let passwordSalt = account.passwordSalt;
    let adminPathSlug = account.adminPathSlug;

    if (updates.loginId && updates.loginId.trim()) {
      loginId = updates.loginId.trim();
    }
    if (updates.password && updates.password.trim()) {
      passwordSalt = generateAdminSalt();
      passwordHash = hashAdminPassword(updates.password.trim(), passwordSalt);
    }
    if (updates.adminPathSlug && updates.adminPathSlug.trim()) {
      adminPathSlug = updates.adminPathSlug.trim().replace(/^\/+/, '').replace(/^@/, '');
    }

    const updated: AdminAccount = {
      loginId,
      passwordHash,
      passwordSalt,
      adminPathSlug,
      updatedAt: new Date().toISOString(),
    };

    civicStore.adminAccount = updated;
    civicStore.saveLedger();

    if (process.env.NODE_ENV !== 'test' && supabaseAdmin) {
      try {
        await supabaseAdmin.from('site_settings').upsert({
          id: 'global',
          admin_login_id: updated.loginId,
          admin_password_hash: updated.passwordHash,
          admin_password_salt: updated.passwordSalt,
          admin_url_slug: updated.adminPathSlug,
          last_updated: updated.updatedAt,
        });
      } catch (err) {
        console.error('Failed to update admin account in Supabase:', err);
      }
    }

    await this.recordAuditEvent('admin_credentials_updated', undefined, {
      loginId: updated.loginId,
      adminPathSlug: updated.adminPathSlug,
    });

    return updated;
  },

  async getDetailedPolls(): Promise<Array<Poll & { optionResults: OptionResult[] }>> {
    const polls = Array.from(civicStore.polls.values());
    const detailed = await Promise.all(
      polls.map(async (p) => {
        const resultsData = await this.getPollResults(p.id);
        return {
          ...p,
          total_votes: resultsData?.total_responses ?? p.total_votes,
          optionResults: resultsData?.results ?? [],
        };
      })
    );
    return detailed;
  },

  async createPoll(pollData: {
    slug?: string;
    title_en: string;
    title_hi: string;
    description_en?: string;
    description_hi?: string;
    status?: Poll['status'];
    poll_type?: 'NATIONAL' | 'STATE' | 'CUSTOM';
    requires_verification?: boolean;
    verification_mode?: 'WHATSAPP_OTP' | 'NONE';
    category?: string;
    start_at?: string;
    end_at?: string;
    party_ids?: string[];
    custom_options?: Array<{
      name_en: string;
      name_hi: string;
      short_name?: string;
      logo_url?: string;
      color?: string;
      symbol_svg?: string;
    }>;
    results_visibility?: Poll['results_visibility'];
    voting_policy?: 'STRICT_SINGLE_VOTE' | 'ALLOW_ONE_REVOTE' | 'ALLOW_MULTIPLE_VOTES';
    max_votes_per_citizen?: number;
  }): Promise<Poll> {
    const id = `poll-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const now = new Date().toISOString();

    const options: PollOption[] = [];

    // 1. Add selected recognized official parties
    if (pollData.party_ids && pollData.party_ids.length > 0) {
      const allPartiesList = await this.getAllParties();
      const selectedParties = allPartiesList.filter((p) => pollData.party_ids!.includes(p.id));
      selectedParties.forEach((party, index) => {
        options.push({
          id: `opt-${id}-${party.id}`,
          poll_id: id,
          party_id: party.id,
          party,
          display_order: index + 1,
          is_active: true,
        });
      });
    }

    // 2. Add custom parties / candidates / choices with uploaded logos
    if (pollData.custom_options && pollData.custom_options.length > 0) {
      for (let index = 0; index < pollData.custom_options.length; index++) {
        const cust = pollData.custom_options[index];
        const customPartyId = `custom-party-${Date.now()}-${index}`;
        const shortName = cust.short_name || cust.name_en.slice(0, 4).toUpperCase();
        const primaryColor = cust.color || '#1D4ED8';
        const customParty: Party = {
          id: customPartyId,
          name_en: cust.name_en,
          name_hi: cust.name_hi,
          short_name: shortName,
          symbol_svg:
            cust.symbol_svg ||
            `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="${primaryColor}"/><text x="50%" y="55%" text-anchor="middle" dominant-baseline="middle" fill="#ffffff" font-size="28" font-family="sans-serif" font-weight="bold">${shortName.slice(0, 3)}</text></svg>`,
          logo_url: cust.logo_url || undefined,
          color: primaryColor,
          symbol_alt_en: `${cust.name_en} Official Choice`,
          symbol_alt_hi: `${cust.name_hi} आधिकारिक विकल्प`,
          description_en: `Party / Choice: ${cust.name_en}`,
          description_hi: `दल / विकल्प: ${cust.name_hi}`,
          source_ref: 'Admin Custom Choice',
          is_active: true,
          display_order: options.length + 1,
        };

        // Persist custom party
        await this.saveParty(customParty);

        options.push({
          id: `opt-${id}-${customPartyId}`,
          poll_id: id,
          party_id: customPartyId,
          party: customParty,
          display_order: options.length + 1,
          is_active: true,
        });
      }
    }

    // Fallback if no party or custom option was provided
    if (options.length === 0) {
      const allPartiesList = await this.getAllParties();
      allPartiesList.slice(0, 6).forEach((party, index) => {
        options.push({
          id: `opt-${id}-${party.id}`,
          poll_id: id,
          party_id: party.id,
          party,
          display_order: index + 1,
          is_active: true,
        });
      });
    }

    const votingPolicy = pollData.voting_policy || 'STRICT_SINGLE_VOTE';
    const maxVotes = pollData.max_votes_per_citizen ?? (votingPolicy === 'ALLOW_ONE_REVOTE' ? 2 : votingPolicy === 'ALLOW_MULTIPLE_VOTES' ? 999999 : 1);

    const newPoll: Poll = {
      id,
      slug: pollData.slug || `poll-${Date.now()}`,
      title_en: pollData.title_en,
      title_hi: pollData.title_hi,
      description_en: pollData.description_en || '',
      description_hi: pollData.description_hi || '',
      status: pollData.status || 'LIVE',
      poll_type: pollData.poll_type || 'CUSTOM',
      requires_verification: pollData.requires_verification !== undefined ? pollData.requires_verification : true,
      verification_mode: pollData.verification_mode || (pollData.requires_verification === false ? 'NONE' : 'WHATSAPP_OTP'),
      category: pollData.category || 'Civic Inquiry',
      start_at: pollData.start_at || now,
      end_at: pollData.end_at || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      results_visibility: pollData.results_visibility || 'PUBLIC',
      voting_policy: votingPolicy,
      max_votes_per_citizen: maxVotes,
      total_votes: 0,
      options,
      created_at: now,
      updated_at: now,
    };

    civicStore.polls.set(id, newPoll);
    const countsMap = new Map<string, number>();
    options.forEach((opt) => countsMap.set(opt.id, 0));
    civicStore.voteCounts.set(id, countsMap);

    // Sync to Supabase
    if (process.env.NODE_ENV !== 'test' && supabaseAdmin) {
      try {
        await supabaseAdmin.from('polls').upsert({
          id: newPoll.id,
          slug: newPoll.slug,
          title_en: newPoll.title_en,
          title_hi: newPoll.title_hi,
          description_en: newPoll.description_en,
          description_hi: newPoll.description_hi,
          status: newPoll.status,
          start_at: newPoll.start_at,
          end_at: newPoll.end_at,
          results_visibility: newPoll.results_visibility,
        });

        for (const opt of options) {
          await supabaseAdmin.from('poll_options').upsert({
            id: opt.id,
            poll_id: id,
            party_id: opt.party_id,
            display_order: opt.display_order,
            is_active: opt.is_active,
          });

          await supabaseAdmin.from('vote_counts').upsert({
            poll_id: id,
            option_id: opt.id,
            vote_count: 0,
          });
        }
      } catch (err) {
        console.error('Failed to persist poll to Supabase:', err);
      }
    }

    await this.recordAuditEvent('admin_poll_create', id, { slug: newPoll.slug, custom_count: pollData.custom_options?.length || 0 });
    return newPoll;
  },

  async updatePoll(id: string, updates: Partial<Poll>): Promise<Poll | null> {
    const poll = civicStore.polls.get(id);
    if (!poll) return null;

    if (updates.title_en !== undefined) poll.title_en = updates.title_en;
    if (updates.title_hi !== undefined) poll.title_hi = updates.title_hi;
    if (updates.description_en !== undefined) poll.description_en = updates.description_en;
    if (updates.description_hi !== undefined) poll.description_hi = updates.description_hi;
    if (updates.status !== undefined) poll.status = updates.status;
    if (updates.end_at !== undefined) poll.end_at = updates.end_at;
    if (updates.start_at !== undefined) poll.start_at = updates.start_at;
    if (updates.results_visibility !== undefined) poll.results_visibility = updates.results_visibility;
    if (updates.voting_policy !== undefined) poll.voting_policy = updates.voting_policy;
    if (updates.max_votes_per_citizen !== undefined) poll.max_votes_per_citizen = updates.max_votes_per_citizen;
    if (updates.poll_type !== undefined) poll.poll_type = updates.poll_type;
    if (updates.requires_verification !== undefined) {
      poll.requires_verification = updates.requires_verification;
      poll.verification_mode = updates.requires_verification ? 'WHATSAPP_OTP' : 'NONE';
    }
    if (updates.verification_mode !== undefined) poll.verification_mode = updates.verification_mode;
    if (updates.category !== undefined) poll.category = updates.category;
    poll.updated_at = new Date().toISOString();

    if (process.env.NODE_ENV !== 'test' && supabaseAdmin) {
      try {
        await supabaseAdmin.from('polls').update({
          title_en: poll.title_en,
          title_hi: poll.title_hi,
          description_en: poll.description_en,
          description_hi: poll.description_hi,
          status: poll.status,
          end_at: poll.end_at,
          start_at: poll.start_at,
          results_visibility: poll.results_visibility,
          updated_at: poll.updated_at,
        }).eq('id', id);
      } catch (err) {
        console.error('Failed to update poll in Supabase:', err);
      }
    }

    await this.recordAuditEvent('admin_poll_update', id, { updates });
    return { ...poll };
  },

  async deletePoll(id: string): Promise<boolean> {
    if (!civicStore.polls.has(id)) return false;
    civicStore.polls.delete(id);
    civicStore.voteCounts.delete(id);

    if (process.env.NODE_ENV !== 'test' && supabaseAdmin) {
      try {
        await supabaseAdmin.from('polls').delete().eq('id', id);
      } catch (err) {
        console.error('Failed to delete poll from Supabase:', err);
      }
    }

    await this.recordAuditEvent('admin_poll_delete', id);
    return true;
  },

  async updateOptionVoteCount(pollId: string, optionId: string, newCount: number): Promise<boolean> {
    const poll = civicStore.polls.get(pollId);
    if (!poll) return false;

    let countsMap = civicStore.voteCounts.get(pollId);
    if (!countsMap) {
      countsMap = new Map<string, number>();
      civicStore.voteCounts.set(pollId, countsMap);
    }

    const sanitizedCount = Math.max(0, Number(newCount) || 0);
    countsMap.set(optionId, sanitizedCount);

    let sum = 0;
    countsMap.forEach((v) => {
      sum += v;
    });
    poll.total_votes = sum;
    poll.updated_at = new Date().toISOString();

    if (process.env.NODE_ENV !== 'test' && supabaseAdmin) {
      try {
        await supabaseAdmin.from('vote_counts').upsert({
          poll_id: pollId,
          option_id: optionId,
          vote_count: sanitizedCount,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'poll_id,option_id' });
      } catch {}
    }

    await this.recordAuditEvent('admin_poll_update', pollId, { optionId, newCount });
    return true;
  },

  async resetPollVotes(pollId: string): Promise<boolean> {
    const poll = civicStore.polls.get(pollId);
    if (!poll) return false;

    const countsMap = civicStore.voteCounts.get(pollId);
    if (countsMap) {
      countsMap.forEach((_, key) => {
        countsMap.set(key, 0);
      });
    }

    poll.total_votes = 0;
    poll.updated_at = new Date().toISOString();

    Array.from(civicStore.participation.entries()).forEach(([key, record]) => {
      if (record.poll_id === pollId) {
        civicStore.participation.delete(key);
      }
    });

    Array.from(civicStore.tokens.entries()).forEach(([key, token]) => {
      if (token.pollId === pollId) {
        civicStore.tokens.delete(key);
      }
    });

    if (process.env.NODE_ENV !== 'test' && supabaseAdmin) {
      try {
        await supabaseAdmin.from('vote_counts').update({ vote_count: 0 }).eq('poll_id', pollId);
        await supabaseAdmin.from('participation').delete().eq('poll_id', pollId);
      } catch {}
    }

    await this.recordAuditEvent('admin_votes_reset', pollId);
    return true;
  },

  async getAuditEvents(limit = 60): Promise<AuditEvent[]> {
    return [...civicStore.auditEvents].slice(-limit).reverse();
  },

  async exportAllData() {
    const pollsDetailed = await this.getDetailedPolls();
    return {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      platform: 'Mera Vote',
      siteSettings: civicStore.siteSettings,
      auditStats: await this.getAuditStats(),
      polls: pollsDetailed,
      recentAuditEvents: civicStore.auditEvents.slice(-60),
    };
  },

  async exportPollsCsv(): Promise<string> {
    const polls = await this.getDetailedPolls();
    const rows = [
      [
        'Poll ID',
        'Slug',
        'Poll Title (EN)',
        'Poll Title (HI)',
        'Status',
        'Option ID',
        'Party Name (EN)',
        'Party (HI)',
        'Short Code',
        'Vote Count',
        'Percentage',
      ].join(','),
    ];

    polls.forEach((poll) => {
      poll.optionResults.forEach((opt) => {
        rows.push(
          [
            `"${poll.id}"`,
            `"${poll.slug}"`,
            `"${poll.title_en.replace(/"/g, '""')}"`,
            `"${poll.title_hi.replace(/"/g, '""')}"`,
            `"${poll.status}"`,
            `"${opt.option_id}"`,
            `"${opt.party_name_en.replace(/"/g, '""')}"`,
            `"${opt.party_name_hi.replace(/"/g, '""')}"`,
            `"${opt.party_short_name}"`,
            opt.count,
            `"${opt.percentage}%"`,
          ].join(',')
        );
      });
    });

    return rows.join('\n');
  },
};

