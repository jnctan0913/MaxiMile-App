-- =============================================================================
-- Migration: Pharmacy & Hospital Bonus Earn Rules + Private Hospital Tags
-- =============================================================================
-- 1. Pharmacy bonus earn_rules (is_bonus=TRUE) for cards that earn 4.0 mpd
-- 2. Hospital HealthHub bonus earn_rules (is_bonus=TRUE) for 4.0 mpd via app
-- 3. Update existing hospital base rules for HSBC/Amex → "Private hospital only"
-- =============================================================================

BEGIN;

-- ============================================================
-- SECTION 1: Pharmacy bonus earn_rules (4.0 mpd)
-- ============================================================

-- HSBC Revolution — 4.0 mpd on pharmacy (contactless)
-- Cap: $1,000/mo shared across bonus categories
INSERT INTO public.earn_rules (
  card_id, category_id, earn_rate_mpd, is_bonus, conditions, conditions_note,
  effective_from, effective_to
) VALUES (
  '00000000-0000-0000-0001-000000000006', 'bills', 4.0, TRUE,
  '{"subcategory":"pharmacy","contactless":true}'::jsonb,
  'Tap to pay at pharmacy (MCC 5912) for 4 mpd. Cap: $1,000/mo shared across bonus categories. [VERIFIED]',
  '2026-03-03', NULL
);

-- OCBC Titanium Rewards — 4.0 mpd on pharmacy
-- Cap: $1,000/mo shared across bonus categories
INSERT INTO public.earn_rules (
  card_id, category_id, earn_rate_mpd, is_bonus, conditions, conditions_note,
  effective_from, effective_to
) VALUES (
  '00000000-0000-0000-0002-000000000012', 'bills', 4.0, TRUE,
  '{"subcategory":"pharmacy"}'::jsonb,
  'Pharmacy (MCC 5912) earns 4 mpd. Cap: $1,000/mo shared across bonus categories. [VERIFIED]',
  '2026-03-03', NULL
);

-- UOB Lady''s Card — 4.0 mpd on pharmacy (user-selectable: Beauty & Wellness)
-- Cap: $1,000/mo
INSERT INTO public.earn_rules (
  card_id, category_id, earn_rate_mpd, is_bonus, conditions, conditions_note,
  effective_from, effective_to
) VALUES (
  '00000000-0000-0000-0002-000000000011', 'bills', 4.0, TRUE,
  '{"subcategory":"pharmacy","user_selectable":"true"}'::jsonb,
  'Select Beauty & Wellness as your 10X category. Pharmacy (MCC 5912) earns 4 mpd. Cap: $1,000/mo. [VERIFIED]',
  '2026-03-03', NULL
);

-- UOB Lady''s Solitaire — 4.0 mpd on pharmacy (user-selectable: Beauty & Wellness)
-- Cap: $750/mo
INSERT INTO public.earn_rules (
  card_id, category_id, earn_rate_mpd, is_bonus, conditions, conditions_note,
  effective_from, effective_to
) VALUES (
  '00000000-0000-0000-0003-000000000022', 'bills', 4.0, TRUE,
  '{"subcategory":"pharmacy","user_selectable":"true"}'::jsonb,
  'Select Beauty & Wellness as your 10X category. Pharmacy (MCC 5912) earns 4 mpd. Cap: $750/mo. [VERIFIED]',
  '2026-03-03', NULL
);

-- ============================================================
-- SECTION 2: Hospital HealthHub bonus earn_rules (4.0 mpd)
-- Pay via HealthHub app → codes as MCC 8099 (online)
-- ============================================================

-- Citi Rewards — 4.0 mpd on hospital (via HealthHub)
-- Cap: $1,000/mo shared with online
INSERT INTO public.earn_rules (
  card_id, category_id, earn_rate_mpd, is_bonus, conditions, conditions_note,
  effective_from, effective_to
) VALUES (
  '00000000-0000-0000-0002-000000000018', 'bills', 4.0, TRUE,
  '{"subcategory":"hospital"}'::jsonb,
  'Pay via HealthHub app — codes as online (MCC 8099). Cap: $1,000/mo shared with online. [VERIFIED]',
  '2026-03-03', NULL
);

-- DBS Woman''s World — 4.0 mpd on hospital (via HealthHub)
-- Cap: $2,000/mo
INSERT INTO public.earn_rules (
  card_id, category_id, earn_rate_mpd, is_bonus, conditions, conditions_note,
  effective_from, effective_to
) VALUES (
  '00000000-0000-0000-0001-000000000010', 'bills', 4.0, TRUE,
  '{"subcategory":"hospital"}'::jsonb,
  'Pay via HealthHub app — codes as online (MCC 8099). Cap: $2,000/mo. [VERIFIED]',
  '2026-03-03', NULL
);

-- HSBC Revolution — 4.0 mpd on hospital (via HealthHub)
-- Cap: $1,000/mo shared across bonus categories
INSERT INTO public.earn_rules (
  card_id, category_id, earn_rate_mpd, is_bonus, conditions, conditions_note,
  effective_from, effective_to
) VALUES (
  '00000000-0000-0000-0001-000000000006', 'bills', 4.0, TRUE,
  '{"subcategory":"hospital"}'::jsonb,
  'Pay via HealthHub app — codes as online (MCC 8099). Cap: $1,000/mo shared across bonus categories. [VERIFIED]',
  '2026-03-03', NULL
);

-- ============================================================
-- SECTION 3: Update existing hospital base rules → "Private hospital only"
-- These are is_bonus=FALSE rows with conditions->>'subcategory' = 'hospital'
-- ============================================================

-- HSBC Premier Mastercard
UPDATE public.earn_rules
SET conditions_note = 'Private hospital only. Public hospital bills (MCC 8062) excluded by HSBC. [VERIFIED]',
    updated_at = NOW()
WHERE card_id = '00000000-0000-0000-0003-000000000030'
  AND category_id = 'bills'
  AND is_bonus = FALSE
  AND conditions->>'subcategory' = 'hospital';

-- HSBC TravelOne Credit Card
UPDATE public.earn_rules
SET conditions_note = 'Private hospital only. Public hospital bills (MCC 8062) excluded by HSBC. [VERIFIED]',
    updated_at = NOW()
WHERE card_id = '00000000-0000-0000-0002-000000000013'
  AND category_id = 'bills'
  AND is_bonus = FALSE
  AND conditions->>'subcategory' = 'hospital';

-- HSBC Revolution Credit Card
UPDATE public.earn_rules
SET conditions_note = 'Private hospital only. Public hospital bills (MCC 8062) excluded by HSBC. [VERIFIED]',
    updated_at = NOW()
WHERE card_id = '00000000-0000-0000-0001-000000000006'
  AND category_id = 'bills'
  AND is_bonus = FALSE
  AND conditions->>'subcategory' = 'hospital';

-- Amex KrisFlyer Ascend
UPDATE public.earn_rules
SET conditions_note = 'Private hospital only. Public hospital bills excluded by Amex. [VERIFIED]',
    updated_at = NOW()
WHERE card_id = '00000000-0000-0000-0001-000000000007'
  AND category_id = 'bills'
  AND is_bonus = FALSE
  AND conditions->>'subcategory' = 'hospital';

-- Amex KrisFlyer Credit Card
UPDATE public.earn_rules
SET conditions_note = 'Private hospital only. Public hospital bills excluded by Amex. [VERIFIED]',
    updated_at = NOW()
WHERE card_id = '00000000-0000-0000-0002-000000000014'
  AND category_id = 'bills'
  AND is_bonus = FALSE
  AND conditions->>'subcategory' = 'hospital';

COMMIT;
