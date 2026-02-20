/**
 * MaxiMile Integration Tests: Sprint 7+8 Miles Portfolio & Engagement Loop
 *
 * Tests the full end-to-end flows for:
 *   Flow 1: Onboarding → Miles Portfolio
 *   Flow 2: Redemption → Balance Update → History
 *   Flow 3: Goal → Progress → Achievement
 *   Flow 4: Full Miles Lifecycle
 *   Flow 5: get_miles_portfolio consistency
 *
 * These tests simulate the RPC business logic locally (mirroring the SQL
 * from migrations 008 + 009) and verify expected state changes, following
 * the same approach as integration.test.ts.
 */

import { createMockSupabase, MockSupabaseClient } from './mocks/supabase';
import {
  cardHSBCRevolution,
  cardUOBPRVI,
  MOCK_USER_ID,
  mockUser,
  mockSession,
  createCard,
  createTransaction,
} from './mocks/test-data';

// ---------------------------------------------------------------------------
// Types (mirroring Sprint 7+8 schema)
// ---------------------------------------------------------------------------

interface MilesProgram {
  id: string;
  name: string;
  airline: string | null;
  program_type: string;
  icon_url: string;
}

interface MilesBalance {
  user_id: string;
  miles_program_id: string;
  manual_balance: number;
  updated_at: string;
}

interface MilesTransaction {
  id: string;
  user_id: string;
  miles_program_id: string;
  type: 'redeem' | 'transfer_out' | 'transfer_in' | 'adjust';
  amount: number;
  description: string | null;
  transaction_date: string;
  created_at: string;
}

interface MilesGoal {
  id: string;
  user_id: string;
  miles_program_id: string;
  target_miles: number;
  description: string;
  achieved_at: string | null;
  created_at: string;
}

interface PortfolioRow {
  program_id: string;
  program_name: string;
  airline: string | null;
  icon_url: string;
  manual_balance: number;
  auto_earned: number;
  total_redeemed: number;
  display_total: number;
  last_updated: string | null;
  contributing_cards: { card_id: string; name: string; bank: string }[];
}

interface UserCardMapping {
  card_id: string;
  miles_program_id: string;
  name: string;
  bank: string;
}

// ---------------------------------------------------------------------------
// Test fixture data — cards & programs for Sprint 7+8
// ---------------------------------------------------------------------------

const PROGRAM_KRISFLYER: MilesProgram = {
  id: 'prog-krisflyer',
  name: 'KrisFlyer',
  airline: 'Singapore Airlines',
  program_type: 'airline',
  icon_url: 'airplane-outline',
};

const PROGRAM_CITI_MILES: MilesProgram = {
  id: 'prog-citi-miles',
  name: 'Citi Miles',
  airline: null,
  program_type: 'bank_points',
  icon_url: 'airplane-outline',
};

const cardCitiPremierMiles = createCard({
  id: '00000000-0000-0000-0001-000000000020',
  bank: 'Citi',
  name: 'Citi PremierMiles Visa',
  slug: 'citi-premiermiles-visa',
  network: 'visa',
  annual_fee: 192.60,
  base_rate_mpd: 1.2,
});

const USER_CARD_MAPPINGS: UserCardMapping[] = [
  { card_id: cardHSBCRevolution.id, miles_program_id: PROGRAM_KRISFLYER.id, name: cardHSBCRevolution.name, bank: cardHSBCRevolution.bank },
  { card_id: cardUOBPRVI.id, miles_program_id: PROGRAM_KRISFLYER.id, name: cardUOBPRVI.name, bank: cardUOBPRVI.bank },
  { card_id: cardCitiPremierMiles.id, miles_program_id: PROGRAM_CITI_MILES.id, name: cardCitiPremierMiles.name, bank: cardCitiPremierMiles.bank },
];

// ---------------------------------------------------------------------------
// Simulator functions (mirror SQL logic from migrations 008 + 009)
// ---------------------------------------------------------------------------

/**
 * Mirrors get_miles_portfolio(p_user_id) from 009_miles_engagement.sql.
 * display_total = manual_balance + auto_earned - total_redeemed.
 */
function simulatePortfolio(
  programs: MilesProgram[],
  balances: MilesBalance[],
  earned: Map<string, number>,
  redeemed: Map<string, number>,
  userCards: UserCardMapping[],
): PortfolioRow[] {
  const rows = programs.map(p => {
    const balance = balances.find(b => b.miles_program_id === p.id);
    const manualBal = balance?.manual_balance ?? 0;
    const autoEarned = earned.get(p.id) ?? 0;
    const totalRedeemed = redeemed.get(p.id) ?? 0;
    return {
      program_id: p.id,
      program_name: p.name,
      airline: p.airline,
      icon_url: p.icon_url,
      manual_balance: manualBal,
      auto_earned: autoEarned,
      total_redeemed: totalRedeemed,
      display_total: manualBal + autoEarned - totalRedeemed,
      last_updated: balance?.updated_at ?? null,
      contributing_cards: userCards
        .filter(c => c.miles_program_id === p.id)
        .map(c => ({ card_id: c.card_id, name: c.name, bank: c.bank })),
    };
  });
  rows.sort((a, b) => b.display_total - a.display_total);
  return rows;
}

