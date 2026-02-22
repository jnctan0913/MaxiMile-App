-- Migration 021: Complete Push Notification System
-- Sprint 20: Push Notifications Phase 2 - Complete System
-- Created: 2026-02-23
-- Purpose: Add user notification preferences, batching queue, and cap alerts

-- ============================================================================
-- 1. User Notification Preferences
-- ============================================================================

-- Add notification preferences to push_tokens table
ALTER TABLE push_tokens
  ADD COLUMN IF NOT EXISTS critical_enabled BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS warning_enabled BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS info_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS quiet_hours_start TIME DEFAULT '22:00'::TIME,
  ADD COLUMN IF NOT EXISTS quiet_hours_end TIME DEFAULT '08:00'::TIME,
  ADD COLUMN IF NOT EXISTS frequency_mode TEXT DEFAULT 'instant'; -- 'instant', 'batched', 'digest'

-- Create index for efficient preference lookups
CREATE INDEX IF NOT EXISTS idx_push_tokens_preferences
  ON push_tokens(user_id, push_enabled, critical_enabled, warning_enabled, info_enabled);

-- Add comment
COMMENT ON COLUMN push_tokens.critical_enabled IS 'User preference for critical severity notifications (always on)';
COMMENT ON COLUMN push_tokens.warning_enabled IS 'User preference for warning severity notifications';
COMMENT ON COLUMN push_tokens.info_enabled IS 'User preference for info severity notifications';
COMMENT ON COLUMN push_tokens.quiet_hours_start IS 'Start of quiet hours (no notifications sent)';
COMMENT ON COLUMN push_tokens.quiet_hours_end IS 'End of quiet hours';
COMMENT ON COLUMN push_tokens.frequency_mode IS 'Notification delivery mode: instant, batched (9AM digest), or digest (daily summary)';

-- ============================================================================
-- 2. Notification Queue (for batching)
-- ============================================================================

CREATE TABLE IF NOT EXISTS notification_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL, -- 'rate_change', 'cap_approaching', 'digest'
  severity TEXT, -- 'critical', 'warning', 'info'
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB, -- Additional data (card_id, rate_change_id, etc.)
  scheduled_for TIMESTAMPTZ DEFAULT NOW(), -- When to send this notification
  status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'cancelled'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  error_message TEXT
);

-- Create indices for efficient querying
CREATE INDEX idx_notification_queue_user ON notification_queue(user_id, status, scheduled_for);
CREATE INDEX idx_notification_queue_scheduled ON notification_queue(status, scheduled_for) WHERE status = 'pending';
CREATE INDEX idx_notification_queue_created ON notification_queue(created_at DESC);

-- Add RLS policies
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;

-- Users can read their own queued notifications
CREATE POLICY notification_queue_select_own ON notification_queue
  FOR SELECT USING (auth.uid() = user_id);

-- Only backend can insert/update/delete
-- (We'll use service role for Edge Functions)

COMMENT ON TABLE notification_queue IS 'Queue for batched and scheduled push notifications';

-- ============================================================================
-- 3. Cap Alert Tracking (prevent duplicate alerts)
-- ============================================================================

CREATE TABLE IF NOT EXISTS cap_alert_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  alert_threshold INTEGER NOT NULL, -- 80 (for 80%), 90, 100, etc.
  period_start DATE NOT NULL, -- Start of the cap period (usually month start)
  alerted_at TIMESTAMPTZ DEFAULT NOW(),
  usage_at_alert NUMERIC(12, 2) NOT NULL, -- Amount spent when alert was sent
  cap_limit NUMERIC(12, 2) NOT NULL, -- The cap limit at time of alert
  UNIQUE(user_id, card_id, category_id, alert_threshold, period_start)
);

-- Create indices
CREATE INDEX idx_cap_alert_tracking_user ON cap_alert_tracking(user_id, period_start DESC);
CREATE INDEX idx_cap_alert_tracking_card ON cap_alert_tracking(card_id, period_start DESC);

-- Add RLS policies
ALTER TABLE cap_alert_tracking ENABLE ROW LEVEL SECURITY;

-- Users can read their own cap alerts
CREATE POLICY cap_alert_tracking_select_own ON cap_alert_tracking
  FOR SELECT USING (auth.uid() = user_id);

