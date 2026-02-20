-- =============================================================================
-- MaxiMile — Initial Schema Migration (001_initial_schema.sql)
-- =============================================================================
-- Description: Creates all database tables, indexes, triggers, RLS policies,
--              and seeds the category taxonomy for the MaxiMile app.
--
-- Execution order:
--   1. Utility functions (set_updated_at trigger)
--   2. categories table + seed data (no FK dependencies)
--   3. cards table (no FK dependencies beyond itself)
--   4. earn_rules table (depends on cards, categories)
--   5. caps table (depends on cards, categories)
--   6. exclusions table (depends on cards, categories)
--   7. user_cards table (depends on auth.users, cards)
--   8. transactions table (depends on auth.users, cards, categories)
--   9. spending_state table (depends on auth.users, cards, categories)
--  10. Triggers for spending_state auto-update
--
-- Dependencies: Supabase auth.users must exist (provided by Supabase platform).
--
-- Author:  Data Engineer Agent
-- Created: 2026-02-19
-- =============================================================================

BEGIN;

-- ==========================================================================
-- SECTION 1: Utility Functions
-- ==========================================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.set_updated_at()
  IS 'Automatically sets updated_at to current timestamp on row update.';


-- ==========================================================================
-- SECTION 2: Categories Table + Seed Data
-- ==========================================================================

