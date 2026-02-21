# Demo Mode Implementation Guide

## Overview

Demo mode allows MaxiMile to be demonstrated on iOS Simulator without requiring:
- Real Apple Wallet cards
- Real credit cards in portfolio
- Real transaction notifications
- Real Shortcut automation triggers

**Key Principle:** Keep the EXACT same flow and UI. Only swap data sources from real → mock.

---

## How Demo Mode Works

### Activation

Demo mode is controlled by a single environment variable:

```bash
EXPO_PUBLIC_DEMO_MODE=true
```

This is set in:
- `.env.demo` file
- `eas.json` demo build profile
- Automatically injected during demo builds

### Visual Indicator

When demo mode is active, a small badge appears in the top-right corner:

```
🧪 DEMO MODE
```

This helps presenters know they're using mock data.

---

## Demo Flow Walkthrough

### 1. Smart Pay Flow (F24)

**User Action:**
1. Tap "Smart Pay" from home screen
2. App detects location → identifies merchant
3. Shows card recommendation
4. User taps "Smart Pay" button
5. **Wallet app opens** (empty in Simulator - this is expected!)
6. User manually switches back to MaxiMile app

**What Happens Behind the Scenes:**

**Production Mode:**
- Wallet opens with real cards
- User taps card to pay
- iOS Shortcut captures transaction data
- Deep link sends data back to app
- Auto-capture confirmation appears

**Demo Mode:**
- Wallet opens (empty - doesn't matter)
- User switches back to app
- App detects return from Wallet
- **Immediately injects mock transaction data**
- Auto-capture confirmation appears with mock data

**Files Involved:**
- `app/pay/index.tsx` - Modified AppState listener to detect demo mode
- `lib/demo-transaction-data.ts` - Pool of mock transactions

### 2. Auto-Capture Confirmation (F25)

**User sees:**
- Mock merchant name (e.g., "Starbucks")
- Mock amount (e.g., "$45.80")
- Mock card (e.g., "Citi PremierMiles Visa Signature")
- Real category matching
- Real card selection from user's portfolio

**What's Mocked:**
- Transaction amount
- Merchant name
- Triggered card name

**What's Real:**
- Category detection
- Card recommendations
- User's actual card portfolio
- Transaction logging to database

**Files Involved:**
- `app/auto-capture.tsx` - Receives params, displays confirmation
- `lib/demo-transaction-data.ts` - Provides mock data

### 3. Wallet Card Selection (Setup Wizard)

**Problem in Simulator:**
- iOS Simulator doesn't have Wallet cards
- Setup wizard Step 3 (card mapping) can't proceed

**Solution:**
- Mock wallet cards appear in MaxiMile's UI
- User can complete card mapping
- Cards: Citi PM, Amex KF, HSBC Rev, SC Smart, UOB Lady's

**Files Involved:**
- `lib/demo-wallet-cards.ts` - 5 mock cards matching user's portfolio
- `lib/wallet-cards.ts` - Smart switcher (demo vs production)

---

## Mock Data Details

### Mock Wallet Cards (5 cards)

```typescript
[
  { name: 'Citi PremierMiles Visa Signature', lastFour: '4892' },
  { name: 'American Express KrisFlyer Ascend', lastFour: '1007' },
  { name: 'HSBC Revolution Credit Card', lastFour: '3345' },
  { name: 'Standard Chartered Smart Credit Card', lastFour: '6721' },
  { name: "UOB Lady's Card", lastFour: '2158' },
]
```

### Mock Transactions (20+ scenarios across 7 categories)

**Smart Category Matching:**
Demo mode now intelligently matches mock transactions to the category you selected!

- **Dining:** Starbucks, McDonald's, Din Tai Fung, Crystal Jade
- **Groceries:** Cold Storage, FairPrice, Sheng Siong
- **Shopping (General):** Uniqlo, Takashimaya, Ion Orchard
- **Travel:** Singapore Airlines, Changi Airport
- **Petrol:** Shell, Esso
- **Transport:** Grab, ComfortDelGro
- **Online:** Shopee, Lazada
- **Bills:** Singtel, SP Services

**How it works:**
1. You select a category (e.g., "Groceries")
2. Tap "Smart Pay" → Go to Wallet → Return to app
3. Mock transaction will be from a **Groceries merchant** (Cold Storage, FairPrice, or Sheng Siong)
4. Amounts and cards vary for realistic variety

---

## Safety Guarantees

### Production Protection

**Critical:** Demo mode code only activates when `EXPO_PUBLIC_DEMO_MODE=true`

```typescript
// All demo code follows this pattern:
if (isDemoMode()) {
  // Use mock data
  return MOCK_WALLET_CARDS;
} else {
  // Use real production APIs
  return await realWalletAPI();
}
```

### No Production Impact

- Production builds: `EXPO_PUBLIC_DEMO_MODE=false` (default)
- Demo mode code paths are never reached in production
- No mock data leaks into production database
- All transactions logged in demo are real database entries (just triggered by mock data)

---

## Demo Presentation Tips

### What to Say

"I'm going to show you MaxiMile's Smart Pay feature. Even though we're using the iOS Simulator, you'll see the complete flow as if you were using real credit cards and Apple Wallet."

### What to Show

1. **Smart Pay Flow:**
   - Location detection
   - Merchant identification
   - Card recommendation
   - "Smart Pay" button
   - Wallet opening (acknowledge it's empty)
   - **Switch back to app** (key step!)
   - Auto-capture confirmation appears

2. **Point Out the Demo Badge:**
   - "See the 🧪 DEMO MODE badge? This tells us we're using simulated data."

3. **Show the Mock Data:**
   - "Notice it captured the merchant, amount, and card automatically"
   - "In production, this would come from the actual payment"

### What NOT to Do

- Don't wait in Wallet (it's empty)
- Don't try to tap a card in Simulator Wallet (won't work)
- Don't pretend Wallet has real cards (acknowledge the simulation)

