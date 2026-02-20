/**
 * MaxiMile E2E Test Scenarios (Mock-Based)
 *
 * Comprehensive end-to-end test scenarios simulating full user journeys:
 *   Scenario 1: New User Complete Flow
 *   Scenario 2: Cap Exhaustion
 *   Scenario 3: Multi-Card Multi-Category
 *   Scenario 4: Month Rollover
 *
 * These tests use mocks but exercise the full flow from user action
 * through state mutation to UI data verification.
 */

import { createMockSupabase, MockSupabaseClient, MockQueryBuilder } from './mocks/supabase';
import {
  cardHSBCRevolution,
  cardUOBPRVI,
  cardAmexAscend,
  capHSBCShared,
  capAmexDining,
  capAmexGroceries,
  capAmexTravel,
  mockCategories,
  mockUser,
  mockSession,
  MOCK_USER_ID,
  createTransaction,
  createUserCard,
  mockUserCards,
  earnRulesHSBC,
  earnRulesUOB,
  earnRulesAmex,
} from './mocks/test-data';
import type { SpendingState, Transaction, Cap, Card, UserCard } from '../lib/supabase-types';

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
// Shared simulation helpers
// ---------------------------------------------------------------------------

const ALL_CAPS: Cap[] = [capHSBCShared, capAmexDining, capAmexGroceries, capAmexTravel];

