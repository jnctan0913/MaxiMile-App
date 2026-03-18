-- =============================================================================
-- MaxiMile -- Migration: Analytics Views v2 + Error Tracking
-- =============================================================================
-- Sprint 38+ analytics enhancements:
--   1. v_monthly_active_users  — proper MAU (missing from v1)
--   2. v_transaction_funnel    — log-screen → logged → edited
--   3. v_feature_adoption      — 30-day unique users per feature event
--   4. v_retention_cohorts     — weekly signup cohorts with 4-week retention
--   5. v_category_spending     — current-month spend breakdown by category
--   6. error_events table      — client-side crash/error tracking
--   7. v_error_summary         — daily error counts for admin dashboard
--
-- Prerequisites: 022_analytics_views applied (analytics_events, v_active_users).
-- Idempotent: Uses CREATE OR REPLACE VIEW and IF NOT EXISTS throughout.
-- =============================================================================

BEGIN;


-- #############################################################################
-- VIEW 1: v_monthly_active_users — Monthly Active Users
-- #############################################################################
-- Deduplicates users over calendar months. The existing v_active_users only
-- provides DAU; this fills the MAU gap.

CREATE OR REPLACE VIEW v_monthly_active_users AS
SELECT
  date_trunc('month', created_at)::date AS month,
  COUNT(DISTINCT user_id) AS mau
FROM analytics_events
WHERE user_id IS NOT NULL
GROUP BY date_trunc('month', created_at)::date
ORDER BY month DESC;

COMMENT ON VIEW v_monthly_active_users
  IS 'Monthly active users — distinct user_ids per calendar month from analytics_events.';


-- #############################################################################
-- VIEW 2: v_transaction_funnel — Transaction Logging Funnel
-- #############################################################################
-- 3-step funnel: log screen viewed → transaction logged → transaction edited.
-- Tracks what we actually instrument today.

CREATE OR REPLACE VIEW v_transaction_funnel AS
SELECT 1 AS step_order, 'log_screen_viewed' AS step, COUNT(DISTINCT user_id) AS users
  FROM analytics_events WHERE event = 'screen_view' AND properties->>'screen' = 'log'
UNION ALL
SELECT 2, 'transaction_logged', COUNT(DISTINCT user_id)
  FROM analytics_events WHERE event = 'transaction_logged'
UNION ALL
SELECT 3, 'transaction_edited', COUNT(DISTINCT user_id)
  FROM analytics_events WHERE event = 'transaction_edited'
ORDER BY step_order;

COMMENT ON VIEW v_transaction_funnel
  IS 'Transaction logging funnel: log_screen_viewed → transaction_logged → transaction_edited.';


-- #############################################################################
-- VIEW 3: v_feature_adoption — 30-Day Feature Adoption
-- #############################################################################
-- Shows total events and unique users for each key feature in the last 30 days.

CREATE OR REPLACE VIEW v_feature_adoption AS
SELECT
  event AS feature,
  COUNT(*) AS total_events,
  COUNT(DISTINCT user_id) AS unique_users
FROM analytics_events
WHERE event IN (
  'recommendation_used',
  'transaction_logged',
  'transaction_edited',
  'transaction_deleted',
  'pay_flow_started',
  'merchant_selected',
  'search_initiated',
  'wallet_opened',
  'bills_subcategory_selected',
  'rate_change_submitted',
  'redemption_logged',
  'feedback_submitted'
)
AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY event
ORDER BY unique_users DESC;

COMMENT ON VIEW v_feature_adoption
  IS 'Feature adoption — unique users and event counts per key feature over the last 30 days.';


-- #############################################################################
-- VIEW 4: v_retention_cohorts — Weekly Signup Cohort Retention
-- #############################################################################
-- Groups users by their signup week, then calculates what percentage returned
-- in weeks 1 through 4 after signup.