/**
 * Mirrors log_miles_redemption() from 009_miles_engagement.sql.
 * Inserts a redemption transaction and auto-checks goal achievement.
 */
function simulateLogRedemption(
  transactions: MilesTransaction[],
  goals: MilesGoal[],
  programId: string,
  amount: number,
  description: string | null,
  currentBalance: number,
  date: string = '2026-02-20',
): { transactions: MilesTransaction[]; goals: MilesGoal[]; txId: string } {
  if (amount <= 0 || amount > 10000000) {
    throw new Error('Redemption amount must be between 1 and 10,000,000');
  }

  const txId = `mtx-${Math.random().toString(36).slice(2, 8)}`;
  const now = new Date().toISOString();
  const newTx: MilesTransaction = {
    id: txId,
    user_id: MOCK_USER_ID,
    miles_program_id: programId,
    type: 'redeem',
    amount,
    description,
    transaction_date: date,
    created_at: now,
  };

  const updatedTxs = [...transactions, newTx];

  const totalRedeemed = updatedTxs
    .filter(t => t.miles_program_id === programId && t.type === 'redeem')
    .reduce((sum, t) => sum + t.amount, 0);
  const balanceAfterRedemption = currentBalance - totalRedeemed + transactions
    .filter(t => t.miles_program_id === programId && t.type === 'redeem')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = currentBalance - amount;

  const updatedGoals = goals.map(g => {
    if (
      g.miles_program_id === programId &&
      g.achieved_at === null &&
      g.target_miles <= netBalance
    ) {
      return { ...g, achieved_at: now };
    }
    return g;
  });

  return { transactions: updatedTxs, goals: updatedGoals, txId };
}

/**
 * Mirrors create_miles_goal() from 009_miles_engagement.sql.
 * Validates target >= 1000, description required, max 3 active per program.
 */
function simulateCreateGoal(
  goals: MilesGoal[],
  programId: string,
  targetMiles: number,
  description: string,
): { goals: MilesGoal[]; goalId: string } | { error: string } {
  if (targetMiles < 1000) {
    return { error: 'Target must be at least 1,000 miles' };
  }
  if (!description || description.trim() === '') {
    return { error: 'Goal description is required' };
  }

  const activeCount = goals.filter(
    g => g.user_id === MOCK_USER_ID && g.miles_program_id === programId && g.achieved_at === null,
  ).length;

  if (activeCount >= 3) {
    return { error: 'Maximum 3 active goals per program. Delete or complete an existing goal first.' };
  }

  const goalId = `goal-${Math.random().toString(36).slice(2, 8)}`;
  const newGoal: MilesGoal = {
    id: goalId,
    user_id: MOCK_USER_ID,
    miles_program_id: programId,
    target_miles: targetMiles,
    description: description.trim(),
    achieved_at: null,
    created_at: new Date().toISOString(),
  };

  return { goals: [...goals, newGoal], goalId };
}

/**
 * Mirrors delete_miles_goal() from 009_miles_engagement.sql.
 */
function simulateDeleteGoal(
  goals: MilesGoal[],
  goalId: string,
): { goals: MilesGoal[] } | { error: string } {
  const idx = goals.findIndex(g => g.id === goalId && g.user_id === MOCK_USER_ID);
  if (idx === -1) {
    return { error: 'Goal not found or not owned by user' };
  }
  const updated = [...goals];
  updated.splice(idx, 1);
  return { goals: updated };
}

/** Calculates goal progress percentage (capped at 100). */
function simulateGoalProgress(currentBalance: number, targetMiles: number) {
  const percentage = Math.min(100, Math.round((currentBalance / targetMiles) * 100));
  const achieved = currentBalance >= targetMiles;
  return { percentage, achieved };
}

/** Mirrors get_redemption_history() — returns redemptions newest first. */
function simulateRedemptionHistory(
  transactions: MilesTransaction[],
  programId: string,
  limit: number = 20,
): MilesTransaction[] {
  return transactions
    .filter(t => t.miles_program_id === programId && t.type === 'redeem')
    .sort((a, b) => b.transaction_date.localeCompare(a.transaction_date) || b.created_at.localeCompare(a.created_at))
    .slice(0, limit);
}

/**
 * Mirrors upsert_miles_balance() validation from 008_miles_portfolio.sql.
 */
