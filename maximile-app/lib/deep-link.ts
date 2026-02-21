// =============================================================================
// MaxiMile — Deep Link URL Parser (S16.1)
// =============================================================================
// Parses `maximile://log?...` URLs from Apple Shortcuts, notifications, etc.
// into structured AutoCaptureParams for the auto-capture confirmation screen.
//
// Demo Mode: When EXPO_PUBLIC_DEMO_MODE=true, injects mock transaction data
// to enable demos without real Apple Pay transactions.
// =============================================================================

import { generateMockTransaction, isDemoMode } from './demo-data';

export interface AutoCaptureParams {
  amount: number | null;
  merchant: string | null;
  card: string | null;
  source: 'shortcut' | 'notification' | 'manual' | 'demo';
  isDemo?: boolean;
}

const VALID_SOURCES = new Set(['shortcut', 'notification', 'manual', 'demo', 'test']);
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
 *
 * Demo Mode: When EXPO_PUBLIC_DEMO_MODE=true, automatically injects
 * realistic mock transaction data for demo presentations.
 */
export function parseAutoCaptureUrl(url: string): AutoCaptureParams | null {
  try {
    // Accept both maximile://log and maximile://log?... formats
    if (!url.startsWith('maximile://log')) return null;

    // Extract query string — URL constructor doesn't handle custom schemes well
    const queryIndex = url.indexOf('?');
    if (queryIndex === -1) {
      // No query params — opened directly by the Shortcuts automation.
      const baseParams = { amount: null, merchant: null, card: null, source: 'shortcut' as const };

      // Demo mode: Inject mock data
      if (isDemoMode()) {
        return injectMockData(baseParams);
      }

      return baseParams;
    }

    const search = new URLSearchParams(url.slice(queryIndex + 1));

    const rawSource = search.get('source')?.toLowerCase();
    const source = (VALID_SOURCES.has(rawSource ?? '') ? rawSource : 'manual') as AutoCaptureParams['source'];

    const rawMerchant = search.get('merchant');
    const merchant = rawMerchant
      ? toTitleCase(decodeURIComponent(rawMerchant).trim())
      : null;

    const params: AutoCaptureParams = {
      amount: parseAmount(search.get('amount')),
      merchant,
      card: search.get('card') ? decodeURIComponent(search.get('card')!).trim() : null,
      source,
    };

    // Demo mode: Inject mock data if no real data provided
    if (isDemoMode()) {
      return injectMockData(params);
    }

    return params;
  } catch {
    return null;
  }
}

/**
 * Injects mock transaction data into params for demo mode.
 * Preserves any existing data from URL params.
 */
function injectMockData(params: AutoCaptureParams): AutoCaptureParams {
  const mockTx = generateMockTransaction(params.card);

  return {
    ...params,
    // Use mock data, but preserve URL params if provided
    amount: params.amount ?? mockTx.amount,
    merchant: params.merchant ?? mockTx.merchant,
    card: params.card ?? mockTx.card,
    source: params.source === 'shortcut' ? 'demo' : params.source,
    isDemo: true,
  };
}
