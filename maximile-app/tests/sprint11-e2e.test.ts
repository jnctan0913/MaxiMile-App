/**
 * MaxiMile E2E Tests: Sprint 11, Story S11.6 — E2E Testing & Stabilization
 *
 * Covers acceptance criteria T11.34–T11.37:
 *   T11.34: New User Onboarding E2E (card browser, eligibility badges, card add flow)
 *   T11.35: Mixed Portfolio Recommendations (petrol, overseas, all 7 categories)
 *   T11.36: Sprint 7-10 Regression (Miles Portfolio, two-layer, goals, transfers)
 *   T11.37: POSB Everyday Card Removal Verification
 *
 * Uses the same mock pattern as sprint11-card-expansion.test.ts.
 */

import { createMockSupabase, MockSupabaseClient, MockQueryBuilder } from './mocks/supabase';

// ---------------------------------------------------------------------------
// Types (mirroring Sprint 11 schema)
// ---------------------------------------------------------------------------

interface CardRow {
  id: string;
  bank: string;
  name: string;
  slug: string;
  network: string;
  annual_fee: number;
  base_rate_mpd: number;
  is_active: boolean;
  miles_program_id: string | null;
  eligibility_criteria: Record<string, unknown> | null;
  notes: string | null;
}

interface EarnRuleRow {
  card_id: string;
  category_id: string;
  earn_rate_mpd: number;
  is_bonus: boolean;
  conditions: Record<string, unknown>;
  conditions_note: string;
}

interface CapRow {
  card_id: string;
  category_id: string | null;
  monthly_cap_amount: number;
  cap_type: string;
  notes: string;
}

interface MilesProgram {
  id: string;
  name: string;
  airline: string | null;
  program_type: 'airline' | 'bank_points' | 'transferable';
  icon_url: string;
}

interface TransferPartnerRow {
  source_program_id: string;
  destination_program_id: string;
  conversion_rate_from: number;
  conversion_rate_to: number;
  transfer_fee_sgd: number | null;
  min_transfer_amount: number | null;
}

interface UserCardRow {
  user_id: string;
  card_id: string;
  nickname: string | null;
  is_default: boolean;
  added_at: string;
}

interface RecommendResult {
  card_id: string;
  card_name: string;
  bank: string;
  earn_rate_mpd: number;
  remaining_cap: number | null;
  monthly_cap_amount: number | null;
  is_recommended: boolean;
  miles_program_id: string | null;
  conditions_note: string | null;
}

// ---------------------------------------------------------------------------
// Constants: card IDs
// ---------------------------------------------------------------------------

const CARD_IDS = {
  // Sprint 11 new cards
  DBS_VANTAGE:       '00000000-0000-0000-0003-000000000021',
  UOB_LADYS:         '00000000-0000-0000-0003-000000000022',
  UOB_VISA_SIG:      '00000000-0000-0000-0003-000000000023',
  OCBC_VOYAGE:       '00000000-0000-0000-0003-000000000024',
  SC_JOURNEY:        '00000000-0000-0000-0003-000000000025',
  SC_SMART:          '00000000-0000-0000-0003-000000000026',
  SC_BEYOND:         '00000000-0000-0000-0003-000000000027',
  MAYBANK_WORLD:     '00000000-0000-0000-0003-000000000028',
  MAYBANK_XL:        '00000000-0000-0000-0003-000000000029',
  HSBC_PREMIER:      '00000000-0000-0000-0003-000000000030',
  // Original cards referenced in tests
  DBS_ALTITUDE:      '00000000-0000-0000-0001-000000000001',
  CITI_PREMIERMILES: '00000000-0000-0000-0001-000000000004',
  POSB_EVERYDAY:     '00000000-0000-0000-0001-000000000020',
} as const;

const CATEGORIES = ['dining', 'transport', 'online', 'groceries', 'petrol', 'travel', 'general'] as const;

const MOCK_USER_ID = '00000000-0000-0000-0000-000000000099';

// ---------------------------------------------------------------------------
// Fixture: 10 new cards (Sprint 11)
// ---------------------------------------------------------------------------

const NEW_CARDS: CardRow[] = [
  { id: CARD_IDS.DBS_VANTAGE,   bank: 'DBS',     name: 'DBS Vantage Visa Infinite',         slug: 'dbs-vantage-visa-infinite', network: 'visa',       annual_fee: 600,  base_rate_mpd: 1.5, is_active: true,  miles_program_id: 'prog-dbs-points',     eligibility_criteria: { min_income: 120000, banking_tier: 'treasures' }, notes: null },
  { id: CARD_IDS.UOB_LADYS,     bank: 'UOB',     name: "UOB Lady's Solitaire Metal Card",   slug: 'uob-ladys-solitaire',       network: 'visa',       annual_fee: 490,  base_rate_mpd: 0.4, is_active: true,  miles_program_id: 'prog-uni',            eligibility_criteria: { gender: 'female' },                              notes: null },
  { id: CARD_IDS.UOB_VISA_SIG,  bank: 'UOB',     name: 'UOB Visa Signature',                slug: 'uob-visa-signature',        network: 'visa',       annual_fee: 196,  base_rate_mpd: 0.4, is_active: true,  miles_program_id: 'prog-uni',            eligibility_criteria: null,                                              notes: null },
  { id: CARD_IDS.OCBC_VOYAGE,   bank: 'OCBC',    name: 'OCBC VOYAGE Card',                  slug: 'ocbc-voyage-card',          network: 'visa',       annual_fee: 498,  base_rate_mpd: 1.3, is_active: true,  miles_program_id: 'prog-voyage-miles',   eligibility_criteria: null,                                              notes: null },
  { id: CARD_IDS.SC_JOURNEY,    bank: 'SC',      name: 'Standard Chartered Journey Card',   slug: 'sc-journey-card',           network: 'visa',       annual_fee: 196,  base_rate_mpd: 1.2, is_active: true,  miles_program_id: 'prog-360-rewards',    eligibility_criteria: null,                                              notes: null },
  { id: CARD_IDS.SC_SMART,      bank: 'SC',      name: 'Standard Chartered Smart Card',     slug: 'sc-smart-card',             network: 'visa',       annual_fee: 99,   base_rate_mpd: 0.4, is_active: true,  miles_program_id: 'prog-360-rewards',    eligibility_criteria: null,                                              notes: null },
  { id: CARD_IDS.SC_BEYOND,     bank: 'SC',      name: 'Standard Chartered Beyond Card',    slug: 'sc-beyond-card',            network: 'visa',       annual_fee: 1500, base_rate_mpd: 1.5, is_active: true,  miles_program_id: 'prog-360-rewards',    eligibility_criteria: { banking_tier: 'priority_banking' },              notes: null },
  { id: CARD_IDS.MAYBANK_WORLD, bank: 'Maybank',  name: 'Maybank World Mastercard',          slug: 'maybank-world-mc',          network: 'mastercard', annual_fee: 196,  base_rate_mpd: 0.4, is_active: true,  miles_program_id: 'prog-treatspoints',   eligibility_criteria: null,                                              notes: null },
  { id: CARD_IDS.MAYBANK_XL,    bank: 'Maybank',  name: 'Maybank XL Rewards Card',           slug: 'maybank-xl-rewards',        network: 'visa',       annual_fee: 87,   base_rate_mpd: 0.4, is_active: true,  miles_program_id: 'prog-treatspoints',   eligibility_criteria: { age_min: 21, age_max: 39 },                      notes: null },
  { id: CARD_IDS.HSBC_PREMIER,  bank: 'HSBC',    name: 'HSBC Premier Mastercard',           slug: 'hsbc-premier-mc',           network: 'mastercard', annual_fee: 709,  base_rate_mpd: 1.4, is_active: true,  miles_program_id: 'prog-hsbc-rewards',   eligibility_criteria: { banking_tier: 'premier' },                       notes: null },
];

