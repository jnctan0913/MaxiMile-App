-- =============================================================================
-- MaxiMile -- Data Validation Queries (validation_queries.sql)
-- =============================================================================
-- Description: SQL queries to verify data integrity in the live Supabase
--              database. Run these after seeding all 20 cards (batch 1 + 2).
--
-- Usage: Execute each query individually in the Supabase SQL Editor or via
--        psql. Each query is self-contained and returns a result set.
--
-- Updated: 2026-02-19 (Phase 3 -- expanded for 20 cards)
-- Author:  Data Engineer Agent
-- =============================================================================


-- ============================================================
-- Q1: Count total cards (expect 20 for both batches)
-- ============================================================
SELECT
  'Q1: Card count' AS check_name,
  COUNT(*) AS total_cards,
  CASE
    WHEN COUNT(*) = 20 THEN 'PASS (all 20 cards present)'
    WHEN COUNT(*) = 10 THEN 'WARN -- only 10 cards (batch 1 only?)'
    ELSE 'FAIL -- expected 20, got ' || COUNT(*)::TEXT
  END AS status
FROM public.cards
WHERE is_active = TRUE;


-- ============================================================
-- Q2: Count earn_rules per card (should be 7 each)
-- ============================================================
SELECT
  'Q2: Earn rules per card' AS check_name,
  c.name AS card_name,
  COUNT(er.id) AS rule_count,
  CASE
    WHEN COUNT(er.id) = 7 THEN 'PASS'
    WHEN COUNT(er.id) > 7 THEN 'WARN -- has bonus+base duplicates'
    ELSE 'FAIL -- missing ' || (7 - COUNT(er.id))::TEXT || ' rules'
  END AS status
FROM public.cards c
LEFT JOIN public.earn_rules er ON er.card_id = c.id AND er.effective_to IS NULL
GROUP BY c.id, c.name
ORDER BY c.name;

-- Summary: total earn rules (expect 140 for all 20 cards)
SELECT
  'Q2 summary: Total earn rules' AS check_name,
  COUNT(*) AS total_rules,
  CASE
    WHEN COUNT(*) = 140 THEN 'PASS (20 cards x 7 categories = 140)'
    WHEN COUNT(*) = 70 THEN 'WARN -- only 70 rules (batch 1 only?)'
    ELSE 'CHECK -- expected 140, got ' || COUNT(*)::TEXT
  END AS status
FROM public.earn_rules
WHERE effective_to IS NULL;


-- ============================================================
-- Q3: Find cards with missing category rules
-- ============================================================
-- Cross-join all cards x all categories, then left-join earn_rules
-- to find missing combinations.
SELECT
  'Q3: Missing category rules' AS check_name,
  c.name AS card_name,
  cat.id AS missing_category,
  'FAIL' AS status
FROM public.cards c
CROSS JOIN public.categories cat
LEFT JOIN public.earn_rules er
  ON er.card_id = c.id
  AND er.category_id = cat.id
  AND er.effective_to IS NULL
WHERE er.id IS NULL
ORDER BY c.name, cat.display_order;

-- If this returns zero rows, all cards have all 7 categories covered.


-- ============================================================
-- Q4: Find earn_rules with NULL or zero mpd
-- ============================================================
SELECT
  'Q4: Zero/NULL earn rates' AS check_name,
  c.name AS card_name,
  er.category_id,
  er.earn_rate_mpd,
  CASE
    WHEN er.earn_rate_mpd IS NULL THEN 'FAIL -- NULL rate'
    WHEN er.earn_rate_mpd = 0 THEN 'WARN -- zero rate (may be intentional)'
    ELSE 'OK'
  END AS status
FROM public.earn_rules er
JOIN public.cards c ON c.id = er.card_id
WHERE er.effective_to IS NULL
  AND (er.earn_rate_mpd IS NULL OR er.earn_rate_mpd = 0)
ORDER BY c.name, er.category_id;

-- If this returns zero rows, no earn rules have NULL or zero mpd.


