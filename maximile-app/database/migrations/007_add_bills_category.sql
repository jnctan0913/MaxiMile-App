-- =============================================================================
-- Migration 007: Add 'bills' category
-- =============================================================================
-- The app defines 'bills' as a spend category but the database only had
-- 'petrol'. This adds the missing 'bills' category so the recommend() RPC
-- no longer rejects it with "Invalid category: bills".
-- =============================================================================

INSERT INTO public.categories (id, name, display_order, icon, mccs, description)
VALUES (
  'bills',
  'Bills',
  5,
  'receipt',
  ARRAY[
    '4812',  -- Telecommunication Equipment and Telephone Sales
    '4814',  -- Telecommunication Services (Singtel, Starhub, M1)
    '4899',  -- Cable, Satellite, Pay Television, Radio
    '4900',  -- Utilities — Electric, Gas, Water, Sanitary
    '6300',  -- Insurance Sales, Underwriting, Premiums
    '6381',  -- Insurance Premiums
    '6399',  -- Insurance — Not Elsewhere Classified
    '4816'   -- Computer Network / Information Services (ISPs)
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
