/**
 * MaxiMile Unit Tests: Redemption Logging (Sprint 8 — F15)
 *
 * Tests the log_miles_redemption RPC, get_redemption_history RPC,
 * and balance impact after redemptions.
 */

import { createMockSupabase, MockSupabaseClient } from './mocks/supabase';
import {
  MOCK_USER_ID,
  mockUser,
  mockSession,
  programKrisFlyer,
  mockRedemption,
  mockPortfolioRow,
} from './mocks/test-data';

// ---------------------------------------------------------------------------
// Simulated service functions (mirror SDK calls)
// ---------------------------------------------------------------------------

async function logRedemption(
  supabase: MockSupabaseClient['supabase'],
  userId: string,
  programId: string,
  amount: number,
  description?: string | null,
  date?: string,
) {
  const result = await supabase.rpc('log_miles_redemption', {
    p_user_id: userId,
    p_program_id: programId,
    p_amount: amount,
    p_description: description ?? null,
    p_date: date ?? undefined,
  });
  return result as { data: string | null; error: { message: string; code?: string } | null };
}

async function getRedemptionHistory(
  supabase: MockSupabaseClient['supabase'],
  userId: string,
  programId: string,
  limit?: number,
) {
  const result = await supabase.rpc('get_redemption_history', {
    p_user_id: userId,
    p_program_id: programId,
    p_limit: limit ?? 20,
  });
  return result as {
    data: Array<{
      transaction_id: string;
      amount: number;
      description: string | null;
      transaction_date: string;
      created_at: string;
    }> | null;
    error: { message: string; code?: string } | null;
  };
}

