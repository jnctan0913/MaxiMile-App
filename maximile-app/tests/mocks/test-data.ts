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
