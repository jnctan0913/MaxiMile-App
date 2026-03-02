-- =============================================================================
-- Migration: Delete duplicate bonus earn_rules & fix Maybank Horizon utilities
-- =============================================================================
-- 1. Maybank Horizon Visa Signature (0002-000000000016) has utilities
--    subcategory rate set to 0.40 instead of 0.0 (should be excluded).
--
-- 2. 32 exact duplicate bonus earn_rules exist across multiple categories
--    (dining, travel, online, groceries, transport, petrol, general).
--    These cause the recommend() LEFT JOIN to fan out, producing duplicate
--    card rows in the results (e.g., 50 rows for dining instead of 30).
-- =============================================================================

BEGIN;

-- Step 1: Fix Maybank Horizon utilities rate (0.40 → 0.0)
UPDATE public.earn_rules
SET earn_rate_mpd = 0.0,
    conditions_note = 'SP Group / utility payments excluded by Maybank. [VERIFIED]'
WHERE card_id = '00000000-0000-0000-0002-000000000016'
  AND category_id = 'bills'
  AND is_bonus = FALSE
  AND conditions->>'subcategory' = 'utilities';

-- Step 2: Delete 32 duplicate bonus earn_rules (keep one of each pair)
DELETE FROM public.earn_rules
WHERE id IN (
  'eb8dbd80-83f4-4954-ae9e-38de6cbf2376',
  '6beb32e3-735f-4b16-bb76-0c0d758d3742',
  '03188f78-4b3b-4416-9445-37127bfb468a',
  'ea13ea89-131e-4a8e-89fb-fa63bec2874e',
  'c99ab691-32d6-4bc2-a5f4-1e48ceab3e99',
  '51259c52-26ac-4039-83f4-e0519debe901',
  '9b59eea5-568c-4109-ae04-c3d32f99a92a',
  '4fdb1375-a6fa-41de-b2bd-582dd75216ae',
  '1a05983e-bb43-4bbc-bf7c-aa5cb779e217',
  '35602699-469d-43be-994b-7af2b1fa1fdc',
  '2dbcf10b-681c-405e-82f7-dd896217e2f2',
  'bbcc8cf2-8f56-4d39-939b-51e016c75a27',
  '98c0e40f-f708-44be-9744-001a36b711a9',
  '36847c40-d541-48bf-bc93-ce75f9c2ff3c',
  '23a8e6a5-430a-4e83-a567-683c12e91b30',
  '5529ce19-b705-4ad9-87a8-65bff1c08027',
  '13d0a388-763e-4f50-8929-f9c22612802b',
  '9155fba5-31c6-4451-abd6-0553ae2f4f32',
  '2710e3ea-0670-4f48-a7a2-c3f404189396',
  '78cf0b4d-4e99-424a-907c-4e5060716fb6',
  '6f8d2c8e-99b7-4f41-a155-45537f78ec74',
  'cea103c0-1c39-4ab4-9ae3-ef42b1645f7b',
  'b8bf73af-3135-48dc-a021-f71ae2eda92a',
  '7c224380-0e20-4b57-a636-79fd4bb77f9b',
  '7facf568-6991-4d04-99cf-e5304495f431',
  '0773beb1-6a4a-4351-bbde-d8f44b336dee',
  '58d5ea27-9398-4cd5-87fe-7bf347192218',
  '81b69dbf-c058-4aed-8a9d-c832e88c186d',
  '1b65ec8a-cd5b-4fe9-857f-6c7f74896881',
  '7e30f595-e20f-49dd-8255-1e7552d58c0d',
  'ceed15ac-d052-4482-aaef-de4b593bc6e5',
  '9f098fd7-d9f7-4833-90f1-d81fadf12c6a'
);

COMMIT;
