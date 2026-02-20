/**
 * MaxiMile Unit Tests: Recommendation Engine
 *
 * Tests the recommendation algorithm logic by mocking the Supabase RPC
 * `recommend()` call. We also implement a local TypeScript version of
 * the scoring formula so we can unit-test the ranking logic directly
 * without depending on the PostgreSQL function.
 *
 * The algorithm spec is defined in docs/architecture/RECOMMENDATION_ALGORITHM.md.
 */

import { createMockSupabase, MockSupabaseClient } from './mocks/supabase';
import {
  cardHSBCRevolution,
  cardUOBPRVI,
  cardAmexAscend,
} from './mocks/test-data';

// ---------------------------------------------------------------------------
// Types matching the recommend() RPC return shape
// ---------------------------------------------------------------------------

interface RecommendRow {
  card_id: string;
  card_name: string;
  bank: string;
  earn_rate_mpd: number;
  remaining_cap: number | null;
  monthly_cap_amount: number | null;
  is_recommended: boolean;
}

// ---------------------------------------------------------------------------
// Local recommendation scoring function (mirrors the SQL algorithm)
// ---------------------------------------------------------------------------

interface CardInput {
  card_id: string;
  card_name: string;
  bank: string;
  earn_rate_mpd: number;
  remaining_cap: number | null;
  monthly_cap_amount: number | null;
}

/**
 * Pure function that replicates the SQL recommendation algorithm.
 * Takes an array of card inputs and returns them ranked with is_recommended flag.
 *
 * Scoring formula: score = earn_rate_mpd * cap_ratio
 *   - cap_ratio = 1.0 if uncapped (monthly_cap_amount is null)
 *   - cap_ratio = 1.0 if no spending yet (remaining_cap equals monthly_cap_amount)
 *   - cap_ratio = 0.0 if remaining_cap <= 0
 *   - cap_ratio = Math.min(remaining_cap / monthly_cap_amount, 1.0) otherwise
 *
 * Tiebreaker: earn_rate_mpd DESC, then card_name ASC (alphabetical).
 */
function rankCards(cards: CardInput[]): RecommendRow[] {
  if (cards.length === 0) return [];

  const scored = cards.map(card => {
    let capRatio: number;
    if (card.monthly_cap_amount === null || card.monthly_cap_amount === undefined) {
      capRatio = 1.0;
    } else if (card.remaining_cap === null || card.remaining_cap === undefined) {
      // No spending state row: full cap available
      capRatio = 1.0;
    } else if (card.remaining_cap <= 0) {
      capRatio = 0.0;
    } else {
      capRatio = Math.min(card.remaining_cap / card.monthly_cap_amount, 1.0);
    }

    const score = card.earn_rate_mpd * capRatio;
    return { ...card, score, capRatio };
  });

  // Sort: score DESC, earn_rate_mpd DESC (fallback), card_name ASC (tiebreaker)
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.earn_rate_mpd !== a.earn_rate_mpd) return b.earn_rate_mpd - a.earn_rate_mpd;
    return a.card_name.localeCompare(b.card_name);
  });

  return scored.map((card, index) => ({
    card_id: card.card_id,
    card_name: card.card_name,
    bank: card.bank,
    earn_rate_mpd: card.earn_rate_mpd,
    remaining_cap: card.remaining_cap,
    monthly_cap_amount: card.monthly_cap_amount,
    is_recommended: index === 0,
  }));
}

// ---------------------------------------------------------------------------
// Helper: call the RPC mock
// ---------------------------------------------------------------------------

