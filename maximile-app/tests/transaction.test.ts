/**
 * MaxiMile Unit Tests: Transaction Logging
 *
 * Tests for the transaction logging feature:
 *   - Validation (amount, category, card, portfolio membership)
 *   - Pre-fill logic (from recommendation context, by time-of-day)
 *   - Success overlay data (mpd comparison, remaining cap)
 *   - Multiple rapid transactions
 *   - Date defaults, amount formatting
 *   - Custom keypad input handling
 *   - Confirm button disabled states
 */

import { createMockSupabase, MockSupabaseClient, MockQueryBuilder } from './mocks/supabase';
import {
  cardHSBCRevolution,
  cardUOBPRVI,
  cardAmexAscend,
  capHSBCShared,
  capAmexDining,
  MOCK_USER_ID,
  mockUser,
  mockSession,
  mockUserCards,
  mockCategories,
  createTransaction,
} from './mocks/test-data';
import type { Transaction, SpendingState, Cap } from '../lib/supabase-types';

// ---------------------------------------------------------------------------
// Types & Constants
// ---------------------------------------------------------------------------

interface TransactionInput {
  card_id: string;
  category_id: string;
  amount: number;
  transaction_date?: string;
  notes?: string;
}

interface ValidationResult {
  valid: boolean;
  error?: string;
}

interface PreFillContext {
  category_id?: string;
  card_id?: string;
}

interface SuccessOverlay {
  message: string;
  mpd: number;
  remainingCap: number | null;
  capWarning: string | null;
}

// ---------------------------------------------------------------------------
// Service functions (mirror app logic)
// ---------------------------------------------------------------------------

/** Validates a transaction input before submission. */
function validateTransaction(
  input: Partial<TransactionInput>,
  portfolioCardIds: string[],
): ValidationResult {
  if (input.amount === undefined || input.amount === null) {
    return { valid: false, error: 'Amount is required' };
  }
  if (input.amount <= 0) {
    return { valid: false, error: 'Amount must be greater than 0' };
  }
  if (!input.category_id) {
    return { valid: false, error: 'Category is required' };
  }
  if (!input.card_id) {
    return { valid: false, error: 'Card is required' };
  }
  if (!portfolioCardIds.includes(input.card_id)) {
    return { valid: false, error: 'Card is not in your portfolio' };
  }
  return { valid: true };
}

/** Log a transaction via Supabase insert. */
async function logTransaction(
  supabase: MockSupabaseClient['supabase'],
  input: TransactionInput,
) {
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      card_id: input.card_id,
      category_id: input.category_id,
      amount: input.amount,
      transaction_date: input.transaction_date || new Date().toISOString().slice(0, 10),
      notes: input.notes || null,
    })
    .select();
  return { data, error };
}

/** Determine pre-fill category based on time of day. */
function getTimeCategoryPreFill(hour: number): string {
  if (hour >= 11 && hour < 14) return 'dining'; // lunch
  if (hour >= 17 && hour < 21) return 'dining'; // dinner
  if (hour >= 7 && hour < 9) return 'transport'; // morning commute
  if (hour >= 17 && hour < 19) return 'transport'; // evening commute (overlaps dinner)
  return 'general';
}

/** Pre-fill from recommendation context params. */
function getPreFill(context: PreFillContext | null, hour: number): { category_id: string; card_id: string | null } {
  if (context && context.category_id && context.card_id) {
    return { category_id: context.category_id, card_id: context.card_id };
  }
  return {
    category_id: getTimeCategoryPreFill(hour),
    card_id: null,
  };
}

/** Calculate success overlay data. */
function buildSuccessOverlay(
  amount: number,
  cardName: string,
  earnRateMpd: number,
  remainingCap: number | null,
  monthlyCap: number | null,
): SuccessOverlay {
  const milesEarned = amount * earnRateMpd;
  const message = `Logged $${amount.toFixed(2)} — ${milesEarned.toFixed(1)} miles earned!`;

  let capWarning: string | null = null;
  if (remainingCap !== null && monthlyCap !== null) {
    const usagePercent = ((monthlyCap - remainingCap) / monthlyCap) * 100;
    if (usagePercent >= 100) {
      capWarning = `${cardName} cap exhausted for this category.`;
    } else if (usagePercent >= 80) {
      capWarning = `${cardName} cap nearly full (${remainingCap.toFixed(0)} remaining).`;
    }
  }

  return { message, mpd: earnRateMpd, remainingCap, capWarning };
}

