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
├── docs/                    # Product management deliverables
│   ├── PRD.md               # Product Requirements Document
│   ├── DISCOVERY.md         # Problem discovery & validation
│   ├── MARKET_RESEARCH.md   # Market analysis & sizing
│   ├── COMPETITIVE_LANDSCAPE.md  # Competitor analysis
│   ├── CUSTOMER_SURVEY.md   # User research & survey design
│   ├── DRD_MILES_PORTFOLIO.md    # Design Requirements Document
│   ├── EPICS_AND_USER_STORIES.md # Epics & user stories
│   ├── SPRINT_PLAN.md       # Sprint planning & backlog
│   └── SPRINT_EARNING_INSIGHTS.md # Earning insights sprint
│
└── maximile-app/            # React Native prototype (Expo)
    ├── app/                 # Screen routes (Expo Router)
    │   ├── (tabs)/          # Main tab navigation
    │   │   ├── index.tsx    # Home — Smart Pay recommendations
    │   │   ├── cards.tsx    # My Cards management
    │   │   ├── miles.tsx    # Miles Portfolio tracker
    │   │   ├── caps.tsx     # Bonus Cap tracker
    │   │   ├── log.tsx      # Transaction log
    │   │   └── profile.tsx  # User profile & settings
    │   ├── (auth)/          # Auth screens (login/signup)
    │   ├── pay/             # Smart Pay flow
    │   ├── card/            # Card detail views
    │   ├── recommend/       # Card recommendation screens
    │   ├── miles/           # Miles detail views
    │   └── earning-insights.tsx  # Earning insights dashboard
    ├── components/          # Reusable UI components
    ├── lib/                 # Business logic & utilities
    ├── database/            # Supabase schema, migrations & seeds
    ├── contexts/            # React context providers
    ├── hooks/               # Custom React hooks
    ├── constants/           # App constants & theme
    ├── assets/              # Images, icons, fonts
    └── tests/               # Test suites
```

## Quick Start

See **[TEAMMATE_GUIDE.md](./TEAMMATE_GUIDE.md)** for full setup instructions to run the prototype locally.

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
Then scan the QR code with **Expo Go** on your phone (or press `w` for web preview).

## Product Documentation

All PM deliverables are in the [`docs/`](./docs/) folder. Recommended reading order:

| # | Document | What it covers |
|---|----------|----------------|
| 1 | [DISCOVERY.md](./docs/DISCOVERY.md) | Problem statement, user personas, jobs-to-be-done |
| 2 | [MARKET_RESEARCH.md](./docs/MARKET_RESEARCH.md) | Market sizing, trends, opportunity analysis |
| 3 | [COMPETITIVE_LANDSCAPE.md](./docs/COMPETITIVE_LANDSCAPE.md) | Competitor teardown & positioning |
| 4 | [CUSTOMER_SURVEY.md](./docs/CUSTOMER_SURVEY.md) | Survey design & user research insights |
| 5 | [PRD.md](./docs/PRD.md) | Full product requirements document |
| 6 | [DRD_MILES_PORTFOLIO.md](./docs/DRD_MILES_PORTFOLIO.md) | UI/UX design requirements & specs |
| 7 | [EPICS_AND_USER_STORIES.md](./docs/EPICS_AND_USER_STORIES.md) | Epics, stories, acceptance criteria |
| 8 | [SPRINT_PLAN.md](./docs/SPRINT_PLAN.md) | Sprint planning, backlog, velocity |
| 9 | [SPRINT_EARNING_INSIGHTS.md](./docs/SPRINT_EARNING_INSIGHTS.md) | Earning insights feature sprint |

## Tech Stack

- **Framework**: React Native with [Expo](https://expo.dev/) (SDK 54)
- **Routing**: [Expo Router](https://docs.expo.dev/router/introduction/) v6 (file-based)
- **Backend**: [Supabase](https://supabase.com/) (PostgreSQL + Auth + Edge Functions)
- **Language**: TypeScript
- **Testing**: Jest + React Native Testing Library
