# MaxiMile — Credit Card Miles Optimizer

A product management class project for a context-aware mobile app that helps Singapore professionals maximize airline miles from credit card spending.

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
