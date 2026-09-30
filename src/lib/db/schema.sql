-- ====================================================================
-- INDEPENDENT INDIA CIVIC OPINION POLL PLATFORM
-- Production PostgreSQL / Supabase Database Schema
--
-- CORE GUARANTEE: ABSOLUTE SEPARATION OF IDENTITY AND VOTE STORAGE.
-- NO VOTER PII (NAME, ADDRESS, EPIC) IS LINKED TO VOTE SELECTIONS.
-- ====================================================================

-- Enable pgcrypto for UUIDs and secure cryptographic functions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. POLLS TABLE
CREATE TABLE IF NOT EXISTS polls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(120) UNIQUE NOT NULL,
    title_en VARCHAR(255) NOT NULL,
    title_hi VARCHAR(255) NOT NULL,
    description_en TEXT NOT NULL,
    description_hi TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SCHEDULED', 'LIVE', 'PAUSED', 'CLOSED', 'ARCHIVED')),
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,
    results_visibility VARCHAR(30) NOT NULL DEFAULT 'PUBLIC' CHECK (results_visibility IN ('PUBLIC', 'ADMIN_ONLY', 'AFTER_CLOSE')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. PARTIES TABLE (Managed Directory)
CREATE TABLE IF NOT EXISTS parties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_en VARCHAR(255) NOT NULL,
    name_hi VARCHAR(255) NOT NULL,
    short_name VARCHAR(50) NOT NULL,
    symbol_svg TEXT NOT NULL,
    symbol_alt_en VARCHAR(255) NOT NULL,
    symbol_alt_hi VARCHAR(255) NOT NULL,
    description_en TEXT NOT NULL DEFAULT '',
    description_hi TEXT NOT NULL DEFAULT '',
    source_ref VARCHAR(255) NOT NULL DEFAULT 'Official Recognized Parties Directory',
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. POLL OPTIONS TABLE (Options linked to each poll)
CREATE TABLE IF NOT EXISTS poll_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    party_id UUID NOT NULL REFERENCES parties(id) ON DELETE RESTRICT,
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(poll_id, party_id)
);

