-- 20260221100000_privacy_consents.sql
-- Immutable audit log for privacy-policy consent at signup.
-- Mirrors database/migrations/006_privacy_consent.sql for the supabase CLI.

CREATE TABLE IF NOT EXISTS public.privacy_consents (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  policy_version TEXT        NOT NULL DEFAULT '1.0',
  consented_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  platform       TEXT,
  app_version    TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_privacy_consents_user_id
  ON public.privacy_consents(user_id);

ALTER TABLE public.privacy_consents ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'privacy_consents'
      AND policyname = 'Users can view own consents'
  ) THEN
    CREATE POLICY "Users can view own consents"
      ON public.privacy_consents FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'privacy_consents'
      AND policyname = 'Users can insert own consents'
  ) THEN
    CREATE POLICY "Users can insert own consents"
      ON public.privacy_consents FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
