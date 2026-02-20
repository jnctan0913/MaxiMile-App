# Teammate Guide — Running the MaxiMile Prototype

This guide walks you through setting up and running the MaxiMile prototype on your machine.

---

## Prerequisites

Before you start, make sure you have:

- **Node.js** (v18 or later) — [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Expo Go** app on your phone — [iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)

Optional:
- **iOS Simulator** (macOS only — requires Xcode)
- **Android Emulator** (requires Android Studio)

---

## Setup Steps

### 1. Clone the Repository

```bash
git clone <REPO_URL>
cd Product_Management_Assignment
```

### 2. Install Dependencies

```bash
cd maximile-app
npm install
```

### 3. Environment Variables

Create a `.env` file in the `maximile-app/` directory with these values:

```bash
# maximile-app/.env
EXPO_PUBLIC_SUPABASE_URL=https://piwoavkasfjqmrabplbl.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_XQeSilawJVtWnvMin063zQ_fLvLoD2L
```

> These are the public client credentials for the shared Supabase project. The `.env` file is git-ignored, so you need to create it manually — just copy-paste the two lines above.

### 4. Start the Dev Server

```bash
npx expo start
```

This will display a QR code in your terminal.

---

## Running the App

### Option A: On Your Phone (Recommended)

1. Open **Expo Go** on your phone
2. Scan the QR code shown in the terminal
3. The app will load on your device

> Make sure your phone and computer are on the **same Wi-Fi network**.

### Option B: Web Preview

Press `w` in the terminal after `npx expo start` to open a web preview in your browser.

> Note: Some native features (location, secure storage) may not work in the web preview. The phone experience is more representative.

### Option C: iOS Simulator (macOS only)

Press `i` in the terminal to open in the iOS Simulator (requires Xcode).

### Option D: Android Emulator

Press `a` in the terminal to open in the Android Emulator (requires Android Studio setup).

---

## Navigating the Prototype

The app has 5 main tabs:

| Tab | What it does |
|-----|-------------|
| **Home (Smart Pay)** | Shows the recommended card for your current purchase based on merchant category and remaining bonus caps |
| **Cards** | View and manage your credit card portfolio with earn rates and details |
| **Miles** | Track your total miles across all cards and programs |
| **Caps** | Monitor bonus category spending caps and remaining limits |
| **Log** | View your transaction history |

Additional screens accessible from the tabs:
- **Earning Insights** — Analytics dashboard showing miles optimization performance
- **Card Recommendations** — Detailed card comparison for a specific purchase
- **Profile & Settings** — Account management

---

## Reviewing the PM Documentation

All product management deliverables are in the `docs/` folder at the repository root. These document the full PM process from discovery to sprint planning:

```
docs/
├── DISCOVERY.md              # Problem discovery & validation
├── MARKET_RESEARCH.md        # Market analysis (TAM/SAM/SOM)
├── COMPETITIVE_LANDSCAPE.md  # Competitor analysis
├── CUSTOMER_SURVEY.md        # User research & surveys
├── PRD.md                    # Product Requirements Document
├── DRD_MILES_PORTFOLIO.md    # Design Requirements Document
├── EPICS_AND_USER_STORIES.md # User stories & acceptance criteria
├── SPRINT_PLAN.md            # Sprint backlog & planning
└── SPRINT_EARNING_INSIGHTS.md # Feature sprint details
```

**Recommended**: Start with `DISCOVERY.md` for context, then read `PRD.md` for the full product spec.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `npx expo start` fails | Make sure you're in the `maximile-app/` directory and ran `npm install` |
| QR code won't scan | Ensure phone and computer are on the same Wi-Fi. Try pressing `s` to switch to Expo Go mode |
| "Network request failed" errors | The `.env` file may be missing or have incorrect Supabase credentials |
| App shows blank screen | Try shaking your phone to open the Expo dev menu, then tap "Reload" |
| `node_modules` issues | Delete `node_modules` and `package-lock.json`, then run `npm install` again |
| Web preview not working | Some native features require a phone. Try running on Expo Go instead |

---

## Questions?

Reach out to the project owner for:
- `.env` credentials (Supabase URL and anon key)
- Context on specific features or design decisions
- Access to the Supabase dashboard
