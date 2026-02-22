-- Migration 020: Push Notification Foundation
-- Sprint 19: Push Notifications Phase 1 - Infrastructure
-- Created: 2026-02-22
-- Purpose: Add push token storage and notification logging capabilities

-- ============================================================================
-- 1. Add Push Notification Columns to Users Table
-- ============================================================================

-- Add push token and permission status columns
-- Note: Supabase auth.users table is managed by Supabase Auth
-- We'll store push-related data in a separate user_profiles table if it doesn't exist,
-- or extend the existing users table if we have one

-- Check if we have a custom users table or need to use auth metadata
-- For MaxiMile, we'll use auth.users.raw_user_meta_data JSONB for push settings
-- and create a separate push_tokens table for better RLS and querying

-- Create push_tokens table
CREATE TABLE IF NOT EXISTS push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  push_token TEXT NOT NULL,
  push_enabled BOOLEAN DEFAULT true,
  push_permission_status TEXT DEFAULT 'undecided', -- 'granted', 'denied', 'undecided'
  device_type TEXT, -- 'ios' or 'android'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id) -- One token per user (will update on token change)
);

-- Create index for fast user lookups
CREATE INDEX idx_push_tokens_user ON push_tokens(user_id);
CREATE INDEX idx_push_tokens_enabled ON push_tokens(user_id, push_enabled) WHERE push_enabled = true;

-- Add RLS policies
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

-- Users can read and update their own push token
CREATE POLICY push_tokens_select_own ON push_tokens
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY push_tokens_insert_own ON push_tokens
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY push_tokens_update_own ON push_tokens
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY push_tokens_delete_own ON push_tokens
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- 2. Create Push Notification Log Table
-- ============================================================================

CREATE TABLE push_notification_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL, -- 'rate_change', 'cap_approaching', 'digest'
  severity TEXT, -- 'critical', 'warning', 'info'
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB, -- Additional data (card_id, rate_change_id, etc.)
  push_token TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  delivered BOOLEAN,
  opened BOOLEAN DEFAULT false,
  error_message TEXT,
  expo_ticket_id TEXT, -- Expo push ticket ID for tracking
  expo_receipt_id TEXT -- Expo receipt ID for delivery confirmation
);

-- Create indices for efficient querying
CREATE INDEX idx_push_log_user ON push_notification_log(user_id, sent_at DESC);
CREATE INDEX idx_push_log_type ON push_notification_log(notification_type, sent_at DESC);
CREATE INDEX idx_push_log_delivered ON push_notification_log(delivered, sent_at DESC);

-- Add RLS policies
ALTER TABLE push_notification_log ENABLE ROW LEVEL SECURITY;

-- Users can read their own notification history
CREATE POLICY push_log_select_own ON push_notification_log
  FOR SELECT USING (auth.uid() = user_id);

