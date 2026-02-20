/**
 * MaxiMile Integration Tests: Transaction -> Cap -> Recommendation Flow
 *
 * Tests the full flow logic using mocks:
 *   1. Transaction -> Cap Update flow (spending_state changes)
 *   2. Cap -> Recommendation flow (cap-aware ranking changes)
 *
 * These tests simulate the database trigger behaviour in TypeScript to
 * verify that the end-to-end business logic holds -- from logging a
 * transaction, through spending_state upsert, to re-ranking recommendations.
 */

import { createMockSupabase, MockSupabaseClient, MockQueryBuilder } from './mocks/supabase';
import {
  cardHSBCRevolution,
  cardUOBPRVI,
  cardAmexAscend,
  capHSBCShared,
  capAmexDining,
  capAmexGroceries,
  MOCK_USER_ID,
  mockUser,
  mockSession,
  createTransaction,
} from './mocks/test-data';
import type { SpendingState, Transaction, Cap } from '../lib/supabase-types';

// ---------------------------------------------------------------------------
// Types
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

interface CardInput {
  card_id: string;
  card_name: string;
  bank: string;
  earn_rate_mpd: number;
  remaining_cap: number | null;
  monthly_cap_amount: number | null;
}

// ---------------------------------------------------------------------------
// Local spending_state simulator (mirrors the SQL trigger)
// ---------------------------------------------------------------------------

/**
 * Simulates the update_spending_state() trigger from the database.
 * Given the current spending states, a transaction, and the caps table,
 * returns the updated spending states array.
 */