function simulateUpsertBalance(
  balances: MilesBalance[],
  programId: string,
  amount: number,
): { balances: MilesBalance[] } | { error: string } {
  if (amount < 0 || amount > 10000000) {
    return { error: 'Balance must be between 0 and 10,000,000' };
  }

  const now = new Date().toISOString();
  const idx = balances.findIndex(
    b => b.user_id === MOCK_USER_ID && b.miles_program_id === programId,
  );

  const updated = [...balances];
  if (idx >= 0) {
    if (updated[idx].manual_balance === amount) return { balances: updated };
    updated[idx] = { ...updated[idx], manual_balance: amount, updated_at: now };
  } else {
    updated.push({
      user_id: MOCK_USER_ID,
      miles_program_id: programId,
      manual_balance: amount,
      updated_at: now,
    });
  }
  return { balances: updated };
}

// ===========================================================================
// Flow 1: Onboarding → Miles Portfolio
// ===========================================================================

describe('Flow 1: Onboarding → Miles Portfolio', () => {
  it('user selects cards → derives unique programs → enters balances → portfolio shows correct totals', () => {
    const programs = [PROGRAM_KRISFLYER, PROGRAM_CITI_MILES];
    const userCards = USER_CARD_MAPPINGS;

    const uniquePrograms = [...new Set(userCards.map(c => c.miles_program_id))];
    expect(uniquePrograms).toHaveLength(2);

    const krisFlyerCards = userCards.filter(c => c.miles_program_id === PROGRAM_KRISFLYER.id);
    const citiCards = userCards.filter(c => c.miles_program_id === PROGRAM_CITI_MILES.id);
    expect(krisFlyerCards).toHaveLength(2);
    expect(citiCards).toHaveLength(1);

    let balances: MilesBalance[] = [];
    const upsertKF = simulateUpsertBalance(balances, PROGRAM_KRISFLYER.id, 28500);
    expect('balances' in upsertKF).toBe(true);
    balances = (upsertKF as { balances: MilesBalance[] }).balances;

    const upsertCiti = simulateUpsertBalance(balances, PROGRAM_CITI_MILES.id, 5000);
    expect('balances' in upsertCiti).toBe(true);
    balances = (upsertCiti as { balances: MilesBalance[] }).balances;

    const earned = new Map<string, number>();
    const redeemed = new Map<string, number>();

    const portfolio = simulatePortfolio(programs, balances, earned, redeemed, userCards);

    expect(portfolio).toHaveLength(2);

    const kfRow = portfolio.find(r => r.program_id === PROGRAM_KRISFLYER.id)!;
    expect(kfRow.manual_balance).toBe(28500);
    expect(kfRow.auto_earned).toBe(0);
    expect(kfRow.total_redeemed).toBe(0);
    expect(kfRow.display_total).toBe(28500);
    expect(kfRow.contributing_cards).toHaveLength(2);
    expect(kfRow.contributing_cards.map(c => c.bank).sort()).toEqual(['HSBC', 'UOB']);

    const citiRow = portfolio.find(r => r.program_id === PROGRAM_CITI_MILES.id)!;
    expect(citiRow.manual_balance).toBe(5000);
    expect(citiRow.display_total).toBe(5000);
    expect(citiRow.contributing_cards).toHaveLength(1);
    expect(citiRow.contributing_cards[0].bank).toBe('Citi');

    expect(portfolio[0].display_total).toBeGreaterThanOrEqual(portfolio[1].display_total);
  });

  it('user skips Step 2 → all balances are 0 → portfolio still shows programs with auto_earned only', () => {
    const programs = [PROGRAM_KRISFLYER, PROGRAM_CITI_MILES];
    const balances: MilesBalance[] = [];
    const earned = new Map<string, number>([
      [PROGRAM_KRISFLYER.id, 2450],
      [PROGRAM_CITI_MILES.id, 800],
    ]);
    const redeemed = new Map<string, number>();

    const portfolio = simulatePortfolio(programs, balances, earned, redeemed, USER_CARD_MAPPINGS);

    expect(portfolio).toHaveLength(2);

    const kfRow = portfolio.find(r => r.program_id === PROGRAM_KRISFLYER.id)!;
    expect(kfRow.manual_balance).toBe(0);
    expect(kfRow.auto_earned).toBe(2450);
    expect(kfRow.display_total).toBe(2450);

    const citiRow = portfolio.find(r => r.program_id === PROGRAM_CITI_MILES.id)!;
    expect(citiRow.manual_balance).toBe(0);
    expect(citiRow.auto_earned).toBe(800);
    expect(citiRow.display_total).toBe(800);
  });
});

// ===========================================================================
// Flow 2: Redemption → Balance Update → History
// ===========================================================================

