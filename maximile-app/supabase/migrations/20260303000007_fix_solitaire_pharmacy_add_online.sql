-- =============================================================================
-- Migration: Fix Solitaire pharmacy + add online to selectable categories
-- =============================================================================
-- 1. Remove user_selectable from pharmacy bonus rule — pharmacy 4.0 mpd
--    should apply unconditionally for Solitaire holders
-- 2. (Online already has a bonus rule with user_selectable — UI fix only)
-- =============================================================================

BEGIN;

-- Remove user_selectable condition from pharmacy bonus rule
-- Pharmacy earns 4.0 mpd as part of the broader 10X category bonus,
-- not as a separate user-selectable category
UPDATE public.earn_rules
SET conditions = '{"subcategory":"pharmacy"}'::jsonb,
    conditions_note = 'Earn 4 mpd (10X UNI$) at pharmacies (Guardian, Watsons, Unity). Cap: $750/mo per category. [VERIFIED]',
    updated_at = NOW()
WHERE card_id = '00000000-0000-0000-0003-000000000022'
  AND category_id = 'bills'
  AND is_bonus = TRUE
  AND conditions->>'subcategory' = 'pharmacy';

COMMIT;