COMMENT ON TABLE cap_alert_tracking IS 'Tracks sent cap approaching alerts to prevent duplicates';

-- ============================================================================
-- 4. Feature Flags Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_name TEXT UNIQUE NOT NULL,
  enabled BOOLEAN DEFAULT false,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index
CREATE INDEX idx_feature_flags_name ON feature_flags(flag_name);

-- Add RLS policies
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

-- Anyone can read feature flags
CREATE POLICY feature_flags_select_all ON feature_flags
  FOR SELECT USING (true);

-- Insert push notifications feature flag (disabled by default)
INSERT INTO feature_flags (flag_name, enabled, description)
VALUES
  ('push_notifications_enabled', false, 'Master toggle for push notification system'),
  ('push_cap_alerts_enabled', false, 'Enable cap approaching alerts (80% threshold)'),
  ('push_rate_changes_enabled', false, 'Enable rate change notifications'),
  ('push_digest_enabled', false, 'Enable daily digest notifications')
ON CONFLICT (flag_name) DO NOTHING;

COMMENT ON TABLE feature_flags IS 'Global feature flags for gradual rollout';

-- ============================================================================
-- 5. Helper Functions - Update Notification Preferences
-- ============================================================================

CREATE OR REPLACE FUNCTION update_notification_preferences(
  p_user_id UUID,
  p_critical_enabled BOOLEAN DEFAULT NULL,
  p_warning_enabled BOOLEAN DEFAULT NULL,
  p_info_enabled BOOLEAN DEFAULT NULL,
  p_quiet_hours_start TIME DEFAULT NULL,
  p_quiet_hours_end TIME DEFAULT NULL,
  p_frequency_mode TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE push_tokens
  SET
    critical_enabled = COALESCE(p_critical_enabled, critical_enabled),
    warning_enabled = COALESCE(p_warning_enabled, warning_enabled),
    info_enabled = COALESCE(p_info_enabled, info_enabled),
    quiet_hours_start = COALESCE(p_quiet_hours_start, quiet_hours_start),
    quiet_hours_end = COALESCE(p_quiet_hours_end, quiet_hours_end),
    frequency_mode = COALESCE(p_frequency_mode, frequency_mode),
    updated_at = NOW()
  WHERE user_id = p_user_id;

  -- If no row exists yet, create one
  IF NOT FOUND THEN
    INSERT INTO push_tokens (
      user_id,
      push_token,
      push_enabled,
      push_permission_status,
      critical_enabled,
      warning_enabled,
      info_enabled,
      quiet_hours_start,
      quiet_hours_end,
      frequency_mode
    )
    VALUES (
      p_user_id,
      '',
      false,
      'undecided',
      COALESCE(p_critical_enabled, true),
      COALESCE(p_warning_enabled, true),
      COALESCE(p_info_enabled, false),
      COALESCE(p_quiet_hours_start, '22:00'::TIME),
      COALESCE(p_quiet_hours_end, '08:00'::TIME),
      COALESCE(p_frequency_mode, 'instant')
    );
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION update_notification_preferences TO authenticated;

COMMENT ON FUNCTION update_notification_preferences IS 'Update user notification preferences';

-- ============================================================================
-- 6. Helper Functions - Get Notification Preferences
-- ============================================================================

CREATE OR REPLACE FUNCTION get_notification_preferences(p_user_id UUID)
RETURNS TABLE (
  critical_enabled BOOLEAN,
  warning_enabled BOOLEAN,
  info_enabled BOOLEAN,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  frequency_mode TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    pt.critical_enabled,
    pt.warning_enabled,
    pt.info_enabled,
    pt.quiet_hours_start,
    pt.quiet_hours_end,
    pt.frequency_mode
  FROM push_tokens pt
  WHERE pt.user_id = p_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION get_notification_preferences TO authenticated;

COMMENT ON FUNCTION get_notification_preferences IS 'Get user notification preferences';

-- ============================================================================
-- 7. Helper Functions - Check if in Quiet Hours
-- ============================================================================

CREATE OR REPLACE FUNCTION is_quiet_hours(
  p_user_id UUID,
  p_check_time TIMESTAMPTZ DEFAULT NOW()
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_start TIME;
  v_end TIME;
  v_check_time TIME;
BEGIN
  -- Get user's quiet hours settings
  SELECT quiet_hours_start, quiet_hours_end
  INTO v_start, v_end
  FROM push_tokens
  WHERE user_id = p_user_id;

  -- If no preferences found, not in quiet hours
  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Convert timestamp to time in user's timezone (assume UTC for now)
  v_check_time := p_check_time::TIME;

  -- Handle overnight quiet hours (e.g., 22:00 - 08:00)
  IF v_start > v_end THEN
    RETURN v_check_time >= v_start OR v_check_time < v_end;
  ELSE
    RETURN v_check_time >= v_start AND v_check_time < v_end;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION is_quiet_hours TO authenticated;

COMMENT ON FUNCTION is_quiet_hours IS 'Check if current time is within user quiet hours';

-- ============================================================================
-- 8. Helper Functions - Queue Notification
-- ============================================================================

CREATE OR REPLACE FUNCTION queue_notification(
  p_user_id UUID,
  p_notification_type TEXT,
  p_severity TEXT,
  p_title TEXT,
  p_body TEXT,
  p_data JSONB DEFAULT NULL,
  p_scheduled_for TIMESTAMPTZ DEFAULT NOW()
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_queue_id UUID;
BEGIN
  INSERT INTO notification_queue (
    user_id,
    notification_type,
    severity,
    title,
    body,
    data,
    scheduled_for
  )
  VALUES (
    p_user_id,
    p_notification_type,
    p_severity,
    p_title,
    p_body,
    p_data,
    p_scheduled_for
  )
  RETURNING id INTO v_queue_id;

  RETURN v_queue_id;
END;
$$;

GRANT EXECUTE ON FUNCTION queue_notification TO authenticated;

COMMENT ON FUNCTION queue_notification IS 'Add notification to send queue';

-- ============================================================================
-- 9. Helper Functions - Record Cap Alert
-- ============================================================================

CREATE OR REPLACE FUNCTION record_cap_alert(
  p_user_id UUID,
  p_card_id UUID,
  p_category_id UUID,
  p_alert_threshold INTEGER,
  p_period_start DATE,
  p_usage_at_alert NUMERIC,
  p_cap_limit NUMERIC
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_alert_id UUID;
BEGIN
  INSERT INTO cap_alert_tracking (
    user_id,
    card_id,
    category_id,
    alert_threshold,
    period_start,
    usage_at_alert,
    cap_limit
  )
  VALUES (
    p_user_id,
    p_card_id,
    p_category_id,
    p_alert_threshold,
    p_period_start,
    p_usage_at_alert,
    p_cap_limit
  )
  ON CONFLICT (user_id, card_id, category_id, alert_threshold, period_start)
  DO NOTHING
  RETURNING id INTO v_alert_id;

  RETURN v_alert_id;
END;
$$;

GRANT EXECUTE ON FUNCTION record_cap_alert TO authenticated;

COMMENT ON FUNCTION record_cap_alert IS 'Record that a cap alert was sent (prevents duplicates)';

-- ============================================================================
-- 10. Helper Functions - Check Feature Flag
-- ============================================================================

CREATE OR REPLACE FUNCTION is_feature_enabled(p_flag_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_enabled BOOLEAN;
BEGIN
  SELECT enabled INTO v_enabled
  FROM feature_flags
  WHERE flag_name = p_flag_name;

  -- Default to false if flag doesn't exist
  RETURN COALESCE(v_enabled, false);
END;
$$;

GRANT EXECUTE ON FUNCTION is_feature_enabled TO authenticated;

COMMENT ON FUNCTION is_feature_enabled IS 'Check if a feature flag is enabled';

-- ============================================================================
-- 11. Clear Notification History Function
-- ============================================================================

CREATE OR REPLACE FUNCTION clear_notification_history(
  p_user_id UUID,
  p_older_than_days INTEGER DEFAULT 30
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  WITH deleted AS (
    DELETE FROM push_notification_log
    WHERE user_id = p_user_id
      AND sent_at < NOW() - (p_older_than_days || ' days')::INTERVAL
    RETURNING id
  )
  SELECT COUNT(*) INTO v_deleted_count FROM deleted;

  RETURN v_deleted_count;
END;
$$;

GRANT EXECUTE ON FUNCTION clear_notification_history TO authenticated;

COMMENT ON FUNCTION clear_notification_history IS 'Clear notification history older than N days';