describe('Flow 2: Redemption → Balance → History', () => {
  const INITIAL_MANUAL = 28500;
  const INITIAL_EARNED = 2450;
  const INITIAL_TOTAL = INITIAL_MANUAL + INITIAL_EARNED; // 30950

  it('user logs 42,000 KrisFlyer redemption → display_total decreases by 42,000 → history shows entry', () => {
    const balances: MilesBalance[] = [
      { user_id: MOCK_USER_ID, miles_program_id: PROGRAM_KRISFLYER.id, manual_balance: INITIAL_MANUAL, updated_at: '2026-02-15T00:00:00Z' },
    ];
    const earned = new Map([[PROGRAM_KRISFLYER.id, INITIAL_EARNED]]);
    let transactions: MilesTransaction[] = [];
    let goals: MilesGoal[] = [];

    const result = simulateLogRedemption(
      transactions, goals, PROGRAM_KRISFLYER.id,
      42000, 'SIN to NRT Business Class', INITIAL_TOTAL,
    );
    transactions = result.transactions;
    goals = result.goals;

    const redeemed = new Map([[PROGRAM_KRISFLYER.id, 42000]]);
    const portfolio = simulatePortfolio(
      [PROGRAM_KRISFLYER], balances, earned, redeemed, USER_CARD_MAPPINGS,
    );

    const kfRow = portfolio[0];
    expect(kfRow.manual_balance).toBe(INITIAL_MANUAL);
    expect(kfRow.auto_earned).toBe(INITIAL_EARNED);
    expect(kfRow.total_redeemed).toBe(42000);
    expect(kfRow.display_total).toBe(INITIAL_TOTAL - 42000); // -11050

    const history = simulateRedemptionHistory(transactions, PROGRAM_KRISFLYER.id);
    expect(history).toHaveLength(1);
    expect(history[0].amount).toBe(42000);
    expect(history[0].description).toBe('SIN to NRT Business Class');
    expect(history[0].transaction_date).toBe('2026-02-20');
  });

  it('multiple redemptions accumulate → total_redeemed sums correctly', () => {
    const balances: MilesBalance[] = [
      { user_id: MOCK_USER_ID, miles_program_id: PROGRAM_KRISFLYER.id, manual_balance: INITIAL_MANUAL, updated_at: '2026-02-15T00:00:00Z' },
    ];
    const earned = new Map([[PROGRAM_KRISFLYER.id, INITIAL_EARNED]]);
    let transactions: MilesTransaction[] = [];
    const goals: MilesGoal[] = [];

    const r1 = simulateLogRedemption(
      transactions, goals, PROGRAM_KRISFLYER.id,
      10000, 'Hotel stay', INITIAL_TOTAL,
    );
    transactions = r1.transactions;

    const r2 = simulateLogRedemption(
      transactions, goals, PROGRAM_KRISFLYER.id,
      5000, 'Lounge access', INITIAL_TOTAL,
    );
    transactions = r2.transactions;

    const totalRedeemed = transactions
      .filter(t => t.miles_program_id === PROGRAM_KRISFLYER.id && t.type === 'redeem')
      .reduce((sum, t) => sum + t.amount, 0);
    expect(totalRedeemed).toBe(15000);

    const redeemed = new Map([[PROGRAM_KRISFLYER.id, totalRedeemed]]);
    const portfolio = simulatePortfolio(
      [PROGRAM_KRISFLYER], balances, earned, redeemed, USER_CARD_MAPPINGS,
    );
    expect(portfolio[0].display_total).toBe(INITIAL_TOTAL - 15000); // 15950
  });

  it('overdraft scenario: redemption > balance → still allowed (negative display_total per Sprint 8 AC5)', () => {
    const balances: MilesBalance[] = [
      { user_id: MOCK_USER_ID, miles_program_id: PROGRAM_KRISFLYER.id, manual_balance: INITIAL_MANUAL, updated_at: '2026-02-15T00:00:00Z' },
    ];
    const earned = new Map([[PROGRAM_KRISFLYER.id, INITIAL_EARNED]]);
    let transactions: MilesTransaction[] = [];
    const goals: MilesGoal[] = [];

    const result = simulateLogRedemption(
      transactions, goals, PROGRAM_KRISFLYER.id,
      50000, 'London First Class', INITIAL_TOTAL,
    );
    transactions = result.transactions;

    const redeemed = new Map([[PROGRAM_KRISFLYER.id, 50000]]);
    const portfolio = simulatePortfolio(
      [PROGRAM_KRISFLYER], balances, earned, redeemed, USER_CARD_MAPPINGS,
    );

    expect(portfolio[0].total_redeemed).toBe(50000);
    expect(portfolio[0].display_total).toBe(INITIAL_TOTAL - 50000); // -19050
    expect(portfolio[0].display_total).toBeLessThan(0);
  });
});

// ===========================================================================
// Flow 3: Goal → Progress → Achievement
// ===========================================================================

