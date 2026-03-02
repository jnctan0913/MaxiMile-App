-- ============================================================
-- Migration: MileLion March 2026 Audit — Earn Rate Refresh
-- Sprint 29, Feature F36, Epic E17
-- Source: docs/technical/AUDIT_MILELION_VS_RANKINGS.md
-- ============================================================
-- 7 changes:
-- 1. DELETE DBS Altitude travel 4.0 mpd bonus (removed per MileLion)
-- 2. UPDATE HSBC Revolution conditions_note to $1,500/mo cap
-- 3. UPDATE DBS Woman's World cap $2,000 → $1,000
-- 4. INSERT UOB Lady's Card groceries bonus (4 mpd supermarkets)
-- 5. INSERT HSBC Revolution travel bonus (4 mpd direct bookings)
-- 6. INSERT KrisFlyer UOB transport bonus (2.4 mpd contactless)
-- 7. UPDATE KrisFlyer UOB transport base rule conditions_note
-- ============================================================

BEGIN;

-- ============================================================
-- 1. DBS Altitude: Remove 4.0 mpd travel bonus (P0)
-- MileLion confirms the old 6 mpd Expedia / 3 mpd online travel
-- bonuses were removed. Current rate is 1.2 mpd base only.
-- ============================================================
DELETE FROM earn_rules
WHERE card_id = '00000000-0000-0000-0001-000000000001'
  AND category_id = 'travel'
  AND is_bonus = TRUE
  AND earn_rate_mpd = 4.0;

-- Add a base-rate travel rule if one doesn't exist (fallback to card's base 1.2 mpd)
INSERT INTO earn_rules (card_id, category_id, earn_rate_mpd, is_bonus, conditions, conditions_note, source_url)
SELECT '00000000-0000-0000-0001-000000000001', 'travel', 1.2, FALSE, '{}',
  'Travel bonus removed (previously 4 mpd via online portal). Now earns base 1.2 mpd on all travel. [VERIFIED from MileLion March 2026]',
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM earn_rules
  WHERE card_id = '00000000-0000-0000-0001-000000000001'
    AND category_id = 'travel'
    AND is_bonus = FALSE
);

-- If a base travel rule already exists, update its note
UPDATE earn_rules
SET conditions_note = 'Travel bonus removed (previously 4 mpd via online portal). Now earns base 1.2 mpd on all travel. [VERIFIED from MileLion March 2026]'
WHERE card_id = '00000000-0000-0000-0001-000000000001'
  AND category_id = 'travel'
  AND is_bonus = FALSE;

-- ============================================================
-- 2. HSBC Revolution: Update conditions_note cap references (P0)
-- Cap was boosted from $1,000/mo to $1,500/mo.
-- The caps table already has $1,500 (from Sprint 25 Revo Up fix).
-- Only the conditions_note text needs updating.
-- ============================================================
UPDATE earn_rules
SET conditions_note = REPLACE(conditions_note, '$1,000/month', '$1,500/month'),
    updated_at = NOW()
WHERE card_id = '00000000-0000-0000-0001-000000000006'
  AND is_bonus = TRUE
  AND conditions_note LIKE '%$1,000/month%';

-- Also update the dining-specific note
UPDATE earn_rules
SET conditions_note = 'Earn 4 mpd on dining (10X HSBC rewards). Capped at $1,500/month across bonus categories. [VERIFIED from MileLion March 2026]',
    updated_at = NOW()
WHERE card_id = '00000000-0000-0000-0001-000000000006'
  AND category_id = 'dining'
  AND is_bonus = TRUE;

-- Update online-specific note
UPDATE earn_rules
SET conditions_note = 'Earn 4 mpd on online spend (10X HSBC rewards). Capped at $1,500/month across bonus categories. [VERIFIED from MileLion March 2026]',
    updated_at = NOW()
WHERE card_id = '00000000-0000-0000-0001-000000000006'
  AND category_id = 'online'
  AND is_bonus = TRUE;

-- ============================================================
-- 3. DBS Woman's World: Update cap from $2,000 to $1,000 (P0)
-- Cut from $2,000/mo to $1,000/mo in August 2025 per MileLion.
-- ============================================================
UPDATE caps
SET monthly_cap_amount = 1000.00,
    notes = 'Cap on 10X bonus for online spending. Cut from $2,000 to $1,000/mo in August 2025. [VERIFIED from MileLion March 2026]',
    updated_at = NOW()
WHERE card_id = '00000000-0000-0000-0001-000000000010'
  AND category_id = 'online';

-- Update earn_rules conditions_note
UPDATE earn_rules
SET conditions_note = 'Earn 4 mpd (10X DBS Points) on online spend. Capped at $1,000/month (cut from $2,000 in August 2025). [VERIFIED from MileLion March 2026]',
    updated_at = NOW()
WHERE card_id = '00000000-0000-0000-0001-000000000010'
  AND category_id = 'online'
  AND is_bonus = TRUE;