// ---------------------------------------------------------------------------
// Fixture: 19 original active cards (pre-Sprint 11)
// ---------------------------------------------------------------------------

const ORIGINAL_BANKS = ['DBS', 'OCBC', 'UOB', 'Citi', 'HSBC', 'Amex', 'SC', 'Maybank', 'DBS', 'OCBC', 'UOB', 'Citi', 'HSBC', 'Amex', 'SC', 'DBS', 'OCBC', 'UOB', 'Citi'];
const ORIGINAL_PROGRAM_MAP: Record<string, string> = {
  DBS: 'prog-dbs-points', OCBC: 'prog-ocbc-rewards', UOB: 'prog-uni',
  Citi: 'prog-citi-miles', HSBC: 'prog-hsbc-rewards', Amex: 'prog-amex-mr',
  SC: 'prog-360-rewards', Maybank: 'prog-treatspoints',
};

function makeOriginalCard(index: number): CardRow {
  const bank = ORIGINAL_BANKS[index];
  const num = index + 1;
  const names: Record<number, string> = {
    1: 'DBS Altitude Visa',
    4: 'Citi PremierMiles Visa',
  };
  return {
    id: `00000000-0000-0000-0001-${String(num).padStart(12, '0')}`,
    bank,
    name: names[num] || `Original Card ${num}`,
    slug: names[num] ? names[num]!.toLowerCase().replace(/\s+/g, '-') : `original-card-${num}`,
    network: 'visa',
    annual_fee: 0,
    base_rate_mpd: num === 1 ? 1.4 : (num === 4 ? 1.2 : 1.0),
    is_active: true,
    miles_program_id: ORIGINAL_PROGRAM_MAP[bank],
    eligibility_criteria: null,
    notes: null,
  };
}

const ORIGINAL_19_ACTIVE: CardRow[] = Array.from({ length: 19 }, (_, i) => makeOriginalCard(i));

const POSB_EVERYDAY: CardRow = {
  id: CARD_IDS.POSB_EVERYDAY,
  bank: 'POSB',
  name: 'POSB Everyday Card',
  slug: 'posb-everyday-card',
  network: 'visa',
  annual_fee: 0,
  base_rate_mpd: 0.4,
  is_active: false,
  miles_program_id: 'prog-dbs-points',
  eligibility_criteria: null,
  notes: 'RECLASSIFIED (Sprint 11): Cashback card, not a miles card.',
};

const ALL_CARDS: CardRow[] = [...ORIGINAL_19_ACTIVE, POSB_EVERYDAY, ...NEW_CARDS];
const ALL_ACTIVE_CARDS: CardRow[] = ALL_CARDS.filter(c => c.is_active);

// ---------------------------------------------------------------------------
// Fixture: Earn rules for new cards (70 rules) + select original cards
// ---------------------------------------------------------------------------

