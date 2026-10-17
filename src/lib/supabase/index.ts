import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://nrowfnerohslghecjetf.supabase.co';

const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yb3dmbmVyb2hzbGdoZWNqZXRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2NjUzODksImV4cCI6MjEwNjI0MTM4OX0.yLgr4IyFlYB_qR6yl5HRMW3lyxPFB-pR7BqnrwJUg0g';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && !SUPABASE_URL.includes('placeholder'));
};

export const supabase = isSupabaseConfigured()
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

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

export interface AutoVerifyResult {
  verified: boolean;
  supporter?: DbSupporter;
}

const LINK_REGEX =
  /(?:https?:\/\/|ftp:\/\/|www\.)[^\s/$.?#].[^\s]*|\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+(?:com|org|net|edu|gov|mil|io|co|in|ai|me|xyz|app|dev|gg|link|info|biz|site|online|tech|store|cc|to|is|ru|cn|tv|top)\b(?:\/[^\s]*)?/gi;

export const containsLink = (text: string): boolean => {
  if (!text) return false;
  return LINK_REGEX.test(text);
};

export const sanitizeText = (text: string, maxLen = 350): string => {
  if (!text) return '';
  let cleaned = text.replace(/<[^>]*>/g, '').replace(/[<>"'`]/g, '');
  cleaned = cleaned.replace(LINK_REGEX, '');
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  return cleaned.slice(0, maxLen);
};

/**
 * Checks Supabase for a newly verified payment received around or after the payment initiation timestamp.
 * This powers automatic background payment verification without requiring the user to type a transaction ID.
 */
export async function checkForAutoVerifiedPayment(
  initiatedAt: number,
  expectedName?: string,
  expectedAmount?: number
): Promise<AutoVerifyResult> {
  if (supabase) {
    try {
      // 45 seconds buffer prior to initiation to account for clock skew
      const bufferTime = new Date(initiatedAt - 45000).toISOString();
      const { data, error } = await supabase
        .from('supporters')
        .select('*')
        .eq('verified', true)
        .gte('created_at', bufferTime)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!error && data && data.length > 0) {
        // If an expected name is provided, match by name
        if (expectedName && expectedName.trim()) {
          const cleanExpected = expectedName.trim().toLowerCase();
          const match = data.find(
            (s) =>
              s.name.toLowerCase().includes(cleanExpected) ||
              cleanExpected.includes(s.name.toLowerCase())
          );
          if (match) {
            return { verified: true, supporter: match };
          }
        }
        // Match by amount
        if (expectedAmount && expectedAmount > 0) {
          const amountMatch = data.find((s) => Number(s.amount) === Number(expectedAmount));
          if (amountMatch) {
            return { verified: true, supporter: amountMatch };
          }
        }
        // Fallback: any verified payment in this recent time window
        return { verified: true, supporter: data[0] };
      }
    } catch (err) {
      console.error('Error polling for auto-verified payment:', err);
    }
  }

  // Local fallback check
  if (typeof window !== 'undefined') {
    try {
      const list = JSON.parse(localStorage.getItem('meravote_supporters_list') || '[]');
      const match = list.find(
        (s: DbSupporter) =>
          s.verified === true &&
          new Date(s.created_at || 0).getTime() >= initiatedAt - 45000
      );
      if (match) return { verified: true, supporter: match };
    } catch {}
  }

  return { verified: false };
}

/**
 * Update an existing supporter record with custom rating, review message, or name.
 */
export async function updateSupporter(
  id: string,
  updates: Partial<DbSupporter>
): Promise<boolean> {
  if (supabase && id) {
    try {
      const payload: Record<string, unknown> = {};
      if (updates.name !== undefined) payload.name = sanitizeText(updates.name, 80);
      if (updates.rating !== undefined) payload.rating = Math.min(5, Math.max(1, Number(updates.rating)));
      if (updates.message !== undefined) payload.message = sanitizeText(updates.message || '', 350) || null;
      if (updates.verified !== undefined) payload.verified = updates.verified;

      const { error } = await supabase.from('supporters').update(payload).eq('id', id);
      if (!error) return true;
      console.error('Supabase update supporter error:', error);
    } catch (err) {
      console.error('Failed to update supporter in Supabase:', err);
    }
  }
  return false;
}

/**
 * Submit a pending supporter review for creator approval if webhook is delayed.
 */
export async function submitSupporter(supporter: {
  name: string;
  amount: number;
  cups: number;
  rating: number;
  message?: string;
  paymentId?: string;
  verified?: boolean;
}): Promise<boolean> {
  const cleanName = sanitizeText(supporter.name, 80) || 'Anonymous Citizen';
  const cleanMessage = supporter.message ? sanitizeText(supporter.message, 350) : null;
  const cleanPaymentId = supporter.paymentId ? sanitizeText(supporter.paymentId, 80) : null;
  const isVerified = supporter.verified === true;

  if (supabase) {
    try {
      const { error } = await supabase.from('supporters').insert([
        {
          name: cleanName,
          amount: supporter.amount,
          cups: supporter.cups,
          rating: supporter.rating,
          message: cleanMessage,
          payment_id: cleanPaymentId,
          verified: isVerified,
        },
      ]);
      if (!error) return true;
      console.error('Supabase submit supporter error:', error);
    } catch (err) {
      console.error(err);
    }
  }

  return true;
}

/**
 * Fetch verified supporters from Supabase.
 */
export async function fetchSupporters(): Promise<DbSupporter[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('supporters')
        .select('*')
        .eq('verified', true)
        .order('created_at', { ascending: false })
        .limit(50);
      if (!error && data) return data;
      console.error('Error fetching supporters from Supabase:', error);
    } catch (err) {
      console.error(err);
    }
  }
  return [];
}

/**
 * Fetch all supporters (both verified and pending moderation) for admin panel.
 */
export async function fetchAllSupporters(): Promise<DbSupporter[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('supporters')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (!error && data) return data;
      console.error('Error fetching all supporters from Supabase:', error);
    } catch (err) {
      console.error(err);
    }
  }
  return [];
}

/**
 * Delete a supporter review by ID (admin moderation).
 */
export async function deleteSupporter(id: string): Promise<boolean> {
  if (supabase && id) {
    try {
      const { error } = await supabase.from('supporters').delete().eq('id', id);
      if (!error) return true;
      console.error('Error deleting supporter:', error);
    } catch (err) {
      console.error(err);
    }
  }
  return false;
}

