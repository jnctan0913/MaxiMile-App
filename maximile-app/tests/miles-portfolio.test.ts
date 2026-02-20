/**
 * MaxiMile Unit Tests: Miles Portfolio Operations (Sprint 7 + 8)
 *
 * Tests the get_miles_portfolio RPC, upsert_miles_balance RPC, and
 * miles_programs table queries. Follows the exact mock pattern from
 * portfolio.test.ts and recommendation.test.ts.
 */

import { createMockSupabase, MockSupabaseClient, MockQueryBuilder } from './mocks/supabase';
import {
  MOCK_USER_ID,
  mockUser,
  mockSession,
  programKrisFlyer,
  programCitiMiles,
  programUNI,
  mockPortfolioRow,
  mockMilesBalance,
  cardHSBCRevolution,
} from './mocks/test-data';

// ---------------------------------------------------------------------------
// Simulated service functions (mirror SDK calls)
// ---------------------------------------------------------------------------

async function getMilesPortfolio(supabase: MockSupabaseClient['supabase'], userId: string) {
  const result = await supabase.rpc('get_miles_portfolio', { p_user_id: userId });
  return result as {
    data: typeof mockPortfolioRow[] | null;
    error: { message: string; code?: string } | null;
  };
}

async function upsertMilesBalance(
  supabase: MockSupabaseClient['supabase'],
  userId: string,
  programId: string,
  amount: number,
) {
  const result = await supabase.rpc('upsert_miles_balance', {
    p_user_id: userId,
    p_program_id: programId,
    p_amount: amount,
  });
  return result as { data: null; error: { message: string; code?: string } | null };
}