-- ============================================================
-- 4. UOB Lady's Card: Add groceries bonus rule (P1)
-- MileLion lists at 4 mpd on supermarkets via user-selectable
-- Beauty & Wellness category covering grocery MCCs.
-- ============================================================
INSERT INTO earn_rules (card_id, category_id, earn_rate_mpd, is_bonus, conditions, conditions_note, source_url)
SELECT '00000000-0000-0000-0002-000000000011', 'groceries', 4.0, TRUE,
  '{"user_selectable": true}'::jsonb,
  'Earn 4 mpd (10X UNI$) on supermarkets. Select Beauty & Wellness category to cover grocery MCCs. Cap $1,000/mo shared. [VERIFIED from MileLion March 2026]',
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM earn_rules
  WHERE card_id = '00000000-0000-0000-0002-000000000011'
    AND category_id = 'groceries'
    AND is_bonus = TRUE
);

-- ============================================================
-- 5. HSBC Revolution: Add travel bonus rule (P1)
-- 4 mpd on direct airline, hotel, car rental, cruise bookings.
-- Online travel agencies (Expedia, Airbnb) NOT eligible.
-- ============================================================
INSERT INTO earn_rules (card_id, category_id, earn_rate_mpd, is_bonus, conditions, conditions_note, source_url)
SELECT '00000000-0000-0000-0001-000000000006', 'travel', 4.0, TRUE,
  '{"contactless": true, "direct_booking_only": true}'::jsonb,
  'Earn 4 mpd on direct airline, hotel, car rental, and cruise bookings (contactless). Online travel agencies (Expedia, Airbnb) NOT eligible. Cap $1,500/mo shared across bonus categories. [VERIFIED from MileLion March 2026]',
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM earn_rules
  WHERE card_id = '00000000-0000-0000-0001-000000000006'
    AND category_id = 'travel'
    AND is_bonus = TRUE
);

-- Delete duplicate base travel rules (keep only one)
DELETE FROM earn_rules
WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY card_id, category_id, is_bonus ORDER BY created_at) AS rn
    FROM earn_rules
    WHERE card_id = '00000000-0000-0000-0001-000000000006'
      AND category_id = 'travel'
      AND is_bonus = FALSE
  ) sub WHERE rn > 1
);

-- Update the base travel rule to note the bonus exists
UPDATE earn_rules
SET conditions_note = 'Base rate 0.4 mpd. Bonus 4 mpd available for direct airline/hotel bookings (contactless). See bonus rule. [VERIFIED from MileLion March 2026]'
WHERE card_id = '00000000-0000-0000-0001-000000000006'
  AND category_id = 'travel'
  AND is_bonus = FALSE;

-- ============================================================
-- 6. KrisFlyer UOB: Add 2.4 mpd transport bonus rule (P1)
-- MileLion says 2.4 mpd uncapped on public transport with
-- $1,000/year SIA spend condition.
-- ============================================================
-- First try to UPDATE any existing transport bonus rule to 2.4 mpd
UPDATE earn_rules
SET earn_rate_mpd = 2.4,
    conditions = '{"contactless": true, "sia_spend_yearly": 1000}'::jsonb,
    conditions_note = 'Earn 2.4 mpd on public transport (contactless/SimplyGo). Requires $1,000/year SIA spend to qualify. Uncapped. [VERIFIED from MileLion March 2026]',
    updated_at = NOW()
WHERE card_id = '00000000-0000-0000-0001-000000000005'
  AND category_id = 'transport'
  AND is_bonus = TRUE;

-- If no existing bonus rule, insert a new one
INSERT INTO earn_rules (card_id, category_id, earn_rate_mpd, is_bonus, conditions, conditions_note, source_url)
SELECT '00000000-0000-0000-0001-000000000005', 'transport', 2.4, TRUE,
  '{"contactless": true, "sia_spend_yearly": 1000}'::jsonb,
  'Earn 2.4 mpd on public transport (contactless/SimplyGo). Requires $1,000/year SIA spend to qualify. Uncapped. [VERIFIED from MileLion March 2026]',
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM earn_rules
  WHERE card_id = '00000000-0000-0000-0001-000000000005'
    AND category_id = 'transport'
    AND is_bonus = TRUE
);

-- ============================================================
-- 7. Update hospital HealthHub bonus caps for consistency
-- DBS Woman's World hospital HealthHub bonus shares the online
-- cap, which is now $1,000/mo (not $2,000).
-- HSBC Revolution hospital HealthHub bonus shares the bonus cap,
-- which is $1,500/mo (not $1,000).
-- ============================================================
UPDATE earn_rules
SET conditions_note = REPLACE(conditions_note, 'Cap: $2,000/mo', 'Cap: $1,000/mo'),
    updated_at = NOW()
WHERE card_id = '00000000-0000-0000-0001-000000000010'
  AND conditions_note LIKE '%Cap: $2,000/mo%';

UPDATE earn_rules
SET conditions_note = REPLACE(conditions_note, 'Cap: $1,000/mo', 'Cap: $1,500/mo'),
    updated_at = NOW()
WHERE card_id = '00000000-0000-0000-0001-000000000006'
  AND conditions_note LIKE '%Cap: $1,000/mo%'
  AND category_id IN ('bills')
  AND conditions::text LIKE '%hospital%';

COMMIT;
