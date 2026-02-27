-- Reset last_checked_at for all active sources so the scraper re-checks
-- them immediately after the URL fix migration.
-- This is a one-time operation for testing purposes.

UPDATE source_configs
SET last_checked_at = NULL
WHERE status = 'active';