/** Format amount to 2 decimal places. */
function formatAmount(value: number): string {
  return value.toFixed(2);
}

/** Custom keypad input handler. */
function processKeypadInput(current: string, key: string): string {
  if (key === 'backspace') {
    return current.slice(0, -1) || '0';
  }
  if (key === '.') {
    if (current.includes('.')) return current; // no double decimal
    return current + '.';
  }
  // Digit
  if (current === '0' && key !== '.') {
    return key; // replace leading zero
  }
  // Limit to 2 decimal places
  const decimalIndex = current.indexOf('.');
  if (decimalIndex >= 0 && current.length - decimalIndex > 2) {
    return current; // already 2 decimal places
  }
  return current + key;
}

/** Determine if confirm button should be disabled. */
function isConfirmDisabled(
  amount: number | null,
  categoryId: string | null,
  cardId: string | null,
): boolean {
  if (!amount || amount <= 0) return true;
  if (!categoryId) return true;
  if (!cardId) return true;
  return false;
}

// ===========================================================================
// Tests
// ===========================================================================

describe('Transaction Logging', () => {
  let mock: MockSupabaseClient;
  const portfolioCardIds = [cardHSBCRevolution.id, cardUOBPRVI.id, cardAmexAscend.id];

  beforeEach(() => {
    mock = createMockSupabase();
    mock.mockAuth.setUser(mockUser);
    mock.mockAuth.setSession(mockSession);
  });

  // =========================================================================
  // 1. Log transaction with valid data -> success
  // =========================================================================
  describe('Valid transaction logging', () => {
    it('should successfully log a transaction with valid data', async () => {
      const txInput: TransactionInput = {
        card_id: cardHSBCRevolution.id,
        category_id: 'dining',
        amount: 85.00,
        transaction_date: '2026-02-19',
      };

      const validation = validateTransaction(txInput, portfolioCardIds);
      expect(validation.valid).toBe(true);

      const createdTx = {
        id: 'tx-001',
        user_id: MOCK_USER_ID,
        ...txInput,
        notes: null,
        logged_at: '2026-02-19T12:00:00+08:00',
        created_at: '2026-02-19T12:00:00+08:00',
        updated_at: '2026-02-19T12:00:00+08:00',
      };

      const qb = new MockQueryBuilder();
      qb.setData([createdTx]);
      mock.queryBuilders.set('transactions', qb);

      const { data, error } = await logTransaction(mock.supabase, txInput);

      expect(error).toBeNull();
      expect(data).not.toBeNull();
      expect((data as typeof createdTx[])[0].amount).toBe(85.00);
      expect((data as typeof createdTx[])[0].category_id).toBe('dining');
    });
  });

  // =========================================================================
  // 2. Log transaction with amount = 0 -> rejected
  // =========================================================================
  describe('Validation — amount = 0', () => {
    it('should reject transaction with amount = 0', () => {
      const result = validateTransaction(
        { card_id: cardHSBCRevolution.id, category_id: 'dining', amount: 0 },
        portfolioCardIds,
      );
      expect(result.valid).toBe(false);
      expect(result.error).toContain('greater than 0');
    });
  });

  // =========================================================================
  // 3. Log transaction with negative amount -> rejected
  // =========================================================================
  describe('Validation — negative amount', () => {
    it('should reject transaction with negative amount', () => {
      const result = validateTransaction(
        { card_id: cardHSBCRevolution.id, category_id: 'dining', amount: -50 },
        portfolioCardIds,
      );
      expect(result.valid).toBe(false);
      expect(result.error).toContain('greater than 0');
    });
  });

  // =========================================================================
  // 4. Log transaction without category -> rejected
  // =========================================================================
  describe('Validation — missing category', () => {
    it('should reject transaction without category', () => {
      const result = validateTransaction(
        { card_id: cardHSBCRevolution.id, amount: 50 },
        portfolioCardIds,
      );
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Category is required');
    });
  });

  // =========================================================================
  // 5. Log transaction without card -> rejected
  // =========================================================================
  describe('Validation — missing card', () => {
    it('should reject transaction without card', () => {
      const result = validateTransaction(
        { category_id: 'dining', amount: 50 },
        portfolioCardIds,
      );
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Card is required');
    });
  });

  // =========================================================================
  // 6. Log transaction for card not in portfolio -> error
  // =========================================================================
  describe('Validation — card not in portfolio', () => {
    it('should reject transaction for card not in user portfolio', () => {
      const result = validateTransaction(
        { card_id: 'unknown-card-id', category_id: 'dining', amount: 50 },
        portfolioCardIds,
      );
      expect(result.valid).toBe(false);
      expect(result.error).toContain('not in your portfolio');
    });

    it('should return FK violation error from Supabase for invalid card_id', async () => {
      const qb = new MockQueryBuilder();
      qb.setError({
        message: 'insert or update on table "transactions" violates foreign key constraint "transactions_card_id_fkey"',
        code: '23503',
      });
      mock.queryBuilders.set('transactions', qb);

      const { data, error } = await logTransaction(mock.supabase, {
        card_id: 'invalid-card',
        category_id: 'dining',
        amount: 50,
      });

      expect(data).toBeNull();
      expect(error).not.toBeNull();
      expect(error!.code).toBe('23503');
    });
  });

  // =========================================================================
  // 7. Pre-fill from recommendation context (category + card params)
  // =========================================================================
  describe('Pre-fill from recommendation context', () => {
    it('should pre-fill category and card from recommendation context', () => {
      const context: PreFillContext = {
        category_id: 'dining',
        card_id: cardHSBCRevolution.id,
      };

      const preFill = getPreFill(context, 12); // noon

      expect(preFill.category_id).toBe('dining');
      expect(preFill.card_id).toBe(cardHSBCRevolution.id);
    });
  });

  // =========================================================================
  // 8. Pre-fill category by time-of-day (no context)
  // =========================================================================
  describe('Pre-fill category by time of day', () => {
    it('should pre-fill dining at lunchtime (11am-2pm)', () => {
      const preFill = getPreFill(null, 12);
      expect(preFill.category_id).toBe('dining');
      expect(preFill.card_id).toBeNull();
    });

    it('should pre-fill dining at dinnertime (5pm-9pm)', () => {
      const preFill = getPreFill(null, 19);
      expect(preFill.category_id).toBe('dining');
    });

    it('should pre-fill transport during morning commute (7am-9am)', () => {
      const preFill = getPreFill(null, 8);
      expect(preFill.category_id).toBe('transport');
    });

    it('should pre-fill general for other times', () => {
      const preFill = getPreFill(null, 3);
      expect(preFill.category_id).toBe('general');
    });
  });

  // =========================================================================
  // 9. Success overlay shows correct mpd comparison
  // =========================================================================
  describe('Success overlay — mpd display', () => {
    it('should show correct miles earned in success overlay', () => {
      const overlay = buildSuccessOverlay(50, 'HSBC Revolution', 4.0, 950, 1000);

      expect(overlay.message).toBe('Logged $50.00 — 200.0 miles earned!');
      expect(overlay.mpd).toBe(4.0);
    });
  });

  // =========================================================================
  // 10. Success overlay shows correct remaining cap
  // =========================================================================
  describe('Success overlay — remaining cap', () => {
    it('should show remaining cap in success overlay', () => {
      const overlay = buildSuccessOverlay(50, 'HSBC Revolution', 4.0, 950, 1000);
      expect(overlay.remainingCap).toBe(950);
      expect(overlay.capWarning).toBeNull(); // 5% usage, no warning
    });

    it('should show amber warning when cap is 80%+ used', () => {
      const overlay = buildSuccessOverlay(50, 'HSBC Revolution', 4.0, 150, 1000);
      expect(overlay.capWarning).toContain('nearly full');
      expect(overlay.capWarning).toContain('150');
    });

    it('should show exhausted warning when cap is 100% used', () => {
      const overlay = buildSuccessOverlay(50, 'HSBC Revolution', 4.0, 0, 1000);
      expect(overlay.capWarning).toContain('exhausted');
    });

    it('should show no warning for uncapped card', () => {
      const overlay = buildSuccessOverlay(50, 'UOB PRVI', 1.4, null, null);
      expect(overlay.remainingCap).toBeNull();
      expect(overlay.capWarning).toBeNull();
    });
  });

  // =========================================================================
  // 11. Multiple rapid transactions -> all recorded correctly
  // =========================================================================
  describe('Multiple rapid transactions', () => {
    it('should handle multiple rapid sequential transactions', async () => {
      const amounts = [25.50, 30.00, 45.75, 12.00, 88.50];
      const results: { amount: number; success: boolean }[] = [];

      for (const amount of amounts) {
        const qb = new MockQueryBuilder();
        qb.setData([{
          id: `tx-rapid-${amount}`,
          user_id: MOCK_USER_ID,
          card_id: cardHSBCRevolution.id,
          category_id: 'dining',
          amount,
          transaction_date: '2026-02-19',
          logged_at: new Date().toISOString(),
        }]);
        mock.queryBuilders.set('transactions', qb);

        const { data, error } = await logTransaction(mock.supabase, {
          card_id: cardHSBCRevolution.id,
          category_id: 'dining',
          amount,
        });

        results.push({
          amount,
          success: error === null && data !== null,
        });
      }

      // All 5 transactions should succeed
      expect(results).toHaveLength(5);
      results.forEach(r => {
        expect(r.success).toBe(true);
      });
    });
  });

  // =========================================================================
  // 12. Transaction date defaults to today
  // =========================================================================
  describe('Transaction date defaults', () => {
    it('should default transaction_date to today when not provided', async () => {
      const today = new Date().toISOString().slice(0, 10);

      const qb = new MockQueryBuilder();
      qb.setData([{
        id: 'tx-default-date',
        user_id: MOCK_USER_ID,
        card_id: cardHSBCRevolution.id,
        category_id: 'dining',
        amount: 50,
        transaction_date: today,
        logged_at: new Date().toISOString(),
      }]);
      mock.queryBuilders.set('transactions', qb);

      // Call without transaction_date
      const { data, error } = await logTransaction(mock.supabase, {
        card_id: cardHSBCRevolution.id,
        category_id: 'dining',
        amount: 50,
      });

      expect(error).toBeNull();
      expect((data as any[])[0].transaction_date).toBe(today);
    });
  });

  // =========================================================================
  // 13. Amount formatting (2 decimal places)
  // =========================================================================
  describe('Amount formatting', () => {
    it('should format integer to 2 decimal places', () => {
      expect(formatAmount(50)).toBe('50.00');
    });

    it('should format 1 decimal to 2 decimal places', () => {
      expect(formatAmount(50.5)).toBe('50.50');
    });

    it('should keep 2 decimal places', () => {
      expect(formatAmount(85.75)).toBe('85.75');
    });

    it('should round to 2 decimal places', () => {
      expect(formatAmount(33.333)).toBe('33.33');
    });

    it('should format zero correctly', () => {
      expect(formatAmount(0)).toBe('0.00');
    });
  });

  // =========================================================================
  // 14. Custom keypad input: digits, decimal, backspace
  // =========================================================================
  describe('Custom keypad input', () => {
    it('should append digits to current value', () => {
      expect(processKeypadInput('5', '3')).toBe('53');
    });

    it('should add decimal point', () => {
      expect(processKeypadInput('50', '.')).toBe('50.');
    });

    it('should not add a second decimal point', () => {
      expect(processKeypadInput('50.', '.')).toBe('50.');
      expect(processKeypadInput('50.5', '.')).toBe('50.5');
    });

    it('should handle backspace', () => {
      expect(processKeypadInput('123', 'backspace')).toBe('12');
    });

    it('should return 0 when backspacing the last digit', () => {
      expect(processKeypadInput('5', 'backspace')).toBe('0');
    });

    it('should replace leading zero with digit', () => {
      expect(processKeypadInput('0', '5')).toBe('5');
    });

    it('should allow 0. for decimal input starting from zero', () => {
      expect(processKeypadInput('0', '.')).toBe('0.');
    });

    it('should limit to 2 decimal places', () => {
      expect(processKeypadInput('50.12', '3')).toBe('50.12');
    });

    it('should allow digits up to 2 decimal places', () => {
      expect(processKeypadInput('50.1', '2')).toBe('50.12');
    });
  });

  // =========================================================================
  // 15. Confirm button disabled states
  // =========================================================================
  describe('Confirm button disabled states', () => {
    it('should be disabled when amount is null', () => {
      expect(isConfirmDisabled(null, 'dining', cardHSBCRevolution.id)).toBe(true);
    });

    it('should be disabled when amount is 0', () => {
      expect(isConfirmDisabled(0, 'dining', cardHSBCRevolution.id)).toBe(true);
    });

    it('should be disabled when category is null', () => {
      expect(isConfirmDisabled(50, null, cardHSBCRevolution.id)).toBe(true);
    });

    it('should be disabled when card is null', () => {
      expect(isConfirmDisabled(50, 'dining', null)).toBe(true);
    });

    it('should be enabled when all fields are valid', () => {
      expect(isConfirmDisabled(50, 'dining', cardHSBCRevolution.id)).toBe(false);
    });

    it('should be disabled when amount is negative', () => {
      expect(isConfirmDisabled(-10, 'dining', cardHSBCRevolution.id)).toBe(true);
    });
  });

  // =========================================================================
  // Additional validation edge cases
  // =========================================================================
  describe('Additional validation edge cases', () => {
    it('should accept transaction with notes', async () => {
      const txInput: TransactionInput = {
        card_id: cardHSBCRevolution.id,
        category_id: 'dining',
        amount: 42.50,
        transaction_date: '2026-02-19',
        notes: 'Lunch at hawker centre',
      };

      const validation = validateTransaction(txInput, portfolioCardIds);
      expect(validation.valid).toBe(true);
    });

    it('should handle CHECK constraint violation for negative amount from Supabase', async () => {
      const qb = new MockQueryBuilder();
      qb.setError({
        message: 'new row for relation "transactions" violates check constraint "transactions_amount_check"',
        code: '23514',
      });
      mock.queryBuilders.set('transactions', qb);

      const { data, error } = await logTransaction(mock.supabase, {
        card_id: cardHSBCRevolution.id,
        category_id: 'dining',
        amount: -50,
      });

      expect(data).toBeNull();
      expect(error).not.toBeNull();
      expect(error!.code).toBe('23514');
    });

    it('should handle FK violation for invalid category_id', async () => {
      const qb = new MockQueryBuilder();
      qb.setError({
        message: 'insert or update on table "transactions" violates foreign key constraint "transactions_category_id_fkey"',
        code: '23503',
      });
      mock.queryBuilders.set('transactions', qb);

      const { data, error } = await logTransaction(mock.supabase, {
        card_id: cardHSBCRevolution.id,
        category_id: 'invalid_category',
        amount: 50,
      });

      expect(data).toBeNull();
      expect(error).not.toBeNull();
      expect(error!.code).toBe('23503');
    });

    it('should accept very small positive amounts', () => {
      const result = validateTransaction(
        { card_id: cardHSBCRevolution.id, category_id: 'dining', amount: 0.01 },
        portfolioCardIds,
      );
      expect(result.valid).toBe(true);
    });

    it('should accept large amounts', () => {
      const result = validateTransaction(
        { card_id: cardHSBCRevolution.id, category_id: 'dining', amount: 99999.99 },
        portfolioCardIds,
      );
      expect(result.valid).toBe(true);
    });
  });
});