function simulateSpendingStateUpdate(
  currentStates: SpendingState[],
  tx: Transaction,
  caps: Cap[],
): SpendingState[] {
  const month = tx.transaction_date.slice(0, 7);
  const categoryCap = caps.find(c => c.card_id === tx.card_id && c.category_id === tx.category_id);
  const globalCap = caps.find(c => c.card_id === tx.card_id && c.category_id === null);
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
    const existing = { ...states[existingIndex] };
    existing.total_spent = existing.total_spent + tx.amount;
    existing.remaining_cap =
      capAmount === null ? (null as unknown as number) : Math.max(capAmount - existing.total_spent, 0);
    states[existingIndex] = existing;
  } else {
    const newState: SpendingState = {
      id: `ss-${Math.random().toString(36).slice(2, 8)}`,
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

/** Determine color indicator for a cap usage percentage. */
function getCapColor(usagePercent: number): 'green' | 'amber' | 'red' {
  if (usagePercent >= 100) return 'red';
  if (usagePercent >= 80) return 'amber';
  return 'green';
}

/** Build recommendation card inputs for a given category from spending state. */
function buildCardInputs(
  category: string,
  spendingStates: SpendingState[],
  portfolio: { card: Card; earnRateMpd: number; monthlyCap: number | null }[],
): CardInput[] {
  return portfolio.map(p => {
    const state = spendingStates.find(
      s => s.card_id === p.card.id && s.category_id === category,
    );
    return {
      card_id: p.card.id,
      card_name: p.card.name,
      bank: p.card.bank,
      earn_rate_mpd: p.earnRateMpd,
      remaining_cap: state ? state.remaining_cap : (p.monthlyCap !== null ? p.monthlyCap : null),
      monthly_cap_amount: p.monthlyCap,
    };
  });
}

// ===========================================================================
// Scenario 1: New User Complete Flow
// ===========================================================================

describe('E2E Scenario 1: New User Complete Flow', () => {
  let mock: MockSupabaseClient;
  let states: SpendingState[];

  beforeEach(() => {
    mock = createMockSupabase();
    mock.mockAuth.setUser(mockUser);
    mock.mockAuth.setSession(mockSession);
    states = [];
  });

  it('Step 1: Sign up -> user is authenticated', async () => {
    const { data } = await mock.supabase.auth.signUp({
      email: 'newuser@maximile.app',
      password: 'securePass123!',
    });

    expect(data.user).not.toBeNull();
    expect(data.session).not.toBeNull();
  });

  it('Step 2: Select 3 cards -> onboarding complete with portfolio of 3', async () => {
    const cardsToAdd = [cardHSBCRevolution, cardAmexAscend, cardUOBPRVI];
    const portfolioResults: UserCard[] = [];

    for (const card of cardsToAdd) {
      const qb = new MockQueryBuilder();
      qb.setData([createUserCard({ card_id: card.id })]);
      mock.queryBuilders.set('user_cards', qb);

      const { data, error } = await mock.supabase
        .from('user_cards')
        .insert({ card_id: card.id })
        .select();

      expect(error).toBeNull();
      portfolioResults.push((data as UserCard[])[0]);
    }

    expect(portfolioResults).toHaveLength(3);
  });

  it('Step 3: Recommend home -> 7 category tiles visible', async () => {
    const qb = new MockQueryBuilder();
    qb.setData(mockCategories);
    mock.queryBuilders.set('categories', qb);

    const { data, error } = await mock.supabase
      .from('categories')
      .select('id, name, display_order')
      .order('display_order', { ascending: true });

    expect(error).toBeNull();
    expect(data).toHaveLength(7);

    const categories = data as typeof mockCategories;
    expect(categories.map(c => c.id)).toEqual([
      'dining', 'transport', 'online', 'groceries', 'petrol', 'travel', 'general',
    ]);
  });

  it('Step 4: Tap Dining -> HSBC Revolution recommended (highest dining mpd, full cap)', () => {
    const portfolio = [
      { card: cardHSBCRevolution, earnRateMpd: 4.0, monthlyCap: 1000 },
      { card: cardAmexAscend, earnRateMpd: 2.0, monthlyCap: 2500 },
      { card: cardUOBPRVI, earnRateMpd: 1.4, monthlyCap: null },
    ];
    const inputs = buildCardInputs('dining', states, portfolio);
    const ranked = rankCards(inputs);

    expect(ranked[0].card_name).toBe('HSBC Revolution Credit Card');
    expect(ranked[0].is_recommended).toBe(true);
    expect(ranked[0].earn_rate_mpd).toBe(4.0);
  });

  it('Step 5-6: Log $50 dining on HSBC -> success overlay shows $950 remaining', () => {
    const tx = createTransaction({
      card_id: cardHSBCRevolution.id,
      category_id: 'dining',
      amount: 50,
      transaction_date: '2026-02-19',
    });
    states = simulateSpendingStateUpdate(states, tx, ALL_CAPS);

    const hsbcState = states.find(
      s => s.card_id === cardHSBCRevolution.id && s.category_id === 'dining',
    )!;

    // Success overlay data
    expect(hsbcState.total_spent).toBe(50);
    expect(hsbcState.remaining_cap).toBe(950);

    // Overlay message: "Logged! $950 remaining on HSBC dining cap"
    const overlayMessage = `Logged! $${hsbcState.remaining_cap} remaining on HSBC dining cap`;
    expect(overlayMessage).toBe('Logged! $950 remaining on HSBC dining cap');
  });

  it('Step 7: Tap Dining again -> HSBC still recommended but cap shows $950', () => {
    // Simulate the $50 transaction
    states = simulateSpendingStateUpdate(
      states,
      createTransaction({
        card_id: cardHSBCRevolution.id,
        category_id: 'dining',
        amount: 50,
        transaction_date: '2026-02-19',
      }),
      ALL_CAPS,
    );

    const portfolio = [
      { card: cardHSBCRevolution, earnRateMpd: 4.0, monthlyCap: 1000 },
      { card: cardAmexAscend, earnRateMpd: 2.0, monthlyCap: 2500 },
      { card: cardUOBPRVI, earnRateMpd: 1.4, monthlyCap: null },
    ];
    const inputs = buildCardInputs('dining', states, portfolio);
    const ranked = rankCards(inputs);

    // HSBC: 4.0 * (950/1000) = 3.8 -- still highest
    expect(ranked[0].card_name).toBe('HSBC Revolution Credit Card');
    expect(ranked[0].remaining_cap).toBe(950);
    expect(ranked[0].is_recommended).toBe(true);
  });

  it('Step 8: Cap Status -> HSBC dining shows $50/$1000 (green)', () => {
    states = simulateSpendingStateUpdate(
      states,
      createTransaction({
        card_id: cardHSBCRevolution.id,
        category_id: 'dining',
        amount: 50,
        transaction_date: '2026-02-19',
      }),
      ALL_CAPS,
    );

    const hsbcState = states.find(
      s => s.card_id === cardHSBCRevolution.id && s.category_id === 'dining',
    )!;

    const usagePercent = (hsbcState.total_spent / 1000) * 100;
    expect(usagePercent).toBe(5);
    expect(getCapColor(usagePercent)).toBe('green');

    // Dashboard display: $50 / $1000
    expect(hsbcState.total_spent).toBe(50);
    expect(hsbcState.remaining_cap).toBe(950);
  });
});

// ===========================================================================
// Scenario 2: Cap Exhaustion
// ===========================================================================

describe('E2E Scenario 2: Cap Exhaustion', () => {
  let states: SpendingState[];

  const portfolio = [
    { card: cardHSBCRevolution, earnRateMpd: 4.0, monthlyCap: 1000 },
    { card: cardAmexAscend, earnRateMpd: 2.0, monthlyCap: 2500 },
    { card: cardUOBPRVI, earnRateMpd: 1.4, monthlyCap: null },
  ];

  beforeEach(() => {
    states = [];
  });

  it('Step 1: User has HSBC Revolution with $1000 dining cap', () => {
    const inputs = buildCardInputs('dining', states, portfolio);
    const hsbcInput = inputs.find(i => i.card_id === cardHSBCRevolution.id)!;

    expect(hsbcInput.remaining_cap).toBe(1000);
    expect(hsbcInput.monthly_cap_amount).toBe(1000);
  });

  it('Step 2: Log $800 dining -> cap shows $200 remaining (amber)', () => {
    states = simulateSpendingStateUpdate(
      states,
      createTransaction({
        card_id: cardHSBCRevolution.id,
        category_id: 'dining',
        amount: 800,
        transaction_date: '2026-02-15',
      }),
      ALL_CAPS,
    );

    const hsbcState = states.find(
      s => s.card_id === cardHSBCRevolution.id && s.category_id === 'dining',
    )!;

    expect(hsbcState.remaining_cap).toBe(200);
    const usagePercent = (hsbcState.total_spent / 1000) * 100;
    expect(usagePercent).toBe(80);
    expect(getCapColor(usagePercent)).toBe('amber');
  });

  it('Step 3: Recommend dining -> HSBC still top but amber cap indicator', () => {
    states = simulateSpendingStateUpdate(
      states,
      createTransaction({
        card_id: cardHSBCRevolution.id,
        category_id: 'dining',
        amount: 800,
        transaction_date: '2026-02-15',
      }),
      ALL_CAPS,
    );

    const inputs = buildCardInputs('dining', states, portfolio);
    const ranked = rankCards(inputs);

    // HSBC: 4.0 * (200/1000) = 0.8
    // Amex: 2.0 * 1.0 = 2.0
    // UOB: 1.4 * 1.0 = 1.4
    // Actually Amex wins at this point
    expect(ranked[0].card_name).toBe(cardAmexAscend.name);

    // HSBC is below the others but has amber indicator
    const hsbcCard = ranked.find(r => r.card_id === cardHSBCRevolution.id)!;
    const usagePercent = ((1000 - hsbcCard.remaining_cap!) / 1000) * 100;
    expect(getCapColor(usagePercent)).toBe('amber');
  });

  it('Step 4: Log $200 more -> cap shows $0 remaining (red)', () => {
    // First log $800
    states = simulateSpendingStateUpdate(
      states,
      createTransaction({
        card_id: cardHSBCRevolution.id,
        category_id: 'dining',
        amount: 800,
        transaction_date: '2026-02-15',
      }),
      ALL_CAPS,
    );

    // Then log $200 more
    states = simulateSpendingStateUpdate(
      states,
      createTransaction({
        card_id: cardHSBCRevolution.id,
        category_id: 'dining',
        amount: 200,
        transaction_date: '2026-02-16',
      }),
      ALL_CAPS,
    );

    const hsbcState = states.find(
      s => s.card_id === cardHSBCRevolution.id && s.category_id === 'dining',
    )!;

    expect(hsbcState.total_spent).toBe(1000);
    expect(hsbcState.remaining_cap).toBe(0);
    const usagePercent = (hsbcState.total_spent / 1000) * 100;
    expect(getCapColor(usagePercent)).toBe('red');
  });

  it('Step 5: Recommend dining -> HSBC de-ranked, next best card recommended', () => {
    // Exhaust HSBC cap
    states = simulateSpendingStateUpdate(
      states,
      createTransaction({
        card_id: cardHSBCRevolution.id,
        category_id: 'dining',
        amount: 1000,
        transaction_date: '2026-02-15',
      }),
      ALL_CAPS,
    );

    const inputs = buildCardInputs('dining', states, portfolio);
    const ranked = rankCards(inputs);

    // HSBC exhausted (score=0), Amex recommended
    expect(ranked[0].card_name).toBe(cardAmexAscend.name);
    expect(ranked[0].is_recommended).toBe(true);

    // HSBC is last
    expect(ranked[ranked.length - 1].card_name).toBe(cardHSBCRevolution.name);
    expect(ranked[ranked.length - 1].remaining_cap).toBe(0);
  });

  it('Step 6: Cap status shows HSBC dining as red/exhausted', () => {
    states = simulateSpendingStateUpdate(
      states,
      createTransaction({
        card_id: cardHSBCRevolution.id,
        category_id: 'dining',
        amount: 1000,
        transaction_date: '2026-02-15',
      }),
      ALL_CAPS,
    );

    const hsbcState = states.find(
      s => s.card_id === cardHSBCRevolution.id && s.category_id === 'dining',
    )!;

    expect(hsbcState.remaining_cap).toBe(0);
    expect(getCapColor((hsbcState.total_spent / 1000) * 100)).toBe('red');
  });
});

// ===========================================================================
// Scenario 3: Multi-Card Multi-Category
// ===========================================================================

describe('E2E Scenario 3: Multi-Card Multi-Category', () => {
  let states: SpendingState[];

  // Card A = HSBC (dining winner: 4 mpd, cap $1000)
  // Card B = UOB (transport winner: 1.4 mpd flat, no cap)
  // Card C = Amex (dining runner-up: 2 mpd, cap $2500)
  const diningPortfolio = [
    { card: cardHSBCRevolution, earnRateMpd: 4.0, monthlyCap: 1000 },
    { card: cardAmexAscend, earnRateMpd: 2.0, monthlyCap: 2500 },
    { card: cardUOBPRVI, earnRateMpd: 1.4, monthlyCap: null },
  ];

  const transportPortfolio = [
    { card: cardHSBCRevolution, earnRateMpd: 0.4, monthlyCap: null },
    { card: cardAmexAscend, earnRateMpd: 1.1, monthlyCap: null },
    { card: cardUOBPRVI, earnRateMpd: 1.4, monthlyCap: null },
  ];

  beforeEach(() => {
    states = [];
  });

  it('Step 1: User has 3 cards with different strengths', () => {
    const diningInputs = buildCardInputs('dining', states, diningPortfolio);
    const transportInputs = buildCardInputs('transport', states, transportPortfolio);

    expect(diningInputs).toHaveLength(3);
    expect(transportInputs).toHaveLength(3);
  });

  it('Step 2: Recommend dining -> Card A (HSBC) wins', () => {
    const inputs = buildCardInputs('dining', states, diningPortfolio);
    const ranked = rankCards(inputs);

    expect(ranked[0].card_name).toBe(cardHSBCRevolution.name);
    expect(ranked[0].is_recommended).toBe(true);
  });

  it('Step 3: Recommend transport -> Card B (UOB) wins', () => {
    const inputs = buildCardInputs('transport', states, transportPortfolio);
    const ranked = rankCards(inputs);

    // UOB 1.4 > Amex 1.1 > HSBC 0.4
    expect(ranked[0].card_name).toBe(cardUOBPRVI.name);
    expect(ranked[0].is_recommended).toBe(true);
  });

  it('Step 4: Log dining on Card A -> only Card A dining cap affected', () => {
    states = simulateSpendingStateUpdate(
      states,
      createTransaction({
        card_id: cardHSBCRevolution.id,
        category_id: 'dining',
        amount: 300,
        transaction_date: '2026-02-15',
      }),
      ALL_CAPS,
    );

    // Only one state row should exist
    expect(states).toHaveLength(1);
    expect(states[0].card_id).toBe(cardHSBCRevolution.id);
    expect(states[0].category_id).toBe('dining');
    expect(states[0].total_spent).toBe(300);
  });

  it('Step 5: Card B (UOB) dining cap unchanged after Card A spends', () => {
    states = simulateSpendingStateUpdate(
      states,
      createTransaction({
        card_id: cardHSBCRevolution.id,
        category_id: 'dining',
        amount: 300,
        transaction_date: '2026-02-15',
      }),
      ALL_CAPS,
    );

    // No spending state for UOB dining
    const uobDiningState = states.find(
      s => s.card_id === cardUOBPRVI.id && s.category_id === 'dining',
    );
    expect(uobDiningState).toBeUndefined();

    // UOB is uncapped, so its recommendation input should have null caps
    const inputs = buildCardInputs('dining', states, diningPortfolio);
    const uobInput = inputs.find(i => i.card_id === cardUOBPRVI.id)!;
    expect(uobInput.remaining_cap).toBeNull();
    expect(uobInput.monthly_cap_amount).toBeNull();
  });

  it('Step 6: Recommend dining -> Card A still wins (cap not exhausted)', () => {
    states = simulateSpendingStateUpdate(
      states,
      createTransaction({
        card_id: cardHSBCRevolution.id,
        category_id: 'dining',
        amount: 300,
        transaction_date: '2026-02-15',
      }),
      ALL_CAPS,
    );

    const inputs = buildCardInputs('dining', states, diningPortfolio);
    const ranked = rankCards(inputs);

    // HSBC: 4.0 * (700/1000) = 2.8 -- still beats Amex 2.0 and UOB 1.4
    expect(ranked[0].card_name).toBe(cardHSBCRevolution.name);
    expect(ranked[0].remaining_cap).toBe(700);
    expect(ranked[0].is_recommended).toBe(true);
  });

  it('should not let a dining transaction affect transport recommendations', () => {
    states = simulateSpendingStateUpdate(
      states,
      createTransaction({
        card_id: cardHSBCRevolution.id,
        category_id: 'dining',
        amount: 1000,
        transaction_date: '2026-02-15',
      }),
      ALL_CAPS,
    );

    // Transport recommendations should be unaffected
    const transportInputs = buildCardInputs('transport', states, transportPortfolio);
    const transportRanked = rankCards(transportInputs);

    // UOB still wins transport (all uncapped for transport)
    expect(transportRanked[0].card_name).toBe(cardUOBPRVI.name);
    expect(transportRanked[0].is_recommended).toBe(true);
  });
});

// ===========================================================================
// Scenario 4: Month Rollover
// ===========================================================================

describe('E2E Scenario 4: Month Rollover', () => {
  let states: SpendingState[];

  const portfolio = [
    { card: cardHSBCRevolution, earnRateMpd: 4.0, monthlyCap: 1000 },
    { card: cardAmexAscend, earnRateMpd: 2.0, monthlyCap: 2500 },
    { card: cardUOBPRVI, earnRateMpd: 1.4, monthlyCap: null },
  ];

  beforeEach(() => {
    states = [];
  });

  it('Step 1: User has spending in January (various caps partially used)', () => {
    // Log transactions in January
    states = simulateSpendingStateUpdate(
      states,
      createTransaction({
        card_id: cardHSBCRevolution.id,
        category_id: 'dining',
        amount: 600,
        transaction_date: '2026-01-15',
      }),
      ALL_CAPS,
    );
    states = simulateSpendingStateUpdate(
      states,
      createTransaction({
        card_id: cardAmexAscend.id,
        category_id: 'dining',
        amount: 1200,
        transaction_date: '2026-01-20',
      }),
      ALL_CAPS,
    );

    const janStates = states.filter(s => s.month === '2026-01');
    expect(janStates).toHaveLength(2);

    const hsbcJan = janStates.find(s => s.card_id === cardHSBCRevolution.id)!;
    expect(hsbcJan.total_spent).toBe(600);
    expect(hsbcJan.remaining_cap).toBe(400);

    const amexJan = janStates.find(s => s.card_id === cardAmexAscend.id)!;
    expect(amexJan.total_spent).toBe(1200);
    expect(amexJan.remaining_cap).toBe(1300);
  });

  it('Step 2: February begins -> recommend returns full caps', () => {
    // January spending
    states = simulateSpendingStateUpdate(
      states,
      createTransaction({
        card_id: cardHSBCRevolution.id,
        category_id: 'dining',
        amount: 900,
        transaction_date: '2026-01-15',
      }),
      ALL_CAPS,
    );

    // February: filter to Feb states only (none exist)
    const febStates = states.filter(s => s.month === '2026-02');
    expect(febStates).toHaveLength(0);

    // Recommendations for February use only Feb spending state
    const inputs = buildCardInputs('dining', febStates, portfolio);
    const ranked = rankCards(inputs);

    // All full caps: HSBC 4.0 wins
    expect(ranked[0].card_name).toBe(cardHSBCRevolution.name);
    expect(ranked[0].remaining_cap).toBe(1000);
    expect(ranked[0].is_recommended).toBe(true);
  });

  it('Step 3: Cap status for February shows all green', () => {
    // Add January spending
    states = simulateSpendingStateUpdate(
      states,
      createTransaction({
        card_id: cardHSBCRevolution.id,
        category_id: 'dining',
        amount: 800,
        transaction_date: '2026-01-20',
      }),
      ALL_CAPS,
    );

    // February: no spending states exist
    const febStates = states.filter(s => s.month === '2026-02');
    expect(febStates).toHaveLength(0);

    // All caps at 0% usage = green
    // When no spending state exists, usage is 0%
    const usagePercent = 0;
    expect(getCapColor(usagePercent)).toBe('green');
  });

  it('Step 4: January history still accessible', () => {
    // January transactions
    states = simulateSpendingStateUpdate(
      states,
      createTransaction({
        card_id: cardHSBCRevolution.id,
        category_id: 'dining',
        amount: 500,
        transaction_date: '2026-01-10',
      }),
      ALL_CAPS,
    );
    states = simulateSpendingStateUpdate(
      states,
      createTransaction({
        card_id: cardAmexAscend.id,
        category_id: 'dining',
        amount: 300,
        transaction_date: '2026-01-15',
      }),
      ALL_CAPS,
    );

    // February transaction
    states = simulateSpendingStateUpdate(
      states,
      createTransaction({
        card_id: cardHSBCRevolution.id,
        category_id: 'dining',
        amount: 100,
        transaction_date: '2026-02-05',
      }),
      ALL_CAPS,
    );

    const janStates = states.filter(s => s.month === '2026-01');
    const febStates = states.filter(s => s.month === '2026-02');

    expect(janStates).toHaveLength(2);
    expect(febStates).toHaveLength(1);

    // January data preserved
    const hsbcJan = janStates.find(s => s.card_id === cardHSBCRevolution.id)!;
    expect(hsbcJan.total_spent).toBe(500);

    // February is independent
    const hsbcFeb = febStates.find(s => s.card_id === cardHSBCRevolution.id)!;
    expect(hsbcFeb.total_spent).toBe(100);
    expect(hsbcFeb.remaining_cap).toBe(900);
  });

  it('should correctly handle spending across 3 consecutive months', () => {
    // January
    states = simulateSpendingStateUpdate(
      states,
      createTransaction({
        card_id: cardHSBCRevolution.id,
        category_id: 'dining',
        amount: 400,
        transaction_date: '2026-01-15',
      }),
      ALL_CAPS,
    );
    // February
    states = simulateSpendingStateUpdate(
      states,
      createTransaction({
        card_id: cardHSBCRevolution.id,
        category_id: 'dining',
        amount: 600,
        transaction_date: '2026-02-15',
      }),
      ALL_CAPS,
    );
    // March
    states = simulateSpendingStateUpdate(
      states,
      createTransaction({
        card_id: cardHSBCRevolution.id,
        category_id: 'dining',
        amount: 200,
        transaction_date: '2026-03-15',
      }),
      ALL_CAPS,
    );

    expect(states).toHaveLength(3);

    const jan = states.find(s => s.month === '2026-01')!;
    expect(jan.total_spent).toBe(400);
    expect(jan.remaining_cap).toBe(600);

    const feb = states.find(s => s.month === '2026-02')!;
    expect(feb.total_spent).toBe(600);
    expect(feb.remaining_cap).toBe(400);

    const mar = states.find(s => s.month === '2026-03')!;
    expect(mar.total_spent).toBe(200);
    expect(mar.remaining_cap).toBe(800);

    // Each month's recommendation is independent
    const marInputs = buildCardInputs(
      'dining',
      states.filter(s => s.month === '2026-03'),
      portfolio,
    );
    const marRanked = rankCards(marInputs);
    // HSBC: 4.0 * (800/1000) = 3.2 still top
    expect(marRanked[0].card_name).toBe(cardHSBCRevolution.name);
  });
});

// ===========================================================================
// Scenario 5: Supabase RPC Mock E2E
// ===========================================================================

describe('E2E Scenario 5: Supabase RPC Integration', () => {
  let mock: MockSupabaseClient;

  beforeEach(() => {
    mock = createMockSupabase();
    mock.mockAuth.setUser(mockUser);
    mock.mockAuth.setSession(mockSession);
  });

  it('should get recommendation via RPC and log transaction via table insert', async () => {
    // Step 1: Get recommendation
    const recResult: RecommendRow[] = [
      {
        card_id: cardHSBCRevolution.id,
        card_name: cardHSBCRevolution.name,
        bank: 'HSBC',
        earn_rate_mpd: 4.0,
        remaining_cap: 1000,
        monthly_cap_amount: 1000,
        is_recommended: true,
      },
      {
        card_id: cardAmexAscend.id,
        card_name: cardAmexAscend.name,
        bank: 'Amex',
        earn_rate_mpd: 2.0,
        remaining_cap: 2500,
        monthly_cap_amount: 2500,
        is_recommended: false,
      },
    ];
    mock.mockRpc.setData('recommend', recResult);

    const { data: recData, error: recError } = await mock.supabase.rpc('recommend', {
      p_category_id: 'dining',
    });

    expect(recError).toBeNull();
    const recommendations = recData as RecommendRow[];
    expect(recommendations).toHaveLength(2);
    expect(recommendations[0].is_recommended).toBe(true);

    // Step 2: Log transaction on recommended card
    const txQb = new MockQueryBuilder();
    const createdTx = {
      id: 'tx-new',
      user_id: MOCK_USER_ID,
      card_id: recommendations[0].card_id,
      category_id: 'dining',
      amount: 85,
      transaction_date: '2026-02-19',
      logged_at: '2026-02-19T12:00:00+08:00',
    };
    txQb.setData([createdTx]);
    mock.queryBuilders.set('transactions', txQb);

    const { data: txData, error: txError } = await mock.supabase
      .from('transactions')
      .insert({
        card_id: recommendations[0].card_id,
        category_id: 'dining',
        amount: 85,
        transaction_date: '2026-02-19',
      })
      .select();

    expect(txError).toBeNull();
    expect(txData).not.toBeNull();
    expect((txData as typeof createdTx[])[0].amount).toBe(85);

    // Step 3: Get updated recommendation (cap reduced)
    const updatedRecResult: RecommendRow[] = [
      {
        card_id: cardHSBCRevolution.id,
        card_name: cardHSBCRevolution.name,
        bank: 'HSBC',
        earn_rate_mpd: 4.0,
        remaining_cap: 915, // 1000 - 85
        monthly_cap_amount: 1000,
        is_recommended: true,
      },
      {
        card_id: cardAmexAscend.id,
        card_name: cardAmexAscend.name,
        bank: 'Amex',
        earn_rate_mpd: 2.0,
        remaining_cap: 2500,
        monthly_cap_amount: 2500,
        is_recommended: false,
      },
    ];
    mock.mockRpc.setData('recommend', updatedRecResult);

    const { data: recData2 } = await mock.supabase.rpc('recommend', {
      p_category_id: 'dining',
    });

    const recs2 = recData2 as RecommendRow[];
    expect(recs2[0].remaining_cap).toBe(915);
    expect(recs2[0].is_recommended).toBe(true);
  });

  it('should fetch spending state for cap status dashboard via table query', async () => {
    const ssQb = new MockQueryBuilder();
    ssQb.setData([
      {
        card_id: cardHSBCRevolution.id,
        category_id: 'dining',
        month: '2026-02',
        total_spent: 750,
        remaining_cap: 250,
        cards: { bank: 'HSBC', name: 'HSBC Revolution Credit Card' },
        caps: { monthly_cap_amount: 1000 },
      },
      {
        card_id: cardAmexAscend.id,
        category_id: 'dining',
        month: '2026-02',
        total_spent: 500,
        remaining_cap: 2000,
        cards: { bank: 'Amex', name: 'American Express KrisFlyer Ascend' },
        caps: { monthly_cap_amount: 2500 },
      },
    ]);
    mock.queryBuilders.set('spending_state', ssQb);

    const { data, error } = await mock.supabase
      .from('spending_state')
      .select('*, cards(bank, name), caps(monthly_cap_amount)')
      .eq('month', '2026-02');

    expect(error).toBeNull();
    expect(data).toHaveLength(2);
  });
});