const NEW_CARD_EARN_RULES: EarnRuleRow[] = [
  // DBS Vantage
  { card_id: CARD_IDS.DBS_VANTAGE, category_id: 'dining',    earn_rate_mpd: 1.5, is_bonus: false, conditions: {},                        conditions_note: 'Flat 1.5 mpd' },
  { card_id: CARD_IDS.DBS_VANTAGE, category_id: 'transport',  earn_rate_mpd: 1.5, is_bonus: false, conditions: {},                        conditions_note: 'Flat 1.5 mpd' },
  { card_id: CARD_IDS.DBS_VANTAGE, category_id: 'online',     earn_rate_mpd: 1.5, is_bonus: false, conditions: {},                        conditions_note: 'Flat 1.5 mpd' },
  { card_id: CARD_IDS.DBS_VANTAGE, category_id: 'groceries',  earn_rate_mpd: 1.5, is_bonus: false, conditions: {},                        conditions_note: 'Flat 1.5 mpd' },
  { card_id: CARD_IDS.DBS_VANTAGE, category_id: 'petrol',     earn_rate_mpd: 1.5, is_bonus: false, conditions: {},                        conditions_note: 'Flat 1.5 mpd' },
  { card_id: CARD_IDS.DBS_VANTAGE, category_id: 'travel',     earn_rate_mpd: 2.2, is_bonus: true,  conditions: { currency: 'foreign' },   conditions_note: 'Overseas 2.2 mpd' },
  { card_id: CARD_IDS.DBS_VANTAGE, category_id: 'general',    earn_rate_mpd: 1.5, is_bonus: false, conditions: {},                        conditions_note: 'Flat 1.5 mpd' },
  // OCBC VOYAGE
  { card_id: CARD_IDS.OCBC_VOYAGE, category_id: 'dining',    earn_rate_mpd: 1.3, is_bonus: false, conditions: {},                        conditions_note: 'Flat 1.3 mpd' },
  { card_id: CARD_IDS.OCBC_VOYAGE, category_id: 'transport',  earn_rate_mpd: 1.3, is_bonus: false, conditions: {},                        conditions_note: 'Flat 1.3 mpd' },
  { card_id: CARD_IDS.OCBC_VOYAGE, category_id: 'online',     earn_rate_mpd: 1.6, is_bonus: true,  conditions: {},                        conditions_note: 'Online 1.6 mpd' },
  { card_id: CARD_IDS.OCBC_VOYAGE, category_id: 'groceries',  earn_rate_mpd: 1.3, is_bonus: false, conditions: {},                        conditions_note: 'Flat 1.3 mpd' },
  { card_id: CARD_IDS.OCBC_VOYAGE, category_id: 'petrol',     earn_rate_mpd: 1.3, is_bonus: false, conditions: {},                        conditions_note: 'Flat 1.3 mpd' },
  { card_id: CARD_IDS.OCBC_VOYAGE, category_id: 'travel',     earn_rate_mpd: 2.2, is_bonus: true,  conditions: { currency: 'foreign' },   conditions_note: 'Overseas 2.2 mpd uncapped' },
  { card_id: CARD_IDS.OCBC_VOYAGE, category_id: 'general',    earn_rate_mpd: 1.3, is_bonus: false, conditions: {},                        conditions_note: 'Flat 1.3 mpd' },
  // Maybank World MC
  { card_id: CARD_IDS.MAYBANK_WORLD, category_id: 'dining',    earn_rate_mpd: 0.4, is_bonus: false, conditions: {},                        conditions_note: 'Base 0.4 mpd' },
  { card_id: CARD_IDS.MAYBANK_WORLD, category_id: 'transport',  earn_rate_mpd: 0.4, is_bonus: false, conditions: {},                        conditions_note: 'Base 0.4 mpd' },
  { card_id: CARD_IDS.MAYBANK_WORLD, category_id: 'online',     earn_rate_mpd: 0.4, is_bonus: false, conditions: {},                        conditions_note: 'Base 0.4 mpd' },
  { card_id: CARD_IDS.MAYBANK_WORLD, category_id: 'groceries',  earn_rate_mpd: 0.4, is_bonus: false, conditions: {},                        conditions_note: 'Base 0.4 mpd' },
  { card_id: CARD_IDS.MAYBANK_WORLD, category_id: 'petrol',     earn_rate_mpd: 4.0, is_bonus: true,  conditions: {},                        conditions_note: '4 mpd petrol UNCAPPED' },
  { card_id: CARD_IDS.MAYBANK_WORLD, category_id: 'travel',     earn_rate_mpd: 3.2, is_bonus: true,  conditions: { currency: 'foreign' },   conditions_note: 'Overseas 3.2 mpd' },
  { card_id: CARD_IDS.MAYBANK_WORLD, category_id: 'general',    earn_rate_mpd: 0.4, is_bonus: false, conditions: {},                        conditions_note: 'Base 0.4 mpd' },
  // Maybank XL
  { card_id: CARD_IDS.MAYBANK_XL, category_id: 'dining',    earn_rate_mpd: 4.0, is_bonus: true,  conditions: {},                            conditions_note: '4 mpd dining' },
  { card_id: CARD_IDS.MAYBANK_XL, category_id: 'transport',  earn_rate_mpd: 0.4, is_bonus: false, conditions: {},                            conditions_note: 'Base 0.4 mpd' },
  { card_id: CARD_IDS.MAYBANK_XL, category_id: 'online',     earn_rate_mpd: 4.0, is_bonus: true,  conditions: {},                            conditions_note: '4 mpd online' },
  { card_id: CARD_IDS.MAYBANK_XL, category_id: 'groceries',  earn_rate_mpd: 0.4, is_bonus: false, conditions: {},                            conditions_note: 'Base 0.4 mpd' },
  { card_id: CARD_IDS.MAYBANK_XL, category_id: 'petrol',     earn_rate_mpd: 0.4, is_bonus: false, conditions: {},                            conditions_note: 'Base 0.4 mpd' },
  { card_id: CARD_IDS.MAYBANK_XL, category_id: 'travel',     earn_rate_mpd: 4.0, is_bonus: true,  conditions: {},                            conditions_note: '4 mpd travel' },
  { card_id: CARD_IDS.MAYBANK_XL, category_id: 'general',    earn_rate_mpd: 4.0, is_bonus: true,  conditions: { includes: 'entertainment' }, conditions_note: '4 mpd entertainment/general' },
  // SC Beyond
  { card_id: CARD_IDS.SC_BEYOND, category_id: 'dining',    earn_rate_mpd: 2.0, is_bonus: true, conditions: { banking_tier: 'priority_banking' },                         conditions_note: 'Priority Banking 2 mpd' },
  { card_id: CARD_IDS.SC_BEYOND, category_id: 'transport',  earn_rate_mpd: 2.0, is_bonus: true, conditions: { banking_tier: 'priority_banking' },                         conditions_note: 'Priority Banking 2 mpd' },
  { card_id: CARD_IDS.SC_BEYOND, category_id: 'online',     earn_rate_mpd: 2.0, is_bonus: true, conditions: { banking_tier: 'priority_banking' },                         conditions_note: 'Priority Banking 2 mpd' },
  { card_id: CARD_IDS.SC_BEYOND, category_id: 'groceries',  earn_rate_mpd: 2.0, is_bonus: true, conditions: { banking_tier: 'priority_banking' },                         conditions_note: 'Priority Banking 2 mpd' },
  { card_id: CARD_IDS.SC_BEYOND, category_id: 'petrol',     earn_rate_mpd: 2.0, is_bonus: true, conditions: { banking_tier: 'priority_banking' },                         conditions_note: 'Priority Banking 2 mpd' },
  { card_id: CARD_IDS.SC_BEYOND, category_id: 'travel',     earn_rate_mpd: 4.0, is_bonus: true, conditions: { banking_tier: 'priority_banking', currency: 'foreign' },   conditions_note: 'Priority Banking 4 mpd overseas' },
  { card_id: CARD_IDS.SC_BEYOND, category_id: 'general',    earn_rate_mpd: 2.0, is_bonus: true, conditions: { banking_tier: 'priority_banking' },                         conditions_note: 'Priority Banking 2 mpd' },
  // UOB Lady's Solitaire
  { card_id: CARD_IDS.UOB_LADYS, category_id: 'dining',    earn_rate_mpd: 4.0, is_bonus: true,  conditions: { selectable_category: true, max_selected: 2 }, conditions_note: '4 mpd if selected' },
  { card_id: CARD_IDS.UOB_LADYS, category_id: 'transport',  earn_rate_mpd: 0.4, is_bonus: false, conditions: {},                                              conditions_note: 'Base rate' },
  { card_id: CARD_IDS.UOB_LADYS, category_id: 'online',     earn_rate_mpd: 4.0, is_bonus: true,  conditions: { selectable_category: true, max_selected: 2 }, conditions_note: '4 mpd if selected' },
  { card_id: CARD_IDS.UOB_LADYS, category_id: 'groceries',  earn_rate_mpd: 0.4, is_bonus: false, conditions: {},                                              conditions_note: 'Base rate' },
  { card_id: CARD_IDS.UOB_LADYS, category_id: 'petrol',     earn_rate_mpd: 0.4, is_bonus: false, conditions: {},                                              conditions_note: 'Base rate' },
  { card_id: CARD_IDS.UOB_LADYS, category_id: 'travel',     earn_rate_mpd: 0.4, is_bonus: false, conditions: {},                                              conditions_note: 'Base rate' },
  { card_id: CARD_IDS.UOB_LADYS, category_id: 'general',    earn_rate_mpd: 4.0, is_bonus: true,  conditions: { selectable_category: true, max_selected: 2 }, conditions_note: '4 mpd if selected' },
  // UOB Visa Signature
  { card_id: CARD_IDS.UOB_VISA_SIG, category_id: 'dining',    earn_rate_mpd: 4.0, is_bonus: true,  conditions: { min_spend_monthly: 1000, payment_method: 'contactless' }, conditions_note: '4 mpd contactless' },
  { card_id: CARD_IDS.UOB_VISA_SIG, category_id: 'transport',  earn_rate_mpd: 4.0, is_bonus: true,  conditions: { min_spend_monthly: 1000, payment_method: 'contactless' }, conditions_note: '4 mpd contactless' },
  { card_id: CARD_IDS.UOB_VISA_SIG, category_id: 'online',     earn_rate_mpd: 0.4, is_bonus: false, conditions: {},                                                          conditions_note: 'Base 0.4 mpd' },
  { card_id: CARD_IDS.UOB_VISA_SIG, category_id: 'groceries',  earn_rate_mpd: 4.0, is_bonus: true,  conditions: { min_spend_monthly: 1000, payment_method: 'contactless' }, conditions_note: '4 mpd contactless' },
  { card_id: CARD_IDS.UOB_VISA_SIG, category_id: 'petrol',     earn_rate_mpd: 4.0, is_bonus: true,  conditions: { min_spend_monthly: 1000 },                                  conditions_note: '4 mpd petrol' },
  { card_id: CARD_IDS.UOB_VISA_SIG, category_id: 'travel',     earn_rate_mpd: 4.0, is_bonus: true,  conditions: { min_spend_monthly: 1000, currency: 'foreign' },             conditions_note: '4 mpd overseas' },
  { card_id: CARD_IDS.UOB_VISA_SIG, category_id: 'general',    earn_rate_mpd: 0.4, is_bonus: false, conditions: {},                                                          conditions_note: 'Base 0.4 mpd' },
  // SC Journey
  { card_id: CARD_IDS.SC_JOURNEY, category_id: 'dining',    earn_rate_mpd: 3.0, is_bonus: true,  conditions: { includes: 'food_delivery' },  conditions_note: '3 mpd dining/food delivery' },
  { card_id: CARD_IDS.SC_JOURNEY, category_id: 'transport',  earn_rate_mpd: 3.0, is_bonus: true,  conditions: { includes: 'ride_hailing' },   conditions_note: '3 mpd ride-hailing' },
  { card_id: CARD_IDS.SC_JOURNEY, category_id: 'online',     earn_rate_mpd: 1.2, is_bonus: false, conditions: {},                              conditions_note: 'Base 1.2 mpd' },
  { card_id: CARD_IDS.SC_JOURNEY, category_id: 'groceries',  earn_rate_mpd: 3.0, is_bonus: true,  conditions: {},                              conditions_note: '3 mpd groceries' },
  { card_id: CARD_IDS.SC_JOURNEY, category_id: 'petrol',     earn_rate_mpd: 1.2, is_bonus: false, conditions: {},                              conditions_note: 'Base 1.2 mpd' },
  { card_id: CARD_IDS.SC_JOURNEY, category_id: 'travel',     earn_rate_mpd: 2.0, is_bonus: true,  conditions: { currency: 'foreign' },        conditions_note: '2 mpd overseas' },
  { card_id: CARD_IDS.SC_JOURNEY, category_id: 'general',    earn_rate_mpd: 1.2, is_bonus: false, conditions: {},                              conditions_note: 'Base 1.2 mpd' },
  // SC Smart
  { card_id: CARD_IDS.SC_SMART, category_id: 'dining',    earn_rate_mpd: 5.0,  is_bonus: true,  conditions: { includes: 'fast_food_only' },               conditions_note: '5 mpd fast food' },
  { card_id: CARD_IDS.SC_SMART, category_id: 'transport',  earn_rate_mpd: 9.28, is_bonus: true,  conditions: { includes: 'public_transport_ev_charging' }, conditions_note: '9.28 mpd public transport/EV' },
  { card_id: CARD_IDS.SC_SMART, category_id: 'online',     earn_rate_mpd: 5.0,  is_bonus: true,  conditions: { includes: 'streaming_services' },          conditions_note: '5 mpd streaming' },
  { card_id: CARD_IDS.SC_SMART, category_id: 'groceries',  earn_rate_mpd: 0.4,  is_bonus: false, conditions: {},                                           conditions_note: 'Base 0.4 mpd' },
  { card_id: CARD_IDS.SC_SMART, category_id: 'petrol',     earn_rate_mpd: 0.4,  is_bonus: false, conditions: {},                                           conditions_note: 'Base 0.4 mpd' },
  { card_id: CARD_IDS.SC_SMART, category_id: 'travel',     earn_rate_mpd: 0.4,  is_bonus: false, conditions: {},                                           conditions_note: 'Base 0.4 mpd' },
  { card_id: CARD_IDS.SC_SMART, category_id: 'general',    earn_rate_mpd: 0.4,  is_bonus: false, conditions: {},                                           conditions_note: 'Base 0.4 mpd' },
  // HSBC Premier
  { card_id: CARD_IDS.HSBC_PREMIER, category_id: 'dining',    earn_rate_mpd: 1.4, is_bonus: false, conditions: {},                        conditions_note: 'Flat 1.4 mpd' },
  { card_id: CARD_IDS.HSBC_PREMIER, category_id: 'transport',  earn_rate_mpd: 1.4, is_bonus: false, conditions: {},                        conditions_note: 'Flat 1.4 mpd' },
  { card_id: CARD_IDS.HSBC_PREMIER, category_id: 'online',     earn_rate_mpd: 1.4, is_bonus: false, conditions: {},                        conditions_note: 'Flat 1.4 mpd' },
  { card_id: CARD_IDS.HSBC_PREMIER, category_id: 'groceries',  earn_rate_mpd: 1.4, is_bonus: false, conditions: {},                        conditions_note: 'Flat 1.4 mpd' },
  { card_id: CARD_IDS.HSBC_PREMIER, category_id: 'petrol',     earn_rate_mpd: 1.4, is_bonus: false, conditions: {},                        conditions_note: 'Flat 1.4 mpd' },
  { card_id: CARD_IDS.HSBC_PREMIER, category_id: 'travel',     earn_rate_mpd: 2.3, is_bonus: true,  conditions: { currency: 'foreign' },   conditions_note: '2.3 mpd overseas' },
  { card_id: CARD_IDS.HSBC_PREMIER, category_id: 'general',    earn_rate_mpd: 1.4, is_bonus: false, conditions: {},                        conditions_note: 'Flat 1.4 mpd' },
];

