-- =============================================================================
-- MaxiMile — User Data Schema (user_data.sql)
-- =============================================================================
-- Description: User-owned tables with Row Level Security (RLS).
--              Users can only see and modify their own data.
--
-- Tables:
--   user_cards      — user's credit card portfolio
--   transactions    — user-logged spending transactions
--   spending_state  — materialized monthly spend per user/card/category
--
-- Dependencies: card_rules.sql (categories, cards) must be created first.
--               Supabase auth.users must exist (provided by Supabase).
--
-- Author:  Data Engineer Agent
-- Created: 2026-02-19
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. user_cards — User's selected card portfolio
-- ---------------------------------------------------------------------------
CREATE TABLE public.user_cards (
  user_id    UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id    UUID         NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
  nickname   TEXT,                                   -- Optional user-given name
  is_default BOOLEAN      NOT NULL DEFAULT FALSE,    -- User's default card
  added_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  PRIMARY KEY (user_id, card_id),

  -- Constraints
  CONSTRAINT user_cards_nickname_length CHECK (nickname IS NULL OR char_length(nickname) <= 50)
);

COMMENT ON TABLE  public.user_cards IS 'Cards that a user has added to their portfolio for recommendations.';
COMMENT ON COLUMN public.user_cards.is_default IS 'If TRUE, this card is shown as the fallback when no bonus applies.';
COMMENT ON COLUMN public.user_cards.nickname IS 'Optional short label the user gives to their card (max 50 chars).';

CREATE TRIGGER user_cards_updated_at
  BEFORE UPDATE ON public.user_cards
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Indexes
CREATE INDEX idx_user_cards_user_id ON public.user_cards (user_id);
CREATE INDEX idx_user_cards_card_id ON public.user_cards (card_id);

-- RLS
ALTER TABLE public.user_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_cards_select ON public.user_cards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY user_cards_insert ON public.user_cards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_cards_update ON public.user_cards
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_cards_delete ON public.user_cards
  FOR DELETE USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 2. transactions — User-logged spending transactions
-- ---------------------------------------------------------------------------
CREATE TABLE public.transactions (
  id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id          UUID          NOT NULL REFERENCES public.cards(id) ON DELETE RESTRICT,
  category_id      TEXT          NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  amount           DECIMAL(10,2) NOT NULL,
  currency         TEXT          NOT NULL DEFAULT 'SGD',
  merchant_name    TEXT,                               -- Optional: user or auto-detected
  merchant_mcc     TEXT,                               -- Optional: MCC if known
  transaction_date DATE          NOT NULL DEFAULT CURRENT_DATE,
  notes            TEXT,                               -- User notes
  logged_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT transactions_amount_positive CHECK (amount > 0),
  CONSTRAINT transactions_currency_format CHECK (currency ~ '^[A-Z]{3}$'),
  CONSTRAINT transactions_date_not_future CHECK (transaction_date <= CURRENT_DATE + INTERVAL '1 day'),
  CONSTRAINT transactions_merchant_name_length CHECK (merchant_name IS NULL OR char_length(merchant_name) <= 200)
);

COMMENT ON TABLE  public.transactions IS 'User-logged credit card transactions for spend tracking and cap monitoring.';
COMMENT ON COLUMN public.transactions.amount IS 'Transaction amount in the specified currency (always positive).';
COMMENT ON COLUMN public.transactions.currency IS 'ISO 4217 currency code, defaults to SGD.';
COMMENT ON COLUMN public.transactions.merchant_mcc IS 'Merchant Category Code if known; used for category auto-detection in future.';
COMMENT ON COLUMN public.transactions.logged_at IS 'When the user logged this transaction (may differ from transaction_date).';

CREATE TRIGGER transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Indexes: the hot paths are "my recent transactions" and "my spend this month on card X"
CREATE INDEX idx_transactions_user_id       ON public.transactions (user_id);
CREATE INDEX idx_transactions_user_date     ON public.transactions (user_id, transaction_date DESC);
CREATE INDEX idx_transactions_user_card     ON public.transactions (user_id, card_id);
CREATE INDEX idx_transactions_user_month    ON public.transactions (user_id, card_id, category_id, transaction_date);
CREATE INDEX idx_transactions_logged_at     ON public.transactions (logged_at DESC);

-- RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY transactions_select ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY transactions_insert ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY transactions_update ON public.transactions
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY transactions_delete ON public.transactions
  FOR DELETE USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 3. spending_state — Materialized monthly spend per user/card/category
-- ---------------------------------------------------------------------------
CREATE TABLE public.spending_state (
  user_id        UUID          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id        UUID          NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
  category_id    TEXT          NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  month          TEXT          NOT NULL,            -- Format: 'YYYY-MM', e.g. '2026-02'
  total_spent    DECIMAL(12,2) NOT NULL DEFAULT 0,  -- Aggregated spend in SGD
  remaining_cap  DECIMAL(12,2),                      -- NULL if no cap; otherwise cap minus total_spent
  updated_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  PRIMARY KEY (user_id, card_id, category_id, month),

  -- Constraints
  CONSTRAINT spending_state_month_format CHECK (month ~ '^\d{4}-(0[1-9]|1[0-2])$'),
  CONSTRAINT spending_state_total_non_negative CHECK (total_spent >= 0)
);

