// =============================================================================
// MaxiMile Scraper — DB Comparator
// =============================================================================
// Queries Supabase for a card's earn rules, caps, and conditions, then
// formats the data as a human-readable summary for AI comparison against
// MileLion review content.
//
// Used by the MileLion date gate pipeline branch to provide the AI classifier
// with our current database state for comparison.
//
// DB Schema:
//   cards: id, bank, name, slug, base_rate_mpd, notes
//   earn_rules: card_id, category_id, earn_rate_mpd, is_bonus, conditions, conditions_note
//   categories: id (text PK), name
// =============================================================================

import { getClient } from './supabase-client.js';

// ---------------------------------------------------------------------------
// Types (matching actual DB schema)
// ---------------------------------------------------------------------------

interface CardRow {
  id: string;
  name: string;
  slug: string;
  bank: string;
  base_rate_mpd: number | null;
  notes: string | null;
}

interface EarnRuleRow {
  id: string;
  card_id: string;
  category_id: string;
  earn_rate_mpd: number;
  is_bonus: boolean;
  conditions: Record<string, unknown> | null;
  conditions_note: string | null;
  categories: { name: string } | null;
}

// ---------------------------------------------------------------------------
// Main function
// ---------------------------------------------------------------------------

/**
 * Get a formatted summary of a card's earn rules from the database.
 *
 * Queries the cards and earn_rules tables, then formats the data into
 * a human-readable string suitable for AI comparison against MileLion
 * review article content.
 *
 * @param cardName - The card name (e.g., "DBS Altitude Visa")
 * @returns Formatted string summarizing the card's earn structure, or null if not found
 */
export async function getCardDataSummary(cardName: string): Promise<string | null> {
  const supabase = getClient();

  // Look up the card by name (case-insensitive partial match)
  const { data: card, error: cardError } = await supabase
    .from('cards')
    .select('id, name, slug, bank, base_rate_mpd, notes')
    .ilike('name', `%${cardName}%`)
    .limit(1)
    .maybeSingle();

  if (cardError) {
    console.warn(`[DB-Comparator] Error looking up card "${cardName}": ${cardError.message}`);
    return null;
  }

  if (!card) {
    console.warn(`[DB-Comparator] Card not found: "${cardName}"`);
    return null;
  }

  const typedCard = card as CardRow;

  // Fetch earn rules for this card, joined with category names
  const { data: earnRules, error: rulesError } = await supabase
    .from('earn_rules')
    .select('id, card_id, category_id, earn_rate_mpd, is_bonus, conditions, conditions_note, categories(name)')
    .eq('card_id', typedCard.id)
    .order('category_id', { ascending: true });

  if (rulesError) {
    console.warn(`[DB-Comparator] Error fetching earn rules for "${cardName}": ${rulesError.message}`);
    return formatCardSummary(typedCard, []);
  }

  return formatCardSummary(typedCard, (earnRules ?? []) as unknown as EarnRuleRow[]);
}

/**
 * Get formatted summaries for multiple cards monitored by a single source.
 *
 * Used for the MileLion guide page fallback which covers multiple cards.
 *
 * @param cardNames - Array of card names to look up
 * @returns Combined formatted string, or null if no cards found
 */
export async function getMultiCardDataSummary(cardNames: string[]): Promise<string | null> {
  const summaries: string[] = [];

  for (const name of cardNames) {
    const summary = await getCardDataSummary(name);
    if (summary) {
      summaries.push(summary);
    }
  }

  if (summaries.length === 0) return null;

  return summaries.join('\n\n---\n\n');
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

/**
 * Format a card and its earn rules into a human-readable summary.
 */
function formatCardSummary(card: CardRow, earnRules: EarnRuleRow[]): string {
  const lines: string[] = [];

  // Card header
  const baseRate = card.base_rate_mpd
    ? `${card.base_rate_mpd} mpd base`
    : 'base rate unknown';
  lines.push(`Card: ${card.name} (${baseRate})`);
  lines.push(`Bank: ${card.bank}`);
  lines.push(`Slug: ${card.slug}`);

  if (card.notes) {
    lines.push(`Notes: ${card.notes}`);
  }

  lines.push('');

  if (earnRules.length === 0) {
    lines.push('Earn Rules: No earn rules in database');
    return lines.join('\n');
  }

  lines.push('Earn Rules:');

  for (const rule of earnRules) {
    const categoryName = rule.categories?.name ?? rule.category_id;
    const ruleType = rule.is_bonus ? 'bonus' : 'base';
    let line = `- ${categoryName}: ${rule.earn_rate_mpd} mpd (${ruleType})`;

    // Extract cap info from conditions JSON if present
    const conditions = rule.conditions as Record<string, unknown> | null;
    if (conditions) {
      if (conditions.cap_amount) {
        line += `, cap $${Number(conditions.cap_amount).toLocaleString()}`;
        if (conditions.cap_period) {
          line += `/${conditions.cap_period}`;
        }
      }
      if (conditions.min_spend) {
        line += `, min spend $${Number(conditions.min_spend).toLocaleString()}`;
      }
    }

    lines.push(line);

    if (rule.conditions_note) {
      lines.push(`  Conditions: ${rule.conditions_note}`);
    }
  }

  return lines.join('\n');
}