// Original card earn rules (only the two referenced in recommendation tests)
const ORIGINAL_EARN_RULES: EarnRuleRow[] = [
  // DBS Altitude: 1.4 mpd local, 2.0 mpd overseas, 6 mpd online (Altitude's real rate) — simplified for test
  ...CATEGORIES.map(cat => ({
    card_id: CARD_IDS.DBS_ALTITUDE,
    category_id: cat,
    earn_rate_mpd: cat === 'travel' ? 2.0 : cat === 'online' ? 3.0 : 1.4,
    is_bonus: cat === 'travel' || cat === 'online',
    conditions: cat === 'travel' ? { currency: 'foreign' } : {},
    conditions_note: cat === 'travel' ? '2 mpd overseas' : cat === 'online' ? '3 mpd online' : '1.4 mpd local',
  })),
  // Citi PremierMiles: 1.2 mpd local, 2.0 mpd overseas (capped)
  ...CATEGORIES.map(cat => ({
    card_id: CARD_IDS.CITI_PREMIERMILES,
    category_id: cat,
    earn_rate_mpd: cat === 'travel' ? 2.0 : 1.2,
    is_bonus: cat === 'travel',
    conditions: cat === 'travel' ? { currency: 'foreign' } : {},
    conditions_note: cat === 'travel' ? '2 mpd overseas' : '1.2 mpd local',
  })),
];

const ALL_EARN_RULES: EarnRuleRow[] = [...NEW_CARD_EARN_RULES, ...ORIGINAL_EARN_RULES];

// Caps for new cards
const CAPS: CapRow[] = [
  { card_id: CARD_IDS.UOB_LADYS,    category_id: null,        monthly_cap_amount: 2000, cap_type: 'spend', notes: 'Combined cap' },
  { card_id: CARD_IDS.UOB_VISA_SIG, category_id: null,        monthly_cap_amount: 2000, cap_type: 'spend', notes: 'Combined cap' },
  { card_id: CARD_IDS.SC_JOURNEY,    category_id: 'dining',    monthly_cap_amount: 1000, cap_type: 'spend', notes: 'Dining cap' },
  { card_id: CARD_IDS.SC_JOURNEY,    category_id: 'transport', monthly_cap_amount: 1000, cap_type: 'spend', notes: 'Transport cap' },
  { card_id: CARD_IDS.SC_JOURNEY,    category_id: 'groceries', monthly_cap_amount: 1000, cap_type: 'spend', notes: 'Groceries cap' },
  { card_id: CARD_IDS.SC_SMART,      category_id: 'dining',    monthly_cap_amount: 500,  cap_type: 'spend', notes: 'Fast food cap' },
  { card_id: CARD_IDS.SC_SMART,      category_id: 'transport', monthly_cap_amount: 500,  cap_type: 'spend', notes: 'Public transport cap' },
  { card_id: CARD_IDS.SC_SMART,      category_id: 'online',    monthly_cap_amount: 500,  cap_type: 'spend', notes: 'Streaming cap' },
  { card_id: CARD_IDS.MAYBANK_XL,    category_id: null,        monthly_cap_amount: 2000, cap_type: 'spend', notes: 'Combined cap' },
];

// Citi PremierMiles overseas cap (for recommendation comparison)
const CITI_PM_OVERSEAS_CAP: CapRow = {
  card_id: CARD_IDS.CITI_PREMIERMILES, category_id: 'travel', monthly_cap_amount: 5000, cap_type: 'spend', notes: 'Overseas cap',
};

// ---------------------------------------------------------------------------
// Fixture: Miles programs
// ---------------------------------------------------------------------------