async function listMilesPrograms(supabase: MockSupabaseClient['supabase']) {
  const { data, error } = await supabase
    .from('miles_programs')
    .select('*');
  return { data, error };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Miles Portfolio Operations', () => {
  let mock: MockSupabaseClient;

  beforeEach(() => {
    mock = createMockSupabase();
    mock.mockAuth.setUser(mockUser);
    mock.mockAuth.setSession(mockSession);
  });

  // =========================================================================
  // 1. get_miles_portfolio RPC
  // =========================================================================
  describe('get_miles_portfolio RPC', () => {
    it('returns programs with balances for authenticated user', async () => {
      mock.mockRpc.setData('get_miles_portfolio', [mockPortfolioRow]);

      const { data, error } = await getMilesPortfolio(mock.supabase, MOCK_USER_ID);

      expect(error).toBeNull();
      expect(data).not.toBeNull();
      expect(data).toHaveLength(1);

      const row = (data as typeof mockPortfolioRow[])[0];
      expect(row.program_id).toBe(programKrisFlyer.id);
      expect(row.program_name).toBe('KrisFlyer');
      expect(row.manual_balance).toBe(28500);
      expect(row.auto_earned).toBe(2450);
    });

    it('returns empty array when user has no cards', async () => {
      mock.mockRpc.setData('get_miles_portfolio', []);

      const { data, error } = await getMilesPortfolio(mock.supabase, MOCK_USER_ID);

      expect(error).toBeNull();
      expect(data).toEqual([]);
    });

    it('includes contributing_cards for each program', async () => {
      mock.mockRpc.setData('get_miles_portfolio', [mockPortfolioRow]);

      const { data } = await getMilesPortfolio(mock.supabase, MOCK_USER_ID);
      const row = (data as typeof mockPortfolioRow[])[0];

      expect(row.contributing_cards).toHaveLength(1);
      expect(row.contributing_cards[0].card_id).toBe(cardHSBCRevolution.id);
      expect(row.contributing_cards[0].bank).toBe('HSBC');
    });

    it('display_total = manual_balance + auto_earned - total_redeemed', async () => {
      const rowWithRedemption = {
        ...mockPortfolioRow,
        manual_balance: 28500,
        auto_earned: 2450,
        total_redeemed: 5000,
        display_total: 28500 + 2450 - 5000,
      };
      mock.mockRpc.setData('get_miles_portfolio', [rowWithRedemption]);

      const { data } = await getMilesPortfolio(mock.supabase, MOCK_USER_ID);
      const row = (data as typeof mockPortfolioRow[])[0];

      expect(row.display_total).toBe(25950);
      expect(row.display_total).toBe(
        row.manual_balance + row.auto_earned - row.total_redeemed,
      );
    });

    it('returns total_redeemed field (Sprint 8)', async () => {
      mock.mockRpc.setData('get_miles_portfolio', [mockPortfolioRow]);

      const { data } = await getMilesPortfolio(mock.supabase, MOCK_USER_ID);
      const row = (data as typeof mockPortfolioRow[])[0];

      expect(row).toHaveProperty('total_redeemed');
      expect(typeof row.total_redeemed).toBe('number');
    });

    it('handles auth error (401)', async () => {
      mock.mockRpc.setError('get_miles_portfolio', {
        message: 'JWT expired',
        code: 'PGRST301',
      });

      const { data, error } = await getMilesPortfolio(mock.supabase, MOCK_USER_ID);

      expect(data).toBeNull();
      expect(error).not.toBeNull();
      expect(error!.code).toBe('PGRST301');
    });
  });

  // =========================================================================
  // 2. upsert_miles_balance RPC
  // =========================================================================
  describe('upsert_miles_balance RPC', () => {
    it('creates new balance for a program', async () => {
      mock.mockRpc.setData('upsert_miles_balance', null);

      const { error } = await upsertMilesBalance(
        mock.supabase, MOCK_USER_ID, programKrisFlyer.id, 28500,
      );

      expect(error).toBeNull();
    });

    it('updates existing balance', async () => {
      mock.mockRpc.setData('upsert_miles_balance', null);

      const { error } = await upsertMilesBalance(
        mock.supabase, MOCK_USER_ID, programKrisFlyer.id, 35000,
      );

      expect(error).toBeNull();
    });

    it('rejects negative balance', async () => {
      mock.mockRpc.setError('upsert_miles_balance', {
        message: 'Balance must be between 0 and 10,000,000',
        code: 'P0001',
      });

      const { data, error } = await upsertMilesBalance(
        mock.supabase, MOCK_USER_ID, programKrisFlyer.id, -100,
      );

      expect(data).toBeNull();
      expect(error).not.toBeNull();
      expect(error!.message).toContain('between 0 and 10,000,000');
      expect(error!.code).toBe('P0001');
    });

    it('rejects balance > 10,000,000', async () => {
      mock.mockRpc.setError('upsert_miles_balance', {
        message: 'Balance must be between 0 and 10,000,000',
        code: 'P0001',
      });

      const { data, error } = await upsertMilesBalance(
        mock.supabase, MOCK_USER_ID, programKrisFlyer.id, 10_000_001,
      );

      expect(data).toBeNull();
      expect(error).not.toBeNull();
      expect(error!.code).toBe('P0001');
    });

    it('no-ops when balance unchanged', async () => {
      mock.mockRpc.setData('upsert_miles_balance', null);

      const { error } = await upsertMilesBalance(
        mock.supabase, MOCK_USER_ID, programKrisFlyer.id, mockMilesBalance.manual_balance,
      );

      expect(error).toBeNull();
    });
  });

  // =========================================================================
  // 3. miles_programs table
  // =========================================================================
  describe('miles_programs table', () => {
    it('returns all 7 seeded programs', async () => {
      const seededPrograms = [
        { id: programKrisFlyer.id, name: 'KrisFlyer', airline: 'Singapore Airlines', program_type: 'airline' },
        { id: programCitiMiles.id, name: 'Citi Miles', airline: null, program_type: 'bank_points' },
        { id: programUNI.id, name: 'UNI$', airline: null, program_type: 'bank_points' },
        { id: 'ocbc-id', name: 'OCBC$', airline: null, program_type: 'bank_points' },
        { id: '360-id', name: '360 Rewards', airline: null, program_type: 'bank_points' },
        { id: 'treats-id', name: 'TreatsPoints', airline: null, program_type: 'bank_points' },
        { id: 'dbs-id', name: 'DBS Points', airline: null, program_type: 'bank_points' },
      ];

      const qb = new MockQueryBuilder();
      qb.setData(seededPrograms);
      mock.queryBuilders.set('miles_programs', qb);

      const { data, error } = await listMilesPrograms(mock.supabase);

      expect(error).toBeNull();
      expect(data).toHaveLength(7);

      const names = (data as typeof seededPrograms).map(p => p.name);
      expect(names).toContain('KrisFlyer');
      expect(names).toContain('Citi Miles');
      expect(names).toContain('UNI$');
      expect(names).toContain('DBS Points');
    });

    it('programs are publicly readable (no auth required)', async () => {
      const qb = new MockQueryBuilder();
      qb.setData([programKrisFlyer]);
      mock.queryBuilders.set('miles_programs', qb);

      mock.mockAuth.setUser(null);
      mock.mockAuth.setSession(null);

      const { data, error } = await listMilesPrograms(mock.supabase);

      expect(error).toBeNull();
      expect(data).not.toBeNull();
      expect((data as typeof programKrisFlyer[])[0].name).toBe('KrisFlyer');
    });
  });
});
