-- =============================================================================
-- MaxiMile — Fix: Correct Card → Miles Program Mappings
-- =============================================================================
-- Description:  Fixes incorrect card→program mappings. Cards earning bank points
--               were wrongly mapped to airline programs. This migration:
--               1. Adds missing bank points programs (HSBC Rewards, etc.)
--               2. Corrects card mappings to their actual earning programs
--               3. Ensures onboarding shows correct programs
--
-- Issue:  DBS Altitude was mapped to KrisFlyer (wrong - earns DBS Points)
--         HSBC Revolution was mapped to KrisFlyer (wrong - earns HSBC Rewards)
-- =============================================================================

BEGIN;

-- ==========================================================================
-- SECTION 1: Add missing bank points programs
-- ==========================================================================

INSERT INTO public.miles_programs (name, airline, program_type, icon_url) VALUES
  ('HSBC Rewards', NULL, 'bank_points', NULL),
  ('Standard Chartered 360° Rewards', NULL, 'bank_points', NULL)
ON CONFLICT (name) DO NOTHING;

COMMENT ON TABLE public.miles_programs
  IS 'Loyalty programs (airline miles + bank reward points). Cards earn into these programs.';


-- ==========================================================================
-- SECTION 2: Fix incorrect card mappings
-- ==========================================================================

-- DBS Altitude earns DBS Points (transferable), NOT KrisFlyer directly
UPDATE public.cards
SET miles_program_id = (SELECT id FROM public.miles_programs WHERE name = 'DBS Points')
WHERE name ILIKE '%DBS Altitude%';

-- HSBC Revolution earns HSBC Rewards (transferable), NOT KrisFlyer directly
UPDATE public.cards
SET miles_program_id = (SELECT id FROM public.miles_programs WHERE name = 'HSBC Rewards')
WHERE name ILIKE '%HSBC Revolution%';

-- Standard Chartered X earns 360° Rewards
UPDATE public.cards
SET miles_program_id = (SELECT id FROM public.miles_programs WHERE name = 'Standard Chartered 360° Rewards')
WHERE (name ILIKE '%Standard Chartered X%' OR name ILIKE '%SC X Card%')
  AND miles_program_id != (SELECT id FROM public.miles_programs WHERE name = 'Standard Chartered 360° Rewards');


-- ==========================================================================
-- SECTION 3: Verify KrisFlyer direct-earn cards (keep these)
-- ==========================================================================
-- These cards genuinely earn KrisFlyer miles directly (co-branded cards):
-- ✓ American Express KrisFlyer Ascend
-- ✓ KrisFlyer UOB Credit Card
-- ✓ UOB PRVI Miles Card
-- ✓ DBS Woman's World Card
-- ✓ BOC Elite Miles World Mastercard
-- ✓ 90°N Card
-- (No changes needed - already correct)


-- ==========================================================================
-- SECTION 4: Add transfer partners for bank programs → airlines
-- ==========================================================================
-- These allow users to see which airline programs they can reach via transfers

-- DBS Points → Multiple airlines
INSERT INTO public.transfer_partners (
  source_program_id,
  destination_program_id,
  conversion_rate_from,
  conversion_rate_to,
  transfer_fee_sgd,
  min_transfer_amount,
  last_verified_at
) VALUES
  -- DBS Points → KrisFlyer (1:1)
  (
    (SELECT id FROM public.miles_programs WHERE name = 'DBS Points'),
    (SELECT id FROM public.miles_programs WHERE name = 'KrisFlyer'),
    1, 1, 0, 5000, NOW()
  )
ON CONFLICT DO NOTHING;

-- HSBC Rewards → KrisFlyer
INSERT INTO public.transfer_partners (
  source_program_id,
  destination_program_id,
  conversion_rate_from,
  conversion_rate_to,
  transfer_fee_sgd,
  min_transfer_amount,
  last_verified_at
) VALUES
  (
    (SELECT id FROM public.miles_programs WHERE name = 'HSBC Rewards'),
    (SELECT id FROM public.miles_programs WHERE name = 'KrisFlyer'),
    2, 1, 0, 10000, NOW()
  )
ON CONFLICT DO NOTHING;

-- Citi Miles → KrisFlyer
INSERT INTO public.transfer_partners (
  source_program_id,
  destination_program_id,
  conversion_rate_from,
  conversion_rate_to,
  transfer_fee_sgd,
  min_transfer_amount,
  last_verified_at
) VALUES
  (
    (SELECT id FROM public.miles_programs WHERE name = 'Citi Miles'),
    (SELECT id FROM public.miles_programs WHERE name = 'KrisFlyer'),
    1, 1, 25.00, 5000, NOW()
  )
ON CONFLICT DO NOTHING;


COMMIT;

-- ==========================================================================
-- Verification queries (run after applying):
-- ==========================================================================
-- Check DBS Altitude mapping:
-- SELECT c.name, mp.name as program, mp.program_type
-- FROM cards c
-- JOIN miles_programs mp ON c.miles_program_id = mp.id
-- WHERE c.name ILIKE '%DBS Altitude%';
-- Expected: DBS Altitude | DBS Points | bank_points
--
-- Check HSBC Revolution mapping:
-- SELECT c.name, mp.name as program, mp.program_type
-- FROM cards c
-- JOIN miles_programs mp ON c.miles_program_id = mp.id
-- WHERE c.name ILIKE '%HSBC Revolution%';
-- Expected: HSBC Revolution | HSBC Rewards | bank_points
