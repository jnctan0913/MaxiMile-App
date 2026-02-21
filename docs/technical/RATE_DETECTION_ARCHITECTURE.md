# Rate Change Detection Architecture

> **Feature**: F23 — Rate Change Monitoring & Alerts
> **Version**: 1.0 (Planning)
> **Date**: 2026-02-21
> **Status**: Proposed — awaiting implementation approval
> **Authors**: PM Agent, Software Engineer, AI Engineer, Data Engineer (coordinated by Orchestrator)

---

## Table of Contents

1. [Problem Statement](#1-problem-statement)
2. [Three-Layer Architecture](#2-three-layer-architecture)
3. [Gap Analysis](#3-gap-analysis)
4. [Phased Roadmap](#4-phased-roadmap)
5. [Cross-Agent Consensus](#5-cross-agent-consensus)
6. [Phase Details](#6-phase-details)
   - [v1.0 — Manual Entry (Shipped)](#v10--manual-entry-shipped)
   - [v1.5 — Community Submissions](#v15--community-submissions)
   - [v2.0 — Automated Detection](#v20--automated-detection)
   - [v2.5 — Push Notifications](#v25--push-notifications)
   - [v3.0 — Predictive Intelligence](#v30--predictive-intelligence)
7. [Technical Architecture](#7-technical-architecture)
   - [AI/ML Pipeline](#aiml-pipeline)
   - [Data Pipeline](#data-pipeline)
   - [Infrastructure](#infrastructure)
   - [Database Schema (Migration 017)](#database-schema-migration-017)
8. [Cost Analysis](#8-cost-analysis)
9. [Build vs Buy](#9-build-vs-buy)
10. [Risks & Mitigations](#10-risks--mitigations)
11. [Success Metrics](#11-success-metrics)
12. [Open Questions](#12-open-questions)

---

## 1. Problem Statement

MaxiMile's rate change monitoring system has three layers:

| Layer | Function | Status |
|-------|----------|--------|
| **Layer 1: Detection** | How we *learn* about rate/benefit changes | **Not solved** — manual admin SQL inserts |
| **Layer 2: Processing** | How we *store and query* changes | Solved — `rate_changes` table, 2 RPCs |
| **Layer 3: Delivery** | How we *show* changes to users | Solved — `RateChangeBanner` + `RateUpdatedBadge` |

**The gap**: Layer 2 and 3 are production-ready, but Layer 1 relies on an admin manually writing SQL INSERT statements whenever a bank changes its credit card terms. This approach:

- Doesn't scale beyond ~10 banks / ~30 cards
- Has unpredictable latency (days to weeks before admin notices a change)
- Creates a single point of failure (one person must monitor all banks)
- Has zero coverage of changes that aren't publicly discussed in forums

**Goal**: Build automated detection that keeps the `rate_changes` table current without manual intervention, while maintaining the high data quality that users trust.

---

## 2. Three-Layer Architecture

```
┌─────────────────────────────────────────────────────┐
│                   LAYER 3: DELIVERY                 │
│  RateChangeBanner (home) + RateUpdatedBadge (card)  │
│  Portfolio-filtered via get_user_rate_changes RPC    │
│  Status: ✅ SHIPPED (Sprint 12)                     │
└──────────────────────┬──────────────────────────────┘
                       │ reads from
┌──────────────────────▼──────────────────────────────┐
│                  LAYER 2: PROCESSING                │
│  rate_changes table (5 change types, 3 severities)  │
│  user_alert_reads table (dismiss tracking)          │
│  get_user_rate_changes + get_card_rate_changes RPCs │
│  Status: ✅ SHIPPED (Sprint 12)                     │
└──────────────────────┬──────────────────────────────┘
                       │ writes to
┌──────────────────────▼──────────────────────────────┐
│                  LAYER 1: DETECTION                 │
│  ┌─────────┐  ┌──────────┐  ┌────────────────────┐ │
│  │ Manual  │  │Community │  │ Automated Scraping │ │
│  │ Admin   │  │Submission│  │ + AI Classification│ │
│  │ (v1.0)  │  │ (v1.5)   │  │ (v2.0)             │ │
│  └─────────┘  └──────────┘  └────────────────────┘ │
│  Status: 🔄 PLANNED                                │
└─────────────────────────────────────────────────────┘
```

---

## 3. Gap Analysis

### What Exists (Sprint 12 Shipped)

| Component | Details |
|-----------|---------|
| `rate_changes` table | 5 enum change types (`earn_rate`, `cap_change`, `devaluation`, `partner_change`, `fee_change`), 3 severity levels (`info`, `warning`, `critical`) |
| `user_alert_reads` table | Per-user alert dismissal tracking with unique constraint |
| `get_user_rate_changes(UUID)` RPC | Portfolio-filtered, unread, last 90 days, severity-sorted |
| `get_card_rate_changes(UUID)` RPC | All changes for a card, last 90 days |
| `RateChangeBanner` component | 3 severity variants, single/multi-alert, dismiss + navigate |
| `RateUpdatedBadge` component | Gold pill, expandable detail card |
| Seed data | 5 historical rate changes covering real 2025-2026 SG market events |
| RLS policies | Authenticated users can read rate_changes; own-only for alert_reads |

### What's Missing

| Gap | Impact |
|-----|--------|
| No detection source tracking | Can't distinguish manual vs community vs automated entries |
| No community submission flow | Users can't report changes they discover |
| No web scraping infrastructure | Can't monitor bank T&C pages automatically |
| No AI classification pipeline | Can't extract structured rate changes from unstructured text |
| No admin review dashboard | Admin must use raw SQL to verify and approve changes |
| No deduplication logic | Risk of duplicate alerts from multiple sources |
| No source health monitoring | No visibility into scraper reliability |

---

## 4. Phased Roadmap

| Phase | Name | RICE Score | Effort | Timeline | Key Deliverable |
|-------|------|------------|--------|----------|-----------------|
| **v1.0** | Manual Admin Entry | — | — | ✅ Shipped | SQL migrations for rate changes |
| **v1.5** | Community Submissions | **2560** | Low (2 sprints) | Next | User submission form + admin verification queue |
| **v2.0** | Automated Monitoring | **1750** | Medium (3 sprints) | +6 weeks | Bank page scraping + Claude Haiku classification |
| **v2.5** | Push Notifications | **2267** | Low (1 sprint) | +2 weeks | Expo push via Supabase webhooks |
| **v3.0** | Predictive Intelligence | **133** | High (4 sprints) | Future | Trend analysis, proactive recommendations |

### Why v1.5 First (Not v2.0)

1. **Highest RICE score** (2560 vs 1750) — lower effort, strong reach
2. **Validates demand** — if users don't submit changes, automated scraping may be premature
3. **Builds community** — positions MaxiMile as a community hub, not just a tool
4. **Zero infrastructure cost** — uses existing Supabase (no new hosting)
5. **Legal simplicity** — no web scraping concerns; user-generated content
6. **Seeds training data** — community submissions become labeled examples for v2.0 AI

---

## 5. Cross-Agent Consensus

| Decision Area | PM | SWE | AI Eng | Data Eng | Consensus |
|---------------|-----|------|---------|----------|-----------|
| Next phase | v1.5 Community | v1.5 Community | v1.5 Community | v1.5 Community | **Unanimous: v1.5** |
| AI approach | Hybrid hash+LLM | Content-hash + LLM | Hash gating + Haiku | Hash + structured extraction | **Hybrid: hash gate + Claude Haiku** |
| Infra (v2.0) | Keep costs <$15/mo | Railway + Edge Functions | API-first (no self-hosted models) | Supabase-native where possible | **Railway ($7) + Supabase Edge + Vercel** |
| Confidence routing | Admin review for low-confidence | Review queue + auto-approve | ≥0.85 auto, 0.5-0.69 escalate | Auto-approve Tier 1 sources | **Tiered: auto/escalate/discard** |
| Dedup strategy | Prevent user confusion | Fingerprint-based | Semantic similarity check | SHA-256 fingerprint | **SHA-256 of (card+type+value+month)** |
| Schema additions | detection_source column | 6 new tables | prompt_log table | 7 tables + 3 views | **Migration 017: 7 tables + views** |

---

## 6. Phase Details

### v1.0 — Manual Entry (Shipped)

**Current state.** Admin writes SQL INSERT statements in migration files. 5 seed records exist covering real market events:

1. DBS Woman's World Card — cap reduction (warning)
2. Amex MR → KrisFlyer — transfer rate devaluation (critical)
3. HSBC Revolution — bonus cap increase (info)
4. BOC Elite Miles — dining rate cut (warning)
5. Maybank Horizon — annual fee increase (info)

**Limitations**: Requires SQL knowledge, no audit trail of who entered what, no verification step, zero scalability.

---

### v1.5 — Community Submissions

**Goal**: Let users report rate changes they discover, with admin verification before publishing.

#### User Flow

```
User discovers change → Opens "Report a Change" form → Fills structured fields
    → Submission saved as "pending" → Admin reviews in dashboard
    → Admin approves/rejects/edits → If approved, inserted into rate_changes
    → All portfolio-matched users see banner/badge
```

#### Product Requirements (PM Agent)

| Requirement | Details |
|-------------|---------|
| **Submission form** | Card selector, change type picker, old/new value fields, optional source URL, optional screenshot |
| **Submission status** | `pending` → `under_review` → `approved` / `rejected` / `merged` |
| **Admin dashboard** | List pending submissions, approve/reject/edit, bulk actions |
| **Gamification** | Contributor count badge, "Verified Contributor" status after 3+ approved submissions |
| **Anti-spam** | Rate limit: max 5 submissions/day/user, require email verification |
| **Dedup** | Auto-detect if a submission matches an existing rate_change (fuzzy match on card + type + date range) |

#### User Stories

| ID | Story | Points |
|----|-------|--------|
| S13.1 | As a user, I can report a rate change I discovered so the community benefits | 5 |
| S13.2 | As a user, I can attach a screenshot or link as evidence for my submission | 3 |
| S13.3 | As an admin, I can review pending submissions and approve/reject them | 5 |
| S13.4 | As an admin, I can edit a submission before approving to fix inaccuracies | 3 |
| S13.5 | As a user, I can see my submission history and statuses | 2 |
| S13.6 | As a user, I see a "Verified Contributor" badge after 3+ approved submissions | 2 |

---

### v2.0 — Automated Detection

**Goal**: Monitor bank T&C pages and use AI to detect and classify rate changes.

#### Detection Pipeline

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  SCHEDULER   │───▶│  SCRAPER     │───▶│  DIFF ENGINE │───▶│  CLASSIFIER  │
│  (pg_cron)   │    │  (Playwright)│    │  (SHA-256)   │    │  (Claude AI) │
│  Daily 2am   │    │  Fetch HTML  │    │  Hash compare│    │  Haiku/Sonnet│
└──────────────┘    └──────────────┘    └──────────────┘    └──────┬───────┘
                                                                   │
                    ┌──────────────┐    ┌──────────────┐           │
                    │  PUBLISHED   │◀───│  REVIEW      │◀──────────┘
                    │  rate_changes│    │  QUEUE       │
                    │  table       │    │  (confidence) │
                    └──────────────┘    └──────────────┘
```

#### AI/ML Pipeline (AI Engineer)

**Recommended approach**: Hybrid content-hash gating + Claude Haiku classification.

| Stage | Method | Cost |
|-------|--------|------|
| **1. Fetch** | Playwright (JS-rendered) or HTTP (static) | $0 (self-hosted) |
| **2. Diff** | SHA-256 hash comparison of page content | $0 |
| **3. Classify** | Claude Haiku via tool_use structured output | ~$0.008/call |
| **4. Route** | Confidence-based: auto-approve / escalate / discard | $0 |

**Why Haiku over fine-tuned models**:
- No training data collection needed (cold-start friendly)
- Few-shot prompting with existing 5 seed records as examples
- Structured output via `tool_use` ensures schema compliance
- $0.25/1M input tokens, $1.25/1M output tokens — negligible for ~30-75 calls/month

**Confidence routing thresholds**:

| Confidence | Action | Estimated % |
|------------|--------|-------------|
| ≥ 0.85 | Auto-approve (Tier 1-2 sources only) | ~60% |
| 0.70 – 0.84 | Auto-approve with admin notification | ~20% |
| 0.50 – 0.69 | Escalate to Claude Sonnet for re-analysis | ~15% |
| < 0.50 | Discard (log for review) | ~5% |

**Prompt design** (AI Engineer):

```
System: You are a Singapore credit card rate change detector.
Given a before/after snapshot of a bank's T&C page, identify
any changes to: earn rates, spending caps, transfer ratios,
partner programs, or annual fees.

Output using the provided tool schema. If no relevant change
is detected, return {"changes": []}.

Few-shot examples: [5 seed records from Migration 015]
```

**Tool schema** (enforces `rate_changes` table structure):

```json
{
  "name": "record_rate_change",
  "parameters": {
    "card_name": "string",
    "change_type": "earn_rate|cap_change|devaluation|partner_change|fee_change",
    "category": "string|null",
    "old_value": "string",
    "new_value": "string",
    "effective_date": "YYYY-MM-DD",
    "alert_title": "string (max 60 chars)",
    "alert_body": "string (max 300 chars)",
    "severity": "info|warning|critical",
    "confidence": "number 0-1"
  }
}
```

#### Monitored Sources (SWE Agent)

| Source Type | Examples | Scrape Method | Frequency |
|-------------|----------|---------------|-----------|
| Bank T&C pages | DBS, OCBC, UOB, Citi, HSBC, SCB, Maybank, BOC, POSB | Playwright (JS-rendered) | Daily |
| Bank announcement pages | News/updates sections | HTTP + cheerio | Daily |
| MAS regulatory filings | mas.gov.sg | HTTP | Weekly |
| Community forums | HardwareZone, Reddit r/singaporefi | HTTP | 6-hourly |
| Bank email newsletters | Forwarded by admin | Email parser | On-receive |

**Total estimated sources**: 30-50 URLs across 9 banks.

---

### v2.5 — Push Notifications

**Goal**: Alert users instantly when a critical rate change affects their portfolio.

| Component | Approach |
|-----------|----------|
| Push infrastructure | Expo Push Notifications (free tier: unlimited) |
| Trigger | Supabase webhook on `rate_changes` INSERT where severity = 'critical' |
| Targeting | Portfolio-filtered — only notify users who hold the affected card |
| User preference | Settings screen: toggle push per severity level |
| Rate limiting | Max 1 push per card per day |

---

### v3.0 — Predictive Intelligence

**Goal**: Predict upcoming rate changes based on patterns and market signals.

| Signal | Example |
|--------|---------|
| Seasonal patterns | Annual fee reviews typically in Q1 |
| Competitor moves | If DBS cuts dining rate, OCBC may follow |
| Regulatory signals | MAS circulars on interchange fees |
| Historical trends | Cards that haven't changed in 2+ years are overdue |

**Deferred** — requires 12+ months of detection data to train meaningful models.

---

## 7. Technical Architecture

### Infrastructure

```
┌─────────────────────────────────────────────────────────┐
│              GITHUB ACTIONS (Free — Public Repo)        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Cron Trigger │  │  Playwright  │  │  Gemini API  │  │
│  │ (daily 6am)  │──▶  Scraper     │──▶  Classifier  │  │
│  └──────────────┘  │  (50 URLs)   │  │  (free tier)  │  │
│                    └──────────────┘  └──────┬───────┘  │
└─────────────────────────────────────────────┼──────────┘
                                              │ writes via
                                              │ Supabase client
┌─────────────────────────────────────────────▼──────────┐
│                    SUPABASE (Free Tier)                  │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  PostgreSQL  │  │ Edge Functions│  │   Storage     │  │
│  │  (all tables)│  │ (processing) │  │  (snapshots)  │  │
│  │  + pg_cron   │  │              │  │               │  │
│  └─────────────┘  └──────────────┘  └───────────────┘  │
└─────────────────────────────────────────────────────────┘
         ▲                                     ▲
         │                                     │
    ┌────┴────────────┐              ┌─────────┴─────┐
    │ Cloudflare Pages│              │  Groq (free)  │
    │ Admin Dashboard │              │  LLM fallback │
    │ ($0, unlimited) │              │  if Gemini ↓  │
    └─────────────────┘              └───────────────┘
```

| Component | Service | Tier | Monthly Cost |
|-----------|---------|------|-------------|
| Database + Auth | Supabase | Free (500 MB, 50K MAU) | $0 |
| Edge Functions (processing) | Supabase | Free (500K invocations) | $0 |
| Object Storage (snapshots) | Supabase | Free (1 GB) | $0 |
| Scheduler + Scraper | GitHub Actions | Free (public repo: unlimited) | $0 |
| AI Classification (primary) | Google Gemini 2.5 Flash | Free (250 req/day) | $0 |
| AI Classification (fallback) | Groq Llama 3.3 70B | Free (1,000 req/day) | $0 |
| Admin Dashboard | Cloudflare Pages | Free (unlimited bandwidth) | $0 |
| **Total** | | | **$0/mo** |

### Data Pipeline (Data Engineer)

#### Migration 017 — Proposed Schema

**New enums:**

```sql
CREATE TYPE source_type AS ENUM ('bank_tc_page', 'bank_announcement', 'regulatory', 'community_forum', 'email', 'community_submission');
CREATE TYPE source_status AS ENUM ('active', 'paused', 'broken', 'retired');
CREATE TYPE detected_change_status AS ENUM ('detected', 'confirmed', 'rejected', 'published', 'duplicate');
CREATE TYPE submission_status AS ENUM ('pending', 'under_review', 'approved', 'rejected', 'merged');
CREATE TYPE pipeline_stage AS ENUM ('fetch', 'diff', 'classify', 'review', 'publish');
CREATE TYPE pipeline_run_status AS ENUM ('running', 'completed', 'failed', 'partial');
```

**New tables:**

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `source_configs` | Registry of monitored URLs | url, source_type, bank_name, scrape_method, check_interval, css_selector |
| `source_snapshots` | Point-in-time page captures | source_config_id, content_hash (SHA-256), raw_content, snapshot_at |
| `detected_changes` | AI-detected changes awaiting review | source_snapshot_id, card_id, change_type, confidence, status, reviewer_notes |
| `community_submissions` | User-reported changes | user_id, card_id, change_type, old_value, new_value, evidence_url, screenshot_path, status |
| `pipeline_runs` | Execution log for monitoring | stage, status, sources_checked, changes_detected, errors, duration_ms |
| `admin_users` | Admin role tracking | user_id, role, permissions |

**Additions to existing tables:**

```sql
ALTER TABLE rate_changes ADD COLUMN detection_source TEXT DEFAULT 'manual';
-- Values: 'manual', 'community', 'automated', 'escalated'
```

**Helper functions:**

| Function | Purpose |
|----------|---------|
| `fn_compute_content_hash(TEXT)` | SHA-256 hash for change detection |
| `fn_compute_dedup_fingerprint(UUID, TEXT, TEXT, DATE)` | Dedup key: card + type + value + month |
| `fn_get_sources_due_for_check()` | Returns sources past their check_interval |
| `fn_auto_approve_detected_change(UUID)` | Publishes high-confidence changes to rate_changes |
| `fn_suggest_severity(TEXT, TEXT, TEXT)` | Heuristic severity based on change_type + direction |
| `fn_cleanup_old_snapshots()` | Retains latest 30 snapshots per source |

**Views:**

| View | Purpose |
|------|---------|
| `v_pipeline_health` | Source uptime, last check, error rate |
| `v_review_queue` | Pending items (automated + community) sorted by confidence |
| `v_pipeline_run_summary` | Daily/weekly pipeline execution stats |

---

## 8. Cost Analysis

### Can This Be Done For Free? **Yes.**

Every component of the automated detection pipeline can run on free tiers. The original plan specified Railway ($7/mo) + Claude Haiku ($1-5/mo), but free alternatives exist for both.

### $0 Stack vs Original Plan

| Component | Original Plan | $0 Alternative | Free Tier Limits |
|-----------|--------------|-----------------|------------------|
| **Web Scraper** | Railway ($7/mo) | **GitHub Actions** (cron workflow) | Public repos: unlimited. Private: 2,000 min/mo. Native Playwright support, 6-hour timeout. |
| **AI Classification** | Claude Haiku ($1-5/mo) | **Google Gemini 2.5 Flash** (primary) + **Groq Llama 3.3 70B** (fallback) | Gemini: 250 req/day free, native JSON schema. Groq: 1,000 req/day free, JSON mode. |
| **Database** | Supabase Free ($0) | **Supabase Free** (no change) | 500 MB storage, 500K Edge Function invocations, pg_cron included. |
| **Storage** | Supabase Free ($0) | **Supabase Free** (no change) | 1 GB file storage. ~180 MB/year for snapshots. |
| **Scheduler** | pg_cron ($0) | **GitHub Actions cron** (built-in) | `schedule` trigger in workflow YAML. Runs daily at configurable time. |
| **Admin Dashboard** | Vercel Hobby ($0) | **Cloudflare Pages** | Unlimited bandwidth/requests, no commercial restriction, 500 builds/mo. |
| **Total** | **$8-12/mo** | **$0/mo** | |

### $0 Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│              GITHUB ACTIONS (Free — Public Repo)        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Cron Trigger │  │  Playwright  │  │  Gemini API  │  │
│  │ (daily 6am)  │──▶  Scraper     │──▶  Classifier  │  │
│  └──────────────┘  │  (50 URLs)   │  │  (free tier)  │  │
│                    └──────────────┘  └──────┬───────┘  │
└─────────────────────────────────────────────┼──────────┘
                                              │ writes via
                                              │ Supabase client
┌─────────────────────────────────────────────▼──────────┐
│                    SUPABASE (Free Tier)                  │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  PostgreSQL  │  │ Edge Functions│  │   Storage     │  │
│  │  (all tables)│  │ (processing) │  │  (snapshots)  │  │
│  │  + pg_cron   │  │              │  │               │  │
│  └─────────────┘  └──────────────┘  └───────────────┘  │
└─────────────────────────────────────────────────────────┘
         ▲                                     ▲
         │                                     │
    ┌────┴────────────┐              ┌─────────┴─────┐
    │ Cloudflare Pages│              │  Groq (free)  │
    │ Admin Dashboard │              │  LLM fallback │
    │ ($0, unlimited) │              │  if Gemini ↓  │
    └─────────────────┘              └───────────────┘
```

### Why GitHub Actions Is The Scraping MVP

| Factor | GitHub Actions | Railway ($7/mo) |
|--------|---------------|-----------------|
| Cost | $0 (public repo) | $7/mo |
| Playwright | Native (`ubuntu-latest` runner) | Docker container |
| Memory | 7 GB RAM | 512 MB (Starter) |
| Max runtime | 6 hours/job | Always-on (wasteful for daily cron) |
| Cron scheduling | Built-in (`schedule` trigger) | External trigger needed |
| Logs & monitoring | Built-in workflow logs | Separate logging setup |
| **Caveat** | Auto-disables after 60 days of no repo activity | None |

**Mitigation for the 60-day caveat**: The scraper itself commits updated content hashes to the repo daily (e.g., updating a `last_run.json` file), which counts as repo activity. Problem solved.

### Why Gemini Flash Over Claude Haiku

| Factor | Gemini 2.5 Flash (Free) | Claude Haiku ($0.25-1.25/MTok) |
|--------|------------------------|-------------------------------|
| Cost for 75 calls/mo | $0 | ~$1-5 |
| Free tier | 250 requests/day | None (pay-per-use) |
| Structured output | Native JSON schema enforcement | tool_use (excellent but paid) |
| Quality | Comparable for structured extraction | Slightly better reasoning |
| Fallback | Groq Llama 3.3 70B (also free) | N/A |

**Trade-off**: Claude Haiku produces marginally better structured output for financial text, but Gemini 2.5 Flash with JSON schema enforcement is more than adequate for detecting "old rate → new rate" changes. At $0 vs $1-5/mo, the quality difference doesn't justify the cost for a <100-calls/month workload.

### Cost Comparison Summary

| Scenario | Monthly Infra | Admin Time | Total |
|----------|--------------|------------|-------|
| **v1.0 Manual** (current) | $0 | ~$800 (2 hrs/wk) | **$800/mo** |
| **v2.0 Original Plan** (Railway + Claude) | $8-12 | ~$200 (30 min/wk) | **$208-212/mo** |
| **v2.0 Free Stack** (GH Actions + Gemini) | **$0** | ~$200 (30 min/wk) | **$200/mo** |

### Storage Budget (Supabase 500 MB Free Limit)

| Data | Size/Year | Notes |
|------|-----------|-------|
| Source snapshots (50 pages × daily) | ~180 MB | 10 KB avg per page snapshot |
| rate_changes records | < 1 MB | ~50-100 new records/year |
| community_submissions | < 1 MB | Even at 200 submissions/year |
| pipeline_runs logs | ~5 MB | Daily log entries |
| **Total projected** | **~186 MB/year** | Well within 500 MB limit |

**Cleanup strategy**: `fn_cleanup_old_snapshots()` retains only the latest 30 snapshots per source (~15 MB), keeping the DB lean indefinitely.

### Free Tier Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Google reduces Gemini free tier further | Medium | Low | Groq Llama 3.3 70B as immediate fallback (also free, 1000 RPD) |
| GitHub disables cron after 60 days inactivity | Low | Medium | Scraper auto-commits `last_run.json` → repo stays active |
| Supabase pauses project after 7 days inactivity | Low | Medium | Daily pipeline writes prevent inactivity |
| Supabase hits 500 MB storage limit | Low | Low | Snapshot cleanup function caps at ~15 MB; won't hit limit for years |
| GitHub Actions runners become slower/less reliable | Very Low | Low | Migrate to Railway ($7/mo) only if actually needed |

### Verdict

**The entire automated detection pipeline can run at $0/month indefinitely.** The only cost is admin review time (~30 min/week). If free-tier limits tighten in the future, the fallback to paid services costs only $8-12/month — still 98% cheaper than manual monitoring.

---

## 9. Build vs Buy

| Factor | Build | Buy |
|--------|-------|-----|
| **SG credit card data API** | Must build | **Does not exist** |
| **Competitive moat** | Rules DB is primary moat | Moat lost if data is commoditized |
| **Data freshness** | Controlled by us | Dependent on provider SLA |
| **Cost** | $8-12/mo infrastructure | $500+/mo for comparable data feeds |
| **Customization** | Full control over schema, severity, alerting | Locked to provider's format |

**Verdict**: **Build.** No API or data provider exists for Singapore credit card earn rates and terms. The database IS the moat. The closest alternatives (CardUp, SingSaver) don't expose APIs — they're competitors who built their own data sets.

---

## 10. Risks & Mitigations

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|-----------|--------|------------|
| R1 | Bank T&C pages change structure, breaking scrapers | High | Medium | CSS selector versioning, fallback to full-page diff, alerting on scrape failures |
| R2 | AI misclassifies a change (false positive) | Medium | High | Confidence thresholds, admin review queue, user flagging mechanism |
| R3 | AI misses a real change (false negative) | Medium | High | Community submissions as backup channel, periodic manual spot-checks |
| R4 | Legal concerns about scraping bank websites | Low | High | Robots.txt compliance, rate limiting (max 1 req/day/page), cache-friendly headers, no login-wall scraping |
| R5 | Community submissions are low quality or spam | Medium | Low | Rate limiting (5/day/user), evidence requirements, reputation system |
| R6 | Supabase free tier limits exceeded | Low | Medium | Monitor usage; 500K Edge Function invocations and 500MB DB are ample for this scale |
| R7 | Claude API pricing increases | Low | Medium | Abstracted provider layer; can switch to Gemini Flash or local models |

---

## 11. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Detection latency** | < 48 hours from bank announcement | Time between `effective_date` and `created_at` in `rate_changes` |
| **Coverage** | ≥ 90% of real rate changes detected | Monthly audit against forum discussions |
| **Precision** | ≥ 95% of published changes are accurate | User flag rate < 5% |
| **Community participation** | ≥ 10 submissions/month by v1.5+3 months | `community_submissions` count |
| **Admin review time** | < 15 min/day | Pipeline health dashboard |
| **System uptime** | ≥ 99% scraper success rate | `v_pipeline_health` view |

---

## 12. Open Questions

| # | Question | Owner | Status |
|---|----------|-------|--------|
| Q1 | Should community submissions require evidence (URL/screenshot) or allow free-text? | PM | Open |
| Q2 | What's the minimum confidence threshold for auto-approve? (0.85 proposed) | AI Eng | Open |
| Q3 | Should we scrape behind-login bank portals (higher coverage, legal risk)? | PM + Legal | Open — recommend NO |
| Q4 | Do we need a public "rate change history" page for SEO/trust? | PM | Open |
| Q5 | Should the admin dashboard be a separate app or an in-app screen? | Designer | Open — recommend separate (Vercel) |
| Q6 | How do we handle rate changes for cards not yet in our database? | Data Eng | Open |
| Q7 | Contributor gamification: leaderboard or just badges? | PM | Open |

---

## Appendix A: Existing Schema Reference

### rate_changes table (Migration 015)

```sql
CREATE TABLE public.rate_changes (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id         UUID REFERENCES public.cards(id) ON DELETE SET NULL,
  program_id      UUID REFERENCES public.miles_programs(id) ON DELETE SET NULL,
  change_type     rate_change_type NOT NULL,  -- earn_rate|cap_change|devaluation|partner_change|fee_change
  category        TEXT,
  old_value       TEXT NOT NULL,
  new_value       TEXT NOT NULL,
  effective_date  DATE NOT NULL,
  alert_title     TEXT NOT NULL,
  alert_body      TEXT NOT NULL,
  severity        alert_severity NOT NULL DEFAULT 'info',  -- info|warning|critical
  source_url      TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);
```

### RPCs (Migration 016)

- `get_user_rate_changes(p_user_id UUID)` — portfolio-filtered, unread, 90-day, severity-sorted
- `get_card_rate_changes(p_card_id UUID)` — all changes for a card, 90-day window

---

## Appendix B: Implementation Priority

### Sprint 13 — Community Submissions (v1.5)

| Story | Points | Priority |
|-------|--------|----------|
| Migration 017: community_submissions table + detection_source column | 5 | P0 |
| Community submission form (in-app) | 5 | P0 |
| Admin review dashboard (Vercel) | 5 | P0 |
| Dedup logic (fingerprint matching) | 3 | P1 |
| Submission status tracking (user-facing) | 2 | P1 |
| Contributor badges | 2 | P2 |
| E2E tests | 3 | P0 |
| **Total** | **25** | |

### Sprint 14-15 — Automated Detection (v2.0)

| Story | Points | Priority |
|-------|--------|----------|
| Migration 018: source_configs + source_snapshots tables | 5 | P0 |
| Scraper service (Railway + Playwright) | 8 | P0 |
| Content diff engine (SHA-256 gating) | 3 | P0 |
| Claude Haiku classification pipeline | 8 | P0 |
| Confidence routing + auto-approve | 5 | P1 |
| Pipeline health monitoring | 3 | P1 |
| Source config management (admin) | 3 | P1 |
| E2E tests | 5 | P0 |
| **Total** | **40** | |
