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
  cardSCXCard,
  cardUOBPreferredPlatinum,
  cardMaybankWorldMC,
  cardUOBVisaSig,
  cardDBSVantage,
  cardOCBCVoyage,
  cardSCJourney,
  cardSCBeyond,
  cardHSBCPremierMC,
  cardMaybankXL,
  earnRulesDBSVantage,
  earnRulesOCBCVoyage,
  earnRulesSCJourney,
  earnRulesSCBeyond,
  earnRulesHSBCPremierMC,
  earnRulesMaybankXL,
  capSCJourneyShared,
  capMaybankXLShared,
  cardUOBLadysSolitaire,
  earnRulesUOBLadysSolitaire,
  capUOBLadysSolitaireShared,
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
  conditions_note: string | null;
  min_spend_threshold: number | null;
  min_spend_met: boolean | null;
  total_monthly_spend: number;
  requires_contactless: boolean;
}

// ---------------------------------------------------------------------------
// Local recommendation scoring function (mirrors the SQL algorithm)
// ---------------------------------------------------------------------------

interface CardInput {
  card_id: string;
  card_name: string;
  bank: string;
  earn_rate_mpd: number;
  base_rate_mpd?: number;
  remaining_cap: number | null;
  monthly_cap_amount: number | null;
  conditions_note?: string | null;
  min_spend_monthly?: number | null;
  effective_monthly_spend?: number;
  requires_contactless?: boolean;
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
    // F31: Min spend enforcement
    const minSpendThreshold = card.min_spend_monthly ?? null;
    const effectiveSpend = card.effective_monthly_spend ?? 0;
    const minSpendMet = minSpendThreshold === null
      ? null  // no min spend condition — field is null, not true
      : effectiveSpend >= minSpendThreshold;

    // If min spend not met and there's a base_rate, downrank to base_rate
    const effectiveEarnRate =
      (minSpendMet === false && card.base_rate_mpd !== undefined)
        ? card.base_rate_mpd
        : card.earn_rate_mpd;

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

