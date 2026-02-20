/**
 * MaxiMile Integration Tests: Sprint 10 — Two-Layer Miles Ecosystem (S10.6)
 *
 * Tests the full end-to-end flows for:
 *   Flow 1: Multi-bank user → Layer 1 airline programs + Layer 2 bank programs (AC1)
 *   Flow 2: Segment switching — no stale data, correct hero totals (AC2)
 *   Flow 3: Balance update → potential miles recalculate → Layer 1 reflects change (AC4)
 *   Flow 4: Transfer options & nudge logic (F20)
 *   Flow 5: get_miles_portfolio with program_type filter
 *   Flow 6: get_transfer_options sort order & calculations
 *   Flow 7: get_potential_miles breakdown correctness
 *   Flow 8: Sprint 7–8 regression with expanded programs (AC5)
 *
 * Following the same simulation pattern as miles-integration.test.ts —
 * mirrors the SQL business logic locally for deterministic testing.
 */

import { createMockSupabase, MockSupabaseClient } from './mocks/supabase';
import { MOCK_USER_ID, mockUser, mockSession } from './mocks/test-data';

// ---------------------------------------------------------------------------
// Types (mirroring Sprint 9 + 10 schema)
// ---------------------------------------------------------------------------

interface MilesProgram {
  id: string;
  name: string;
  airline: string | null;
  program_type: 'airline' | 'bank_points' | 'transferable';
  icon_url: string;
}

interface TransferPartner {
  id: string;
  source_program_id: string;
  destination_program_id: string;
  conversion_rate_from: number;
  conversion_rate_to: number;
  transfer_fee_sgd: number | null;
  min_transfer_amount: number | null;
  transfer_url: string | null;
}

interface MilesBalance {
  user_id: string;
  miles_program_id: string;
  manual_balance: number;
  updated_at: string;
}

