// =============================================================================
// MaxiMile — useMerchantCatalogue Hook (Sprint 34)
// =============================================================================
// Thin memoised wrapper over getMerchantCatalogue().
// =============================================================================

import { useMemo } from 'react';
import { getMerchantCatalogue, MerchantEntry } from '../lib/merchant-catalogue';

/**
 * Returns the full merchant catalogue, memoised so the array reference
 * is stable across re-renders.
 */
export function useMerchantCatalogue(): MerchantEntry[] {
  return useMemo(() => getMerchantCatalogue(), []);
}
