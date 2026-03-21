# Simulator Setup Guide — MaxiMile Prototype

This guide walks you through running the MaxiMile prototype on a simulator or physical device.

---

## Prerequisites

| Tool | Required for |
|---|---|
| **Node.js v18+** | Running the dev server — [Download](https://nodejs.org/) |
| **Expo Go** (phone) | Physical device testing — [iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent) |
| **Xcode** (macOS) | iOS Simulator |
| **Android Studio** | Android Emulator |

---

## Setup

### 1. Install dependencies

```bash
cd maximile-app
npm install
```

### 2. Create the environment file

Create `maximile-app/.env` with the following:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://piwoavkasfjqmrabplbl.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_XQeSilawJVtWnvMin063zQ_fLvLoD2L
```

> This file is git-ignored — you must create it manually.

### 3. Start the dev server

```bash
npx expo start
```

---

## Running Options

| Option | Command | Notes |
|---|---|---|
| **iOS Simulator** | Press `i` | macOS only, requires Xcode |
| **Android Emulator** | Press `a` | Requires Android Studio |
| **Web browser** | Press `w` | Some native features limited |
| **Physical device** | Scan QR code | Requires Expo Go app |

> For physical device: make sure your phone and computer are on the **same Wi-Fi network**.

---

## App Navigation

| Tab | What it does |
|---|---|
| **Recommend** | Search by merchant or tap a category to get the best card instantly. Tap **⚡ Quick Pick** for GPS-based detection |
| **My Cards** | View cap usage per card — alerts when approaching monthly bonus cap |
| **Transactions** | Full transaction history — swipe left to edit or delete |
| **Log** | Manually log a transaction with category and card |
| **Miles** | Track your loyalty program balances across all airline programs |

---

## iOS vs Android Notes

| Feature | iOS | Android |
|---|---|---|
| Install to home screen | Share → Add to Home Screen | Menu → Install App |
| Swipe to edit/delete | Swipe left works natively | Swipe left works natively |
| Push notifications | Requires iOS 16.4+ + home screen install | Works natively |

---

## Troubleshooting

| Issue | Fix |
|---|---|
| `npx expo start` fails | Make sure you're in `maximile-app/` and ran `npm install` |
| QR code won't scan | Ensure phone and laptop are on the same Wi-Fi. Press `s` to switch to Expo Go mode |
| "Network request failed" | Check that `.env` exists with the correct Supabase credentials |
| Blank screen | Shake device to open dev menu → Reload |
| `node_modules` issues | Delete `node_modules` and run `npm install` again |

---

## Questions?

Contact the project owner for Supabase dashboard access or context on specific features.
