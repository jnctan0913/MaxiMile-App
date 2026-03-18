// =============================================================================
// MaxiMile — Transaction mutation helpers (F43 — Transaction Entry Correction)
// =============================================================================
// All writes go through Supabase RLS — only the owning user can UPDATE/DELETE
// their own rows (user_id = auth.uid()).
// After any mutation the affected spending_state record is re-derived from
// the transactions table so cap totals stay accurate.
// =============================================================================

import { supabase } from './supabase';

export interface TransactionUpdate {
  card_id: string;
  category_id: string;
  amount: number;
  transaction_date: string; // YYYY-MM-DD
  subcategory?: string | null;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function toMonthKey(dateStr: string): string {
  return dateStr.slice(0, 7); // "YYYY-MM-DD" → "YYYY-MM"
}

function monthBoundaries(month: string): { start: string; end: string } {
  const [year, m] = month.split('-').map(Number);
  const nextYear = m === 12 ? year + 1 : year;
  const nextM = m === 12 ? 1 : m + 1;
  return {
    start: `${month}-01`,
    end: `${nextYear}-${String(nextM).padStart(2, '0')}-01`,
  };
}

// ---------------------------------------------------------------------------
// spending_state sync
// ---------------------------------------------------------------------------

/**
 * Re-derive spending_state for one (user, card, category, month) combination
 * by summing the transactions table. Called after every mutation.
 * Fails silently — caps screen re-reads transactions directly anyway.
 */
export async function recalculateSpendingState(
  userId: string,
  cardId: string,
  categoryId: string,
  month: string,
): Promise<void> {
  try {
    const { start, end } = monthBoundaries(month);

    const { data } = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', userId)
      .eq('card_id', cardId)
      .eq('category_id', categoryId)
      .gte('transaction_date', start)
      .lt('transaction_date', end);

    const totalSpent = (data ?? []).reduce(
      (sum, t: { amount: number }) => sum + t.amount,
      0,
    );

    await supabase.from('spending_state').upsert(
      {
        user_id: userId,
        card_id: cardId,
        category_id: categoryId,
        month,
        total_spent: totalSpent,
      },
      { onConflict: 'user_id,card_id,category_id,month' },
    );
  } catch {
    // Non-blocking — caps screen derives its own totals from transactions
  }
}

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

/**
 * Update a transaction's fields and refresh all affected spending_state rows.
 * Handles month-boundary changes: if transaction_date moves across months,
 * both the old and new month are recalculated.
 */
export async function updateTransaction(
  id: string,
  oldTx: { card_id: string; category_id: string; transaction_date: string },
  newTx: TransactionUpdate,
  userId: string,
): Promise<{ error: string | null }> {
  const updatePayload: Record<string, unknown> = {
    card_id: newTx.card_id,
    category_id: newTx.category_id,
    amount: newTx.amount,
    transaction_date: newTx.transaction_date,
  };
  // Only include subcategory when it is explicitly provided (including null to clear it)
  if ('subcategory' in newTx) {
    updatePayload.subcategory = newTx.subcategory ?? null;
  }

  const { error } = await supabase
    .from('transactions')
    .update(updatePayload)
    .eq('id', id)
    .eq('user_id', userId);

  if (error) return { error: error.message };

  // Recalculate all unique (card, category, month) combos that were touched
  const combos = new Set([
    `${oldTx.card_id}|${oldTx.category_id}|${toMonthKey(oldTx.transaction_date)}`,
    `${newTx.card_id}|${newTx.category_id}|${toMonthKey(newTx.transaction_date)}`,
  ]);

  await Promise.all(
    Array.from(combos).map((combo) => {
      const [cardId, categoryId, month] = combo.split('|');
      return recalculateSpendingState(userId, cardId, categoryId, month);
    }),
  );

  return { error: null };
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

/**
 * Delete a transaction and decrement the matching spending_state total.
 */
export async function deleteTransaction(
  id: string,
  tx: { card_id: string; category_id: string; transaction_date: string },
  userId: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) return { error: error.message };

  await recalculateSpendingState(
    userId,
    tx.card_id,
    tx.category_id,
    toMonthKey(tx.transaction_date),
  );

  return { error: null };
}

// ---------------------------------------------------------------------------
// Reinsert (undo delete)
// ---------------------------------------------------------------------------

/**
 * Re-insert a previously deleted transaction (undo flow).
 * A new row is created with a new auto-generated ID.
 */
export async function reinsertTransaction(tx: {
  user_id: string;
  card_id: string;
  category_id: string;
  amount: number;
  transaction_date: string;
}): Promise<{ error: string | null }> {
  const { error } = await supabase.from('transactions').insert({
    user_id: tx.user_id,
    card_id: tx.card_id,
    category_id: tx.category_id,
    amount: tx.amount,
    transaction_date: tx.transaction_date,
  });

  if (error) return { error: error.message };

  await recalculateSpendingState(
    tx.user_id,
    tx.card_id,
    tx.category_id,
    toMonthKey(tx.transaction_date),
  );

  return { error: null };
}
