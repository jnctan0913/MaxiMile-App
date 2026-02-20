-- 006_privacy_consent.sql
-- Immutable audit log for privacy-policy consent at signup

CREATE TABLE IF NOT EXISTS public.privacy_consents (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  policy_version TEXT        NOT NULL DEFAULT '1.0',
  consented_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  platform       TEXT,
  app_version    TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for quick per-user lookups
CREATE INDEX IF NOT EXISTS idx_privacy_consents_user_id ON public.privacy_consents(user_id);

-- RLS: users can only see and insert their own rows. No UPDATE/DELETE (immutable).
ALTER TABLE public.privacy_consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own consents"
  ON public.privacy_consents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own consents"
  ON public.privacy_consents FOR INSERT
  WITH CHECK (auth.uid() = user_id);