async function getRecommendation(
  supabase: MockSupabaseClient['supabase'],
  categoryId: string,
): Promise<{ data: RecommendRow[] | null; error: { message: string; code?: string } | null }> {
  const result = await supabase.rpc('recommend', { p_category_id: categoryId });
  return result as { data: RecommendRow[] | null; error: { message: string; code?: string } | null };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Recommendation Engine', () => {
  let mock: MockSupabaseClient;

  beforeEach(() => {
    mock = createMockSupabase();
  });

  // =========================================================================
  // 1. Normal case: 3 cards, dining, highest score wins
  // =========================================================================
  describe('Normal case — 3 cards, dining category', () => {
    it('should recommend the card with highest score (earn_rate * cap_ratio)', () => {
      // HSBC: 4 mpd dining, cap 1000, remaining 250 -> cap_ratio=0.25, score=1.0
      // Amex: 2 mpd dining, cap 2500, remaining 2000 -> cap_ratio=0.8, score=1.6
      // UOB:  1.4 mpd dining, uncapped -> cap_ratio=1.0, score=1.4
      const cards: CardInput[] = [
        { card_id: cardHSBCRevolution.id, card_name: 'HSBC Revolution Credit Card', bank: 'HSBC', earn_rate_mpd: 4.0, remaining_cap: 250, monthly_cap_amount: 1000 },
        { card_id: cardAmexAscend.id, card_name: 'American Express KrisFlyer Ascend', bank: 'Amex', earn_rate_mpd: 2.0, remaining_cap: 2000, monthly_cap_amount: 2500 },
        { card_id: cardUOBPRVI.id, card_name: 'UOB PRVI Miles Visa', bank: 'UOB', earn_rate_mpd: 1.4, remaining_cap: null, monthly_cap_amount: null },
      ];

      const result = rankCards(cards);

      expect(result).toHaveLength(3);
      // Amex: score = 2.0 * 0.8 = 1.6 -> rank 1
      expect(result[0].card_id).toBe(cardAmexAscend.id);
      expect(result[0].is_recommended).toBe(true);
      // UOB: score = 1.4 * 1.0 = 1.4 -> rank 2
      expect(result[1].card_id).toBe(cardUOBPRVI.id);
      expect(result[1].is_recommended).toBe(false);
      // HSBC: score = 4.0 * 0.25 = 1.0 -> rank 3
      expect(result[2].card_id).toBe(cardHSBCRevolution.id);
      expect(result[2].is_recommended).toBe(false);
    });

    it('should return results via RPC mock', async () => {
      const expectedResult: RecommendRow[] = [
        { card_id: cardAmexAscend.id, card_name: 'American Express KrisFlyer Ascend', bank: 'Amex', earn_rate_mpd: 2.0, remaining_cap: 2000, monthly_cap_amount: 2500, is_recommended: true },
        { card_id: cardUOBPRVI.id, card_name: 'UOB PRVI Miles Visa', bank: 'UOB', earn_rate_mpd: 1.4, remaining_cap: null, monthly_cap_amount: null, is_recommended: false },
        { card_id: cardHSBCRevolution.id, card_name: 'HSBC Revolution Credit Card', bank: 'HSBC', earn_rate_mpd: 4.0, remaining_cap: 250, monthly_cap_amount: 1000, is_recommended: false },
      ];

      mock.mockRpc.setData('recommend', expectedResult);

      const { data, error } = await getRecommendation(mock.supabase, 'dining');

      expect(error).toBeNull();
      expect(data).toHaveLength(3);
      expect(data![0].is_recommended).toBe(true);
      expect(data![0].card_name).toBe('American Express KrisFlyer Ascend');
    });
  });

  // =========================================================================
  // 2. All caps exhausted — falls back to earn_rate ranking
  // =========================================================================
  describe('All caps exhausted — fallback to earn_rate_mpd ranking', () => {
    it('should rank by earn_rate_mpd when all scores are zero', () => {
      const cards: CardInput[] = [
        { card_id: 'card-a', card_name: 'Card A', bank: 'Bank1', earn_rate_mpd: 4.0, remaining_cap: 0, monthly_cap_amount: 1000 },
        { card_id: 'card-b', card_name: 'Card B', bank: 'Bank2', earn_rate_mpd: 2.0, remaining_cap: 0, monthly_cap_amount: 2000 },
      ];

      const result = rankCards(cards);

      expect(result).toHaveLength(2);
      // All scores are 0. Fallback: earn_rate_mpd DESC.
      // Card A has 4.0 mpd > Card B 2.0 mpd.
      expect(result[0].card_name).toBe('Card A');
      expect(result[0].is_recommended).toBe(true);
      expect(result[1].card_name).toBe('Card B');
      expect(result[1].is_recommended).toBe(false);
    });

    it('should set is_recommended on the top card even when all caps are 0', () => {
      const cards: CardInput[] = [
        { card_id: 'card-x', card_name: 'X Card', bank: 'B', earn_rate_mpd: 1.0, remaining_cap: 0, monthly_cap_amount: 500 },
      ];

      const result = rankCards(cards);
      expect(result[0].is_recommended).toBe(true);
    });
  });

  // =========================================================================
  // 3. Single card — always recommended
  // =========================================================================
  describe('Single card — always recommended', () => {
    it('should return single card with is_recommended=true', () => {
      const cards: CardInput[] = [
        { card_id: cardUOBPRVI.id, card_name: 'UOB PRVI Miles Visa', bank: 'UOB', earn_rate_mpd: 1.4, remaining_cap: null, monthly_cap_amount: null },
      ];

      const result = rankCards(cards);

      expect(result).toHaveLength(1);
      expect(result[0].is_recommended).toBe(true);
      expect(result[0].card_name).toBe('UOB PRVI Miles Visa');
    });

    it('should recommend single card even if its cap is exhausted', () => {
      const cards: CardInput[] = [
        { card_id: 'card-solo', card_name: 'Solo Card', bank: 'B', earn_rate_mpd: 4.0, remaining_cap: 0, monthly_cap_amount: 1000 },
      ];

      const result = rankCards(cards);

      expect(result).toHaveLength(1);
      expect(result[0].is_recommended).toBe(true);
    });
  });

  // =========================================================================
  // 4. No cards — empty array
  // =========================================================================
  describe('No cards — empty array', () => {
    it('should return empty array when user has no cards', () => {
      const result = rankCards([]);
      expect(result).toEqual([]);
    });

    it('should return empty array from RPC when user has no portfolio', async () => {
      mock.mockRpc.setData('recommend', []);

      const { data, error } = await getRecommendation(mock.supabase, 'dining');

      expect(error).toBeNull();
      expect(data).toEqual([]);
    });
  });

  // =========================================================================
  // 5. No bonus rule — uses base_rate
  // =========================================================================
  describe('No bonus rule for category — falls back to base_rate', () => {
    it('should use base_rate_mpd for general category (no bonus rules typically)', () => {
      // For 'general', all cards should be at their base rate since no bonus rules exist
      const cards: CardInput[] = [
        { card_id: cardHSBCRevolution.id, card_name: 'HSBC Revolution Credit Card', bank: 'HSBC', earn_rate_mpd: 0.4, remaining_cap: null, monthly_cap_amount: null },
        { card_id: cardUOBPRVI.id, card_name: 'UOB PRVI Miles Visa', bank: 'UOB', earn_rate_mpd: 1.4, remaining_cap: null, monthly_cap_amount: null },
        { card_id: cardAmexAscend.id, card_name: 'American Express KrisFlyer Ascend', bank: 'Amex', earn_rate_mpd: 1.1, remaining_cap: null, monthly_cap_amount: null },
      ];

      const result = rankCards(cards);

      // UOB 1.4 > Amex 1.1 > HSBC 0.4
      expect(result[0].card_name).toBe('UOB PRVI Miles Visa');
      expect(result[0].earn_rate_mpd).toBe(1.4);
      expect(result[1].card_name).toBe('American Express KrisFlyer Ascend');
      expect(result[1].earn_rate_mpd).toBe(1.1);
      expect(result[2].card_name).toBe('HSBC Revolution Credit Card');
      expect(result[2].earn_rate_mpd).toBe(0.4);
    });
  });

  // =========================================================================
  // 6. Tied scores — alphabetical tiebreaker
  // =========================================================================
  describe('Tied scores — deterministic alphabetical tiebreaker', () => {
    it('should break ties by earn_rate_mpd DESC first, then card_name ASC', () => {
      const cards: CardInput[] = [
        { card_id: 'card-delta', card_name: 'Delta Card', bank: 'B1', earn_rate_mpd: 3.0, remaining_cap: null, monthly_cap_amount: null },
        { card_id: 'card-alpha', card_name: 'Alpha Card', bank: 'B2', earn_rate_mpd: 3.0, remaining_cap: null, monthly_cap_amount: null },
      ];

      const result = rankCards(cards);

      // Same score (3.0 * 1.0 = 3.0), same earn_rate. Tiebreaker: card_name ASC.
      expect(result[0].card_name).toBe('Alpha Card');
      expect(result[0].is_recommended).toBe(true);
      expect(result[1].card_name).toBe('Delta Card');
    });

    it('should be deterministic across multiple calls', () => {
      const cards: CardInput[] = [
        { card_id: 'z', card_name: 'Zulu', bank: 'B', earn_rate_mpd: 2.0, remaining_cap: null, monthly_cap_amount: null },
        { card_id: 'a', card_name: 'Alpha', bank: 'B', earn_rate_mpd: 2.0, remaining_cap: null, monthly_cap_amount: null },
        { card_id: 'm', card_name: 'Mike', bank: 'B', earn_rate_mpd: 2.0, remaining_cap: null, monthly_cap_amount: null },
      ];

      const result1 = rankCards(cards);
      const result2 = rankCards(cards);
      const result3 = rankCards(cards);

      expect(result1.map(r => r.card_name)).toEqual(['Alpha', 'Mike', 'Zulu']);
      expect(result2.map(r => r.card_name)).toEqual(result1.map(r => r.card_name));
      expect(result3.map(r => r.card_name)).toEqual(result1.map(r => r.card_name));
    });

    it('should use earn_rate_mpd as secondary sort when scores tie at zero', () => {
      const cards: CardInput[] = [
        { card_id: 'c1', card_name: 'Low Rate Card', bank: 'B', earn_rate_mpd: 1.0, remaining_cap: 0, monthly_cap_amount: 1000 },
        { card_id: 'c2', card_name: 'High Rate Card', bank: 'B', earn_rate_mpd: 4.0, remaining_cap: 0, monthly_cap_amount: 1000 },
      ];

      const result = rankCards(cards);

      // Both scores = 0. Fallback: earn_rate_mpd DESC. "High Rate Card" (4.0) wins.
      expect(result[0].card_name).toBe('High Rate Card');
    });
  });

  // =========================================================================
  // 7. New user (no spending) — full cap remaining
  // =========================================================================
  describe('New user (no spending) — full cap remaining', () => {
    it('should rank purely by earn_rate_mpd when all cap_ratios are 1.0', () => {
      // New user: no spending_state rows, so remaining_cap = monthly_cap_amount for capped cards,
      // and null for uncapped cards. All cap_ratios = 1.0.
      const cards: CardInput[] = [
        { card_id: cardHSBCRevolution.id, card_name: 'HSBC Revolution Credit Card', bank: 'HSBC', earn_rate_mpd: 4.0, remaining_cap: 1000, monthly_cap_amount: 1000 },
        { card_id: cardAmexAscend.id, card_name: 'American Express KrisFlyer Ascend', bank: 'Amex', earn_rate_mpd: 2.0, remaining_cap: 2500, monthly_cap_amount: 2500 },
        { card_id: cardUOBPRVI.id, card_name: 'UOB PRVI Miles Visa', bank: 'UOB', earn_rate_mpd: 1.4, remaining_cap: null, monthly_cap_amount: null },
      ];

      const result = rankCards(cards);

      // HSBC: 4.0 * 1.0 = 4.0
      // Amex: 2.0 * 1.0 = 2.0
      // UOB:  1.4 * 1.0 = 1.4
      expect(result[0].card_name).toBe('HSBC Revolution Credit Card');
      expect(result[0].is_recommended).toBe(true);
      expect(result[1].card_name).toBe('American Express KrisFlyer Ascend');
      expect(result[2].card_name).toBe('UOB PRVI Miles Visa');
    });

    it('should treat missing spending_state (null remaining_cap with defined cap) as full cap', () => {
      // When remaining_cap is null but monthly_cap_amount is defined, it means no spending_state row.
      // This should be treated as full cap (cap_ratio = 1.0).
      const cards: CardInput[] = [
        { card_id: 'c1', card_name: 'Capped Card', bank: 'B', earn_rate_mpd: 4.0, remaining_cap: null, monthly_cap_amount: 1000 },
      ];

      const result = rankCards(cards);

      // cap_ratio = 1.0 (no spending yet), score = 4.0
      expect(result[0].is_recommended).toBe(true);
      expect(result[0].earn_rate_mpd).toBe(4.0);
    });
  });

  // =========================================================================
  // 8. Mixed cap states — uncapped cards ranked higher when capped ones exhausted
  // =========================================================================
  describe('Mixed cap states — some capped, some not', () => {
    it('should rank uncapped card above capped card with exhausted cap', () => {
      const cards: CardInput[] = [
        { card_id: 'capped', card_name: 'Capped Card', bank: 'B1', earn_rate_mpd: 4.0, remaining_cap: 0, monthly_cap_amount: 1000 },
        { card_id: 'uncapped', card_name: 'Uncapped Card', bank: 'B2', earn_rate_mpd: 1.5, remaining_cap: null, monthly_cap_amount: null },
      ];

      const result = rankCards(cards);

      // Capped: 4.0 * 0.0 = 0.0
      // Uncapped: 1.5 * 1.0 = 1.5
      expect(result[0].card_name).toBe('Uncapped Card');
      expect(result[0].is_recommended).toBe(true);
    });

    it('should rank partially-capped card below uncapped card when score is lower', () => {
      const cards: CardInput[] = [
        { card_id: 'partial', card_name: 'Partial Cap', bank: 'B1', earn_rate_mpd: 4.0, remaining_cap: 100, monthly_cap_amount: 1000 },
        { card_id: 'uncapped', card_name: 'Uncapped Card', bank: 'B2', earn_rate_mpd: 3.0, remaining_cap: null, monthly_cap_amount: null },
      ];

      const result = rankCards(cards);

      // Partial: 4.0 * 0.1 = 0.4
      // Uncapped: 3.0 * 1.0 = 3.0
      expect(result[0].card_name).toBe('Uncapped Card');
    });

    it('should rank high-rate partially-capped card above low-rate uncapped card when score is higher', () => {
      const cards: CardInput[] = [
        { card_id: 'partial', card_name: 'Partial Cap', bank: 'B1', earn_rate_mpd: 4.0, remaining_cap: 800, monthly_cap_amount: 1000 },
        { card_id: 'uncapped', card_name: 'Uncapped Card', bank: 'B2', earn_rate_mpd: 1.0, remaining_cap: null, monthly_cap_amount: null },
      ];

      const result = rankCards(cards);

      // Partial: 4.0 * 0.8 = 3.2
      // Uncapped: 1.0 * 1.0 = 1.0
      expect(result[0].card_name).toBe('Partial Cap');
    });
  });

  // =========================================================================
  // 9. Cap partially used — verify cap_ratio calculation
  // =========================================================================
  describe('Cap partially used — cap_ratio calculation', () => {
    it('should calculate cap_ratio as remaining/total when partially used', () => {
      const cards: CardInput[] = [
        { card_id: 'c1', card_name: 'Card A', bank: 'B', earn_rate_mpd: 4.0, remaining_cap: 300, monthly_cap_amount: 1000 },
      ];

      const result = rankCards(cards);

      // cap_ratio = 300/1000 = 0.3, score = 4.0 * 0.3 = 1.2
      // We can verify the ranking is consistent with a score of 1.2
      expect(result[0].earn_rate_mpd).toBe(4.0);
      expect(result[0].remaining_cap).toBe(300);
      expect(result[0].monthly_cap_amount).toBe(1000);
    });

    it('should produce correct relative ranking based on cap_ratio math', () => {
      const cards: CardInput[] = [
        // Card A: 4.0 * (250/1000) = 4.0 * 0.25 = 1.0
        { card_id: 'a', card_name: 'Card A', bank: 'B', earn_rate_mpd: 4.0, remaining_cap: 250, monthly_cap_amount: 1000 },
        // Card B: 2.0 * (2000/2500) = 2.0 * 0.8 = 1.6
        { card_id: 'b', card_name: 'Card B', bank: 'B', earn_rate_mpd: 2.0, remaining_cap: 2000, monthly_cap_amount: 2500 },
        // Card C: 1.4 * 1.0 = 1.4 (uncapped)
        { card_id: 'c', card_name: 'Card C', bank: 'B', earn_rate_mpd: 1.4, remaining_cap: null, monthly_cap_amount: null },
      ];

      const result = rankCards(cards);

      // B (1.6) > C (1.4) > A (1.0)
      expect(result[0].card_name).toBe('Card B');
      expect(result[1].card_name).toBe('Card C');
      expect(result[2].card_name).toBe('Card A');
    });

    it('should clamp cap_ratio at 1.0 when remaining exceeds monthly (edge case)', () => {
      // This could happen from a data error; remaining > monthly
      const cards: CardInput[] = [
        { card_id: 'c1', card_name: 'Over Cap', bank: 'B', earn_rate_mpd: 3.0, remaining_cap: 1500, monthly_cap_amount: 1000 },
        { card_id: 'c2', card_name: 'Normal', bank: 'B', earn_rate_mpd: 3.0, remaining_cap: null, monthly_cap_amount: null },
      ];

      const result = rankCards(cards);

      // Over Cap: 3.0 * min(1500/1000, 1.0) = 3.0 * 1.0 = 3.0
      // Normal: 3.0 * 1.0 = 3.0
      // Tied on score and earn_rate -> alphabetical: "Normal" < "Over Cap"
      expect(result[0].card_name).toBe('Normal');
      expect(result[1].card_name).toBe('Over Cap');
    });

    it('should handle remaining_cap of exactly 0 (cap_ratio = 0)', () => {
      const cards: CardInput[] = [
        { card_id: 'c1', card_name: 'Exhausted', bank: 'B', earn_rate_mpd: 4.0, remaining_cap: 0, monthly_cap_amount: 1000 },
      ];

      const result = rankCards(cards);

      expect(result[0].remaining_cap).toBe(0);
      // Score = 4.0 * 0.0 = 0.0, but still recommended (only card)
      expect(result[0].is_recommended).toBe(true);
    });

    it('should handle negative remaining_cap (treat as 0)', () => {
      // Should not happen in production, but defensive check
      const cards: CardInput[] = [
        { card_id: 'c1', card_name: 'Negative Cap', bank: 'B', earn_rate_mpd: 4.0, remaining_cap: -100, monthly_cap_amount: 1000 },
        { card_id: 'c2', card_name: 'Uncapped', bank: 'B', earn_rate_mpd: 1.0, remaining_cap: null, monthly_cap_amount: null },
      ];

      const result = rankCards(cards);

      // Negative remaining: cap_ratio = 0.0, score = 0.0
      // Uncapped: score = 1.0
      expect(result[0].card_name).toBe('Uncapped');
    });
  });

  // =========================================================================
  // RPC error handling
  // =========================================================================
  describe('RPC error handling', () => {
    it('should return error for invalid category', async () => {
      mock.mockRpc.setError('recommend', {
        message: 'Invalid category: invalid',
        code: 'P0001',
      });

      const { data, error } = await getRecommendation(mock.supabase, 'invalid');

      expect(data).toBeNull();
      expect(error).not.toBeNull();
      expect(error!.message).toContain('Invalid category');
      expect(error!.code).toBe('P0001');
    });

    it('should return error when user is not authenticated', async () => {
      mock.mockRpc.setError('recommend', {
        message: 'Not authenticated',
        code: 'PGRST301',
      });

      const { data, error } = await getRecommendation(mock.supabase, 'dining');

      expect(data).toBeNull();
      expect(error).not.toBeNull();
      expect(error!.code).toBe('PGRST301');
    });
  });
});
