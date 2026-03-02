-- =============================================================================
-- Migration: Telco Bonus Earn Rules
-- =============================================================================
-- Cards that earn 4.0 mpd on telco bills (Singtel, StarHub, M1) when paid
-- online or via app (not recurring CC payment).
-- =============================================================================

BEGIN;

-- DBS Woman's World Card — 4.0 mpd on telco
-- Cap: $1,000/mo. Must pay via app (not recurring).
INSERT INTO public.earn_rules (
  card_id, category_id, earn_rate_mpd, is_bonus, conditions, conditions_note,
  effective_from, effective_to
) VALUES (
  '00000000-0000-0000-0001-000000000010', 'bills', 4.0, TRUE,
  '{"subcategory":"telco"}'::jsonb,
  'Pay telco bill via app (not recurring). Cap: $1,000/mo. [VERIFIED from MileLion 2026]',
  '2026-03-03', NULL
);

-- Citi Rewards Card — 4.0 mpd on telco
-- Cap: $1,000/mo shared with online. Must pay online or via app (not recurring).
INSERT INTO public.earn_rules (
  card_id, category_id, earn_rate_mpd, is_bonus, conditions, conditions_note,
  effective_from, effective_to
) VALUES (
  '00000000-0000-0000-0002-000000000018', 'bills', 4.0, TRUE,
  '{"subcategory":"telco"}'::jsonb,
  'Pay online or via app (not recurring). Cap: $1,000/mo shared with online. [VERIFIED from MileLion 2026]',
  '2026-03-03', NULL
);

COMMIT;