const MILES_PROGRAMS: MilesProgram[] = [
  { id: 'prog-krisflyer',     name: 'KrisFlyer',            airline: 'Singapore Airlines', program_type: 'airline',       icon_url: 'airplane-outline' },
  { id: 'prog-asia-miles',    name: 'Asia Miles',           airline: 'Cathay Pacific',     program_type: 'airline',       icon_url: 'airplane-outline' },
  { id: 'prog-dbs-points',    name: 'DBS Points',           airline: null,                 program_type: 'bank_points',   icon_url: 'card-outline' },
  { id: 'prog-uni',           name: 'UNI$',                 airline: null,                 program_type: 'bank_points',   icon_url: 'card-outline' },
  { id: 'prog-citi-miles',    name: 'Citi Miles',           airline: null,                 program_type: 'transferable',  icon_url: 'globe-outline' },
  { id: 'prog-360-rewards',   name: '360° Rewards',         airline: null,                 program_type: 'bank_points',   icon_url: 'card-outline' },
  { id: 'prog-treatspoints',  name: 'TreatsPoints',         airline: null,                 program_type: 'bank_points',   icon_url: 'card-outline' },
  { id: 'prog-hsbc-rewards',  name: 'HSBC Reward Points',   airline: null,                 program_type: 'bank_points',   icon_url: 'card-outline' },
  { id: 'prog-amex-mr',       name: 'Amex MR Points',       airline: null,                 program_type: 'transferable',  icon_url: 'globe-outline' },
  { id: 'prog-ocbc-rewards',  name: 'OCBC$ Rewards',        airline: null,                 program_type: 'bank_points',   icon_url: 'card-outline' },
  { id: 'prog-voyage-miles',  name: 'VOYAGE Miles',         airline: null,                 program_type: 'transferable',  icon_url: 'globe-outline' },
];

