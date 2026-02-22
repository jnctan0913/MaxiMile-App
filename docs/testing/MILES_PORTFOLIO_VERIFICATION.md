# Miles Portfolio Fix - Verification Guide

## ✅ Migrations Applied

The following migrations have been successfully applied to your Supabase database:

1. **`20260222000000_fix_miles_portfolio_manual_only.sql`**
   - Updated `get_miles_portfolio()` function to show programs with manual balances even without cards

2. **`20260222000001_fix_card_program_mappings.sql`**
   - Added missing programs: HSBC Rewards, Standard Chartered 360° Rewards
   - Fixed DBS Altitude: KrisFlyer → **DBS Points**
   - Fixed HSBC Revolution: KrisFlyer → **HSBC Rewards**
   - Added transfer partners for bank points → airline conversions

---

## 🧪 How to Verify the Fix

### Test 1: Onboarding Flow (New User)

1. **Clear app data** or create a new test user
2. **Add cards** during onboarding:
   - DBS Altitude
   - HSBC Revolution
   - American Express KrisFlyer Ascend
3. **Check the miles onboarding screen** - should now show:
   - ✈️ KrisFlyer (from Amex - direct earn)
   - 💳 DBS Points (from DBS Altitude)
   - 💳 HSBC Rewards (from HSBC Revolution)

   All three programs should appear in one unified list!

### Test 2: Miles Portfolio (Existing User)

1. **Go to Miles tab**
2. **Check "My Miles"** section:
   - Should show airline programs with balances
3. **Check "My Points"** section:
   - Should show bank points programs (DBS Points, HSBC Rewards) with transfer options
4. **Verify all programs** you enrolled in during onboarding are visible

### Test 3: Database Verification (via Supabase Dashboard)

1. Go to **Supabase Dashboard → SQL Editor**
2. Run this query:

```sql
SELECT c.name, mp.name as program, mp.program_type
FROM cards c
JOIN miles_programs mp ON c.miles_program_id = mp.id
WHERE c.name ILIKE '%DBS Altitude%' OR c.name ILIKE '%HSBC Revolution%';
```

**Expected Result:**
```
DBS Altitude      | DBS Points    | bank_points
HSBC Revolution   | HSBC Rewards  | bank_points
```

3. Check transfer partners:

```sql
SELECT
  source.name as from_program,
  dest.name as to_program,
  tp.conversion_rate_from || ':' || tp.conversion_rate_to as rate
FROM transfer_partners tp
JOIN miles_programs source ON tp.source_program_id = source.id
JOIN miles_programs dest ON tp.destination_program_id = dest.id
WHERE source.name IN ('DBS Points', 'HSBC Rewards', 'Citi Miles');
```

**Expected Result:**
```
DBS Points    | KrisFlyer | 1:1
HSBC Rewards  | KrisFlyer | 2:1
Citi Miles    | KrisFlyer | 1:1
```

---

## 🎯 What Changed?

### Before Fix ❌
```
User adds:
- DBS Altitude
- HSBC Revolution
- Amex KrisFlyer Ascend

Onboarding shows:
- KrisFlyer only (all 3 cards wrongly mapped here!)

Miles Portfolio shows:
- Only KrisFlyer (missing bank programs)
```

### After Fix ✅
```
User adds:
- DBS Altitude
- HSBC Revolution
- Amex KrisFlyer Ascend

Onboarding shows:
- KrisFlyer (from Amex)
- DBS Points (from DBS Altitude)
- HSBC Rewards (from HSBC Revolution)

Miles Portfolio shows:
My Miles tab:
- KrisFlyer (with balances)

My Points tab:
- DBS Points (with transfer options)
- HSBC Rewards (with transfer options)
```

---

## 🔄 For Existing Users

If you already completed onboarding with the wrong mappings, you have two options:

### Option 1: Edit Balances Manually
1. Go to **Miles Portfolio**
2. Tap the **Edit** button
3. Update balances for DBS Points, HSBC Rewards, etc.

### Option 2: Re-run Onboarding
1. Go to **Profile → Settings**
2. If there's a "Re-run Onboarding" option, use it
3. Otherwise, you can manually add balances via Option 1

---

## 📊 Key Technical Changes

### Database Schema
- **New programs added**: HSBC Rewards, Standard Chartered 360° Rewards
- **Fixed mappings**: DBS Altitude→DBS Points, HSBC Revolution→HSBC Rewards
- **New transfer partners**: DBS Points→KrisFlyer (1:1), HSBC Rewards→KrisFlyer (2:1)

### Code Changes
- **`app/onboarding-miles.tsx`**: Enhanced `fetchPrograms()` to query both direct programs AND transferable airline programs, combining them into one unified list
- **`supabase/migrations/20260222000001_fix_card_program_mappings.sql`**: Database migration fixing all card→program relationships

---

## ✨ Result

Users now get a **complete, accurate miles portfolio** that shows:
- ✅ All programs their cards earn into
- ✅ All programs they can reach via transfers
- ✅ One clean, unified onboarding experience (no "direct vs transferable" confusion)

No more "Why is only KrisFlyer showing?" confusion! 🎉
