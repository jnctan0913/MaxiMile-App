-- =============================================================================
-- Fix SECURITY DEFINER warnings on all analytics views
-- =============================================================================
-- Supabase linter flagged all views as SECURITY DEFINER, meaning they bypass
-- RLS and run with the creator's permissions. Switch to SECURITY INVOKER and
-- restrict access to service_role only (admin dashboard).
-- =============================================================================

-- Switch all views to SECURITY INVOKER
ALTER VIEW v_active_users SET (security_invoker = on);
ALTER VIEW v_event_daily SET (security_invoker = on);
ALTER VIEW v_onboarding_funnel SET (security_invoker = on);
ALTER VIEW v_smart_pay_funnel SET (security_invoker = on);
ALTER VIEW v_notification_funnel SET (security_invoker = on);
ALTER VIEW maru_monthly SET (security_invoker = on);
ALTER VIEW v_monthly_active_users SET (security_invoker = on);
ALTER VIEW v_transaction_funnel SET (security_invoker = on);
ALTER VIEW v_feature_adoption SET (security_invoker = on);
ALTER VIEW v_retention_cohorts SET (security_invoker = on);
ALTER VIEW v_category_spending SET (security_invoker = on);
ALTER VIEW v_error_summary SET (security_invoker = on);

-- Restrict to service_role only — admin dashboard uses service key
REVOKE SELECT ON v_active_users FROM anon, authenticated;
REVOKE SELECT ON v_event_daily FROM anon, authenticated;
REVOKE SELECT ON v_onboarding_funnel FROM anon, authenticated;
REVOKE SELECT ON v_smart_pay_funnel FROM anon, authenticated;
REVOKE SELECT ON v_notification_funnel FROM anon, authenticated;
REVOKE SELECT ON maru_monthly FROM anon, authenticated;
REVOKE SELECT ON v_monthly_active_users FROM anon, authenticated;
REVOKE SELECT ON v_transaction_funnel FROM anon, authenticated;
REVOKE SELECT ON v_feature_adoption FROM anon, authenticated;
REVOKE SELECT ON v_retention_cohorts FROM anon, authenticated;
REVOKE SELECT ON v_category_spending FROM anon, authenticated;
REVOKE SELECT ON v_error_summary FROM anon, authenticated;