-- 4. PARTICIPATION TABLE (Mode A: Self-Verification Confirmed)
-- STORES ONLY THE ANONYMOUS PARTICIPATION IDENTIFIER / TOKEN HASH.
-- STRICT MODE A RULE: NO RAW EPIC, NO EPIC HASH, NO VOTER NAME, NO ADDRESS, NO EMAIL, NO PHONE.
CREATE TABLE IF NOT EXISTS participation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    anonymous_participation_id VARCHAR(64) UNIQUE NOT NULL, -- SHA-256(token)
    self_verification_confirmed BOOLEAN NOT NULL DEFAULT true,
    status VARCHAR(40) NOT NULL DEFAULT 'SELF_VERIFICATION_CONFIRMED' CHECK (status IN ('SELF_VERIFICATION_CONFIRMED', 'VOTED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    voted_at TIMESTAMPTZ,
    UNIQUE(poll_id, anonymous_participation_id)
);

-- Index for instant duplicate checks
CREATE INDEX IF NOT EXISTS idx_participation_lookup 
ON participation(poll_id, anonymous_participation_id);

-- 5. ANONYMOUS VOTE TOKENS (Ephemerally issued, decoupled from participation fingerprint)
CREATE TABLE IF NOT EXISTS anonymous_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    token_hash VARCHAR(64) UNIQUE NOT NULL, -- SHA-256(token)
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_anon_token_lookup 
ON anonymous_tokens(token_hash, poll_id, used_at);

-- 6. VOTE COUNTS (Atomic Aggregate Counter)
-- Contains ONLY aggregate counters. NO voter identity, NO token hash link.
CREATE TABLE IF NOT EXISTS vote_counts (
    poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    option_id UUID NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
    vote_count BIGINT NOT NULL DEFAULT 0 CHECK (vote_count >= 0),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY(poll_id, option_id)
);

-- 7. AUDIT LOGS (Security and Integrity Monitoring)
-- STRICT RULE: NEVER LOG RAW EPIC OR CORRELATION OF IDENTITY TO VOTE CHOICE
CREATE TABLE IF NOT EXISTS audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(60) NOT NULL,
    poll_id UUID REFERENCES polls(id) ON DELETE SET NULL,
    metadata_sanitized JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_poll 
ON audit_events(poll_id, created_at);

-- ====================================================================
-- ATOMIC TRANSACTION STORED PROCEDURE: submit_anonymous_vote
-- Atomically verifies token, consumes token, checks poll status,
-- and increments vote_counts. Guarantees no race conditions.
-- ====================================================================
CREATE OR REPLACE FUNCTION submit_anonymous_vote(
    p_poll_id UUID,
    p_option_id UUID,
    p_token_hash VARCHAR(64)
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_poll_status VARCHAR(30);
    v_token_id UUID;
    v_token_used_at TIMESTAMPTZ;
    v_token_expires_at TIMESTAMPTZ;
    v_option_exists BOOLEAN;
BEGIN
    -- 1. Check Poll Status
    SELECT status INTO v_poll_status
    FROM polls
    WHERE id = p_poll_id;

    IF v_poll_status IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'POLL_NOT_FOUND');
    END IF;

    IF v_poll_status != 'LIVE' THEN
        RETURN jsonb_build_object('success', false, 'error', 'POLL_NOT_ACTIVE');
    END IF;

    -- 2. Verify and Lock Anonymous Token
    SELECT id, used_at, expires_at 
    INTO v_token_id, v_token_used_at, v_token_expires_at
    FROM anonymous_tokens
    WHERE token_hash = p_token_hash AND poll_id = p_poll_id
    FOR UPDATE;

    IF v_token_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'INVALID_CREDENTIAL');
    END IF;

    IF v_token_used_at IS NOT NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'CREDENTIAL_ALREADY_USED');
    END IF;

    IF NOW() > v_token_expires_at THEN
        RETURN jsonb_build_object('success', false, 'error', 'CREDENTIAL_EXPIRED');
    END IF;

    -- 3. Confirm Option Belongs to Poll
    SELECT EXISTS(
        SELECT 1 FROM poll_options
        WHERE id = p_option_id AND poll_id = p_poll_id AND is_active = true
    ) INTO v_option_exists;

    IF NOT v_option_exists THEN
        RETURN jsonb_build_object('success', false, 'error', 'INVALID_POLL_OPTION');
    END IF;

    -- 4. Mark Token as Consumed
    UPDATE anonymous_tokens
    SET used_at = NOW()
    WHERE id = v_token_id;

    -- 5. Atomic Counter Increment
    INSERT INTO vote_counts (poll_id, option_id, vote_count, updated_at)
    VALUES (p_poll_id, p_option_id, 1, NOW())
    ON CONFLICT (poll_id, option_id)
    DO UPDATE SET 
        vote_count = vote_counts.vote_count + 1,
        updated_at = NOW();

    -- 6. Record Audit Event (Sanitized)
    INSERT INTO audit_events (event_type, poll_id, metadata_sanitized)
    VALUES ('vote_submission_success', p_poll_id, jsonb_build_object('option_id', p_option_id));

    RETURN jsonb_build_object('success', true);
END;
$$;

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Prevent public access to participation fingerprints and token hashes
-- ====================================================================

ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE participation ENABLE ROW LEVEL SECURITY;
ALTER TABLE anonymous_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE vote_counts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;

-- Public can read active polls, parties, options, and vote counts
CREATE POLICY "Public Read Polls" ON polls FOR SELECT USING (status IN ('LIVE', 'CLOSED', 'SCHEDULED'));
CREATE POLICY "Public Read Parties" ON parties FOR SELECT USING (is_active = true);
CREATE POLICY "Public Read Poll Options" ON poll_options FOR SELECT USING (is_active = true);
CREATE POLICY "Public Read Vote Counts" ON vote_counts FOR SELECT USING (true);

-- Deny public direct access to sensitive participation records and tokens
CREATE POLICY "Deny Public Participation" ON participation FOR ALL USING (false);
CREATE POLICY "Deny Public Anon Tokens" ON anonymous_tokens FOR ALL USING (false);
CREATE POLICY "Deny Public Direct Audit" ON audit_events FOR ALL USING (false);
