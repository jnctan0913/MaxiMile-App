// =============================================================================
// MaxiMile — useMerchantSearch Hook (Sprint 34)
// =============================================================================
// Debounced fuzzy search over the merchant catalogue.
// - Only triggers when query length >= 2
// - 120ms debounce
// - Scoring: exact name = 100, prefix = 80, keyword prefix = 70,
//   name contains = 50, keyword contains = 40
// - Returns top 6 results sorted by score desc
// =============================================================================

import { useState, useEffect, useRef } from 'react';
import { getMerchantCatalogue, MerchantEntry } from '../lib/merchant-catalogue';

interface MerchantSearchResult {
  results: MerchantEntry[];
  isSearching: boolean;
}

interface ScoredEntry {
  entry: MerchantEntry;
  score: number;
}

const DEBOUNCE_MS = 120;
const MAX_RESULTS = 6;
const MIN_QUERY_LENGTH = 2;

function scoreMerchant(entry: MerchantEntry, normalizedQuery: string): number {
  const nameLower = entry.name.toLowerCase();

  // Exact name match
  if (nameLower === normalizedQuery) return 100;

  // Name starts with query
  if (nameLower.startsWith(normalizedQuery)) return 80;

  // Any keyword starts with query
  for (const kw of entry.keywords) {
    if (kw.toLowerCase().startsWith(normalizedQuery)) return 70;
  }

  // Name contains query
  if (nameLower.includes(normalizedQuery)) return 50;

  // Any keyword contains query
  for (const kw of entry.keywords) {
    if (kw.toLowerCase().includes(normalizedQuery)) return 40;
  }

  return 0;
}

export function useMerchantSearch(query: string): MerchantSearchResult {
  const [results, setResults] = useState<MerchantEntry[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Clear previous timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    timerRef.current = setTimeout(() => {
      const normalizedQuery = trimmed.toLowerCase();
      const catalogue = getMerchantCatalogue();

      const scored: ScoredEntry[] = [];
      for (const entry of catalogue) {
        const score = scoreMerchant(entry, normalizedQuery);
        if (score > 0) {
          scored.push({ entry, score });
        }
      }

      // Sort by score descending, then alphabetically for ties
      scored.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.entry.name.localeCompare(b.entry.name);
      });

      setResults(scored.slice(0, MAX_RESULTS).map((s) => s.entry));
      setIsSearching(false);
    }, DEBOUNCE_MS);

    // Cleanup on unmount or query change
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [query]);

  return { results, isSearching };
}
