-- =============================================================================
-- Migration 020: Min Spend Enforcement — user_settings table
-- =============================================================================
-- Description:  Stores user-level settings (estimated monthly spend) used by
--               the recommend() RPC to enforce minimum spend thresholds.
--
-- Task:    F31 — Min Spend Condition Enforcement
-- Author:  Software Engineer
-- Created: 2026-02-26
-- =============================================================================

-- User settings table (one row per user)
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  estimated_monthly_spend DECIMAL NOT NULL DEFAULT 0,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Row Level Security
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Users can read their own row
CREATE POLICY user_settings_select ON public.user_settings
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own row
CREATE POLICY user_settings_insert ON public.user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own row
CREATE POLICY user_settings_update ON public.user_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE ON public.user_settings TO authenticated;

-- Auto-update updated_at on changes
CREATE OR REPLACE FUNCTION public.update_user_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_settings_timestamp();
