export type Language = 'en' | 'hi';
export type ThemeMode = 'light' | 'dark' | 'system';

export type PollStatus = 'DRAFT' | 'SCHEDULED' | 'LIVE' | 'PAUSED' | 'CLOSED' | 'ARCHIVED';

export interface Party {
  id: string;
  name_en: string;
  name_hi: string;
  short_name?: string;
  symbol_svg: string; // Clean, legally permitted SVG or asset path
  logo_url?: string;  // High-res authentic SVG logo path in public/parties/
  color?: string;     // Primary brand color
  symbol_alt_en: string;
  symbol_alt_hi: string;
  description_en: string;
  description_hi: string;
  source_ref: string;
  is_active: boolean;
  display_order: number;
}

export interface PollOption {
  id: string;
  poll_id: string;
  party_id: string;
  party: Party;
  display_order: number;
  is_active: boolean;
}

export interface Poll {
  id: string;
  slug: string;
  title_en: string;
  title_hi: string;
  description_en: string;
  description_hi: string;
  status: PollStatus;
  start_at: string;
  end_at: string;
  results_visibility: 'PUBLIC' | 'ADMIN_ONLY' | 'AFTER_CLOSE';
  total_votes: number;
  options: PollOption[];
  created_at: string;
  updated_at: string;
}

export interface ParticipationRecord {
  id: string;
  poll_id: string;
  participation_fingerprint: string; // HMAC-SHA256(secret, EPIC + ":" + poll_id)
  created_at: string;
  voted_at?: string;
}

export interface AnonymousVoteCredential {
  token: string;              // 32-byte CSPRNG token given only to client
  token_hash: string;         // SHA-256(token) stored in database
  poll_id: string;
  expires_at: string;
  used_at?: string;
  created_at: string;
}

export interface VoteSubmission {
  poll_id: string;
  option_id: string;
  anonymous_token: string;
  idempotency_key: string;
}

export interface OptionResult {
  option_id: string;
  party_id: string;
  party_name_en: string;
  party_name_hi: string;
  party_short_name: string;
  symbol_svg: string;
  logo_url?: string;
  color?: string;
  count: number;
  percentage: number;
}

export interface PollResults {
  poll_id: string;
  poll_title_en: string;
  poll_title_hi: string;
  status: PollStatus;
  total_responses: number;
  updated_at: string;
  results: OptionResult[];
}

export interface VerificationResult {
  verified: boolean;
  reason?: 'INVALID_FORMAT' | 'NOT_FOUND' | 'RATE_LIMITED' | 'ALREADY_VOTED' | 'SERVICE_UNAVAILABLE';
  anonymous_token?: string;
  expires_at?: string;
}

export interface AuditEvent {
  id: string;
  event_type:
    | 'verification_attempt'
    | 'verification_success'
    | 'verification_failure'
    | 'vote_submission_success'
    | 'vote_submission_failure'
    | 'duplicate_vote_blocked'
    | 'admin_login'
    | 'admin_poll_update'
    | 'admin_party_update';
  poll_id?: string;
  timestamp: string;
  metadata_sanitized: Record<string, unknown>; // STRICTLY NO EPIC, NO PII, NO VOTE CHOICE
}