CREATE TABLE public.categories (
  id            TEXT        PRIMARY KEY,
  name          TEXT        NOT NULL,
  display_order INT         NOT NULL DEFAULT 0,
  icon          TEXT,
  mccs          TEXT[]      NOT NULL DEFAULT '{}',
  description   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

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

CREATE INDEX idx_categories_display_order ON public.categories (display_order);

-- Seed the 7 categories
INSERT INTO public.categories (id, name, display_order, icon, mccs, description)
VALUES
(
  'dining', 'Dining', 1, 'utensils',
  ARRAY['5811','5812','5813','5814'],
  'Restaurants, cafes, bars, fast food, food delivery apps (when coded as dining)'
),
(
  'transport', 'Transport', 2, 'car',
  ARRAY['4121','4131','4111','4112','4789','7512','7523'],
  'Taxis, ride-hailing (Grab/Gojek), public transport, car rentals, parking'
),
(
  'online', 'Online Shopping', 3, 'globe',
  ARRAY['5262','5310','5311','5399','5944','5945','5946','5947','5964','5965','5966','5967','5968','5969','7372','5818','5816','5817'],
  'E-commerce (Shopee, Lazada, Amazon), online subscriptions, digital goods'
),
(
  'groceries', 'Groceries', 4, 'shopping-cart',
  ARRAY['5411','5422','5441','5451','5462','5499'],
  'Supermarkets (FairPrice, Cold Storage, Sheng Siong), bakeries, specialty food stores'
),
(
  'petrol', 'Petrol', 5, 'fuel',
  ARRAY['5541','5542','5983'],
  'Petrol stations (Shell, Esso, Caltex, SPC), fuel dispensers'
),
(
  'travel', 'Travel', 6, 'plane',
  ARRAY[
    '3000','3001','3002','3003','3004','3005','3006','3007','3008','3009',
    '3010','3011','3012','3013','3014','3015','3016','3017','3018','3019',
    '3020','3021','3022','3023','3024','3025','3026','3027','3028','3029',
    '3030','3031','3032','3033','3034','3035','3036','3037','3038','3039',
    '3040','3041','3042','3043','3044','3045','3046','3047','3048','3049',
    '3050','3051','3052','3053','3054','3055','3056','3057','3058','3059',
    '3060','3061','3062','3063','3064','3065','3066','3067','3068','3069',
    '3070','3071','3072','3073','3074','3075','3076','3077','3078','3079',
    '3080','3081','3082','3083','3084','3085','3086','3087','3088','3089',
    '3090','3091','3092','3093','3094','3095','3096','3097','3098','3099',
    '3100','3101','3102','3103','3104','3105','3106','3107','3108','3109',
    '3110','3111','3112','3113','3114','3115','3116','3117','3118','3119',
    '3120','3121','3122','3123','3124','3125','3126','3127','3128','3129',
    '3130','3131','3132','3133','3134','3135','3136','3137','3138','3139',
    '3140','3141','3142','3143','3144','3145','3146','3147','3148','3149',
    '3150','3151','3152','3153','3154','3155','3156','3157','3158','3159',
    '3160','3161','3162','3163','3164','3165','3166','3167','3168','3169',
    '3170','3171','3172','3173','3174','3175','3176','3177','3178','3179',
    '3180','3181','3182','3183','3184','3185','3186','3187','3188','3189',
    '3190','3191','3192','3193','3194','3195','3196','3197','3198','3199',
    '3200','3201','3202','3203','3204','3205','3206','3207','3208','3209',
    '3210','3211','3212','3213','3214','3215','3216','3217','3218','3219',
    '3220','3221','3222','3223','3224','3225','3226','3227','3228','3229',
    '3230','3231','3232','3233','3234','3235','3236','3237','3238','3239',
    '3240','3241','3242','3243','3244','3245','3246','3247','3248','3249',
    '3250','3251','3252','3253','3254','3255','3256','3257','3258','3259',
    '3260','3261','3262','3263','3264','3265','3266','3267','3268','3269',
    '3270','3271','3272','3273','3274','3275','3276','3277','3278','3279',
    '3280','3281','3282','3283','3284','3285','3286','3287','3288','3289',
    '3290','3291','3292','3293','3294','3295','3296','3297','3298','3299',
    '3501','3502','3503','3504','3505',
    '7011','4411','4511','4722','7991'
  ],
  'Flights, hotels, cruises, travel agencies, tour bookings'
),
(
  'general', 'General', 7, 'circle',
  ARRAY[]::TEXT[],
  'All other spending not classified in the above categories'
);


-- ==========================================================================
-- SECTION 3: Cards Table
-- ==========================================================================

CREATE TABLE public.cards (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  bank          TEXT          NOT NULL,
  name          TEXT          NOT NULL,
  slug          TEXT          NOT NULL UNIQUE,
  network       TEXT          NOT NULL DEFAULT 'visa',
  annual_fee    DECIMAL(8,2)  NOT NULL DEFAULT 0,
  base_rate_mpd DECIMAL(5,2)  NOT NULL DEFAULT 0.4,
  image_url     TEXT,
  apply_url     TEXT,
  is_active     BOOLEAN       NOT NULL DEFAULT TRUE,
  notes         TEXT,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

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

CREATE INDEX idx_cards_bank       ON public.cards (bank);
CREATE INDEX idx_cards_is_active  ON public.cards (is_active) WHERE is_active = TRUE;
CREATE INDEX idx_cards_slug       ON public.cards (slug);


-- ==========================================================================
-- SECTION 4: Earn Rules Table
-- ==========================================================================

CREATE TABLE public.earn_rules (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id         UUID          NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
  category_id     TEXT          NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  earn_rate_mpd   DECIMAL(5,2)  NOT NULL,
  is_bonus        BOOLEAN       NOT NULL DEFAULT TRUE,
  conditions      JSONB         DEFAULT '{}',
  conditions_note TEXT,
  effective_from  DATE          NOT NULL DEFAULT CURRENT_DATE,
  effective_to    DATE,
  source_url      TEXT,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

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

CREATE INDEX idx_earn_rules_card_id        ON public.earn_rules (card_id);
CREATE INDEX idx_earn_rules_category_id    ON public.earn_rules (category_id);
CREATE INDEX idx_earn_rules_card_category  ON public.earn_rules (card_id, category_id);
CREATE INDEX idx_earn_rules_active         ON public.earn_rules (card_id, category_id)
  WHERE effective_to IS NULL;


-- ==========================================================================
-- SECTION 5: Caps Table
-- ==========================================================================

CREATE TABLE public.caps (
  id                 UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id            UUID          NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
  category_id        TEXT          REFERENCES public.categories(id) ON DELETE RESTRICT,
  monthly_cap_amount DECIMAL(10,2) NOT NULL,
  cap_type           TEXT          NOT NULL DEFAULT 'spend',
  notes              TEXT,
  created_at         TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

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

CREATE INDEX idx_caps_card_id  ON public.caps (card_id);
CREATE INDEX idx_caps_card_cat ON public.caps (card_id, category_id);


-- ==========================================================================
-- SECTION 6: Exclusions Table
-- ==========================================================================

CREATE TABLE public.exclusions (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id       UUID          NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
  category_id   TEXT          REFERENCES public.categories(id) ON DELETE RESTRICT,
  excluded_mccs TEXT[]        DEFAULT '{}',
  conditions    JSONB         DEFAULT '{}',
  description   TEXT,
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

CREATE INDEX idx_exclusions_card_id  ON public.exclusions (card_id);
CREATE INDEX idx_exclusions_card_cat ON public.exclusions (card_id, category_id);


-- ==========================================================================
-- SECTION 7: User Cards Table
-- ==========================================================================

CREATE TABLE public.user_cards (
  user_id    UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id    UUID         NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
  nickname   TEXT,
  is_default BOOLEAN      NOT NULL DEFAULT FALSE,
  added_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  PRIMARY KEY (user_id, card_id),

  CONSTRAINT user_cards_nickname_length CHECK (nickname IS NULL OR char_length(nickname) <= 50)
);

COMMENT ON TABLE  public.user_cards IS 'Cards that a user has added to their portfolio for recommendations.';
COMMENT ON COLUMN public.user_cards.is_default IS 'If TRUE, this card is shown as the fallback when no bonus applies.';
COMMENT ON COLUMN public.user_cards.nickname IS 'Optional short label the user gives to their card (max 50 chars).';

CREATE TRIGGER user_cards_updated_at
  BEFORE UPDATE ON public.user_cards
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_user_cards_user_id ON public.user_cards (user_id);
CREATE INDEX idx_user_cards_card_id ON public.user_cards (card_id);

ALTER TABLE public.user_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_cards_select ON public.user_cards
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY user_cards_insert ON public.user_cards
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY user_cards_update ON public.user_cards
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY user_cards_delete ON public.user_cards
  FOR DELETE USING (auth.uid() = user_id);


-- ==========================================================================
-- SECTION 8: Transactions Table
-- ==========================================================================

CREATE TABLE public.transactions (
  id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id          UUID          NOT NULL REFERENCES public.cards(id) ON DELETE RESTRICT,
  category_id      TEXT          NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  amount           DECIMAL(10,2) NOT NULL,
  currency         TEXT          NOT NULL DEFAULT 'SGD',
  merchant_name    TEXT,
  merchant_mcc     TEXT,
  transaction_date DATE          NOT NULL DEFAULT CURRENT_DATE,
  notes            TEXT,
  logged_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

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

CREATE INDEX idx_transactions_user_id    ON public.transactions (user_id);
CREATE INDEX idx_transactions_user_date  ON public.transactions (user_id, transaction_date DESC);
CREATE INDEX idx_transactions_user_card  ON public.transactions (user_id, card_id);
CREATE INDEX idx_transactions_user_month ON public.transactions (user_id, card_id, category_id, transaction_date);
CREATE INDEX idx_transactions_logged_at  ON public.transactions (logged_at DESC);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY transactions_select ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY transactions_insert ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY transactions_update ON public.transactions
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY transactions_delete ON public.transactions
  FOR DELETE USING (auth.uid() = user_id);


-- ==========================================================================
-- SECTION 9: Spending State Table
-- ==========================================================================

CREATE TABLE public.spending_state (
  user_id       UUID          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id       UUID          NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
  category_id   TEXT          NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  month         TEXT          NOT NULL,
  total_spent   DECIMAL(12,2) NOT NULL DEFAULT 0,
  remaining_cap DECIMAL(12,2),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  PRIMARY KEY (user_id, card_id, category_id, month),

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

CREATE INDEX idx_spending_state_user_month ON public.spending_state (user_id, month);
CREATE INDEX idx_spending_state_user_card  ON public.spending_state (user_id, card_id, month);
CREATE INDEX idx_spending_state_low_cap    ON public.spending_state (remaining_cap)
  WHERE remaining_cap IS NOT NULL AND remaining_cap <= 0;

ALTER TABLE public.spending_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY spending_state_select ON public.spending_state
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY spending_state_insert ON public.spending_state
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY spending_state_update ON public.spending_state
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY spending_state_delete ON public.spending_state
  FOR DELETE USING (auth.uid() = user_id);


-- ==========================================================================
-- SECTION 10: Triggers for Spending State Auto-Update
-- ==========================================================================

-- On INSERT: upsert spending_state
CREATE OR REPLACE FUNCTION public.update_spending_state_on_transaction()
RETURNS TRIGGER AS $$
DECLARE
  v_month TEXT;
  v_cap   DECIMAL(12,2);
  v_new_total DECIMAL(12,2);
BEGIN
  v_month := TO_CHAR(NEW.transaction_date, 'YYYY-MM');

  SELECT monthly_cap_amount INTO v_cap
  FROM public.caps
  WHERE card_id = NEW.card_id
    AND (category_id = NEW.category_id OR category_id IS NULL)
  ORDER BY category_id NULLS LAST
  LIMIT 1;

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
  IS 'Trigger function: upserts spending_state when a transaction is inserted.';

CREATE TRIGGER trg_transaction_update_spending_state
  AFTER INSERT ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_spending_state_on_transaction();

-- On DELETE: decrement spending_state
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


COMMIT;
