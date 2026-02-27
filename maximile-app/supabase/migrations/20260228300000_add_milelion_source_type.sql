-- =============================================================================
-- Migration: Add 'milelion_review' source type enum value
-- =============================================================================
-- Adds the milelion_review source type for monitoring MileLion credit card
-- review pages as a primary source for rate change detection.
--
-- PostgreSQL requires ADD VALUE to run outside a transaction block, so this
-- is in its own migration file (same pattern as 20260227300000).
-- =============================================================================

ALTER TYPE source_type ADD VALUE IF NOT EXISTS 'milelion_review';