-- Only backend functions can insert/update log entries
-- (We'll use service role for Edge Functions)

-- ============================================================================
-- 3. Create Helper Functions
-- ============================================================================

-- Function to upsert push token
CREATE OR REPLACE FUNCTION upsert_push_token(
  p_user_id UUID,
  p_push_token TEXT,
  p_device_type TEXT DEFAULT NULL,
  p_push_enabled BOOLEAN DEFAULT true,
  p_permission_status TEXT DEFAULT 'granted'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO push_tokens (user_id, push_token, device_type, push_enabled, push_permission_status, updated_at)
  VALUES (p_user_id, p_push_token, p_device_type, p_push_enabled, p_permission_status, NOW())
  ON CONFLICT (user_id)
  DO UPDATE SET
    push_token = EXCLUDED.push_token,
    device_type = COALESCE(EXCLUDED.device_type, push_tokens.device_type),
    push_enabled = EXCLUDED.push_enabled,
    push_permission_status = EXCLUDED.push_permission_status,
    updated_at = NOW();
END;
$$;

-- Function to get user's push token
CREATE OR REPLACE FUNCTION get_user_push_token(p_user_id UUID)
RETURNS TABLE (
  push_token TEXT,
  push_enabled BOOLEAN,
  permission_status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT pt.push_token, pt.push_enabled, pt.push_permission_status
  FROM push_tokens pt
  WHERE pt.user_id = p_user_id
    AND pt.push_enabled = true
    AND pt.push_permission_status = 'granted';
END;
$$;

-- Function to disable push notifications for a user
CREATE OR REPLACE FUNCTION disable_push_notifications(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE push_tokens
  SET push_enabled = false, updated_at = NOW()
  WHERE user_id = p_user_id;
END;
$$;

-- Function to log push notification attempt
CREATE OR REPLACE FUNCTION log_push_notification(
  p_user_id UUID,
  p_notification_type TEXT,
  p_severity TEXT,
  p_title TEXT,
  p_body TEXT,
  p_data JSONB DEFAULT NULL,
  p_push_token TEXT DEFAULT NULL,
  p_delivered BOOLEAN DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL,
  p_expo_ticket_id TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO push_notification_log (
    user_id, notification_type, severity, title, body, data,
    push_token, delivered, error_message, expo_ticket_id
  )
  VALUES (
    p_user_id, p_notification_type, p_severity, p_title, p_body, p_data,
    p_push_token, p_delivered, p_error_message, p_expo_ticket_id
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$;

-- ============================================================================
-- 4. Grant Execute Permissions
-- ============================================================================

-- Grant execute on functions to authenticated users
GRANT EXECUTE ON FUNCTION upsert_push_token TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_push_token TO authenticated;
GRANT EXECUTE ON FUNCTION disable_push_notifications TO authenticated;
GRANT EXECUTE ON FUNCTION log_push_notification TO authenticated;

-- Function to send rate change notification (wrapper for Edge Function)
-- This is a placeholder that would trigger the Edge Function
-- In production, this would use pg_net extension to call the Edge Function
CREATE OR REPLACE FUNCTION send_rate_change_notification(
  p_user_id UUID,
  p_rate_change_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_rate_change RECORD;
  v_card_name TEXT;
  v_title TEXT;
  v_body TEXT;
BEGIN
  -- Fetch rate change details
  SELECT rc.*, c.name as card_name
  INTO v_rate_change
  FROM rate_changes rc
  JOIN cards c ON c.id = rc.card_id
  WHERE rc.id = p_rate_change_id;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- Build notification title and body based on severity
  IF v_rate_change.severity = 'critical' THEN
    v_title := '⚠️ Your ' || v_rate_change.card_name || ': Major Change';
    v_body := v_rate_change.change_summary || '. Tap to see alternatives.';
  ELSIF v_rate_change.severity = 'warning' THEN
    v_title := '⚠️ ' || v_rate_change.card_name || ': Rate Change';
    v_body := v_rate_change.change_summary || '. Review your strategy.';
  ELSE
    v_title := '✨ ' || v_rate_change.card_name || ': Update';
    v_body := v_rate_change.change_summary;
  END IF;

  -- Log that we would call the Edge Function here
  -- In production, use pg_net extension:
  -- SELECT net.http_post(
  --   url := 'https://[project].supabase.co/functions/v1/send-push-notification',
  --   headers := '{"Authorization": "Bearer [service_role_key]"}'::jsonb,
  --   body := jsonb_build_object(
  --     'user_id', p_user_id,
  --     'rate_change_id', p_rate_change_id,
  --     'notification_type', 'rate_change',
  --     'severity', v_rate_change.severity,
  --     'title', v_title,
  --     'body', v_body,
  --     'data', jsonb_build_object(
  --       'screen', 'CardDetail',
  --       'cardId', v_rate_change.card_id,
  --       'rateChangeId', p_rate_change_id
  --     )
  --   )
  -- );

  RAISE NOTICE 'Would send push notification: % - %', v_title, v_body;
END;
$$;

-- ============================================================================
-- 5. Comments for Documentation
-- ============================================================================

COMMENT ON TABLE push_tokens IS 'Stores device push tokens for Expo push notifications with user preferences';
COMMENT ON TABLE push_notification_log IS 'Audit log of all push notifications sent to users';
COMMENT ON FUNCTION upsert_push_token IS 'Insert or update a user push token with permission status';
COMMENT ON FUNCTION get_user_push_token IS 'Retrieve active push token for a user';
COMMENT ON FUNCTION disable_push_notifications IS 'Disable push notifications for a user';
COMMENT ON FUNCTION log_push_notification IS 'Log a push notification attempt with delivery status';
COMMENT ON FUNCTION send_rate_change_notification IS 'Send push notification for a rate change (triggers Edge Function)';