-- ============================================================
-- Q5: Find caps with unrealistic amounts (<$100 or >$10,000)
-- ============================================================
SELECT
  'Q5: Unrealistic caps' AS check_name,
  c.name AS card_name,
  cap.category_id,
  cap.monthly_cap_amount,
  cap.cap_type,
  CASE
    WHEN cap.monthly_cap_amount < 100 THEN 'WARN -- unusually low cap (<$100)'
    WHEN cap.monthly_cap_amount > 10000 THEN 'WARN -- unusually high cap (>$10,000)'
    ELSE 'OK'
  END AS status
FROM public.caps cap
JOIN public.cards c ON c.id = cap.card_id
WHERE cap.monthly_cap_amount < 100 OR cap.monthly_cap_amount > 10000
ORDER BY c.name;

-- If this returns zero rows, all caps are in the realistic $100-$10,000 range.


-- ============================================================
-- Q6: Verify all categories are referenced in earn_rules
-- ============================================================
SELECT
  'Q6: Category coverage' AS check_name,
  cat.id AS category_id,
  cat.name AS category_name,
  COUNT(DISTINCT er.card_id) AS cards_using_category,
  CASE
    WHEN COUNT(DISTINCT er.card_id) = 20 THEN 'PASS -- all 20 cards'
    WHEN COUNT(DISTINCT er.card_id) = 0 THEN 'FAIL -- no cards reference this category'
    ELSE 'WARN -- ' || COUNT(DISTINCT er.card_id)::TEXT || '/20 cards'
  END AS status
FROM public.categories cat
LEFT JOIN public.earn_rules er
  ON er.category_id = cat.id
  AND er.effective_to IS NULL
GROUP BY cat.id, cat.name
ORDER BY cat.display_order;


-- ============================================================
-- Q7: Check for orphaned earn_rules (card_id not in cards)
-- ============================================================
SELECT
  'Q7: Orphaned earn_rules' AS check_name,
  er.id AS earn_rule_id,
  er.card_id,
  er.category_id,
  'FAIL -- earn_rule references non-existent card' AS status
FROM public.earn_rules er
LEFT JOIN public.cards c ON c.id = er.card_id
WHERE c.id IS NULL;

-- If this returns zero rows, no orphaned earn rules exist.
-- Note: The FK constraint (card_id REFERENCES cards(id) ON DELETE CASCADE)
-- should prevent this, but this query catches any integrity issues.


-- ============================================================
-- Q8: Verify slug uniqueness
-- ============================================================
SELECT
  'Q8: Duplicate slugs' AS check_name,
  slug,
  COUNT(*) AS occurrences,
  'FAIL -- duplicate slug' AS status
FROM public.cards
GROUP BY slug
HAVING COUNT(*) > 1;

-- If this returns zero rows, all slugs are unique.
-- Note: The UNIQUE constraint on slug should enforce this at the DB level.


-- ============================================================
-- Q9: Coverage matrix for all 20 cards x 7 categories (140 earn rules)
-- ============================================================
-- Produces a pivot-style view showing the mpd rate for each card+category.
-- Useful for visual spot-checking.
SELECT
  c.bank,
  c.name AS card,
  MAX(CASE WHEN er.category_id = 'dining' THEN er.earn_rate_mpd END) AS dining,
  MAX(CASE WHEN er.category_id = 'transport' THEN er.earn_rate_mpd END) AS transport,
  MAX(CASE WHEN er.category_id = 'online' THEN er.earn_rate_mpd END) AS online,
  MAX(CASE WHEN er.category_id = 'groceries' THEN er.earn_rate_mpd END) AS groceries,
  MAX(CASE WHEN er.category_id = 'petrol' THEN er.earn_rate_mpd END) AS petrol,
  MAX(CASE WHEN er.category_id = 'travel' THEN er.earn_rate_mpd END) AS travel,
  MAX(CASE WHEN er.category_id = 'general' THEN er.earn_rate_mpd END) AS general,
  COUNT(er.id) AS total_rules,
  CASE
    WHEN COUNT(er.id) = 7 THEN 'COMPLETE'
    ELSE 'INCOMPLETE (' || COUNT(er.id)::TEXT || '/7)'
  END AS status
