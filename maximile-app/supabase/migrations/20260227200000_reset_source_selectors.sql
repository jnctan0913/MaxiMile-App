-- =============================================================================
-- Reset CSS selectors to NULL for all source_configs
-- =============================================================================
-- Most CSS selectors don't match the actual bank page structure, causing
-- 30-second timeouts per source. The scraper now falls back to full body
-- text extraction when a selector fails, but we can avoid the wasted 8s
-- timeout per source by clearing selectors entirely.
--
-- Full body text extraction is reliable for change detection (hash-based).
-- Specific selectors can be re-added after manual verification.
-- =============================================================================

UPDATE public.source_configs
SET css_selector = NULL
WHERE css_selector IS NOT NULL;

-- Also reset consecutive_failures from the failed first run
UPDATE public.source_configs
SET consecutive_failures = 0,
    status = 'active'
WHERE consecutive_failures > 0;