    const score = effectiveEarnRate * capRatio;
    return {
      ...card,
      effectiveEarnRate,
      score,
      capRatio,
      minSpendThreshold,
      minSpendMet,
      effectiveSpend,
    };
  });

  // Sort: score DESC, earn_rate_mpd DESC (fallback), card_name ASC (tiebreaker)
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.effectiveEarnRate !== a.effectiveEarnRate) return b.effectiveEarnRate - a.effectiveEarnRate;
    return a.card_name.localeCompare(b.card_name);
  });

  return scored.map((card, index) => ({
    card_id: card.card_id,
    card_name: card.card_name,
    bank: card.bank,
    earn_rate_mpd: card.effectiveEarnRate,
    remaining_cap: card.remaining_cap,
    monthly_cap_amount: card.monthly_cap_amount,
    is_recommended: index === 0,
    conditions_note: card.conditions_note ?? null,
    min_spend_threshold: card.minSpendThreshold,
    min_spend_met: card.minSpendMet,
    total_monthly_spend: card.effectiveSpend,
    requires_contactless: card.requires_contactless ?? false,
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
  // 10. Sprint 21 — conditions_note passthrough
  // =========================================================================
  describe('Sprint 21 — conditions_note in results', () => {
    it('should pass through conditions_note from earn rules', () => {
      const cards: CardInput[] = [
        { card_id: 'sc-x', card_name: 'SC X Card', bank: 'SC', earn_rate_mpd: 3.3, remaining_cap: null, monthly_cap_amount: 2000, conditions_note: 'Earn 3.3 mpd on dining with min spend $500/month. Otherwise 0.4 mpd.' },
        { card_id: 'uob-pp', card_name: 'UOB Preferred Platinum', bank: 'UOB', earn_rate_mpd: 4.0, remaining_cap: 1000, monthly_cap_amount: 1000, conditions_note: 'Earn 4 mpd (10X UNI$) on dining with min spend $600/month.' },
        { card_id: 'hsbc-rev', card_name: 'HSBC Revolution', bank: 'HSBC', earn_rate_mpd: 4.0, remaining_cap: 1000, monthly_cap_amount: 1000, conditions_note: null },
      ];

      const result = rankCards(cards);

      // Verify conditions_note is preserved through ranking
      expect(result.find(r => r.card_name === 'SC X Card')?.conditions_note).toContain('min spend $500');
      expect(result.find(r => r.card_name === 'UOB Preferred Platinum')?.conditions_note).toContain('min spend $600');
      expect(result.find(r => r.card_name === 'HSBC Revolution')?.conditions_note).toBeNull();
    });

    it('should return null conditions_note for base-rate cards', () => {
      const cards: CardInput[] = [
        { card_id: 'uob-prvi', card_name: 'UOB PRVI Miles', bank: 'UOB', earn_rate_mpd: 1.4, remaining_cap: null, monthly_cap_amount: null },
      ];

      const result = rankCards(cards);

      expect(result[0].conditions_note).toBeNull();
    });

    it('should include conditions_note via RPC mock', async () => {
      const expectedResult: RecommendRow[] = [
        { card_id: 'sc-x', card_name: 'SC X Card', bank: 'SC', earn_rate_mpd: 3.3, remaining_cap: 2000, monthly_cap_amount: 2000, is_recommended: true, conditions_note: 'Min spend $500/month required.' },
      ];

      mock.mockRpc.setData('recommend', expectedResult);

      const { data, error } = await getRecommendation(mock.supabase, 'dining');

      expect(error).toBeNull();
      expect(data![0].conditions_note).toBe('Min spend $500/month required.');
    });
  });

  // =========================================================================
  // 11. Sprint 21 — Bills category (8-category coverage)
  // =========================================================================
  describe('Sprint 21 — Bills category recommendations', () => {
    it('should rank bills category cards correctly (all base rate)', () => {
      // All 20 cards earn base rate on bills — no bonus rules
      const cards: CardInput[] = [
        { card_id: 'boc', card_name: 'BOC Elite Miles', bank: 'BOC', earn_rate_mpd: 1.5, remaining_cap: null, monthly_cap_amount: null },
        { card_id: 'uob-prvi', card_name: 'UOB PRVI Miles', bank: 'UOB', earn_rate_mpd: 1.4, remaining_cap: null, monthly_cap_amount: null },
        { card_id: 'sc-vi', card_name: 'SC Visa Infinite', bank: 'SC', earn_rate_mpd: 1.4, remaining_cap: null, monthly_cap_amount: null },
        { card_id: 'dbs-alt', card_name: 'DBS Altitude', bank: 'DBS', earn_rate_mpd: 1.2, remaining_cap: null, monthly_cap_amount: null },
      ];

      const result = rankCards(cards);

      // BOC 1.5 > SC/UOB 1.4 (alphabetical: SC < UOB) > DBS 1.2
      expect(result[0].card_name).toBe('BOC Elite Miles');
      expect(result[0].is_recommended).toBe(true);
      expect(result[1].card_name).toBe('SC Visa Infinite');
      expect(result[2].card_name).toBe('UOB PRVI Miles');
      expect(result[3].card_name).toBe('DBS Altitude');
    });
  });

  // =========================================================================
  // 12. F31 — Min Spend Condition Enforcement
  // =========================================================================
  describe('F31 — Min spend condition enforcement', () => {
    it('should downrank card to base_rate when min_spend NOT met', () => {
      // User spends $200/month, SC X Card requires $500
      const cards: CardInput[] = [
        {
          card_id: cardSCXCard.id,
          card_name: 'SC X Card',
          bank: 'SC',
          earn_rate_mpd: 3.3,
          base_rate_mpd: 0.4,
          remaining_cap: 2000,
          monthly_cap_amount: 2000,
          min_spend_monthly: 500,
          effective_monthly_spend: 200,
          conditions_note: 'Min spend $500/month required.',
        },
        {
          card_id: cardUOBPRVI.id,
          card_name: 'UOB PRVI Miles',
          bank: 'UOB',
          earn_rate_mpd: 1.4,
          remaining_cap: null,
          monthly_cap_amount: null,
        },
      ];

      const result = rankCards(cards);

      // SC X Card: min spend not met -> base_rate 0.4 * 1.0 = 0.4
      // UOB PRVI: no min spend -> 1.4 * 1.0 = 1.4
      expect(result[0].card_name).toBe('UOB PRVI Miles');
      expect(result[0].is_recommended).toBe(true);
      expect(result[1].card_name).toBe('SC X Card');
      expect(result[1].earn_rate_mpd).toBe(0.4); // downranked to base
      expect(result[1].min_spend_met).toBe(false);
    });

    it('should use bonus rate when min_spend IS met', () => {
      // User spends $700/month, SC X Card requires $500
      const cards: CardInput[] = [
        {
          card_id: cardSCXCard.id,
          card_name: 'SC X Card',
          bank: 'SC',
          earn_rate_mpd: 3.3,
          base_rate_mpd: 0.4,
          remaining_cap: 2000,
          monthly_cap_amount: 2000,
          min_spend_monthly: 500,
          effective_monthly_spend: 700,
          conditions_note: 'Min spend $500/month required.',
        },
        {
          card_id: cardUOBPRVI.id,
          card_name: 'UOB PRVI Miles',
          bank: 'UOB',
          earn_rate_mpd: 1.4,
          remaining_cap: null,
          monthly_cap_amount: null,
        },
      ];

      const result = rankCards(cards);

      // SC X Card: min spend met -> 3.3 * 1.0 = 3.3
      // UOB PRVI: 1.4 * 1.0 = 1.4
      expect(result[0].card_name).toBe('SC X Card');
      expect(result[0].is_recommended).toBe(true);
      expect(result[0].earn_rate_mpd).toBe(3.3);
      expect(result[0].min_spend_met).toBe(true);
    });

    it('should not affect cards without min_spend conditions', () => {
      const cards: CardInput[] = [
        {
          card_id: cardHSBCRevolution.id,
          card_name: 'HSBC Revolution',
          bank: 'HSBC',
          earn_rate_mpd: 4.0,
          remaining_cap: 1000,
          monthly_cap_amount: 1000,
        },
      ];

      const result = rankCards(cards);

      expect(result[0].earn_rate_mpd).toBe(4.0);
      expect(result[0].min_spend_threshold).toBeNull();
      expect(result[0].min_spend_met).toBeNull();
    });

    it('should use higher of actual vs estimated spend (early month scenario)', () => {
      // Actual spend $400, estimated $600 — effective = $600
      // UOB PP requires $600, so min spend IS met
      const cards: CardInput[] = [
        {
          card_id: cardUOBPreferredPlatinum.id,
          card_name: 'UOB Preferred Platinum',
          bank: 'UOB',
          earn_rate_mpd: 4.0,
          base_rate_mpd: 0.4,
          remaining_cap: 1000,
          monthly_cap_amount: 1000,
          min_spend_monthly: 600,
          effective_monthly_spend: 600, // GREATEST(400 actual, 600 estimated)
          conditions_note: 'Min spend $600/month required.',
        },
      ];

      const result = rankCards(cards);

      expect(result[0].earn_rate_mpd).toBe(4.0); // bonus rate unlocked
      expect(result[0].min_spend_met).toBe(true);
    });

    it('should treat user with no settings as $0 estimated spend (conservative)', () => {
      // No user_settings row -> $0 spend, SC X Card ($500 min) NOT met
      const cards: CardInput[] = [
        {
          card_id: cardSCXCard.id,
          card_name: 'SC X Card',
          bank: 'SC',
          earn_rate_mpd: 3.3,
          base_rate_mpd: 0.4,
          remaining_cap: 2000,
          monthly_cap_amount: 2000,
          min_spend_monthly: 500,
          effective_monthly_spend: 0, // no settings = $0
        },
      ];

      const result = rankCards(cards);

      expect(result[0].earn_rate_mpd).toBe(0.4); // base rate
      expect(result[0].min_spend_met).toBe(false);
    });

    it('should correctly rank mixed min-spend and no-min-spend cards', () => {
      const cards: CardInput[] = [
        {
          card_id: cardUOBPreferredPlatinum.id,
          card_name: 'UOB Preferred Platinum',
          bank: 'UOB',
          earn_rate_mpd: 4.0,
          base_rate_mpd: 0.4,
          remaining_cap: 1000,
          monthly_cap_amount: 1000,
          min_spend_monthly: 600,
          effective_monthly_spend: 200, // not met
        },
        {
          card_id: cardSCXCard.id,
          card_name: 'SC X Card',
          bank: 'SC',
          earn_rate_mpd: 3.3,
          base_rate_mpd: 0.4,
          remaining_cap: 2000,
          monthly_cap_amount: 2000,
          min_spend_monthly: 500,
          effective_monthly_spend: 200, // not met
        },
        {
          card_id: cardHSBCRevolution.id,
          card_name: 'HSBC Revolution',
          bank: 'HSBC',
          earn_rate_mpd: 4.0,
          remaining_cap: 1000,
          monthly_cap_amount: 1000,
          // no min_spend
        },
      ];

      const result = rankCards(cards);

      // HSBC: 4.0 * 1.0 = 4.0 (no min spend required)
      // UOB PP: downranked to 0.4 * 1.0 = 0.4
      // SC X: downranked to 0.4 * 1.0 = 0.4
      expect(result[0].card_name).toBe('HSBC Revolution');
      expect(result[0].earn_rate_mpd).toBe(4.0);
      // UOB PP and SC X both at 0.4, tiebreak by name: SC < UOB
      expect(result[1].card_name).toBe('SC X Card');
      expect(result[2].card_name).toBe('UOB Preferred Platinum');
    });
  });

  // =========================================================================
  // 13. Contactless payment badge
  // =========================================================================
  describe('Contactless payment badge', () => {
    it('should return requires_contactless=true for card with contactless condition', () => {
      const cards: CardInput[] = [
        {
          card_id: 'kf-uob',
          card_name: 'KrisFlyer UOB Credit Card',
          bank: 'UOB',
          earn_rate_mpd: 2.0,
          remaining_cap: 1000,
          monthly_cap_amount: 1000,
          conditions_note: 'Earn 2 mpd on contactless dining transactions.',
          requires_contactless: true,
        },
      ];

      const result = rankCards(cards);

      expect(result[0].requires_contactless).toBe(true);
    });

    it('should return requires_contactless=false for card without contactless condition', () => {
      const cards: CardInput[] = [
        {
          card_id: cardHSBCRevolution.id,
          card_name: 'HSBC Revolution Credit Card',
          bank: 'HSBC',
          earn_rate_mpd: 4.0,
          remaining_cap: 1000,
          monthly_cap_amount: 1000,
        },
      ];

      const result = rankCards(cards);

      expect(result[0].requires_contactless).toBe(false);
    });
  });

  // =========================================================================
  // 14. Card 21: Maybank World Mastercard — petrol recommendation
  // =========================================================================
  describe('Card 21 — Maybank World Mastercard petrol', () => {
    it('should recommend Maybank World MC for petrol at 4 mpd, uncapped, no min spend', () => {
      const cards: CardInput[] = [
        {
          card_id: cardMaybankWorldMC.id,
          card_name: 'Maybank World Mastercard',
          bank: 'Maybank',
          earn_rate_mpd: 4.0,
          remaining_cap: null,
          monthly_cap_amount: null,
          // No min_spend_monthly — uncapped, no conditions
        },
        {
          card_id: cardSCXCard.id,
          card_name: 'SC X Card',
          bank: 'SC',
          earn_rate_mpd: 3.3,
          base_rate_mpd: 0.4,
          remaining_cap: 2000,
          monthly_cap_amount: 2000,
          min_spend_monthly: 500,
          effective_monthly_spend: 700,
        },
        {
          card_id: cardUOBPRVI.id,
          card_name: 'UOB PRVI Miles',
          bank: 'UOB',
          earn_rate_mpd: 1.4,
          remaining_cap: null,
          monthly_cap_amount: null,
        },
      ];

      const result = rankCards(cards);

      // Maybank: 4.0 * 1.0 = 4.0 (uncapped, no min spend)
      // SC X: 3.3 * 1.0 = 3.3 (min spend met)
      // UOB: 1.4 * 1.0 = 1.4
      expect(result[0].card_name).toBe('Maybank World Mastercard');
      expect(result[0].is_recommended).toBe(true);
      expect(result[0].earn_rate_mpd).toBe(4.0);
      expect(result[0].remaining_cap).toBeNull();
      expect(result[0].monthly_cap_amount).toBeNull();
      expect(result[0].min_spend_threshold).toBeNull();
      expect(result[0].min_spend_met).toBeNull();
      expect(result[0].requires_contactless).toBe(false);
    });
  });

  // =========================================================================
  // 15. Card 22: UOB Visa Signature — contactless + min spend
  // =========================================================================
  describe('Card 22 — UOB Visa Signature', () => {
    it('should enforce both contactless and min spend conditions simultaneously', () => {
      // User meets min spend ($1200 > $1000), contactless + min spend both enforced
      const cards: CardInput[] = [
        {
          card_id: cardUOBVisaSig.id,
          card_name: 'UOB Visa Signature',
          bank: 'UOB',
          earn_rate_mpd: 4.0,
          base_rate_mpd: 0.4,
          remaining_cap: 1200,
          monthly_cap_amount: 1200,
          min_spend_monthly: 1000,
          effective_monthly_spend: 1200,
          requires_contactless: true,
          conditions_note: 'Earn 4 mpd on contactless dining. Min spend $1,000/month. Cap $1,200/month shared.',
        },
        {
          card_id: cardHSBCRevolution.id,
          card_name: 'HSBC Revolution',
          bank: 'HSBC',
          earn_rate_mpd: 4.0,
          remaining_cap: 1000,
          monthly_cap_amount: 1000,
        },
      ];

      const result = rankCards(cards);

      const uobVS = result.find(r => r.card_name === 'UOB Visa Signature')!;
      expect(uobVS.earn_rate_mpd).toBe(4.0); // bonus rate unlocked
      expect(uobVS.min_spend_met).toBe(true);
      expect(uobVS.requires_contactless).toBe(true);
      expect(uobVS.monthly_cap_amount).toBe(1200);
      expect(uobVS.conditions_note).toContain('contactless');
      expect(uobVS.conditions_note).toContain('$1,000/month');
    });

    it('should show 4 mpd petrol WITHOUT contactless flag', () => {
      // UOB Visa Sig petrol: 4 mpd, min spend required, but NO contactless
      const cards: CardInput[] = [
        {
          card_id: cardUOBVisaSig.id,
          card_name: 'UOB Visa Signature',
          bank: 'UOB',
          earn_rate_mpd: 4.0,
          base_rate_mpd: 0.4,
          remaining_cap: 1200,
          monthly_cap_amount: 1200,
          min_spend_monthly: 1000,
          effective_monthly_spend: 1200,
          requires_contactless: false, // petrol does NOT require contactless
          conditions_note: 'Earn 4 mpd on petrol. No contactless required.',
        },
      ];

      const result = rankCards(cards);

      expect(result[0].card_name).toBe('UOB Visa Signature');
      expect(result[0].earn_rate_mpd).toBe(4.0);
      expect(result[0].requires_contactless).toBe(false);
      expect(result[0].min_spend_met).toBe(true);
    });

    it('should return 0.4 mpd base rate for online category', () => {
      // UOB Visa Sig online: base rate only (mobile in-app != contactless)
      const cards: CardInput[] = [
        {
          card_id: cardUOBVisaSig.id,
          card_name: 'UOB Visa Signature',
          bank: 'UOB',
          earn_rate_mpd: 0.4, // base rate — no bonus for online
          remaining_cap: null,
          monthly_cap_amount: null,
          conditions_note: 'Mobile contactless in-app payments classified as online, not contactless. 0.4 mpd.',
        },
        {
          card_id: cardUOBPRVI.id,
          card_name: 'UOB PRVI Miles',
          bank: 'UOB',
          earn_rate_mpd: 1.4,
          remaining_cap: null,
          monthly_cap_amount: null,
        },
      ];

      const result = rankCards(cards);

      // UOB PRVI at 1.4 should beat UOB Visa Sig at 0.4 for online
      expect(result[0].card_name).toBe('UOB PRVI Miles');
      expect(result[0].is_recommended).toBe(true);
      expect(result[1].card_name).toBe('UOB Visa Signature');
      expect(result[1].earn_rate_mpd).toBe(0.4);
      expect(result[1].requires_contactless).toBe(false);
    });
  });

  // =========================================================================
  // 16. Flat-Rate Cards (OCBC Voyage, SC Beyond, HSBC Premier MC)
  // =========================================================================
  describe('16. Flat-Rate Cards (OCBC Voyage, SC Beyond, HSBC Premier MC)', () => {

    it('OCBC Voyage returns 1.3 mpd for any category (no conditions)', () => {
      const cards: CardInput[] = [
        {
          card_id: cardOCBCVoyage.id,
          card_name: 'OCBC Voyage Card',
          bank: 'OCBC',
          earn_rate_mpd: 1.3,
          remaining_cap: null,
          monthly_cap_amount: null,
        },
      ];

      const result = rankCards(cards);

      expect(result).toHaveLength(1);
      expect(result[0].card_name).toBe('OCBC Voyage Card');
      expect(result[0].is_recommended).toBe(true);
      expect(result[0].earn_rate_mpd).toBe(1.3);
      expect(result[0].remaining_cap).toBeNull();
      expect(result[0].monthly_cap_amount).toBeNull();
      expect(result[0].min_spend_threshold).toBeNull();
      expect(result[0].min_spend_met).toBeNull();
      expect(result[0].requires_contactless).toBe(false);
    });

    it('SC Beyond returns 1.5 mpd for any category (no conditions)', () => {
      const cards: CardInput[] = [
        {
          card_id: cardSCBeyond.id,
          card_name: 'SC Beyond Card',
          bank: 'SC',
          earn_rate_mpd: 1.5,
          remaining_cap: null,
          monthly_cap_amount: null,
        },
      ];

      const result = rankCards(cards);

      expect(result).toHaveLength(1);
      expect(result[0].card_name).toBe('SC Beyond Card');
      expect(result[0].is_recommended).toBe(true);
      expect(result[0].earn_rate_mpd).toBe(1.5);
      expect(result[0].remaining_cap).toBeNull();
      expect(result[0].monthly_cap_amount).toBeNull();
      expect(result[0].min_spend_threshold).toBeNull();
      expect(result[0].min_spend_met).toBeNull();
      expect(result[0].requires_contactless).toBe(false);
    });

    it('HSBC Premier MC returns 1.4 mpd for any category (no conditions)', () => {
      const cards: CardInput[] = [
        {
          card_id: cardHSBCPremierMC.id,
          card_name: 'HSBC Premier Mastercard',
          bank: 'HSBC',
          earn_rate_mpd: 1.4,
          remaining_cap: null,
          monthly_cap_amount: null,
        },
      ];

      const result = rankCards(cards);

      expect(result).toHaveLength(1);
      expect(result[0].card_name).toBe('HSBC Premier Mastercard');
      expect(result[0].is_recommended).toBe(true);
      expect(result[0].earn_rate_mpd).toBe(1.4);
      expect(result[0].remaining_cap).toBeNull();
      expect(result[0].monthly_cap_amount).toBeNull();
      expect(result[0].min_spend_threshold).toBeNull();
      expect(result[0].min_spend_met).toBeNull();
      expect(result[0].requires_contactless).toBe(false);
    });
  });

  // =========================================================================
  // 17. DBS Vantage Visa Infinite (min spend $2,000/month)
  // =========================================================================
  describe('17. DBS Vantage Visa Infinite (min spend $2,000/month)', () => {

    it('DBS Vantage shows 1.5 mpd when min spend condition present', () => {
      const cards: CardInput[] = [
        {
          card_id: cardDBSVantage.id,
          card_name: 'DBS Vantage Visa Infinite',
          bank: 'DBS',
          earn_rate_mpd: 1.5,
          base_rate_mpd: 1.0,
          remaining_cap: null,
          monthly_cap_amount: null,
          min_spend_monthly: 2000,
          effective_monthly_spend: 2500,
        },
      ];

      const result = rankCards(cards);

      expect(result).toHaveLength(1);
      expect(result[0].card_name).toBe('DBS Vantage Visa Infinite');
      expect(result[0].is_recommended).toBe(true);
      expect(result[0].earn_rate_mpd).toBe(1.5);
      expect(result[0].min_spend_threshold).toBe(2000);
      expect(result[0].min_spend_met).toBe(true);
      expect(result[0].requires_contactless).toBe(false);
    });

    it('DBS Vantage has min_spend_monthly: 2000 in conditions', () => {
      const diningRule = earnRulesDBSVantage.find(r => r.category_id === 'dining');
      expect(diningRule?.conditions?.min_spend_monthly).toBe(2000);
    });
  });

  // =========================================================================
  // 18. SC Journey Card (online transport/grocery bonus)
  // =========================================================================
  describe('18. SC Journey Card (online transport/grocery bonus)', () => {

    it('SC Journey returns 3.0 mpd for transport (online bonus)', () => {
      const cards: CardInput[] = [
        {
          card_id: cardSCJourney.id,
          card_name: 'SC Journey Card',
          bank: 'SC',
          earn_rate_mpd: 3.0,
          remaining_cap: 1000,
          monthly_cap_amount: 1000,
        },
      ];

      const result = rankCards(cards);

      expect(result).toHaveLength(1);
      expect(result[0].card_name).toBe('SC Journey Card');
      expect(result[0].is_recommended).toBe(true);
      expect(result[0].earn_rate_mpd).toBe(3.0);
      expect(result[0].monthly_cap_amount).toBe(1000);
      expect(result[0].min_spend_threshold).toBeNull();
      expect(result[0].min_spend_met).toBeNull();
      expect(result[0].requires_contactless).toBe(false);
    });

    it('SC Journey returns 1.2 mpd for dining (base rate, not bonus)', () => {
      const cards: CardInput[] = [
        {
          card_id: cardSCJourney.id,
          card_name: 'SC Journey Card',
          bank: 'SC',
          earn_rate_mpd: 1.2,
          remaining_cap: 1000,
          monthly_cap_amount: 1000,
        },
      ];

      const result = rankCards(cards);

      expect(result).toHaveLength(1);
      expect(result[0].card_name).toBe('SC Journey Card');
      expect(result[0].is_recommended).toBe(true);
      expect(result[0].earn_rate_mpd).toBe(1.2);
      expect(result[0].requires_contactless).toBe(false);
    });
  });

  // =========================================================================
  // 19. Maybank XL Rewards (dining/online/travel bonus + min spend)
  // =========================================================================
  describe('19. Maybank XL Rewards (dining/online/travel bonus + min spend)', () => {

    it('Maybank XL returns 4.0 mpd for dining with min spend condition', () => {
      const cards: CardInput[] = [
        {
          card_id: cardMaybankXL.id,
          card_name: 'Maybank XL Rewards',
          bank: 'Maybank',
          earn_rate_mpd: 4.0,
          base_rate_mpd: 0.4,
          remaining_cap: 1000,
          monthly_cap_amount: 1000,
          min_spend_monthly: 500,
          effective_monthly_spend: 600,
        },
      ];

      const result = rankCards(cards);

      expect(result).toHaveLength(1);
      expect(result[0].card_name).toBe('Maybank XL Rewards');
      expect(result[0].is_recommended).toBe(true);
      expect(result[0].earn_rate_mpd).toBe(4.0);
      expect(result[0].min_spend_threshold).toBe(500);
      expect(result[0].min_spend_met).toBe(true);
      expect(result[0].monthly_cap_amount).toBe(1000);
      expect(result[0].requires_contactless).toBe(false);
    });

    it('Maybank XL returns 0.4 mpd for transport (not a bonus category)', () => {
      const cards: CardInput[] = [
        {
          card_id: cardMaybankXL.id,
          card_name: 'Maybank XL Rewards',
          bank: 'Maybank',
          earn_rate_mpd: 0.4,
          remaining_cap: null,
          monthly_cap_amount: null,
        },
      ];

      const result = rankCards(cards);

      expect(result).toHaveLength(1);
      expect(result[0].card_name).toBe('Maybank XL Rewards');
      expect(result[0].is_recommended).toBe(true);
      expect(result[0].earn_rate_mpd).toBe(0.4);
      expect(result[0].min_spend_threshold).toBeNull();
      expect(result[0].min_spend_met).toBeNull();
      expect(result[0].requires_contactless).toBe(false);
    });

    it('Maybank XL has min_spend_monthly: 500 condition on bonus categories', () => {
      const diningRule = earnRulesMaybankXL.find(r => r.category_id === 'dining');
      expect(diningRule?.conditions?.min_spend_monthly).toBe(500);
      const transportRule = earnRulesMaybankXL.find(r => r.category_id === 'transport');
      expect(transportRule?.conditions).toEqual({});
    });
  });

  // =========================================================================
  // 20. UOB Lady's Solitaire (user-selectable bonus categories)
  // =========================================================================
  describe('20. UOB Lady\'s Solitaire (user-selectable bonus categories)', () => {

    test('UOB Lady\'s Solitaire has user_selectable condition on bonus categories', () => {
      const diningRule = earnRulesUOBLadysSolitaire.find(r => r.category_id === 'dining');
      expect(diningRule?.conditions?.user_selectable).toBe(true);
      expect(diningRule?.earn_rate_mpd).toBe(4.0);
    });

    test('UOB Lady\'s Solitaire base categories return 0.4 mpd', () => {
      // online is NOT a selectable category - always base rate
      const cards: CardInput[] = [
        {
          card_id: cardUOBLadysSolitaire.id,
          card_name: 'UOB Lady\'s Solitaire',
          bank: 'UOB',
          earn_rate_mpd: 0.4,
          remaining_cap: null,
          monthly_cap_amount: null,
        },
      ];

      const result = rankCards(cards);

      expect(result).toHaveLength(1);
      expect(result[0].card_name).toBe('UOB Lady\'s Solitaire');
      expect(result[0].is_recommended).toBe(true);
      expect(result[0].earn_rate_mpd).toBe(0.4);
    });

    test('UOB Lady\'s Solitaire bonus categories have 4.0 mpd earn rate', () => {
      // dining is a selectable bonus category with 4.0 mpd in earn rules
      const cards: CardInput[] = [
        {
          card_id: cardUOBLadysSolitaire.id,
          card_name: 'UOB Lady\'s Solitaire',
          bank: 'UOB',
          earn_rate_mpd: 4.0,
          remaining_cap: 1500,
          monthly_cap_amount: 1500,
        },
      ];

      const result = rankCards(cards);

      expect(result).toHaveLength(1);
      expect(result[0].card_name).toBe('UOB Lady\'s Solitaire');
      expect(result[0].is_recommended).toBe(true);
      expect(result[0].earn_rate_mpd).toBe(4.0);
    });

    test('UOB Lady\'s Solitaire cap is $1,500 shared', () => {
      expect(capUOBLadysSolitaireShared.monthly_cap_amount).toBe(1500);
      expect(capUOBLadysSolitaireShared.category_id).toBeNull();
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
