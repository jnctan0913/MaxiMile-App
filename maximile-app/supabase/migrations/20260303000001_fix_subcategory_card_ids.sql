-- =============================================================================
-- Migration: Add missing subcategory earn_rules for SC Smart Card (card 26)
-- =============================================================================
-- The original migration 20260301000000 inserted subcategory earn_rules for
-- cards 21-30 but skipped card 26 (SC Smart Card) due to an off-by-one error
-- in the original seed mapping.
--
-- Remote DB card mapping (verified via API):
--   0003-000000000026 = Standard Chartered Smart Card (base_rate_mpd = 0.40)
--
-- This migration adds the 5 missing subcategory rows for this card.
-- =============================================================================

BEGIN;

-- Guard: delete any existing subcategory rows to avoid duplicates on re-run
DELETE FROM public.earn_rules
WHERE category_id = 'bills'
  AND is_bonus = FALSE
  AND conditions->>'subcategory' IS NOT NULL
  AND card_id = '00000000-0000-0000-0003-000000000026';

-- Insert subcategory earn_rules for SC Smart Card
INSERT INTO public.earn_rules (card_id, category_id, earn_rate_mpd, is_bonus, conditions, conditions_note, effective_from, effective_to)
VALUES
('00000000-0000-0000-0003-000000000026', 'bills', 0.0, FALSE, '{"subcategory": "utilities"}',
 'SP Group / utility payments excluded by SC. [VERIFIED]',
 '2026-03-01'::date, NULL),
('00000000-0000-0000-0003-000000000026', 'bills', 0.0, FALSE, '{"subcategory": "education"}',
 'School fees (MCCs 8211/8220) excluded by SC. [VERIFIED]',
 '2026-03-01'::date, NULL),
('00000000-0000-0000-0003-000000000026', 'bills', 0.0, FALSE, '{"subcategory": "hospital"}',
 'Hospital bill payments earn 0 mpd. MCC 8062 excluded by bank. [VERIFIED]',
 '2026-03-01'::date, NULL),
('00000000-0000-0000-0003-000000000026', 'bills', 0.4, FALSE, '{"subcategory": "pharmacy"}',
 'Pharmacy (MCC 5912) earns base rate 0.4 mpd. [VERIFIED]',
 '2026-03-01'::date, NULL),
('00000000-0000-0000-0003-000000000026', 'bills', 0.4, FALSE, '{"subcategory": "telco"}',
 'Telco payments earn base rate 0.4 mpd. [VERIFIED]',
 '2026-03-01'::date, NULL);

COMMIT;