FROM public.cards c
LEFT JOIN public.earn_rules er
  ON er.card_id = c.id
  AND er.effective_to IS NULL
GROUP BY c.id, c.bank, c.name
ORDER BY c.bank, c.name;

-- Expect: 20 rows, all showing 'COMPLETE', no NULL values in category columns.

-- Summary counts for coverage matrix
SELECT
  'Q9 summary: Coverage matrix' AS check_name,
  COUNT(*) FILTER (WHERE rule_count = 7) AS complete_cards,
  COUNT(*) FILTER (WHERE rule_count < 7) AS incomplete_cards,
  COUNT(*) FILTER (WHERE rule_count > 7) AS over_filled_cards,
  CASE
    WHEN COUNT(*) FILTER (WHERE rule_count = 7) = 20 THEN 'PASS -- all 20 cards complete'
    ELSE 'FAIL -- ' || COUNT(*) FILTER (WHERE rule_count < 7)::TEXT || ' incomplete cards'
  END AS status
FROM (
  SELECT c.id, COUNT(er.id) AS rule_count
  FROM public.cards c
  LEFT JOIN public.earn_rules er ON er.card_id = c.id AND er.effective_to IS NULL
  GROUP BY c.id
) card_counts;


-- ============================================================
-- Q10: Batch comparison (batch 1 vs batch 2 avg rates by category)
-- ============================================================
-- Compares average earn rates between batch 1 (card IDs ending in 0001-)
-- and batch 2 (card IDs ending in 0002-) by category.
SELECT
  'Q10: Batch comparison' AS check_name,
  er.category_id,
  ROUND(AVG(CASE WHEN c.id::TEXT LIKE '%0001-%' THEN er.earn_rate_mpd END), 2) AS batch1_avg_mpd,
  ROUND(AVG(CASE WHEN c.id::TEXT LIKE '%0002-%' THEN er.earn_rate_mpd END), 2) AS batch2_avg_mpd,
  ROUND(
    AVG(CASE WHEN c.id::TEXT LIKE '%0002-%' THEN er.earn_rate_mpd END) -
    AVG(CASE WHEN c.id::TEXT LIKE '%0001-%' THEN er.earn_rate_mpd END),
    2
  ) AS diff,
  CASE
    WHEN ABS(
      AVG(CASE WHEN c.id::TEXT LIKE '%0002-%' THEN er.earn_rate_mpd END) -
      AVG(CASE WHEN c.id::TEXT LIKE '%0001-%' THEN er.earn_rate_mpd END)
    ) > 2.0 THEN 'WARN -- large difference between batches'
    ELSE 'OK'
  END AS status
FROM public.earn_rules er
JOIN public.cards c ON c.id = er.card_id
WHERE er.effective_to IS NULL
GROUP BY er.category_id
ORDER BY er.category_id;

-- Overall batch comparison
SELECT
  'Q10 summary: Overall batch comparison' AS check_name,
  ROUND(AVG(CASE WHEN c.id::TEXT LIKE '%0001-%' THEN er.earn_rate_mpd END), 2) AS batch1_overall_avg,
  ROUND(AVG(CASE WHEN c.id::TEXT LIKE '%0002-%' THEN er.earn_rate_mpd END), 2) AS batch2_overall_avg,
  COUNT(DISTINCT CASE WHEN c.id::TEXT LIKE '%0001-%' THEN c.id END) AS batch1_card_count,
  COUNT(DISTINCT CASE WHEN c.id::TEXT LIKE '%0002-%' THEN c.id END) AS batch2_card_count
FROM public.earn_rules er
JOIN public.cards c ON c.id = er.card_id
WHERE er.effective_to IS NULL;


-- ============================================================
-- Q11: Cards with [ESTIMATED] data flagged for priority verification
-- ============================================================
-- Searches card notes and earn_rules conditions_note for [ESTIMATED] tags.
-- These cards need priority manual verification against bank T&Cs.

