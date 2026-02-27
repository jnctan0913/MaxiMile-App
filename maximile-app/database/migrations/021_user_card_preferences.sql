-- Migration 021: Add user_card_preferences table
-- Sprint 24: UOB Lady's Solitaire user-selectable bonus categories
-- Date: 2026-02-27

-- This table stores per-user, per-card category preferences.
-- Currently used by UOB Lady's Solitaire (choose 2 of 7 bonus categories).
-- The recommend() RPC checks this table for cards with conditions->>'user_selectable' = 'true'.

CREATE TABLE IF NOT EXISTS public.user_card_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id UUID NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
  selected_categories TEXT[] NOT NULL DEFAULT '{}',
  max_selections INTEGER NOT NULL DEFAULT 2,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- One preference row per user per card
  UNIQUE(user_id, card_id),

  -- Validate selection count doesn't exceed max
  CONSTRAINT valid_selection_count CHECK (array_length(selected_categories, 1) IS NULL OR array_length(selected_categories, 1) <= max_selections)
);

-- Index for fast lookup in recommend() RPC
CREATE INDEX IF NOT EXISTS idx_user_card_preferences_user_card
  ON public.user_card_preferences(user_id, card_id);

-- RLS policies
ALTER TABLE public.user_card_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own card preferences"
  ON public.user_card_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own card preferences"
  ON public.user_card_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own card preferences"
  ON public.user_card_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own card preferences"
  ON public.user_card_preferences FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_user_card_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_user_card_preferences_updated_at
  BEFORE UPDATE ON public.user_card_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_user_card_preferences_updated_at();
