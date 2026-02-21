// =============================================================================
// MaxiMile — Deep Link URL Parser (S16.1)
// =============================================================================
// Parses `maximile://log?...` URLs from Apple Shortcuts, notifications, etc.
// into structured AutoCaptureParams for the auto-capture confirmation screen.
// =============================================================================

export interface AutoCaptureParams {
  amount: number | null;
  merchant: string | null;
  card: string | null;
  source: 'shortcut' | 'notification' | 'manual';
}

const VALID_SOURCES = new Set(['shortcut', 'notification', 'manual']);
const CURRENCY_PREFIXES = /^(S\$|SGD\s*|USD\s*|\$)\s*/i;

function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function parseAmount(raw: string | null): number | null {
  if (!raw) return null;
  const cleaned = raw.replace(CURRENCY_PREFIXES, '').replace(/,/g, '').trim();
  const value = parseFloat(cleaned);
  if (isNaN(value) || value <= 0 || value > 99999.99) return null;
  return Math.round(value * 100) / 100;
}

/**
 * Parse a `maximile://log?...` deep link URL into structured params.
 * Returns null if the URL doesn't match the expected scheme + path.
 */
export function parseAutoCaptureUrl(url: string): AutoCaptureParams | null {
  try {
    // Accept both maximile://log and maximile://log?... formats
    if (!url.startsWith('maximile://log')) return null;

    // Extract query string — URL constructor doesn't handle custom schemes well
    const queryIndex = url.indexOf('?');
    if (queryIndex === -1) {
      return { amount: null, merchant: null, card: null, source: 'manual' };
    }

    const search = new URLSearchParams(url.slice(queryIndex + 1));

    const rawSource = search.get('source')?.toLowerCase();
    const source = (VALID_SOURCES.has(rawSource ?? '') ? rawSource : 'manual') as AutoCaptureParams['source'];

    const rawMerchant = search.get('merchant');
    const merchant = rawMerchant
      ? toTitleCase(decodeURIComponent(rawMerchant).trim())
      : null;

    return {
      amount: parseAmount(search.get('amount')),
      merchant,
      card: search.get('card') ? decodeURIComponent(search.get('card')!).trim() : null,
      source,
    };
  } catch {
    return null;
  }
}