function simulateSpendingStateUpdate(
  currentStates: SpendingState[],
  tx: Transaction,
  caps: Cap[],
): SpendingState[] {
  const month = tx.transaction_date.slice(0, 7); // YYYY-MM

  // Look up cap: category-specific first, then global (null category)
  const categoryCap = caps.find(
    c => c.card_id === tx.card_id && c.category_id === tx.category_id,
  );
  const globalCap = caps.find(
    c => c.card_id === tx.card_id && c.category_id === null,
  );
  const cap = categoryCap || globalCap;
  const capAmount = cap ? cap.monthly_cap_amount : null;

  const existingIndex = currentStates.findIndex(
    s =>
      s.user_id === tx.user_id &&
      s.card_id === tx.card_id &&
      s.category_id === tx.category_id &&
      s.month === month,
  );

  const states = [...currentStates];

  if (existingIndex >= 0) {
    // UPDATE path
    const existing = { ...states[existingIndex] };
    existing.total_spent = existing.total_spent + tx.amount;
    existing.remaining_cap =
      capAmount === null ? (null as unknown as number) : Math.max(capAmount - existing.total_spent, 0);
    states[existingIndex] = existing;
  } else {
    // INSERT path
    const newState: SpendingState = {
      id: `ss-auto-${Date.now()}`,
      user_id: tx.user_id,
      card_id: tx.card_id,
      category_id: tx.category_id,
      month,
      total_spent: tx.amount,
      remaining_cap:
        capAmount === null ? (null as unknown as number) : Math.max(capAmount - tx.amount, 0),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    states.push(newState);
  }

  return states;
}

// ---------------------------------------------------------------------------
// Local recommendation scoring function (same as recommendation.test.ts)
// ---------------------------------------------------------------------------

function rankCards(cards: CardInput[]): RecommendRow[] {
  if (cards.length === 0) return [];

  const scored = cards.map(card => {
    let capRatio: number;
    if (card.monthly_cap_amount === null || card.monthly_cap_amount === undefined) {
      capRatio = 1.0;
    } else if (card.remaining_cap === null || card.remaining_cap === undefined) {
      capRatio = 1.0;
    } else if (card.remaining_cap <= 0) {
      capRatio = 0.0;
    } else {
      capRatio = Math.min(card.remaining_cap / card.monthly_cap_amount, 1.0);
    }
    const score = card.earn_rate_mpd * capRatio;
    return { ...card, score, capRatio };
  });

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
// Helper: build recommendation inputs from spending state
// ---------------------------------------------------------------------------

function buildCardInputsForDining(
  spendingStates: SpendingState[],
): CardInput[] {
  // HSBC: 4 mpd dining, cap $1000 (shared)
  const hsbcState = spendingStates.find(
    s => s.card_id === cardHSBCRevolution.id && s.category_id === 'dining',
  );
  // Amex: 2 mpd dining, cap $2500 per category
  const amexState = spendingStates.find(
    s => s.card_id === cardAmexAscend.id && s.category_id === 'dining',
  );

  return [
    {
      card_id: cardHSBCRevolution.id,
      card_name: cardHSBCRevolution.name,
      bank: cardHSBCRevolution.bank,
      earn_rate_mpd: 4.0,
      remaining_cap: hsbcState ? hsbcState.remaining_cap : 1000,
      monthly_cap_amount: 1000,
    },
    {
      card_id: cardAmexAscend.id,
      card_name: cardAmexAscend.name,
      bank: cardAmexAscend.bank,
      earn_rate_mpd: 2.0,
      remaining_cap: amexState ? amexState.remaining_cap : 2500,
      monthly_cap_amount: 2500,
    },
    {
      card_id: cardUOBPRVI.id,
      card_name: cardUOBPRVI.name,
      bank: cardUOBPRVI.bank,
      earn_rate_mpd: 1.4,
      remaining_cap: null,
      monthly_cap_amount: null,
    },
  ];
}

// ---------------------------------------------------------------------------
// All caps available in the system
// ---------------------------------------------------------------------------

const allCaps: Cap[] = [capHSBCShared, capAmexDining, capAmexGroceries];

// ===========================================================================
// Tests
// ===========================================================================

describe('Integration: Transaction -> Cap Update Flow', () => {
  // =========================================================================
  // 1. Log transaction -> spending_state created with correct total_spent
  // =========================================================================
  it('should create a spending_state row with correct total_spent on first transaction', () => {
    const states: SpendingState[] = [];
    const tx = createTransaction({
      card_id: cardHSBCRevolution.id,
      category_id: 'dining',
      amount: 100,
      transaction_date: '2026-02-15',
    });

    const updated = simulateSpendingStateUpdate(states, tx, allCaps);

    expect(updated).toHaveLength(1);
    expect(updated[0].total_spent).toBe(100);
    expect(updated[0].card_id).toBe(cardHSBCRevolution.id);
    expect(updated[0].category_id).toBe('dining');
    expect(updated[0].month).toBe('2026-02');
  });

  // =========================================================================
  // 2. Log second transaction -> total_spent incremented
  // =========================================================================
  it('should increment total_spent on subsequent transaction', () => {
    let states: SpendingState[] = [];
    const tx1 = createTransaction({
      card_id: cardHSBCRevolution.id,
      category_id: 'dining',
      amount: 100,
      transaction_date: '2026-02-15',
    });
    states = simulateSpendingStateUpdate(states, tx1, allCaps);

    const tx2 = createTransaction({
      card_id: cardHSBCRevolution.id,
      category_id: 'dining',
      amount: 200,
      transaction_date: '2026-02-16',
    });
    states = simulateSpendingStateUpdate(states, tx2, allCaps);

    expect(states).toHaveLength(1);
    expect(states[0].total_spent).toBe(300);
  });

  // =========================================================================
  // 3. Log transaction -> remaining_cap decremented
  // =========================================================================
  it('should decrement remaining_cap by the transaction amount', () => {
    const states: SpendingState[] = [];
    const tx = createTransaction({
      card_id: cardHSBCRevolution.id,
      category_id: 'dining',
      amount: 300,
      transaction_date: '2026-02-15',
    });

    const updated = simulateSpendingStateUpdate(states, tx, allCaps);

    // HSBC shared cap is $1000 -> remaining = 1000 - 300 = 700
    expect(updated[0].remaining_cap).toBe(700);
  });

  // =========================================================================
  // 4. Log transaction exceeding cap -> remaining_cap clamped to 0
  // =========================================================================
  it('should clamp remaining_cap to 0 when transaction exceeds cap', () => {
    let states: SpendingState[] = [];
    const tx1 = createTransaction({
      card_id: cardHSBCRevolution.id,
      category_id: 'dining',
      amount: 800,
      transaction_date: '2026-02-15',
    });
    states = simulateSpendingStateUpdate(states, tx1, allCaps);

    const tx2 = createTransaction({
      card_id: cardHSBCRevolution.id,
      category_id: 'dining',
      amount: 500,
      transaction_date: '2026-02-16',
    });
    states = simulateSpendingStateUpdate(states, tx2, allCaps);

    expect(states[0].total_spent).toBe(1300);
    // remaining_cap = max(1000 - 1300, 0) = 0
    expect(states[0].remaining_cap).toBe(0);
  });

  // =========================================================================
  // 5. Log transaction for uncapped card -> remaining_cap stays null
  // =========================================================================
  it('should keep remaining_cap as null for uncapped card', () => {
    const states: SpendingState[] = [];
    const tx = createTransaction({
      card_id: cardUOBPRVI.id,
      category_id: 'dining',
      amount: 500,
      transaction_date: '2026-02-15',
    });

    const updated = simulateSpendingStateUpdate(states, tx, allCaps);

    expect(updated).toHaveLength(1);
    expect(updated[0].total_spent).toBe(500);
    expect(updated[0].remaining_cap).toBeNull();
  });

  // =========================================================================
  // 6. Transaction in different month -> separate spending_state row
  // =========================================================================
  it('should create separate spending_state rows for different months', () => {
    let states: SpendingState[] = [];
    const txFeb = createTransaction({
      card_id: cardHSBCRevolution.id,
      category_id: 'dining',
      amount: 200,
      transaction_date: '2026-02-15',
    });
    states = simulateSpendingStateUpdate(states, txFeb, allCaps);

    const txMar = createTransaction({
      card_id: cardHSBCRevolution.id,
      category_id: 'dining',
      amount: 300,
      transaction_date: '2026-03-01',
    });
    states = simulateSpendingStateUpdate(states, txMar, allCaps);

    expect(states).toHaveLength(2);

    const febState = states.find(s => s.month === '2026-02');
    const marState = states.find(s => s.month === '2026-03');

    expect(febState).toBeDefined();
    expect(febState!.total_spent).toBe(200);
    expect(febState!.remaining_cap).toBe(800);

    expect(marState).toBeDefined();
    expect(marState!.total_spent).toBe(300);
    expect(marState!.remaining_cap).toBe(700);
  });

  // =========================================================================
  // 7. Transaction triggers recommendation update (cap-aware results change)
  // =========================================================================
  it('should change recommendation ranking after transaction reduces cap', () => {
    // Before any spending: HSBC 4mpd*1.0=4.0, Amex 2mpd*1.0=2.0, UOB 1.4*1.0=1.4
    let states: SpendingState[] = [];
    const inputsBefore = buildCardInputsForDining(states);
    const rankBefore = rankCards(inputsBefore);

    expect(rankBefore[0].card_name).toBe(cardHSBCRevolution.name); // HSBC wins with 4.0

    // Log $900 on HSBC dining (cap=$1000, remaining=$100, ratio=0.1, score=0.4)
    const tx = createTransaction({
      card_id: cardHSBCRevolution.id,
      category_id: 'dining',
      amount: 900,
      transaction_date: '2026-02-15',
    });
    states = simulateSpendingStateUpdate(states, tx, allCaps);

    const inputsAfter = buildCardInputsForDining(states);
    const rankAfter = rankCards(inputsAfter);

    // HSBC score: 4.0 * (100/1000) = 0.4
    // Amex score: 2.0 * 1.0 = 2.0 (no spending yet)
    // UOB score: 1.4 * 1.0 = 1.4
    expect(rankAfter[0].card_name).toBe(cardAmexAscend.name); // Amex now wins
    expect(rankAfter[0].is_recommended).toBe(true);
    expect(rankAfter[1].card_name).toBe(cardUOBPRVI.name);
    expect(rankAfter[2].card_name).toBe(cardHSBCRevolution.name);
  });

  // =========================================================================
  // 8. Log transaction -> cap status dashboard reflects new amounts
  // =========================================================================
  it('should reflect correct amounts in cap status dashboard data after transaction', () => {
    let states: SpendingState[] = [];
    const tx = createTransaction({
      card_id: cardAmexAscend.id,
      category_id: 'dining',
      amount: 500,
      transaction_date: '2026-02-15',
    });
    states = simulateSpendingStateUpdate(states, tx, allCaps);

    const amexDiningState = states.find(
      s => s.card_id === cardAmexAscend.id && s.category_id === 'dining',
    );

    expect(amexDiningState).toBeDefined();
    expect(amexDiningState!.total_spent).toBe(500);
    // Amex dining cap = $2500 -> remaining = 2000
    expect(amexDiningState!.remaining_cap).toBe(2000);

    // Dashboard display: 500 / 2500 spent
    const usagePercent = (amexDiningState!.total_spent / capAmexDining.monthly_cap_amount) * 100;
    expect(usagePercent).toBe(20);
  });

  // =========================================================================
  // 9. Single transaction on first day, verify full state shape
  // =========================================================================
  it('should produce a well-formed spending_state with all required fields', () => {
    const states: SpendingState[] = [];
    const tx = createTransaction({
      card_id: cardHSBCRevolution.id,
      category_id: 'dining',
      amount: 50,
      transaction_date: '2026-02-01',
    });

    const updated = simulateSpendingStateUpdate(states, tx, allCaps);

    expect(updated[0]).toHaveProperty('user_id', MOCK_USER_ID);
    expect(updated[0]).toHaveProperty('card_id', cardHSBCRevolution.id);
    expect(updated[0]).toHaveProperty('category_id', 'dining');
    expect(updated[0]).toHaveProperty('month', '2026-02');
    expect(updated[0]).toHaveProperty('total_spent', 50);
    expect(updated[0]).toHaveProperty('remaining_cap', 950);
  });
});

// ===========================================================================
// Cap -> Recommendation Flow
// ===========================================================================

describe('Integration: Cap -> Recommendation Flow', () => {
  // =========================================================================
  // 1. Fresh user -> full caps -> log transaction -> reduced cap in recommend
  // =========================================================================
  it('should return full caps for fresh user, then reduced cap after transaction', () => {
    let states: SpendingState[] = [];

    // Fresh user: all caps full
    const inputsFresh = buildCardInputsForDining(states);
    const rankFresh = rankCards(inputsFresh);

    // HSBC: 4.0 * 1.0 = 4.0 (top)
    expect(rankFresh[0].card_name).toBe(cardHSBCRevolution.name);
    expect(rankFresh[0].remaining_cap).toBe(1000);

    // Log $300 on HSBC dining
    const tx = createTransaction({
      card_id: cardHSBCRevolution.id,
      category_id: 'dining',
      amount: 300,
      transaction_date: '2026-02-15',
    });
    states = simulateSpendingStateUpdate(states, tx, allCaps);

    const inputsAfter = buildCardInputsForDining(states);
    const rankAfter = rankCards(inputsAfter);

    // HSBC: 4.0 * (700/1000) = 2.8 -- still top
    expect(rankAfter[0].card_name).toBe(cardHSBCRevolution.name);
    expect(rankAfter[0].remaining_cap).toBe(700);
  });

  // =========================================================================
  // 2. Exhaust cap -> de-rank card -> log on different card -> that card reduces
  // =========================================================================
  it('should de-rank card when cap exhausted, then reduce cap on alternate card', () => {
    let states: SpendingState[] = [];

    // Exhaust HSBC dining cap
    const tx1 = createTransaction({
      card_id: cardHSBCRevolution.id,
      category_id: 'dining',
      amount: 1000,
      transaction_date: '2026-02-10',
    });
    states = simulateSpendingStateUpdate(states, tx1, allCaps);

    const inputs1 = buildCardInputsForDining(states);
    const rank1 = rankCards(inputs1);

    // HSBC cap exhausted: score = 0. Amex (2.0) wins.
    expect(rank1[0].card_name).toBe(cardAmexAscend.name);
    expect(rank1[0].is_recommended).toBe(true);

    // Now log on Amex dining
    const tx2 = createTransaction({
      card_id: cardAmexAscend.id,
      category_id: 'dining',
      amount: 500,
      transaction_date: '2026-02-12',
    });
    states = simulateSpendingStateUpdate(states, tx2, allCaps);

    const inputs2 = buildCardInputsForDining(states);
    const rank2 = rankCards(inputs2);

    // Amex remaining = 2000, score = 2.0 * (2000/2500) = 1.6
    // UOB score = 1.4
    // HSBC score = 0
    expect(rank2[0].card_name).toBe(cardAmexAscend.name);
    expect(rank2[0].remaining_cap).toBe(2000);
  });

  // =========================================================================
  // 3. Multiple categories -> each category's cap tracked independently
  // =========================================================================
  it('should track caps independently per category', () => {
    let states: SpendingState[] = [];

    // Spend on Amex dining
    const txDining = createTransaction({
      card_id: cardAmexAscend.id,
      category_id: 'dining',
      amount: 1000,
      transaction_date: '2026-02-15',
    });
    states = simulateSpendingStateUpdate(states, txDining, allCaps);

    // Spend on Amex groceries
    const txGroceries = createTransaction({
      card_id: cardAmexAscend.id,
      category_id: 'groceries',
      amount: 500,
      transaction_date: '2026-02-15',
    });
    states = simulateSpendingStateUpdate(states, txGroceries, allCaps);

    expect(states).toHaveLength(2);

    const diningState = states.find(s => s.category_id === 'dining');
    const groceriesState = states.find(s => s.category_id === 'groceries');

    // Dining: 1000/2500 spent, 1500 remaining
    expect(diningState!.total_spent).toBe(1000);
    expect(diningState!.remaining_cap).toBe(1500);

    // Groceries: 500/2500 spent, 2000 remaining
    expect(groceriesState!.total_spent).toBe(500);
    expect(groceriesState!.remaining_cap).toBe(2000);
  });

  // =========================================================================
  // 4. Cap at 80% -> recommendation still shows card but with amber indicator
  // =========================================================================
  it('should still recommend a card at 80% cap usage with amber indicator data', () => {
    let states: SpendingState[] = [];

    // Spend 80% of HSBC cap ($800 of $1000)
    const tx = createTransaction({
      card_id: cardHSBCRevolution.id,
      category_id: 'dining',
      amount: 800,
      transaction_date: '2026-02-15',
    });
    states = simulateSpendingStateUpdate(states, tx, allCaps);

    const inputs = buildCardInputsForDining(states);
    const ranked = rankCards(inputs);

    const hsbcCard = ranked.find(r => r.card_id === cardHSBCRevolution.id)!;
    expect(hsbcCard.remaining_cap).toBe(200);

    // Usage = 800/1000 = 80%
    const usagePercent = ((1000 - hsbcCard.remaining_cap!) / 1000) * 100;
    expect(usagePercent).toBe(80);

    // Amber indicator: usage >= 80% and < 100%
    const isAmber = usagePercent >= 80 && usagePercent < 100;
    expect(isAmber).toBe(true);

    // HSBC score = 4.0 * 0.2 = 0.8. Amex (2.0) > UOB (1.4) > HSBC (0.8).
    // HSBC still appears in results but is not recommended.
    expect(ranked[0].card_name).toBe(cardAmexAscend.name);
  });

  // =========================================================================
  // 5. Cap at 100% -> score drops to 0, card moves to bottom
  // =========================================================================
  it('should drop score to 0 and move card to bottom when cap is 100% used', () => {
    let states: SpendingState[] = [];

    // Exhaust HSBC cap
    const tx = createTransaction({
      card_id: cardHSBCRevolution.id,
      category_id: 'dining',
      amount: 1000,
      transaction_date: '2026-02-15',
    });
    states = simulateSpendingStateUpdate(states, tx, allCaps);

    const inputs = buildCardInputsForDining(states);
    const ranked = rankCards(inputs);

    const hsbcCard = ranked.find(r => r.card_id === cardHSBCRevolution.id)!;

    expect(hsbcCard.remaining_cap).toBe(0);
    expect(hsbcCard.is_recommended).toBe(false);

    // HSBC should be last (score = 0)
    const hsbcIndex = ranked.findIndex(r => r.card_id === cardHSBCRevolution.id);
    expect(hsbcIndex).toBe(ranked.length - 1);

    // Red indicator: usage = 100%
    const usagePercent = ((1000 - hsbcCard.remaining_cap!) / 1000) * 100;
    expect(usagePercent).toBe(100);
    const isRed = usagePercent >= 100;
    expect(isRed).toBe(true);
  });

  // =========================================================================
  // 6. New month -> caps reset -> recommendations return to pre-transaction state
  // =========================================================================
  it('should reset caps for new month with recommendations returning to full-cap ranking', () => {
    let states: SpendingState[] = [];

    // Exhaust February caps
    const txFeb = createTransaction({
      card_id: cardHSBCRevolution.id,
      category_id: 'dining',
      amount: 1000,
      transaction_date: '2026-02-15',
    });
    states = simulateSpendingStateUpdate(states, txFeb, allCaps);

    // February: HSBC is de-ranked
    const febStates = states.filter(s => s.month === '2026-02');
    const febInputs = buildCardInputsForDining(febStates);
    const febRank = rankCards(febInputs);
    expect(febRank[0].card_name).not.toBe(cardHSBCRevolution.name);

    // March: no spending states for this month yet
    const marStates = states.filter(s => s.month === '2026-03');
    expect(marStates).toHaveLength(0);

    // Build March inputs -- no spending means full caps
    const marInputs = buildCardInputsForDining(marStates);
    const marRank = rankCards(marInputs);

    // HSBC should be back on top with full cap
    expect(marRank[0].card_name).toBe(cardHSBCRevolution.name);
    expect(marRank[0].remaining_cap).toBe(1000);
    expect(marRank[0].is_recommended).toBe(true);
  });

  // =========================================================================
  // 7. Progressive cap erosion across multiple transactions
  // =========================================================================
  it('should progressively reduce cap and adjust rankings across many transactions', () => {
    let states: SpendingState[] = [];

    // Transaction 1: $200 on HSBC dining
    states = simulateSpendingStateUpdate(
      states,
      createTransaction({
        card_id: cardHSBCRevolution.id,
        category_id: 'dining',
        amount: 200,
        transaction_date: '2026-02-10',
      }),
      allCaps,
    );
    let inputs = buildCardInputsForDining(states);
    let ranked = rankCards(inputs);
    // HSBC: 4.0 * (800/1000) = 3.2. Still top.
    expect(ranked[0].card_name).toBe(cardHSBCRevolution.name);

    // Transaction 2: $400 more on HSBC dining
    states = simulateSpendingStateUpdate(
      states,
      createTransaction({
        card_id: cardHSBCRevolution.id,
        category_id: 'dining',
        amount: 400,
        transaction_date: '2026-02-12',
      }),
      allCaps,
    );
    inputs = buildCardInputsForDining(states);
    ranked = rankCards(inputs);
    // HSBC: 4.0 * (400/1000) = 1.6. Amex at 2.0 now wins.
    expect(ranked[0].card_name).toBe(cardAmexAscend.name);

    // Transaction 3: $400 more on HSBC dining
    states = simulateSpendingStateUpdate(
      states,
      createTransaction({
        card_id: cardHSBCRevolution.id,
        category_id: 'dining',
        amount: 400,
        transaction_date: '2026-02-14',
      }),
      allCaps,
    );
    inputs = buildCardInputsForDining(states);
    ranked = rankCards(inputs);
    // HSBC: total 1000 spent, remaining 0. Score = 0. Dead last.
    expect(ranked[ranked.length - 1].card_name).toBe(cardHSBCRevolution.name);
    expect(ranked[ranked.length - 1].remaining_cap).toBe(0);
  });

  // =========================================================================
  // 8. Uncapped card is unaffected by transaction on capped card
  // =========================================================================
  it('should not change uncapped card score when a capped card spends', () => {
    let states: SpendingState[] = [];

    const inputsBefore = buildCardInputsForDining(states);
    const uobBefore = inputsBefore.find(c => c.card_id === cardUOBPRVI.id)!;

    states = simulateSpendingStateUpdate(
      states,
      createTransaction({
        card_id: cardHSBCRevolution.id,
        category_id: 'dining',
        amount: 500,
        transaction_date: '2026-02-15',
      }),
      allCaps,
    );

    const inputsAfter = buildCardInputsForDining(states);
    const uobAfter = inputsAfter.find(c => c.card_id === cardUOBPRVI.id)!;

    expect(uobAfter.remaining_cap).toBeNull();
    expect(uobAfter.remaining_cap).toBe(uobBefore.remaining_cap);
    expect(uobAfter.monthly_cap_amount).toBeNull();
  });
});

// ===========================================================================
// Cap Status Dashboard Integration
// ===========================================================================

describe('Integration: Cap Status Dashboard', () => {
  it('should calculate correct usage percentage for dashboard display', () => {
    let states: SpendingState[] = [];

    // Log transactions on multiple cards/categories
    states = simulateSpendingStateUpdate(
      states,
      createTransaction({
        card_id: cardHSBCRevolution.id,
        category_id: 'dining',
        amount: 250,
        transaction_date: '2026-02-15',
      }),
      allCaps,
    );
    states = simulateSpendingStateUpdate(
      states,
      createTransaction({
        card_id: cardAmexAscend.id,
        category_id: 'dining',
        amount: 2000,
        transaction_date: '2026-02-15',
      }),
      allCaps,
    );
    states = simulateSpendingStateUpdate(
      states,
      createTransaction({
        card_id: cardAmexAscend.id,
        category_id: 'groceries',
        amount: 2500,
        transaction_date: '2026-02-15',
      }),
      allCaps,
    );

    // HSBC dining: 250/1000 = 25% (green)
    const hsbcDining = states.find(
      s => s.card_id === cardHSBCRevolution.id && s.category_id === 'dining',
    )!;
    const hsbcUsage = (hsbcDining.total_spent / capHSBCShared.monthly_cap_amount) * 100;
    expect(hsbcUsage).toBe(25);
    expect(hsbcUsage < 80).toBe(true); // green

    // Amex dining: 2000/2500 = 80% (amber)
    const amexDining = states.find(
      s => s.card_id === cardAmexAscend.id && s.category_id === 'dining',
    )!;
    const amexDiningUsage = (amexDining.total_spent / capAmexDining.monthly_cap_amount) * 100;
    expect(amexDiningUsage).toBe(80);
    expect(amexDiningUsage >= 80 && amexDiningUsage < 100).toBe(true); // amber

    // Amex groceries: 2500/2500 = 100% (red)
    const amexGroceries = states.find(
      s => s.card_id === cardAmexAscend.id && s.category_id === 'groceries',
    )!;
    const amexGrocUsage = (amexGroceries.total_spent / capAmexGroceries.monthly_cap_amount) * 100;
    expect(amexGrocUsage).toBe(100);
    expect(amexGrocUsage >= 100).toBe(true); // red
  });

  it('should sort caps by urgency (most used first) for dashboard', () => {
    let states: SpendingState[] = [];

    states = simulateSpendingStateUpdate(
      states,
      createTransaction({
        card_id: cardHSBCRevolution.id,
        category_id: 'dining',
        amount: 100,
        transaction_date: '2026-02-15',
      }),
      allCaps,
    );
    states = simulateSpendingStateUpdate(
      states,
      createTransaction({
        card_id: cardAmexAscend.id,
        category_id: 'dining',
        amount: 2400,
        transaction_date: '2026-02-15',
      }),
      allCaps,
    );
    states = simulateSpendingStateUpdate(
      states,
      createTransaction({
        card_id: cardAmexAscend.id,
        category_id: 'groceries',
        amount: 1500,
        transaction_date: '2026-02-15',
      }),
      allCaps,
    );

    // Calculate usage ratios
    const capLookup: Record<string, number> = {
      [`${cardHSBCRevolution.id}:dining`]: capHSBCShared.monthly_cap_amount,
      [`${cardAmexAscend.id}:dining`]: capAmexDining.monthly_cap_amount,
      [`${cardAmexAscend.id}:groceries`]: capAmexGroceries.monthly_cap_amount,
    };

    const statesWithUsage = states.map(s => {
      const key = `${s.card_id}:${s.category_id}`;
      const capAmt = capLookup[key] || 0;
      return {
        ...s,
        usagePercent: capAmt > 0 ? (s.total_spent / capAmt) * 100 : 0,
      };
    });

    // Sort by usage descending (most urgent first)
    statesWithUsage.sort((a, b) => b.usagePercent - a.usagePercent);

    // Amex dining 96% > Amex groceries 60% > HSBC dining 10%
    expect(statesWithUsage[0].card_id).toBe(cardAmexAscend.id);
    expect(statesWithUsage[0].category_id).toBe('dining');
    expect(statesWithUsage[0].usagePercent).toBe(96);

    expect(statesWithUsage[1].card_id).toBe(cardAmexAscend.id);
    expect(statesWithUsage[1].category_id).toBe('groceries');
    expect(statesWithUsage[1].usagePercent).toBe(60);

    expect(statesWithUsage[2].card_id).toBe(cardHSBCRevolution.id);
    expect(statesWithUsage[2].usagePercent).toBe(10);
  });
});