---

## Files Modified

### New Files Created

1. `lib/demo-wallet-cards.ts` - Mock Wallet cards
2. `lib/demo-transaction-data.ts` - Mock transaction pool
3. `components/DemoModeIndicator.tsx` - Visual demo badge

### Files Modified

1. `lib/wallet-cards.ts` - Smart switcher for Wallet API
2. `app/pay/index.tsx` - AppState listener with demo mode branch
3. `app/auto-capture.tsx` - Added demo indicator

### Configuration

1. `.env.demo` - `EXPO_PUBLIC_DEMO_MODE=true`
2. `eas.json` - Demo build profile

---

## Testing Demo Mode

### Local Development

```bash
# Set demo mode
export EXPO_PUBLIC_DEMO_MODE=true

# Start dev server
npm start

# Open in iOS Simulator
i
```

### EAS Build

```bash
# Build demo version
eas build --profile demo --platform ios

# Install on device or simulator
```

### Verify Demo Mode Active

1. Look for 🧪 DEMO MODE badge in top-right
2. Check console logs: `[DEMO MODE] Using mock Wallet cards`
3. Return from Wallet → Should see auto-capture immediately

---

## Troubleshooting

### "No auto-capture appears when I return from Wallet"

**Check:**
- Is demo mode badge visible?
- Did you switch back within 60 seconds?
- Check console for `[DEMO MODE]` logs

### "Setup wizard shows no cards"

**Check:**
- Demo mode badge should be visible
- Check `getWalletCards()` is being called
- Verify `EXPO_PUBLIC_DEMO_MODE=true` in environment

### "Production build shows demo data"

**This should NEVER happen!**
- Check `eas.json` production profile
- Verify `.env` doesn't have `EXPO_PUBLIC_DEMO_MODE=true`
- Rebuild with production profile

---

## Future Enhancements

Potential improvements for demo mode:

1. **Android Demo Mode:**
   - Mock notification data for Android auto-capture
   - Simulate notification listener

2. **Interactive Demo:**
   - "Trigger Demo Transaction" button
   - Choose merchant/amount for demo

3. **Demo Scenarios:**
   - Pre-scripted demo sequences
   - "Tour Mode" with guided steps

4. **Admin Controls:**
   - Toggle demo mode from settings
   - Select specific mock transaction

---

## Summary

Demo mode provides a **complete, realistic demo** of MaxiMile's auto-capture feature without requiring:
- Real iPhone hardware
- Real credit cards
- Real Apple Wallet setup
- Real payment transactions

**The flow looks and feels identical to production.** Only the data source changes from real → mock.

Perfect for:
- Investor presentations
- Stakeholder demos
- Internal testing
- Feature showcases
- Development without physical devices