interface PortfolioRow {
  program_id: string;
  program_name: string;
  airline: string | null;
  program_type: string;
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

interface TransferOptionRow {
  transfer_id: string;
  destination_id: string;
  destination_name: string;
  destination_airline: string;
  destination_icon: string;
  conversion_rate_from: number;
  conversion_rate_to: number;
  points_per_mile: number;
  transfer_fee_sgd: number | null;
  resulting_miles: number;
}

interface PotentialMilesRow {
  source_program_id: string;
  source_program_name: string;
  source_balance: number;
  conversion_rate_from: number;
  conversion_rate_to: number;
  transfer_fee_sgd: number | null;
  potential_miles: number;
  total_potential: number;
}

interface NudgeSuggestion {
  bankName: string;
  bankBalance: number;
  bankProgramId: string;
  airlineName: string;
  potentialMiles: number;
}

// ---------------------------------------------------------------------------
// Test fixture data — programs for Sprint 9/10
// ---------------------------------------------------------------------------

// Airline FFPs
const KRISFLYER: MilesProgram = {
  id: 'prog-krisflyer',
  name: 'KrisFlyer',
  airline: 'Singapore Airlines',
  program_type: 'airline',
  icon_url: 'airplane-outline',
};

const ASIA_MILES: MilesProgram = {
  id: 'prog-asia-miles',
  name: 'Asia Miles',
  airline: 'Cathay Pacific',
  program_type: 'airline',
  icon_url: 'airplane-outline',
};

const BA_AVIOS: MilesProgram = {
  id: 'prog-ba-avios',
  name: 'British Airways Avios',
  airline: 'British Airways',
  program_type: 'airline',
  icon_url: 'airplane-outline',
};

// Bank points programs
const DBS_POINTS: MilesProgram = {
  id: 'prog-dbs-points',
  name: 'DBS Points',
  airline: null,
  program_type: 'bank_points',
  icon_url: 'card-outline',
};

const CITI_MILES: MilesProgram = {
  id: 'prog-citi-miles',
  name: 'Citi Miles',
  airline: null,
  program_type: 'bank_points',
  icon_url: 'card-outline',
};

const HSBC_REWARDS: MilesProgram = {
  id: 'prog-hsbc-rewards',
  name: 'HSBC Reward Points',
  airline: null,
  program_type: 'bank_points',
  icon_url: 'card-outline',
};

const ALL_PROGRAMS: MilesProgram[] = [
  KRISFLYER, ASIA_MILES, BA_AVIOS,
  DBS_POINTS, CITI_MILES, HSBC_REWARDS,
];

// Transfer partners (subset for testing)
const TRANSFER_PARTNERS: TransferPartner[] = [
  // DBS Points → KrisFlyer: 5,000:2,000 (5:2)
  {
    id: 'tp-dbs-kf',
    source_program_id: DBS_POINTS.id,
    destination_program_id: KRISFLYER.id,
    conversion_rate_from: 5000,
    conversion_rate_to: 2000,
    transfer_fee_sgd: null,
    min_transfer_amount: 5000,
    transfer_url: 'https://dbs.com/transfer',
  },
  // DBS Points → Asia Miles: 5,000:2,000 (5:2)
  {
    id: 'tp-dbs-am',
    source_program_id: DBS_POINTS.id,
    destination_program_id: ASIA_MILES.id,
    conversion_rate_from: 5000,
    conversion_rate_to: 2000,
    transfer_fee_sgd: null,
    min_transfer_amount: 5000,
    transfer_url: null,
  },
  // Citi Miles → KrisFlyer: 10,000:10,000 (1:1)
  {
    id: 'tp-citi-kf',
    source_program_id: CITI_MILES.id,
    destination_program_id: KRISFLYER.id,
    conversion_rate_from: 10000,
    conversion_rate_to: 10000,
    transfer_fee_sgd: null,
    min_transfer_amount: 10000,
    transfer_url: null,
  },
  // Citi Miles → Asia Miles: 10,000:10,000 (1:1)
  {
    id: 'tp-citi-am',
    source_program_id: CITI_MILES.id,
    destination_program_id: ASIA_MILES.id,
    conversion_rate_from: 10000,
    conversion_rate_to: 10000,
    transfer_fee_sgd: null,
    min_transfer_amount: 10000,
    transfer_url: null,
  },
  // Citi Miles → BA Avios: 10,000:10,000 (1:1)
  {
    id: 'tp-citi-ba',
    source_program_id: CITI_MILES.id,
    destination_program_id: BA_AVIOS.id,
    conversion_rate_from: 10000,
    conversion_rate_to: 10000,
    transfer_fee_sgd: null,
    min_transfer_amount: 10000,
    transfer_url: null,
  },
  // HSBC → KrisFlyer: 30,000:10,000 (3:1)
  {
    id: 'tp-hsbc-kf',
    source_program_id: HSBC_REWARDS.id,
    destination_program_id: KRISFLYER.id,
    conversion_rate_from: 30000,
    conversion_rate_to: 10000,
    transfer_fee_sgd: null,
    min_transfer_amount: 30000,
    transfer_url: null,
  },
  // HSBC → Asia Miles: 25,000:10,000 (2.5:1)
  {
    id: 'tp-hsbc-am',
    source_program_id: HSBC_REWARDS.id,
    destination_program_id: ASIA_MILES.id,
    conversion_rate_from: 25000,
    conversion_rate_to: 10000,
    transfer_fee_sgd: null,
    min_transfer_amount: 25000,
    transfer_url: null,
  },
];

// Card → program mappings (simulating user_cards + card_miles_programs)
const USER_CARDS: UserCardMapping[] = [
  // DBS Live Fresh → DBS Points
  { card_id: 'card-dbs-live-fresh', miles_program_id: DBS_POINTS.id, name: 'DBS Live Fresh Card', bank: 'DBS' },
  // Citi PremierMiles → Citi Miles
  { card_id: 'card-citi-pm', miles_program_id: CITI_MILES.id, name: 'Citi PremierMiles Visa', bank: 'Citi' },
  // HSBC Revolution → HSBC Reward Points
  { card_id: 'card-hsbc-rev', miles_program_id: HSBC_REWARDS.id, name: 'HSBC Revolution Credit Card', bank: 'HSBC' },
  // Amex KrisFlyer Ascend → KrisFlyer (direct co-brand, NOT Amex MR)
  { card_id: 'card-amex-kf', miles_program_id: KRISFLYER.id, name: 'Amex KrisFlyer Ascend', bank: 'Amex' },
];

// ---------------------------------------------------------------------------
// Simulator functions (mirror SQL logic from migrations 011 + 012)
// ---------------------------------------------------------------------------

/**
 * Mirrors get_miles_portfolio(p_user_id, p_program_type) from 012_miles_ecosystem_rpcs.sql.
 * Filters by program_type when provided.
 */
function simulatePortfolio(
  programs: MilesProgram[],
  balances: MilesBalance[],
  earned: Map<string, number>,
  redeemed: Map<string, number>,
  userCards: UserCardMapping[],
  programType?: string,
): PortfolioRow[] {
  // Determine which programs the user is connected to via their cards
  const userProgramIds = new Set(userCards.map(c => c.miles_program_id));

  const filtered = programs.filter(p => {
    if (programType && p.program_type !== programType) return false;
    return userProgramIds.has(p.id);
  });

  const rows = filtered.map(p => {
    const balance = balances.find(b => b.miles_program_id === p.id);
    const manualBal = balance?.manual_balance ?? 0;
    const autoEarned = earned.get(p.id) ?? 0;
    const totalRedeemed = redeemed.get(p.id) ?? 0;
    return {
      program_id: p.id,
      program_name: p.name,
      airline: p.airline,
      program_type: p.program_type,
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
 * Mirrors get_transfer_options(p_program_id) from 012_miles_ecosystem_rpcs.sql.
 * Returns transfer destinations sorted by best rate (lowest points_per_mile).
 */
function simulateTransferOptions(
  transferPartners: TransferPartner[],
  programs: MilesProgram[],
  sourceProgramId: string,
  userBalance: number,
): TransferOptionRow[] {
  const options = transferPartners
    .filter(tp => tp.source_program_id === sourceProgramId)
    .map(tp => {
      const dest = programs.find(p => p.id === tp.destination_program_id)!;
      const pointsPerMile = tp.conversion_rate_from / tp.conversion_rate_to;
      const resultingMiles = Math.floor(
        (userBalance * tp.conversion_rate_to) / tp.conversion_rate_from
      );
      return {
        transfer_id: tp.id,
        destination_id: dest.id,
        destination_name: dest.name,
        destination_airline: dest.airline ?? '',
        destination_icon: dest.icon_url,
        conversion_rate_from: tp.conversion_rate_from,
        conversion_rate_to: tp.conversion_rate_to,
        points_per_mile: pointsPerMile,
        transfer_fee_sgd: tp.transfer_fee_sgd,
        resulting_miles: resultingMiles,
      };
    });

  // Sort by best rate (lowest points_per_mile)
  options.sort((a, b) => a.points_per_mile - b.points_per_mile);
  return options;
}

/**
 * Mirrors get_potential_miles(p_user_id, p_destination_program_id) from 012_miles_ecosystem_rpcs.sql.
 * Returns how many miles a user could get in a destination program from all their bank points.
 */
function simulatePotentialMiles(
  transferPartners: TransferPartner[],
  programs: MilesProgram[],
  balances: MilesBalance[],
  userCards: UserCardMapping[],
  destinationProgramId: string,
): PotentialMilesRow[] {
  // Find all bank programs the user has cards for
  const userBankProgramIds = new Set(
    userCards
      .map(c => c.miles_program_id)
      .filter(pid => {
        const p = programs.find(pp => pp.id === pid);
        return p && (p.program_type === 'bank_points' || p.program_type === 'transferable');
      })
  );

  // For each bank program that transfers to this destination
  const rows: PotentialMilesRow[] = [];
  let totalPotential = 0;

  for (const tp of transferPartners) {
    if (tp.destination_program_id !== destinationProgramId) continue;
    if (!userBankProgramIds.has(tp.source_program_id)) continue;

    const sourceProgram = programs.find(p => p.id === tp.source_program_id)!;
    const balance = balances.find(
      b => b.miles_program_id === tp.source_program_id && b.user_id === MOCK_USER_ID
    );
    const sourceBalance = balance?.manual_balance ?? 0;

    if (sourceBalance <= 0) continue;

    const potentialMiles = Math.floor(
      (sourceBalance * tp.conversion_rate_to) / tp.conversion_rate_from
    );
    totalPotential += potentialMiles;

    rows.push({
      source_program_id: tp.source_program_id,
      source_program_name: sourceProgram.name,
      source_balance: sourceBalance,
      conversion_rate_from: tp.conversion_rate_from,
      conversion_rate_to: tp.conversion_rate_to,
      transfer_fee_sgd: tp.transfer_fee_sgd,
      potential_miles: potentialMiles,
      total_potential: 0, // will be set below
    });
  }

  // Set total_potential on all rows
  return rows.map(r => ({ ...r, total_potential: totalPotential }));
}

/**
 * Simulates the nudge logic from miles.tsx.
 * Picks bank with highest balance, then best transfer for that bank.
 */
function simulateNudgeSuggestion(
  bankPrograms: PortfolioRow[],
  transfersByBank: Record<string, TransferOptionRow[]>,
): NudgeSuggestion | null {
  if (bankPrograms.length === 0) return null;

  const topBank = bankPrograms.reduce((a, b) =>
    b.display_total > a.display_total ? b : a
  );

  if (topBank.display_total <= 0) return null;

  const bankTransfers = transfersByBank[topBank.program_id] || [];
  if (bankTransfers.length === 0) return null;

  // Pick airline with highest resulting miles
  const bestTransfer = bankTransfers.reduce((a, b) =>
    b.resulting_miles > a.resulting_miles ? b : a
  );

  return {
    bankName: topBank.program_name,
    bankBalance: topBank.display_total,
    bankProgramId: topBank.program_id,
    airlineName: bestTransfer.destination_name,
    potentialMiles: bestTransfer.resulting_miles,
  };
}

// ===========================================================================
// Flow 1: Multi-Bank User → Layer Visibility (AC1)
// ===========================================================================

describe('Flow 1: Multi-bank user → Layer 1 + Layer 2 visibility (AC1)', () => {
  const balances: MilesBalance[] = [
    { user_id: MOCK_USER_ID, miles_program_id: DBS_POINTS.id, manual_balance: 50000, updated_at: '2026-02-20T00:00:00Z' },
    { user_id: MOCK_USER_ID, miles_program_id: CITI_MILES.id, manual_balance: 80000, updated_at: '2026-02-20T00:00:00Z' },
    { user_id: MOCK_USER_ID, miles_program_id: HSBC_REWARDS.id, manual_balance: 120000, updated_at: '2026-02-20T00:00:00Z' },
    { user_id: MOCK_USER_ID, miles_program_id: KRISFLYER.id, manual_balance: 28500, updated_at: '2026-02-20T00:00:00Z' },
  ];
  const earned = new Map<string, number>([[KRISFLYER.id, 2450]]);
  const redeemed = new Map<string, number>();

  it('user with 3 bank cards + 1 airline co-brand → Layer 1 shows airline, Layer 2 shows 3 banks', () => {
    const airlinePortfolio = simulatePortfolio(ALL_PROGRAMS, balances, earned, redeemed, USER_CARDS, 'airline');
    const bankPortfolio = simulatePortfolio(ALL_PROGRAMS, balances, earned, redeemed, USER_CARDS, 'bank_points');

    // Layer 1: user has Amex KrisFlyer Ascend → KrisFlyer appears
    expect(airlinePortfolio).toHaveLength(1);
    expect(airlinePortfolio[0].program_name).toBe('KrisFlyer');
    expect(airlinePortfolio[0].display_total).toBe(28500 + 2450); // manual + auto_earned

    // Layer 2: 3 bank programs (DBS, Citi, HSBC)
    expect(bankPortfolio).toHaveLength(3);
    const bankNames = bankPortfolio.map(p => p.program_name);
    expect(bankNames).toContain('DBS Points');
    expect(bankNames).toContain('Citi Miles');
    expect(bankNames).toContain('HSBC Reward Points');
  });

  it('Layer 2 bank programs sorted by display_total descending', () => {
    const bankPortfolio = simulatePortfolio(ALL_PROGRAMS, balances, earned, redeemed, USER_CARDS, 'bank_points');

    expect(bankPortfolio[0].program_name).toBe('HSBC Reward Points');
    expect(bankPortfolio[0].display_total).toBe(120000);
    expect(bankPortfolio[1].program_name).toBe('Citi Miles');
    expect(bankPortfolio[1].display_total).toBe(80000);
    expect(bankPortfolio[2].program_name).toBe('DBS Points');
    expect(bankPortfolio[2].display_total).toBe(50000);
  });

  it('airline programs the user has NO cards for are excluded', () => {
    const airlinePortfolio = simulatePortfolio(ALL_PROGRAMS, balances, earned, redeemed, USER_CARDS, 'airline');

    // Asia Miles and BA Avios should NOT appear (user has no direct cards)
    const names = airlinePortfolio.map(p => p.program_name);
    expect(names).not.toContain('Asia Miles');
    expect(names).not.toContain('British Airways Avios');
  });

  it('contributing_cards correctly grouped per program', () => {
    const bankPortfolio = simulatePortfolio(ALL_PROGRAMS, balances, earned, redeemed, USER_CARDS, 'bank_points');

    const dbs = bankPortfolio.find(p => p.program_name === 'DBS Points')!;
    expect(dbs.contributing_cards).toHaveLength(1);
    expect(dbs.contributing_cards[0].bank).toBe('DBS');

    const airlinePortfolio = simulatePortfolio(ALL_PROGRAMS, balances, earned, redeemed, USER_CARDS, 'airline');
    const kf = airlinePortfolio.find(p => p.program_name === 'KrisFlyer')!;
    expect(kf.contributing_cards).toHaveLength(1);
    expect(kf.contributing_cards[0].name).toBe('Amex KrisFlyer Ascend');
  });
});

// ===========================================================================
// Flow 2: Segment Switching — Hero Totals (AC2)
// ===========================================================================

describe('Flow 2: Segment switching — hero totals & no stale data (AC2)', () => {
  const balances: MilesBalance[] = [
    { user_id: MOCK_USER_ID, miles_program_id: DBS_POINTS.id, manual_balance: 50000, updated_at: '2026-02-20T00:00:00Z' },
    { user_id: MOCK_USER_ID, miles_program_id: CITI_MILES.id, manual_balance: 80000, updated_at: '2026-02-20T00:00:00Z' },
    { user_id: MOCK_USER_ID, miles_program_id: HSBC_REWARDS.id, manual_balance: 120000, updated_at: '2026-02-20T00:00:00Z' },
    { user_id: MOCK_USER_ID, miles_program_id: KRISFLYER.id, manual_balance: 28500, updated_at: '2026-02-20T00:00:00Z' },
  ];
  const earned = new Map<string, number>([[KRISFLYER.id, 2450]]);
  const redeemed = new Map<string, number>();

  it('"My Miles" hero shows total airline miles (confirmed + potential)', () => {
    const airlinePortfolio = simulatePortfolio(ALL_PROGRAMS, balances, earned, redeemed, USER_CARDS, 'airline');

    // KrisFlyer confirmed = 28500 + 2450 = 30950
    const kfConfirmed = airlinePortfolio[0].display_total;
    expect(kfConfirmed).toBe(30950);

    // Potential miles from bank points
    const kfPotential = simulatePotentialMiles(
      TRANSFER_PARTNERS, ALL_PROGRAMS, balances, USER_CARDS, KRISFLYER.id,
    );
    const totalPotential = kfPotential[0]?.total_potential ?? 0;

    // DBS: floor(50000 * 2000 / 5000) = 20000
    // Citi: floor(80000 * 10000 / 10000) = 80000
    // HSBC: floor(120000 * 10000 / 30000) = 40000
    expect(totalPotential).toBe(20000 + 80000 + 40000); // 140000

    const heroTotal = kfConfirmed + totalPotential;
    expect(heroTotal).toBe(30950 + 140000); // 170950
  });

  it('"My Points" hero shows total bank points', () => {
    const bankPortfolio = simulatePortfolio(ALL_PROGRAMS, balances, earned, redeemed, USER_CARDS, 'bank_points');

    const totalBankPoints = bankPortfolio.reduce((sum, p) => sum + p.display_total, 0);
    expect(totalBankPoints).toBe(50000 + 80000 + 120000); // 250000
  });

  it('switching segments 5 times produces consistent totals', () => {
    for (let i = 0; i < 5; i++) {
      const airlines = simulatePortfolio(ALL_PROGRAMS, balances, earned, redeemed, USER_CARDS, 'airline');
      const banks = simulatePortfolio(ALL_PROGRAMS, balances, earned, redeemed, USER_CARDS, 'bank_points');

      // Same data every time
      expect(airlines).toHaveLength(1);
      expect(banks).toHaveLength(3);
      expect(airlines[0].display_total).toBe(30950);
      expect(banks.reduce((s, p) => s + p.display_total, 0)).toBe(250000);
    }
  });

  it('hero subtitle dynamically changes per segment', () => {
    const airlineCount = simulatePortfolio(ALL_PROGRAMS, balances, earned, redeemed, USER_CARDS, 'airline').length;
    const bankCount = simulatePortfolio(ALL_PROGRAMS, balances, earned, redeemed, USER_CARDS, 'bank_points').length;

    const milesSubtitle = `total miles across ${airlineCount} airline program${airlineCount === 1 ? '' : 's'}`;
    const pointsSubtitle = `total points across ${bankCount} bank program${bankCount === 1 ? '' : 's'}`;

    expect(milesSubtitle).toBe('total miles across 1 airline program');
    expect(pointsSubtitle).toBe('total points across 3 bank programs');
  });
});

// ===========================================================================
// Flow 3: Balance Update → Potential Miles Recalculate (AC4)
// ===========================================================================

describe('Flow 3: Balance update → potential miles recalculate (AC4)', () => {
  it('updating DBS Points balance → KrisFlyer potential miles update accordingly', () => {
    // Initial: DBS Points = 50,000
    const initialBalances: MilesBalance[] = [
      { user_id: MOCK_USER_ID, miles_program_id: DBS_POINTS.id, manual_balance: 50000, updated_at: '2026-02-20T00:00:00Z' },
    ];

    const initial = simulatePotentialMiles(
      TRANSFER_PARTNERS, ALL_PROGRAMS, initialBalances, USER_CARDS, KRISFLYER.id,
    );
    const initialDBS = initial.find(r => r.source_program_id === DBS_POINTS.id)!;
    expect(initialDBS.potential_miles).toBe(20000); // floor(50000 * 2000 / 5000)

    // Update: DBS Points = 100,000
    const updatedBalances: MilesBalance[] = [
      { user_id: MOCK_USER_ID, miles_program_id: DBS_POINTS.id, manual_balance: 100000, updated_at: '2026-02-20T01:00:00Z' },
    ];

    const updated = simulatePotentialMiles(
      TRANSFER_PARTNERS, ALL_PROGRAMS, updatedBalances, USER_CARDS, KRISFLYER.id,
    );
    const updatedDBS = updated.find(r => r.source_program_id === DBS_POINTS.id)!;
    expect(updatedDBS.potential_miles).toBe(40000); // floor(100000 * 2000 / 5000)
  });

  it('adding a new bank program → new potential source appears for airlines', () => {
    const balances: MilesBalance[] = [
      { user_id: MOCK_USER_ID, miles_program_id: CITI_MILES.id, manual_balance: 80000, updated_at: '2026-02-20T00:00:00Z' },
    ];

    // Only Citi card initially
    const cardsV1: UserCardMapping[] = [
      { card_id: 'card-citi-pm', miles_program_id: CITI_MILES.id, name: 'Citi PremierMiles', bank: 'Citi' },
    ];

    const potentialV1 = simulatePotentialMiles(
      TRANSFER_PARTNERS, ALL_PROGRAMS, balances, cardsV1, KRISFLYER.id,
    );
    expect(potentialV1).toHaveLength(1); // Only Citi → KrisFlyer
    expect(potentialV1[0].potential_miles).toBe(80000); // 1:1

    // Add DBS card
    const balancesV2: MilesBalance[] = [
      ...balances,
      { user_id: MOCK_USER_ID, miles_program_id: DBS_POINTS.id, manual_balance: 50000, updated_at: '2026-02-20T00:00:00Z' },
    ];
    const cardsV2: UserCardMapping[] = [
      ...cardsV1,
      { card_id: 'card-dbs', miles_program_id: DBS_POINTS.id, name: 'DBS Live Fresh', bank: 'DBS' },
    ];

    const potentialV2 = simulatePotentialMiles(
      TRANSFER_PARTNERS, ALL_PROGRAMS, balancesV2, cardsV2, KRISFLYER.id,
    );
    expect(potentialV2).toHaveLength(2); // Citi + DBS
    expect(potentialV2[0].total_potential).toBe(80000 + 20000); // 100000
  });

  it('zero balance bank program → excluded from potential sources', () => {
    const balances: MilesBalance[] = [
      { user_id: MOCK_USER_ID, miles_program_id: DBS_POINTS.id, manual_balance: 0, updated_at: '2026-02-20T00:00:00Z' },
      { user_id: MOCK_USER_ID, miles_program_id: CITI_MILES.id, manual_balance: 80000, updated_at: '2026-02-20T00:00:00Z' },
    ];

    const potential = simulatePotentialMiles(
      TRANSFER_PARTNERS, ALL_PROGRAMS, balances, USER_CARDS, KRISFLYER.id,
    );

    // DBS has 0 balance → excluded
    const sources = potential.map(r => r.source_program_name);
    expect(sources).not.toContain('DBS Points');
    expect(sources).toContain('Citi Miles');
  });
});

// ===========================================================================
// Flow 4: Transfer Options & Nudge Logic (F20)
// ===========================================================================

describe('Flow 4: Transfer options & smart nudge (F20)', () => {
  const balances: MilesBalance[] = [
    { user_id: MOCK_USER_ID, miles_program_id: DBS_POINTS.id, manual_balance: 50000, updated_at: '2026-02-20T00:00:00Z' },
    { user_id: MOCK_USER_ID, miles_program_id: CITI_MILES.id, manual_balance: 80000, updated_at: '2026-02-20T00:00:00Z' },
    { user_id: MOCK_USER_ID, miles_program_id: HSBC_REWARDS.id, manual_balance: 120000, updated_at: '2026-02-20T00:00:00Z' },
  ];
  const earned = new Map<string, number>();
  const redeemed = new Map<string, number>();

  it('DBS Points transfer options: KrisFlyer + Asia Miles, sorted by best rate', () => {
    const options = simulateTransferOptions(TRANSFER_PARTNERS, ALL_PROGRAMS, DBS_POINTS.id, 50000);

    expect(options).toHaveLength(2);
    // Both have same rate (5:2 = 2.5 points per mile)
    expect(options[0].points_per_mile).toBe(2.5);
    expect(options[1].points_per_mile).toBe(2.5);

    // Resulting miles: floor(50000 * 2000 / 5000) = 20000
    expect(options[0].resulting_miles).toBe(20000);
    expect(options[1].resulting_miles).toBe(20000);
  });

  it('Citi Miles transfer options: KrisFlyer + Asia Miles + BA Avios (1:1 rate)', () => {
    const options = simulateTransferOptions(TRANSFER_PARTNERS, ALL_PROGRAMS, CITI_MILES.id, 80000);

    expect(options).toHaveLength(3);
    // All 1:1 rate
    options.forEach(opt => {
      expect(opt.points_per_mile).toBe(1);
      expect(opt.resulting_miles).toBe(80000);
    });
  });

  it('nudge suggestion picks bank with highest balance (HSBC 120k)', () => {
    const bankPortfolio = simulatePortfolio(ALL_PROGRAMS, balances, earned, redeemed, USER_CARDS, 'bank_points');

    // Build transfer options for each bank
    const transfersByBank: Record<string, TransferOptionRow[]> = {};
    for (const bp of bankPortfolio) {
      transfersByBank[bp.program_id] = simulateTransferOptions(
        TRANSFER_PARTNERS, ALL_PROGRAMS, bp.program_id, bp.display_total,
      );
    }

    const nudge = simulateNudgeSuggestion(bankPortfolio, transfersByBank);

    expect(nudge).not.toBeNull();
    expect(nudge!.bankName).toBe('HSBC Reward Points');
    expect(nudge!.bankBalance).toBe(120000);
  });

  it('nudge picks airline with highest resulting miles from top bank', () => {
    const bankPortfolio = simulatePortfolio(ALL_PROGRAMS, balances, earned, redeemed, USER_CARDS, 'bank_points');

    const transfersByBank: Record<string, TransferOptionRow[]> = {};
    for (const bp of bankPortfolio) {
      transfersByBank[bp.program_id] = simulateTransferOptions(
        TRANSFER_PARTNERS, ALL_PROGRAMS, bp.program_id, bp.display_total,
      );
    }

    const nudge = simulateNudgeSuggestion(bankPortfolio, transfersByBank);

    // HSBC → Asia Miles: floor(120000 * 10000 / 25000) = 48000
    // HSBC → KrisFlyer: floor(120000 * 10000 / 30000) = 40000
    // Best = Asia Miles (48000)
    expect(nudge!.airlineName).toBe('Asia Miles');
    expect(nudge!.potentialMiles).toBe(48000);
  });

  it('no nudge when all bank balances are 0', () => {
    const zeroBankPortfolio: PortfolioRow[] = [
      {
        program_id: DBS_POINTS.id, program_name: 'DBS Points', airline: null,
        program_type: 'bank_points', icon_url: 'card-outline',
        manual_balance: 0, auto_earned: 0, total_redeemed: 0, display_total: 0,
        last_updated: null, contributing_cards: [],
      },
    ];

    const nudge = simulateNudgeSuggestion(zeroBankPortfolio, {});
    expect(nudge).toBeNull();
  });

  it('nudge dismissed → no nudge shown in current session', () => {
    // Simulates the dismissal logic (nudgeDismissed state in miles.tsx)
    let nudgeDismissed = false;
    const bankPortfolio = simulatePortfolio(ALL_PROGRAMS, balances, earned, redeemed, USER_CARDS, 'bank_points');
    const transfersByBank: Record<string, TransferOptionRow[]> = {};
    for (const bp of bankPortfolio) {
      transfersByBank[bp.program_id] = simulateTransferOptions(
        TRANSFER_PARTNERS, ALL_PROGRAMS, bp.program_id, bp.display_total,
      );
    }

    const nudge = simulateNudgeSuggestion(bankPortfolio, transfersByBank);
    expect(nudge).not.toBeNull();

    // User dismisses
    nudgeDismissed = true;

    // Nudge still computed but flagged as dismissed — UI wouldn't show it
    const shouldShow = nudge && !nudgeDismissed && nudge.potentialMiles > 0;
    expect(shouldShow).toBe(false);
  });
});

// ===========================================================================
// Flow 5: get_miles_portfolio with program_type filter
// ===========================================================================

describe('Flow 5: get_miles_portfolio program_type filter', () => {
  const balances: MilesBalance[] = [
    { user_id: MOCK_USER_ID, miles_program_id: DBS_POINTS.id, manual_balance: 50000, updated_at: '2026-02-20T00:00:00Z' },
    { user_id: MOCK_USER_ID, miles_program_id: KRISFLYER.id, manual_balance: 28500, updated_at: '2026-02-20T00:00:00Z' },
  ];
  const earned = new Map<string, number>();
  const redeemed = new Map<string, number>();

  it('filter="airline" → only airline programs', () => {
    const result = simulatePortfolio(ALL_PROGRAMS, balances, earned, redeemed, USER_CARDS, 'airline');
    expect(result.every(r => r.program_type === 'airline')).toBe(true);
  });

  it('filter="bank_points" → only bank programs', () => {
    const result = simulatePortfolio(ALL_PROGRAMS, balances, earned, redeemed, USER_CARDS, 'bank_points');
    expect(result.every(r => r.program_type === 'bank_points')).toBe(true);
  });

  it('no filter → returns all programs user has cards for', () => {
    const result = simulatePortfolio(ALL_PROGRAMS, balances, earned, redeemed, USER_CARDS);
    // User has: KrisFlyer + DBS + Citi + HSBC
    expect(result.length).toBe(4);
    const types = new Set(result.map(r => r.program_type));
    expect(types.has('airline')).toBe(true);
    expect(types.has('bank_points')).toBe(true);
  });
});

// ===========================================================================
// Flow 6: Transfer rate sort order & calculation correctness
// ===========================================================================

describe('Flow 6: Transfer rate calculations', () => {
  it('DBS 50,000 pts → KrisFlyer: floor(50000 * 2000 / 5000) = 20,000 miles', () => {
    const options = simulateTransferOptions(TRANSFER_PARTNERS, ALL_PROGRAMS, DBS_POINTS.id, 50000);
    const kf = options.find(o => o.destination_name === 'KrisFlyer')!;
    expect(kf.resulting_miles).toBe(20000);
    expect(kf.points_per_mile).toBe(2.5);
  });

  it('HSBC 120,000 pts → KrisFlyer: floor(120000 * 10000 / 30000) = 40,000 miles', () => {
    const options = simulateTransferOptions(TRANSFER_PARTNERS, ALL_PROGRAMS, HSBC_REWARDS.id, 120000);
    const kf = options.find(o => o.destination_name === 'KrisFlyer')!;
    expect(kf.resulting_miles).toBe(40000);
    expect(kf.points_per_mile).toBeCloseTo(3.0);
  });

  it('HSBC 120,000 pts → Asia Miles: floor(120000 * 10000 / 25000) = 48,000 miles', () => {
    const options = simulateTransferOptions(TRANSFER_PARTNERS, ALL_PROGRAMS, HSBC_REWARDS.id, 120000);
    const am = options.find(o => o.destination_name === 'Asia Miles')!;
    expect(am.resulting_miles).toBe(48000);
    expect(am.points_per_mile).toBe(2.5);
  });

  it('Citi 1:1 rate: 80,000 Citi Miles → 80,000 KrisFlyer miles', () => {
    const options = simulateTransferOptions(TRANSFER_PARTNERS, ALL_PROGRAMS, CITI_MILES.id, 80000);
    const kf = options.find(o => o.destination_name === 'KrisFlyer')!;
    expect(kf.resulting_miles).toBe(80000);
    expect(kf.points_per_mile).toBe(1);
  });

  it('transfer options sorted by points_per_mile ascending (best rate first)', () => {
    const options = simulateTransferOptions(TRANSFER_PARTNERS, ALL_PROGRAMS, HSBC_REWARDS.id, 120000);

    // HSBC → Asia Miles: 2.5 ppm
    // HSBC → KrisFlyer: 3.0 ppm
    expect(options[0].destination_name).toBe('Asia Miles');
    expect(options[0].points_per_mile).toBe(2.5);
    expect(options[1].destination_name).toBe('KrisFlyer');
    expect(options[1].points_per_mile).toBeCloseTo(3.0);
  });

  it('small balance — rounding uses floor (not round)', () => {
    // DBS: 3 pts → floor(3 * 2000 / 5000) = floor(1.2) = 1
    const options = simulateTransferOptions(TRANSFER_PARTNERS, ALL_PROGRAMS, DBS_POINTS.id, 3);
    const kf = options.find(o => o.destination_name === 'KrisFlyer')!;
    expect(kf.resulting_miles).toBe(1);
  });

  it('1 point — still calculates (floor rounds to 0)', () => {
    const options = simulateTransferOptions(TRANSFER_PARTNERS, ALL_PROGRAMS, DBS_POINTS.id, 1);
    const kf = options.find(o => o.destination_name === 'KrisFlyer')!;
    // floor(1 * 2000 / 5000) = floor(0.4) = 0
    expect(kf.resulting_miles).toBe(0);
  });
});

// ===========================================================================
// Flow 7: Potential miles breakdown correctness
// ===========================================================================

describe('Flow 7: Potential miles breakdown', () => {
  it('KrisFlyer potential from 3 banks: DBS 20k + Citi 80k + HSBC 40k = 140k', () => {
    const balances: MilesBalance[] = [
      { user_id: MOCK_USER_ID, miles_program_id: DBS_POINTS.id, manual_balance: 50000, updated_at: '2026-02-20T00:00:00Z' },
      { user_id: MOCK_USER_ID, miles_program_id: CITI_MILES.id, manual_balance: 80000, updated_at: '2026-02-20T00:00:00Z' },
      { user_id: MOCK_USER_ID, miles_program_id: HSBC_REWARDS.id, manual_balance: 120000, updated_at: '2026-02-20T00:00:00Z' },
    ];

    const potential = simulatePotentialMiles(
      TRANSFER_PARTNERS, ALL_PROGRAMS, balances, USER_CARDS, KRISFLYER.id,
    );

    expect(potential).toHaveLength(3);
    expect(potential[0].total_potential).toBe(140000);

    const dbsRow = potential.find(r => r.source_program_name === 'DBS Points')!;
    expect(dbsRow.potential_miles).toBe(20000);
    expect(dbsRow.conversion_rate_from).toBe(5000);
    expect(dbsRow.conversion_rate_to).toBe(2000);

    const citiRow = potential.find(r => r.source_program_name === 'Citi Miles')!;
    expect(citiRow.potential_miles).toBe(80000);

    const hsbcRow = potential.find(r => r.source_program_name === 'HSBC Reward Points')!;
    expect(hsbcRow.potential_miles).toBe(40000);
  });

  it('Asia Miles potential: DBS 20k + Citi 80k + HSBC 48k = 148k', () => {
    const balances: MilesBalance[] = [
      { user_id: MOCK_USER_ID, miles_program_id: DBS_POINTS.id, manual_balance: 50000, updated_at: '2026-02-20T00:00:00Z' },
      { user_id: MOCK_USER_ID, miles_program_id: CITI_MILES.id, manual_balance: 80000, updated_at: '2026-02-20T00:00:00Z' },
      { user_id: MOCK_USER_ID, miles_program_id: HSBC_REWARDS.id, manual_balance: 120000, updated_at: '2026-02-20T00:00:00Z' },
    ];

    const potential = simulatePotentialMiles(
      TRANSFER_PARTNERS, ALL_PROGRAMS, balances, USER_CARDS, ASIA_MILES.id,
    );

    expect(potential).toHaveLength(3);
    expect(potential[0].total_potential).toBe(148000);
  });

  it('BA Avios potential: only Citi (80k, 1:1) = 80k', () => {
    const balances: MilesBalance[] = [
      { user_id: MOCK_USER_ID, miles_program_id: DBS_POINTS.id, manual_balance: 50000, updated_at: '2026-02-20T00:00:00Z' },
      { user_id: MOCK_USER_ID, miles_program_id: CITI_MILES.id, manual_balance: 80000, updated_at: '2026-02-20T00:00:00Z' },
    ];

    const potential = simulatePotentialMiles(
      TRANSFER_PARTNERS, ALL_PROGRAMS, balances, USER_CARDS, BA_AVIOS.id,
    );

    // Only Citi → BA Avios exists in our test transfer partners
    expect(potential).toHaveLength(1);
    expect(potential[0].source_program_name).toBe('Citi Miles');
    expect(potential[0].potential_miles).toBe(80000);
    expect(potential[0].total_potential).toBe(80000);
  });
});

// ===========================================================================
// Flow 8: Sprint 7–8 Regression with Expanded Data (AC5)
// ===========================================================================

describe('Flow 8: Sprint 7–8 regression with expanded data (AC5)', () => {
  it('display_total formula still holds: manual + auto_earned - total_redeemed', () => {
    const testCases = [
      { manual: 28500, autoEarned: 2450, redeemed: 0, expected: 30950 },
      { manual: 0, autoEarned: 5000, redeemed: 0, expected: 5000 },
      { manual: 10000, autoEarned: 0, redeemed: 3000, expected: 7000 },
      { manual: 28500, autoEarned: 2450, redeemed: 42000, expected: -11050 },
    ];

    for (const tc of testCases) {
      const balances: MilesBalance[] = tc.manual > 0
        ? [{ user_id: MOCK_USER_ID, miles_program_id: KRISFLYER.id, manual_balance: tc.manual, updated_at: '2026-02-20T00:00:00Z' }]
        : [];
      const earned = tc.autoEarned > 0 ? new Map([[KRISFLYER.id, tc.autoEarned]]) : new Map<string, number>();
      const redeemed = tc.redeemed > 0 ? new Map([[KRISFLYER.id, tc.redeemed]]) : new Map<string, number>();

      const portfolio = simulatePortfolio(ALL_PROGRAMS, balances, earned, redeemed, USER_CARDS, 'airline');
      expect(portfolio[0].display_total).toBe(tc.expected);
    }
  });

  it('bank programs do NOT include auto_earned (bank points are manually entered)', () => {
    const balances: MilesBalance[] = [
      { user_id: MOCK_USER_ID, miles_program_id: DBS_POINTS.id, manual_balance: 50000, updated_at: '2026-02-20T00:00:00Z' },
    ];
    // Even if we pass auto_earned, it's not supposed to come from transaction logging for bank programs
    const earned = new Map<string, number>();
    const redeemed = new Map<string, number>();

    const bankPortfolio = simulatePortfolio(ALL_PROGRAMS, balances, earned, redeemed, USER_CARDS, 'bank_points');
    const dbs = bankPortfolio.find(p => p.program_name === 'DBS Points')!;
    expect(dbs.auto_earned).toBe(0);
    expect(dbs.display_total).toBe(50000);
  });

  it('co-brand airline cards map directly — Amex KrisFlyer → KrisFlyer, NOT Amex MR', () => {
    // Verify that the Amex KrisFlyer card shows up under KrisFlyer (airline) not a bank program
    const airlinePortfolio = simulatePortfolio(ALL_PROGRAMS, [], new Map(), new Map(), USER_CARDS, 'airline');
    const bankPortfolio = simulatePortfolio(ALL_PROGRAMS, [], new Map(), new Map(), USER_CARDS, 'bank_points');

    const kfCards = airlinePortfolio.find(p => p.program_name === 'KrisFlyer')!.contributing_cards;
    expect(kfCards.some(c => c.name === 'Amex KrisFlyer Ascend')).toBe(true);

    // Amex KrisFlyer should NOT appear under any bank program
    for (const bp of bankPortfolio) {
      expect(bp.contributing_cards.some(c => c.name === 'Amex KrisFlyer Ascend')).toBe(false);
    }
  });

  it('empty state: user with no cards → both layers empty', () => {
    const noCards: UserCardMapping[] = [];
    const airlinePortfolio = simulatePortfolio(ALL_PROGRAMS, [], new Map(), new Map(), noCards, 'airline');
    const bankPortfolio = simulatePortfolio(ALL_PROGRAMS, [], new Map(), new Map(), noCards, 'bank_points');

    expect(airlinePortfolio).toHaveLength(0);
    expect(bankPortfolio).toHaveLength(0);
  });
});

// ===========================================================================
// Supabase RPC Mock Integration — Sprint 10 RPCs
// ===========================================================================

describe('Sprint 10 Supabase RPC Mock Integration', () => {
  let mock: MockSupabaseClient;

  beforeEach(() => {
    mock = createMockSupabase();
    mock.mockAuth.setUser(mockUser);
    mock.mockAuth.setSession(mockSession);
  });

  it('get_miles_portfolio with program_type filter returns correct shape', async () => {
    const airlineData: PortfolioRow[] = [
      {
        program_id: KRISFLYER.id,
        program_name: 'KrisFlyer',
        airline: 'Singapore Airlines',
        program_type: 'airline',
        icon_url: 'airplane-outline',
        manual_balance: 28500,
        auto_earned: 2450,
        total_redeemed: 0,
        display_total: 30950,
        last_updated: '2026-02-20T00:00:00Z',
        contributing_cards: [{ card_id: 'card-amex-kf', name: 'Amex KrisFlyer Ascend', bank: 'Amex' }],
      },
    ];
    mock.mockRpc.setData('get_miles_portfolio', airlineData);

    const { data, error } = await mock.supabase.rpc('get_miles_portfolio', {
      p_user_id: MOCK_USER_ID,
      p_program_type: 'airline',
    });

    expect(error).toBeNull();
    const rows = data as PortfolioRow[];
    expect(rows).toHaveLength(1);
    expect(rows[0].program_type).toBe('airline');
    expect(rows[0].display_total).toBe(30950);
  });

  it('get_transfer_options returns sorted transfer destinations', async () => {
    const transferData = [
      { transfer_id: 'tp-1', destination_id: ASIA_MILES.id, destination_name: 'Asia Miles', destination_airline: 'Cathay Pacific', destination_icon: 'airplane-outline', conversion_rate_from: 25000, conversion_rate_to: 10000, points_per_mile: 2.5, transfer_fee_sgd: null, min_transfer_amount: 25000, last_verified_at: '2026-02-20' },
      { transfer_id: 'tp-2', destination_id: KRISFLYER.id, destination_name: 'KrisFlyer', destination_airline: 'Singapore Airlines', destination_icon: 'airplane-outline', conversion_rate_from: 30000, conversion_rate_to: 10000, points_per_mile: 3.0, transfer_fee_sgd: null, min_transfer_amount: 30000, last_verified_at: '2026-02-20' },
    ];
    mock.mockRpc.setData('get_transfer_options', transferData);

    const { data, error } = await mock.supabase.rpc('get_transfer_options', {
      p_program_id: HSBC_REWARDS.id,
    });

    expect(error).toBeNull();
    expect(data).toHaveLength(2);
    expect((data as typeof transferData)[0].points_per_mile).toBe(2.5);
    expect((data as typeof transferData)[1].points_per_mile).toBe(3.0);
  });

  it('get_potential_miles returns per-source breakdown', async () => {
    const potentialData: PotentialMilesRow[] = [
      { source_program_id: DBS_POINTS.id, source_program_name: 'DBS Points', source_balance: 50000, conversion_rate_from: 5000, conversion_rate_to: 2000, transfer_fee_sgd: null, potential_miles: 20000, total_potential: 140000 },
      { source_program_id: CITI_MILES.id, source_program_name: 'Citi Miles', source_balance: 80000, conversion_rate_from: 10000, conversion_rate_to: 10000, transfer_fee_sgd: null, potential_miles: 80000, total_potential: 140000 },
      { source_program_id: HSBC_REWARDS.id, source_program_name: 'HSBC Reward Points', source_balance: 120000, conversion_rate_from: 30000, conversion_rate_to: 10000, transfer_fee_sgd: null, potential_miles: 40000, total_potential: 140000 },
    ];
    mock.mockRpc.setData('get_potential_miles', potentialData);

    const { data, error } = await mock.supabase.rpc('get_potential_miles', {
      p_user_id: MOCK_USER_ID,
      p_destination_program_id: KRISFLYER.id,
    });

    expect(error).toBeNull();
    const rows = data as PotentialMilesRow[];
    expect(rows).toHaveLength(3);
    expect(rows[0].total_potential).toBe(140000);
    expect(rows.reduce((sum, r) => sum + r.potential_miles, 0)).toBe(140000);
  });

  it('unregistered Sprint 10 RPC returns error', async () => {
    const { data, error } = await mock.supabase.rpc('get_transfer_options', {
      p_program_id: 'unknown-program',
    });

    expect(error).not.toBeNull();
    expect(error!.message).toContain('No mock registered');
    expect(data).toBeNull();
  });
});
