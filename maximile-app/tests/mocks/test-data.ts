/**
 * MaxiMile Test Data Fixtures
 *
 * Realistic mock data drawn from a subset of Batch 1 seed cards.
 * Used across all unit test files for consistent, predictable testing.
 */

import type {
  Card,
  Category,
  EarnRule,
  Cap,
  UserCard,
  Transaction,
  SpendingState,
  RecommendResult,
  UserSettings,
} from '../../lib/supabase-types';

// ---------------------------------------------------------------------------
// Mock User & Session
// ---------------------------------------------------------------------------

export const MOCK_USER_ID = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeee0001';
export const MOCK_USER_ID_2 = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeee0002';

export const mockUser = {
  id: MOCK_USER_ID,
  email: 'test@maximile.app',
  aud: 'authenticated',
  role: 'authenticated',
  created_at: '2026-02-01T00:00:00+08:00',
};

export const mockSession = {
  access_token: 'mock-jwt-token',
  refresh_token: 'mock-refresh-token',
  token_type: 'bearer',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  user: mockUser,
};

// ---------------------------------------------------------------------------
// Categories (all 8)
// ---------------------------------------------------------------------------

export const mockCategories: Category[] = [
  {
    id: 'dining',
    name: 'Dining',
    display_order: 1,
    icon: null,
    mccs: ['5811', '5812', '5813', '5814'],
    description: 'Restaurants, cafes, food delivery',
    created_at: '2026-02-01T00:00:00+08:00',
    updated_at: '2026-02-01T00:00:00+08:00',
  },
  {
    id: 'transport',
    name: 'Transport',
    display_order: 2,
    icon: null,
    mccs: ['4121', '4131', '7512'],
    description: 'Ride-hailing, taxis, public transport',
    created_at: '2026-02-01T00:00:00+08:00',
    updated_at: '2026-02-01T00:00:00+08:00',
  },
  {
    id: 'online',
    name: 'Online Shopping',
    display_order: 3,
    icon: null,
    mccs: [],
    description: 'E-commerce, online purchases',
    created_at: '2026-02-01T00:00:00+08:00',
    updated_at: '2026-02-01T00:00:00+08:00',
  },
  {
    id: 'groceries',
    name: 'Groceries',
    display_order: 4,
    icon: null,
    mccs: ['5411', '5422', '5441'],
    description: 'Supermarkets, wet markets',
    created_at: '2026-02-01T00:00:00+08:00',
    updated_at: '2026-02-01T00:00:00+08:00',
  },
  {
    id: 'petrol',
    name: 'Petrol',
    display_order: 5,
    icon: null,
    mccs: ['5541', '5542'],
    description: 'Petrol stations',
    created_at: '2026-02-01T00:00:00+08:00',
    updated_at: '2026-02-01T00:00:00+08:00',
  },
  {
    id: 'bills',
    name: 'Bills',
    display_order: 6,
    icon: null,
    mccs: ['4812', '4814', '4899', '4900', '6300', '6381', '6399', '4816'],
    description: 'Utilities, insurance, telco, recurring payments',
    created_at: '2026-02-01T00:00:00+08:00',
    updated_at: '2026-02-01T00:00:00+08:00',
  },
  {
    id: 'travel',
    name: 'Travel / Hotels',
    display_order: 7,
    icon: null,
    mccs: ['4411', '7011'],
    description: 'Airlines, hotels, travel agencies',
    created_at: '2026-02-01T00:00:00+08:00',
    updated_at: '2026-02-01T00:00:00+08:00',
  },
  {
    id: 'general',
    name: 'General / Others',
    display_order: 8,
    icon: null,
    mccs: [],
    description: 'All other spending',
    created_at: '2026-02-01T00:00:00+08:00',
    updated_at: '2026-02-01T00:00:00+08:00',
  },
];

// ---------------------------------------------------------------------------
// Cards (3 representative cards from Batch 1)
// ---------------------------------------------------------------------------

/** HSBC Revolution: 4 mpd dining/online, 0.4 mpd else. Cap $1000/month shared. */
export const cardHSBCRevolution: Card = {
  id: '00000000-0000-0000-0001-000000000006',
  bank: 'HSBC',
  name: 'HSBC Revolution Credit Card',
  slug: 'hsbc-revolution',
  network: 'visa',
  annual_fee: 0,
  base_rate_mpd: 0.4,
  image_url: null,
  apply_url: null,
  is_active: true,
  notes: '4 mpd on dining/online, $1000 shared cap.',
  created_at: '2026-02-01T00:00:00+08:00',
  updated_at: '2026-02-01T00:00:00+08:00',
};

/** UOB PRVI Miles: flat 1.4 mpd. No cap. */
export const cardUOBPRVI: Card = {
  id: '00000000-0000-0000-0001-000000000003',
  bank: 'UOB',
  name: 'UOB PRVI Miles Visa',
  slug: 'uob-prvi-miles-visa',
  network: 'visa',
  annual_fee: 256.80,
  base_rate_mpd: 1.4,
  image_url: null,
  apply_url: null,
  is_active: true,
  notes: 'Flat 1.4 mpd local.',
  created_at: '2026-02-01T00:00:00+08:00',
  updated_at: '2026-02-01T00:00:00+08:00',
};

/** Amex KrisFlyer Ascend: 2 mpd dining, 1.1 mpd base. Cap $2500/month per cat. */
export const cardAmexAscend: Card = {
  id: '00000000-0000-0000-0001-000000000007',
  bank: 'Amex',
  name: 'American Express KrisFlyer Ascend',
  slug: 'amex-krisflyer-ascend',
  network: 'amex',
  annual_fee: 337.05,
  base_rate_mpd: 1.1,
  image_url: null,
  apply_url: null,
  is_active: true,
  notes: '2 mpd dining, $2500 cap per category.',
  created_at: '2026-02-01T00:00:00+08:00',
  updated_at: '2026-02-01T00:00:00+08:00',
};

/** An inactive card for filter tests. */
export const cardInactive: Card = {
  id: '00000000-0000-0000-0001-000000000099',
  bank: 'Test',
  name: 'Discontinued Card',
  slug: 'discontinued-card',
  network: 'visa',
  annual_fee: 0,
  base_rate_mpd: 0.4,
  image_url: null,
  apply_url: null,
  is_active: false,
  notes: 'Not active.',
  created_at: '2026-02-01T00:00:00+08:00',
  updated_at: '2026-02-01T00:00:00+08:00',
};

