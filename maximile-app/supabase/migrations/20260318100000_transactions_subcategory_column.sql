-- =============================================================================
-- Migration: Add subcategory column to transactions table
-- =============================================================================
-- Adds a nullable TEXT subcategory column to transactions so users can tag
-- bills transactions with a specific subcategory (utilities, telco, education,
-- hospital, pharmacy). A CHECK constraint ensures subcategory is only set
-- when category_id = 'bills'.
-- =============================================================================

-- 1. Add nullable subcategory column
ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS subcategory TEXT;

-- 2. CHECK constraint: subcategory only valid for bills
ALTER TABLE public.transactions
  ADD CONSTRAINT transactions_subcategory_bills_only
  CHECK (subcategory IS NULL OR category_id = 'bills');

-- 3. Comment on the column
COMMENT ON COLUMN public.transactions.subcategory
  IS 'Bills subcategory (utilities, telco, education, hospital, pharmacy). Only valid when category_id = ''bills''.';

-- 4. Composite index for recommend() query filter on (category_id, subcategory)
CREATE INDEX IF NOT EXISTS idx_transactions_category_subcategory
  ON public.transactions (category_id, subcategory);
