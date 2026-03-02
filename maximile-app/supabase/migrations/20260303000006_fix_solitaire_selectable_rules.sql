-- =============================================================================
-- Migration: Fix UOB Lady's Solitaire user-selectable bonus rules
-- =============================================================================
-- 1. Fix condition key: 'selectable_category' → 'user_selectable' on existing
--    bonus rules (dining, general, online) so recommend() gates them properly
-- 2. Add missing bonus rules for groceries, transport, travel at 4.0 mpd
-- 3. Delete duplicate base-rate rows (UOB Preferred Platinum groceries)
-- =============================================================================

BEGIN;

-- ============================================================
-- SECTION 1: Fix condition key on existing Solitaire bonus rules
-- The recommend() function checks conditions->>'user_selectable'
-- but these rules used 'selectable_category' instead.
-- ============================================================

-- Dining
UPDATE public.earn_rules
SET conditions = jsonb_set(
      conditions - 'selectable_category' - 'max_selected',
      '{user_selectable}', '"true"'
    ),
    updated_at = NOW()
WHERE card_id = '00000000-0000-0000-0003-000000000022'
  AND category_id = 'dining'
  AND is_bonus = TRUE;

-- General
UPDATE public.earn_rules
SET conditions = jsonb_set(
      conditions - 'selectable_category' - 'max_selected',
      '{user_selectable}', '"true"'
    ),
    updated_at = NOW()
WHERE card_id = '00000000-0000-0000-0003-000000000022'
  AND category_id = 'general'
  AND is_bonus = TRUE;

-- Online
UPDATE public.earn_rules
SET conditions = jsonb_set(
      conditions - 'selectable_category' - 'max_selected',
      '{user_selectable}', '"true"'
    ),
    updated_at = NOW()
WHERE card_id = '00000000-0000-0000-0003-000000000022'
  AND category_id = 'online'
  AND is_bonus = TRUE;

-- ============================================================
-- SECTION 2: Add missing bonus rules for Solitaire
-- Groceries, Transport, Travel — 4.0 mpd user-selectable
-- ============================================================

-- Groceries — 4.0 mpd (user-selectable)
INSERT INTO public.earn_rules (
  card_id, category_id, earn_rate_mpd, is_bonus, conditions, conditions_note,
  effective_from, effective_to
) VALUES (
  '00000000-0000-0000-0003-000000000022', 'groceries', 4.0, TRUE,
  '{"user_selectable":"true"}'::jsonb,
  'Earn 4 mpd (10X UNI$) if groceries is one of TWO selected preferred categories. 0.4 mpd otherwise. Cap: $750/mo per category. [VERIFIED]',
  '2026-03-03', NULL
);

-- Transport — 4.0 mpd (user-selectable)
INSERT INTO public.earn_rules (
  card_id, category_id, earn_rate_mpd, is_bonus, conditions, conditions_note,
  effective_from, effective_to
) VALUES (
  '00000000-0000-0000-0003-000000000022', 'transport', 4.0, TRUE,
  '{"user_selectable":"true"}'::jsonb,
  'Earn 4 mpd (10X UNI$) if transport is one of TWO selected preferred categories. 0.4 mpd otherwise. Cap: $750/mo per category. [VERIFIED]',
  '2026-03-03', NULL
);

-- Travel — 4.0 mpd (user-selectable)
INSERT INTO public.earn_rules (
  card_id, category_id, earn_rate_mpd, is_bonus, conditions, conditions_note,
  effective_from, effective_to
) VALUES (
  '00000000-0000-0000-0003-000000000022', 'travel', 4.0, TRUE,
  '{"user_selectable":"true"}'::jsonb,
  'Earn 4 mpd (10X UNI$) if travel is one of TWO selected preferred categories. 0.4 mpd otherwise. Cap: $750/mo per category. [VERIFIED]',
  '2026-03-03', NULL
);

-- ============================================================
-- SECTION 3: Delete duplicate base-rate rows
-- UOB Preferred Platinum has 2 identical groceries base rows
-- ============================================================

DELETE FROM public.earn_rules
WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (
      PARTITION BY card_id, category_id, is_bonus, earn_rate_mpd
      ORDER BY created_at
    ) AS rn
    FROM public.earn_rules
    WHERE card_id = '00000000-0000-0000-0002-000000000020'
      AND category_id = 'groceries'
      AND is_bonus = FALSE
  ) sub
  WHERE sub.rn > 1
);

COMMIT;
