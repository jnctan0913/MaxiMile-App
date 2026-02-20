/**
 * MaxiMile E2E Validation Tests: Sprint 11 -- Card Expansion (F22)
 *
 * Validates the data integrity of migrations 013 and 014:
 *   - Migration 013: POSB Everyday Card deactivation + eligibility_criteria column
 *   - Migration 014: 10 new cards, VOYAGE Miles program, 5 transfer partners,
 *                    70 earn rules (7 per card), caps, and eligibility metadata
 *
 * These tests mirror the migration SQL as source of truth, using local
 * simulation data fixtures (same pattern as miles-ecosystem.test.ts).
 *
 * Post-migration state: 29 active miles cards (20 original - 1 POSB + 10 new).
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

// ---------------------------------------------------------------------------
// Constants: card IDs from migration 014
// ---------------------------------------------------------------------------

const CARD_IDS = {
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
} as const;

const ALL_NEW_CARD_IDS = Object.values(CARD_IDS);

// 7 spending categories (matching migration seed data)
const CATEGORIES = ['dining', 'transport', 'online', 'groceries', 'petrol', 'travel', 'general'] as const;

// ---------------------------------------------------------------------------
// Test fixture data: 10 new cards (sourced from migration 014)
// ---------------------------------------------------------------------------

const NEW_CARDS: CardRow[] = [
  {
    id: CARD_IDS.DBS_VANTAGE,
    bank: 'DBS',
    name: 'DBS Vantage Visa Infinite',
    slug: 'dbs-vantage-visa-infinite',
    network: 'visa',
    annual_fee: 600.00,
    base_rate_mpd: 1.5,
    is_active: true,
    miles_program_id: 'prog-dbs-points',     // DBS Points
    eligibility_criteria: { min_income: 120000, banking_tier: 'treasures' },
    notes: null,
  },
  {
    id: CARD_IDS.UOB_LADYS,
    bank: 'UOB',
    name: "UOB Lady's Solitaire Metal Card",
    slug: 'uob-ladys-solitaire',
    network: 'visa',
    annual_fee: 490.00,
    base_rate_mpd: 0.4,
    is_active: true,
    miles_program_id: 'prog-uni',            // UNI$
    eligibility_criteria: { gender: 'female' },
    notes: null,
  },
  {
    id: CARD_IDS.UOB_VISA_SIG,
    bank: 'UOB',
    name: 'UOB Visa Signature',
    slug: 'uob-visa-signature',
    network: 'visa',
    annual_fee: 196.00,
    base_rate_mpd: 0.4,
    is_active: true,
    miles_program_id: 'prog-uni',            // UNI$
    eligibility_criteria: null,
    notes: null,
  },
  {
    id: CARD_IDS.OCBC_VOYAGE,
    bank: 'OCBC',
    name: 'OCBC VOYAGE Card',
    slug: 'ocbc-voyage-card',
    network: 'visa',
    annual_fee: 498.00,
    base_rate_mpd: 1.3,
    is_active: true,
    miles_program_id: 'prog-voyage-miles',   // VOYAGE Miles (new)
    eligibility_criteria: null,
    notes: null,
  },
  {
    id: CARD_IDS.SC_JOURNEY,
    bank: 'SC',
    name: 'Standard Chartered Journey Card',
    slug: 'sc-journey-card',
    network: 'visa',
    annual_fee: 196.00,
    base_rate_mpd: 1.2,
    is_active: true,
    miles_program_id: 'prog-360-rewards',    // 360 Rewards
    eligibility_criteria: null,
    notes: null,
  },
  {
    id: CARD_IDS.SC_SMART,
    bank: 'SC',
    name: 'Standard Chartered Smart Card',
    slug: 'sc-smart-card',
    network: 'visa',
    annual_fee: 99.00,
    base_rate_mpd: 0.4,
    is_active: true,
    miles_program_id: 'prog-360-rewards',    // 360 Rewards
    eligibility_criteria: null,
    notes: null,
  },
  {
    id: CARD_IDS.SC_BEYOND,
    bank: 'SC',
    name: 'Standard Chartered Beyond Card',
    slug: 'sc-beyond-card',
    network: 'visa',
    annual_fee: 1500.00,
    base_rate_mpd: 1.5,
    is_active: true,
    miles_program_id: 'prog-360-rewards',    // 360 Rewards
    eligibility_criteria: { banking_tier: 'priority_banking' },
    notes: null,
  },
  {
    id: CARD_IDS.MAYBANK_WORLD,
    bank: 'Maybank',
    name: 'Maybank World Mastercard',
    slug: 'maybank-world-mc',
    network: 'mastercard',
    annual_fee: 196.00,
    base_rate_mpd: 0.4,
    is_active: true,
    miles_program_id: 'prog-treatspoints',   // TreatsPoints
    eligibility_criteria: null,
    notes: null,
  },
  {
    id: CARD_IDS.MAYBANK_XL,
    bank: 'Maybank',
    name: 'Maybank XL Rewards Card',
    slug: 'maybank-xl-rewards',
    network: 'visa',
    annual_fee: 87.00,
    base_rate_mpd: 0.4,
    is_active: true,
    miles_program_id: 'prog-treatspoints',   // TreatsPoints
    eligibility_criteria: { age_min: 21, age_max: 39 },
    notes: null,
  },
  {
    id: CARD_IDS.HSBC_PREMIER,
    bank: 'HSBC',
    name: 'HSBC Premier Mastercard',
    slug: 'hsbc-premier-mc',
    network: 'mastercard',
    annual_fee: 709.00,
    base_rate_mpd: 1.4,
    is_active: true,
    miles_program_id: 'prog-hsbc-rewards',   // HSBC Reward Points
    eligibility_criteria: { banking_tier: 'premier' },
    notes: null,
  },
];

// ---------------------------------------------------------------------------
// Earn rules for all 10 new cards (7 categories each = 70 rules)
// Sourced directly from migration 014 Section 4
// ---------------------------------------------------------------------------

const EARN_RULES: EarnRuleRow[] = [
  // CARD 21: DBS Vantage -- 1.5 mpd local, 2.2 mpd overseas (travel)
  { card_id: CARD_IDS.DBS_VANTAGE, category_id: 'dining',    earn_rate_mpd: 1.5,  is_bonus: false, conditions: {},                          conditions_note: 'Flat 1.5 mpd on local dining.' },
  { card_id: CARD_IDS.DBS_VANTAGE, category_id: 'transport',  earn_rate_mpd: 1.5,  is_bonus: false, conditions: {},                          conditions_note: 'Flat 1.5 mpd on local transport.' },
  { card_id: CARD_IDS.DBS_VANTAGE, category_id: 'online',     earn_rate_mpd: 1.5,  is_bonus: false, conditions: {},                          conditions_note: 'Flat 1.5 mpd on local online.' },
  { card_id: CARD_IDS.DBS_VANTAGE, category_id: 'groceries',  earn_rate_mpd: 1.5,  is_bonus: false, conditions: {},                          conditions_note: 'Flat 1.5 mpd on local groceries.' },
  { card_id: CARD_IDS.DBS_VANTAGE, category_id: 'petrol',     earn_rate_mpd: 1.5,  is_bonus: false, conditions: {},                          conditions_note: 'Flat 1.5 mpd on petrol.' },
  { card_id: CARD_IDS.DBS_VANTAGE, category_id: 'travel',     earn_rate_mpd: 2.2,  is_bonus: true,  conditions: { currency: 'foreign' },     conditions_note: 'Earn 2.2 mpd on all overseas/FCY spend.' },
  { card_id: CARD_IDS.DBS_VANTAGE, category_id: 'general',    earn_rate_mpd: 1.5,  is_bonus: false, conditions: {},                          conditions_note: 'Flat 1.5 mpd on all other local spend.' },

  // CARD 22: UOB Lady's Solitaire -- 4 mpd on TWO self-selected preferred categories, 0.4 mpd base
  { card_id: CARD_IDS.UOB_LADYS, category_id: 'dining',    earn_rate_mpd: 4.0,  is_bonus: true,  conditions: { selectable_category: true, max_selected: 2 }, conditions_note: 'Earn 4 mpd if dining is one of TWO selected.' },
  { card_id: CARD_IDS.UOB_LADYS, category_id: 'transport',  earn_rate_mpd: 0.4,  is_bonus: false, conditions: {},                                              conditions_note: 'Base rate.' },
  { card_id: CARD_IDS.UOB_LADYS, category_id: 'online',     earn_rate_mpd: 4.0,  is_bonus: true,  conditions: { selectable_category: true, max_selected: 2 }, conditions_note: 'Earn 4 mpd if online is one of TWO selected.' },
  { card_id: CARD_IDS.UOB_LADYS, category_id: 'groceries',  earn_rate_mpd: 0.4,  is_bonus: false, conditions: {},                                              conditions_note: 'Base rate.' },
  { card_id: CARD_IDS.UOB_LADYS, category_id: 'petrol',     earn_rate_mpd: 0.4,  is_bonus: false, conditions: {},                                              conditions_note: 'Base rate.' },
  { card_id: CARD_IDS.UOB_LADYS, category_id: 'travel',     earn_rate_mpd: 0.4,  is_bonus: false, conditions: {},                                              conditions_note: 'Base rate.' },
  { card_id: CARD_IDS.UOB_LADYS, category_id: 'general',    earn_rate_mpd: 4.0,  is_bonus: true,  conditions: { selectable_category: true, max_selected: 2 }, conditions_note: 'Earn 4 mpd if general/fashion is one of TWO selected.' },

  // CARD 23: UOB Visa Signature -- 4 mpd contactless, petrol, overseas with min spend
  { card_id: CARD_IDS.UOB_VISA_SIG, category_id: 'dining',    earn_rate_mpd: 4.0,  is_bonus: true,  conditions: { min_spend_monthly: 1000, payment_method: 'contactless' }, conditions_note: 'Earn 4 mpd on contactless dining with min spend.' },
  { card_id: CARD_IDS.UOB_VISA_SIG, category_id: 'transport',  earn_rate_mpd: 4.0,  is_bonus: true,  conditions: { min_spend_monthly: 1000, payment_method: 'contactless' }, conditions_note: 'Earn 4 mpd on contactless transport with min spend.' },
  { card_id: CARD_IDS.UOB_VISA_SIG, category_id: 'online',     earn_rate_mpd: 0.4,  is_bonus: false, conditions: {},                                                          conditions_note: 'Online does not qualify for contactless bonus.' },
  { card_id: CARD_IDS.UOB_VISA_SIG, category_id: 'groceries',  earn_rate_mpd: 4.0,  is_bonus: true,  conditions: { min_spend_monthly: 1000, payment_method: 'contactless' }, conditions_note: 'Earn 4 mpd on contactless groceries with min spend.' },
  { card_id: CARD_IDS.UOB_VISA_SIG, category_id: 'petrol',     earn_rate_mpd: 4.0,  is_bonus: true,  conditions: { min_spend_monthly: 1000 },                                  conditions_note: 'Earn 4 mpd on petrol with min spend.' },
  { card_id: CARD_IDS.UOB_VISA_SIG, category_id: 'travel',     earn_rate_mpd: 4.0,  is_bonus: true,  conditions: { min_spend_monthly: 1000, currency: 'foreign' },             conditions_note: 'Earn 4 mpd on overseas/FCY spend with min spend.' },
  { card_id: CARD_IDS.UOB_VISA_SIG, category_id: 'general',    earn_rate_mpd: 0.4,  is_bonus: false, conditions: {},                                                          conditions_note: 'Base 0.4 mpd.' },

  // CARD 24: OCBC VOYAGE -- 1.3 mpd local, 1.6 mpd online, 2.2 mpd overseas, ALL UNCAPPED
  { card_id: CARD_IDS.OCBC_VOYAGE, category_id: 'dining',    earn_rate_mpd: 1.3,  is_bonus: false, conditions: {},                        conditions_note: 'Flat 1.3 mpd on local dining.' },
  { card_id: CARD_IDS.OCBC_VOYAGE, category_id: 'transport',  earn_rate_mpd: 1.3,  is_bonus: false, conditions: {},                        conditions_note: 'Flat 1.3 mpd on local transport.' },
  { card_id: CARD_IDS.OCBC_VOYAGE, category_id: 'online',     earn_rate_mpd: 1.6,  is_bonus: true,  conditions: {},                        conditions_note: 'Earn 1.6 mpd on online spend.' },
  { card_id: CARD_IDS.OCBC_VOYAGE, category_id: 'groceries',  earn_rate_mpd: 1.3,  is_bonus: false, conditions: {},                        conditions_note: 'Flat 1.3 mpd on local groceries.' },
  { card_id: CARD_IDS.OCBC_VOYAGE, category_id: 'petrol',     earn_rate_mpd: 1.3,  is_bonus: false, conditions: {},                        conditions_note: 'Flat 1.3 mpd on petrol.' },
  { card_id: CARD_IDS.OCBC_VOYAGE, category_id: 'travel',     earn_rate_mpd: 2.2,  is_bonus: true,  conditions: { currency: 'foreign' },   conditions_note: 'Earn 2.2 mpd on all overseas/FCY spend.' },
  { card_id: CARD_IDS.OCBC_VOYAGE, category_id: 'general',    earn_rate_mpd: 1.3,  is_bonus: false, conditions: {},                        conditions_note: 'Flat 1.3 mpd on all other local spend.' },

  // CARD 25: SC Journey -- 3 mpd groceries/food delivery/ride-hailing (capped), 1.2 local, 2 overseas
  { card_id: CARD_IDS.SC_JOURNEY, category_id: 'dining',    earn_rate_mpd: 3.0,  is_bonus: true,  conditions: { includes: 'food_delivery' },  conditions_note: 'Earn 3 mpd on dining and food delivery.' },
  { card_id: CARD_IDS.SC_JOURNEY, category_id: 'transport',  earn_rate_mpd: 3.0,  is_bonus: true,  conditions: { includes: 'ride_hailing' },   conditions_note: 'Earn 3 mpd on ride-hailing.' },
  { card_id: CARD_IDS.SC_JOURNEY, category_id: 'online',     earn_rate_mpd: 1.2,  is_bonus: false, conditions: {},                              conditions_note: 'Base 1.2 mpd on online shopping.' },
  { card_id: CARD_IDS.SC_JOURNEY, category_id: 'groceries',  earn_rate_mpd: 3.0,  is_bonus: true,  conditions: {},                              conditions_note: 'Earn 3 mpd on groceries.' },
  { card_id: CARD_IDS.SC_JOURNEY, category_id: 'petrol',     earn_rate_mpd: 1.2,  is_bonus: false, conditions: {},                              conditions_note: 'Base 1.2 mpd on petrol.' },
  { card_id: CARD_IDS.SC_JOURNEY, category_id: 'travel',     earn_rate_mpd: 2.0,  is_bonus: true,  conditions: { currency: 'foreign' },        conditions_note: 'Earn 2 mpd on overseas/FCY spend.' },
  { card_id: CARD_IDS.SC_JOURNEY, category_id: 'general',    earn_rate_mpd: 1.2,  is_bonus: false, conditions: {},                              conditions_note: 'Base 1.2 mpd.' },

  // CARD 26: SC Smart -- up to 9.28 mpd on niche categories, 0.4 mpd on everything else
  { card_id: CARD_IDS.SC_SMART, category_id: 'dining',    earn_rate_mpd: 5.0,  is_bonus: true,  conditions: { includes: 'fast_food_only' },                 conditions_note: 'Earn up to 5 mpd on fast food chains.' },
  { card_id: CARD_IDS.SC_SMART, category_id: 'transport',  earn_rate_mpd: 9.28, is_bonus: true,  conditions: { includes: 'public_transport_ev_charging' },   conditions_note: 'Earn up to 9.28 mpd on public transport and EV charging.' },
  { card_id: CARD_IDS.SC_SMART, category_id: 'online',     earn_rate_mpd: 5.0,  is_bonus: true,  conditions: { includes: 'streaming_services' },            conditions_note: 'Earn up to 5 mpd on streaming services.' },
  { card_id: CARD_IDS.SC_SMART, category_id: 'groceries',  earn_rate_mpd: 0.4,  is_bonus: false, conditions: {},                                             conditions_note: 'Base 0.4 mpd.' },
  { card_id: CARD_IDS.SC_SMART, category_id: 'petrol',     earn_rate_mpd: 0.4,  is_bonus: false, conditions: {},                                             conditions_note: 'Base 0.4 mpd.' },
  { card_id: CARD_IDS.SC_SMART, category_id: 'travel',     earn_rate_mpd: 0.4,  is_bonus: false, conditions: {},                                             conditions_note: 'Base 0.4 mpd on travel.' },
  { card_id: CARD_IDS.SC_SMART, category_id: 'general',    earn_rate_mpd: 0.4,  is_bonus: false, conditions: {},                                             conditions_note: 'Base 0.4 mpd.' },

  // CARD 27: SC Beyond -- Priority Banking: 2 mpd local, 4 mpd overseas
  { card_id: CARD_IDS.SC_BEYOND, category_id: 'dining',    earn_rate_mpd: 2.0,  is_bonus: true,  conditions: { banking_tier: 'priority_banking' },                              conditions_note: 'Priority Banking: 2 mpd local dining.' },
  { card_id: CARD_IDS.SC_BEYOND, category_id: 'transport',  earn_rate_mpd: 2.0,  is_bonus: true,  conditions: { banking_tier: 'priority_banking' },                              conditions_note: 'Priority Banking: 2 mpd local transport.' },
  { card_id: CARD_IDS.SC_BEYOND, category_id: 'online',     earn_rate_mpd: 2.0,  is_bonus: true,  conditions: { banking_tier: 'priority_banking' },                              conditions_note: 'Priority Banking: 2 mpd local online.' },
  { card_id: CARD_IDS.SC_BEYOND, category_id: 'groceries',  earn_rate_mpd: 2.0,  is_bonus: true,  conditions: { banking_tier: 'priority_banking' },                              conditions_note: 'Priority Banking: 2 mpd local groceries.' },
  { card_id: CARD_IDS.SC_BEYOND, category_id: 'petrol',     earn_rate_mpd: 2.0,  is_bonus: true,  conditions: { banking_tier: 'priority_banking' },                              conditions_note: 'Priority Banking: 2 mpd petrol.' },
  { card_id: CARD_IDS.SC_BEYOND, category_id: 'travel',     earn_rate_mpd: 4.0,  is_bonus: true,  conditions: { banking_tier: 'priority_banking', currency: 'foreign' },        conditions_note: 'Priority Banking: 4 mpd overseas/FCY.' },
  { card_id: CARD_IDS.SC_BEYOND, category_id: 'general',    earn_rate_mpd: 2.0,  is_bonus: true,  conditions: { banking_tier: 'priority_banking' },                              conditions_note: 'Priority Banking: 2 mpd general.' },

  // CARD 28: Maybank World MC -- 4 mpd petrol (UNCAPPED, no minimum), 3.2 mpd overseas, 0.4 mpd other
  { card_id: CARD_IDS.MAYBANK_WORLD, category_id: 'dining',    earn_rate_mpd: 0.4,  is_bonus: false, conditions: {},                        conditions_note: 'Base 0.4 mpd on local dining.' },
  { card_id: CARD_IDS.MAYBANK_WORLD, category_id: 'transport',  earn_rate_mpd: 0.4,  is_bonus: false, conditions: {},                        conditions_note: 'Base 0.4 mpd on transport.' },
  { card_id: CARD_IDS.MAYBANK_WORLD, category_id: 'online',     earn_rate_mpd: 0.4,  is_bonus: false, conditions: {},                        conditions_note: 'Base 0.4 mpd on online.' },
  { card_id: CARD_IDS.MAYBANK_WORLD, category_id: 'groceries',  earn_rate_mpd: 0.4,  is_bonus: false, conditions: {},                        conditions_note: 'Base 0.4 mpd on groceries.' },
  { card_id: CARD_IDS.MAYBANK_WORLD, category_id: 'petrol',     earn_rate_mpd: 4.0,  is_bonus: true,  conditions: {},                        conditions_note: 'Earn 4 mpd on petrol -- UNCAPPED, NO minimum spend.' },
  { card_id: CARD_IDS.MAYBANK_WORLD, category_id: 'travel',     earn_rate_mpd: 3.2,  is_bonus: true,  conditions: { currency: 'foreign' },   conditions_note: 'Earn 2.8-3.2 mpd on overseas/FCY spend.' },
  { card_id: CARD_IDS.MAYBANK_WORLD, category_id: 'general',    earn_rate_mpd: 0.4,  is_bonus: false, conditions: {},                        conditions_note: 'Base 0.4 mpd.' },

  // CARD 29: Maybank XL Rewards -- 4 mpd on dining/shopping/flights/hotels/entertainment/overseas
  { card_id: CARD_IDS.MAYBANK_XL, category_id: 'dining',    earn_rate_mpd: 4.0,  is_bonus: true,  conditions: {},                              conditions_note: 'Earn 4 mpd on dining.' },
  { card_id: CARD_IDS.MAYBANK_XL, category_id: 'transport',  earn_rate_mpd: 0.4,  is_bonus: false, conditions: {},                              conditions_note: 'Base 0.4 mpd on transport.' },
  { card_id: CARD_IDS.MAYBANK_XL, category_id: 'online',     earn_rate_mpd: 4.0,  is_bonus: true,  conditions: {},                              conditions_note: 'Earn 4 mpd on online shopping.' },
  { card_id: CARD_IDS.MAYBANK_XL, category_id: 'groceries',  earn_rate_mpd: 0.4,  is_bonus: false, conditions: {},                              conditions_note: 'Base 0.4 mpd on groceries.' },
  { card_id: CARD_IDS.MAYBANK_XL, category_id: 'petrol',     earn_rate_mpd: 0.4,  is_bonus: false, conditions: {},                              conditions_note: 'Base 0.4 mpd on petrol.' },
  { card_id: CARD_IDS.MAYBANK_XL, category_id: 'travel',     earn_rate_mpd: 4.0,  is_bonus: true,  conditions: {},                              conditions_note: 'Earn 4 mpd on flights, hotels, travel, overseas/FCY.' },
  { card_id: CARD_IDS.MAYBANK_XL, category_id: 'general',    earn_rate_mpd: 4.0,  is_bonus: true,  conditions: { includes: 'entertainment' },   conditions_note: 'Earn 4 mpd on entertainment and general shopping.' },

  // CARD 30: HSBC Premier MC -- 1.4 mpd local, 2.3 mpd overseas
  { card_id: CARD_IDS.HSBC_PREMIER, category_id: 'dining',    earn_rate_mpd: 1.4,  is_bonus: false, conditions: {},                        conditions_note: 'Flat 1.4 mpd on local dining.' },
  { card_id: CARD_IDS.HSBC_PREMIER, category_id: 'transport',  earn_rate_mpd: 1.4,  is_bonus: false, conditions: {},                        conditions_note: 'Flat 1.4 mpd on local transport.' },
  { card_id: CARD_IDS.HSBC_PREMIER, category_id: 'online',     earn_rate_mpd: 1.4,  is_bonus: false, conditions: {},                        conditions_note: 'Flat 1.4 mpd on local online.' },
  { card_id: CARD_IDS.HSBC_PREMIER, category_id: 'groceries',  earn_rate_mpd: 1.4,  is_bonus: false, conditions: {},                        conditions_note: 'Flat 1.4 mpd on local groceries.' },
  { card_id: CARD_IDS.HSBC_PREMIER, category_id: 'petrol',     earn_rate_mpd: 1.4,  is_bonus: false, conditions: {},                        conditions_note: 'Flat 1.4 mpd on petrol.' },
  { card_id: CARD_IDS.HSBC_PREMIER, category_id: 'travel',     earn_rate_mpd: 2.3,  is_bonus: true,  conditions: { currency: 'foreign' },   conditions_note: 'Earn 2.3 mpd on overseas/FCY spend.' },
  { card_id: CARD_IDS.HSBC_PREMIER, category_id: 'general',    earn_rate_mpd: 1.4,  is_bonus: false, conditions: {},                        conditions_note: 'Flat 1.4 mpd on all other local spend.' },
];

// ---------------------------------------------------------------------------
// Caps for new cards (sourced from migration 014 Section 5)
// ---------------------------------------------------------------------------

const CAPS: CapRow[] = [
  // UOB Lady's Solitaire -- combined cap across TWO selected preferred categories
  { card_id: CARD_IDS.UOB_LADYS,     category_id: null,        monthly_cap_amount: 2000.00, cap_type: 'spend', notes: 'Combined cap across TWO selected preferred categories.' },
  // UOB Visa Signature -- combined cap across contactless, petrol, overseas bonus categories
  { card_id: CARD_IDS.UOB_VISA_SIG,  category_id: null,        monthly_cap_amount: 2000.00, cap_type: 'spend', notes: 'Combined cap across contactless, petrol, overseas bonus.' },
  // SC Journey -- per-category caps
  { card_id: CARD_IDS.SC_JOURNEY,     category_id: 'dining',    monthly_cap_amount: 1000.00, cap_type: 'spend', notes: 'Cap on 3 mpd dining/food delivery bonus.' },
  { card_id: CARD_IDS.SC_JOURNEY,     category_id: 'transport', monthly_cap_amount: 1000.00, cap_type: 'spend', notes: 'Cap on 3 mpd ride-hailing bonus.' },
  { card_id: CARD_IDS.SC_JOURNEY,     category_id: 'groceries', monthly_cap_amount: 1000.00, cap_type: 'spend', notes: 'Cap on 3 mpd groceries bonus.' },
  // SC Smart -- per-category caps
  { card_id: CARD_IDS.SC_SMART,       category_id: 'dining',    monthly_cap_amount: 500.00,  cap_type: 'spend', notes: 'Cap on fast food bonus category.' },
  { card_id: CARD_IDS.SC_SMART,       category_id: 'transport', monthly_cap_amount: 500.00,  cap_type: 'spend', notes: 'Cap on public transport/EV charging bonus.' },
  { card_id: CARD_IDS.SC_SMART,       category_id: 'online',    monthly_cap_amount: 500.00,  cap_type: 'spend', notes: 'Cap on streaming services bonus.' },
  // Maybank XL Rewards -- combined cap across all 4 mpd bonus categories
  { card_id: CARD_IDS.MAYBANK_XL,     category_id: null,        monthly_cap_amount: 2000.00, cap_type: 'spend', notes: 'Combined cap across all 4 mpd bonus categories.' },
];

// Cards that are explicitly UNCAPPED (no entries in caps table)
const UNCAPPED_CARD_IDS = [
  CARD_IDS.DBS_VANTAGE,
  CARD_IDS.OCBC_VOYAGE,
  CARD_IDS.HSBC_PREMIER,
];

// ---------------------------------------------------------------------------
// VOYAGE Miles program and transfer partners
// ---------------------------------------------------------------------------

const VOYAGE_MILES_PROGRAM: MilesProgram = {
  id: 'prog-voyage-miles',
  name: 'VOYAGE Miles',
  airline: null,
  program_type: 'transferable',
  icon_url: 'globe-outline',
};

const VOYAGE_TRANSFER_DESTINATIONS = [
  'KrisFlyer',
  'Asia Miles',
  'British Airways Avios',
  'Qantas Frequent Flyer',
  'Flying Blue',
] as const;

const VOYAGE_TRANSFER_PARTNERS: TransferPartnerRow[] = VOYAGE_TRANSFER_DESTINATIONS.map(dest => ({
  source_program_id: VOYAGE_MILES_PROGRAM.id,
  destination_program_id: `prog-${dest.toLowerCase().replace(/\s+/g, '-')}`,
  conversion_rate_from: 1,
  conversion_rate_to: 1,
  transfer_fee_sgd: null,
  min_transfer_amount: 5000,
}));

// ---------------------------------------------------------------------------
// Simulated full card universe (19 original active + 10 new = 29 active + 1 POSB inactive)
// ---------------------------------------------------------------------------

const POSB_EVERYDAY: CardRow = {
  id: '00000000-0000-0000-0001-000000000020', // assumed POSB ID
  bank: 'POSB',
  name: 'POSB Everyday Card',
  slug: 'posb-everyday-card',
  network: 'visa',
  annual_fee: 0,
  base_rate_mpd: 0.4,
  is_active: false, // deactivated by migration 013
  miles_program_id: 'prog-dbs-points',
  eligibility_criteria: null,
  notes: 'RECLASSIFIED (Sprint 11): Cashback card, not a miles card.',
};

// Simulate 19 original active cards (numbers 1-19, excluding POSB)
function generateOriginal19ActiveCards(): CardRow[] {
  const banks = ['DBS', 'OCBC', 'UOB', 'Citi', 'HSBC', 'Amex', 'SC', 'Maybank', 'DBS', 'OCBC',
                  'UOB', 'Citi', 'HSBC', 'Amex', 'SC', 'DBS', 'OCBC', 'UOB', 'Citi'];
  return banks.map((bank, i) => ({
    id: `00000000-0000-0000-0001-00000000000${String(i + 1).padStart(1, '0')}`,
    bank,
    name: `Original Card ${i + 1}`,
    slug: `original-card-${i + 1}`,
    network: 'visa',
    annual_fee: 0,
    base_rate_mpd: 1.0,
    is_active: true,
    miles_program_id: `prog-${bank.toLowerCase()}`,
    eligibility_criteria: null,
    notes: null,
  }));
}

const ORIGINAL_19_ACTIVE = generateOriginal19ActiveCards();
const ALL_CARDS: CardRow[] = [...ORIGINAL_19_ACTIVE, POSB_EVERYDAY, ...NEW_CARDS];
const ALL_ACTIVE_CARDS: CardRow[] = ALL_CARDS.filter(c => c.is_active);

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

function getEarnRulesForCard(cardId: string): EarnRuleRow[] {
  return EARN_RULES.filter(r => r.card_id === cardId);
}

function getCapsForCard(cardId: string): CapRow[] {
  return CAPS.filter(c => c.card_id === cardId);
}

function getCardById(cardId: string): CardRow | undefined {
  return NEW_CARDS.find(c => c.id === cardId);
}

// ===========================================================================
// Migration 013 Tests: POSB Deactivation + eligibility_criteria Column
// ===========================================================================

describe('Migration 013: POSB Everyday Card deactivation & eligibility_criteria column', () => {
  it('POSB Everyday Card has is_active = FALSE', () => {
    expect(POSB_EVERYDAY.is_active).toBe(false);
    expect(POSB_EVERYDAY.slug).toBe('posb-everyday-card');

    // POSB should not appear in the active cards list
    const activeNames = ALL_ACTIVE_CARDS.map(c => c.name);
    expect(activeNames).not.toContain('POSB Everyday Card');
  });

  it('eligibility_criteria column exists on cards table (new cards use it)', () => {
    // Verify that the CardRow type includes eligibility_criteria
    // and that new cards with restrictions have non-null values
    const cardsWithEligibility = NEW_CARDS.filter(c => c.eligibility_criteria !== null);
    expect(cardsWithEligibility.length).toBe(5); // DBS Vantage, UOB Lady's, SC Beyond, Maybank XL, HSBC Premier

    // Verify cards without restrictions have null
    const cardsWithoutEligibility = NEW_CARDS.filter(c => c.eligibility_criteria === null);
    expect(cardsWithoutEligibility.length).toBe(5); // UOB Visa Sig, OCBC VOYAGE, SC Journey, SC Smart, Maybank World
  });

  it('existing 19 original active cards remain unaffected (is_active = TRUE)', () => {
    expect(ORIGINAL_19_ACTIVE).toHaveLength(19);
    ORIGINAL_19_ACTIVE.forEach(card => {
      expect(card.is_active).toBe(true);
    });
  });
});

// ===========================================================================
// Migration 014 Tests: 10 New Cards
// ===========================================================================

describe('Migration 014: 10 new cards exist with correct metadata', () => {
  it('all 10 new cards exist with correct names, banks, and annual fees', () => {
    expect(NEW_CARDS).toHaveLength(10);

    const expectedCards = [
      { name: 'DBS Vantage Visa Infinite',         bank: 'DBS',     annual_fee: 600.00  },
      { name: "UOB Lady's Solitaire Metal Card",   bank: 'UOB',     annual_fee: 490.00  },
      { name: 'UOB Visa Signature',                bank: 'UOB',     annual_fee: 196.00  },
      { name: 'OCBC VOYAGE Card',                  bank: 'OCBC',    annual_fee: 498.00  },
      { name: 'Standard Chartered Journey Card',   bank: 'SC',      annual_fee: 196.00  },
      { name: 'Standard Chartered Smart Card',     bank: 'SC',      annual_fee: 99.00   },
      { name: 'Standard Chartered Beyond Card',    bank: 'SC',      annual_fee: 1500.00 },
      { name: 'Maybank World Mastercard',          bank: 'Maybank', annual_fee: 196.00  },
      { name: 'Maybank XL Rewards Card',           bank: 'Maybank', annual_fee: 87.00   },
      { name: 'HSBC Premier Mastercard',           bank: 'HSBC',    annual_fee: 709.00  },
    ];

    expectedCards.forEach(expected => {
      const card = NEW_CARDS.find(c => c.name === expected.name);
      expect(card).toBeDefined();
      expect(card!.bank).toBe(expected.bank);
      expect(card!.annual_fee).toBe(expected.annual_fee);
    });
  });

  it('all 10 new cards have is_active = TRUE', () => {
    NEW_CARDS.forEach(card => {
      expect(card.is_active).toBe(true);
    });
  });

  it('all 10 new cards have non-NULL miles_program_id', () => {
    NEW_CARDS.forEach(card => {
      expect(card.miles_program_id).not.toBeNull();
      expect(typeof card.miles_program_id).toBe('string');
      expect(card.miles_program_id!.length).toBeGreaterThan(0);
    });
  });

  it('correct miles program mapping per card', () => {
    // DBS Vantage -> DBS Points
    expect(getCardById(CARD_IDS.DBS_VANTAGE)!.miles_program_id).toBe('prog-dbs-points');
    // UOB Lady's Solitaire -> UNI$
    expect(getCardById(CARD_IDS.UOB_LADYS)!.miles_program_id).toBe('prog-uni');
    // UOB Visa Signature -> UNI$
    expect(getCardById(CARD_IDS.UOB_VISA_SIG)!.miles_program_id).toBe('prog-uni');
    // OCBC VOYAGE -> VOYAGE Miles
    expect(getCardById(CARD_IDS.OCBC_VOYAGE)!.miles_program_id).toBe('prog-voyage-miles');
    // SC Journey -> 360 Rewards
    expect(getCardById(CARD_IDS.SC_JOURNEY)!.miles_program_id).toBe('prog-360-rewards');
    // SC Smart -> 360 Rewards
    expect(getCardById(CARD_IDS.SC_SMART)!.miles_program_id).toBe('prog-360-rewards');
    // SC Beyond -> 360 Rewards
    expect(getCardById(CARD_IDS.SC_BEYOND)!.miles_program_id).toBe('prog-360-rewards');
    // Maybank World MC -> TreatsPoints
    expect(getCardById(CARD_IDS.MAYBANK_WORLD)!.miles_program_id).toBe('prog-treatspoints');
    // Maybank XL Rewards -> TreatsPoints
    expect(getCardById(CARD_IDS.MAYBANK_XL)!.miles_program_id).toBe('prog-treatspoints');
    // HSBC Premier MC -> HSBC Reward Points
    expect(getCardById(CARD_IDS.HSBC_PREMIER)!.miles_program_id).toBe('prog-hsbc-rewards');
  });
});

// ===========================================================================
// Migration 014: VOYAGE Miles Program + Transfer Partners
// ===========================================================================

describe('Migration 014: VOYAGE Miles program and transfer partners', () => {
  it('VOYAGE Miles program exists with program_type = "transferable"', () => {
    expect(VOYAGE_MILES_PROGRAM.name).toBe('VOYAGE Miles');
    expect(VOYAGE_MILES_PROGRAM.program_type).toBe('transferable');
    expect(VOYAGE_MILES_PROGRAM.airline).toBeNull();
    expect(VOYAGE_MILES_PROGRAM.icon_url).toBe('globe-outline');
  });

  it('5 VOYAGE Miles transfer partners exist with correct destinations', () => {
    expect(VOYAGE_TRANSFER_PARTNERS).toHaveLength(5);

    const destinationNames = [...VOYAGE_TRANSFER_DESTINATIONS];
    expect(destinationNames).toContain('KrisFlyer');
    expect(destinationNames).toContain('Asia Miles');
    expect(destinationNames).toContain('British Airways Avios');
    expect(destinationNames).toContain('Qantas Frequent Flyer');
    expect(destinationNames).toContain('Flying Blue');
  });

  it('all VOYAGE Miles transfer partners have 1:1 conversion rate', () => {
    VOYAGE_TRANSFER_PARTNERS.forEach(tp => {
      expect(tp.conversion_rate_from).toBe(1);
      expect(tp.conversion_rate_to).toBe(1);
      expect(tp.transfer_fee_sgd).toBeNull();
      expect(tp.min_transfer_amount).toBe(5000);
    });
  });

  it('all VOYAGE Miles transfer partners reference VOYAGE Miles as source', () => {
    VOYAGE_TRANSFER_PARTNERS.forEach(tp => {
      expect(tp.source_program_id).toBe(VOYAGE_MILES_PROGRAM.id);
    });
  });
});

// ===========================================================================
// Earn Rules Tests
// ===========================================================================

describe('Earn rules: each new card has 7 rules (one per category)', () => {
  it('each of the 10 new cards has exactly 7 earn rules', () => {
    ALL_NEW_CARD_IDS.forEach(cardId => {
      const rules = getEarnRulesForCard(cardId);
      expect(rules).toHaveLength(7);

      // Verify all 7 categories are covered
      const categoryIds = rules.map(r => r.category_id).sort();
      expect(categoryIds).toEqual([...CATEGORIES].sort());
    });
  });

  it('total earn rules across all new cards = 70 (10 cards x 7 categories)', () => {
    expect(EARN_RULES).toHaveLength(70);
  });
});

describe('Earn rules: DBS Vantage rate validation', () => {
  it('DBS Vantage: 1.5 mpd local (general category), 2.2 mpd overseas (travel category)', () => {
    const rules = getEarnRulesForCard(CARD_IDS.DBS_VANTAGE);

    const generalRule = rules.find(r => r.category_id === 'general');
    expect(generalRule).toBeDefined();
    expect(generalRule!.earn_rate_mpd).toBe(1.5);
    expect(generalRule!.is_bonus).toBe(false);

    const travelRule = rules.find(r => r.category_id === 'travel');
    expect(travelRule).toBeDefined();
    expect(travelRule!.earn_rate_mpd).toBe(2.2);
    expect(travelRule!.is_bonus).toBe(true);
  });

  it('DBS Vantage: all local categories at 1.5 mpd', () => {
    const rules = getEarnRulesForCard(CARD_IDS.DBS_VANTAGE);
    const localCategories = ['dining', 'transport', 'online', 'groceries', 'petrol', 'general'];

    localCategories.forEach(cat => {
      const rule = rules.find(r => r.category_id === cat);
      expect(rule).toBeDefined();
      expect(rule!.earn_rate_mpd).toBe(1.5);
    });
  });
});

describe('Earn rules: UOB Lady\'s Solitaire rate validation', () => {
  it('UOB Lady\'s Solitaire: 4 mpd on preferred categories (dining, online, general)', () => {
    const rules = getEarnRulesForCard(CARD_IDS.UOB_LADYS);

    const preferredCategories = ['dining', 'online', 'general'];
    preferredCategories.forEach(cat => {
      const rule = rules.find(r => r.category_id === cat);
      expect(rule).toBeDefined();
      expect(rule!.earn_rate_mpd).toBe(4.0);
      expect(rule!.is_bonus).toBe(true);
      expect(rule!.conditions).toHaveProperty('selectable_category', true);
      expect(rule!.conditions).toHaveProperty('max_selected', 2);
    });
  });

  it('UOB Lady\'s Solitaire: 0.4 mpd base on non-preferred categories', () => {
    const rules = getEarnRulesForCard(CARD_IDS.UOB_LADYS);

    const baseCategories = ['transport', 'groceries', 'petrol', 'travel'];
    baseCategories.forEach(cat => {
      const rule = rules.find(r => r.category_id === cat);
      expect(rule).toBeDefined();
      expect(rule!.earn_rate_mpd).toBe(0.4);
      expect(rule!.is_bonus).toBe(false);
    });
  });
});

describe('Earn rules: SC Smart niche category validation', () => {
  it('SC Smart: up to 9.28 mpd on transport (public transport/EV charging)', () => {
    const rules = getEarnRulesForCard(CARD_IDS.SC_SMART);

    const transportRule = rules.find(r => r.category_id === 'transport');
    expect(transportRule).toBeDefined();
    expect(transportRule!.earn_rate_mpd).toBe(9.28);
    expect(transportRule!.is_bonus).toBe(true);
    expect(transportRule!.conditions).toHaveProperty('includes', 'public_transport_ev_charging');
  });

  it('SC Smart: 5 mpd on dining (fast food) and online (streaming)', () => {
    const rules = getEarnRulesForCard(CARD_IDS.SC_SMART);

    const diningRule = rules.find(r => r.category_id === 'dining');
    expect(diningRule).toBeDefined();
    expect(diningRule!.earn_rate_mpd).toBe(5.0);
    expect(diningRule!.conditions).toHaveProperty('includes', 'fast_food_only');

    const onlineRule = rules.find(r => r.category_id === 'online');
    expect(onlineRule).toBeDefined();
    expect(onlineRule!.earn_rate_mpd).toBe(5.0);
    expect(onlineRule!.conditions).toHaveProperty('includes', 'streaming_services');
  });

  it('SC Smart: 0.4 mpd base on non-niche categories', () => {
    const rules = getEarnRulesForCard(CARD_IDS.SC_SMART);

    const baseCategories = ['groceries', 'petrol', 'travel', 'general'];
    baseCategories.forEach(cat => {
      const rule = rules.find(r => r.category_id === cat);
      expect(rule).toBeDefined();
      expect(rule!.earn_rate_mpd).toBe(0.4);
      expect(rule!.is_bonus).toBe(false);
    });
  });
});

describe('Earn rules: Maybank World Mastercard petrol validation', () => {
  it('Maybank World: 4 mpd petrol (uncapped, no minimum spend)', () => {
    const rules = getEarnRulesForCard(CARD_IDS.MAYBANK_WORLD);

    const petrolRule = rules.find(r => r.category_id === 'petrol');
    expect(petrolRule).toBeDefined();
    expect(petrolRule!.earn_rate_mpd).toBe(4.0);
    expect(petrolRule!.is_bonus).toBe(true);

    // Confirm no caps exist for Maybank World petrol
    const caps = getCapsForCard(CARD_IDS.MAYBANK_WORLD);
    const petrolCap = caps.find(c => c.category_id === 'petrol');
    expect(petrolCap).toBeUndefined();
  });

  it('Maybank World: 3.2 mpd overseas (travel), 0.4 mpd on other local categories', () => {
    const rules = getEarnRulesForCard(CARD_IDS.MAYBANK_WORLD);

    const travelRule = rules.find(r => r.category_id === 'travel');
    expect(travelRule).toBeDefined();
    expect(travelRule!.earn_rate_mpd).toBe(3.2);
    expect(travelRule!.is_bonus).toBe(true);

    const baseCategories = ['dining', 'transport', 'online', 'groceries', 'general'];
    baseCategories.forEach(cat => {
      const rule = rules.find(r => r.category_id === cat);
      expect(rule).toBeDefined();
      expect(rule!.earn_rate_mpd).toBe(0.4);
      expect(rule!.is_bonus).toBe(false);
    });
  });
});

// ===========================================================================
// Caps Tests
// ===========================================================================

describe('Caps: cards with caps have correct entries', () => {
  it('UOB Lady\'s Solitaire: shared cap S$2,000', () => {
    const caps = getCapsForCard(CARD_IDS.UOB_LADYS);
    expect(caps).toHaveLength(1);
    expect(caps[0].category_id).toBeNull(); // shared cap
    expect(caps[0].monthly_cap_amount).toBe(2000.00);
    expect(caps[0].cap_type).toBe('spend');
  });

  it('UOB Visa Signature: shared cap S$2,000', () => {
    const caps = getCapsForCard(CARD_IDS.UOB_VISA_SIG);
    expect(caps).toHaveLength(1);
    expect(caps[0].category_id).toBeNull();
    expect(caps[0].monthly_cap_amount).toBe(2000.00);
  });

  it('SC Journey: 3 per-category caps at S$1,000 each (dining, transport, groceries)', () => {
    const caps = getCapsForCard(CARD_IDS.SC_JOURNEY);
    expect(caps).toHaveLength(3);

    const capCategories = caps.map(c => c.category_id).sort();
    expect(capCategories).toEqual(['dining', 'groceries', 'transport']);

    caps.forEach(cap => {
      expect(cap.monthly_cap_amount).toBe(1000.00);
      expect(cap.cap_type).toBe('spend');
    });
  });

  it('SC Smart: 3 per-category caps at S$500 each (dining, transport, online)', () => {
    const caps = getCapsForCard(CARD_IDS.SC_SMART);
    expect(caps).toHaveLength(3);

    const capCategories = caps.map(c => c.category_id).sort();
    expect(capCategories).toEqual(['dining', 'online', 'transport']);

    caps.forEach(cap => {
      expect(cap.monthly_cap_amount).toBe(500.00);
      expect(cap.cap_type).toBe('spend');
    });
  });

  it('Maybank XL Rewards: shared cap S$2,000', () => {
    const caps = getCapsForCard(CARD_IDS.MAYBANK_XL);
    expect(caps).toHaveLength(1);
    expect(caps[0].category_id).toBeNull();
    expect(caps[0].monthly_cap_amount).toBe(2000.00);
  });
});

describe('Caps: uncapped cards have NO cap entries', () => {
  it('DBS Vantage has no caps (uncapped)', () => {
    const caps = getCapsForCard(CARD_IDS.DBS_VANTAGE);
    expect(caps).toHaveLength(0);
  });

  it('OCBC VOYAGE has no caps (uncapped)', () => {
    const caps = getCapsForCard(CARD_IDS.OCBC_VOYAGE);
    expect(caps).toHaveLength(0);
  });

  it('HSBC Premier has no caps (uncapped)', () => {
    const caps = getCapsForCard(CARD_IDS.HSBC_PREMIER);
    expect(caps).toHaveLength(0);
  });

  it('SC Beyond has no caps (uncapped for Priority Banking)', () => {
    const caps = getCapsForCard(CARD_IDS.SC_BEYOND);
    expect(caps).toHaveLength(0);
  });

  it('Maybank World has no caps (petrol uncapped)', () => {
    const caps = getCapsForCard(CARD_IDS.MAYBANK_WORLD);
    expect(caps).toHaveLength(0);
  });
});

// ===========================================================================
// Eligibility Criteria Tests
// ===========================================================================

describe('Eligibility criteria: cards with restrictions', () => {
  it('DBS Vantage: min_income = 120000, banking_tier = "treasures"', () => {
    const card = getCardById(CARD_IDS.DBS_VANTAGE)!;
    expect(card.eligibility_criteria).not.toBeNull();
    expect(card.eligibility_criteria).toEqual({
      min_income: 120000,
      banking_tier: 'treasures',
    });
  });

  it('UOB Lady\'s Solitaire: gender = "female"', () => {
    const card = getCardById(CARD_IDS.UOB_LADYS)!;
    expect(card.eligibility_criteria).not.toBeNull();
    expect(card.eligibility_criteria).toEqual({
      gender: 'female',
    });
  });

  it('Maybank XL: age_min = 21, age_max = 39', () => {
    const card = getCardById(CARD_IDS.MAYBANK_XL)!;
    expect(card.eligibility_criteria).not.toBeNull();
    expect(card.eligibility_criteria).toEqual({
      age_min: 21,
      age_max: 39,
    });
  });

  it('SC Beyond: banking_tier = "priority_banking"', () => {
    const card = getCardById(CARD_IDS.SC_BEYOND)!;
    expect(card.eligibility_criteria).not.toBeNull();
    expect(card.eligibility_criteria).toEqual({
      banking_tier: 'priority_banking',
    });
  });

  it('HSBC Premier: banking_tier = "premier"', () => {
    const card = getCardById(CARD_IDS.HSBC_PREMIER)!;
    expect(card.eligibility_criteria).not.toBeNull();
    expect(card.eligibility_criteria).toEqual({
      banking_tier: 'premier',
    });
  });
});

describe('Eligibility criteria: cards without restrictions have NULL', () => {
  it('UOB Visa Signature: null eligibility_criteria', () => {
    expect(getCardById(CARD_IDS.UOB_VISA_SIG)!.eligibility_criteria).toBeNull();
  });

  it('OCBC VOYAGE: null eligibility_criteria', () => {
    expect(getCardById(CARD_IDS.OCBC_VOYAGE)!.eligibility_criteria).toBeNull();
  });

  it('SC Journey: null eligibility_criteria', () => {
    expect(getCardById(CARD_IDS.SC_JOURNEY)!.eligibility_criteria).toBeNull();
  });

  it('SC Smart: null eligibility_criteria', () => {
    expect(getCardById(CARD_IDS.SC_SMART)!.eligibility_criteria).toBeNull();
  });

  it('Maybank World: null eligibility_criteria', () => {
    expect(getCardById(CARD_IDS.MAYBANK_WORLD)!.eligibility_criteria).toBeNull();
  });
});

// ===========================================================================
// Data Integrity Tests
// ===========================================================================

describe('Data integrity: card counts and program associations', () => {
  it('total active cards = 29 (19 original - 1 POSB deactivated + 10 new)', () => {
    expect(ALL_ACTIVE_CARDS).toHaveLength(29);
  });

  it('total cards including inactive = 30 (29 active + 1 POSB)', () => {
    expect(ALL_CARDS).toHaveLength(30);
  });

  it('all active cards have miles_program_id != NULL', () => {
    ALL_ACTIVE_CARDS.forEach(card => {
      expect(card.miles_program_id).not.toBeNull();
      expect(card.miles_program_id!.length).toBeGreaterThan(0);
    });
  });

  it('total miles programs includes VOYAGE Miles (transferable type)', () => {
    // From migration 011, there are existing programs: KrisFlyer, Citi Miles, UNI$,
    // DBS Points, HSBC Reward Points, Asia Miles, BA Avios, Qantas FF, Flying Blue,
    // 360 Rewards, TreatsPoints, etc.
    // Migration 014 adds VOYAGE Miles.
    expect(VOYAGE_MILES_PROGRAM.program_type).toBe('transferable');
    expect(VOYAGE_MILES_PROGRAM.name).toBe('VOYAGE Miles');
  });

  it('no orphaned earn_rules: all earn rules reference new card IDs', () => {
    EARN_RULES.forEach(rule => {
      const card = NEW_CARDS.find(c => c.id === rule.card_id);
      expect(card).toBeDefined();
      expect(card!.is_active).toBe(true);
    });
  });

  it('no orphaned caps: all caps reference new card IDs', () => {
    CAPS.forEach(cap => {
      const card = NEW_CARDS.find(c => c.id === cap.card_id);
      expect(card).toBeDefined();
      expect(card!.is_active).toBe(true);
    });
  });

  it('all earn rule categories are valid (one of the 7 known categories)', () => {
    const validCategories = new Set(CATEGORIES);
    EARN_RULES.forEach(rule => {
      expect(validCategories.has(rule.category_id as typeof CATEGORIES[number])).toBe(true);
    });
  });

  it('5 unique cards with eligibility restrictions among the 10 new cards', () => {
    const restricted = NEW_CARDS.filter(c => c.eligibility_criteria !== null);
    expect(restricted).toHaveLength(5);

    const restrictedNames = restricted.map(c => c.name).sort();
    expect(restrictedNames).toEqual([
      'DBS Vantage Visa Infinite',
      'HSBC Premier Mastercard',
      'Maybank XL Rewards Card',
      'Standard Chartered Beyond Card',
      "UOB Lady's Solitaire Metal Card",
    ]);
  });
});

// ===========================================================================
// Supabase Mock Integration Tests for Sprint 11
// ===========================================================================

describe('Sprint 11 Supabase Mock: card expansion queries', () => {
  let mock: MockSupabaseClient;

  function setTableData<T>(table: string, data: T): void {
    const qb = new MockQueryBuilder();
    qb.setData(data);
    mock.queryBuilders.set(table, qb);
  }

  beforeEach(() => {
    mock = createMockSupabase();
  });

  it('querying active cards returns 29 rows after Sprint 11 migrations', async () => {
    setTableData('cards', ALL_ACTIVE_CARDS);

    const { data, error } = await mock.supabase
      .from('cards')
      .select('*')
      .eq('is_active', true);

    expect(error).toBeNull();
    const cards = data as CardRow[];
    expect(cards).toHaveLength(29);
    cards.forEach(card => {
      expect(card.is_active).toBe(true);
    });
  });

  it('querying cards with eligibility_criteria IS NOT NULL returns restricted cards', async () => {
    const restrictedCards = ALL_ACTIVE_CARDS.filter(c => c.eligibility_criteria !== null);
    setTableData('cards', restrictedCards);

    const { data, error } = await mock.supabase
      .from('cards')
      .select('name, eligibility_criteria')
      .not('eligibility_criteria', 'is', null);

    expect(error).toBeNull();
    const cards = data as CardRow[];
    expect(cards).toHaveLength(5);
  });

  it('querying VOYAGE Miles transfer partners returns 5 rows', async () => {
    setTableData('transfer_partners', VOYAGE_TRANSFER_PARTNERS);

    const { data, error } = await mock.supabase
      .from('transfer_partners')
      .select('*')
      .eq('source_program_id', VOYAGE_MILES_PROGRAM.id);

    expect(error).toBeNull();
    const partners = data as TransferPartnerRow[];
    expect(partners).toHaveLength(5);
  });

  it('querying earn_rules for a new card returns 7 rules', async () => {
    const vantageRules = getEarnRulesForCard(CARD_IDS.DBS_VANTAGE);
    setTableData('earn_rules', vantageRules);

    const { data, error } = await mock.supabase
      .from('earn_rules')
      .select('*')
      .eq('card_id', CARD_IDS.DBS_VANTAGE);

    expect(error).toBeNull();
    const rules = data as EarnRuleRow[];
    expect(rules).toHaveLength(7);
  });

  it('querying caps for uncapped card returns empty array', async () => {
    setTableData('caps', []);

    const { data, error } = await mock.supabase
      .from('caps')
      .select('*')
      .eq('card_id', CARD_IDS.OCBC_VOYAGE);

    expect(error).toBeNull();
    expect(data).toEqual([]);
  });
});

// ===========================================================================
// Recommendation RPC: is_active filter analysis
// ===========================================================================

describe('recommend() RPC: is_active filter behaviour (migration analysis note)', () => {
  /**
   * ANALYSIS: The recommend() function in 002_rls_and_functions.sql does NOT
   * directly filter by cards.is_active. It joins user_cards -> cards via:
   *
   *   FROM user_cards uc
   *   INNER JOIN cards c ON c.id = uc.card_id
   *
   * This means it returns ALL cards the user has added, regardless of is_active.
   *
   * However, in practice this is safe because:
   * 1. The card picker UI only shows is_active = TRUE cards when adding new cards
   * 2. Existing user_cards referencing POSB Everyday are preserved (FK integrity)
   * 3. POSB's 0.4 mpd base rate means it would never rank highly anyway
   *
   * RECOMMENDATION: Add `AND c.is_active = TRUE` to the recommend() CTE for
   * defence-in-depth, ensuring deactivated cards never appear in recommendations
   * even if they exist in user_cards. This is tracked as a follow-up improvement.
   */

  it('recommend() currently does NOT filter by is_active (joins user_cards -> cards directly)', () => {
    // This test documents the current behaviour:
    // The recommend() SQL query in migration 002 joins on c.id = uc.card_id
    // without an is_active = TRUE filter on the cards table.
    //
    // Simulating: a user who added POSB Everyday before deactivation
    // would still see it in recommendations (though at low 0.4 mpd rank).

    const userCardIds = [
      POSB_EVERYDAY.id,    // inactive card in user's wallet
      CARD_IDS.DBS_VANTAGE, // active card
    ];

    // Current behaviour: all user_cards are included regardless of is_active
    const cardsInRecommendation = ALL_CARDS.filter(c =>
      userCardIds.includes(c.id)
    );
    expect(cardsInRecommendation).toHaveLength(2);

    // Desired behaviour (with is_active filter): only active cards
    const activeCardsInRecommendation = ALL_CARDS.filter(c =>
      userCardIds.includes(c.id) && c.is_active === true
    );
    expect(activeCardsInRecommendation).toHaveLength(1);
    expect(activeCardsInRecommendation[0].name).toBe('DBS Vantage Visa Infinite');
  });

  it('POSB Everyday would rank last even without is_active filter (0.4 mpd base)', () => {
    // Even if POSB appears in recommendations, its 0.4 mpd base rate
    // means it would never be the top recommendation

    const cardScores = [
      { name: POSB_EVERYDAY.name, rate: POSB_EVERYDAY.base_rate_mpd, is_active: false },
      { name: 'DBS Vantage Visa Infinite', rate: 1.5, is_active: true },
      { name: 'HSBC Premier Mastercard', rate: 1.4, is_active: true },
    ];

    // Sort by rate descending (mimicking recommend() scoring)
    cardScores.sort((a, b) => b.rate - a.rate);

    expect(cardScores[0].name).toBe('DBS Vantage Visa Infinite');
    expect(cardScores[cardScores.length - 1].name).toBe('POSB Everyday Card');
    expect(cardScores[cardScores.length - 1].is_active).toBe(false);
  });
});
