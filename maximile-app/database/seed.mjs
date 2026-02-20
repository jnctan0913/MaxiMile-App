#!/usr/bin/env node
// =============================================================================
// MaxiMile — Database Seed Script
// =============================================================================
// Seeds all 20 cards + earn rules + caps + exclusions into Supabase.
// Uses the service_role key to bypass RLS.
//
// Usage:
//   1. Set SUPABASE_SERVICE_ROLE_KEY in .env
//   2. Run: node database/seed.mjs
// =============================================================================

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env manually (no dotenv dependency needed)
const envPath = resolve(__dirname, '..', '.env');
const envContent = readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      env[trimmed.slice(0, eqIdx)] = trimmed.slice(eqIdx + 1);
    }
  }
});

const supabaseUrl = env.EXPO_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey || serviceRoleKey === 'YOUR_SERVICE_ROLE_KEY_HERE') {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY in .env');
  console.error('   Get it from: Supabase Dashboard → Settings → API → service_role key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// =============================================================================
// DATA: Categories
// =============================================================================
const categories = [
  { id: 'dining',    name: 'Dining',          display_order: 1, icon: 'utensils',      mccs: ['5811','5812','5813','5814'], description: 'Restaurants, cafes, bars, fast food, food delivery apps' },
  { id: 'transport', name: 'Transport',        display_order: 2, icon: 'car',           mccs: ['4121','4131','4111','4112','4789','7512','7523'], description: 'Taxis, ride-hailing, public transport, car rentals, parking' },
  { id: 'online',    name: 'Online Shopping',   display_order: 3, icon: 'globe',         mccs: ['5262','5310','5311','5399','5944','5945','5946','5947','5964','5965','5966','5967','5968','5969','7372','5818','5816','5817'], description: 'E-commerce, online subscriptions, digital goods' },
  { id: 'groceries', name: 'Groceries',         display_order: 4, icon: 'shopping-cart',  mccs: ['5411','5422','5441','5451','5462','5499'], description: 'Supermarkets, bakeries, specialty food stores' },
  { id: 'petrol',    name: 'Petrol',            display_order: 5, icon: 'fuel',           mccs: ['5541','5542','5983'], description: 'Petrol stations, fuel dispensers' },
  { id: 'travel',    name: 'Travel',            display_order: 6, icon: 'plane',          mccs: [...Array.from({length: 300}, (_, i) => String(3000 + i)), '3501','3502','3503','3504','3505','7011','4411','4511','4722','7991'], description: 'Flights, hotels, cruises, travel agencies' },
  { id: 'general',   name: 'General',           display_order: 7, icon: 'circle',         mccs: [], description: 'All other spending' },
];

// =============================================================================
// DATA: All 20 Cards
// =============================================================================
const cards = [
  // Batch 1 (1-10)
  { id: '00000000-0000-0000-0001-000000000001', bank: 'DBS',     name: 'DBS Altitude Visa Signature',       slug: 'dbs-altitude-visa',        network: 'visa',       annual_fee: 192.60,  base_rate_mpd: 1.2, is_active: true, notes: 'Base 1.2 mpd local, 2 mpd overseas. 10X on online travel booking. [VERIFIED]' },
  { id: '00000000-0000-0000-0001-000000000002', bank: 'Citi',    name: 'Citi PremierMiles Visa Signature',  slug: 'citi-premiermiles-visa',   network: 'visa',       annual_fee: 192.60,  base_rate_mpd: 1.2, is_active: true, notes: 'No miles expiry. 1.2 mpd local, 2 mpd overseas. [VERIFIED]' },
  { id: '00000000-0000-0000-0001-000000000003', bank: 'UOB',     name: 'UOB PRVI Miles Visa',               slug: 'uob-prvi-miles-visa',      network: 'visa',       annual_fee: 256.80,  base_rate_mpd: 1.4, is_active: true, notes: '1.4 mpd local, 2.4 mpd overseas. [VERIFIED]' },
  { id: '00000000-0000-0000-0001-000000000004', bank: 'OCBC',    name: 'OCBC 90°N Visa',                    slug: 'ocbc-90n-visa',            network: 'visa',       annual_fee: 192.60,  base_rate_mpd: 1.2, is_active: true, notes: '1.2 mpd local, 2.1 mpd overseas. Auto-transfer to KrisFlyer/Asia Miles. [VERIFIED]' },
  { id: '00000000-0000-0000-0001-000000000005', bank: 'UOB',     name: 'KrisFlyer UOB Credit Card',         slug: 'krisflyer-uob',            network: 'visa',       annual_fee: 194.40,  base_rate_mpd: 1.2, is_active: true, notes: 'Direct KrisFlyer miles. Up to 3 mpd on selected spend. [VERIFIED]' },
  { id: '00000000-0000-0000-0001-000000000006', bank: 'HSBC',    name: 'HSBC Revolution Credit Card',       slug: 'hsbc-revolution',          network: 'visa',       annual_fee: 0,       base_rate_mpd: 0.4, is_active: true, notes: 'No annual fee. 4 mpd on dining/online. Cap $1000/month. [VERIFIED]' },
  { id: '00000000-0000-0000-0001-000000000007', bank: 'Amex',    name: 'American Express KrisFlyer Ascend',  slug: 'amex-krisflyer-ascend',    network: 'amex',       annual_fee: 337.05,  base_rate_mpd: 1.1, is_active: true, notes: 'Direct KrisFlyer miles. 2 mpd dining/travel, 3 mpd SIA. Cap $2500/month. [VERIFIED]' },
  { id: '00000000-0000-0000-0001-000000000008', bank: 'BOC',     name: 'BOC Elite Miles World Mastercard',   slug: 'boc-elite-miles-world-mc', network: 'mastercard', annual_fee: 0,       base_rate_mpd: 1.5, is_active: true, notes: 'Flat 1.5 mpd all local spend. Cap $2000/month. [ESTIMATED]' },
  { id: '00000000-0000-0000-0001-000000000009', bank: 'SC',      name: 'Standard Chartered Visa Infinite',   slug: 'sc-visa-infinite',         network: 'visa',       annual_fee: 588.50,  base_rate_mpd: 1.4, is_active: true, notes: 'Premium card. 1.4 mpd local, 3 mpd overseas. Income req $150K. [VERIFIED]' },
  { id: '00000000-0000-0000-0001-000000000010', bank: 'DBS',     name: "DBS Woman's World Card",             slug: 'dbs-womans-world-card',    network: 'mastercard', annual_fee: 0,       base_rate_mpd: 0.4, is_active: true, notes: 'No annual fee. 4 mpd online. Cap $2000/month. [VERIFIED]' },

  // Batch 2 (11-20)
  { id: '00000000-0000-0000-0002-000000000011', bank: 'UOB',     name: "UOB Lady's Card",                    slug: 'uob-ladys-card',           network: 'visa',       annual_fee: 0,       base_rate_mpd: 0.4, is_active: true, notes: 'No annual fee. 10X UNI$ on beauty/fashion (4 mpd). Cap $1000/month. [VERIFIED]' },
  { id: '00000000-0000-0000-0002-000000000012', bank: 'OCBC',    name: 'OCBC Titanium Rewards Card',         slug: 'ocbc-titanium-rewards',    network: 'visa',       annual_fee: 0,       base_rate_mpd: 0.4, is_active: true, notes: 'No annual fee 2yrs. 10X OCBC$ on dining/online (4 mpd). Cap $1000/month. [VERIFIED]' },
  { id: '00000000-0000-0000-0002-000000000013', bank: 'HSBC',    name: 'HSBC TravelOne Credit Card',         slug: 'hsbc-travelone',           network: 'visa',       annual_fee: 192.60,  base_rate_mpd: 1.0, is_active: true, notes: 'Flat 1 mpd local, 2.7 mpd overseas. [VERIFIED]' },
  { id: '00000000-0000-0000-0002-000000000014', bank: 'Amex',    name: 'American Express KrisFlyer Credit Card', slug: 'amex-krisflyer-credit-card', network: 'amex', annual_fee: 176.55,  base_rate_mpd: 1.1, is_active: true, notes: 'Entry-level KrisFlyer Amex. 1.1 mpd base, 1.5 mpd dining, 2 mpd SIA. [VERIFIED]' },
  { id: '00000000-0000-0000-0002-000000000015', bank: 'SC',      name: 'Standard Chartered X Credit Card',   slug: 'sc-x-card',                network: 'visa',       annual_fee: 0,       base_rate_mpd: 0.4, is_active: true, notes: 'No annual fee. Up to 3.3 mpd on selected categories. Min spend $500/month. [ESTIMATED]' },
  { id: '00000000-0000-0000-0002-000000000016', bank: 'Maybank', name: 'Maybank Horizon Visa Signature',     slug: 'maybank-horizon-visa',     network: 'visa',       annual_fee: 0,       base_rate_mpd: 0.4, is_active: true, notes: '0.4 mpd base. Up to 1.6 mpd on selected categories. [ESTIMATED]' },
  { id: '00000000-0000-0000-0002-000000000017', bank: 'Maybank', name: 'Maybank FC Barcelona Visa Signature', slug: 'maybank-fc-barcelona',    network: 'visa',       annual_fee: 0,       base_rate_mpd: 0.4, is_active: true, notes: 'Same structure as Horizon. No annual fee. [ESTIMATED]' },
  { id: '00000000-0000-0000-0002-000000000018', bank: 'Citi',    name: 'Citi Rewards Card',                  slug: 'citi-rewards',             network: 'visa',       annual_fee: 0,       base_rate_mpd: 0.4, is_active: true, notes: 'No annual fee. 10X on shopping/online (4 mpd). Cap $1000/month. [VERIFIED]' },
  { id: '00000000-0000-0000-0002-000000000019', bank: 'DBS/POSB', name: 'POSB Everyday Card',                slug: 'posb-everyday-card',       network: 'visa',       annual_fee: 0,       base_rate_mpd: 0.4, is_active: true, notes: 'No annual fee. 0.4 mpd flat. Primarily cashback card. [ESTIMATED]' },
  { id: '00000000-0000-0000-0002-000000000020', bank: 'UOB',     name: 'UOB Preferred Platinum Visa',        slug: 'uob-preferred-platinum',   network: 'visa',       annual_fee: 0,       base_rate_mpd: 0.4, is_active: true, notes: 'No annual fee. 10X UNI$ on dining (4 mpd). Min spend $600/month. Cap $1000/month. [VERIFIED]' },
];

// =============================================================================
// DATA: Earn Rules (7 categories × 20 cards = 140 rows)
// =============================================================================
const earnRules = [
  // Card 1: DBS Altitude Visa (1.2 mpd flat, 4 mpd travel portal)
  { card_id: '00000000-0000-0000-0001-000000000001', category_id: 'dining',    earn_rate_mpd: 1.2, is_bonus: false, conditions: {}, conditions_note: null, source_url: 'https://www.dbs.com.sg/personal/cards/credit-cards/altitude-visa-signature-card' },
  { card_id: '00000000-0000-0000-0001-000000000001', category_id: 'transport', earn_rate_mpd: 1.2, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },
  { card_id: '00000000-0000-0000-0001-000000000001', category_id: 'online',    earn_rate_mpd: 1.2, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },
  { card_id: '00000000-0000-0000-0001-000000000001', category_id: 'groceries', earn_rate_mpd: 1.2, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },
  { card_id: '00000000-0000-0000-0001-000000000001', category_id: 'petrol',    earn_rate_mpd: 1.2, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },
  { card_id: '00000000-0000-0000-0001-000000000001', category_id: 'travel',    earn_rate_mpd: 4.0, is_bonus: true,  conditions: { online_travel_portal: true }, conditions_note: 'Up to 10X DBS Points (4 mpd) for online travel bookings.', source_url: 'https://www.dbs.com.sg/personal/cards/credit-cards/altitude-visa-signature-card' },
  { card_id: '00000000-0000-0000-0001-000000000001', category_id: 'general',   earn_rate_mpd: 1.2, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },

  // Card 2: Citi PremierMiles (1.2 mpd flat)
  { card_id: '00000000-0000-0000-0001-000000000002', category_id: 'dining',    earn_rate_mpd: 1.2, is_bonus: false, conditions: {}, conditions_note: null, source_url: 'https://www.citibank.com.sg/credit-cards/premiermiles-visa-signature/' },
  { card_id: '00000000-0000-0000-0001-000000000002', category_id: 'transport', earn_rate_mpd: 1.2, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },
  { card_id: '00000000-0000-0000-0001-000000000002', category_id: 'online',    earn_rate_mpd: 1.2, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },
  { card_id: '00000000-0000-0000-0001-000000000002', category_id: 'groceries', earn_rate_mpd: 1.2, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },
  { card_id: '00000000-0000-0000-0001-000000000002', category_id: 'petrol',    earn_rate_mpd: 1.2, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },
  { card_id: '00000000-0000-0000-0001-000000000002', category_id: 'travel',    earn_rate_mpd: 1.2, is_bonus: false, conditions: {}, conditions_note: 'Overseas travel spend earns 2 mpd.', source_url: null },
  { card_id: '00000000-0000-0000-0001-000000000002', category_id: 'general',   earn_rate_mpd: 1.2, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },

  // Card 3: UOB PRVI Miles (1.4 mpd flat)
  { card_id: '00000000-0000-0000-0001-000000000003', category_id: 'dining',    earn_rate_mpd: 1.4, is_bonus: false, conditions: {}, conditions_note: null, source_url: 'https://www.uob.com.sg/personal/cards/credit/prvi-miles-visa.page' },
  { card_id: '00000000-0000-0000-0001-000000000003', category_id: 'transport', earn_rate_mpd: 1.4, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },
  { card_id: '00000000-0000-0000-0001-000000000003', category_id: 'online',    earn_rate_mpd: 1.4, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },
  { card_id: '00000000-0000-0000-0001-000000000003', category_id: 'groceries', earn_rate_mpd: 1.4, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },
  { card_id: '00000000-0000-0000-0001-000000000003', category_id: 'petrol',    earn_rate_mpd: 1.4, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },
  { card_id: '00000000-0000-0000-0001-000000000003', category_id: 'travel',    earn_rate_mpd: 1.4, is_bonus: false, conditions: {}, conditions_note: 'Overseas travel spend earns 2.4 mpd.', source_url: null },
  { card_id: '00000000-0000-0000-0001-000000000003', category_id: 'general',   earn_rate_mpd: 1.4, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },

  // Card 4: OCBC 90N (1.2 mpd flat)
  { card_id: '00000000-0000-0000-0001-000000000004', category_id: 'dining',    earn_rate_mpd: 1.2, is_bonus: false, conditions: {}, conditions_note: null, source_url: 'https://www.ocbc.com/personal-banking/cards/90n-card' },
  { card_id: '00000000-0000-0000-0001-000000000004', category_id: 'transport', earn_rate_mpd: 1.2, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },
  { card_id: '00000000-0000-0000-0001-000000000004', category_id: 'online',    earn_rate_mpd: 1.2, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },
  { card_id: '00000000-0000-0000-0001-000000000004', category_id: 'groceries', earn_rate_mpd: 1.2, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },
  { card_id: '00000000-0000-0000-0001-000000000004', category_id: 'petrol',    earn_rate_mpd: 1.2, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },
  { card_id: '00000000-0000-0000-0001-000000000004', category_id: 'travel',    earn_rate_mpd: 1.2, is_bonus: false, conditions: {}, conditions_note: 'Overseas travel spend earns 2.1 mpd.', source_url: null },
  { card_id: '00000000-0000-0000-0001-000000000004', category_id: 'general',   earn_rate_mpd: 1.2, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },

  // Card 5: KrisFlyer UOB (bonus on dining/transport/online/travel)
  { card_id: '00000000-0000-0000-0001-000000000005', category_id: 'dining',    earn_rate_mpd: 2.0, is_bonus: true,  conditions: { contactless: true }, conditions_note: 'Earn 2 mpd on contactless dining.', source_url: 'https://www.uob.com.sg/personal/cards/credit/krisflyer-uob-credit-card.page' },
  { card_id: '00000000-0000-0000-0001-000000000005', category_id: 'transport', earn_rate_mpd: 2.0, is_bonus: true,  conditions: { contactless: true }, conditions_note: 'Earn 2 mpd on contactless transport.', source_url: null },
  { card_id: '00000000-0000-0000-0001-000000000005', category_id: 'online',    earn_rate_mpd: 2.0, is_bonus: true,  conditions: {}, conditions_note: 'Earn 2 mpd on online spend.', source_url: null },
  { card_id: '00000000-0000-0000-0001-000000000005', category_id: 'groceries', earn_rate_mpd: 1.2, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },
  { card_id: '00000000-0000-0000-0001-000000000005', category_id: 'petrol',    earn_rate_mpd: 1.2, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },
  { card_id: '00000000-0000-0000-0001-000000000005', category_id: 'travel',    earn_rate_mpd: 3.0, is_bonus: true,  conditions: { merchant: 'SIA' }, conditions_note: 'Earn 3 mpd on SIA purchases.', source_url: null },
  { card_id: '00000000-0000-0000-0001-000000000005', category_id: 'general',   earn_rate_mpd: 1.2, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },

  // Card 6: HSBC Revolution (4 mpd dining/online, 0.4 else)
  { card_id: '00000000-0000-0000-0001-000000000006', category_id: 'dining',    earn_rate_mpd: 4.0, is_bonus: true,  conditions: {}, conditions_note: 'Earn 4 mpd on dining (10X). Capped at $1,000/month.', source_url: 'https://www.hsbc.com.sg/credit-cards/products/revolution/' },
  { card_id: '00000000-0000-0000-0001-000000000006', category_id: 'transport', earn_rate_mpd: 0.4, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },
  { card_id: '00000000-0000-0000-0001-000000000006', category_id: 'online',    earn_rate_mpd: 4.0, is_bonus: true,  conditions: {}, conditions_note: 'Earn 4 mpd on online spend (10X). Capped at $1,000/month.', source_url: null },
  { card_id: '00000000-0000-0000-0001-000000000006', category_id: 'groceries', earn_rate_mpd: 0.4, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },
  { card_id: '00000000-0000-0000-0001-000000000006', category_id: 'petrol',    earn_rate_mpd: 0.4, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },
  { card_id: '00000000-0000-0000-0001-000000000006', category_id: 'travel',    earn_rate_mpd: 0.4, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },
  { card_id: '00000000-0000-0000-0001-000000000006', category_id: 'general',   earn_rate_mpd: 0.4, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },

  // Card 7: Amex KrisFlyer Ascend (2 mpd dining/groceries/travel, 1.1 else)
  { card_id: '00000000-0000-0000-0001-000000000007', category_id: 'dining',    earn_rate_mpd: 2.0, is_bonus: true,  conditions: {}, conditions_note: 'Earn 2 KrisFlyer miles per $1 on dining. Capped at $2,500/month.', source_url: 'https://www.americanexpress.com/sg/credit-cards/krisflyer-ascend-card/' },
  { card_id: '00000000-0000-0000-0001-000000000007', category_id: 'transport', earn_rate_mpd: 1.1, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },
  { card_id: '00000000-0000-0000-0001-000000000007', category_id: 'online',    earn_rate_mpd: 1.1, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },
  { card_id: '00000000-0000-0000-0001-000000000007', category_id: 'groceries', earn_rate_mpd: 2.0, is_bonus: true,  conditions: {}, conditions_note: 'Earn 2 KrisFlyer miles per $1 at supermarkets. Capped at $2,500/month.', source_url: null },
  { card_id: '00000000-0000-0000-0001-000000000007', category_id: 'petrol',    earn_rate_mpd: 1.1, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },
  { card_id: '00000000-0000-0000-0001-000000000007', category_id: 'travel',    earn_rate_mpd: 2.0, is_bonus: true,  conditions: {}, conditions_note: 'Earn 2 mpd on travel. 3 mpd on SIA. Capped at $2,500/month.', source_url: null },
  { card_id: '00000000-0000-0000-0001-000000000007', category_id: 'general',   earn_rate_mpd: 1.1, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },

  // Card 8: BOC Elite Miles (flat 1.5 mpd)
  { card_id: '00000000-0000-0000-0001-000000000008', category_id: 'dining',    earn_rate_mpd: 1.5, is_bonus: false, conditions: {}, conditions_note: null, source_url: 'https://www.bankofchina.com/sg/pbservice/pb1/201803/t20180329_11814364.html' },
  { card_id: '00000000-0000-0000-0001-000000000008', category_id: 'transport', earn_rate_mpd: 1.5, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },
  { card_id: '00000000-0000-0000-0001-000000000008', category_id: 'online',    earn_rate_mpd: 1.5, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },
  { card_id: '00000000-0000-0000-0001-000000000008', category_id: 'groceries', earn_rate_mpd: 1.5, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },
  { card_id: '00000000-0000-0000-0001-000000000008', category_id: 'petrol',    earn_rate_mpd: 1.5, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },
  { card_id: '00000000-0000-0000-0001-000000000008', category_id: 'travel',    earn_rate_mpd: 1.5, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },
  { card_id: '00000000-0000-0000-0001-000000000008', category_id: 'general',   earn_rate_mpd: 1.5, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },

  // Card 9: SC Visa Infinite (flat 1.4 mpd)
  { card_id: '00000000-0000-0000-0001-000000000009', category_id: 'dining',    earn_rate_mpd: 1.4, is_bonus: false, conditions: {}, conditions_note: null, source_url: 'https://www.sc.com/sg/credit-cards/visa-infinite/' },
  { card_id: '00000000-0000-0000-0001-000000000009', category_id: 'transport', earn_rate_mpd: 1.4, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },
  { card_id: '00000000-0000-0000-0001-000000000009', category_id: 'online',    earn_rate_mpd: 1.4, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },
  { card_id: '00000000-0000-0000-0001-000000000009', category_id: 'groceries', earn_rate_mpd: 1.4, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },
  { card_id: '00000000-0000-0000-0001-000000000009', category_id: 'petrol',    earn_rate_mpd: 1.4, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },
  { card_id: '00000000-0000-0000-0001-000000000009', category_id: 'travel',    earn_rate_mpd: 1.4, is_bonus: false, conditions: {}, conditions_note: 'Overseas travel spend earns 3 mpd.', source_url: null },
  { card_id: '00000000-0000-0000-0001-000000000009', category_id: 'general',   earn_rate_mpd: 1.4, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },

  // Card 10: DBS Woman's World (4 mpd online, 0.4 else)
  { card_id: '00000000-0000-0000-0001-000000000010', category_id: 'dining',    earn_rate_mpd: 0.4, is_bonus: false, conditions: {}, conditions_note: null, source_url: 'https://www.dbs.com.sg/personal/cards/credit-cards/womans-card' },
  { card_id: '00000000-0000-0000-0001-000000000010', category_id: 'transport', earn_rate_mpd: 0.4, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },
  { card_id: '00000000-0000-0000-0001-000000000010', category_id: 'online',    earn_rate_mpd: 4.0, is_bonus: true,  conditions: {}, conditions_note: 'Earn 4 mpd (10X DBS Points) on online spend. Capped at $2,000/month.', source_url: null },
  { card_id: '00000000-0000-0000-0001-000000000010', category_id: 'groceries', earn_rate_mpd: 0.4, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },
  { card_id: '00000000-0000-0000-0001-000000000010', category_id: 'petrol',    earn_rate_mpd: 0.4, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },
  { card_id: '00000000-0000-0000-0001-000000000010', category_id: 'travel',    earn_rate_mpd: 0.4, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },
  { card_id: '00000000-0000-0000-0001-000000000010', category_id: 'general',   earn_rate_mpd: 0.4, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },

  // Card 11: UOB Lady's Card (4 mpd online fashion/general fashion, 0.4 else)
  { card_id: '00000000-0000-0000-0002-000000000011', category_id: 'dining',    earn_rate_mpd: 0.4, is_bonus: false, conditions: {}, conditions_note: null, source_url: 'https://www.uob.com.sg/personal/cards/credit/ladys-card.page' },
  { card_id: '00000000-0000-0000-0002-000000000011', category_id: 'transport', earn_rate_mpd: 0.4, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },
  { card_id: '00000000-0000-0000-0002-000000000011', category_id: 'online',    earn_rate_mpd: 4.0, is_bonus: true,  conditions: { category_restriction: 'fashion_beauty_bags_shoes' }, conditions_note: 'Earn 4 mpd (10X UNI$) on online fashion, beauty, bags and shoes.', source_url: null },
  { card_id: '00000000-0000-0000-0002-000000000011', category_id: 'groceries', earn_rate_mpd: 0.4, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },
  { card_id: '00000000-0000-0000-0002-000000000011', category_id: 'petrol',    earn_rate_mpd: 0.4, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },
  { card_id: '00000000-0000-0000-0002-000000000011', category_id: 'travel',    earn_rate_mpd: 0.4, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },
  { card_id: '00000000-0000-0000-0002-000000000011', category_id: 'general',   earn_rate_mpd: 4.0, is_bonus: true,  conditions: { category_restriction: 'fashion_beauty_bags_shoes' }, conditions_note: 'Earn 4 mpd (10X UNI$) on in-store fashion, beauty, bags and shoes.', source_url: null },

  // Card 12: OCBC Titanium Rewards (4 mpd dining/online, 0.4 else)
  { card_id: '00000000-0000-0000-0002-000000000012', category_id: 'dining',    earn_rate_mpd: 4.0, is_bonus: true,  conditions: {}, conditions_note: 'Earn 4 mpd (10X OCBC$) on dining. Capped at $1,000/month.', source_url: 'https://www.ocbc.com/personal-banking/cards/titanium-rewards-card' },
  { card_id: '00000000-0000-0000-0002-000000000012', category_id: 'transport', earn_rate_mpd: 0.4, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },
  { card_id: '00000000-0000-0000-0002-000000000012', category_id: 'online',    earn_rate_mpd: 4.0, is_bonus: true,  conditions: {}, conditions_note: 'Earn 4 mpd (10X OCBC$) on online shopping. Capped at $1,000/month.', source_url: null },
  { card_id: '00000000-0000-0000-0002-000000000012', category_id: 'groceries', earn_rate_mpd: 0.4, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },
  { card_id: '00000000-0000-0000-0002-000000000012', category_id: 'petrol',    earn_rate_mpd: 0.4, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },
  { card_id: '00000000-0000-0000-0002-000000000012', category_id: 'travel',    earn_rate_mpd: 0.4, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },
  { card_id: '00000000-0000-0000-0002-000000000012', category_id: 'general',   earn_rate_mpd: 0.4, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },

  // Card 13: HSBC TravelOne (flat 1.0 mpd)
  { card_id: '00000000-0000-0000-0002-000000000013', category_id: 'dining',    earn_rate_mpd: 1.0, is_bonus: false, conditions: {}, conditions_note: null, source_url: 'https://www.hsbc.com.sg/credit-cards/products/travelone/' },
  { card_id: '00000000-0000-0000-0002-000000000013', category_id: 'transport', earn_rate_mpd: 1.0, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },
  { card_id: '00000000-0000-0000-0002-000000000013', category_id: 'online',    earn_rate_mpd: 1.0, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },
  { card_id: '00000000-0000-0000-0002-000000000013', category_id: 'groceries', earn_rate_mpd: 1.0, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },
  { card_id: '00000000-0000-0000-0002-000000000013', category_id: 'petrol',    earn_rate_mpd: 1.0, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },
  { card_id: '00000000-0000-0000-0002-000000000013', category_id: 'travel',    earn_rate_mpd: 1.0, is_bonus: false, conditions: {}, conditions_note: 'Overseas travel earns 2.7 mpd.', source_url: null },
  { card_id: '00000000-0000-0000-0002-000000000013', category_id: 'general',   earn_rate_mpd: 1.0, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },

  // Card 14: Amex KrisFlyer Credit Card (1.5 mpd dining, 2 mpd SIA, 1.1 else)
  { card_id: '00000000-0000-0000-0002-000000000014', category_id: 'dining',    earn_rate_mpd: 1.5, is_bonus: true,  conditions: {}, conditions_note: 'Earn 1.5 KrisFlyer miles per $1 on dining.', source_url: 'https://www.americanexpress.com/sg/credit-cards/krisflyer-credit-card/' },
  { card_id: '00000000-0000-0000-0002-000000000014', category_id: 'transport', earn_rate_mpd: 1.1, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },
  { card_id: '00000000-0000-0000-0002-000000000014', category_id: 'online',    earn_rate_mpd: 1.1, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },
  { card_id: '00000000-0000-0000-0002-000000000014', category_id: 'groceries', earn_rate_mpd: 1.1, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },
  { card_id: '00000000-0000-0000-0002-000000000014', category_id: 'petrol',    earn_rate_mpd: 1.1, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },
  { card_id: '00000000-0000-0000-0002-000000000014', category_id: 'travel',    earn_rate_mpd: 2.0, is_bonus: true,  conditions: { merchant: 'SIA' }, conditions_note: 'Earn 2 mpd on SIA purchases.', source_url: null },
  { card_id: '00000000-0000-0000-0002-000000000014', category_id: 'general',   earn_rate_mpd: 1.1, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },

  // Card 15: SC X Card (3.3 mpd on selected, 0.4 else)
  { card_id: '00000000-0000-0000-0002-000000000015', category_id: 'dining',    earn_rate_mpd: 3.3, is_bonus: true,  conditions: { min_spend_monthly: 500 }, conditions_note: 'Earn 3.3 mpd with min spend $500/month. Capped at $2,000/month.', source_url: 'https://www.sc.com/sg/credit-cards/x-card/' },
  { card_id: '00000000-0000-0000-0002-000000000015', category_id: 'transport', earn_rate_mpd: 3.3, is_bonus: true,  conditions: { min_spend_monthly: 500 }, conditions_note: 'Earn 3.3 mpd with min spend $500/month.', source_url: null },
  { card_id: '00000000-0000-0000-0002-000000000015', category_id: 'online',    earn_rate_mpd: 3.3, is_bonus: true,  conditions: { min_spend_monthly: 500 }, conditions_note: 'Earn 3.3 mpd with min spend $500/month.', source_url: null },
  { card_id: '00000000-0000-0000-0002-000000000015', category_id: 'groceries', earn_rate_mpd: 3.3, is_bonus: true,  conditions: { min_spend_monthly: 500 }, conditions_note: 'Earn 3.3 mpd with min spend $500/month.', source_url: null },
  { card_id: '00000000-0000-0000-0002-000000000015', category_id: 'petrol',    earn_rate_mpd: 3.3, is_bonus: true,  conditions: { min_spend_monthly: 500 }, conditions_note: 'Earn 3.3 mpd with min spend $500/month.', source_url: null },
  { card_id: '00000000-0000-0000-0002-000000000015', category_id: 'travel',    earn_rate_mpd: 0.4, is_bonus: false, conditions: {}, conditions_note: 'Travel does not earn bonus rate.', source_url: null },
  { card_id: '00000000-0000-0000-0002-000000000015', category_id: 'general',   earn_rate_mpd: 0.4, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },

  // Card 16: Maybank Horizon (1.6 mpd dining/petrol/travel, 0.4 else)
  { card_id: '00000000-0000-0000-0002-000000000016', category_id: 'dining',    earn_rate_mpd: 1.6, is_bonus: true,  conditions: { min_spend_monthly: 300 }, conditions_note: 'Earn up to 1.6 mpd with min spend $300/month.', source_url: 'https://www.maybank.com.sg/cards/credit-cards/horizon-visa-signature/' },
  { card_id: '00000000-0000-0000-0002-000000000016', category_id: 'transport', earn_rate_mpd: 0.4, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },
  { card_id: '00000000-0000-0000-0002-000000000016', category_id: 'online',    earn_rate_mpd: 0.4, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },
  { card_id: '00000000-0000-0000-0002-000000000016', category_id: 'groceries', earn_rate_mpd: 0.4, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },
  { card_id: '00000000-0000-0000-0002-000000000016', category_id: 'petrol',    earn_rate_mpd: 1.6, is_bonus: true,  conditions: { min_spend_monthly: 300 }, conditions_note: 'Earn up to 1.6 mpd with min spend $300/month.', source_url: null },
  { card_id: '00000000-0000-0000-0002-000000000016', category_id: 'travel',    earn_rate_mpd: 1.6, is_bonus: true,  conditions: { min_spend_monthly: 300 }, conditions_note: 'Earn up to 1.6 mpd local. Overseas up to 3.2 mpd.', source_url: null },
  { card_id: '00000000-0000-0000-0002-000000000016', category_id: 'general',   earn_rate_mpd: 0.4, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },

  // Card 17: Maybank FC Barcelona (same as Horizon)
  { card_id: '00000000-0000-0000-0002-000000000017', category_id: 'dining',    earn_rate_mpd: 1.6, is_bonus: true,  conditions: { min_spend_monthly: 300 }, conditions_note: 'Same structure as Horizon. 1.6 mpd with min spend $300/month.', source_url: 'https://www.maybank.com.sg/cards/credit-cards/fc-barcelona-visa-signature/' },
  { card_id: '00000000-0000-0000-0002-000000000017', category_id: 'transport', earn_rate_mpd: 0.4, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },
  { card_id: '00000000-0000-0000-0002-000000000017', category_id: 'online',    earn_rate_mpd: 0.4, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },
  { card_id: '00000000-0000-0000-0002-000000000017', category_id: 'groceries', earn_rate_mpd: 0.4, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },
  { card_id: '00000000-0000-0000-0002-000000000017', category_id: 'petrol',    earn_rate_mpd: 1.6, is_bonus: true,  conditions: { min_spend_monthly: 300 }, conditions_note: 'Earn up to 1.6 mpd with min spend $300/month.', source_url: null },
  { card_id: '00000000-0000-0000-0002-000000000017', category_id: 'travel',    earn_rate_mpd: 1.6, is_bonus: true,  conditions: { min_spend_monthly: 300 }, conditions_note: 'Earn up to 1.6 mpd. Overseas up to 3.2 mpd.', source_url: null },
  { card_id: '00000000-0000-0000-0002-000000000017', category_id: 'general',   earn_rate_mpd: 0.4, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },

  // Card 18: Citi Rewards (4 mpd online/general shopping, 0.4 else)
  { card_id: '00000000-0000-0000-0002-000000000018', category_id: 'dining',    earn_rate_mpd: 0.4, is_bonus: false, conditions: {}, conditions_note: null, source_url: 'https://www.citibank.com.sg/credit-cards/citi-rewards-card/' },
  { card_id: '00000000-0000-0000-0002-000000000018', category_id: 'transport', earn_rate_mpd: 0.4, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },
  { card_id: '00000000-0000-0000-0002-000000000018', category_id: 'online',    earn_rate_mpd: 4.0, is_bonus: true,  conditions: {}, conditions_note: 'Earn 4 mpd (10X) on online shopping. Capped at $1,000/month.', source_url: null },
  { card_id: '00000000-0000-0000-0002-000000000018', category_id: 'groceries', earn_rate_mpd: 0.4, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },
  { card_id: '00000000-0000-0000-0002-000000000018', category_id: 'petrol',    earn_rate_mpd: 0.4, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },
  { card_id: '00000000-0000-0000-0002-000000000018', category_id: 'travel',    earn_rate_mpd: 0.4, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },
  { card_id: '00000000-0000-0000-0002-000000000018', category_id: 'general',   earn_rate_mpd: 4.0, is_bonus: true,  conditions: {}, conditions_note: 'Earn 4 mpd (10X) on in-store shopping. Capped at $1,000/month.', source_url: null },

  // Card 19: POSB Everyday (flat 0.4 mpd)
  { card_id: '00000000-0000-0000-0002-000000000019', category_id: 'dining',    earn_rate_mpd: 0.4, is_bonus: false, conditions: {}, conditions_note: null, source_url: 'https://www.posb.com.sg/personal/cards/credit-cards/everyday-card' },
  { card_id: '00000000-0000-0000-0002-000000000019', category_id: 'transport', earn_rate_mpd: 0.4, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },
  { card_id: '00000000-0000-0000-0002-000000000019', category_id: 'online',    earn_rate_mpd: 0.4, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },
  { card_id: '00000000-0000-0000-0002-000000000019', category_id: 'groceries', earn_rate_mpd: 0.4, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },
  { card_id: '00000000-0000-0000-0002-000000000019', category_id: 'petrol',    earn_rate_mpd: 0.4, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },
  { card_id: '00000000-0000-0000-0002-000000000019', category_id: 'travel',    earn_rate_mpd: 0.4, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },
  { card_id: '00000000-0000-0000-0002-000000000019', category_id: 'general',   earn_rate_mpd: 0.4, is_bonus: false, conditions: {}, conditions_note: 'Primarily cashback-focused; miles conversion is secondary.', source_url: null },

  // Card 20: UOB Preferred Platinum (4 mpd dining, 0.4 else)
  { card_id: '00000000-0000-0000-0002-000000000020', category_id: 'dining',    earn_rate_mpd: 4.0, is_bonus: true,  conditions: { min_spend_monthly: 600 }, conditions_note: 'Earn 4 mpd (10X UNI$) on dining with min spend $600/month. Capped at $1,000/month.', source_url: 'https://www.uob.com.sg/personal/cards/credit/preferred-platinum.page' },
  { card_id: '00000000-0000-0000-0002-000000000020', category_id: 'transport', earn_rate_mpd: 0.4, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },
  { card_id: '00000000-0000-0000-0002-000000000020', category_id: 'online',    earn_rate_mpd: 0.4, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },
  { card_id: '00000000-0000-0000-0002-000000000020', category_id: 'groceries', earn_rate_mpd: 0.4, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },
  { card_id: '00000000-0000-0000-0002-000000000020', category_id: 'petrol',    earn_rate_mpd: 0.4, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },
  { card_id: '00000000-0000-0000-0002-000000000020', category_id: 'travel',    earn_rate_mpd: 0.4, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },
  { card_id: '00000000-0000-0000-0002-000000000020', category_id: 'general',   earn_rate_mpd: 0.4, is_bonus: false, conditions: {}, conditions_note: null, source_url: null },
];

// =============================================================================
// DATA: Monthly Caps
// =============================================================================
const caps = [
  // Batch 1
  { card_id: '00000000-0000-0000-0001-000000000005', category_id: null, monthly_cap_amount: 1000, cap_type: 'spend', notes: 'Combined cap across bonus categories. [ESTIMATED]' },
  { card_id: '00000000-0000-0000-0001-000000000006', category_id: null, monthly_cap_amount: 1000, cap_type: 'spend', notes: 'Combined cap across dining/online/entertainment. [VERIFIED]' },
  { card_id: '00000000-0000-0000-0001-000000000007', category_id: 'dining',    monthly_cap_amount: 2500, cap_type: 'spend', notes: 'Per-category cap. [VERIFIED]' },
  { card_id: '00000000-0000-0000-0001-000000000007', category_id: 'groceries', monthly_cap_amount: 2500, cap_type: 'spend', notes: 'Per-category cap. [VERIFIED]' },
  { card_id: '00000000-0000-0000-0001-000000000007', category_id: 'travel',    monthly_cap_amount: 2500, cap_type: 'spend', notes: 'Per-category cap. [VERIFIED]' },
  { card_id: '00000000-0000-0000-0001-000000000008', category_id: null, monthly_cap_amount: 2000, cap_type: 'spend', notes: 'Combined cap across all categories. [ESTIMATED]' },
  { card_id: '00000000-0000-0000-0001-000000000010', category_id: 'online', monthly_cap_amount: 2000, cap_type: 'spend', notes: 'Cap on 10X online bonus. [VERIFIED]' },
  // Batch 2
  { card_id: '00000000-0000-0000-0002-000000000011', category_id: null, monthly_cap_amount: 1000, cap_type: 'spend', notes: 'Combined cap across beauty/fashion. [VERIFIED]' },
  { card_id: '00000000-0000-0000-0002-000000000012', category_id: null, monthly_cap_amount: 1000, cap_type: 'spend', notes: 'Combined cap across dining/online. [VERIFIED]' },
  { card_id: '00000000-0000-0000-0002-000000000014', category_id: 'dining', monthly_cap_amount: 2000, cap_type: 'spend', notes: 'Cap on dining bonus. [ESTIMATED]' },
  { card_id: '00000000-0000-0000-0002-000000000014', category_id: 'travel', monthly_cap_amount: 2000, cap_type: 'spend', notes: 'Cap on travel/SIA bonus. [ESTIMATED]' },
  { card_id: '00000000-0000-0000-0002-000000000015', category_id: null, monthly_cap_amount: 2000, cap_type: 'spend', notes: 'Combined cap across all bonus categories. [ESTIMATED]' },
  { card_id: '00000000-0000-0000-0002-000000000016', category_id: null, monthly_cap_amount: 1500, cap_type: 'spend', notes: 'Combined cap across bonus categories. [ESTIMATED]' },
  { card_id: '00000000-0000-0000-0002-000000000017', category_id: null, monthly_cap_amount: 1500, cap_type: 'spend', notes: 'Combined cap. Same as Horizon. [ESTIMATED]' },
  { card_id: '00000000-0000-0000-0002-000000000018', category_id: null, monthly_cap_amount: 1000, cap_type: 'spend', notes: 'Combined cap across shopping/online. [VERIFIED]' },
  { card_id: '00000000-0000-0000-0002-000000000020', category_id: 'dining', monthly_cap_amount: 1000, cap_type: 'spend', notes: 'Cap on 10X dining. Min spend $600/month. [VERIFIED]' },
];

// =============================================================================
// DATA: Exclusions
// =============================================================================
const exclusions = [
  // Card 1: DBS Altitude
  { card_id: '00000000-0000-0000-0001-000000000001', category_id: null, excluded_mccs: ['9311','9222','9211','9399'], conditions: { payment_type: 'government' }, description: 'Government transactions excluded.' },
  { card_id: '00000000-0000-0000-0001-000000000001', category_id: null, excluded_mccs: ['6300','6381','6399'], conditions: { payment_type: 'insurance' }, description: 'Insurance payments excluded.' },
  // Card 2: Citi PremierMiles
  { card_id: '00000000-0000-0000-0001-000000000002', category_id: null, excluded_mccs: ['9311','9222','9211','9399'], conditions: { payment_type: 'government' }, description: 'Government transactions excluded.' },
  { card_id: '00000000-0000-0000-0001-000000000002', category_id: null, excluded_mccs: ['6300','6381','6399'], conditions: { payment_type: 'insurance' }, description: 'Insurance payments excluded.' },
  // Card 3: UOB PRVI Miles
  { card_id: '00000000-0000-0000-0001-000000000003', category_id: null, excluded_mccs: ['9311','9222','9211'], conditions: { payment_type: 'government' }, description: 'Government payments excluded.' },
  { card_id: '00000000-0000-0000-0001-000000000003', category_id: null, excluded_mccs: ['6300','6381','6399'], conditions: { payment_type: 'insurance' }, description: 'Insurance payments excluded.' },
  // Card 4: OCBC 90N
  { card_id: '00000000-0000-0000-0001-000000000004', category_id: null, excluded_mccs: ['9311','9222','9211'], conditions: { payment_type: 'government' }, description: 'Government payments excluded.' },
  // Card 5: KrisFlyer UOB
  { card_id: '00000000-0000-0000-0001-000000000005', category_id: null, excluded_mccs: ['9311','9222','9211','9399'], conditions: { payment_type: 'government' }, description: 'Government payments excluded.' },
  { card_id: '00000000-0000-0000-0001-000000000005', category_id: null, excluded_mccs: ['6300','6381','6399'], conditions: { payment_type: 'insurance' }, description: 'Insurance payments excluded.' },
  { card_id: '00000000-0000-0000-0001-000000000005', category_id: 'petrol', excluded_mccs: ['5541','5542'], conditions: {}, description: 'Petrol excluded from bonus. [ESTIMATED]' },
  // Card 6: HSBC Revolution
  { card_id: '00000000-0000-0000-0001-000000000006', category_id: null, excluded_mccs: ['9311','9222','9211','9399'], conditions: { payment_type: 'government' }, description: 'Government payments excluded.' },
  { card_id: '00000000-0000-0000-0001-000000000006', category_id: null, excluded_mccs: ['6300','6381','6399'], conditions: { payment_type: 'insurance' }, description: 'Insurance payments excluded.' },
  { card_id: '00000000-0000-0000-0001-000000000006', category_id: 'groceries', excluded_mccs: ['5411'], conditions: {}, description: 'Supermarkets excluded from 10X bonus. [ESTIMATED]' },
  // Card 7: Amex KrisFlyer Ascend
  { card_id: '00000000-0000-0000-0001-000000000007', category_id: null, excluded_mccs: ['9311','9222','9211'], conditions: { payment_type: 'government' }, description: 'Government payments excluded.' },
  { card_id: '00000000-0000-0000-0001-000000000007', category_id: null, excluded_mccs: ['6300','6381','6399'], conditions: { payment_type: 'insurance' }, description: 'Insurance payments excluded.' },
  { card_id: '00000000-0000-0000-0001-000000000007', category_id: null, excluded_mccs: [], conditions: { payment_type: 'installment' }, description: 'Instalment plans excluded.' },
  // Card 8: BOC Elite Miles
  { card_id: '00000000-0000-0000-0001-000000000008', category_id: null, excluded_mccs: ['9311','9222','9211','9399'], conditions: { payment_type: 'government' }, description: 'Government transactions excluded.' },
  { card_id: '00000000-0000-0000-0001-000000000008', category_id: null, excluded_mccs: ['6300','6381','6399'], conditions: { payment_type: 'insurance' }, description: 'Insurance payments excluded.' },
  // Card 9: SC Visa Infinite
  { card_id: '00000000-0000-0000-0001-000000000009', category_id: null, excluded_mccs: ['9311','9222','9211','9399'], conditions: { payment_type: 'government' }, description: 'Government transactions excluded.' },
  { card_id: '00000000-0000-0000-0001-000000000009', category_id: null, excluded_mccs: ['6300','6381','6399'], conditions: { payment_type: 'insurance' }, description: 'Insurance payments excluded.' },
  // Card 10: DBS Woman's World
  { card_id: '00000000-0000-0000-0001-000000000010', category_id: null, excluded_mccs: ['9311','9222','9211','9399'], conditions: { payment_type: 'government' }, description: 'Government payments excluded.' },
  { card_id: '00000000-0000-0000-0001-000000000010', category_id: null, excluded_mccs: ['6300','6381','6399'], conditions: { payment_type: 'insurance' }, description: 'Insurance payments excluded.' },
  { card_id: '00000000-0000-0000-0001-000000000010', category_id: 'online', excluded_mccs: [], conditions: { payment_type: 'recurring' }, description: 'Recurring online payments may not qualify for 10X bonus. [ESTIMATED]' },
  // Card 11: UOB Lady's Card
  { card_id: '00000000-0000-0000-0002-000000000011', category_id: null, excluded_mccs: ['9311','9222','9211','9399'], conditions: { payment_type: 'government' }, description: 'Government payments excluded.' },
  { card_id: '00000000-0000-0000-0002-000000000011', category_id: null, excluded_mccs: ['6300','6381','6399'], conditions: { payment_type: 'insurance' }, description: 'Insurance payments excluded.' },
  { card_id: '00000000-0000-0000-0002-000000000011', category_id: null, excluded_mccs: [], conditions: { payment_type: 'education' }, description: 'Education payments excluded from 10X bonus. [ESTIMATED]' },
  // Card 12: OCBC Titanium
  { card_id: '00000000-0000-0000-0002-000000000012', category_id: null, excluded_mccs: ['9311','9222','9211','9399'], conditions: { payment_type: 'government' }, description: 'Government payments excluded.' },
  { card_id: '00000000-0000-0000-0002-000000000012', category_id: null, excluded_mccs: ['6300','6381','6399'], conditions: { payment_type: 'insurance' }, description: 'Insurance payments excluded.' },
  { card_id: '00000000-0000-0000-0002-000000000012', category_id: 'groceries', excluded_mccs: ['5411'], conditions: {}, description: 'Supermarkets excluded from 10X bonus. [ESTIMATED]' },
  // Card 13: HSBC TravelOne
  { card_id: '00000000-0000-0000-0002-000000000013', category_id: null, excluded_mccs: ['9311','9222','9211','9399'], conditions: { payment_type: 'government' }, description: 'Government payments excluded.' },
  { card_id: '00000000-0000-0000-0002-000000000013', category_id: null, excluded_mccs: ['6300','6381','6399'], conditions: { payment_type: 'insurance' }, description: 'Insurance payments excluded.' },
  // Card 14: Amex KrisFlyer Credit Card
  { card_id: '00000000-0000-0000-0002-000000000014', category_id: null, excluded_mccs: ['9311','9222','9211'], conditions: { payment_type: 'government' }, description: 'Government payments excluded.' },
  { card_id: '00000000-0000-0000-0002-000000000014', category_id: null, excluded_mccs: ['6300','6381','6399'], conditions: { payment_type: 'insurance' }, description: 'Insurance payments excluded.' },
  { card_id: '00000000-0000-0000-0002-000000000014', category_id: null, excluded_mccs: [], conditions: { payment_type: 'installment' }, description: 'Instalment plans excluded. [VERIFIED]' },
  // Card 15: SC X Card
  { card_id: '00000000-0000-0000-0002-000000000015', category_id: null, excluded_mccs: ['9311','9222','9211','9399'], conditions: { payment_type: 'government' }, description: 'Government payments excluded.' },
  { card_id: '00000000-0000-0000-0002-000000000015', category_id: null, excluded_mccs: ['6300','6381','6399'], conditions: { payment_type: 'insurance' }, description: 'Insurance payments excluded.' },
  { card_id: '00000000-0000-0000-0002-000000000015', category_id: null, excluded_mccs: [], conditions: { payment_type: 'utility' }, description: 'Utility bills excluded from bonus. [ESTIMATED]' },
  // Card 16: Maybank Horizon
  { card_id: '00000000-0000-0000-0002-000000000016', category_id: null, excluded_mccs: ['9311','9222','9211','9399'], conditions: { payment_type: 'government' }, description: 'Government payments excluded.' },
  { card_id: '00000000-0000-0000-0002-000000000016', category_id: null, excluded_mccs: ['6300','6381','6399'], conditions: { payment_type: 'insurance' }, description: 'Insurance payments excluded.' },
  // Card 17: Maybank FC Barcelona
  { card_id: '00000000-0000-0000-0002-000000000017', category_id: null, excluded_mccs: ['9311','9222','9211','9399'], conditions: { payment_type: 'government' }, description: 'Government payments excluded.' },
  { card_id: '00000000-0000-0000-0002-000000000017', category_id: null, excluded_mccs: ['6300','6381','6399'], conditions: { payment_type: 'insurance' }, description: 'Insurance payments excluded.' },
  // Card 18: Citi Rewards
  { card_id: '00000000-0000-0000-0002-000000000018', category_id: null, excluded_mccs: ['9311','9222','9211','9399'], conditions: { payment_type: 'government' }, description: 'Government payments excluded.' },
  { card_id: '00000000-0000-0000-0002-000000000018', category_id: null, excluded_mccs: ['6300','6381','6399'], conditions: { payment_type: 'insurance' }, description: 'Insurance payments excluded.' },
  { card_id: '00000000-0000-0000-0002-000000000018', category_id: 'groceries', excluded_mccs: ['5411'], conditions: {}, description: 'Supermarkets excluded from 10X bonus. [ESTIMATED]' },
  // Card 19: POSB Everyday
  { card_id: '00000000-0000-0000-0002-000000000019', category_id: null, excluded_mccs: ['9311','9222','9211','9399'], conditions: { payment_type: 'government' }, description: 'Government payments excluded.' },
  { card_id: '00000000-0000-0000-0002-000000000019', category_id: null, excluded_mccs: ['6300','6381','6399'], conditions: { payment_type: 'insurance' }, description: 'Insurance payments excluded.' },
  // Card 20: UOB Preferred Platinum
  { card_id: '00000000-0000-0000-0002-000000000020', category_id: null, excluded_mccs: ['9311','9222','9211','9399'], conditions: { payment_type: 'government' }, description: 'Government payments excluded.' },
  { card_id: '00000000-0000-0000-0002-000000000020', category_id: null, excluded_mccs: ['6300','6381','6399'], conditions: { payment_type: 'insurance' }, description: 'Insurance payments excluded.' },
  { card_id: '00000000-0000-0000-0002-000000000020', category_id: 'dining', excluded_mccs: [], conditions: { payment_type: 'fast_food_delivery' }, description: 'Fast food delivery may not code as dining MCC. [ESTIMATED]' },
];

// =============================================================================
// SEED FUNCTIONS
// =============================================================================

async function seedCategories() {
  console.log('Seeding categories...');
  const { error } = await supabase
    .from('categories')
    .upsert(categories, { onConflict: 'id' });
  if (error) throw new Error(`Categories: ${error.message}`);
  console.log(`  ✅ ${categories.length} categories upserted`);
}

async function seedCards() {
  console.log('Seeding cards...');
  const { error } = await supabase
    .from('cards')
    .upsert(cards, { onConflict: 'id' });
  if (error) throw new Error(`Cards: ${error.message}`);
  console.log(`  ✅ ${cards.length} cards upserted`);
}

async function seedEarnRules() {
  console.log('Seeding earn rules...');
  // Upsert in batches of 20 to avoid payload limits
  for (let i = 0; i < earnRules.length; i += 20) {
    const batch = earnRules.slice(i, i + 20);
    const { error } = await supabase
      .from('earn_rules')
      .upsert(batch, { onConflict: 'card_id,category_id,is_bonus,effective_from' });
    if (error) throw new Error(`Earn rules batch ${i}: ${error.message}`);
  }
  console.log(`  ✅ ${earnRules.length} earn rules upserted`);
}

async function seedCaps() {
  console.log('Seeding caps...');
  // Delete existing caps first — upsert doesn't work for NULL category_id
  // because PostgreSQL treats NULL != NULL in unique constraints.
  const cardIds = [...new Set(caps.map(c => c.card_id))];
  const { error: delError } = await supabase
    .from('caps')
    .delete()
    .in('card_id', cardIds);
  if (delError) console.warn(`  ⚠️  Could not clear caps: ${delError.message}`);

  const { error } = await supabase
    .from('caps')
    .insert(caps);
  if (error) throw new Error(`Caps: ${error.message}`);
  console.log(`  ✅ ${caps.length} caps inserted`);
}

async function seedExclusions() {
  console.log('Seeding exclusions...');
  // Delete existing exclusions first (no good upsert key for exclusions)
  const { error: delError } = await supabase
    .from('exclusions')
    .delete()
    .gte('id', '00000000-0000-0000-0000-000000000000'); // delete all rows
  if (delError) console.warn(`  ⚠️  Could not clear exclusions: ${delError.message}`);

  // Insert in batches
  for (let i = 0; i < exclusions.length; i += 20) {
    const batch = exclusions.slice(i, i + 20);
    const { error } = await supabase
      .from('exclusions')
      .insert(batch);
    if (error) throw new Error(`Exclusions batch ${i}: ${error.message}`);
  }
  console.log(`  ✅ ${exclusions.length} exclusions inserted`);
}

async function verify() {
  console.log('\nVerifying...');
  const { count: cardCount } = await supabase.from('cards').select('*', { count: 'exact', head: true });
  const { count: ruleCount } = await supabase.from('earn_rules').select('*', { count: 'exact', head: true });
  const { count: capCount } = await supabase.from('caps').select('*', { count: 'exact', head: true });
  const { count: exclCount } = await supabase.from('exclusions').select('*', { count: 'exact', head: true });

  console.log(`  Cards:      ${cardCount}`);
  console.log(`  Earn Rules: ${ruleCount}`);
  console.log(`  Caps:       ${capCount}`);
  console.log(`  Exclusions: ${exclCount}`);

  if (cardCount === 20 && ruleCount === 140) {
    console.log('\n🎉 All 20 cards seeded successfully!');
  } else {
    console.warn(`\n⚠️  Expected 20 cards and 140 earn rules, got ${cardCount} and ${ruleCount}`);
  }
}

// =============================================================================
// MAIN
// =============================================================================
async function main() {
  console.log('=== MaxiMile Database Seed ===\n');
  try {
    await seedCategories();
    await seedCards();
    await seedEarnRules();
    await seedCaps();
    await seedExclusions();
    await verify();
  } catch (err) {
    console.error(`\n❌ Seed failed: ${err.message}`);
    process.exit(1);
  }
}

main();
