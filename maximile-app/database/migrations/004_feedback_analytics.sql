-- =============================================================================
-- MaxiMile -- Migration 004: Feedback & Analytics Tables
-- =============================================================================
-- T4.07 + T4.08: Analytics event storage and in-app feedback table.
--
-- Prerequisites: 001, 002, 003 applied.
-- Idempotent: Uses IF NOT EXISTS throughout.
-- =============================================================================

BEGIN;

-- #############################################################################
-- PART 1: FEEDBACK TABLE
-- #############################################################################

CREATE TABLE IF NOT EXISTS feedback (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type          TEXT NOT NULL CHECK (type IN ('bug', 'feature')),
  message       TEXT NOT NULL CHECK (char_length(message) >= 10),
  app_version   TEXT,
  platform      TEXT,           -- 'ios' | 'android'
  status        TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'resolved', 'wont_fix')),
  admin_notes   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE feedback
  IS 'User-submitted bug reports and feature suggestions.';

-- RLS: users can insert their own feedback and read their own submissions
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "feedback_select_own" ON feedback;
CREATE POLICY "feedback_select_own"
  ON feedback
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "feedback_insert_own" ON feedback;
CREATE POLICY "feedback_insert_own"
  ON feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Default user_id from JWT
ALTER TABLE feedback
  ALTER COLUMN user_id SET DEFAULT auth.uid();


-- #############################################################################
-- PART 2: ANALYTICS EVENTS TABLE
-- #############################################################################
-- Server-side analytics storage. Client buffers events locally and can
-- batch-sync to this table in a future version.

CREATE TABLE IF NOT EXISTS analytics_events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event         TEXT NOT NULL,
  properties    JSONB DEFAULT '{}'::jsonb,
  app_version   TEXT,
  platform      TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE analytics_events
  IS 'Application analytics events (card_added, recommendation_used, etc).';

-- Index for querying events by type and time range
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_created
  ON analytics_events (event, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_events_user
  ON analytics_events (user_id, created_at DESC);

-- RLS: users can insert events, only service_role can read all
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "analytics_insert_own" ON analytics_events;
CREATE POLICY "analytics_insert_own"
  ON analytics_events
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- No SELECT policy for authenticated users — analytics are admin-only.
-- Service role bypasses RLS for dashboards.

ALTER TABLE analytics_events
  ALTER COLUMN user_id SET DEFAULT auth.uid();


-- #############################################################################
-- PART 3: MARU VIEW (Monthly Active Recommendations Used)
-- #############################################################################
-- Materialized view for the north star metric.

CREATE OR REPLACE VIEW maru_monthly AS
SELECT
  date_trunc('month', created_at)::date AS month,
  COUNT(*) AS total_recommendations,
  COUNT(DISTINCT user_id) AS unique_users
FROM analytics_events
WHERE event = 'recommendation_used'
GROUP BY date_trunc('month', created_at)
ORDER BY month DESC;

COMMENT ON VIEW maru_monthly
  IS 'Monthly Active Recommendations Used — north star metric.';


COMMIT;