-- Cards with [ESTIMATED] in their metadata notes
SELECT
  'Q11a: Cards with ESTIMATED notes' AS check_name,
  c.bank,
  c.name AS card_name,
  'Card-level ESTIMATED flag' AS flag_source,
  c.notes AS details
FROM public.cards c
WHERE c.notes ILIKE '%ESTIMATED%'
ORDER BY c.bank, c.name;

-- Earn rules with [ESTIMATED] in their conditions_note
SELECT
  'Q11b: Earn rules with ESTIMATED notes' AS check_name,
  c.bank,
  c.name AS card_name,
  er.category_id,
  er.earn_rate_mpd,
  er.conditions_note AS details
FROM public.earn_rules er
JOIN public.cards c ON c.id = er.card_id
WHERE er.conditions_note ILIKE '%ESTIMATED%'
  AND er.effective_to IS NULL
ORDER BY c.bank, c.name, er.category_id;

-- Caps with [ESTIMATED] in their notes
SELECT
  'Q11c: Caps with ESTIMATED notes' AS check_name,
  c.bank,
  c.name AS card_name,
  cap.category_id,
  cap.monthly_cap_amount,
  cap.notes AS details
FROM public.caps cap
JOIN public.cards c ON c.id = cap.card_id
WHERE cap.notes ILIKE '%ESTIMATED%'
ORDER BY c.bank, c.name;

-- Exclusions with [ESTIMATED] in their description
SELECT
  'Q11d: Exclusions with ESTIMATED notes' AS check_name,
  c.bank,
  c.name AS card_name,
  ex.category_id,
  ex.description AS details
FROM public.exclusions ex
JOIN public.cards c ON c.id = ex.card_id
WHERE ex.description ILIKE '%ESTIMATED%'
ORDER BY c.bank, c.name;

-- Summary: total ESTIMATED items across all tables
SELECT
  'Q11 summary: ESTIMATED items' AS check_name,
  (SELECT COUNT(*) FROM public.cards WHERE notes ILIKE '%ESTIMATED%') AS estimated_cards,
  (SELECT COUNT(*) FROM public.earn_rules WHERE conditions_note ILIKE '%ESTIMATED%' AND effective_to IS NULL) AS estimated_earn_rules,
  (SELECT COUNT(*) FROM public.caps WHERE notes ILIKE '%ESTIMATED%') AS estimated_caps,
  (SELECT COUNT(*) FROM public.exclusions WHERE description ILIKE '%ESTIMATED%') AS estimated_exclusions,
  (
    (SELECT COUNT(*) FROM public.cards WHERE notes ILIKE '%ESTIMATED%') +
    (SELECT COUNT(*) FROM public.earn_rules WHERE conditions_note ILIKE '%ESTIMATED%' AND effective_to IS NULL) +
    (SELECT COUNT(*) FROM public.caps WHERE notes ILIKE '%ESTIMATED%') +
    (SELECT COUNT(*) FROM public.exclusions WHERE description ILIKE '%ESTIMATED%')
  ) AS total_estimated_items;


-- ============================================================
-- Q12: Full data export (all cards with rules, caps, exclusions)
-- ============================================================
-- Single comprehensive view for manual review / CSV export.
-- Join cards + earn_rules + caps + exclusions into one wide result set.
SELECT
  c.bank,
  c.name AS card_name,
  c.slug,
  c.network,
  c.annual_fee,
  c.base_rate_mpd,
  er.category_id,
  er.earn_rate_mpd,
  er.is_bonus,
  er.conditions_note,
  er.source_url,
  cap.monthly_cap_amount AS cap_amount,
  cap.cap_type,
  cap.notes AS cap_notes,
  CASE
    WHEN c.notes ILIKE '%ESTIMATED%' OR er.conditions_note ILIKE '%ESTIMATED%'
    THEN 'ESTIMATED'
    ELSE 'VERIFIED'
  END AS verification_status
FROM public.cards c
JOIN public.earn_rules er
  ON er.card_id = c.id
  AND er.effective_to IS NULL
