-- =============================================================================
-- MaxiMile -- Migration 005: Smart Pay Advisor — Merchant Columns
-- =============================================================================
-- Description:  Ensures the transactions table has merchant_name and
--               merchant_mcc columns required by the Smart Pay Advisor feature.
--
--               These columns were included in the original 001_initial_schema
--               migration, but this migration serves as the formal feature
--               migration for Smart Pay Advisor, adding enhanced comments and
--               an index on merchant_mcc for future category auto-detection.
--
-- Columns:
--   merchant_name TEXT (nullable) — Merchant name from Google Places API,
--                                   populated when user logs via Smart Pay.
--   merchant_mcc  TEXT (nullable) — Merchant Category Code from Google Places,
--                                   used for automatic spend category detection.
--
-- Both columns are nullable because:
--   1. Existing transactions (manual logging) won't have merchant data.
--   2. Manual transaction logging does not require a merchant selection.
--   3. Only Smart Pay transactions will populate these fields.
--
-- Prerequisites: 001_initial_schema.sql (transactions table must exist).
-- Idempotent:    Uses IF NOT EXISTS / ADD COLUMN IF NOT EXISTS throughout.
--
-- Feature: Smart Pay Advisor (Phase 2)
-- Author:  Software Engineer
-- Created: 2026-02-20
-- =============================================================================

BEGIN;

-- ==========================================================================
-- PART 1: Ensure merchant columns exist (idempotent)
-- ==========================================================================
-- These columns were defined in 001_initial_schema.sql.  The ADD COLUMN IF
-- NOT EXISTS guards ensure this migration is safe to run on any environment,
-- including fresh databases and databases that already have the columns.

ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS merchant_name TEXT;

ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS merchant_mcc TEXT;

-- Ensure the merchant_name length constraint exists.
-- (Already defined in 001 as transactions_merchant_name_length; this is a
--  no-op if the constraint is present.)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_schema = 'public'
      AND table_name   = 'transactions'
      AND constraint_name = 'transactions_merchant_name_length'
  ) THEN
    ALTER TABLE public.transactions
      ADD CONSTRAINT transactions_merchant_name_length
      CHECK (merchant_name IS NULL OR char_length(merchant_name) <= 200);
  END IF;
END;
$$;


-- ==========================================================================
-- PART 2: Update column comments for Smart Pay Advisor context
-- ==========================================================================
-- Overwrite the generic comments with feature-specific documentation.

COMMENT ON COLUMN public.transactions.merchant_name
  IS 'Merchant display name. Populated from Google Places API during Smart Pay '
     'transaction logging; NULL for manually logged transactions.';

COMMENT ON COLUMN public.transactions.merchant_mcc
  IS 'Merchant Category Code (ISO 18245). Populated from Google Places API '
     'during Smart Pay transaction logging. Used for automatic spend category '
     'detection — cross-referenced with categories.mccs to suggest the correct '
     'category. NULL for manually logged transactions.';


-- ==========================================================================
-- PART 3: Index for category auto-detection lookups
-- ==========================================================================
-- When a Smart Pay transaction is logged with an MCC, the app needs to look
-- up which category the MCC belongs to.  This index supports the reverse
-- lookup: "given an MCC on a transaction, which transactions share this MCC?"
-- Useful for analytics and batch re-categorization.

CREATE INDEX IF NOT EXISTS idx_transactions_merchant_mcc
  ON public.transactions (merchant_mcc)
  WHERE merchant_mcc IS NOT NULL;


COMMIT;
