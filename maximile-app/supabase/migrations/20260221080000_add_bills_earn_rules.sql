-- =============================================================================
-- Migration: Add 'bills' category and earn rules for all 20 cards
-- =============================================================================
-- The frontend has a 'bills' category but no earn rules exist in the database.
-- This migration adds the bills category and base-rate earn rules for all 20 cards.
-- All bills earn rules use the card's base rate (is_bonus=FALSE) since no SG card
-- currently offers bonus miles on utility/telco/insurance payments.
-- =============================================================================

BEGIN;

-- ============================================================
-- 1. Insert 'bills' category (if not already present)
-- ============================================================

INSERT INTO public.categories (id, name, display_order, icon, mccs, description)
VALUES (
  'bills',
  'Bills',
  5,
  'receipt',
  ARRAY[
    '4812',  -- Telecommunication Equipment and Telephone Sales
    '4814',  -- Telecommunication Services
    '4899',  -- Cable, Satellite, Pay Television, Radio Services
    '4900',  -- Utilities — Electric, Gas, Water, Sanitary
    '6300',  -- Insurance Sales, Underwriting
    '6381',  -- Insurance Premiums
    '6399',  -- Insurance — Not Elsewhere Classified
    '4816'   -- Computer Network/Information Services (internet providers)
  ],
  'Utilities, insurance, telco, recurring payments'
)
ON CONFLICT (id) DO UPDATE SET
  name          = EXCLUDED.name,
  display_order = EXCLUDED.display_order,
  icon          = EXCLUDED.icon,
  mccs          = EXCLUDED.mccs,
  description   = EXCLUDED.description,
  updated_at    = NOW();

-- ============================================================
-- 2. Insert bills earn rules for all 20 cards (base rate only)
-- ============================================================
-- Each card earns its base_rate_mpd on bills (no bonus).

INSERT INTO public.earn_rules (card_id, category_id, earn_rate_mpd, is_bonus, conditions, conditions_note, source_url)
VALUES
-- Card 1: DBS Altitude Visa (base 1.2 mpd)
('00000000-0000-0000-0001-000000000001', 'bills', 1.2, FALSE, '{}', 'Base rate on bills/utilities.', NULL),
-- Card 2: Citi PremierMiles Visa (base 1.2 mpd)
('00000000-0000-0000-0001-000000000002', 'bills', 1.2, FALSE, '{}', 'Base rate on bills/utilities.', NULL),
-- Card 3: UOB PRVI Miles Visa (base 1.4 mpd)
('00000000-0000-0000-0001-000000000003', 'bills', 1.4, FALSE, '{}', 'Base rate on bills/utilities.', NULL),
-- Card 4: OCBC 90N Visa (base 1.2 mpd)
('00000000-0000-0000-0001-000000000004', 'bills', 1.2, FALSE, '{}', 'Base rate on bills/utilities.', NULL),
-- Card 5: KrisFlyer UOB Credit Card (base 1.2 mpd)
('00000000-0000-0000-0001-000000000005', 'bills', 1.2, FALSE, '{}', 'Base rate on bills/utilities.', NULL),
-- Card 6: HSBC Revolution (base 0.4 mpd)
('00000000-0000-0000-0001-000000000006', 'bills', 0.4, FALSE, '{}', 'Base rate on bills/utilities.', NULL),
-- Card 7: Amex KrisFlyer Ascend (base 1.1 mpd)
('00000000-0000-0000-0001-000000000007', 'bills', 1.1, FALSE, '{}', 'Base rate on bills/utilities.', NULL),
-- Card 8: BOC Elite Miles World Mastercard (base 1.5 mpd)
('00000000-0000-0000-0001-000000000008', 'bills', 1.5, FALSE, '{}', 'Base rate on bills/utilities.', NULL),
-- Card 9: SC Visa Infinite (base 1.4 mpd)
('00000000-0000-0000-0001-000000000009', 'bills', 1.4, FALSE, '{}', 'Base rate on bills/utilities.', NULL),
-- Card 10: DBS Woman's World Card (base 0.4 mpd)
('00000000-0000-0000-0001-000000000010', 'bills', 0.4, FALSE, '{}', 'Base rate on bills/utilities.', NULL),
-- Card 11: UOB Lady's Card (base 0.4 mpd)
('00000000-0000-0000-0002-000000000011', 'bills', 0.4, FALSE, '{}', 'Base rate on bills/utilities.', NULL),
-- Card 12: OCBC Titanium Rewards Card (base 0.4 mpd)
('00000000-0000-0000-0002-000000000012', 'bills', 0.4, FALSE, '{}', 'Base rate on bills/utilities.', NULL),
-- Card 13: HSBC TravelOne Credit Card (base 1.0 mpd)
('00000000-0000-0000-0002-000000000013', 'bills', 1.0, FALSE, '{}', 'Base rate on bills/utilities.', NULL),
-- Card 14: Amex KrisFlyer Credit Card (base 1.1 mpd)
('00000000-0000-0000-0002-000000000014', 'bills', 1.1, FALSE, '{}', 'Base rate on bills/utilities.', NULL),
-- Card 15: SC X Card (base 0.4 mpd)
('00000000-0000-0000-0002-000000000015', 'bills', 0.4, FALSE, '{}', 'Base rate on bills/utilities.', NULL),
-- Card 16: Maybank Horizon Visa Signature (base 0.4 mpd)
('00000000-0000-0000-0002-000000000016', 'bills', 0.4, FALSE, '{}', 'Base rate on bills/utilities.', NULL),
-- Card 17: Maybank FC Barcelona Visa Signature (base 0.4 mpd)
('00000000-0000-0000-0002-000000000017', 'bills', 0.4, FALSE, '{}', 'Base rate on bills/utilities.', NULL),
-- Card 18: Citi Rewards Card (base 0.4 mpd)
('00000000-0000-0000-0002-000000000018', 'bills', 0.4, FALSE, '{}', 'Base rate on bills/utilities.', NULL),
-- Card 19: POSB Everyday Card (base 0.4 mpd)
('00000000-0000-0000-0002-000000000019', 'bills', 0.4, FALSE, '{}', 'Base rate on bills/utilities.', NULL),
-- Card 20: UOB Preferred Platinum Visa (base 0.4 mpd)
('00000000-0000-0000-0002-000000000020', 'bills', 0.4, FALSE, '{}', 'Base rate on bills/utilities.', NULL)

ON CONFLICT (card_id, category_id, is_bonus, effective_from) DO UPDATE SET
  earn_rate_mpd   = EXCLUDED.earn_rate_mpd,
  conditions      = EXCLUDED.conditions,
  conditions_note = EXCLUDED.conditions_note,
  source_url      = EXCLUDED.source_url,
  updated_at      = NOW();

COMMIT;