describe('Flow 3: Goal → Progress → Achievement', () => {
  const CURRENT_BALANCE = 30950; // 28500 manual + 2450 earned

  it('user sets 63,000 KrisFlyer goal → progress shows 49% (30950/63000)', () => {
    let goals: MilesGoal[] = [];
    const result = simulateCreateGoal(goals, PROGRAM_KRISFLYER.id, 63000, 'Tokyo Business Class');
    expect('goalId' in result).toBe(true);
    goals = (result as { goals: MilesGoal[]; goalId: string }).goals;

    expect(goals).toHaveLength(1);
    expect(goals[0].target_miles).toBe(63000);
    expect(goals[0].achieved_at).toBeNull();

    const progress = simulateGoalProgress(CURRENT_BALANCE, 63000);
    expect(progress.percentage).toBe(49); // Math.round(30950/63000*100) = 49
    expect(progress.achieved).toBe(false);
  });

  it('user enters higher balance → progress increases → eventually goal achieved', () => {
    let goals: MilesGoal[] = [];
    const createResult = simulateCreateGoal(goals, PROGRAM_KRISFLYER.id, 63000, 'Tokyo Business Class');
    goals = (createResult as { goals: MilesGoal[]; goalId: string }).goals;

    const autoEarned = 2450;

    // Step 1: balance = 60000 + 2450 = 62450 → 99%
    let progress = simulateGoalProgress(60000 + autoEarned, 63000);
    expect(progress.percentage).toBe(99);
    expect(progress.achieved).toBe(false);

    // Step 2: balance = 61000 + 2450 = 63450 → 101% capped to 100%, achieved
    progress = simulateGoalProgress(61000 + autoEarned, 63000);
    expect(progress.percentage).toBe(100);
    expect(progress.achieved).toBe(true);

    // Simulate goal achievement by marking achieved_at
    const now = new Date().toISOString();
    goals = goals.map(g => {
      if (g.achieved_at === null && g.target_miles <= 61000 + autoEarned) {
        return { ...g, achieved_at: now };
      }
      return g;
    });
    expect(goals[0].achieved_at).not.toBeNull();
  });

  it('max-3 constraint: 3 active goals OK, 4th rejected', () => {
    let goals: MilesGoal[] = [];

    const g1 = simulateCreateGoal(goals, PROGRAM_KRISFLYER.id, 63000, 'Tokyo Business');
    expect('goalId' in g1).toBe(true);
    goals = (g1 as { goals: MilesGoal[]; goalId: string }).goals;

    const g2 = simulateCreateGoal(goals, PROGRAM_KRISFLYER.id, 25000, 'Bangkok Economy');
    expect('goalId' in g2).toBe(true);
    goals = (g2 as { goals: MilesGoal[]; goalId: string }).goals;

    const g3 = simulateCreateGoal(goals, PROGRAM_KRISFLYER.id, 45000, 'Bali Premium');
    expect('goalId' in g3).toBe(true);
    goals = (g3 as { goals: MilesGoal[]; goalId: string }).goals;

    expect(goals).toHaveLength(3);
    expect(goals.every(g => g.achieved_at === null)).toBe(true);

    // 4th goal → rejected
    const g4 = simulateCreateGoal(goals, PROGRAM_KRISFLYER.id, 150000, 'London First');
    expect('error' in g4).toBe(true);
    expect((g4 as { error: string }).error).toContain('Maximum 3 active goals');

    // After achieving one goal, creating a new one succeeds
    goals = goals.map((g, i) =>
      i === 0 ? { ...g, achieved_at: new Date().toISOString() } : g,
    );
    const activeAfterAchieve = goals.filter(g => g.achieved_at === null);
    expect(activeAfterAchieve).toHaveLength(2);

    const g5 = simulateCreateGoal(goals, PROGRAM_KRISFLYER.id, 150000, 'London First');
    expect('goalId' in g5).toBe(true);
    goals = (g5 as { goals: MilesGoal[]; goalId: string }).goals;
    expect(goals).toHaveLength(4);
    expect(goals.filter(g => g.achieved_at === null)).toHaveLength(3);
  });

  it('delete goal → no longer in active list → can create new one', () => {
    let goals: MilesGoal[] = [];

    // Fill up 3 goals
    for (const desc of ['Goal A', 'Goal B', 'Goal C']) {
      const r = simulateCreateGoal(goals, PROGRAM_KRISFLYER.id, 10000, desc);
      goals = (r as { goals: MilesGoal[]; goalId: string }).goals;
    }
    expect(goals.filter(g => g.achieved_at === null)).toHaveLength(3);

    // 4th fails
    const fail = simulateCreateGoal(goals, PROGRAM_KRISFLYER.id, 20000, 'Goal D');
    expect('error' in fail).toBe(true);

    // Delete first goal
    const deleteResult = simulateDeleteGoal(goals, goals[0].id);
    expect('goals' in deleteResult).toBe(true);
    goals = (deleteResult as { goals: MilesGoal[] }).goals;
    expect(goals.filter(g => g.achieved_at === null)).toHaveLength(2);

    // Now 4th succeeds
    const success = simulateCreateGoal(goals, PROGRAM_KRISFLYER.id, 20000, 'Goal D');
    expect('goalId' in success).toBe(true);
    goals = (success as { goals: MilesGoal[]; goalId: string }).goals;
    expect(goals.filter(g => g.achieved_at === null)).toHaveLength(3);
  });
});

