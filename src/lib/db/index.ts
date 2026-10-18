import { Poll, PollOption, Party, PollResults, OptionResult, AuditEvent, ParticipationRecord, SiteSettings } from '../types';
import { INITIAL_POLLS, INITIAL_VOTE_COUNTS } from '../data/polls';
import { OFFICIAL_PARTIES } from '../data/parties';

import fs from 'fs';
import path from 'path';

const LEDGER_PATH = path.join(process.cwd(), '.data', 'civic_ledger.json');

// In-Memory & Persistent Storage Cache (Guarantees local zero-config operation and unit testing)
class StorageStore {
  polls: Map<string, Poll> = new Map();
  // pollId -> optionId -> count
  voteCounts: Map<string, Map<string, number>> = new Map();
  // pollId + ":" + anonymous_participation_id -> ParticipationRecord
  participation: Map<string, ParticipationRecord> = new Map();
  // tokenHash -> { pollId, expiresAt, usedAt }
  tokens: Map<string, { pollId: string; expiresAt: string; usedAt?: string }> = new Map();
  // Site & Emergency Configuration
  siteSettings: SiteSettings = {
    maintenanceMode: false,
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

export const db = {
  async getPolls(): Promise<Poll[]> {
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
    const poll = Array.from(civicStore.polls.values()).find((p) => p.slug === slug);
    return poll ? { ...poll } : null;
  },

  async getPollById(id: string): Promise<Poll | null> {
    if (id === 'pm') return this.getPollById('poll-national-2029');
    if (id === 'cm') return this.getPollById('poll-state-cm-2029');
    const poll = civicStore.polls.get(id);
    return poll ? { ...poll } : null;
  },

  async getPollResults(pollId: string): Promise<PollResults | null> {
    const poll = civicStore.polls.get(pollId);
    if (!poll) return null;

    const countsMap = civicStore.voteCounts.get(pollId) || new Map<string, number>();
    let totalVotes = 0;

    poll.options.forEach((opt) => {
      totalVotes += countsMap.get(opt.id) || 0;
    });

    const results: OptionResult[] = poll.options.map((opt) => {
      const count = countsMap.get(opt.id) || 0;
      const percentage = totalVotes > 0 ? Number(((count / totalVotes) * 100).toFixed(1)) : 0;
      return {
        option_id: opt.id,
        party_id: opt.party_id,
        party_name_en: opt.party.name_en,
        party_name_hi: opt.party.name_hi,
        party_short_name: opt.party.short_name || opt.party.name_en,
        symbol_svg: opt.party.symbol_svg,
        logo_url: opt.party.logo_url,
        color: opt.party.color,
        count,
        percentage,
      };
    });

    return {
      poll_id: poll.id,
      poll_title_en: poll.title_en,
      poll_title_hi: poll.title_hi,
      status: poll.status,
      total_responses: totalVotes,
      updated_at: new Date().toISOString(),
      results,
    };
  },

  async hasParticipated(pollId: string, anonymousParticipationId: string): Promise<boolean> {
    const key = `${pollId}:${anonymousParticipationId}`;
    return civicStore.participation.has(key);
  },

  async recordParticipation(pollId: string, anonymousParticipationId: string): Promise<void> {
    const key = `${pollId}:${anonymousParticipationId}`;
    civicStore.participation.set(key, {
      id: `part-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      poll_id: pollId,
      anonymous_participation_id: anonymousParticipationId,
      self_verification_confirmed: true,
      status: 'SELF_VERIFICATION_CONFIRMED',
      created_at: new Date().toISOString(),
      voted_at: null,
    });
    civicStore.saveLedger();
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

    // Update poll total
    poll.total_votes += 1;
    poll.updated_at = new Date().toISOString();

    civicStore.saveLedger();

    // Record audit event
    this.recordAuditEvent('vote_submission_success', pollId, { option_id: optionId });

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
    return { ...civicStore.siteSettings };
  },

  async updateSiteSettings(updates: Partial<SiteSettings>): Promise<SiteSettings> {
    civicStore.siteSettings = {
      ...civicStore.siteSettings,
      ...updates,
      lastUpdated: new Date().toISOString(),
    };
    await this.recordAuditEvent('admin_settings_update', undefined, { updates });
    return { ...civicStore.siteSettings };
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
    slug: string;
    title_en: string;
    title_hi: string;
    description_en?: string;
    description_hi?: string;
    status?: Poll['status'];
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
  }): Promise<Poll> {
    const id = `poll-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const now = new Date().toISOString();

    const options: PollOption[] = [];

    // 1. Add selected recognized official parties
    if (pollData.party_ids && pollData.party_ids.length > 0) {
      const selectedParties = OFFICIAL_PARTIES.filter((p) => pollData.party_ids!.includes(p.id));
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
      pollData.custom_options.forEach((cust, index) => {
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

        options.push({
          id: `opt-${id}-${customPartyId}`,
          poll_id: id,
          party_id: customPartyId,
          party: customParty,
          display_order: options.length + 1,
          is_active: true,
        });
      });
    }

    // Fallback if no party or custom option was provided
    if (options.length === 0) {
      OFFICIAL_PARTIES.slice(0, 6).forEach((party, index) => {
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

    const newPoll: Poll = {
      id,
      slug: pollData.slug || `poll-${Date.now()}`,
      title_en: pollData.title_en,
      title_hi: pollData.title_hi,
      description_en: pollData.description_en || '',
      description_hi: pollData.description_hi || '',
      status: pollData.status || 'LIVE',
      start_at: pollData.start_at || now,
      end_at: pollData.end_at || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      results_visibility: pollData.results_visibility || 'PUBLIC',
      total_votes: 0,
      options,
      created_at: now,
      updated_at: now,
    };

    civicStore.polls.set(id, newPoll);
    const countsMap = new Map<string, number>();
    options.forEach((opt) => countsMap.set(opt.id, 0));
    civicStore.voteCounts.set(id, countsMap);

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
    poll.updated_at = new Date().toISOString();

    await this.recordAuditEvent('admin_poll_update', id, { updates });
    return { ...poll };
  },

  async deletePoll(id: string): Promise<boolean> {
    if (!civicStore.polls.has(id)) return false;
    civicStore.polls.delete(id);
    civicStore.voteCounts.delete(id);
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

    countsMap.set(optionId, Math.max(0, Number(newCount) || 0));

    let sum = 0;
    countsMap.forEach((v) => {
      sum += v;
    });
    poll.total_votes = sum;
    poll.updated_at = new Date().toISOString();

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
      platform: 'Mera Vote - Independent Civic Opinion Poll',
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

