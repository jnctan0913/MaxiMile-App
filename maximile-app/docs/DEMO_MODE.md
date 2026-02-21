# Demo Mode Documentation

**Version:** 1.0
**Date:** 2026-02-21
**Status:** Complete

---

## Overview

Demo Mode allows you to demonstrate the MaxiMile auto-capture feature without requiring real Apple Pay transactions. When enabled, the app automatically injects realistic mock transaction data whenever the auto-capture flow is triggered.

---

## How It Works

### Normal Flow (Production)
1. User taps Apple Pay card in Wallet
2. Shortcuts automation triggers `maximile://log`
3. **Real transaction data** captured from Apple Pay
4. App opens with transaction pre-filled

### Demo Flow (Demo Mode Enabled)
1. User taps Apple Pay card in Wallet (or manual shortcut trigger)
2. Shortcuts automation triggers `maximile://log`
3. **Mock transaction data** automatically injected
4. App opens with realistic demo transaction pre-filled

**Key Benefit:** No real purchases needed for demos! 🎉

---

## Building Demo Version

### Prerequisites
- EAS CLI installed: `npm install -g eas-cli`
- Logged into Expo account: `eas login`
- EAS configured: `eas build:configure` (already done)

### Build Demo App

```bash
cd maximile-app

# Build for iOS (recommended for demos)
eas build --profile demo --platform ios

# Build will take 15-20 minutes
# You'll get a download link when complete
```

### Install on Device

**Option 1: QR Code (Easiest)**
```bash
# Scan QR code shown after build completes
# Opens Expo installation page
# Tap "Install" → App installs on device
```

**Option 2: Download Link**
```bash
# Copy the build URL from terminal
# Open on iPhone in Safari
# Tap "Install" → Follow prompts
```

**Option 3: EAS Dashboard**
```bash
# Visit https://expo.dev
# Go to Builds → Select your demo build
# Scan QR code or send link to device
```

---

## Using Demo Mode

### 1. Setup (One-Time)
After installing demo build on device:
1. Open MaxiMile app
2. Navigate to Profile → Auto-Capture
3. Follow setup flow (same as production)
4. Install shortcut and configure automation

### 2. Demo Presentation
**Quick Test:**
- Open Shortcuts app
- Tap "Log to MaxiMile" shortcut
- ✅ App opens with mock transaction (e.g., "Starbucks $5.47")

**Realistic Demo:**
- Show Shortcuts automation setup
- Manually trigger shortcut
- App opens with different mock transaction (e.g., "Shell $52.30")
- Demonstrate review/confirm flow

**Multiple Demos:**
- Each trigger generates new random transaction
- 44 different merchants across 6 categories
- Realistic amounts per merchant type
- No repetition in quick succession

---

## Mock Data Details

### Merchant Categories & Examples

| Category | Count | Examples | Amount Range |
|----------|-------|----------|--------------|
| **Coffee** | 8 | Starbucks, Peet's, Dunkin' | $3.50 - $14.00 |
| **Gas** | 6 | Shell, Chevron, Exxon | $32.00 - $90.00 |
| **Grocery** | 6 | Whole Foods, Trader Joe's | $20.00 - $250.00 |
| **Restaurant** | 10 | Chipotle, Panera, Olive Garden | $8.00 - $75.00 |
| **Retail** | 10 | Target, Best Buy, Apple Store | $8.00 - $300.00 |
| **Online** | 4 | Amazon, Netflix, Spotify | $9.99 - $200.00 |

**Total:** 44 unique merchants with realistic pricing

### Card Selection Logic
1. **If user has cards in portfolio:** Uses random user card
2. **If no user cards:** Uses fallback (Chase Sapphire Reserve, Amex Gold, etc.)
3. **Result:** Personalized demo experience

---

## Build Profiles Comparison

| Profile | Demo Mode | Use Case | Command |
|---------|-----------|----------|---------|
| **demo** | ✅ Enabled | Presentations, demos | `eas build --profile demo` |
| **development** | ❌ Disabled | Local development | `eas build --profile development` |
| **preview** | ❌ Disabled | Pre-production testing | `eas build --profile preview` |
| **production** | ❌ Disabled | App Store release | `eas build --profile production` |

---

## Environment Variables

### Configuration Files

**`.env.demo`** (Demo builds)
```env
EXPO_PUBLIC_DEMO_MODE=true
```

**`.env.production`** (Production builds)
```env
EXPO_PUBLIC_DEMO_MODE=false
```

### How It Works
- Environment variable read at runtime via `process.env.EXPO_PUBLIC_DEMO_MODE`
- Deep link handler checks this variable
- When `true`: Injects mock data automatically
- When `false`: Uses real transaction data

---

## Troubleshooting

### Build Issues

**Problem:** `eas build` fails
- **Solution:** Check EAS CLI version: `eas --version` (should be >= 13.0.0)
- **Solution:** Re-login: `eas login`
- **Solution:** Check project configuration: `eas build:configure`

