-- Drop the old single-argument recommend(TEXT) overload.
-- After v1.7.0 migration, both recommend(TEXT) and recommend(TEXT, TEXT DEFAULT NULL)
-- coexist, causing PostgreSQL ambiguity on one-argument calls → PGRST203 "function is not unique".
-- The new 2-arg signature with DEFAULT NULL handles all existing callers transparently.
DROP FUNCTION IF EXISTS public.recommend(TEXT);

-- Ensure authenticated users can still call the new overload
GRANT EXECUTE ON FUNCTION public.recommend(TEXT, TEXT) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.recommend(TEXT, TEXT) FROM anon;
