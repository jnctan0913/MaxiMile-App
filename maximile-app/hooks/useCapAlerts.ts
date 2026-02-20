import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { CATEGORY_MAP } from '../constants/categories';
import type { Cap, Card } from '../lib/supabase-types';

export interface CapAlertItem {
  cardId: string;
  cardName: string;
  categoryId: string | null;
  categoryName: string;
  percentUsed: number;
  remainingAmount: number;
  capLimit: number;
  alternativeCard?: string;
}

interface EarnRuleRow {
  card_id: string;
  category_id: string;
  earn_rate_mpd: number;
  effective_to: string | null;
}

const ALERT_THRESHOLD = 80;

export function useCapAlerts(userId: string | undefined) {
  const [alerts, setAlerts] = useState<CapAlertItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAlerts = useCallback(async () => {
    if (!userId) {
      setAlerts([]);
      return;
    }

    setLoading(true);

    try {
      const now = new Date();
      const currentMonth = now.toISOString().slice(0, 7);
      const monthStart = `${currentMonth}-01`;
      const nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const nextMonthStr = nextMonthDate.toISOString().slice(0, 10);

      const { data: userCards } = await supabase
        .from('user_cards')
        .select('card_id')
        .eq('user_id', userId);

      if (!userCards || userCards.length === 0) {
        setAlerts([]);
        setLoading(false);
        return;
      }

      const cardIds = userCards.map((uc) => uc.card_id);

      const [cardsRes, capsRes, txnRes, earnRulesRes] = await Promise.all([
        supabase.from('cards').select('*').in('id', cardIds),
        supabase.from('caps').select('*').in('card_id', cardIds),
        supabase
          .from('transactions')
          .select('card_id, category_id, amount')
          .eq('user_id', userId)
          .gte('transaction_date', monthStart)
          .lt('transaction_date', nextMonthStr)
          .in('card_id', cardIds),
        supabase
          .from('earn_rules')
          .select('card_id, category_id, earn_rate_mpd, effective_to')
          .in('card_id', cardIds)
          .is('effective_to', null),
      ]);

      const cards = (cardsRes.data ?? []) as Card[];
      const caps = (capsRes.data ?? []) as Cap[];
      const txns = (txnRes.data ?? []) as { card_id: string; category_id: string; amount: number }[];
      const earnRules = (earnRulesRes.data ?? []) as EarnRuleRow[];

      const cardMap = new Map(cards.map((c) => [c.id, c]));

      const txnSpending = new Map<string, number>();
      const txnCardTotal = new Map<string, number>();
      for (const txn of txns) {
        const key = `${txn.card_id}:${txn.category_id}`;
        txnSpending.set(key, (txnSpending.get(key) ?? 0) + txn.amount);
        txnCardTotal.set(txn.card_id, (txnCardTotal.get(txn.card_id) ?? 0) + txn.amount);
      }

      const seenCapKeys = new Set<string>();
      const uniqueCaps = caps.filter((cap) => {
        const key = `${cap.card_id}:${cap.category_id ?? '__null__'}`;
        if (seenCapKeys.has(key)) return false;
        seenCapKeys.add(key);
        return true;
      });

      const alertItems: CapAlertItem[] = [];

      for (const cap of uniqueCaps) {
        if (cap.monthly_cap_amount <= 0) continue;

        const spent = cap.category_id
          ? txnSpending.get(`${cap.card_id}:${cap.category_id}`) ?? 0
          : txnCardTotal.get(cap.card_id) ?? 0;

        const percentUsed = (spent / cap.monthly_cap_amount) * 100;

        if (percentUsed < ALERT_THRESHOLD) continue;

        const card = cardMap.get(cap.card_id);
        const remaining = Math.max(cap.monthly_cap_amount - spent, 0);
        const categoryName = cap.category_id
          ? CATEGORY_MAP[cap.category_id]?.name ?? cap.category_id
          : 'All Categories';

        const alt = cap.category_id
          ? findAlternativeCard(
              cap.card_id,
              cap.category_id,
              cardIds,
              cardMap,
              earnRules,
              caps,
              txnSpending,
              txnCardTotal,
            )
          : undefined;

        alertItems.push({
          cardId: cap.card_id,
          cardName: card?.name ?? 'Card',
          categoryId: cap.category_id,
          categoryName,
          percentUsed,
          remainingAmount: remaining,
          capLimit: cap.monthly_cap_amount,
          alternativeCard: alt,
        });
      }

      alertItems.sort((a, b) => b.percentUsed - a.percentUsed);
      setAlerts(alertItems);
    } catch (err) {
      if (__DEV__) console.error('useCapAlerts fetch error:', err);
      setAlerts([]);
    }

    setLoading(false);
  }, [userId]);

  return { alerts, loading, fetchAlerts };
}

/**
 * Find the best alternative card for a given category among the user's other cards.
 * Picks the card with the highest earn rate whose cap is not exhausted.
 */
function findAlternativeCard(
  currentCardId: string,
  categoryId: string,
  allCardIds: string[],
  cardMap: Map<string, Card>,
  earnRules: EarnRuleRow[],
  caps: Cap[],
  txnSpending: Map<string, number>,
  txnCardTotal: Map<string, number>,
): string | undefined {
  const otherCardIds = allCardIds.filter((id) => id !== currentCardId);
  if (otherCardIds.length === 0) return undefined;

  let bestName: string | undefined;
  let bestRate = 0;

  for (const cardId of otherCardIds) {
    const rule = earnRules.find(
      (r) => r.card_id === cardId && r.category_id === categoryId,
    );
    const rate = rule?.earn_rate_mpd ?? cardMap.get(cardId)?.base_rate_mpd ?? 0;

    const cardCap = caps.find(
      (c) =>
        c.card_id === cardId &&
        (c.category_id === categoryId || c.category_id === null),
    );

    if (cardCap && cardCap.monthly_cap_amount > 0) {
      const spent = cardCap.category_id
        ? txnSpending.get(`${cardId}:${cardCap.category_id}`) ?? 0
        : txnCardTotal.get(cardId) ?? 0;
      if (spent >= cardCap.monthly_cap_amount) continue;
    }

    if (rate > bestRate) {
      bestRate = rate;
      bestName = cardMap.get(cardId)?.name;
    }
  }

  return bestName;
}
