/**
 * Comprehensive Input Sanitization & Anti-XSS Utilities
 * Mera Vote Platform
 */

const LINK_REGEX =
  /(?:https?:\/\/|ftp:\/\/|www\.)[^\s/$.?#].[^\s]*|\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+(?:com|org|net|edu|gov|mil|io|co|in|ai|me|xyz|app|dev|gg|link|info|biz|site|online|tech|store|cc|to|is|ru|cn|tv|top)\b(?:\/[^\s]*)?/gi;

/**
 * Checks if a string contains any web links or URLs.
 */
export function containsLink(text: string): boolean {
  if (!text || typeof text !== 'string') return false;
  return LINK_REGEX.test(text);
}

/**
 * Escapes HTML characters to prevent XSS injection.
 */
export function escapeHtml(str: string): string {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Sanitizes plain text input: removes HTML tags, removes links, strips control characters,
 * normalizes whitespace, and truncates to maxLen.
 */
export function sanitizeText(text: string, maxLen = 350): string {
  if (!text || typeof text !== 'string') return '';
  let cleaned = text
    .replace(/<[^>]*>/g, '') // Remove all HTML tags
    .replace(/[<>"'`]/g, '') // Strip dangerous quotes and brackets
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ''); // Strip ASCII control characters

  cleaned = cleaned.replace(LINK_REGEX, ''); // Strip links
  cleaned = cleaned.replace(/\s+/g, ' ').trim(); // Normalize whitespace
  return cleaned.slice(0, maxLen);
}

/**
 * Sanitizes an alphanumeric ID (e.g. pollId, voterId, optionId).
 * Only allows letters, digits, underscores, and hyphens.
 */
export function sanitizeId(id: string, maxLen = 64): string {
  if (!id || typeof id !== 'string') return '';
  return id.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, maxLen);
}

/**
 * Validates whether a string is a safe 6-digit hex color (e.g. #1D4ED8).
 */
export function isValidHexColor(color: string): boolean {
  if (!color || typeof color !== 'string') return false;
  return /^#[0-9A-Fa-f]{6}$/.test(color.trim());
}

/**
 * Sanitizes SVG code to prevent Stored XSS via uploaded or pasted party symbols.
 * Strips script tags, foreignObject, iframe, embed, object, event handlers, and javascript: URIs.
 */
export function sanitizeSvg(svgContent: string): string {
  if (!svgContent || typeof svgContent !== 'string') return '';

  return svgContent
    // Remove dangerous tags and their content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<foreignObject\b[^<]*(?:(?!<\/foreignObject>)<[^<]*)*<\/foreignObject>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    // Remove event handlers (e.g. onload, onerror, onclick)
    .replace(/\son[a-z]+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '')
    // Remove javascript: and data: URIs in attributes
    .replace(/href\s*=\s*["']?\s*javascript:[^"'>]*/gi, 'href=""')
    .replace(/xlink:href\s*=\s*["']?\s*javascript:[^"'>]*/gi, 'xlink:href=""')
    .replace(/href\s*=\s*["']?\s*data:(?!image\/)[^"'>]*/gi, 'href=""')
    .trim();
}