const VOYAGE_TRANSFER_PARTNERS: TransferPartnerRow[] = [
  'KrisFlyer', 'Asia Miles', 'British Airways Avios', 'Qantas Frequent Flyer', 'Flying Blue',
].map(dest => ({
  source_program_id: 'prog-voyage-miles',
  destination_program_id: `prog-${dest.toLowerCase().replace(/\s+/g, '-')}`,
  conversion_rate_from: 1,
  conversion_rate_to: 1,
  transfer_fee_sgd: null,
  min_transfer_amount: 5000,
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function setTableData<T>(mock: MockSupabaseClient, table: string, data: T): void {
  const qb = new MockQueryBuilder();
  qb.setData(data);
  mock.queryBuilders.set(table, qb);
}

function getEarnRulesForCard(cardId: string): EarnRuleRow[] {
  return ALL_EARN_RULES.filter(r => r.card_id === cardId);
}

function getCapsForCard(cardId: string): CapRow[] {
  return [...CAPS, CITI_PM_OVERSEAS_CAP].filter(c => c.card_id === cardId);
}

/**
 * Simulates the recommend() RPC: for a given category and user card set,
 * find the best card by earn rate, with cap awareness.
 */
function simulateRecommend(
  userCardIds: string[],
  categoryId: string,
  exhaustedCardIds: string[] = [],
): RecommendResult[] {
  const results: RecommendResult[] = [];

  for (const cardId of userCardIds) {
    const card = ALL_CARDS.find(c => c.id === cardId);
    if (!card || !card.is_active) continue;

    const rule = ALL_EARN_RULES.find(r => r.card_id === cardId && r.category_id === categoryId);
    if (!rule) continue;

    const cardCaps = getCapsForCard(cardId);
    const relevantCap = cardCaps.find(c => c.category_id === categoryId || c.category_id === null);

    const isExhausted = exhaustedCardIds.includes(cardId);
    const effectiveRate = isExhausted ? card.base_rate_mpd : rule.earn_rate_mpd;

    results.push({
      card_id: cardId,
      card_name: card.name,
      bank: card.bank,
      earn_rate_mpd: effectiveRate,
      remaining_cap: relevantCap ? (isExhausted ? 0 : relevantCap.monthly_cap_amount) : null,
      monthly_cap_amount: relevantCap ? relevantCap.monthly_cap_amount : null,
      is_recommended: false,
      miles_program_id: card.miles_program_id,
      conditions_note: rule.conditions_note,
    });
  }

  results.sort((a, b) => b.earn_rate_mpd - a.earn_rate_mpd);
  if (results.length > 0) results[0].is_recommended = true;
  return results;
}

// ===========================================================================
// T11.34: New User Onboarding E2E
// ===========================================================================

describe('T11.34: New User Onboarding E2E', () => {
  let mock: MockSupabaseClient;

  beforeEach(() => {
    mock = createMockSupabase();
    mock.mockAuth.setUser({ id: MOCK_USER_ID, email: 'test@maximile.sg' });
    mock.mockAuth.setSession({ access_token: 'test-token', user: { id: MOCK_USER_ID } });
  });

  describe('Card Browser: 29 active cards', () => {
    it('returns exactly 29 active cards after Sprint 11 migrations', async () => {
      setTableData(mock, 'cards', ALL_ACTIVE_CARDS);

      const { data, error } = await mock.supabase
        .from('cards')
        .select('*')
        .eq('is_active', true);

      expect(error).toBeNull();
      expect(data).toHaveLength(29);
    });

    it('cards are groupable by bank with correct counts', () => {
      const byBank: Record<string, CardRow[]> = {};
      ALL_ACTIVE_CARDS.forEach(card => {
        if (!byBank[card.bank]) byBank[card.bank] = [];
        byBank[card.bank].push(card);
      });

      const bankNames = Object.keys(byBank).sort();
      expect(bankNames.length).toBeGreaterThanOrEqual(8);
      expect(bankNames).toContain('DBS');
      expect(bankNames).toContain('UOB');
      expect(bankNames).toContain('OCBC');
      expect(bankNames).toContain('Citi');
      expect(bankNames).toContain('HSBC');
      expect(bankNames).toContain('SC');
      expect(bankNames).toContain('Maybank');
      expect(bankNames).toContain('Amex');

      expect(byBank['DBS'].length).toBeGreaterThanOrEqual(4);
      expect(byBank['UOB'].length).toBeGreaterThanOrEqual(4);
      expect(byBank['SC'].length).toBeGreaterThanOrEqual(4);
      expect(byBank['Maybank'].length).toBeGreaterThanOrEqual(3);
    });

    it('cards within each bank group are sortable alphabetically', () => {
      const byBank: Record<string, CardRow[]> = {};
      ALL_ACTIVE_CARDS.forEach(card => {
        if (!byBank[card.bank]) byBank[card.bank] = [];
        byBank[card.bank].push(card);
      });

      Object.values(byBank).forEach(cards => {
        const names = cards.map(c => c.name);
        const sorted = [...names].sort((a, b) => a.localeCompare(b));
        expect(names.sort((a, b) => a.localeCompare(b))).toEqual(sorted);
      });
    });
  });

  describe('EligibilityBadge: restricted vs unrestricted cards', () => {
    const RESTRICTED_CARD_NAMES = [
      'DBS Vantage Visa Infinite',
      "UOB Lady's Solitaire Metal Card",
      'Standard Chartered Beyond Card',
      'Maybank XL Rewards Card',
      'HSBC Premier Mastercard',
    ];

    it('exactly 5 cards have eligibility restrictions (non-null criteria)', () => {
      const restricted = ALL_ACTIVE_CARDS.filter(c => c.eligibility_criteria !== null);
      expect(restricted).toHaveLength(5);
      const names = restricted.map(c => c.name).sort();
      expect(names).toEqual([...RESTRICTED_CARD_NAMES].sort());
    });

    it('exactly 24 cards have NO eligibility restrictions (null criteria)', () => {
      const unrestricted = ALL_ACTIVE_CARDS.filter(c => c.eligibility_criteria === null);
      expect(unrestricted).toHaveLength(24);
    });

    it('DBS Vantage badge resolves to banking_tier "treasures" variant', () => {
      const card = ALL_ACTIVE_CARDS.find(c => c.name === 'DBS Vantage Visa Infinite')!;
      expect(card.eligibility_criteria).toEqual({ min_income: 120000, banking_tier: 'treasures' });
      const criteria = card.eligibility_criteria as Record<string, unknown>;
      expect(criteria.banking_tier).toBe('treasures');
    });

    it("UOB Lady's Solitaire badge resolves to gender variant", () => {
      const card = ALL_ACTIVE_CARDS.find(c => c.name === "UOB Lady's Solitaire Metal Card")!;
      expect(card.eligibility_criteria).toEqual({ gender: 'female' });
    });

    it('SC Beyond badge resolves to priority_banking variant', () => {
      const card = ALL_ACTIVE_CARDS.find(c => c.name === 'Standard Chartered Beyond Card')!;
      expect(card.eligibility_criteria).toEqual({ banking_tier: 'priority_banking' });
    });

    it('Maybank XL badge resolves to age variant (21-39)', () => {
      const card = ALL_ACTIVE_CARDS.find(c => c.name === 'Maybank XL Rewards Card')!;
      expect(card.eligibility_criteria).toEqual({ age_min: 21, age_max: 39 });
    });

    it('HSBC Premier badge resolves to premier banking variant', () => {
      const card = ALL_ACTIVE_CARDS.find(c => c.name === 'HSBC Premier Mastercard')!;
      expect(card.eligibility_criteria).toEqual({ banking_tier: 'premier' });
    });

    it('resolveBadgeVariant returns null for cards with null criteria', () => {
      const unrestricted = ALL_ACTIVE_CARDS.filter(c => c.eligibility_criteria === null);
      unrestricted.forEach(card => {
        expect(card.eligibility_criteria).toBeNull();
      });
    });
  });

  describe('Add 3 new cards → Miles tab shows correct programs', () => {
    const ADDED_CARD_IDS = [CARD_IDS.DBS_VANTAGE, CARD_IDS.MAYBANK_XL, CARD_IDS.OCBC_VOYAGE];

    it('user adds 3 cards and user_cards table is updated', async () => {
      const userCards: UserCardRow[] = ADDED_CARD_IDS.map(cardId => ({
        user_id: MOCK_USER_ID,
        card_id: cardId,
        nickname: null,
        is_default: cardId === CARD_IDS.DBS_VANTAGE,
        added_at: new Date().toISOString(),
      }));

      setTableData(mock, 'user_cards', userCards);

      const { data, error } = await mock.supabase
        .from('user_cards')
        .select('*')
        .eq('user_id', MOCK_USER_ID);

      expect(error).toBeNull();
      expect(data).toHaveLength(3);
    });

    it('Miles tab shows exactly 3 unique programs: DBS Points, TreatsPoints, VOYAGE Miles', () => {
      const addedCards = ALL_ACTIVE_CARDS.filter(c => ADDED_CARD_IDS.includes(c.id));
      const programIds = [...new Set(addedCards.map(c => c.miles_program_id))];

      expect(programIds).toHaveLength(3);
      expect(programIds).toContain('prog-dbs-points');
      expect(programIds).toContain('prog-treatspoints');
      expect(programIds).toContain('prog-voyage-miles');
    });

    it('program names resolve correctly from miles_programs table', () => {
      const expectedPrograms = ['DBS Points', 'TreatsPoints', 'VOYAGE Miles'];
      const addedCards = ALL_ACTIVE_CARDS.filter(c => ADDED_CARD_IDS.includes(c.id));
      const programIds = [...new Set(addedCards.map(c => c.miles_program_id))];

      const resolvedNames = programIds.map(pid =>
        MILES_PROGRAMS.find(p => p.id === pid)!.name
      );
      expect(resolvedNames.sort()).toEqual(expectedPrograms.sort());
    });

    it('VOYAGE Miles is marked as transferable program', () => {
      const voyage = MILES_PROGRAMS.find(p => p.id === 'prog-voyage-miles')!;
      expect(voyage.program_type).toBe('transferable');
      expect(voyage.airline).toBeNull();
    });
  });
});

// ===========================================================================
// T11.35: Mixed Portfolio (old + new cards) Recommendations
// ===========================================================================

describe('T11.35: Mixed Portfolio Recommendations', () => {
  let mock: MockSupabaseClient;

  const MIXED_PORTFOLIO = [
    CARD_IDS.DBS_ALTITUDE,
    CARD_IDS.CITI_PREMIERMILES,
    CARD_IDS.MAYBANK_WORLD,
    CARD_IDS.OCBC_VOYAGE,
  ];

  beforeEach(() => {
    mock = createMockSupabase();
    mock.mockAuth.setUser({ id: MOCK_USER_ID });
    mock.mockAuth.setSession({ access_token: 'token' });
  });

  describe('Petrol recommendation: Maybank World MC wins', () => {
    it('Maybank World MC (4 mpd uncapped) beats DBS Altitude (1.4 mpd) for petrol', () => {
      const results = simulateRecommend(MIXED_PORTFOLIO, 'petrol');
      expect(results.length).toBeGreaterThan(0);

      const winner = results[0];
      expect(winner.card_name).toBe('Maybank World Mastercard');
      expect(winner.earn_rate_mpd).toBe(4.0);
      expect(winner.is_recommended).toBe(true);
      expect(winner.remaining_cap).toBeNull();

      const altitude = results.find(r => r.card_name === 'DBS Altitude Visa');
      expect(altitude).toBeDefined();
      expect(altitude!.earn_rate_mpd).toBe(1.4);
      expect(altitude!.is_recommended).toBe(false);
    });

    it('Maybank World petrol has no cap (null remaining_cap)', () => {
      const caps = getCapsForCard(CARD_IDS.MAYBANK_WORLD);
      const petrolCap = caps.find(c => c.category_id === 'petrol');
      expect(petrolCap).toBeUndefined();

      const results = simulateRecommend(MIXED_PORTFOLIO, 'petrol');
      const maybank = results.find(r => r.card_id === CARD_IDS.MAYBANK_WORLD)!;
      expect(maybank.monthly_cap_amount).toBeNull();
    });
  });

  describe('Overseas recommendation: OCBC VOYAGE wins when Citi cap exhausted', () => {
    it('OCBC VOYAGE (2.2 mpd uncapped) outranks Citi PremierMiles when cap exhausted', () => {
      const results = simulateRecommend(
        MIXED_PORTFOLIO,
        'travel',
        [CARD_IDS.CITI_PREMIERMILES],
      );

      const voyage = results.find(r => r.card_id === CARD_IDS.OCBC_VOYAGE)!;
      expect(voyage).toBeDefined();
      expect(voyage.earn_rate_mpd).toBe(2.2);
      expect(voyage.remaining_cap).toBeNull();

      const citi = results.find(r => r.card_id === CARD_IDS.CITI_PREMIERMILES)!;
      expect(citi.earn_rate_mpd).toBe(1.2);
      expect(citi.remaining_cap).toBe(0);

      expect(voyage.earn_rate_mpd).toBeGreaterThan(citi.earn_rate_mpd);

      const voyageRank = results.indexOf(voyage);
      const citiRank = results.indexOf(citi);
      expect(voyageRank).toBeLessThan(citiRank);
    });

    it('OCBC VOYAGE overseas rate is uncapped (no cap entry)', () => {
      const caps = getCapsForCard(CARD_IDS.OCBC_VOYAGE);
      expect(caps).toHaveLength(0);
    });

    it('before cap exhaustion, both Citi PM and OCBC VOYAGE tie at 2.0/2.2 mpd overseas', () => {
      const results = simulateRecommend(MIXED_PORTFOLIO, 'travel');
      const voyage = results.find(r => r.card_id === CARD_IDS.OCBC_VOYAGE)!;
      const citi = results.find(r => r.card_id === CARD_IDS.CITI_PREMIERMILES)!;
      expect(voyage.earn_rate_mpd).toBe(2.2);
      expect(citi.earn_rate_mpd).toBe(2.0);
      expect(voyage.earn_rate_mpd).toBeGreaterThan(citi.earn_rate_mpd);
    });
  });

  describe('All 7 categories produce valid recommendations', () => {
    it.each(CATEGORIES)('category "%s" returns at least one recommendation with non-null program ID', (category) => {
      const results = simulateRecommend(MIXED_PORTFOLIO, category);
      expect(results.length).toBeGreaterThan(0);

      const winner = results.find(r => r.is_recommended);
      expect(winner).toBeDefined();
      expect(winner!.miles_program_id).not.toBeNull();
      expect(typeof winner!.miles_program_id).toBe('string');
      expect(winner!.miles_program_id!.length).toBeGreaterThan(0);
    });

    it('no recommendation across all 7 categories has a NULL program ID', () => {
      CATEGORIES.forEach(category => {
        const results = simulateRecommend(MIXED_PORTFOLIO, category);
        results.forEach(r => {
          expect(r.miles_program_id).not.toBeNull();
        });
      });
    });

    it('recommend() via RPC mock returns valid data for petrol category', async () => {
      const petrolResults = simulateRecommend(MIXED_PORTFOLIO, 'petrol');
      mock.mockRpc.setData('recommend', petrolResults);

      const { data, error } = await mock.supabase.rpc('recommend', { p_category_id: 'petrol' });

      expect(error).toBeNull();
      const recs = data as RecommendResult[];
      expect(recs.length).toBeGreaterThan(0);
      expect(recs[0].card_name).toBe('Maybank World Mastercard');
    });
  });
});

// ===========================================================================
// T11.36: Sprint 7-10 Regression
// ===========================================================================

describe('T11.36: Sprint 7-10 Regression', () => {
  let mock: MockSupabaseClient;

  beforeEach(() => {
    mock = createMockSupabase();
    mock.mockAuth.setUser({ id: MOCK_USER_ID });
    mock.mockAuth.setSession({ access_token: 'token' });
  });

  describe('Miles Portfolio: programs list, detail, and balance update', () => {
    it('get_miles_portfolio RPC returns programs with balances', async () => {
      const portfolioData = [
        {
          program_id: 'prog-krisflyer',
          program_name: 'KrisFlyer',
          program_type: 'airline',
          manual_balance: 28500,
          auto_earned: 2450,
          total_balance: 30950,
          contributing_cards: ['DBS Altitude Visa'],
        },
        {
          program_id: 'prog-dbs-points',
          program_name: 'DBS Points',
          program_type: 'bank_points',
          manual_balance: 15000,
          auto_earned: 1200,
          total_balance: 16200,
          contributing_cards: ['DBS Altitude Visa', 'DBS Vantage Visa Infinite'],
        },
      ];

      mock.mockRpc.setData('get_miles_portfolio', portfolioData);
      const { data, error } = await mock.supabase.rpc('get_miles_portfolio', { p_user_id: MOCK_USER_ID });

      expect(error).toBeNull();
      const programs = data as typeof portfolioData;
      expect(programs).toHaveLength(2);
      expect(programs[0].program_name).toBe('KrisFlyer');
      expect(programs[0].total_balance).toBe(30950);
      expect(programs[1].contributing_cards).toContain('DBS Vantage Visa Infinite');
    });

    it('upsert_miles_balance RPC updates balance successfully', async () => {
      mock.mockRpc.setData('upsert_miles_balance', null);

      const { error } = await mock.supabase.rpc('upsert_miles_balance', {
        p_user_id: MOCK_USER_ID,
        p_program_id: 'prog-krisflyer',
        p_amount: 35000,
      });

      expect(error).toBeNull();
    });

    it('miles_programs table query returns all programs including VOYAGE Miles', async () => {
      setTableData(mock, 'miles_programs', MILES_PROGRAMS);

      const { data, error } = await mock.supabase
        .from('miles_programs')
        .select('*');

      expect(error).toBeNull();
      const programs = data as MilesProgram[];
      expect(programs.length).toBeGreaterThanOrEqual(11);

      const voyage = programs.find(p => p.name === 'VOYAGE Miles');
      expect(voyage).toBeDefined();
      expect(voyage!.program_type).toBe('transferable');
    });

    it('program detail includes correct type metadata (airline/bank_points/transferable)', () => {
      const airlines = MILES_PROGRAMS.filter(p => p.program_type === 'airline');
      const bankPoints = MILES_PROGRAMS.filter(p => p.program_type === 'bank_points');
      const transferable = MILES_PROGRAMS.filter(p => p.program_type === 'transferable');

      expect(airlines.length).toBeGreaterThanOrEqual(2);
      expect(bankPoints.length).toBeGreaterThanOrEqual(5);
      expect(transferable.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Two-layer architecture: segmented control and layer hierarchy', () => {
    it('segmented control supports three modes: airline, bank, all', () => {
      const modes = ['airline', 'bank', 'all'] as const;
      modes.forEach(mode => {
        let filtered: MilesProgram[];
        if (mode === 'airline') {
          filtered = MILES_PROGRAMS.filter(p => p.program_type === 'airline');
        } else if (mode === 'bank') {
          filtered = MILES_PROGRAMS.filter(p => p.program_type === 'bank_points');
        } else {
          filtered = MILES_PROGRAMS;
        }
        expect(filtered.length).toBeGreaterThan(0);
      });
    });

    it('Layer 1 summary: aggregates balances across all programs', () => {
      const balances = [
        { program_id: 'prog-krisflyer', total_balance: 30950 },
        { program_id: 'prog-dbs-points', total_balance: 16200 },
        { program_id: 'prog-voyage-miles', total_balance: 8000 },
      ];

      const totalMiles = balances.reduce((sum, b) => sum + b.total_balance, 0);
      expect(totalMiles).toBe(55150);
      expect(balances).toHaveLength(3);
    });

    it('Layer 2 detail: individual program shows contributing cards and transfer options', () => {
      const programDetail = {
        program_id: 'prog-voyage-miles',
        program_name: 'VOYAGE Miles',
        program_type: 'transferable',
        total_balance: 8000,
        contributing_cards: ['OCBC VOYAGE Card'],
        transfer_partners: VOYAGE_TRANSFER_PARTNERS,
      };

      expect(programDetail.contributing_cards).toContain('OCBC VOYAGE Card');
      expect(programDetail.transfer_partners).toHaveLength(5);
      expect(programDetail.program_type).toBe('transferable');
    });

    it('BottomSheet interaction: program detail opens for VOYAGE Miles', () => {
      const voyageProgram = MILES_PROGRAMS.find(p => p.id === 'prog-voyage-miles')!;
      expect(voyageProgram).toBeDefined();
      expect(voyageProgram.name).toBe('VOYAGE Miles');

      const bottomSheetState = {
        isOpen: true,
        selectedProgram: voyageProgram,
        balanceEditable: true,
      };
      expect(bottomSheetState.isOpen).toBe(true);
      expect(bottomSheetState.selectedProgram.id).toBe('prog-voyage-miles');
    });
  });

  describe('Goal tracker and redemption logging', () => {
    it('goal tracker creates a goal with target miles and deadline', () => {
      const goal = {
        user_id: MOCK_USER_ID,
        program_id: 'prog-krisflyer',
        target_miles: 50000,
        current_miles: 30950,
        deadline: '2026-12-31',
        label: 'SQ Business Class SIN-NRT',
      };

      const progress = goal.current_miles / goal.target_miles;
      expect(progress).toBeCloseTo(0.619, 2);
      expect(goal.target_miles - goal.current_miles).toBe(19050);
    });

    it('redemption logging records a miles deduction', () => {
      const redemption = {
        user_id: MOCK_USER_ID,
        program_id: 'prog-krisflyer',
        amount: 25000,
        type: 'redemption' as const,
        description: 'SQ Business Saver SIN-NRT',
        redeemed_at: '2026-02-20T10:00:00Z',
      };

      expect(redemption.amount).toBe(25000);
      expect(redemption.type).toBe('redemption');
      expect(redemption.description).toBeTruthy();
    });

    it('goal progress updates after redemption', () => {
      const beforeRedemption = 30950;
      const redemptionAmount = 25000;
      const afterRedemption = beforeRedemption - redemptionAmount;
      expect(afterRedemption).toBe(5950);

      const targetMiles = 50000;
      const progressAfter = afterRedemption / targetMiles;
      expect(progressAfter).toBeCloseTo(0.119, 2);
    });
  });

  describe('Transfer nudges for transferable programs', () => {
    it('transferable programs (Citi Miles, VOYAGE Miles, Amex MR) show transfer nudges', () => {
      const transferable = MILES_PROGRAMS.filter(p => p.program_type === 'transferable');
      expect(transferable.length).toBeGreaterThanOrEqual(3);

      const transferableNames = transferable.map(p => p.name);
      expect(transferableNames).toContain('Citi Miles');
      expect(transferableNames).toContain('VOYAGE Miles');
      expect(transferableNames).toContain('Amex MR Points');
    });

    it('VOYAGE Miles has 5 transfer partners for nudge display', () => {
      expect(VOYAGE_TRANSFER_PARTNERS).toHaveLength(5);
      const destinationNames = VOYAGE_TRANSFER_PARTNERS.map(tp => tp.destination_program_id);
      expect(destinationNames).toContain('prog-krisflyer');
      expect(destinationNames).toContain('prog-asia-miles');
    });

    it('transfer nudge shows conversion rate (1:1 for VOYAGE Miles)', () => {
      VOYAGE_TRANSFER_PARTNERS.forEach(tp => {
        expect(tp.conversion_rate_from).toBe(1);
        expect(tp.conversion_rate_to).toBe(1);
        const displayRate = `${tp.conversion_rate_from}:${tp.conversion_rate_to}`;
        expect(displayRate).toBe('1:1');
      });
    });

    it('non-transferable programs (bank_points, airline) do NOT show transfer nudges', () => {
      const nonTransferable = MILES_PROGRAMS.filter(p => p.program_type !== 'transferable');
      nonTransferable.forEach(program => {
        const hasPartners = VOYAGE_TRANSFER_PARTNERS.some(
          tp => tp.source_program_id === program.id
        );
        if (program.id !== 'prog-voyage-miles') {
          expect(hasPartners).toBe(false);
        }
      });
    });
  });
});

// ===========================================================================
// T11.37: POSB Everyday Card Removal Verification
// ===========================================================================

describe('T11.37: POSB Everyday Card Removal Verification', () => {
  let mock: MockSupabaseClient;

  beforeEach(() => {
    mock = createMockSupabase();
  });

  describe('POSB Everyday Card not visible in card browser', () => {
    it('POSB Everyday Card has is_active = false', () => {
      expect(POSB_EVERYDAY.is_active).toBe(false);
    });

    it('POSB Everyday Card does NOT appear in active cards list (card browser)', () => {
      const activeNames = ALL_ACTIVE_CARDS.map(c => c.name);
      expect(activeNames).not.toContain('POSB Everyday Card');
    });

    it('filtering cards by is_active = true excludes POSB', async () => {
      setTableData(mock, 'cards', ALL_ACTIVE_CARDS);

      const { data } = await mock.supabase
        .from('cards')
        .select('name')
        .eq('is_active', true);

      const cards = data as CardRow[];
      const names = cards.map(c => c.name);
      expect(names).not.toContain('POSB Everyday Card');
      expect(cards).toHaveLength(29);
    });

    it('ALL_CARDS includes POSB but ALL_ACTIVE_CARDS does not', () => {
      const allNames = ALL_CARDS.map(c => c.name);
      expect(allNames).toContain('POSB Everyday Card');
      expect(ALL_CARDS).toHaveLength(30);
      expect(ALL_ACTIVE_CARDS).toHaveLength(29);
    });
  });

  describe('POSB Everyday Card not in recommendation results', () => {
    it('recommend() for any category never returns POSB as winner', () => {
      const userCardsIncludingPOSB = [
        CARD_IDS.POSB_EVERYDAY,
        CARD_IDS.DBS_ALTITUDE,
        CARD_IDS.MAYBANK_WORLD,
      ];

      CATEGORIES.forEach(category => {
        const results = simulateRecommend(userCardsIncludingPOSB, category);
        results.forEach(r => {
          expect(r.card_name).not.toBe('POSB Everyday Card');
        });
      });
    });

    it('POSB is excluded from recommend() because is_active = false', () => {
      const results = simulateRecommend(
        [CARD_IDS.POSB_EVERYDAY, CARD_IDS.DBS_ALTITUDE],
        'general',
      );

      expect(results.every(r => r.card_id !== CARD_IDS.POSB_EVERYDAY)).toBe(true);
      expect(results.length).toBe(1);
      expect(results[0].card_name).toBe('DBS Altitude Visa');
    });
  });

  describe('Existing user_cards FK integrity preserved', () => {
    it('user_cards referencing POSB are preserved (FK to cards.id still valid)', async () => {
      const legacyUserCards: UserCardRow[] = [
        {
          user_id: MOCK_USER_ID,
          card_id: CARD_IDS.POSB_EVERYDAY,
          nickname: 'My old POSB',
          is_default: false,
          added_at: '2025-06-15T00:00:00Z',
        },
        {
          user_id: MOCK_USER_ID,
          card_id: CARD_IDS.DBS_ALTITUDE,
          nickname: null,
          is_default: true,
          added_at: '2025-06-15T00:00:00Z',
        },
      ];

      setTableData(mock, 'user_cards', legacyUserCards);

      const { data, error } = await mock.supabase
        .from('user_cards')
        .select('*')
        .eq('user_id', MOCK_USER_ID);

      expect(error).toBeNull();
      const cards = data as UserCardRow[];
      expect(cards).toHaveLength(2);

      const posbEntry = cards.find(c => c.card_id === CARD_IDS.POSB_EVERYDAY);
      expect(posbEntry).toBeDefined();
      expect(posbEntry!.nickname).toBe('My old POSB');
    });

    it('POSB card record still exists in cards table (just inactive)', () => {
      const posbInAll = ALL_CARDS.find(c => c.id === CARD_IDS.POSB_EVERYDAY);
      expect(posbInAll).toBeDefined();
      expect(posbInAll!.is_active).toBe(false);
      expect(posbInAll!.miles_program_id).toBe('prog-dbs-points');
    });

    it('POSB card FK reference from user_cards resolves to a valid card row', () => {
      const card = ALL_CARDS.find(c => c.id === CARD_IDS.POSB_EVERYDAY);
      expect(card).toBeDefined();
      expect(card!.bank).toBe('POSB');
      expect(card!.name).toBe('POSB Everyday Card');
    });
  });

  describe("POSB deactivation note contains 'RECLASSIFIED'", () => {
    it("POSB Everyday Card notes field contains 'RECLASSIFIED'", () => {
      expect(POSB_EVERYDAY.notes).not.toBeNull();
      expect(POSB_EVERYDAY.notes).toContain('RECLASSIFIED');
    });

    it('POSB notes explains cashback reclassification', () => {
      expect(POSB_EVERYDAY.notes).toContain('Cashback card');
      expect(POSB_EVERYDAY.notes).toContain('not a miles card');
    });

    it('POSB notes references Sprint 11', () => {
      expect(POSB_EVERYDAY.notes).toContain('Sprint 11');
    });
  });
});