**Problem:** Build takes too long
- **Solution:** Normal - first build can take 20-30 minutes
- **Solution:** Subsequent builds are faster (~15 minutes)

### Installation Issues

**Problem:** Can't install on device
- **Solution:** Device must be registered with Apple Developer account
- **Solution:** Use internal distribution (automatic with demo profile)
- **Solution:** Check device UDID is registered in Expo dashboard

**Problem:** "Untrusted Developer" warning
- **Solution:** Settings → General → VPN & Device Management
- **Solution:** Trust the developer certificate
- **Solution:** Try installing again

### Demo Mode Issues

**Problem:** Showing real data instead of mock data
- **Solution:** Verify you built with `--profile demo`
- **Solution:** Check build logs for `EXPO_PUBLIC_DEMO_MODE=true`
- **Solution:** Rebuild if needed

**Problem:** Same merchant every time
- **Solution:** This shouldn't happen - each trigger randomizes
- **Solution:** Check `lib/demo-data.ts` implementation
- **Solution:** File bug report if persists

---

## Developer Notes

### Architecture

**Files Modified:**
- `lib/demo-data.ts` - Mock transaction generator (NEW)
- `lib/deep-link.ts` - Demo mode integration
- `eas.json` - Demo build profile
- `.env.demo` - Demo environment config

**Code Flow:**
```
1. User/shortcut triggers: maximile://log
2. parseAutoCaptureUrl() called in lib/deep-link.ts
3. Checks: isDemoMode() from lib/demo-data.ts
4. If true: injectMockData() called
5. generateMockTransaction() creates realistic data
6. Returns AutoCaptureParams with isDemo: true flag
```

### Testing Demo Mode Locally

```bash
# Option 1: Environment variable
EXPO_PUBLIC_DEMO_MODE=true npx expo start

# Option 2: Local iOS build
npx expo run:ios
# Then manually set .env.demo as active
```

### Extending Mock Data

To add more merchants, edit `lib/demo-data.ts`:

```typescript
const MERCHANTS: MerchantData[] = [
  // Add new merchant
  {
    name: 'Your Merchant',
    category: 'Category',
    minAmount: 10.00,
    maxAmount: 50.00
  },
  // ... existing merchants
];
```

---

## Distribution

### Sharing Demo Build

**Method 1: QR Code**
1. After build completes, save QR code
2. Share QR code image with team
3. Team scans → Installs app

**Method 2: Link**
1. Copy build URL from EAS dashboard
2. Share link via email/Slack
3. Recipients open on device → Install

**Method 3: EAS Dashboard Invite**
1. Go to https://expo.dev
2. Project → Builds → Share build
3. Invite team members by email

### Updating Demo Build

```bash
# Make code changes
# Commit to git
# Build new demo version
eas build --profile demo --platform ios

# New build link generated
# Share updated link with team
```

---

## Best Practices

### For Presenters

✅ **Do:**
- Build demo version 1 day before presentation
- Test the flow at least once before demo
- Have backup: show screenshots if technical issues
- Explain "this is demo mode" to audience
- Keep demo device charged

❌ **Don't:**
- Use production build for demos (won't work without real purchases)
- Demo without testing first
- Assume shortcut works without setup
- Make real purchases during demo

### For Developers

✅ **Do:**
- Use feature branches for demo mode changes
- Test both demo and production builds
- Keep mock data realistic and varied
- Document any new merchants added
- Version demo builds (track which build is live)

❌ **Don't:**
- Accidentally enable demo mode in production
- Commit `.env` files with secrets
- Hardcode demo mode (use environment variable)
- Skip testing production builds

---

## FAQ

**Q: Do demo transactions save to the database?**
A: No, currently demo transactions still go through the normal save flow. Future enhancement could skip DB saves in demo mode.

**Q: Can I use demo mode in Expo Go?**
A: No, custom URL schemes don't work in Expo Go. You must use EAS Build.

**Q: How many devices can install the demo build?**
A: Up to 100 devices (Apple developer account limit for internal distribution).

**Q: Do I need TestFlight for demos?**
A: No! EAS Build internal distribution is simpler and faster for demos.

**Q: Can I customize which merchants appear?**
A: Yes, edit `lib/demo-data.ts` and rebuild.

**Q: Does demo mode work on Android?**
A: Yes, same setup. Use: `eas build --profile demo --platform android`

---

## Support

**Issues or Questions:**
- File issue: [GitHub Issues](https://github.com/your-repo/issues)
- Team Slack: #maximile-dev
- Documentation: This file

**Build Problems:**
- Check EAS Status: https://status.expo.dev
- EAS Docs: https://docs.expo.dev/build/introduction/

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-02-21 | Initial demo mode implementation |

---

**Status:** ✅ Demo mode fully functional and ready for use!
