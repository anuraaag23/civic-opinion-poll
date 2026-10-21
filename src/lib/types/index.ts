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
  candidate_name_en?: string; // Leader / PM Candidate / CM Candidate
  candidate_name_hi?: string;
  candidate_role_en?: string; // e.g. "PM Candidate" or "CM Candidate"
  candidate_role_hi?: string; // e.g. "प्रधानमंत्री प्रत्याशी" or "मुख्यमंत्री प्रत्याशी"
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
  voting_policy?: 'STRICT_SINGLE_VOTE' | 'ALLOW_ONE_REVOTE' | 'ALLOW_MULTIPLE_VOTES';
  max_votes_per_citizen?: number;
  total_votes: number;
  poll_month?: string;
  poll_year?: number;
  options: PollOption[];
  created_at: string;
  updated_at: string;
}

export const ECI_ELECTORAL_SEARCH_URL = 'https://electoralsearch.eci.gov.in/';

export interface ParticipationRecord {
  id: string;
  poll_id: string;
  anonymous_participation_id: string; // Token hash or anonymous participation id
  self_verification_confirmed: boolean;
  status: 'SELF_VERIFICATION_CONFIRMED' | 'VOTED';
  vote_count?: number;
  created_at: string;
  voted_at?: string | null;
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
  candidate_name_en?: string;
  candidate_name_hi?: string;
  candidate_role_en?: string;
  candidate_role_hi?: string;
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
  timeframe?: '7d' | 'month' | 'year' | 'all';
  timeframe_label_en?: string;
  timeframe_label_hi?: string;
  poll_month?: string;
  poll_year?: number;
  results: OptionResult[];
}

export interface VerificationResult {
  verified: boolean;
  status?: 'SELF_VERIFICATION_CONFIRMED' | 'VERIFICATION_SUCCESS';
  reason?:
    | 'ALREADY_VOTED'
    | 'RATE_LIMITED'
    | 'SERVICE_UNAVAILABLE'
    | 'UNCONFIRMED'
    | 'INVALID_POLL'
    | 'INVALID_FORMAT'
    | 'INVALID_PHONE'
    | 'INVALID_OTP'
    | 'INVALID_BOUNDS'
    | 'INVALID_ECI_SLIP'
    | 'ECI_NOT_FOUND'
    | 'BOT_CHALLENGE_FAILED';
  anonymous_token?: string;
  expires_at?: string;
  error?: string;
}

export interface AuditEvent {
  id: string;
  event_type:
    | 'self_verification_attempt'
    | 'self_verification_confirmed'
    | 'self_verification_failure'
    | 'verification_otp_dispatched'
    | 'vote_submission_success'
    | 'vote_submission_failure'
    | 'duplicate_vote_blocked'
    | 'admin_login'
    | 'admin_poll_update'
    | 'admin_party_update'
    | 'admin_settings_update'
    | 'admin_credentials_updated'
    | 'admin_votes_reset'
    | 'admin_poll_create'
    | 'admin_poll_delete'
    | 'admin_user_created'
    | 'admin_user_deleted';
  poll_id?: string;
  timestamp: string;
  metadata_sanitized: Record<string, unknown>; // STRICTLY NO EPIC, NO PII, NO VOTE CHOICE
}

export interface SiteSettings {
  maintenanceMode: boolean;
  maintenanceTitleEn?: string;
  maintenanceTitleHi?: string;
  maintenanceMessageEn?: string;
  maintenanceMessageHi?: string;
  emergencyBannerEnabled: boolean;
  emergencyBannerTextEn: string;
  emergencyBannerTextHi: string;
  emergencyBannerType: 'info' | 'warning' | 'alert';
  allowVoting: boolean;
  rateLimitPerHour: number;
  lastUpdated: string;
}

export interface AdminAccount {
  loginId: string;
  passwordHash: string;
  passwordSalt: string;
  adminPathSlug: string;
  updatedAt: string;
}

export interface DbSupporter {
  id?: string;
  name: string;
  amount: number;
  cups: number;
  rating: number;
  message?: string | null;
  payment_id?: string | null;
  verified?: boolean;
  created_at?: string;
}

export interface AdminUser {
  id: string;
  loginId: string;
  displayName: string;
  role: 'super_admin' | 'poll_manager' | 'moderator';
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}
