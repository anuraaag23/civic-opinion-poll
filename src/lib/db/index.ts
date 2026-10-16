import { Poll, PollResults, OptionResult, AuditEvent, ParticipationRecord } from '../types';
import { INITIAL_POLLS, INITIAL_VOTE_COUNTS } from '../data/polls';
import { OFFICIAL_PARTIES } from '../data/parties';

// In-Memory Storage Cache (Guarantees local zero-config operation and unit testing)
class StorageStore {
  polls: Map<string, Poll> = new Map();
  // pollId -> optionId -> count
  voteCounts: Map<string, Map<string, number>> = new Map();
  // pollId + ":" + anonymous_participation_id -> ParticipationRecord
  participation: Map<string, ParticipationRecord> = new Map();
  // tokenHash -> { pollId, expiresAt, usedAt }
  tokens: Map<string, { pollId: string; expiresAt: string; usedAt?: string }> = new Map();
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
};
