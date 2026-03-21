# MaxiMile — Know which card to tap. Every time.

MaxiMile tells you which credit card earns the most miles for any purchase — in under 10 seconds — and tracks your monthly bonus caps so you never accidentally earn at the base rate.

Built for Singapore credit card holders juggling multiple miles cards.

> IS622 Digital Product Management — Group Project Prototype

---

## Live Links

| | URL |
|---|---|
| **Landing Page** | https://jnctan0913.github.io/MaxiMile-App/ |
| **Admin Dashboard** | https://jnctan0913.github.io/MaxiMile-App/admin/ |

---

## Evaluator Access

### Web App (Prototype)

Sign up for a free account at the landing page to access the prototype. Registration takes under a minute — just an email and password, no payment required.

**Key flows to evaluate:**
1. **Merchant Search** — type any merchant name (e.g. a café or supermarket) in the search bar → instant card recommendation
2. **Category Tap** — tap "Dining" or "Bills" → see best card with cap remaining
3. **⚡ Quick Pick** — tap the gold FAB button for a GPS-based merchant detection
4. **My Cards** tab — see cap usage bars per card (alerts when >80% spent)
5. **Miles** tab — see loyalty program balances

### Admin Dashboard

URL: **https://jnctan0913.github.io/MaxiMile-App/admin/**

No login required (service role access). Shows:
- **Community** — user-submitted card rule corrections
- **AI Detections** — auto-captured merchant MCC classifications
- **Pipeline Health** — data freshness indicators
- **Analytics** — MARU (North Star), funnels, feature adoption, retention cohorts

---

## iOS vs Android / Browser Notes

The prototype runs as a web app (PWA). Behaviour differs slightly between platforms:

| Feature | iOS Safari | Android Chrome |
|---|---|---|
| Install to home screen | Share → Add to Home Screen | Menu → Install App |
| Swipe to edit/delete transactions | Swipe left works natively | Swipe left works natively |
| Input zoom on focus | Fixed (font size ≥ 16px) | Not affected |
| Push notifications | Requires iOS 16.4+ + home screen install | Works natively |

**For evaluation:** Chrome on desktop or Android gives the fullest experience. All core features work on iOS Safari; swipe-to-edit requires long-press.

---

## Repository Structure

```
.
├── index.html               # Landing page (deployed to GitHub Pages root)
├── faq.html                 # FAQ page
├── maximile-app/
│   ├── app/                 # Screen routes (Expo Router)
│   │   ├── (tabs)/          # Main tab navigation
│   │   │   ├── index.tsx    # Recommend — Flash Pay + Quick Pick
│   │   │   ├── cards.tsx    # My Cards — cap tracking
│   │   │   ├── miles.tsx    # Miles Portfolio
│   │   │   ├── log.tsx      # Log Transaction
│   │   │   └── profile.tsx  # Profile & Settings
│   │   ├── (auth)/          # Login / Signup / Forgot Password
│   │   ├── recommend/       # Card recommendation screens
│   │   ├── bills-subcategory.tsx  # Bills subcategory picker
│   │   └── earning-insights.tsx   # Earning insights
│   ├── components/          # Reusable UI components
│   ├── lib/                 # Business logic & Supabase client
│   ├── hooks/               # Custom React hooks
│   ├── assets/              # Images, icons, card artwork
│   ├── screenshots/         # App screenshots (used in landing page)
│   └── admin-dashboard/     # Vite + React admin dashboard
└── .github/workflows/       # GitHub Actions — deploy to Pages
```

## Simulator Setup Guide

See **[TEAMMATE_GUIDE.md](./TEAMMATE_GUIDE.md)** for full setup instructions to run the prototype locally on a simulator or physical device.

**TL;DR:**
```bash
cd maximile-app
npm install
```
Create `maximile-app/.env`:
```bash
EXPO_PUBLIC_SUPABASE_URL=https://piwoavkasfjqmrabplbl.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_XQeSilawJVtWnvMin063zQ_fLvLoD2L
```
```bash
npx expo start
```
- Press `i` to open in **iOS Simulator** (macOS + Xcode required)
- Press `a` to open in **Android Emulator** (Android Studio required)
- Press `w` for a **web preview** in your browser
- Scan the QR code with **Expo Go** to run on a physical device

## Tech Stack

- **Framework**: React Native with [Expo](https://expo.dev/) (SDK 54)
- **Routing**: [Expo Router](https://docs.expo.dev/router/introduction/) v6 (file-based)
- **Backend**: [Supabase](https://supabase.com/) (PostgreSQL + Auth + Edge Functions)
- **Language**: TypeScript
- **Testing**: Jest + React Native Testing Library
