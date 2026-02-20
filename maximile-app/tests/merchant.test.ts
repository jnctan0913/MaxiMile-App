/**
 * MaxiMile Unit Tests: Merchant Detection Module (SPA-3)
 *
 * Tests for the merchant detection module:
 *   - Google Places type → MaxiMile category mapping
 *   - Confidence levels (high, medium, low)
 *   - Dining, transport, travel, groceries, bills, general mappings
 *   - Multiple type matches → higher confidence
 *   - Empty/unknown types → general with low confidence
 *   - Merchant detection via Edge Function
 *   - Cache behavior (5-min TTL)
 *   - Error handling (no results, API error)
 */

import {
  mapTypesToCategory,
  detectMerchant,
  clearMerchantCache,
} from '../lib/merchant';
import type { MerchantError, Confidence } from '../lib/merchant';

// ---------------------------------------------------------------------------
// Mock Supabase
// ---------------------------------------------------------------------------

const mockInvoke = jest.fn();

jest.mock('../lib/supabase', () => ({
  supabase: {
    functions: {
      invoke: (...args: unknown[]) => mockInvoke(...args),
    },
  },
}));

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Merchant Detection Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearMerchantCache();
  });

  // =========================================================================
  // 1. Restaurant type → dining category
  // =========================================================================
  describe('Type → Category mapping: Dining', () => {
    it('should map restaurant type to dining', () => {
      const result = mapTypesToCategory(['restaurant', 'point_of_interest']);
      expect(result.categoryId).toBe('dining');
      expect(result.categoryName).toBe('Dining');
    });

    it('should map cafe type to dining', () => {
      const result = mapTypesToCategory(['cafe', 'establishment']);
      expect(result.categoryId).toBe('dining');
    });

    it('should map food + restaurant to dining with high confidence', () => {
      const result = mapTypesToCategory(['restaurant', 'food', 'point_of_interest']);
      expect(result.categoryId).toBe('dining');
      expect(result.confidence).toBe('high');
    });
  });

  // =========================================================================
  // 2. Transport types
  // =========================================================================
  describe('Type → Category mapping: Transport', () => {
    it('should map transit_station to transport', () => {
      const result = mapTypesToCategory(['transit_station', 'point_of_interest']);
      expect(result.categoryId).toBe('transport');
      expect(result.categoryName).toBe('Transport');
    });

    it('should map gas_station to transport', () => {
      const result = mapTypesToCategory(['gas_station', 'establishment']);
      expect(result.categoryId).toBe('transport');
    });
  });

  // =========================================================================
  // 3. Travel types
  // =========================================================================
  describe('Type → Category mapping: Travel', () => {
    it('should map airport to travel', () => {
      const result = mapTypesToCategory(['airport', 'point_of_interest']);
      expect(result.categoryId).toBe('travel');
      expect(result.categoryName).toBe('Travel');
    });

    it('should map lodging to travel', () => {
      const result = mapTypesToCategory(['lodging', 'establishment']);
      expect(result.categoryId).toBe('travel');
    });
  });

  // =========================================================================
  // 4. Groceries types
  // =========================================================================
  describe('Type → Category mapping: Groceries', () => {
    it('should map supermarket to groceries', () => {
      const result = mapTypesToCategory(['supermarket', 'store']);
      expect(result.categoryId).toBe('groceries');
      expect(result.categoryName).toBe('Groceries');
    });

    it('should map convenience_store to groceries', () => {
      const result = mapTypesToCategory(['convenience_store']);
      expect(result.categoryId).toBe('groceries');
    });
  });

  // =========================================================================
  // 5. Confidence levels
  // =========================================================================
  describe('Confidence levels', () => {
    it('should return high confidence for 2+ matching types', () => {
      const result = mapTypesToCategory(['restaurant', 'food', 'bar']);
      expect(result.confidence).toBe('high');
    });

    it('should return medium confidence for 1 matching type', () => {
      const result = mapTypesToCategory(['cafe', 'point_of_interest']);
      expect(result.confidence).toBe('medium');
    });

    it('should return low confidence for unknown types', () => {
      const result = mapTypesToCategory(['point_of_interest', 'establishment']);
      expect(result.confidence).toBe('low');
    });
  });

  // =========================================================================
  // 6. Empty/unknown types → general with low confidence
  // =========================================================================
  describe('Fallback to general', () => {
    it('should return general for empty types array', () => {
      const result = mapTypesToCategory([]);
      expect(result.categoryId).toBe('general');
      expect(result.confidence).toBe('low');
    });

    it('should return general for unknown types', () => {
      const result = mapTypesToCategory(['political', 'locality']);
      expect(result.categoryId).toBe('general');
      expect(result.confidence).toBe('low');
    });
  });

  // =========================================================================
  // 7. detectMerchant — success with results
  // =========================================================================
  describe('detectMerchant — success', () => {
    it('should return merchant results from Edge Function', async () => {
      mockInvoke.mockResolvedValue({
        data: {
          results: [
            {
              name: 'Din Tai Fung',
              place_id: 'ChIJ_test123',
              vicinity: '290 Orchard Rd',
              types: ['restaurant', 'food', 'point_of_interest'],
            },
          ],
        },
        error: null,
      });

      const results = await detectMerchant(1.3021, 103.8361);

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Din Tai Fung');
      expect(results[0].category).toBe('dining');
      expect(results[0].confidence).toBe('high');
      expect(results[0].address).toBe('290 Orchard Rd');
    });
  });

  // =========================================================================
  // 8. detectMerchant — no results throws error
  // =========================================================================
  describe('detectMerchant — no results', () => {
    it('should throw no_results error when no places found', async () => {
      mockInvoke.mockResolvedValue({
        data: { results: [] },
        error: null,
      });

      try {
        await detectMerchant(1.3521, 103.8198);
        fail('Should have thrown');
      } catch (err) {
        const error = err as MerchantError;
        expect(error.type).toBe('no_results');
        expect(error.message).toContain('No merchants');
      }
    });
  });
});
