-- =============================================================================
-- MaxiMile -- Migration 005: Analytics Dashboard Views
-- =============================================================================
-- Sprint 38 (F46): Pre-computed views for the admin analytics dashboard.
-- These views power the Analytics tab in the admin dashboard, querying
-- the analytics_events table created in migration 004.
--
-- Prerequisites: 004 applied (analytics_events table exists).
-- Idempotent: Uses CREATE OR REPLACE VIEW throughout.
-- =============================================================================

BEGIN;

-- #############################################################################
-- VIEW 1: v_active_users — Daily Active Users
-- #############################################################################
-- Returns one row per day with the count of distinct users who triggered
-- any analytics event. Used for DAU/WAU/MAU calculations.

CREATE OR REPLACE VIEW v_active_users AS
SELECT
  created_at::date AS day,
  COUNT(DISTINCT user_id) AS dau
FROM analytics_events
WHERE user_id IS NOT NULL
GROUP BY created_at::date
ORDER BY day DESC;

COMMENT ON VIEW v_active_users
  IS 'Daily active users — distinct user_ids per day from analytics_events.';


-- #############################################################################
-- VIEW 2: v_event_daily — Daily Event Counts by Type
-- #############################################################################
-- Returns one row per (day, event) pair with the event count.
-- Used for event heatmaps, feature adoption, and trend analysis.

CREATE OR REPLACE VIEW v_event_daily AS
SELECT
  created_at::date AS day,
  event,
  COUNT(*) AS count,
  COUNT(DISTINCT user_id) AS unique_users
FROM analytics_events
GROUP BY created_at::date, event
ORDER BY day DESC, count DESC;

COMMENT ON VIEW v_event_daily
  IS 'Daily event counts grouped by event type — for heatmaps and trend analysis.';


-- #############################################################################
-- VIEW 3: v_onboarding_funnel — Onboarding Conversion Funnel
-- #############################################################################
-- 4-step funnel: sign_up → card_added → onboarding_completed → transaction_logged
-- Returns distinct user counts at each step.

CREATE OR REPLACE VIEW v_onboarding_funnel AS
SELECT 1 AS step_order, 'sign_up' AS step, COUNT(DISTINCT user_id) AS users
  FROM analytics_events WHERE event = 'sign_up'
UNION ALL
SELECT 2, 'card_added', COUNT(DISTINCT user_id)
  FROM analytics_events WHERE event = 'card_added'
UNION ALL
SELECT 3, 'onboarding_completed', COUNT(DISTINCT user_id)
  FROM analytics_events WHERE event = 'onboarding_completed'
UNION ALL
SELECT 4, 'first_transaction', COUNT(DISTINCT user_id)
  FROM analytics_events WHERE event = 'transaction_logged'
ORDER BY step_order;

COMMENT ON VIEW v_onboarding_funnel
  IS 'Onboarding funnel: sign_up → card_added → onboarding_completed → first transaction.';


-- #############################################################################
-- VIEW 4: v_smart_pay_funnel — Smart Pay Conversion Funnel
-- #############################################################################
-- 4-step funnel: pay_flow_started → merchant_detected → recommendation_used → pay_transaction_logged

CREATE OR REPLACE VIEW v_smart_pay_funnel AS
SELECT 1 AS step_order, 'pay_flow_started' AS step, COUNT(DISTINCT user_id) AS users
  FROM analytics_events WHERE event = 'pay_flow_started'
UNION ALL
SELECT 2, 'merchant_detected', COUNT(DISTINCT user_id)
  FROM analytics_events WHERE event = 'merchant_detected'
UNION ALL
SELECT 3, 'recommendation_used', COUNT(DISTINCT user_id)
  FROM analytics_events WHERE event = 'recommendation_used'
UNION ALL
SELECT 4, 'pay_transaction_logged', COUNT(DISTINCT user_id)
  FROM analytics_events WHERE event = 'pay_transaction_logged'
ORDER BY step_order;

COMMENT ON VIEW v_smart_pay_funnel
  IS 'Smart Pay funnel: flow_started → merchant_detected → recommendation_used → transaction_logged.';


-- #############################################################################
-- VIEW 5: v_notification_funnel — Notification Opt-in Funnel
-- #############################################################################
-- 3-step funnel: notification_primer_shown → primer_accepted → permission_granted

CREATE OR REPLACE VIEW v_notification_funnel AS
SELECT 1 AS step_order, 'primer_shown' AS step, COUNT(DISTINCT user_id) AS users
  FROM analytics_events WHERE event = 'notification_primer_shown'
UNION ALL
SELECT 2, 'primer_accepted', COUNT(DISTINCT user_id)
  FROM analytics_events WHERE event = 'notification_primer_accepted'
UNION ALL
SELECT 3, 'permission_granted', COUNT(DISTINCT user_id)
  FROM analytics_events WHERE event = 'notification_permission_granted'
ORDER BY step_order;

COMMENT ON VIEW v_notification_funnel
  IS 'Notification opt-in funnel: primer_shown → accepted → permission_granted.';


-- #############################################################################
-- ADDITIONAL INDEX: Composite index for date-range + event queries
-- #############################################################################
-- The admin dashboard filters by date range and groups by event type.
-- This index speeds up the most common dashboard query pattern.

CREATE INDEX IF NOT EXISTS idx_analytics_events_date_event
  ON analytics_events (created_at::date, event);


COMMIT;