// ===========================================================================
// Flow 4: Full Miles Lifecycle
// ===========================================================================

describe('Flow 4: Full Miles Lifecycle: Setup → Earn → Redeem → Goal → Achieve', () => {
  it('complete lifecycle from card setup to goal achievement', () => {
    // ---- Step 1: User onboards with 2 cards ----
    const userCards: UserCardMapping[] = [
      { card_id: cardHSBCRevolution.id, miles_program_id: PROGRAM_KRISFLYER.id, name: cardHSBCRevolution.name, bank: 'HSBC' },
      { card_id: cardCitiPremierMiles.id, miles_program_id: PROGRAM_CITI_MILES.id, name: cardCitiPremierMiles.name, bank: 'Citi' },
    ];
    const programs = [PROGRAM_KRISFLYER, PROGRAM_CITI_MILES];

    // ---- Step 2: Enter initial balances ----
    let balances: MilesBalance[] = [];
    balances = (simulateUpsertBalance(balances, PROGRAM_KRISFLYER.id, 28500) as { balances: MilesBalance[] }).balances;
    balances = (simulateUpsertBalance(balances, PROGRAM_CITI_MILES.id, 5000) as { balances: MilesBalance[] }).balances;

    // ---- Step 3: Portfolio shows 2 programs ----
    let earned = new Map<string, number>();
    let redeemedMap = new Map<string, number>();
    let portfolio = simulatePortfolio(programs, balances, earned, redeemedMap, userCards);
    expect(portfolio).toHaveLength(2);
    expect(portfolio.find(r => r.program_id === PROGRAM_KRISFLYER.id)!.display_total).toBe(28500);
    expect(portfolio.find(r => r.program_id === PROGRAM_CITI_MILES.id)!.display_total).toBe(5000);

    // ---- Step 4: Set KrisFlyer goal: 42000 miles for "Bangkok Business Class" ----
    let goals: MilesGoal[] = [];
    const goalResult = simulateCreateGoal(goals, PROGRAM_KRISFLYER.id, 42000, 'Bangkok Business Class');
    goals = (goalResult as { goals: MilesGoal[]; goalId: string }).goals;
    expect(goals[0].target_miles).toBe(42000);

    // ---- Step 5: Progress check: 28500/42000 = 68% (no earned yet) ----
    let progress = simulateGoalProgress(28500, 42000);
    expect(progress.percentage).toBe(68);
    expect(progress.achieved).toBe(false);

    // With auto_earned = 2450: (28500+2450)/42000 = 74%
    earned = new Map([[PROGRAM_KRISFLYER.id, 2450]]);
    progress = simulateGoalProgress(28500 + 2450, 42000);
    expect(progress.percentage).toBe(74);

    // ---- Step 6: Simulate more transactions → auto_earned increases ----
    // Additional transactions bring earned to 14000
    earned = new Map([[PROGRAM_KRISFLYER.id, 14000]]);
    portfolio = simulatePortfolio(programs, balances, earned, redeemedMap, userCards);
    const kfTotal = portfolio.find(r => r.program_id === PROGRAM_KRISFLYER.id)!.display_total;
    expect(kfTotal).toBe(28500 + 14000); // 42500

    // ---- Step 7: Balance now exceeds goal → goal achieved! ----
    progress = simulateGoalProgress(kfTotal, 42000);
    expect(progress.percentage).toBe(100);
    expect(progress.achieved).toBe(true);

    // Mark goal achieved
    const now = new Date().toISOString();
    goals = goals.map(g => {
      if (g.achieved_at === null && g.target_miles <= kfTotal) {
        return { ...g, achieved_at: now };
      }
      return g;
    });
    expect(goals[0].achieved_at).not.toBeNull();

    // ---- Step 8: Redeem 42000 → balance drops, history updated ----
    let transactions: MilesTransaction[] = [];
    const redeemResult = simulateLogRedemption(
      transactions, goals, PROGRAM_KRISFLYER.id,
      42000, 'Bangkok Business Class redemption', kfTotal,
    );
    transactions = redeemResult.transactions;

    redeemedMap = new Map([[PROGRAM_KRISFLYER.id, 42000]]);
    portfolio = simulatePortfolio(programs, balances, earned, redeemedMap, userCards);
    const afterRedeem = portfolio.find(r => r.program_id === PROGRAM_KRISFLYER.id)!;
    expect(afterRedeem.total_redeemed).toBe(42000);
    expect(afterRedeem.display_total).toBe(28500 + 14000 - 42000); // 500

    const history = simulateRedemptionHistory(transactions, PROGRAM_KRISFLYER.id);
    expect(history).toHaveLength(1);
    expect(history[0].amount).toBe(42000);

    // ---- Step 9: Set new goal after redemption ----
    const newGoalResult = simulateCreateGoal(goals, PROGRAM_KRISFLYER.id, 63000, 'Tokyo Business Class');
    expect('goalId' in newGoalResult).toBe(true);
    goals = (newGoalResult as { goals: MilesGoal[]; goalId: string }).goals;

    const activeGoals = goals.filter(g => g.achieved_at === null);
    expect(activeGoals).toHaveLength(1);
    expect(activeGoals[0].description).toBe('Tokyo Business Class');

    progress = simulateGoalProgress(afterRedeem.display_total, 63000);
    expect(progress.percentage).toBe(1); // 500/63000 ~ 0.8% → rounds to 1
    expect(progress.achieved).toBe(false);
  });
});