export const mockCards: Card[] = [
  cardHSBCRevolution,
  cardUOBPRVI,
  cardAmexAscend,
];

export const mockCardsWithInactive: Card[] = [...mockCards, cardInactive];

// ---------------------------------------------------------------------------
// Earn Rules (for the 3 mock cards, across 8 categories)
// ---------------------------------------------------------------------------

const ts = '2026-02-01T00:00:00+08:00';

export const earnRulesHSBC: EarnRule[] = [
  { id: 'er-hsbc-dining',    card_id: cardHSBCRevolution.id, category_id: 'dining',    earn_rate_mpd: 4.0, is_bonus: true,  conditions: {}, conditions_note: 'Capped at $1,000/month.', effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-hsbc-transport', card_id: cardHSBCRevolution.id, category_id: 'transport', earn_rate_mpd: 0.4, is_bonus: false, conditions: {}, conditions_note: null, effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-hsbc-online',    card_id: cardHSBCRevolution.id, category_id: 'online',    earn_rate_mpd: 4.0, is_bonus: true,  conditions: {}, conditions_note: 'Capped at $1,000/month.', effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-hsbc-groceries', card_id: cardHSBCRevolution.id, category_id: 'groceries', earn_rate_mpd: 0.4, is_bonus: false, conditions: {}, conditions_note: null, effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-hsbc-petrol',    card_id: cardHSBCRevolution.id, category_id: 'petrol',    earn_rate_mpd: 0.4, is_bonus: false, conditions: {}, conditions_note: null, effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-hsbc-bills',     card_id: cardHSBCRevolution.id, category_id: 'bills',     earn_rate_mpd: 0.4, is_bonus: false, conditions: {}, conditions_note: 'Base rate on bills/utilities.', effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-hsbc-travel',    card_id: cardHSBCRevolution.id, category_id: 'travel',    earn_rate_mpd: 0.4, is_bonus: false, conditions: {}, conditions_note: null, effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-hsbc-general',   card_id: cardHSBCRevolution.id, category_id: 'general',   earn_rate_mpd: 0.4, is_bonus: false, conditions: {}, conditions_note: null, effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
];

export const earnRulesUOB: EarnRule[] = [
  { id: 'er-uob-dining',    card_id: cardUOBPRVI.id, category_id: 'dining',    earn_rate_mpd: 1.4, is_bonus: false, conditions: {}, conditions_note: null, effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-uob-transport', card_id: cardUOBPRVI.id, category_id: 'transport', earn_rate_mpd: 1.4, is_bonus: false, conditions: {}, conditions_note: null, effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-uob-online',    card_id: cardUOBPRVI.id, category_id: 'online',    earn_rate_mpd: 1.4, is_bonus: false, conditions: {}, conditions_note: null, effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-uob-groceries', card_id: cardUOBPRVI.id, category_id: 'groceries', earn_rate_mpd: 1.4, is_bonus: false, conditions: {}, conditions_note: null, effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-uob-petrol',    card_id: cardUOBPRVI.id, category_id: 'petrol',    earn_rate_mpd: 1.4, is_bonus: false, conditions: {}, conditions_note: null, effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-uob-bills',     card_id: cardUOBPRVI.id, category_id: 'bills',     earn_rate_mpd: 1.4, is_bonus: false, conditions: {}, conditions_note: 'Base rate on bills/utilities.', effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-uob-travel',    card_id: cardUOBPRVI.id, category_id: 'travel',    earn_rate_mpd: 1.4, is_bonus: false, conditions: {}, conditions_note: null, effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-uob-general',   card_id: cardUOBPRVI.id, category_id: 'general',   earn_rate_mpd: 1.4, is_bonus: false, conditions: {}, conditions_note: null, effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
];

export const earnRulesAmex: EarnRule[] = [
  { id: 'er-amex-dining',    card_id: cardAmexAscend.id, category_id: 'dining',    earn_rate_mpd: 2.0, is_bonus: true,  conditions: {}, conditions_note: 'Capped at $2,500/month.', effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-amex-transport', card_id: cardAmexAscend.id, category_id: 'transport', earn_rate_mpd: 1.1, is_bonus: false, conditions: {}, conditions_note: null, effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-amex-online',    card_id: cardAmexAscend.id, category_id: 'online',    earn_rate_mpd: 1.1, is_bonus: false, conditions: {}, conditions_note: null, effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-amex-groceries', card_id: cardAmexAscend.id, category_id: 'groceries', earn_rate_mpd: 2.0, is_bonus: true,  conditions: {}, conditions_note: 'Capped at $2,500/month.', effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-amex-petrol',    card_id: cardAmexAscend.id, category_id: 'petrol',    earn_rate_mpd: 1.1, is_bonus: false, conditions: {}, conditions_note: null, effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-amex-bills',     card_id: cardAmexAscend.id, category_id: 'bills',     earn_rate_mpd: 1.1, is_bonus: false, conditions: {}, conditions_note: 'Base rate on bills/utilities.', effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-amex-travel',    card_id: cardAmexAscend.id, category_id: 'travel',    earn_rate_mpd: 2.0, is_bonus: true,  conditions: {}, conditions_note: 'Capped at $2,500/month.', effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-amex-general',   card_id: cardAmexAscend.id, category_id: 'general',   earn_rate_mpd: 1.1, is_bonus: false, conditions: {}, conditions_note: null, effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
];

export const allEarnRules: EarnRule[] = [
  ...earnRulesHSBC,
  ...earnRulesUOB,
  ...earnRulesAmex,
];

// ---------------------------------------------------------------------------
// Caps
// ---------------------------------------------------------------------------

export const capHSBCShared: Cap = {
  id: 'cap-hsbc-shared',
  card_id: cardHSBCRevolution.id,
  category_id: null,
  monthly_cap_amount: 1000,
  cap_type: 'spend',
  notes: 'Combined cap across dining, online, entertainment.',
  created_at: ts,
  updated_at: ts,
};

export const capAmexDining: Cap = {
  id: 'cap-amex-dining',
  card_id: cardAmexAscend.id,
  category_id: 'dining',
  monthly_cap_amount: 2500,
  cap_type: 'spend',
  notes: 'Per-category cap.',
  created_at: ts,
  updated_at: ts,
};

export const capAmexGroceries: Cap = {
  id: 'cap-amex-groceries',
  card_id: cardAmexAscend.id,
  category_id: 'groceries',
  monthly_cap_amount: 2500,
  cap_type: 'spend',
  notes: 'Per-category cap.',
  created_at: ts,
  updated_at: ts,
};

export const capAmexTravel: Cap = {
  id: 'cap-amex-travel',
  card_id: cardAmexAscend.id,
  category_id: 'travel',
  monthly_cap_amount: 2500,
  cap_type: 'spend',
  notes: 'Per-category cap.',
  created_at: ts,
  updated_at: ts,
};

export const allCaps: Cap[] = [
  capHSBCShared,
  capAmexDining,
  capAmexGroceries,
  capAmexTravel,
];

// ---------------------------------------------------------------------------
// User Cards
// ---------------------------------------------------------------------------

export const mockUserCards: UserCard[] = [
  { user_id: MOCK_USER_ID, card_id: cardHSBCRevolution.id, nickname: null, is_default: true,  added_at: '2026-02-01T10:00:00+08:00', updated_at: '2026-02-01T10:00:00+08:00' },
  { user_id: MOCK_USER_ID, card_id: cardUOBPRVI.id,       nickname: null, is_default: false, added_at: '2026-02-01T10:01:00+08:00', updated_at: '2026-02-01T10:01:00+08:00' },
  { user_id: MOCK_USER_ID, card_id: cardAmexAscend.id,    nickname: null, is_default: false, added_at: '2026-02-01T10:02:00+08:00', updated_at: '2026-02-01T10:02:00+08:00' },
];

// ---------------------------------------------------------------------------
// Transactions
// ---------------------------------------------------------------------------

export const mockTransactions: Transaction[] = [
  {
    id: 'tx-001',
    user_id: MOCK_USER_ID,
    card_id: cardHSBCRevolution.id,
    category_id: 'dining',
    amount: 85.00,
    transaction_date: '2026-02-15',
    notes: 'Lunch at restaurant',
    logged_at: '2026-02-15T13:00:00+08:00',
    created_at: '2026-02-15T13:00:00+08:00',
    updated_at: '2026-02-15T13:00:00+08:00',
  },
  {
    id: 'tx-002',
    user_id: MOCK_USER_ID,
    card_id: cardAmexAscend.id,
    category_id: 'dining',
    amount: 120.00,
    transaction_date: '2026-02-16',
    notes: null,
    logged_at: '2026-02-16T19:30:00+08:00',
    created_at: '2026-02-16T19:30:00+08:00',
    updated_at: '2026-02-16T19:30:00+08:00',
  },
];

// ---------------------------------------------------------------------------
// Spending State
// ---------------------------------------------------------------------------

export const mockSpendingStates: SpendingState[] = [
  {
    id: 'ss-001',
    user_id: MOCK_USER_ID,
    card_id: cardHSBCRevolution.id,
    category_id: 'dining',
    month: '2026-02',
    total_spent: 750,
    remaining_cap: 250,
    created_at: ts,
    updated_at: ts,
  },
  {
    id: 'ss-002',
    user_id: MOCK_USER_ID,
    card_id: cardAmexAscend.id,
    category_id: 'dining',
    month: '2026-02',
    total_spent: 500,
    remaining_cap: 2000,
    created_at: ts,
    updated_at: ts,
  },
];

// ---------------------------------------------------------------------------
// Recommendation Results (pre-computed for verification)
// ---------------------------------------------------------------------------

/** Dining recommendation: new user, no spending. HSBC 4mpd wins. */
export const recommendDiningNewUser: RecommendResult[] = [
  {
    card_id: cardHSBCRevolution.id,
    card_name: 'HSBC Revolution Credit Card',
    bank: 'HSBC',
    earn_rate_mpd: 4.0,
    remaining_cap: 1000,
    monthly_cap_amount: 1000,
    is_recommended: true,
    image_url: null,
    network: 'visa',
    base_rate_mpd: 0.4,
    conditions_note: null,
  },
  {
    card_id: cardAmexAscend.id,
    card_name: 'American Express KrisFlyer Ascend',
    bank: 'Amex',
    earn_rate_mpd: 2.0,
    remaining_cap: 2500,
    monthly_cap_amount: 2500,
    is_recommended: false,
    image_url: null,
    network: 'amex',
    base_rate_mpd: 1.1,
    conditions_note: null,
  },
  {
    card_id: cardUOBPRVI.id,
    card_name: 'UOB PRVI Miles Visa',
    bank: 'UOB',
    earn_rate_mpd: 1.4,
    remaining_cap: null,
    monthly_cap_amount: null,
    is_recommended: false,
    image_url: null,
    network: 'visa',
    base_rate_mpd: 1.4,
    conditions_note: null,
  },
];

// ---------------------------------------------------------------------------
// Factory Functions
// ---------------------------------------------------------------------------

/** Create a Card with overrides. */
export function createCard(overrides: Partial<Card> = {}): Card {
  return {
    id: 'test-card-' + Math.random().toString(36).slice(2, 8),
    bank: 'TestBank',
    name: 'Test Card',
    slug: 'test-card',
    network: 'visa',
    annual_fee: 0,
    base_rate_mpd: 1.0,
    image_url: null,
    apply_url: null,
    is_active: true,
    notes: null,
    created_at: ts,
    updated_at: ts,
    ...overrides,
  };
}

/** Create an EarnRule with overrides. */
export function createEarnRule(overrides: Partial<EarnRule> = {}): EarnRule {
  return {
    id: 'test-er-' + Math.random().toString(36).slice(2, 8),
    card_id: 'test-card-id',
    category_id: 'dining',
    earn_rate_mpd: 1.0,
    is_bonus: false,
    conditions: {},
    conditions_note: null,
    effective_from: '2026-01-01',
    effective_to: null,
    source_url: null,
    created_at: ts,
    updated_at: ts,
    ...overrides,
  };
}

/** Create a Cap with overrides. */
export function createCap(overrides: Partial<Cap> = {}): Cap {
  return {
    id: 'test-cap-' + Math.random().toString(36).slice(2, 8),
    card_id: 'test-card-id',
    category_id: 'dining',
    monthly_cap_amount: 1000,
    cap_type: 'spend',
    notes: null,
    created_at: ts,
    updated_at: ts,
    ...overrides,
  };
}

/** Create a UserCard with overrides. */
export function createUserCard(overrides: Partial<UserCard> = {}): UserCard {
  return {
    user_id: MOCK_USER_ID,
    card_id: 'test-card-id',
    nickname: null,
    is_default: false,
    added_at: ts,
    updated_at: ts,
    ...overrides,
  };
}

/** Create a Transaction with overrides. */
export function createTransaction(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: 'test-tx-' + Math.random().toString(36).slice(2, 8),
    user_id: MOCK_USER_ID,
    card_id: 'test-card-id',
    category_id: 'dining',
    amount: 50,
    transaction_date: '2026-02-19',
    notes: null,
    logged_at: ts,
    created_at: ts,
    updated_at: ts,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Miles Programs (7 seeded programs from migration 008)
// ---------------------------------------------------------------------------

export const programKrisFlyer = {
  id: 'pppppppp-0001-0001-0001-pppppppp0001',
  name: 'KrisFlyer',
  airline: 'Singapore Airlines',
  program_type: 'airline',
  icon_url: 'airplane-outline',
  created_at: '2026-02-20T00:00:00+08:00',
};

export const programCitiMiles = {
  id: 'pppppppp-0001-0001-0001-pppppppp0002',
  name: 'Citi Miles',
  airline: null,
  program_type: 'bank_points',
  icon_url: 'airplane-outline',
  created_at: '2026-02-20T00:00:00+08:00',
};

export const programUNI = {
  id: 'pppppppp-0001-0001-0001-pppppppp0003',
  name: 'UNI$',
  airline: null,
  program_type: 'bank_points',
  icon_url: 'airplane-outline',
  created_at: '2026-02-20T00:00:00+08:00',
};

// ---------------------------------------------------------------------------
// Miles Balances
// ---------------------------------------------------------------------------

export const mockMilesBalance = {
  user_id: MOCK_USER_ID,
  miles_program_id: programKrisFlyer.id,
  manual_balance: 28500,
  updated_at: '2026-02-20T10:00:00+08:00',
};

// ---------------------------------------------------------------------------
// Miles Portfolio (RPC return shape)
// ---------------------------------------------------------------------------

export const mockPortfolioRow = {
  program_id: programKrisFlyer.id,
  program_name: 'KrisFlyer',
  airline: 'Singapore Airlines',
  icon_url: 'airplane-outline',
  manual_balance: 28500,
  auto_earned: 2450,
  total_redeemed: 0,
  display_total: 30950,
  last_updated: '2026-02-20T10:00:00+08:00',
  contributing_cards: [
    { card_id: cardHSBCRevolution.id, name: 'HSBC Revolution', bank: 'HSBC' },
  ],
};

// ---------------------------------------------------------------------------
// Miles Transactions (redemptions)
// ---------------------------------------------------------------------------

export const mockRedemption = {
  id: 'tttttttt-0001-0001-0001-tttttttt0001',
  user_id: MOCK_USER_ID,
  miles_program_id: programKrisFlyer.id,
  type: 'redeem' as const,
  amount: 42000,
  description: 'SIN to NRT Business Class',
  transaction_date: '2026-02-20',
  created_at: '2026-02-20T10:30:00+08:00',
};

// ---------------------------------------------------------------------------
// Miles Goals
// ---------------------------------------------------------------------------

export const mockGoal = {
  goal_id: 'gggggggg-0001-0001-0001-gggggggg0001',
  target_miles: 63000,
  description: 'Tokyo Business Class',
  achieved_at: null,
  created_at: '2026-02-18T10:00:00+08:00',
};

export const mockGoalAchieved = {
  goal_id: 'gggggggg-0001-0001-0001-gggggggg0002',
  target_miles: 25000,
  description: 'Bangkok Economy',
  achieved_at: '2026-02-20T10:30:00+08:00',
  created_at: '2026-02-15T10:00:00+08:00',
};

// ---------------------------------------------------------------------------
// Min Spend Cards (F31 — Min Spend Enforcement)
// ---------------------------------------------------------------------------

/** SC X Card: 3.3 mpd on selected categories, requires $500/month min spend */
export const cardSCXCard: Card = {
  id: '00000000-0000-0000-0002-000000000015',
  bank: 'SC',
  name: 'Standard Chartered X Credit Card',
  slug: 'sc-x-card',
  network: 'visa',
  annual_fee: 0,
  base_rate_mpd: 0.4,
  image_url: null,
  apply_url: null,
  is_active: true,
  notes: 'Min spend $500/month for 3.3 mpd bonus.',
  eligibility_criteria: null,
  created_at: ts,
  updated_at: ts,
};

/** Maybank World Mastercard: 4 mpd petrol uncapped, no min spend. 0.4 mpd base. */
export const cardMaybankWorldMC: Card = {
  id: '00000000-0000-0000-0003-000000000021',
  bank: 'Maybank',
  name: 'Maybank World Mastercard',
  slug: 'maybank-world-mc',
  network: 'mastercard',
  annual_fee: 261.60,
  base_rate_mpd: 0.4,
  image_url: null,
  apply_url: null,
  is_active: true,
  notes: 'Uncapped 4 mpd on petrol. No min spend.',
  eligibility_criteria: null,
  created_at: ts,
  updated_at: ts,
};

/** UOB Visa Signature: 4 mpd contactless + petrol, $1000/month min spend, $1200 cap shared */
export const cardUOBVisaSig: Card = {
  id: '00000000-0000-0000-0003-000000000022',
  bank: 'UOB',
  name: 'UOB Visa Signature',
  slug: 'uob-visa-signature',
  network: 'visa',
  annual_fee: 218.00,
  base_rate_mpd: 0.4,
  image_url: null,
  apply_url: null,
  is_active: true,
  notes: '4 mpd contactless + petrol. Min spend $1000/month. Cap $1200 shared.',
  eligibility_criteria: null,
  created_at: ts,
  updated_at: ts,
};

/** UOB Preferred Platinum: 4.0 mpd on dining, requires $600/month min spend */
export const cardUOBPreferredPlatinum: Card = {
  id: '00000000-0000-0000-0002-000000000020',
  bank: 'UOB',
  name: 'UOB Preferred Platinum Visa',
  slug: 'uob-preferred-platinum',
  network: 'visa',
  annual_fee: 0,
  base_rate_mpd: 0.4,
  image_url: null,
  apply_url: null,
  is_active: true,
  notes: 'Min spend $600/month for 4 mpd dining bonus.',
  eligibility_criteria: null,
  created_at: ts,
  updated_at: ts,
};

// ---------------------------------------------------------------------------
// Earn Rules & Caps for Cards 21-22
// ---------------------------------------------------------------------------

export const earnRulesMaybankWorldMC: EarnRule[] = [
  { id: 'er-mwmc-dining',    card_id: cardMaybankWorldMC.id, category_id: 'dining',    earn_rate_mpd: 0.4, is_bonus: false, conditions: {}, conditions_note: '4 mpd at selected dining merchants (Paradise Group, etc.). 0.4 mpd at other dining.', effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-mwmc-transport', card_id: cardMaybankWorldMC.id, category_id: 'transport', earn_rate_mpd: 0.4, is_bonus: false, conditions: {}, conditions_note: null, effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-mwmc-online',    card_id: cardMaybankWorldMC.id, category_id: 'online',    earn_rate_mpd: 0.4, is_bonus: false, conditions: {}, conditions_note: null, effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-mwmc-groceries', card_id: cardMaybankWorldMC.id, category_id: 'groceries', earn_rate_mpd: 0.4, is_bonus: false, conditions: {}, conditions_note: null, effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-mwmc-petrol',    card_id: cardMaybankWorldMC.id, category_id: 'petrol',    earn_rate_mpd: 4.0, is_bonus: true,  conditions: {}, conditions_note: 'Earn 4 mpd on petrol (MCC 5541). Uncapped, no min spend. [VERIFIED]', effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-mwmc-bills',     card_id: cardMaybankWorldMC.id, category_id: 'bills',     earn_rate_mpd: 0.4, is_bonus: false, conditions: {}, conditions_note: 'Base rate on bills/utilities.', effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-mwmc-travel',    card_id: cardMaybankWorldMC.id, category_id: 'travel',    earn_rate_mpd: 0.4, is_bonus: false, conditions: {}, conditions_note: '3.2 mpd on overseas (FCY). 0.4 mpd local.', effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-mwmc-general',   card_id: cardMaybankWorldMC.id, category_id: 'general',   earn_rate_mpd: 0.4, is_bonus: false, conditions: {}, conditions_note: null, effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
];

export const earnRulesUOBVisaSig: EarnRule[] = [
  { id: 'er-uobvs-dining',    card_id: cardUOBVisaSig.id, category_id: 'dining',    earn_rate_mpd: 4.0, is_bonus: true,  conditions: { contactless: true, min_spend_monthly: 1000 }, conditions_note: 'Earn 4 mpd on contactless dining. Min spend $1,000/month. Cap $1,200/month shared.', effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-uobvs-transport', card_id: cardUOBVisaSig.id, category_id: 'transport', earn_rate_mpd: 4.0, is_bonus: true,  conditions: { contactless: true, min_spend_monthly: 1000 }, conditions_note: 'Earn 4 mpd on contactless transport. Min spend $1,000/month. Cap $1,200/month shared.', effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-uobvs-online',    card_id: cardUOBVisaSig.id, category_id: 'online',    earn_rate_mpd: 0.4, is_bonus: false, conditions: {}, conditions_note: 'Mobile contactless in-app payments classified as online, not contactless. 0.4 mpd.', effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-uobvs-groceries', card_id: cardUOBVisaSig.id, category_id: 'groceries', earn_rate_mpd: 4.0, is_bonus: true,  conditions: { contactless: true, min_spend_monthly: 1000 }, conditions_note: 'Earn 4 mpd on contactless groceries. Min spend $1,000/month. Cap $1,200/month shared.', effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-uobvs-petrol',    card_id: cardUOBVisaSig.id, category_id: 'petrol',    earn_rate_mpd: 4.0, is_bonus: true,  conditions: { min_spend_monthly: 1000 }, conditions_note: 'Earn 4 mpd on petrol. Min spend $1,000/month. No contactless required for petrol.', effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-uobvs-bills',     card_id: cardUOBVisaSig.id, category_id: 'bills',     earn_rate_mpd: 0.4, is_bonus: false, conditions: {}, conditions_note: 'Utilities excluded from bonus earning. Base rate only.', effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-uobvs-travel',    card_id: cardUOBVisaSig.id, category_id: 'travel',    earn_rate_mpd: 0.4, is_bonus: false, conditions: {}, conditions_note: '4 mpd on overseas (FCY, out of scope). 0.4 mpd local.', effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-uobvs-general',   card_id: cardUOBVisaSig.id, category_id: 'general',   earn_rate_mpd: 4.0, is_bonus: true,  conditions: { contactless: true, min_spend_monthly: 1000 }, conditions_note: 'Earn 4 mpd on contactless spend. Min spend $1,000/month. Cap $1,200/month shared.', effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
];

export const capUOBVisaSigShared: Cap = {
  id: 'cap-uobvs-shared',
  card_id: cardUOBVisaSig.id,
  category_id: null,
  monthly_cap_amount: 1200,
  cap_type: 'spend',
  notes: 'Combined cap across all bonus categories (petrol + contactless). $1,200/month shared.',
  created_at: ts,
  updated_at: ts,
};

// ---------------------------------------------------------------------------
// Cards 23-28
// ---------------------------------------------------------------------------

/** DBS Vantage Visa Infinite: 1.5 mpd bonus with $2000/month min spend. 1.0 mpd base. */
export const cardDBSVantage: Card = {
  id: '00000000-0000-0000-0004-000000000023',
  bank: 'DBS',
  name: 'DBS Vantage Visa Infinite',
  slug: 'dbs-vantage-visa-infinite',
  network: 'visa',
  annual_fee: 599.50,
  base_rate_mpd: 1.0,
  image_url: null,
  apply_url: null,
  is_active: true,
  notes: '1.5 mpd with $2000/month min spend. 1.0 mpd base.',
  eligibility_criteria: null,
  created_at: ts,
  updated_at: ts,
};

/** OCBC Voyage Card: flat 1.3 mpd. No cap. */
export const cardOCBCVoyage: Card = {
  id: '00000000-0000-0000-0004-000000000024',
  bank: 'OCBC',
  name: 'OCBC Voyage Card',
  slug: 'ocbc-voyage-card',
  network: 'visa',
  annual_fee: 497.06,
  base_rate_mpd: 1.3,
  image_url: null,
  apply_url: null,
  is_active: true,
  notes: 'Flat 1.3 mpd.',
  eligibility_criteria: null,
  created_at: ts,
  updated_at: ts,
};

/** SC Journey Card: 3.0 mpd transport/groceries, 1.2 mpd base. $1000 shared cap. */
export const cardSCJourney: Card = {
  id: '00000000-0000-0000-0004-000000000025',
  bank: 'SC',
  name: 'SC Journey Card',
  slug: 'sc-journey-card',
  network: 'visa',
  annual_fee: 196.20,
  base_rate_mpd: 1.2,
  image_url: null,
  apply_url: null,
  is_active: true,
  notes: '3.0 mpd transport/groceries. 1.2 mpd base. $1000 shared cap.',
  eligibility_criteria: null,
  created_at: ts,
  updated_at: ts,
};

/** SC Beyond Card: flat 1.5 mpd. No cap. */
export const cardSCBeyond: Card = {
  id: '00000000-0000-0000-0004-000000000026',
  bank: 'SC',
  name: 'SC Beyond Card',
  slug: 'sc-beyond-card',
  network: 'mastercard',
  annual_fee: 1635.00,
  base_rate_mpd: 1.5,
  image_url: null,
  apply_url: null,
  is_active: true,
  notes: 'Flat 1.5 mpd.',
  eligibility_criteria: null,
  created_at: ts,
  updated_at: ts,
};

/** HSBC Premier Mastercard: flat 1.4 mpd. No cap. */
export const cardHSBCPremierMC: Card = {
  id: '00000000-0000-0000-0004-000000000027',
  bank: 'HSBC',
  name: 'HSBC Premier Mastercard',
  slug: 'hsbc-premier-mc',
  network: 'mastercard',
  annual_fee: 708.50,
  base_rate_mpd: 1.4,
  image_url: null,
  apply_url: null,
  is_active: true,
  notes: 'Flat 1.4 mpd.',
  eligibility_criteria: null,
  created_at: ts,
  updated_at: ts,
};

/** Maybank XL Rewards: 4.0 mpd dining/online/travel with $500/month min spend. 0.4 mpd base. $1000 shared cap. */
export const cardMaybankXL: Card = {
  id: '00000000-0000-0000-0004-000000000028',
  bank: 'Maybank',
  name: 'Maybank XL Rewards',
  slug: 'maybank-xl-rewards',
  network: 'mastercard',
  annual_fee: 87.20,
  base_rate_mpd: 0.4,
  image_url: null,
  apply_url: null,
  is_active: true,
  notes: '4.0 mpd dining/online/travel with $500/month min spend. 0.4 mpd base. $1000 shared cap.',
  eligibility_criteria: null,
  created_at: ts,
  updated_at: ts,
};

// ---------------------------------------------------------------------------
// Earn Rules & Caps for Cards 23-28
// ---------------------------------------------------------------------------

export const earnRulesDBSVantage: EarnRule[] = [
  { id: 'er-dbsv-dining',    card_id: cardDBSVantage.id, category_id: 'dining',    earn_rate_mpd: 1.5, is_bonus: true,  conditions: { min_spend_monthly: 2000 }, conditions_note: null, effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-dbsv-transport', card_id: cardDBSVantage.id, category_id: 'transport', earn_rate_mpd: 1.5, is_bonus: true,  conditions: { min_spend_monthly: 2000 }, conditions_note: null, effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-dbsv-online',    card_id: cardDBSVantage.id, category_id: 'online',    earn_rate_mpd: 1.5, is_bonus: true,  conditions: { min_spend_monthly: 2000 }, conditions_note: null, effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-dbsv-groceries', card_id: cardDBSVantage.id, category_id: 'groceries', earn_rate_mpd: 1.5, is_bonus: true,  conditions: { min_spend_monthly: 2000 }, conditions_note: null, effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-dbsv-petrol',    card_id: cardDBSVantage.id, category_id: 'petrol',    earn_rate_mpd: 1.5, is_bonus: true,  conditions: { min_spend_monthly: 2000 }, conditions_note: null, effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-dbsv-bills',     card_id: cardDBSVantage.id, category_id: 'bills',     earn_rate_mpd: 1.5, is_bonus: true,  conditions: { min_spend_monthly: 2000 }, conditions_note: null, effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-dbsv-travel',    card_id: cardDBSVantage.id, category_id: 'travel',    earn_rate_mpd: 1.5, is_bonus: true,  conditions: { min_spend_monthly: 2000 }, conditions_note: null, effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-dbsv-general',   card_id: cardDBSVantage.id, category_id: 'general',   earn_rate_mpd: 1.5, is_bonus: true,  conditions: { min_spend_monthly: 2000 }, conditions_note: null, effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
];

export const earnRulesOCBCVoyage: EarnRule[] = [
  { id: 'er-ocbcv-dining',    card_id: cardOCBCVoyage.id, category_id: 'dining',    earn_rate_mpd: 1.3, is_bonus: false, conditions: {}, conditions_note: null, effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-ocbcv-transport', card_id: cardOCBCVoyage.id, category_id: 'transport', earn_rate_mpd: 1.3, is_bonus: false, conditions: {}, conditions_note: null, effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-ocbcv-online',    card_id: cardOCBCVoyage.id, category_id: 'online',    earn_rate_mpd: 1.3, is_bonus: false, conditions: {}, conditions_note: null, effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-ocbcv-groceries', card_id: cardOCBCVoyage.id, category_id: 'groceries', earn_rate_mpd: 1.3, is_bonus: false, conditions: {}, conditions_note: null, effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-ocbcv-petrol',    card_id: cardOCBCVoyage.id, category_id: 'petrol',    earn_rate_mpd: 1.3, is_bonus: false, conditions: {}, conditions_note: null, effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-ocbcv-bills',     card_id: cardOCBCVoyage.id, category_id: 'bills',     earn_rate_mpd: 1.3, is_bonus: false, conditions: {}, conditions_note: null, effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-ocbcv-travel',    card_id: cardOCBCVoyage.id, category_id: 'travel',    earn_rate_mpd: 1.3, is_bonus: false, conditions: {}, conditions_note: null, effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-ocbcv-general',   card_id: cardOCBCVoyage.id, category_id: 'general',   earn_rate_mpd: 1.3, is_bonus: false, conditions: {}, conditions_note: null, effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
];

export const earnRulesSCJourney: EarnRule[] = [
  { id: 'er-scj-dining',    card_id: cardSCJourney.id, category_id: 'dining',    earn_rate_mpd: 1.2, is_bonus: false, conditions: {}, conditions_note: null, effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-scj-transport', card_id: cardSCJourney.id, category_id: 'transport', earn_rate_mpd: 3.0, is_bonus: true,  conditions: {}, conditions_note: null, effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-scj-online',    card_id: cardSCJourney.id, category_id: 'online',    earn_rate_mpd: 1.2, is_bonus: false, conditions: {}, conditions_note: null, effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-scj-groceries', card_id: cardSCJourney.id, category_id: 'groceries', earn_rate_mpd: 3.0, is_bonus: true,  conditions: {}, conditions_note: null, effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-scj-petrol',    card_id: cardSCJourney.id, category_id: 'petrol',    earn_rate_mpd: 1.2, is_bonus: false, conditions: {}, conditions_note: null, effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-scj-bills',     card_id: cardSCJourney.id, category_id: 'bills',     earn_rate_mpd: 1.2, is_bonus: false, conditions: {}, conditions_note: null, effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-scj-travel',    card_id: cardSCJourney.id, category_id: 'travel',    earn_rate_mpd: 1.2, is_bonus: false, conditions: {}, conditions_note: null, effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-scj-general',   card_id: cardSCJourney.id, category_id: 'general',   earn_rate_mpd: 1.2, is_bonus: false, conditions: {}, conditions_note: null, effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
];

export const earnRulesSCBeyond: EarnRule[] = [
  { id: 'er-scb-dining',    card_id: cardSCBeyond.id, category_id: 'dining',    earn_rate_mpd: 1.5, is_bonus: false, conditions: {}, conditions_note: null, effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-scb-transport', card_id: cardSCBeyond.id, category_id: 'transport', earn_rate_mpd: 1.5, is_bonus: false, conditions: {}, conditions_note: null, effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-scb-online',    card_id: cardSCBeyond.id, category_id: 'online',    earn_rate_mpd: 1.5, is_bonus: false, conditions: {}, conditions_note: null, effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-scb-groceries', card_id: cardSCBeyond.id, category_id: 'groceries', earn_rate_mpd: 1.5, is_bonus: false, conditions: {}, conditions_note: null, effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-scb-petrol',    card_id: cardSCBeyond.id, category_id: 'petrol',    earn_rate_mpd: 1.5, is_bonus: false, conditions: {}, conditions_note: null, effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-scb-bills',     card_id: cardSCBeyond.id, category_id: 'bills',     earn_rate_mpd: 1.5, is_bonus: false, conditions: {}, conditions_note: null, effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-scb-travel',    card_id: cardSCBeyond.id, category_id: 'travel',    earn_rate_mpd: 1.5, is_bonus: false, conditions: {}, conditions_note: null, effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-scb-general',   card_id: cardSCBeyond.id, category_id: 'general',   earn_rate_mpd: 1.5, is_bonus: false, conditions: {}, conditions_note: null, effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
];

export const earnRulesHSBCPremierMC: EarnRule[] = [
  { id: 'er-hsbcp-dining',    card_id: cardHSBCPremierMC.id, category_id: 'dining',    earn_rate_mpd: 1.4, is_bonus: false, conditions: {}, conditions_note: null, effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-hsbcp-transport', card_id: cardHSBCPremierMC.id, category_id: 'transport', earn_rate_mpd: 1.4, is_bonus: false, conditions: {}, conditions_note: null, effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-hsbcp-online',    card_id: cardHSBCPremierMC.id, category_id: 'online',    earn_rate_mpd: 1.4, is_bonus: false, conditions: {}, conditions_note: null, effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-hsbcp-groceries', card_id: cardHSBCPremierMC.id, category_id: 'groceries', earn_rate_mpd: 1.4, is_bonus: false, conditions: {}, conditions_note: null, effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-hsbcp-petrol',    card_id: cardHSBCPremierMC.id, category_id: 'petrol',    earn_rate_mpd: 1.4, is_bonus: false, conditions: {}, conditions_note: null, effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-hsbcp-bills',     card_id: cardHSBCPremierMC.id, category_id: 'bills',     earn_rate_mpd: 1.4, is_bonus: false, conditions: {}, conditions_note: null, effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-hsbcp-travel',    card_id: cardHSBCPremierMC.id, category_id: 'travel',    earn_rate_mpd: 1.4, is_bonus: false, conditions: {}, conditions_note: null, effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-hsbcp-general',   card_id: cardHSBCPremierMC.id, category_id: 'general',   earn_rate_mpd: 1.4, is_bonus: false, conditions: {}, conditions_note: null, effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
];

export const earnRulesMaybankXL: EarnRule[] = [
  { id: 'er-mbxl-dining',    card_id: cardMaybankXL.id, category_id: 'dining',    earn_rate_mpd: 4.0, is_bonus: true,  conditions: { min_spend_monthly: 500 }, conditions_note: null, effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-mbxl-transport', card_id: cardMaybankXL.id, category_id: 'transport', earn_rate_mpd: 0.4, is_bonus: false, conditions: {}, conditions_note: null, effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-mbxl-online',    card_id: cardMaybankXL.id, category_id: 'online',    earn_rate_mpd: 4.0, is_bonus: true,  conditions: { min_spend_monthly: 500 }, conditions_note: null, effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-mbxl-groceries', card_id: cardMaybankXL.id, category_id: 'groceries', earn_rate_mpd: 0.4, is_bonus: false, conditions: {}, conditions_note: null, effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-mbxl-petrol',    card_id: cardMaybankXL.id, category_id: 'petrol',    earn_rate_mpd: 0.4, is_bonus: false, conditions: {}, conditions_note: null, effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-mbxl-bills',     card_id: cardMaybankXL.id, category_id: 'bills',     earn_rate_mpd: 0.4, is_bonus: false, conditions: {}, conditions_note: null, effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-mbxl-travel',    card_id: cardMaybankXL.id, category_id: 'travel',    earn_rate_mpd: 4.0, is_bonus: true,  conditions: { min_spend_monthly: 500 }, conditions_note: null, effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-mbxl-general',   card_id: cardMaybankXL.id, category_id: 'general',   earn_rate_mpd: 0.4, is_bonus: false, conditions: {}, conditions_note: null, effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
];

export const capSCJourneyShared: Cap = {
  id: 'cap-scjourney-shared',
  card_id: cardSCJourney.id,
  category_id: null,
  monthly_cap_amount: 1000.00,
  cap_type: 'spend',
  notes: null,
  created_at: ts,
  updated_at: ts,
};

export const capMaybankXLShared: Cap = {
  id: 'cap-maybankxl-shared',
  card_id: cardMaybankXL.id,
  category_id: null,
  monthly_cap_amount: 1000.00,
  cap_type: 'spend',
  notes: null,
  created_at: ts,
  updated_at: ts,
};

// ---------------------------------------------------------------------------
// Card 29: UOB Lady's Solitaire (user-selectable bonus categories)
// ---------------------------------------------------------------------------

/** UOB Lady's Solitaire: 4 mpd on 2 user-selected bonus categories, 0.4 mpd base. Cap $1,500/month shared. */
export const cardUOBLadysSolitaire: Card = {
  id: '00000000-0000-0000-0004-000000000029',
  bank: 'UOB',
  name: 'UOB Lady\'s Solitaire',
  slug: 'uob-ladys-solitaire',
  network: 'mastercard',
  annual_fee: 414.20,
  base_rate_mpd: 0.4,
  image_url: null,
  apply_url: null,
  is_active: true,
  notes: 'Choose 2 of 7 bonus categories for 4 mpd. Base 0.4 mpd. Cap $1,500/month shared.',
  eligibility_criteria: null,
  created_at: ts,
  updated_at: ts,
};

export const earnRulesUOBLadysSolitaire: EarnRule[] = [
  { id: 'er-uobls-dining',    card_id: cardUOBLadysSolitaire.id, category_id: 'dining',    earn_rate_mpd: 4.0, is_bonus: true,  conditions: { user_selectable: true }, conditions_note: 'Earn 4 mpd if Dining selected as bonus category. Choose 2 of 7 categories. Cap $750/month per category ($1,500 total). [VERIFIED from UOB website]', effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-uobls-transport', card_id: cardUOBLadysSolitaire.id, category_id: 'transport', earn_rate_mpd: 4.0, is_bonus: true,  conditions: { user_selectable: true }, conditions_note: 'Earn 4 mpd if Transport selected as bonus category. Choose 2 of 7 categories. Cap $750/month per category ($1,500 total). [VERIFIED]', effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-uobls-online',    card_id: cardUOBLadysSolitaire.id, category_id: 'online',    earn_rate_mpd: 0.4, is_bonus: false, conditions: {}, conditions_note: null, effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-uobls-groceries', card_id: cardUOBLadysSolitaire.id, category_id: 'groceries', earn_rate_mpd: 4.0, is_bonus: true,  conditions: { user_selectable: true }, conditions_note: 'Earn 4 mpd if Family (groceries) selected as bonus category. Choose 2 of 7 categories. Cap $750/month per category ($1,500 total). [VERIFIED]', effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-uobls-petrol',    card_id: cardUOBLadysSolitaire.id, category_id: 'petrol',    earn_rate_mpd: 0.4, is_bonus: false, conditions: {}, conditions_note: null, effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-uobls-bills',     card_id: cardUOBLadysSolitaire.id, category_id: 'bills',     earn_rate_mpd: 0.4, is_bonus: false, conditions: {}, conditions_note: null, effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-uobls-travel',    card_id: cardUOBLadysSolitaire.id, category_id: 'travel',    earn_rate_mpd: 4.0, is_bonus: true,  conditions: { user_selectable: true }, conditions_note: 'Earn 4 mpd if Travel selected as bonus category. Choose 2 of 7 categories. Cap $750/month per category ($1,500 total). [VERIFIED]', effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
  { id: 'er-uobls-general',   card_id: cardUOBLadysSolitaire.id, category_id: 'general',   earn_rate_mpd: 4.0, is_bonus: true,  conditions: { user_selectable: true }, conditions_note: 'Earn 4 mpd if Fashion, Beauty & Wellness, or Entertainment selected as bonus category (mapped to general). Choose 2 of 7 categories. Cap $750/month per category ($1,500 total). [VERIFIED]', effective_from: '2026-01-01', effective_to: null, source_url: null, created_at: ts, updated_at: ts },
];

export const capUOBLadysSolitaireShared: Cap = {
  id: 'cap-uobls-shared',
  card_id: cardUOBLadysSolitaire.id,
  category_id: null,
  monthly_cap_amount: 1500,
  cap_type: 'spend',
  notes: 'Combined cap across 2 chosen bonus categories. $1,500/month shared ($750 per category). [VERIFIED from UOB website]',
  created_at: ts,
  updated_at: ts,
};

// ---------------------------------------------------------------------------
// User Settings (F31)
// ---------------------------------------------------------------------------

/** User with $200/month estimated spend (below all thresholds) */
export const mockUserSettingsLow: UserSettings = {
  user_id: MOCK_USER_ID,
  estimated_monthly_spend: 200,
  created_at: ts,
  updated_at: ts,
};

/** User with $700/month estimated spend (above SC X $500, UOB PP $600) */
export const mockUserSettingsHigh: UserSettings = {
  user_id: MOCK_USER_ID,
  estimated_monthly_spend: 700,
  created_at: ts,
  updated_at: ts,
};
