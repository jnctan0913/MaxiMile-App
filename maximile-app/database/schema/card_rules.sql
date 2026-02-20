-- =============================================================================
-- MaxiMile — Card Rules Schema (card_rules.sql)
-- =============================================================================
-- Description: Core reference tables for credit card miles earning rules.
--              These tables are publicly readable (no RLS) and admin-writable.
--
-- Tables:
--   categories  — 7 fixed spend categories with MCC mappings
--   cards       — supported credit card metadata
--   earn_rules  — miles earn rates per card per category
--   caps        — monthly bonus spending caps
--   exclusions  — MCC / condition-based exclusions from bonus earning
--
-- Author:  Data Engineer Agent
-- Created: 2026-02-19
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 0. Utility: updated_at trigger function (shared across tables)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.set_updated_at()
  IS 'Automatically sets updated_at to current timestamp on row update.';

-- ---------------------------------------------------------------------------
-- 1. categories — Spend category taxonomy
-- ---------------------------------------------------------------------------
CREATE TABLE public.categories (
  id            TEXT        PRIMARY KEY,          -- e.g. 'dining', 'transport'
  name          TEXT        NOT NULL,             -- Display name
  display_order INT         NOT NULL DEFAULT 0,   -- UI sort order
  icon          TEXT,                              -- Icon name / emoji for UI
  mccs          TEXT[]      NOT NULL DEFAULT '{}', -- Array of MCC codes
  description   TEXT,                              -- Short user-facing description
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT categories_id_format CHECK (id ~ '^[a-z_]+$'),
  CONSTRAINT categories_display_order_positive CHECK (display_order >= 0)
);

COMMENT ON TABLE  public.categories IS 'Fixed spend categories used for card earn-rate lookups.';
COMMENT ON COLUMN public.categories.id IS 'Lowercase slug identifier, e.g. dining, transport, general.';
COMMENT ON COLUMN public.categories.mccs IS 'Array of MCC codes (as text) that map to this category.';
COMMENT ON COLUMN public.categories.display_order IS 'Ascending sort order for UI display (0 = first).';

CREATE TRIGGER categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Index: rarely queried beyond PK, but useful for ordering
CREATE INDEX idx_categories_display_order ON public.categories (display_order);

-- ---------------------------------------------------------------------------
-- 2. cards — Credit card metadata
-- ---------------------------------------------------------------------------
CREATE TABLE public.cards (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  bank          TEXT          NOT NULL,                     -- e.g. 'DBS', 'UOB'
  name          TEXT          NOT NULL,                     -- e.g. 'Altitude Visa'
  slug          TEXT          NOT NULL UNIQUE,              -- URL-safe slug, e.g. 'dbs-altitude-visa'
  network       TEXT          NOT NULL DEFAULT 'visa',      -- 'visa', 'mastercard', 'amex'
  annual_fee    DECIMAL(8,2) NOT NULL DEFAULT 0,            -- SGD, 0 = no fee / first year waived
  base_rate_mpd DECIMAL(5,2) NOT NULL DEFAULT 0.4,          -- Base miles per dollar (outside bonus)
  image_url     TEXT,                                        -- Card face image URL
  apply_url     TEXT,                                        -- Bank application link
  is_active     BOOLEAN       NOT NULL DEFAULT TRUE,         -- FALSE = discontinued / hidden
  notes         TEXT,                                        -- Admin notes / caveats
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT cards_network_valid CHECK (network IN ('visa', 'mastercard', 'amex')),
  CONSTRAINT cards_annual_fee_non_negative CHECK (annual_fee >= 0),
  CONSTRAINT cards_base_rate_non_negative CHECK (base_rate_mpd >= 0),
  CONSTRAINT cards_slug_format CHECK (slug ~ '^[a-z0-9-]+$')
);

COMMENT ON TABLE  public.cards IS 'Supported Singapore miles credit cards with metadata.';
COMMENT ON COLUMN public.cards.slug IS 'URL-safe unique identifier for the card (lowercase, hyphens only).';
COMMENT ON COLUMN public.cards.network IS 'Card network: visa, mastercard, or amex.';
COMMENT ON COLUMN public.cards.base_rate_mpd IS 'Base miles-per-dollar earn rate outside any bonus category.';
COMMENT ON COLUMN public.cards.annual_fee IS 'Annual fee in SGD. 0 indicates no fee or first-year waiver.';
COMMENT ON COLUMN public.cards.is_active IS 'FALSE hides the card from new selection; existing users keep it.';

CREATE TRIGGER cards_updated_at
  BEFORE UPDATE ON public.cards
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Indexes
CREATE INDEX idx_cards_bank       ON public.cards (bank);
CREATE INDEX idx_cards_is_active  ON public.cards (is_active) WHERE is_active = TRUE;
CREATE INDEX idx_cards_slug       ON public.cards (slug);