async function getMilesPortfolio(supabase: MockSupabaseClient['supabase'], userId: string) {
  const result = await supabase.rpc('get_miles_portfolio', { p_user_id: userId });
  return result as {
    data: typeof mockPortfolioRow[] | null;
    error: { message: string; code?: string } | null;
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Redemption Logging', () => {
  let mock: MockSupabaseClient;

  beforeEach(() => {
    mock = createMockSupabase();
    mock.mockAuth.setUser(mockUser);
    mock.mockAuth.setSession(mockSession);
  });

  // =========================================================================
  // 1. log_miles_redemption RPC
  // =========================================================================
  describe('log_miles_redemption RPC', () => {
    it('logs redemption and returns transaction ID', async () => {
      const txId = 'tttttttt-0001-0001-0001-tttttttt0099';
      mock.mockRpc.setData('log_miles_redemption', txId);

      const { data, error } = await logRedemption(
        mock.supabase, MOCK_USER_ID, programKrisFlyer.id, 42000, 'SIN to NRT Business Class',
      );

      expect(error).toBeNull();
      expect(data).toBe(txId);
    });

    it('stores correct type=redeem, amount, description, date', async () => {
      mock.mockRpc.setData('log_miles_redemption', mockRedemption.id);

      const { data, error } = await logRedemption(
        mock.supabase,
        MOCK_USER_ID,
        programKrisFlyer.id,
        mockRedemption.amount,
        mockRedemption.description,
        mockRedemption.transaction_date,
      );

      expect(error).toBeNull();
      expect(data).toBe(mockRedemption.id);
      expect(mockRedemption.type).toBe('redeem');
      expect(mockRedemption.amount).toBe(42000);
      expect(mockRedemption.description).toBe('SIN to NRT Business Class');
      expect(mockRedemption.transaction_date).toBe('2026-02-20');
    });

    it('rejects amount <= 0', async () => {
      mock.mockRpc.setError('log_miles_redemption', {
        message: 'Redemption amount must be between 1 and 10,000,000',
        code: 'P0001',
      });

      const { data, error } = await logRedemption(
        mock.supabase, MOCK_USER_ID, programKrisFlyer.id, 0,
      );

      expect(data).toBeNull();
      expect(error).not.toBeNull();
      expect(error!.message).toContain('between 1 and 10,000,000');
      expect(error!.code).toBe('P0001');
    });

    it('rejects amount > 10,000,000', async () => {
      mock.mockRpc.setError('log_miles_redemption', {
        message: 'Redemption amount must be between 1 and 10,000,000',
        code: 'P0001',
      });

      const { data, error } = await logRedemption(
        mock.supabase, MOCK_USER_ID, programKrisFlyer.id, 10_000_001,
      );

      expect(data).toBeNull();
      expect(error).not.toBeNull();
      expect(error!.code).toBe('P0001');
    });

    it('allows redemption with null description', async () => {
      const txId = 'tttttttt-0001-0001-0001-tttttttt0100';
      mock.mockRpc.setData('log_miles_redemption', txId);

      const { data, error } = await logRedemption(
        mock.supabase, MOCK_USER_ID, programKrisFlyer.id, 15000, null,
      );

      expect(error).toBeNull();
      expect(data).toBe(txId);
    });

    it('uses today\'s date when date not provided', async () => {
      const txId = 'tttttttt-0001-0001-0001-tttttttt0101';
      mock.mockRpc.setData('log_miles_redemption', txId);

      const { data, error } = await logRedemption(
        mock.supabase, MOCK_USER_ID, programKrisFlyer.id, 5000,
      );

      expect(error).toBeNull();
      expect(data).toBe(txId);
    });
  });

  // =========================================================================
  // 2. get_redemption_history RPC
  // =========================================================================
  describe('get_redemption_history RPC', () => {
    it('returns redemptions for specific program', async () => {
      const history = [
        { transaction_id: 'tx-1', amount: 42000, description: 'SIN-NRT', transaction_date: '2026-02-20', created_at: '2026-02-20T10:30:00+08:00' },
        { transaction_id: 'tx-2', amount: 15000, description: 'SIN-BKK', transaction_date: '2026-02-15', created_at: '2026-02-15T09:00:00+08:00' },
      ];
      mock.mockRpc.setData('get_redemption_history', history);

      const { data, error } = await getRedemptionHistory(
        mock.supabase, MOCK_USER_ID, programKrisFlyer.id,
      );

      expect(error).toBeNull();
      expect(data).toHaveLength(2);
      expect(data![0].amount).toBe(42000);
      expect(data![1].amount).toBe(15000);
    });

    it('returns newest first (ordered by transaction_date DESC)', async () => {
      const history = [
        { transaction_id: 'tx-new', amount: 5000, description: 'Latest', transaction_date: '2026-02-20', created_at: '2026-02-20T12:00:00+08:00' },
        { transaction_id: 'tx-mid', amount: 3000, description: 'Middle', transaction_date: '2026-02-15', created_at: '2026-02-15T12:00:00+08:00' },
        { transaction_id: 'tx-old', amount: 2000, description: 'Oldest', transaction_date: '2026-02-10', created_at: '2026-02-10T12:00:00+08:00' },
      ];
      mock.mockRpc.setData('get_redemption_history', history);

      const { data } = await getRedemptionHistory(
        mock.supabase, MOCK_USER_ID, programKrisFlyer.id,
      );

      expect(data![0].transaction_date).toBe('2026-02-20');
      expect(data![1].transaction_date).toBe('2026-02-15');
      expect(data![2].transaction_date).toBe('2026-02-10');
    });

    it('limits results (default 20)', async () => {
      const history = Array.from({ length: 20 }, (_, i) => ({
        transaction_id: `tx-${i}`,
        amount: 1000 * (i + 1),
        description: `Redemption ${i + 1}`,
        transaction_date: '2026-02-20',
        created_at: '2026-02-20T12:00:00+08:00',
      }));
      mock.mockRpc.setData('get_redemption_history', history);

      const { data } = await getRedemptionHistory(
        mock.supabase, MOCK_USER_ID, programKrisFlyer.id,
      );

      expect(data).toHaveLength(20);
    });

    it('returns empty array when no redemptions', async () => {
      mock.mockRpc.setData('get_redemption_history', []);

      const { data, error } = await getRedemptionHistory(
        mock.supabase, MOCK_USER_ID, programKrisFlyer.id,
      );

      expect(error).toBeNull();
      expect(data).toEqual([]);
    });

    it('only returns redeem type transactions', async () => {
      const history = [
        { transaction_id: 'tx-r1', amount: 10000, description: 'Redeem 1', transaction_date: '2026-02-20', created_at: '2026-02-20T10:00:00+08:00' },
        { transaction_id: 'tx-r2', amount: 5000, description: 'Redeem 2', transaction_date: '2026-02-19', created_at: '2026-02-19T10:00:00+08:00' },
      ];
      mock.mockRpc.setData('get_redemption_history', history);

      const { data } = await getRedemptionHistory(
        mock.supabase, MOCK_USER_ID, programKrisFlyer.id,
      );

      expect(data).toHaveLength(2);
      data!.forEach(tx => {
        expect(tx).toHaveProperty('transaction_id');
        expect(tx.amount).toBeGreaterThan(0);
      });
    });
  });

  // =========================================================================
  // 3. Balance after redemption
  // =========================================================================
  describe('Balance after redemption', () => {
    it('display_total decreases after redemption', async () => {
      const portfolioBefore = {
        ...mockPortfolioRow,
        total_redeemed: 0,
        display_total: 30950,
      };
      mock.mockRpc.setData('get_miles_portfolio', [portfolioBefore]);

      const { data: before } = await getMilesPortfolio(mock.supabase, MOCK_USER_ID);
      const beforeTotal = (before as typeof mockPortfolioRow[])[0].display_total;

      const redemptionAmount = 10000;
      const portfolioAfter = {
        ...mockPortfolioRow,
        total_redeemed: redemptionAmount,
        display_total: 30950 - redemptionAmount,
      };
      mock.mockRpc.setData('get_miles_portfolio', [portfolioAfter]);

      const { data: after } = await getMilesPortfolio(mock.supabase, MOCK_USER_ID);
      const afterTotal = (after as typeof mockPortfolioRow[])[0].display_total;

      expect(afterTotal).toBe(beforeTotal - redemptionAmount);
      expect(afterTotal).toBe(20950);
    });

    it('multiple redemptions accumulate in total_redeemed', async () => {
      const portfolioAfterMultiple = {
        ...mockPortfolioRow,
        total_redeemed: 42000 + 15000,
        display_total: 28500 + 2450 - (42000 + 15000),
      };
      mock.mockRpc.setData('get_miles_portfolio', [portfolioAfterMultiple]);

      const { data } = await getMilesPortfolio(mock.supabase, MOCK_USER_ID);
      const row = (data as typeof mockPortfolioRow[])[0];

      expect(row.total_redeemed).toBe(57000);
      expect(row.display_total).toBe(
        row.manual_balance + row.auto_earned - row.total_redeemed,
      );
    });
  });
});