// ===========================================================================
// Flow 5: get_miles_portfolio consistency
// ===========================================================================

describe('Flow 5: get_miles_portfolio consistency', () => {
  it('display_total always equals manual_balance + auto_earned - total_redeemed', () => {
    const testCases = [
      { manual: 28500, earned: 2450, redeemed: 0, expected: 30950 },
      { manual: 0, earned: 5000, redeemed: 0, expected: 5000 },
      { manual: 10000, earned: 0, redeemed: 3000, expected: 7000 },
      { manual: 28500, earned: 2450, redeemed: 42000, expected: -11050 },
      { manual: 0, earned: 0, redeemed: 0, expected: 0 },
      { manual: 100000, earned: 50000, redeemed: 100000, expected: 50000 },
      { manual: 1000, earned: 500, redeemed: 2000, expected: -500 },
    ];

    for (const tc of testCases) {
      const balances: MilesBalance[] = tc.manual > 0
        ? [{ user_id: MOCK_USER_ID, miles_program_id: PROGRAM_KRISFLYER.id, manual_balance: tc.manual, updated_at: '2026-02-20T00:00:00Z' }]
        : [];
      const earned = tc.earned > 0 ? new Map([[PROGRAM_KRISFLYER.id, tc.earned]]) : new Map<string, number>();
      const redeemed = tc.redeemed > 0 ? new Map([[PROGRAM_KRISFLYER.id, tc.redeemed]]) : new Map<string, number>();

      const portfolio = simulatePortfolio(
        [PROGRAM_KRISFLYER], balances, earned, redeemed, USER_CARD_MAPPINGS,
      );

      expect(portfolio[0].display_total).toBe(tc.expected);
      expect(portfolio[0].display_total).toBe(
        portfolio[0].manual_balance + portfolio[0].auto_earned - portfolio[0].total_redeemed,
      );
    }
  });

  it('contributing_cards reflects only user-owned cards for that program', () => {
    // User has 2 KrisFlyer cards
    const twoCardPortfolio = simulatePortfolio(
      [PROGRAM_KRISFLYER],
      [],
      new Map(),
      new Map(),
      USER_CARD_MAPPINGS.filter(c => c.miles_program_id === PROGRAM_KRISFLYER.id),
    );
    expect(twoCardPortfolio[0].contributing_cards).toHaveLength(2);

    // User removes 1 card (only HSBC remains)
    const oneCardPortfolio = simulatePortfolio(
      [PROGRAM_KRISFLYER],
      [],
      new Map(),
      new Map(),
      USER_CARD_MAPPINGS.filter(
        c => c.miles_program_id === PROGRAM_KRISFLYER.id && c.card_id === cardHSBCRevolution.id,
      ),
    );
    expect(oneCardPortfolio[0].contributing_cards).toHaveLength(1);
    expect(oneCardPortfolio[0].contributing_cards[0].bank).toBe('HSBC');
  });

  it('portfolio returns programs sorted by display_total descending', () => {
    const programs = [PROGRAM_KRISFLYER, PROGRAM_CITI_MILES];
    const balances: MilesBalance[] = [
      { user_id: MOCK_USER_ID, miles_program_id: PROGRAM_KRISFLYER.id, manual_balance: 5000, updated_at: '2026-02-20T00:00:00Z' },
      { user_id: MOCK_USER_ID, miles_program_id: PROGRAM_CITI_MILES.id, manual_balance: 50000, updated_at: '2026-02-20T00:00:00Z' },
    ];

    const portfolio = simulatePortfolio(programs, balances, new Map(), new Map(), USER_CARD_MAPPINGS);

    expect(portfolio[0].program_name).toBe('Citi Miles');
    expect(portfolio[0].display_total).toBe(50000);
    expect(portfolio[1].program_name).toBe('KrisFlyer');
    expect(portfolio[1].display_total).toBe(5000);
  });
});