COMMENT ON TABLE  public.spending_state IS 'Materialized monthly spending totals per user/card/category for cap tracking.';
COMMENT ON COLUMN public.spending_state.month IS 'Calendar month in YYYY-MM format, e.g. 2026-02.';
COMMENT ON COLUMN public.spending_state.total_spent IS 'Sum of transaction amounts for this user/card/category in this month.';
COMMENT ON COLUMN public.spending_state.remaining_cap IS 'Monthly cap minus total_spent. NULL if no cap applies to this card+category.';

CREATE TRIGGER spending_state_updated_at
  BEFORE UPDATE ON public.spending_state
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Indexes
CREATE INDEX idx_spending_state_user_month    ON public.spending_state (user_id, month);
CREATE INDEX idx_spending_state_user_card     ON public.spending_state (user_id, card_id, month);
CREATE INDEX idx_spending_state_low_cap       ON public.spending_state (remaining_cap)
  WHERE remaining_cap IS NOT NULL AND remaining_cap <= 0;

-- RLS
ALTER TABLE public.spending_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY spending_state_select ON public.spending_state
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY spending_state_insert ON public.spending_state
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY spending_state_update ON public.spending_state
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY spending_state_delete ON public.spending_state
  FOR DELETE USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 4. Trigger: Auto-update spending_state on transaction INSERT
-- ---------------------------------------------------------------------------
-- When a transaction is inserted, this trigger upserts the corresponding
-- spending_state row, incrementing total_spent and recalculating remaining_cap.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_spending_state_on_transaction()
RETURNS TRIGGER AS $$
DECLARE
  v_month TEXT;
  v_cap   DECIMAL(12,2);
  v_new_total DECIMAL(12,2);
BEGIN
  -- Derive the month from the transaction date
  v_month := TO_CHAR(NEW.transaction_date, 'YYYY-MM');

  -- Look up the monthly cap for this card+category (if any)
  SELECT monthly_cap_amount INTO v_cap
  FROM public.caps
  WHERE card_id = NEW.card_id
    AND (category_id = NEW.category_id OR category_id IS NULL)
  ORDER BY category_id NULLS LAST  -- prefer category-specific cap over global
  LIMIT 1;

  -- Upsert spending_state
  INSERT INTO public.spending_state (user_id, card_id, category_id, month, total_spent, remaining_cap)
  VALUES (
    NEW.user_id,
    NEW.card_id,
    NEW.category_id,
    v_month,
    NEW.amount,
    CASE WHEN v_cap IS NOT NULL THEN v_cap - NEW.amount ELSE NULL END
  )
  ON CONFLICT (user_id, card_id, category_id, month)
  DO UPDATE SET
    total_spent   = spending_state.total_spent + EXCLUDED.total_spent,
    remaining_cap = CASE
      WHEN v_cap IS NOT NULL THEN v_cap - (spending_state.total_spent + EXCLUDED.total_spent)
      ELSE NULL
    END,
    updated_at    = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.update_spending_state_on_transaction()
  IS 'Trigger function: upserts spending_state when a transaction is inserted, updating totals and remaining cap.';

CREATE TRIGGER trg_transaction_update_spending_state
  AFTER INSERT ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_spending_state_on_transaction();

-- ---------------------------------------------------------------------------
-- 5. Trigger: Recalculate spending_state on transaction DELETE
-- ---------------------------------------------------------------------------
-- When a transaction is deleted, decrement the corresponding spending_state.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_spending_state_on_transaction_delete()
RETURNS TRIGGER AS $$
DECLARE
  v_month TEXT;
  v_cap   DECIMAL(12,2);
BEGIN
  v_month := TO_CHAR(OLD.transaction_date, 'YYYY-MM');

  SELECT monthly_cap_amount INTO v_cap
  FROM public.caps
  WHERE card_id = OLD.card_id
    AND (category_id = OLD.category_id OR category_id IS NULL)
  ORDER BY category_id NULLS LAST
  LIMIT 1;

  UPDATE public.spending_state
  SET
    total_spent   = GREATEST(total_spent - OLD.amount, 0),
    remaining_cap = CASE
      WHEN v_cap IS NOT NULL THEN v_cap - GREATEST(total_spent - OLD.amount, 0)
      ELSE NULL
    END,
    updated_at    = NOW()
  WHERE user_id     = OLD.user_id
    AND card_id     = OLD.card_id
    AND category_id = OLD.category_id
    AND month       = v_month;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.update_spending_state_on_transaction_delete()
  IS 'Trigger function: decrements spending_state when a transaction is deleted.';

CREATE TRIGGER trg_transaction_delete_spending_state
  AFTER DELETE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_spending_state_on_transaction_delete();