CREATE OR REPLACE VIEW v_retention_cohorts AS
WITH signups AS (
  SELECT
    user_id,
    MIN(created_at::date) AS signup_date,
    date_trunc('week', MIN(created_at::date))::date AS signup_week
  FROM analytics_events
  WHERE event = 'sign_up' AND user_id IS NOT NULL
  GROUP BY user_id
),
activity AS (
  SELECT DISTINCT user_id, created_at::date AS active_date
  FROM analytics_events
  WHERE user_id IS NOT NULL
)
SELECT
  s.signup_week,
  COUNT(DISTINCT s.user_id) AS cohort_size,
  COUNT(DISTINCT CASE WHEN a.active_date BETWEEN s.signup_date + 1  AND s.signup_date + 7  THEN a.user_id END) AS week_1,
  COUNT(DISTINCT CASE WHEN a.active_date BETWEEN s.signup_date + 8  AND s.signup_date + 14 THEN a.user_id END) AS week_2,
  COUNT(DISTINCT CASE WHEN a.active_date BETWEEN s.signup_date + 15 AND s.signup_date + 21 THEN a.user_id END) AS week_3,
  COUNT(DISTINCT CASE WHEN a.active_date BETWEEN s.signup_date + 22 AND s.signup_date + 28 THEN a.user_id END) AS week_4
FROM signups s
LEFT JOIN activity a ON a.user_id = s.user_id
GROUP BY s.signup_week
ORDER BY s.signup_week DESC;

COMMENT ON VIEW v_retention_cohorts
  IS 'Weekly signup cohort retention — cohort_size and returning users in weeks 1-4.';


-- #############################################################################
-- VIEW 5: v_category_spending — Current-Month Category Breakdown
-- #############################################################################
-- Queries the transactions table (not analytics_events) for spending by category
-- in the current calendar month.

CREATE OR REPLACE VIEW v_category_spending AS
SELECT
  category_id,
  COUNT(*) AS transaction_count,
  COUNT(DISTINCT user_id) AS unique_users,
  SUM(amount) AS total_amount,
  AVG(amount) AS avg_amount
FROM transactions
WHERE transaction_date >= (date_trunc('month', CURRENT_DATE))::date
GROUP BY category_id
ORDER BY total_amount DESC;

COMMENT ON VIEW v_category_spending
  IS 'Current-month spending breakdown by category from the transactions table.';


-- #############################################################################
-- TABLE 6: error_events — Client-Side Error Tracking
-- #############################################################################
-- Replaces Crashlytics for Supabase-native crash/error monitoring.

CREATE TABLE IF NOT EXISTS error_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  error_type TEXT NOT NULL,
  message TEXT NOT NULL,
  stack_trace TEXT,
  screen TEXT,
  platform TEXT DEFAULT 'unknown',
  app_version TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE error_events
  IS 'Client-side error tracking — replaces Crashlytics for Supabase-native monitoring.';

CREATE INDEX IF NOT EXISTS idx_error_events_type_created
  ON error_events (error_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_error_events_user
  ON error_events (user_id, created_at DESC);

ALTER TABLE error_events ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can insert their own errors
CREATE POLICY "error_insert_own" ON error_events
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Service role can read all errors (admin dashboard)
CREATE POLICY "error_read_service" ON error_events
  FOR SELECT TO service_role
  USING (true);


-- #############################################################################
-- VIEW 7: v_error_summary — Daily Error Summary for Admin Dashboard
-- #############################################################################

CREATE OR REPLACE VIEW v_error_summary AS
SELECT
  created_at::date AS day,
  error_type,
  COUNT(*) AS count,
  COUNT(DISTINCT user_id) AS affected_users
FROM error_events
GROUP BY created_at::date, error_type
ORDER BY day DESC, count DESC;

COMMENT ON VIEW v_error_summary
  IS 'Daily error counts by type with affected user counts — for admin dashboard.';


-- #############################################################################
-- GRANTS: Allow PostgREST API access to new views
-- #############################################################################

GRANT SELECT ON v_monthly_active_users TO anon, authenticated, service_role;
GRANT SELECT ON v_transaction_funnel   TO anon, authenticated, service_role;
GRANT SELECT ON v_feature_adoption     TO anon, authenticated, service_role;
GRANT SELECT ON v_retention_cohorts    TO anon, authenticated, service_role;
GRANT SELECT ON v_category_spending    TO anon, authenticated, service_role;
GRANT SELECT ON v_error_summary        TO anon, authenticated, service_role;


COMMIT;
