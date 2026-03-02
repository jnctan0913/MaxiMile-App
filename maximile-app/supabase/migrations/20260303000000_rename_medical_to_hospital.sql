-- =============================================================================
-- Migration: Rename "medical" subcategory to "hospital"
-- =============================================================================
-- The subcategory "medical" is misleading — our earn rules specifically cover
-- hospital bill payments (MCC 8062), not general medical expenses.
-- Renaming to "hospital" aligns the data with what users actually see.
-- =============================================================================

BEGIN;

-- 1. Update all earn_rules with subcategory = 'medical' → 'hospital'
UPDATE public.earn_rules
SET conditions = jsonb_set(conditions, '{subcategory}', '"hospital"')
WHERE conditions->>'subcategory' = 'medical';

-- 2. Update the bills category description
UPDATE public.categories
SET description = 'Utilities, telco, insurance, education, hospital, pharmacy'
WHERE id = 'bills';

COMMIT;
