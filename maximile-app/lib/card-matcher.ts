import { supabase } from './supabase';

export interface CardMatch {
  cardId: string;
  cardName: string;
  confidence: number;
  source: 'verified' | 'fuzzy' | 'none';
}

const NOISE_SUFFIXES = [
  'visa', 'mastercard', 'amex', 'card', 'signature', 'platinum',
  'gold', 'world', 'credit',
];

function normalize(str: string): string[] {
  return str
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter((token) => !NOISE_SUFFIXES.includes(token));
}

export function calculateSimilarity(str1: string, str2: string): number {
  const tokens1 = new Set(normalize(str1));
  const tokens2 = new Set(normalize(str2));

  if (tokens1.size === 0 && tokens2.size === 0) return 1;
  if (tokens1.size === 0 || tokens2.size === 0) return 0;

  let intersection = 0;
  for (const t of tokens1) {
    if (tokens2.has(t)) intersection++;
  }

  const union = new Set([...tokens1, ...tokens2]).size;
  return union === 0 ? 0 : intersection / union;
}

export async function matchCard(
  userId: string,
  walletCardName: string,
): Promise<CardMatch | null> {
  const { data: mapping } = await supabase
    .from('card_name_mappings' as any)
    .select('card_id, card_name, confidence')
    .eq('user_id', userId)
    .eq('wallet_name', walletCardName)
    .maybeSingle();

  if (mapping) {
    return {
      cardId: (mapping as any).card_id,
      cardName: (mapping as any).card_name ?? walletCardName,
      confidence: (mapping as any).confidence ?? 1.0,
      source: 'verified',
    };
  }

  const { data: userCards, error } = await supabase
    .from('user_cards')
    .select('card_id, cards!inner(id, name, bank)')
    .eq('user_id', userId);

  if (error || !userCards || userCards.length === 0) return null;

  let bestMatch: CardMatch | null = null;
  let bestScore = 0;

  for (const uc of userCards) {
    const card = (uc as any).cards;
    if (!card) continue;

    const fullName = `${card.bank} ${card.name}`;
    const score = calculateSimilarity(walletCardName, fullName);

    if (score > bestScore) {
      bestScore = score;
      bestMatch = {
        cardId: card.id,
        cardName: fullName,
        confidence: score,
        source: 'fuzzy',
      };
    }
  }

  if (bestMatch && bestMatch.confidence >= 0.5) return bestMatch;
  return null;
}

export async function saveCardMapping(
  userId: string,
  walletName: string,
  cardId: string,
): Promise<void> {
  const { error } = await supabase
    .from('card_name_mappings' as any)
    .upsert(
      {
        user_id: userId,
        wallet_name: walletName,
        card_id: cardId,
        confidence: 1.0,
      },
      { onConflict: 'user_id,wallet_name' },
    );

  if (error) throw error;
}

export async function getUserCardMappings(
  userId: string,
): Promise<Array<{ walletName: string; cardId: string; cardName: string }>> {
  const { data, error } = await supabase
    .from('card_name_mappings' as any)
    .select('wallet_name, card_id, card_name')
    .eq('user_id', userId);

  if (error) throw error;

  return ((data as any[]) ?? []).map((row) => ({
    walletName: row.wallet_name,
    cardId: row.card_id,
    cardName: row.card_name ?? '',
  }));
}
