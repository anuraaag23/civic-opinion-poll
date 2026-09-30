export interface SupporterRecord {
  id: string;
  name: string;
  amount: number;
  cups: number;
  rating: number; // 1 to 5 stars
  message?: string;
  timestamp: number;
  paymentRef?: string;
  verified?: boolean;
}

export interface SupportStats {
  totalCups: number;
  totalAmountInr: number;
  supporterCount: number;
  lastUpdated: number;
}

export const KOFI_CONFIG = {
  url: 'https://ko-fi.com/ryper',
  handle: '@ryper',
  creatorName: 'ryper',
  platformName: 'Mera Vote',
  description: 'Support the developer to make alive this website',
  currency: 'INR',
  cupPriceInr: 50,
};

// Security & Anti-Spam: Link Detection & Removal
export const LINK_REGEX =
  /(?:https?:\/\/|ftp:\/\/|www\.)[^\s/$.?#].[^\s]*|\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+(?:com|org|net|edu|gov|mil|io|co|in|ai|me|xyz|app|dev|gg|link|info|biz|site|online|tech|store|cc|to|is|ru|cn|tv|top)\b(?:\/[^\s]*)?/gi;

export const containsLink = (text: string): boolean => {
  if (!text) return false;
  return LINK_REGEX.test(text);
};

export const sanitizeMessage = (text: string, maxLen = 350): string => {
  if (!text) return '';
  let cleaned = text.replace(/<[^>]*>/g, '').replace(/[<>"'`]/g, '');
  cleaned = cleaned.replace(LINK_REGEX, '');
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  return cleaned.slice(0, maxLen);
};

export const sanitizeInput = (str: string, maxLen = 80): string => {
  if (!str) return '';
  return sanitizeMessage(str, maxLen);
};

export const getStoredSupporters = (): SupporterRecord[] => {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem('meravote_supporters_list');
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error('Failed to read supporters from localStorage', err);
  }
  return [];
};

export const calculateStats = (supporters: SupporterRecord[]): SupportStats => {
  const totalAmountInr = supporters.reduce((acc, s) => acc + (Number(s.amount) || 0), 0);
  const totalCups = supporters.reduce((acc, s) => acc + (Number(s.cups) || 0), 0);
  return {
    totalCups,
    totalAmountInr,
    supporterCount: supporters.length,
    lastUpdated: Date.now(),
  };
};

export const getStoredSupportStats = (): SupportStats => {
  return calculateStats(getStoredSupporters());
};

export const addSupporter = (
  name: string,
  amount: number,
  cups: number,
  rating: number,
  message?: string,
  paymentRef?: string,
  verified = true
): { supporter: SupporterRecord; stats: SupportStats } => {
  const sanitizedName = sanitizeInput(name, 80) || 'Anonymous Citizen';
  const sanitizedMessage = message ? sanitizeMessage(message, 350) : undefined;
  const sanitizedRef = paymentRef ? sanitizeInput(paymentRef, 80) : undefined;
  const current = getStoredSupporters();

  const newSupporter: SupporterRecord = {
    id: `sup-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: sanitizedName,
    amount: Math.max(1, Math.min(100000, Number(amount) || 50)),
    cups: Math.max(1, Math.min(2000, Number(cups) || 1)),
    rating: Math.min(5, Math.max(1, Math.round(Number(rating)) || 5)),
    message: sanitizedMessage,
    paymentRef: sanitizedRef,
    verified,
    timestamp: Date.now(),
  };

  const updated = [newSupporter, ...current];

  try {
    localStorage.setItem('meravote_supporters_list', JSON.stringify(updated));
    const stats = calculateStats(updated);
    localStorage.setItem('meravote_support_stats', JSON.stringify(stats));

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('meravote_support_updated', { detail: stats }));
    }

    return { supporter: newSupporter, stats };
  } catch (err) {
    console.error('Failed to save supporter', err);
    return { supporter: newSupporter, stats: calculateStats(updated) };
  }
};