// ===========================================================================
// Supabase RPC Mock Integration (verifies mock wiring)
// ===========================================================================

describe('Sprint 7+8 Supabase RPC Mock Integration', () => {
  let mock: MockSupabaseClient;

  beforeEach(() => {
    mock = createMockSupabase();
    mock.mockAuth.setUser(mockUser);
    mock.mockAuth.setSession(mockSession);
  });

  it('get_miles_portfolio RPC returns correct shape via mock', async () => {
    const portfolioData: PortfolioRow[] = [
      {
        program_id: PROGRAM_KRISFLYER.id,
        program_name: 'KrisFlyer',
        airline: 'Singapore Airlines',
        icon_url: 'airplane-outline',
        manual_balance: 28500,
        auto_earned: 2450,
        total_redeemed: 0,
        display_total: 30950,
        last_updated: '2026-02-15T00:00:00Z',
        contributing_cards: [
          { card_id: cardHSBCRevolution.id, name: cardHSBCRevolution.name, bank: 'HSBC' },
          { card_id: cardUOBPRVI.id, name: cardUOBPRVI.name, bank: 'UOB' },
        ],
      },
    ];
    mock.mockRpc.setData('get_miles_portfolio', portfolioData);

    const { data, error } = await mock.supabase.rpc('get_miles_portfolio', {
      p_user_id: MOCK_USER_ID,
    });

    expect(error).toBeNull();
    const rows = data as PortfolioRow[];
    expect(rows).toHaveLength(1);
    expect(rows[0].display_total).toBe(30950);
    expect(rows[0].contributing_cards).toHaveLength(2);
  });

  it('log_miles_redemption RPC returns transaction ID via mock', async () => {
    mock.mockRpc.setData('log_miles_redemption', 'mtx-abc123');

    const { data, error } = await mock.supabase.rpc('log_miles_redemption', {
      p_user_id: MOCK_USER_ID,
      p_program_id: PROGRAM_KRISFLYER.id,
      p_amount: 42000,
      p_description: 'SIN to NRT Business Class',
    });

    expect(error).toBeNull();
    expect(data).toBe('mtx-abc123');
  });

  it('create_miles_goal RPC rejects 4th active goal via mock', async () => {
    mock.mockRpc.setError('create_miles_goal', {
      message: 'Maximum 3 active goals per program. Delete or complete an existing goal first.',
      code: 'P0001',
    });

    const { data, error } = await mock.supabase.rpc('create_miles_goal', {
      p_user_id: MOCK_USER_ID,
      p_program_id: PROGRAM_KRISFLYER.id,
      p_target: 150000,
      p_description: 'London First',
    });

    expect(error).not.toBeNull();
    expect(error!.message).toContain('Maximum 3 active goals');
    expect(data).toBeNull();
  });

  it('get_redemption_history RPC returns entries via mock', async () => {
    const historyData = [
      { transaction_id: 'mtx-1', amount: 42000, description: 'SIN to NRT', transaction_date: '2026-02-20', created_at: '2026-02-20T10:00:00Z' },
      { transaction_id: 'mtx-2', amount: 10000, description: 'Lounge', transaction_date: '2026-02-18', created_at: '2026-02-18T10:00:00Z' },
    ];
    mock.mockRpc.setData('get_redemption_history', historyData);

    const { data, error } = await mock.supabase.rpc('get_redemption_history', {
      p_user_id: MOCK_USER_ID,
      p_program_id: PROGRAM_KRISFLYER.id,
    });

    expect(error).toBeNull();
    const history = data as typeof historyData;
    expect(history).toHaveLength(2);
    expect(history[0].amount).toBe(42000);
  });

  it('upsert_miles_balance RPC succeeds via mock', async () => {
    mock.mockRpc.setData('upsert_miles_balance', null);

    const { error } = await mock.supabase.rpc('upsert_miles_balance', {
      p_user_id: MOCK_USER_ID,
      p_program_id: PROGRAM_KRISFLYER.id,
      p_amount: 28500,
    });

    expect(error).toBeNull();
  });

  it('delete_miles_goal RPC succeeds via mock', async () => {
    mock.mockRpc.setData('delete_miles_goal', null);

    const { error } = await mock.supabase.rpc('delete_miles_goal', {
      p_user_id: MOCK_USER_ID,
      p_goal_id: 'goal-abc123',
    });

    expect(error).toBeNull();
  });

  it('unregistered RPC returns error', async () => {
    const { data, error } = await mock.supabase.rpc('nonexistent_rpc', {});

    expect(error).not.toBeNull();
    expect(error!.message).toContain('No mock registered');
    expect(data).toBeNull();
  });
});
