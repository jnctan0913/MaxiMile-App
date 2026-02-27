-- =============================================================================
-- Migration: Insert MileLion review sources + pause bank T&C sources
-- =============================================================================
-- 1. Pause all existing bank T&C sources (kept as backup, not actively checked)
-- 2. Insert 24 MileLion review page sources (one per card review URL)
-- 3. Insert 1 MileLion guide page fallback (for 5 cards without dedicated reviews)
--
-- MileLion pages include JSON-LD with dateModified metadata, enabling efficient
-- date-gated change detection without full content hashing.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Step 1: Pause all bank T&C sources
-- ---------------------------------------------------------------------------

UPDATE source_configs
SET status = 'paused',
    notes = COALESCE(notes, '') || ' [Paused: migrated to MileLion review monitoring 2026-02-28]'
WHERE source_type IN ('bank_tc_pdf', 'bank_tc_page', 'bank_index_page')
  AND status = 'active';

-- ---------------------------------------------------------------------------
-- Step 2: Insert MileLion review sources (24 dedicated review pages)
-- ---------------------------------------------------------------------------

INSERT INTO source_configs (url, bank_name, source_type, scrape_method, css_selector, check_interval, status, card_name, notes)
VALUES
  -- 1. DBS Altitude Visa
  ('https://milelion.com/2025/06/25/review-dbs-altitude-card/',
   'DBS', 'milelion_review', 'http', NULL, '7 days', 'active',
   'DBS Altitude Visa', 'MileLion review page'),

  -- 2. Citi PremierMiles Visa
  ('https://milelion.com/2025/06/29/review-citi-premiermiles-card/',
   'Citibank', 'milelion_review', 'http', NULL, '7 days', 'active',
   'Citi PremierMiles Card', 'MileLion review page'),

  -- 3. UOB PRVI Miles Visa
  ('https://milelion.com/2026/02/04/review-uob-prvi-miles-card/',
   'UOB', 'milelion_review', 'http', NULL, '7 days', 'active',
   'UOB PRVI Miles Visa', 'MileLion review page'),

  -- 4. OCBC 90N Visa
  ('https://milelion.com/2025/09/30/review-ocbc-90n-card/',
   'OCBC', 'milelion_review', 'http', NULL, '7 days', 'active',
   'OCBC 90°N Visa', 'MileLion review page'),

  -- 5. KrisFlyer UOB Card
  ('https://milelion.com/2025/06/22/review-krisflyer-uob-credit-card/',
   'UOB', 'milelion_review', 'http', NULL, '7 days', 'active',
   'KrisFlyer UOB Card', 'MileLion review page'),

  -- 6. HSBC Revolution Card
  ('https://milelion.com/2025/09/13/review-hsbc-revolution-card/',
   'HSBC', 'milelion_review', 'http', NULL, '7 days', 'active',
   'HSBC Revolution Card', 'MileLion review page'),

  -- 7. Amex KrisFlyer Ascend
  ('https://milelion.com/2025/11/22/review-amex-krisflyer-ascend/',
   'Amex', 'milelion_review', 'http', NULL, '7 days', 'active',
   'Amex KrisFlyer Ascend', 'MileLion review page'),

  -- 8. SC Visa Infinite Card
  ('https://milelion.com/2025/11/13/review-standard-chartered-visa-infinite-card/',
   'Standard Chartered', 'milelion_review', 'http', NULL, '7 days', 'active',
   'SC Visa Infinite Card', 'MileLion review page'),

  -- 9. DBS Woman's World Card
  ('https://milelion.com/2025/08/09/review-dbs-womans-world-card/',
   'DBS', 'milelion_review', 'http', NULL, '7 days', 'active',
   'DBS Woman''s World Card', 'MileLion review page'),

  -- 10. UOB Lady's Card + Lady's Solitaire (shared review page)
  ('https://milelion.com/2025/08/12/review-uob-ladys-card-ladys-solitaire/',
   'UOB', 'milelion_review', 'http', NULL, '7 days', 'active',
   'UOB Lady''s Card', 'MileLion review page (also covers Lady''s Solitaire)'),

  -- 11. OCBC Titanium Rewards
  ('https://milelion.com/2025/07/22/review-ocbc-titanium-rewards-card/',
   'OCBC', 'milelion_review', 'http', NULL, '7 days', 'active',
   'OCBC Titanium Rewards', 'MileLion review page'),

  -- 12. HSBC TravelOne Card
  ('https://milelion.com/2025/06/06/review-hsbc-travelone-card/',
   'HSBC', 'milelion_review', 'http', NULL, '7 days', 'active',
   'HSBC TravelOne Card', 'MileLion review page'),

  -- 13. Amex KrisFlyer Credit Card
  ('https://milelion.com/2025/11/18/review-amex-krisflyer-credit-card/',
   'Amex', 'milelion_review', 'http', NULL, '7 days', 'active',
   'Amex KrisFlyer Credit Card', 'MileLion review page'),

  -- 14. SC X Card
  ('https://milelion.com/2022/08/28/review-standard-chartered-x-card/',
   'Standard Chartered', 'milelion_review', 'http', NULL, '7 days', 'active',
   'SC X Card', 'MileLion review page'),

  -- 15. Maybank Horizon Visa Signature
  ('https://milelion.com/2025/09/26/review-maybank-horizon-visa-signature-card/',
   'Maybank', 'milelion_review', 'http', NULL, '7 days', 'active',
   'Maybank Horizon Visa Signature', 'MileLion review page'),

  -- 16. Citi Rewards Card
  ('https://milelion.com/2026/02/27/review-citi-rewards-credit-card/',
   'Citibank', 'milelion_review', 'http', NULL, '7 days', 'active',
   'Citi Rewards Card', 'MileLion review page'),

  -- 17. UOB Preferred Platinum Visa
  ('https://milelion.com/2025/10/08/review-uob-preferred-platinum-visa-card/',
   'UOB', 'milelion_review', 'http', NULL, '7 days', 'active',
   'UOB Preferred Platinum Visa', 'MileLion review page'),

  -- 18. Maybank World Mastercard
  ('https://milelion.com/2025/10/12/review-maybank-world-mastercard/',
   'Maybank', 'milelion_review', 'http', NULL, '7 days', 'active',
   'Maybank World Mastercard', 'MileLion review page'),

  -- 19. DBS Vantage Visa Infinite
  ('https://milelion.com/2025/07/25/review-dbs-vantage-card/',
   'DBS', 'milelion_review', 'http', NULL, '7 days', 'active',
   'DBS Vantage Visa Infinite', 'MileLion review page'),

  -- 20. OCBC VOYAGE Card
  ('https://milelion.com/2025/11/26/review-ocbc-voyage-card/',
   'OCBC', 'milelion_review', 'http', NULL, '7 days', 'active',
   'OCBC VOYAGE Card', 'MileLion review page'),

  -- 21. SC Beyond Card
  ('https://milelion.com/2026/02/08/review-standard-chartered-beyond-card/',
   'Standard Chartered', 'milelion_review', 'http', NULL, '7 days', 'active',
   'SC Beyond Card', 'MileLion review page'),

  -- 22. HSBC Premier Mastercard
  ('https://milelion.com/2025/10/14/review-hsbc-premier-mastercard/',
   'HSBC', 'milelion_review', 'http', NULL, '7 days', 'active',
   'HSBC Premier Mastercard', 'MileLion review page'),

  -- 23. Maybank XL Rewards Card
  ('https://milelion.com/2025/08/18/review-maybank-xl-rewards-card/',
   'Maybank', 'milelion_review', 'http', NULL, '7 days', 'active',
   'Maybank XL Rewards Card', 'MileLion review page')

ON CONFLICT (url) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Step 3: Insert MileLion guide page fallback (5 cards without dedicated reviews)
-- ---------------------------------------------------------------------------
-- These cards share a single guide page URL. We monitor it once, and the AI
-- classifier will check for changes relevant to any of these 5 cards.

INSERT INTO source_configs (url, bank_name, source_type, scrape_method, css_selector, check_interval, status, card_name, notes)
VALUES
  ('https://milelion.com/credit-cards/guide/',
   'Various', 'milelion_review', 'http', NULL, '7 days', 'active',
   NULL, 'MileLion guide page fallback for: BOC Elite Miles, Maybank FC Barcelona, POSB Everyday, UOB Visa Signature, SC Journey Card')
ON CONFLICT (url) DO NOTHING;
