-- =============================================================================
-- MaxiMile — Migration: Add source_type enum values for T&C PDF sources
-- =============================================================================
-- Must be a separate migration from the INSERTs that use these values,
-- because PostgreSQL cannot use newly-added enum values in the same transaction.
-- =============================================================================

ALTER TYPE source_type ADD VALUE IF NOT EXISTS 'bank_tc_pdf';
ALTER TYPE source_type ADD VALUE IF NOT EXISTS 'bank_index_page';
