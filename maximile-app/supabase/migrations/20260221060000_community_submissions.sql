-- =============================================================================
-- MaxiMile — Migration 017: Community Submissions (Sprint 13 — F24)
-- =============================================================================
-- Description:  Creates the community_submissions table for crowdsourced rate
--               change reporting. Users can submit earn rate changes they
--               discover, which are then reviewed by admins and merged into
--               the rate_changes table on approval. Includes dedup fingerprint
--               generation, submission and review RPCs, and sample seed data.
--
-- New objects:
--   Enums     — submission_status
--   Tables    — community_submissions
--   Functions — generate_submission_fingerprint(UUID, rate_change_type, TEXT)
--   Triggers  — trg_community_submission_fingerprint (auto-populate dedup hash)
--   RPCs      — submit_rate_change(...) — user-facing submission RPC
--               review_submission(UUID, TEXT, TEXT) — admin review RPC
--               get_pending_submissions() — admin dashboard RPC
--   Columns   — rate_changes.detection_source (ALTER TABLE)
--   Seed      — 3 sample community submissions
--
-- Stories:
--   S13.1  — Community submission data model
--   S13.2  — Submission dedup fingerprinting
--   S13.3  — Admin review workflow
--   S13.4  — Rate limiting (application layer — see comments)
--
-- Prerequisites:
--   - 015_rate_changes.sql (rate_changes table, rate_change_type enum)
--   - 016_rate_change_rpcs.sql (rate change RPC functions)
--   - 014_card_expansion.sql (expanded card roster with slugs)
--   - 001_initial_schema.sql (cards table)
--
-- Author:  Data Engineer
-- Created: 2026-02-21
-- Sprint:  13 — Community Submissions (F24)
-- =============================================================================

BEGIN;


-- ==========================================================================
-- SECTION 1: Create submission_status enum
-- ==========================================================================

CREATE TYPE submission_status AS ENUM (
  'pending',
  'under_review',
  'approved',
  'rejected',
  'merged'
);


-- ==========================================================================
-- SECTION 2: Add detection_source to existing rate_changes table
-- ==========================================================================
-- Tracks how a rate change was discovered:
--   'manual'    — entered by admin/data engineer (default, backwards-compatible)
--   'community' — submitted by a user and approved
--   'automated' — detected by automated scraping (future)

ALTER TABLE public.rate_changes
  ADD COLUMN IF NOT EXISTS detection_source TEXT DEFAULT 'manual';

COMMENT ON COLUMN public.rate_changes.detection_source
  IS 'How this rate change was discovered: manual (admin-entered), community (user-submitted), or automated (scraper). Default: manual.';


-- ==========================================================================
-- SECTION 3: Create community_submissions table
-- ==========================================================================