LEFT JOIN public.caps cap
  ON cap.card_id = c.id
  AND (cap.category_id = er.category_id OR cap.category_id IS NULL)
WHERE c.is_active = TRUE
ORDER BY c.bank, c.name, er.category_id;


-- ============================================================
-- Q13: Exclusion summary per card
-- ============================================================
-- Shows total exclusions per card for review.
SELECT
  c.bank,
  c.name AS card_name,
  COUNT(ex.id) AS exclusion_count,
  STRING_AGG(
    COALESCE(ex.category_id, 'ALL') || ': ' || LEFT(ex.description, 50),
    ' | '
    ORDER BY ex.category_id NULLS FIRST
  ) AS exclusion_summary
FROM public.cards c
LEFT JOIN public.exclusions ex ON ex.card_id = c.id
GROUP BY c.id, c.bank, c.name
ORDER BY c.bank, c.name;


-- ============================================================
-- Q14 (Bonus): Full data health dashboard (expanded for 20 cards)
-- ============================================================
-- Single query that summarizes overall data health.
SELECT
  'Total active cards' AS metric,
  COUNT(*)::TEXT AS value
FROM public.cards WHERE is_active = TRUE

UNION ALL

SELECT
  'Total active earn rules',
  COUNT(*)::TEXT
FROM public.earn_rules WHERE effective_to IS NULL

UNION ALL

SELECT
  'Cards with 7/7 categories',
  COUNT(*)::TEXT
FROM (
  SELECT card_id, COUNT(DISTINCT category_id) AS cat_count
  FROM public.earn_rules
  WHERE effective_to IS NULL
  GROUP BY card_id
  HAVING COUNT(DISTINCT category_id) = 7
) complete_cards

UNION ALL

SELECT
  'Cards with < 7 categories',
  COUNT(*)::TEXT
FROM (
  SELECT card_id, COUNT(DISTINCT category_id) AS cat_count
  FROM public.earn_rules
  WHERE effective_to IS NULL
  GROUP BY card_id
  HAVING COUNT(DISTINCT category_id) < 7
) incomplete_cards

UNION ALL

SELECT
  'Total caps defined',
  COUNT(*)::TEXT
FROM public.caps

UNION ALL

SELECT
  'Total exclusions defined',
  COUNT(*)::TEXT
FROM public.exclusions

UNION ALL

SELECT
  'Earn rules with NULL/zero mpd',
  COUNT(*)::TEXT
FROM public.earn_rules
WHERE effective_to IS NULL
  AND (earn_rate_mpd IS NULL OR earn_rate_mpd = 0)

UNION ALL

SELECT
  'Orphaned earn rules',
  COUNT(*)::TEXT
FROM public.earn_rules er
LEFT JOIN public.cards c ON c.id = er.card_id
WHERE c.id IS NULL

UNION ALL

SELECT
  'Cards with ESTIMATED data',
  COUNT(*)::TEXT
FROM public.cards
WHERE notes ILIKE '%ESTIMATED%'

UNION ALL

SELECT
  'Cards with VERIFIED data only',
  COUNT(*)::TEXT
FROM public.cards
WHERE notes NOT ILIKE '%ESTIMATED%'

UNION ALL

SELECT
  'Cards with $0 annual fee',
  COUNT(*)::TEXT
FROM public.cards
WHERE annual_fee = 0 AND is_active = TRUE

UNION ALL

SELECT
  'Avg earn rate (all cards, all categories)',
  ROUND(AVG(earn_rate_mpd), 2)::TEXT
FROM public.earn_rules
WHERE effective_to IS NULL

UNION ALL

SELECT
  'Max earn rate (any card, any category)',
  MAX(earn_rate_mpd)::TEXT
FROM public.earn_rules
WHERE effective_to IS NULL

UNION ALL

SELECT
  'Min earn rate (any card, any category)',
  MIN(earn_rate_mpd)::TEXT
FROM public.earn_rules
WHERE effective_to IS NULL;
