-- Migration: Add display columns to detected_changes for admin dashboard compatibility
-- Purpose: The admin dashboard and scraper router need card_name, bank_name, ai_notes,
--          and reviewed_at columns on detected_changes for display and workflow purposes.
--          These are convenience columns that avoid complex joins.
-- Date: 2026-02-27

-- Add card_name (AI output, used for display in admin dashboard)
ALTER TABLE public.detected_changes
  ADD COLUMN IF NOT EXISTS card_name TEXT;

-- Add bank_name (for filtering by bank in admin dashboard)
ALTER TABLE public.detected_changes
  ADD COLUMN IF NOT EXISTS bank_name TEXT;

-- Add ai_notes (AI classifier's analysis_notes, useful for review)
ALTER TABLE public.detected_changes
  ADD COLUMN IF NOT EXISTS ai_notes TEXT;

-- Add reviewed_at (timestamp when admin reviewed the detection)
ALTER TABLE public.detected_changes
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

-- Index for bank_name filtering (used by admin dashboard)
CREATE INDEX IF NOT EXISTS idx_detected_changes_bank_name
  ON public.detected_changes (bank_name);

COMMENT ON COLUMN public.detected_changes.card_name IS 'Card name as reported by AI classifier. Convenience column for admin dashboard display.';
COMMENT ON COLUMN public.detected_changes.bank_name IS 'Bank name from source_configs. Denormalized for efficient admin dashboard filtering.';
COMMENT ON COLUMN public.detected_changes.ai_notes IS 'AI classifier analysis_notes explaining classification reasoning.';
COMMENT ON COLUMN public.detected_changes.reviewed_at IS 'Timestamp when an admin reviewed and approved/rejected this detection.';
