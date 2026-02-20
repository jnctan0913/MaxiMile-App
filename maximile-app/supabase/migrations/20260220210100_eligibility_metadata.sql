-- =============================================================================
-- MaxiMile — Migration 013: Eligibility Metadata + POSB Reclassification
-- =============================================================================
-- Description:  Adds eligibility_criteria JSONB column to cards table for
--               storing age, gender, income, and banking-tier restrictions.
--               Reclassifies POSB Everyday Card as non-miles (cashback only).
--
-- New objects:
--   Columns  — cards.eligibility_criteria (JSONB, nullable)
--
-- Data changes:
--   POSB Everyday Card — is_active set to FALSE for miles purposes;
--                        notes updated to reflect cashback-only status.
--                        (We use is_active=FALSE rather than deleting to
--                        preserve existing user_cards FK references and
--                        transaction history.)
--
-- Prerequisites:
--   - 001_initial_schema.sql (cards table)
--   - 008_miles_portfolio.sql (miles_program_id on cards)
--   - 011_miles_ecosystem.sql (expanded programs)
--
-- Author:  Data Engineer
-- Created: 2026-02-20
-- Sprint:  11 — "Every Card" (F22)
-- =============================================================================

BEGIN;


-- ==========================================================================
-- SECTION 1: Add eligibility_criteria column to cards
-- ==========================================================================
-- JSONB schema supports:
--   {"gender": "female"}                    — UOB Lady's Solitaire
--   {"age_min": 21, "age_max": 39}          — Maybank XL Rewards
--   {"min_income": 120000}                  — DBS Vantage
--   {"banking_tier": "priority_banking"}    — SC Beyond
--   {"banking_tier": "premier"}             — HSBC Premier MC
--   NULL = no restrictions (open application)

ALTER TABLE public.cards
  ADD COLUMN IF NOT EXISTS eligibility_criteria JSONB DEFAULT NULL;

COMMENT ON COLUMN public.cards.eligibility_criteria
  IS 'JSONB eligibility requirements for restricted cards. NULL means no special restrictions. Schema: {gender?, age_min?, age_max?, min_income?, banking_tier?}';


-- ==========================================================================
-- SECTION 2: Reclassify POSB Everyday Card
-- ==========================================================================
-- POSB Everyday Card is primarily a cashback card (up to 5% cashback).
-- Its DBS Points → KrisFlyer path yields only 0.4 mpd — not meaningful
-- for miles optimization. Deactivating from miles database while preserving
-- existing user data.

UPDATE public.cards
SET
  is_active = FALSE,
  notes = 'RECLASSIFIED (Sprint 11): Cashback card, not a miles card. DBS Points conversion yields only 0.4 mpd — below useful threshold. Deactivated from miles recommendations. Existing user_cards and transaction history preserved. Previous notes: ' || COALESCE(notes, '(none)'),
  updated_at = NOW()
WHERE slug = 'posb-everyday-card';


-- ==========================================================================
-- SECTION 3: Verification queries (for manual review after applying)
-- ==========================================================================
-- Run these to verify:
--   SELECT name, eligibility_criteria FROM cards WHERE eligibility_criteria IS NOT NULL;
--   SELECT name, is_active FROM cards WHERE slug = 'posb-everyday-card';
--   SELECT COUNT(*) FROM cards WHERE is_active = TRUE;  -- Should be 19


COMMIT;