-- ---------------------------------------------------------------------------
-- 3. earn_rules — Miles earn rate per card per category
-- ---------------------------------------------------------------------------
CREATE TABLE public.earn_rules (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id         UUID          NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
  category_id     TEXT          NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  earn_rate_mpd   DECIMAL(5,2)  NOT NULL,          -- Miles per dollar for this combo
  is_bonus        BOOLEAN       NOT NULL DEFAULT TRUE,  -- TRUE = bonus rate, FALSE = base rate passthrough
  conditions      JSONB         DEFAULT '{}',       -- e.g. {"min_spend_monthly": 500, "contactless_only": true}
  conditions_note TEXT,                              -- Human-readable summary of conditions
  effective_from  DATE          NOT NULL DEFAULT CURRENT_DATE,
  effective_to    DATE,                              -- NULL = currently active
  source_url      TEXT,                              -- Bank T&C or blog URL used for this data
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT earn_rules_rate_non_negative CHECK (earn_rate_mpd >= 0),
  CONSTRAINT earn_rules_dates_valid CHECK (effective_to IS NULL OR effective_to >= effective_from),
  CONSTRAINT earn_rules_unique_active UNIQUE (card_id, category_id, is_bonus, effective_from)
);

COMMENT ON TABLE  public.earn_rules IS 'Per-card, per-category miles earn rates including bonus and base rates.';
COMMENT ON COLUMN public.earn_rules.earn_rate_mpd IS 'Miles earned per SGD spent. This is the TOTAL rate (not incremental).';
COMMENT ON COLUMN public.earn_rules.is_bonus IS 'TRUE = this is a bonus/accelerated rate; FALSE = base rate fallback.';
COMMENT ON COLUMN public.earn_rules.conditions IS 'JSONB conditions that must be met for this rate to apply (v1: assumed met).';
COMMENT ON COLUMN public.earn_rules.conditions_note IS 'Human-readable explanation of conditions, shown as footnote in UI.';
COMMENT ON COLUMN public.earn_rules.effective_to IS 'NULL means the rule is currently active with no known end date.';

CREATE TRIGGER earn_rules_updated_at
  BEFORE UPDATE ON public.earn_rules
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Indexes: the hot query path is "given a card_id, get all active earn rules"
CREATE INDEX idx_earn_rules_card_id        ON public.earn_rules (card_id);
CREATE INDEX idx_earn_rules_category_id    ON public.earn_rules (category_id);
CREATE INDEX idx_earn_rules_card_category  ON public.earn_rules (card_id, category_id);
CREATE INDEX idx_earn_rules_active         ON public.earn_rules (card_id, category_id)
  WHERE effective_to IS NULL;

-- ---------------------------------------------------------------------------
-- 4. caps — Monthly bonus spending caps
-- ---------------------------------------------------------------------------
CREATE TABLE public.caps (
  id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id           UUID          NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
  category_id       TEXT          REFERENCES public.categories(id) ON DELETE RESTRICT,  -- NULL = cap applies across all categories
  monthly_cap_amount DECIMAL(10,2) NOT NULL,  -- SGD cap amount per month
  cap_type          TEXT          NOT NULL DEFAULT 'spend',  -- 'spend' = cap on spend amount, 'miles' = cap on miles earned
  notes             TEXT,
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT caps_amount_positive CHECK (monthly_cap_amount > 0),
  CONSTRAINT caps_type_valid CHECK (cap_type IN ('spend', 'miles')),
  CONSTRAINT caps_unique_card_category UNIQUE (card_id, category_id)
);

COMMENT ON TABLE  public.caps IS 'Monthly bonus spending/miles caps per card, optionally per category.';
COMMENT ON COLUMN public.caps.category_id IS 'NULL means the cap applies across all bonus categories combined.';
COMMENT ON COLUMN public.caps.monthly_cap_amount IS 'Dollar amount (or miles amount depending on cap_type) cap per calendar month.';
COMMENT ON COLUMN public.caps.cap_type IS 'spend = cap on spend amount in SGD; miles = cap on total miles earned.';

CREATE TRIGGER caps_updated_at
  BEFORE UPDATE ON public.caps
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Indexes
CREATE INDEX idx_caps_card_id     ON public.caps (card_id);
CREATE INDEX idx_caps_card_cat    ON public.caps (card_id, category_id);

-- ---------------------------------------------------------------------------
-- 5. exclusions — MCC or condition-based exclusions from bonus earning
-- ---------------------------------------------------------------------------
CREATE TABLE public.exclusions (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id       UUID          NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
  category_id   TEXT          REFERENCES public.categories(id) ON DELETE RESTRICT,  -- NULL = exclusion applies globally
  excluded_mccs TEXT[]        DEFAULT '{}',   -- Specific MCCs excluded
  conditions    JSONB         DEFAULT '{}',   -- e.g. {"merchant_type": "government"} or {"payment_type": "recurring"}
  description   TEXT,                          -- Human-readable explanation
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  public.exclusions IS 'MCC codes and conditions excluded from bonus earning for a given card.';
COMMENT ON COLUMN public.exclusions.category_id IS 'NULL means the exclusion applies across all categories.';
COMMENT ON COLUMN public.exclusions.excluded_mccs IS 'Array of MCC codes that do NOT earn bonus rates on this card.';
COMMENT ON COLUMN public.exclusions.conditions IS 'JSONB conditions describing the exclusion (e.g. payment type, merchant type).';

CREATE TRIGGER exclusions_updated_at
  BEFORE UPDATE ON public.exclusions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Indexes
CREATE INDEX idx_exclusions_card_id     ON public.exclusions (card_id);
CREATE INDEX idx_exclusions_card_cat    ON public.exclusions (card_id, category_id);

-- ---------------------------------------------------------------------------
-- Public read access (no RLS on reference tables)
-- ---------------------------------------------------------------------------
-- These tables are world-readable. Write access is restricted to service_role
-- (admin) via Supabase default policies. No RLS needed.
-- ---------------------------------------------------------------------------
