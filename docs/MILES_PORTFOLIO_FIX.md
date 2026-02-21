# Miles Portfolio Fix - Complete Solution

## 🐛 Problem Summary

**Issue:** Miles portfolio only showed KrisFlyer, even though user enrolled in multiple programs during onboarding.

**Root Causes:**
1. **Incorrect card mappings**: Cards earning bank points were wrongly mapped to airline programs
   - DBS Altitude → Mapped to KrisFlyer (WRONG - earns DBS Points)
   - HSBC Revolution → Mapped to KrisFlyer (WRONG - earns HSBC Rewards)

2. **Limited onboarding scope**: Only showed direct-earn programs, not transferable airlines
   - User with DBS Altitude could transfer to Asia Miles, Velocity, etc.
   - But onboarding only asked for programs from direct card mappings

---

## ✅ Solution Implemented

### 1. Fixed Card → Program Mappings

**Migration:** `20260222000001_fix_card_program_mappings.sql`

**Changes:**
- ✓ Added missing programs: HSBC Rewards, Standard Chartered 360° Rewards
- ✓ Fixed DBS Altitude: KrisFlyer → **DBS Points**
- ✓ Fixed HSBC Revolution: KrisFlyer → **HSBC Rewards**
- ✓ Fixed Standard Chartered X: → **360° Rewards**
- ✓ Added transfer partners (DBS Points → KrisFlyer, HSBC Rewards → KrisFlyer, etc.)

**Correct Mappings:**

| Card | Earns Into | Type |
|------|------------|------|
| Amex KrisFlyer Ascend | KrisFlyer | Airline (direct) |
| UOB PRVI Miles | KrisFlyer | Airline (direct) |
| DBS Altitude | **DBS Points** | Bank Points (transferable) |
| HSBC Revolution | **HSBC Rewards** | Bank Points (transferable) |
| Citi PremierMiles | Citi Miles | Bank Points (transferable) |
| UOB Lady's Card | UNI$ | Bank Points (transferable) |
| SC X Card | 360° Rewards | Bank Points (transferable) |

### 2. Enhanced Onboarding Flow

**File:** `app/onboarding-miles.tsx`

**New Behavior:**
Shows ALL reachable programs in one unified list:
- ✓ Direct-earn airline programs (from co-branded cards)
- ✓ Bank points programs (from rewards cards)
- ✓ **Transferable airline programs** (reachable via bank points)

**Example:**
```
User has: DBS Altitude + Amex KrisFlyer Ascend

Onboarding now shows:
┌─────────────────────────────────┐
│ Set your current balances       │
├─────────────────────────────────┤
│ ✈️  KrisFlyer                   │  ← Direct (from Amex)
│ 💳 DBS Points                   │  ← Direct (from DBS Altitude)
└─────────────────────────────────┘

(No differentiation - just one clean list!)
```

**Logic:**
1. Fetch direct programs from user's cards
2. For bank points programs, fetch transfer partners
3. Combine and deduplicate
4. Sort: Airlines first, then bank programs
5. Show all in one list

---

## 🚀 How to Apply

### Step 1: Apply Database Migration

```bash
# Option A: Using Supabase CLI (if you have project linked)
npx supabase db push

# Option B: Manual via Supabase Dashboard
# 1. Go to SQL Editor in Supabase Dashboard
# 2. Copy content from: supabase/migrations/20260222000001_fix_card_program_mappings.sql
# 3. Run the SQL
```

### Step 2: Restart App

```bash
# Kill and restart Expo dev server
# Press Ctrl+C, then:
npm start
```

### Step 3: Verify Fix

**Test 1: Check Card Mappings**
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

**Test 2: Onboarding Flow**
1. Create a new test user
2. Add DBS Altitude + Amex KrisFlyer Ascend cards
3. Check onboarding miles screen
4. **Should show:** KrisFlyer, DBS Points (both programs!)

**Test 3: Miles Portfolio**
1. Go to Miles tab
2. **My Miles:** Should show airline programs with balances
3. **My Points:** Should show bank programs with transfer options

---

## 📊 Before vs After

### Before Fix ❌

```
User adds:
- DBS Altitude
- HSBC Revolution
- Amex KrisFlyer Ascend

Onboarding shows:
- KrisFlyer (all 3 cards wrongly mapped here!)

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
- KrisFlyer (from Amex - direct earn)
- DBS Points (from DBS Altitude)
- HSBC Rewards (from HSBC Revolution)

Miles Portfolio shows:
My Miles tab:
- KrisFlyer (direct + potential from transfers)

My Points tab:
- DBS Points (with transfer options to KrisFlyer, Asia Miles, etc.)
- HSBC Rewards (with transfer options)
```

---

## 🎯 User Experience Improvements

1. **Accurate onboarding**: Users can now enter balances for ALL their programs
2. **Complete portfolio view**: See both airline miles AND bank points
3. **Transfer visibility**: Understand which airlines you can reach
4. **No confusion**: One unified onboarding experience (no "direct vs transferable" complexity)
5. **Correct data**: Card→Program mappings reflect reality

---

## 🔍 Technical Details

### Database Schema Changes

**New Programs Added:**
```sql
miles_programs:
  - HSBC Rewards (bank_points)
  - Standard Chartered 360° Rewards (bank_points)
```

**New Transfer Partners:**
```sql
transfer_partners:
  - DBS Points → KrisFlyer (1:1, no fee)
  - HSBC Rewards → KrisFlyer (2:1, no fee)
  - Citi Miles → KrisFlyer (1:1, $25 fee)
```

### Code Changes

**onboarding-miles.tsx:**
- Enhanced `fetchPrograms()` to query transfer partners
- Added deduplication logic
- Added sorting (airlines first)
- Updated UI text for clarity

---

## ⚠️ Notes

1. **Existing users**: If users already completed onboarding with wrong mappings, they can:
   - Go to Miles Portfolio → Edit balances
   - Or re-run onboarding from profile settings (if feature exists)

2. **Future additions**: When adding new bank→airline transfer partners, update the `transfer_partners` table

3. **Testing**: Test with different card combinations to ensure all programs show correctly

---

## ✨ Result

Users now get a **complete, accurate miles portfolio** that shows:
- All programs their cards earn into
- All programs they can reach via transfers
- One clean, unified onboarding experience

No more "Why is only KrisFlyer showing?" confusion! 🎉