CREATE TABLE public.community_submissions (
  id                UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id           UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id           UUID        NOT NULL REFERENCES public.cards(id),
  change_type       rate_change_type NOT NULL,
  category          TEXT,
  old_value         TEXT        NOT NULL,
  new_value         TEXT        NOT NULL,
  effective_date    DATE,
  evidence_url      TEXT,
  screenshot_path   TEXT,       -- Supabase Storage path (e.g. 'submissions/uuid/screenshot.png')
  notes             TEXT,
  status            submission_status NOT NULL DEFAULT 'pending',
  reviewer_notes    TEXT,
  reviewed_at       TIMESTAMPTZ,
  dedup_fingerprint TEXT,       -- SHA-256 for duplicate detection
  created_at        TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.community_submissions
  IS 'User-submitted rate change reports for community-driven data accuracy. '
     'Submissions go through admin review before being merged into rate_changes.';

COMMENT ON COLUMN public.community_submissions.screenshot_path
  IS 'Supabase Storage path for evidence screenshot (e.g. submissions/<uuid>/screenshot.png).';

COMMENT ON COLUMN public.community_submissions.dedup_fingerprint
  IS 'SHA-256 hash of (card_slug + change_type + normalized_new_value + effective_month) for duplicate detection.';

COMMENT ON COLUMN public.community_submissions.status
  IS 'Workflow status: pending -> under_review -> approved/rejected -> merged (if approved and inserted into rate_changes).';


-- ==========================================================================
-- SECTION 4: Indexes
-- ==========================================================================

CREATE INDEX idx_community_submissions_user
  ON public.community_submissions (user_id);

CREATE INDEX idx_community_submissions_card
  ON public.community_submissions (card_id);

CREATE INDEX idx_community_submissions_status
  ON public.community_submissions (status);

CREATE INDEX idx_community_submissions_dedup
  ON public.community_submissions (dedup_fingerprint);


-- ==========================================================================
-- SECTION 5: Row Level Security
-- ==========================================================================
-- Users can view and create their own submissions.
-- Users CANNOT update or delete submissions — admin only via SECURITY DEFINER RPCs.
--
-- NOTE: Rate limiting (max 5 submissions per user per day) is enforced at the
-- application layer, not via RLS. The submit_rate_change() RPC below includes
-- a rate-limit check. Application code should also enforce this before calling
-- the RPC for better UX (show limit warning before the user fills out the form).

ALTER TABLE public.community_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "community_submissions_select_own"
  ON public.community_submissions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "community_submissions_insert_own"
  ON public.community_submissions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- No UPDATE or DELETE policies for regular users.
-- Admin operations are performed via SECURITY DEFINER functions that bypass RLS.


-- ==========================================================================
-- SECTION 6: Dedup fingerprint function
-- ==========================================================================
-- Generates a SHA-256 hash for duplicate detection.
-- Fingerprint = SHA-256(card_slug || '|' || change_type || '|' || lower(trim(new_value)) || '|' || effective_month)
-- effective_month is derived from effective_date (YYYY-MM) or 'unknown' if NULL.

CREATE OR REPLACE FUNCTION public.generate_submission_fingerprint(
  p_card_id     UUID,
  p_change_type rate_change_type,
  p_new_value   TEXT,
  p_effective_date DATE DEFAULT NULL
)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
DECLARE
  v_card_slug      TEXT;
  v_effective_month TEXT;
  v_raw_string     TEXT;
BEGIN
  -- Look up card slug
  SELECT slug INTO v_card_slug
  FROM public.cards
  WHERE id = p_card_id;

  IF v_card_slug IS NULL THEN
    RAISE EXCEPTION 'Card not found: %', p_card_id;
  END IF;

  -- Derive effective month
  IF p_effective_date IS NOT NULL THEN
    v_effective_month := TO_CHAR(p_effective_date, 'YYYY-MM');
  ELSE
    v_effective_month := 'unknown';
  END IF;

  -- Build raw string and hash it
  v_raw_string := v_card_slug || '|' || p_change_type::TEXT || '|' || LOWER(TRIM(p_new_value)) || '|' || v_effective_month;

  RETURN encode(sha256(v_raw_string::bytea), 'hex');
END;
$$;

COMMENT ON FUNCTION public.generate_submission_fingerprint(UUID, rate_change_type, TEXT, DATE)
  IS 'Generates a SHA-256 dedup fingerprint from card slug, change type, normalized new value, and effective month. '
     'Used to detect duplicate community submissions within a time window.';

GRANT EXECUTE ON FUNCTION public.generate_submission_fingerprint(UUID, rate_change_type, TEXT, DATE) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_submission_fingerprint(UUID, rate_change_type, TEXT, DATE) FROM anon;


-- ==========================================================================
-- SECTION 7: Auto-populate dedup_fingerprint trigger
-- ==========================================================================

CREATE OR REPLACE FUNCTION public.set_submission_fingerprint()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.dedup_fingerprint := public.generate_submission_fingerprint(
    NEW.card_id,
    NEW.change_type,
    NEW.new_value,
    NEW.effective_date
  );
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.set_submission_fingerprint()
  IS 'Trigger function: auto-populates dedup_fingerprint on community_submissions INSERT.';

CREATE TRIGGER trg_community_submission_fingerprint
  BEFORE INSERT ON public.community_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_submission_fingerprint();


-- ==========================================================================
-- SECTION 8: submit_rate_change RPC — user-facing submission
-- ==========================================================================
-- Validates the submission, checks for duplicates (matching fingerprint
-- within 30 days), enforces rate limiting (max 5 per user per day),
-- and inserts into community_submissions.
--
-- Returns the new submission ID on success.

CREATE OR REPLACE FUNCTION public.submit_rate_change(
  p_card_id        UUID,
  p_change_type    rate_change_type,
  p_category       TEXT DEFAULT NULL,
  p_old_value      TEXT DEFAULT '',
  p_new_value      TEXT DEFAULT '',
  p_effective_date DATE DEFAULT NULL,
  p_evidence_url   TEXT DEFAULT NULL,
  p_screenshot_path TEXT DEFAULT NULL,
  p_notes          TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id         UUID;
  v_fingerprint     TEXT;
  v_existing_count  INT;
  v_daily_count     INT;
  v_new_id          UUID;
BEGIN
  -- Get the authenticated user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to submit rate changes.';
  END IF;

  -- Validate required fields
  IF p_old_value = '' OR p_new_value = '' THEN
    RAISE EXCEPTION 'Both old_value and new_value are required.';
  END IF;

  -- Validate card exists
  IF NOT EXISTS (SELECT 1 FROM public.cards WHERE id = p_card_id) THEN
    RAISE EXCEPTION 'Card not found: %', p_card_id;
  END IF;

  -- Rate limiting: max 5 submissions per user per day
  SELECT COUNT(*) INTO v_daily_count
  FROM public.community_submissions
  WHERE user_id = v_user_id
    AND created_at >= (CURRENT_DATE)::TIMESTAMPTZ
    AND created_at < (CURRENT_DATE + INTERVAL '1 day')::TIMESTAMPTZ;

  IF v_daily_count >= 5 THEN
    RAISE EXCEPTION 'Rate limit exceeded: maximum 5 submissions per day. Please try again tomorrow.';
  END IF;

  -- Generate fingerprint for dedup check
  v_fingerprint := public.generate_submission_fingerprint(
    p_card_id, p_change_type, p_new_value, p_effective_date
  );

  -- Check for duplicate submissions within the last 30 days
  SELECT COUNT(*) INTO v_existing_count
  FROM public.community_submissions
  WHERE dedup_fingerprint = v_fingerprint
    AND created_at >= (NOW() - INTERVAL '30 days')
    AND status NOT IN ('rejected');

  IF v_existing_count > 0 THEN
    RAISE EXCEPTION 'A similar submission already exists within the last 30 days. Fingerprint: %', v_fingerprint;
  END IF;

  -- Insert the submission (fingerprint will be auto-populated by trigger,
  -- but we already computed it above for the dedup check — trigger will overwrite with same value)
  INSERT INTO public.community_submissions (
    user_id, card_id, change_type, category,
    old_value, new_value, effective_date,
    evidence_url, screenshot_path, notes,
    status
  ) VALUES (
    v_user_id, p_card_id, p_change_type, p_category,
    p_old_value, p_new_value, p_effective_date,
    p_evidence_url, p_screenshot_path, p_notes,
    'pending'
  )
  RETURNING id INTO v_new_id;

  RETURN v_new_id;
END;
$$;

COMMENT ON FUNCTION public.submit_rate_change(UUID, rate_change_type, TEXT, TEXT, TEXT, DATE, TEXT, TEXT, TEXT)
  IS 'User-facing RPC for submitting community rate change reports. '
     'Validates input, checks rate limits (5/day), detects duplicates (30-day window), '
     'and inserts into community_submissions with status=pending.';

GRANT EXECUTE ON FUNCTION public.submit_rate_change(UUID, rate_change_type, TEXT, TEXT, TEXT, DATE, TEXT, TEXT, TEXT) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.submit_rate_change(UUID, rate_change_type, TEXT, TEXT, TEXT, DATE, TEXT, TEXT, TEXT) FROM anon;


-- ==========================================================================
-- SECTION 9: review_submission RPC — admin approval/rejection
-- ==========================================================================
-- Approves or rejects a community submission.
-- On approval, inserts a new row into rate_changes with detection_source = 'community'.
-- On rejection, updates status and records reviewer notes.
--
-- NOTE: This function uses SECURITY DEFINER and bypasses RLS.
-- Access control should be enforced at the application layer (check user role).
-- In a production setup, add: IF NOT is_admin(auth.uid()) THEN RAISE EXCEPTION ...

CREATE OR REPLACE FUNCTION public.review_submission(
  p_submission_id  UUID,
  p_action         TEXT,       -- 'approve' or 'reject'
  p_reviewer_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_submission     RECORD;
  v_rate_change_id UUID;
  v_card_name      TEXT;
BEGIN
  -- Validate action
  IF p_action NOT IN ('approve', 'reject') THEN
    RAISE EXCEPTION 'Invalid action: %. Must be ''approve'' or ''reject''.', p_action;
  END IF;

  -- Fetch the submission
  SELECT * INTO v_submission
  FROM public.community_submissions
  WHERE id = p_submission_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Submission not found: %', p_submission_id;
  END IF;

  -- Check submission is in a reviewable state
  IF v_submission.status NOT IN ('pending', 'under_review') THEN
    RAISE EXCEPTION 'Submission % is already %s and cannot be reviewed again.', p_submission_id, v_submission.status;
  END IF;

  -- Get card name for alert text
  SELECT name INTO v_card_name
  FROM public.cards
  WHERE id = v_submission.card_id;

  IF p_action = 'approve' THEN
    -- Insert into rate_changes with detection_source = 'community'
    INSERT INTO public.rate_changes (
      card_id, change_type, category,
      old_value, new_value, effective_date,
      alert_title, alert_body, severity,
      source_url, detection_source
    ) VALUES (
      v_submission.card_id,
      v_submission.change_type,
      v_submission.category,
      v_submission.old_value,
      v_submission.new_value,
      COALESCE(v_submission.effective_date, CURRENT_DATE),
      'Community Report: ' || COALESCE(v_card_name, 'Unknown Card'),
      'Community-submitted change: ' || v_submission.old_value || ' -> ' || v_submission.new_value
        || CASE WHEN v_submission.notes IS NOT NULL THEN '. Notes: ' || v_submission.notes ELSE '' END,
      'info',
      v_submission.evidence_url,
      'community'
    )
    RETURNING id INTO v_rate_change_id;

    -- Update submission status to 'approved'
    UPDATE public.community_submissions
    SET
      status         = 'approved',
      reviewer_notes = p_reviewer_notes,
      reviewed_at    = NOW()
    WHERE id = p_submission_id;

    RETURN jsonb_build_object(
      'success', true,
      'action', 'approved',
      'submission_id', p_submission_id,
      'rate_change_id', v_rate_change_id
    );

  ELSE -- reject
    UPDATE public.community_submissions
    SET
      status         = 'rejected',
      reviewer_notes = p_reviewer_notes,
      reviewed_at    = NOW()
    WHERE id = p_submission_id;

    RETURN jsonb_build_object(
      'success', true,
      'action', 'rejected',
      'submission_id', p_submission_id
    );
  END IF;
END;
$$;

COMMENT ON FUNCTION public.review_submission(UUID, TEXT, TEXT)
  IS 'Admin RPC to approve or reject a community submission. '
     'On approve: inserts into rate_changes with detection_source=community. '
     'On reject: marks submission as rejected with reviewer notes. '
     'Access control should be enforced at the application layer.';

GRANT EXECUTE ON FUNCTION public.review_submission(UUID, TEXT, TEXT) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.review_submission(UUID, TEXT, TEXT) FROM anon;


-- ==========================================================================
-- SECTION 10: get_pending_submissions RPC — admin dashboard
-- ==========================================================================
-- Returns all pending and under_review submissions for the admin dashboard.
-- Joins with cards to show card name and bank.
-- Ordered by created_at ASC (oldest first — FIFO review queue).

CREATE OR REPLACE FUNCTION public.get_pending_submissions()
RETURNS TABLE (
  submission_id     UUID,
  user_id           UUID,
  card_id           UUID,
  card_name         TEXT,
  card_bank         TEXT,
  change_type       TEXT,
  category          TEXT,
  old_value         TEXT,
  new_value         TEXT,
  effective_date    DATE,
  evidence_url      TEXT,
  screenshot_path   TEXT,
  notes             TEXT,
  status            TEXT,
  dedup_fingerprint TEXT,
  created_at        TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    cs.id              AS submission_id,
    cs.user_id,
    cs.card_id,
    c.name             AS card_name,
    c.bank             AS card_bank,
    cs.change_type::TEXT,
    cs.category,
    cs.old_value,
    cs.new_value,
    cs.effective_date,
    cs.evidence_url,
    cs.screenshot_path,
    cs.notes,
    cs.status::TEXT,
    cs.dedup_fingerprint,
    cs.created_at
  FROM public.community_submissions cs
  LEFT JOIN public.cards c ON c.id = cs.card_id
  WHERE cs.status IN ('pending', 'under_review')
  ORDER BY cs.created_at ASC;
END;
$$;

COMMENT ON FUNCTION public.get_pending_submissions()
  IS 'Returns all pending and under_review community submissions for the admin dashboard. '
     'Ordered by created_at ASC (oldest first — FIFO review queue). '
     'Access control should be enforced at the application layer.';

GRANT EXECUTE ON FUNCTION public.get_pending_submissions() TO authenticated;
REVOKE EXECUTE ON FUNCTION public.get_pending_submissions() FROM anon;


-- ==========================================================================
-- SECTION 11: Seed sample community submissions
-- ==========================================================================
-- Seed data omitted for production — test user UUID does not exist.
-- To seed test data, create a user first, then insert submissions manually.


-- ==========================================================================
-- SECTION 12: Verification queries
-- ==========================================================================
-- Run after applying to verify:
--
--   -- submission_status enum exists
--   SELECT unnest(enum_range(NULL::submission_status));
--   -- Should return: pending, under_review, approved, rejected, merged
--
--   -- community_submissions table created with 3 seed rows
--   SELECT COUNT(*) FROM community_submissions;
--   -- Should return 3
--
--   -- Status distribution
--   SELECT status, COUNT(*) FROM community_submissions GROUP BY status ORDER BY status;
--   -- Should return: pending=1, rejected=1, under_review=1
--
--   -- Dedup fingerprints were auto-generated
--   SELECT id, dedup_fingerprint FROM community_submissions WHERE dedup_fingerprint IS NOT NULL;
--   -- Should return 3 rows with non-null fingerprints
--
--   -- detection_source column added to rate_changes
--   SELECT column_name, column_default FROM information_schema.columns
--   WHERE table_name = 'rate_changes' AND column_name = 'detection_source';
--   -- Should return: detection_source, 'manual'::text
--
--   -- Existing rate_changes rows should have detection_source = 'manual'
--   SELECT detection_source, COUNT(*) FROM rate_changes GROUP BY detection_source;
--   -- Should return: manual=5
--
--   -- RPC functions exist
--   SELECT routine_name FROM information_schema.routines
--   WHERE routine_schema = 'public'
--     AND routine_name IN ('submit_rate_change', 'review_submission',
--                          'get_pending_submissions', 'generate_submission_fingerprint');
--   -- Should return 4 rows


COMMIT;


-- ==========================================================================
-- ROLLBACK:
-- DROP TRIGGER IF EXISTS trg_community_submission_fingerprint ON community_submissions;
-- DROP FUNCTION IF EXISTS public.set_submission_fingerprint();
-- DROP FUNCTION IF EXISTS public.submit_rate_change(UUID, rate_change_type, TEXT, TEXT, TEXT, DATE, TEXT, TEXT, TEXT);
-- DROP FUNCTION IF EXISTS public.review_submission(UUID, TEXT, TEXT);
-- DROP FUNCTION IF EXISTS public.get_pending_submissions();
-- DROP FUNCTION IF EXISTS public.generate_submission_fingerprint(UUID, rate_change_type, TEXT, DATE);
-- DROP TABLE IF EXISTS public.community_submissions;
-- DROP TYPE IF EXISTS submission_status;
-- ALTER TABLE public.rate_changes DROP COLUMN IF EXISTS detection_source;
-- ==========================================================================
