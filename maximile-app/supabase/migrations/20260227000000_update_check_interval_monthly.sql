-- Migration: Update source_configs check_interval to 30 days (monthly scraping cadence)
-- Rationale: Bank T&C changes are infrequent (quarterly at most).
--            Monthly checks are sufficient. Community submissions cover urgent mid-month changes.
-- Date: 2026-02-27

-- Update all active sources to 30-day check interval
UPDATE source_configs
SET check_interval = INTERVAL '30 days'
WHERE check_interval = INTERVAL '1 day';

-- Update the default for new sources going forward
ALTER TABLE source_configs
  ALTER COLUMN check_interval SET DEFAULT INTERVAL '30 days';
