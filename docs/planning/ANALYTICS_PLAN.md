# Analytics Plan: MaxiMile — Credit Card Miles Optimizer

**Version**: 1.1
**Created**: 2026-02-28
**Last updated**: 2026-02-28
**Author**: Analytics Advisor Agent
**Status**: Updated — Survey Results Incorporated
**Source**: PRD v2.4, SPRINT_PLAN v13.0, DISCOVERY v1.0, CUSTOMER_SURVEY v2.0, PRODUCT_MARKETING v1.0, SURVEY_INSIGHTS v1.0 (n=32)

---

## Executive Summary

MaxiMile is a pre-launch mobile app with strong product strategy and a well-defined North Star Metric (MARU), but currently **lacks analytics infrastructure**. This document defines the full analytics plan — from maturity baseline and metrics framework to event instrumentation, analysis roadmap, and dashboard design — to ensure the team can make data-driven decisions from Day 1 of launch.

The core risk without this plan: a well-built product ships, user behavior is opaque, and the team has no reliable signal for what's working, what's breaking, and where to invest next.

---

## 1. Analytics Maturity Assessment

### Current Level: 0.5 (Pre-Launch / Planning)

| Level | Type | Status | Evidence |
|-------|------|--------|----------|
| **Level 1** | Descriptive — what happened? | ❌ Not yet | No live product; no telemetry integrated |
| **Level 2** | Diagnostic — why did it happen? | ❌ Not yet | No funnel or cohort analysis in place |
| **Level 3** | Predictive — what could happen? | ❌ Not yet | No historical data; forecasts are market estimates only |
| **Level 4** | Prescriptive — what should we do? | ❌ Not yet | Decisions currently driven by research + intuition |

### What Exists (Pre-Launch Credit)

- ✅ **North Star Metric defined**: MARU (Monthly Active Recommendations Used) with a specific 6-month target (10,000)
- ✅ **RICE framework applied**: Feature prioritization is quantitative, not gut-based
- ✅ **Customer survey completed**: 44 responses collected; 32 qualified; insights documented in `docs/research/SURVEY_INSIGHTS.md`
- ✅ **Per-release success criteria**: MVP/v1.1/v1.2 each have measurable acceptance conditions
- ✅ **Assumption log**: Key assumptions documented with falsification criteria — now partially validated by survey
- ✅ **Competitive signal driving roadmap**: MileLion analysis generated Sprints 21–22

### Gaps to Level 1

1. No analytics tool integrated into the app
2. No event taxonomy defined (what to track, how to name it, what properties)
3. No activation metric defined (what "got value on Day 1" means)
4. No retention metrics defined (D7/D30 return rate)
5. No data governance plan (PDPA compliance, PII handling)

### Target Level: 2 (Diagnostic) by Month 3 Post-Launch

**Recommended next step**: Integrate PostHog (or Mixpanel) before beta launch and instrument the 15 core events defined in Section 3. This single action moves the team from Level 0 to Level 1 in one sprint.

---

## 2. North Star Metric

**Metric**: Monthly Active Recommendations Used (MARU)
**Definition**: The count of distinct `recommendation_acted` events fired per calendar month — where a user viewed a recommendation and proceeded to pay (or confirmed intent to use the recommended card)
**Why this metric**: Directly measures trust at the point of payment — the core value exchange. A user who acts on a recommendation has received the product's primary value. MAU measures presence; MARU measures value delivery.
**Target**: 10,000 MARU within 6 months of launch (avg ~8 recommendations/user/month across ~1,250 active users)
**Review cadence**: Weekly (trending) + Monthly (vs target)

### MARU Decomposition

```
MARU = MAU × Recommendation Reach Rate × Recommendation Act Rate
     = 5,000 × 50% × 40%
     = 1,000 acting users × 10 avg interactions
     = 10,000 MARU target

Where:
  Recommendation Reach Rate = % of MAU who open the recommendation screen at least once/month
  Recommendation Act Rate   = % of recommendation views where user proceeds (not bounces)
```

Tracking both component rates lets the team diagnose MARU shortfalls — is the problem reach (users not opening the app at checkout) or trust (users not acting on what they see)?

### Supporting Metrics (monitor but do not optimise against)

| Metric | Why It Supports MARU | Warning if |
|--------|---------------------|------------|
| MAU | MARU ceiling is bounded by MAU | MAU grows but MARU doesn't → reach or act rate problem |
| Transaction Log Rate | Accurate caps require logs; inaccurate caps break MARU trust | Log rate < 60% |
| Recommendation Accuracy Rate | Wrong recommendations erode trust → MARU collapses | User-reported error rate > 5% |
| D7 Retention | Users who return use more recommendations | D7 < 30% |

---

## 3. Metrics Framework

### 3.1 Product Performance KPIs

| Metric | Definition | Formula | Target (6 months) | Tracking Tool | Owner | Cadence |
|--------|------------|---------|-------------------|---------------|-------|---------|
| **MARU** (North Star) | Recommendations acted on per month | Count of `recommendation_acted` events per month | 10,000 | PostHog / Mixpanel | PM | Weekly |
| **MAU** | Unique users who open app ≥1x per month | Count of distinct `user_id` per month | 5,000 | PostHog / Mixpanel | PM | Weekly |
| **Activation Rate** | % new users who act on first recommendation within 7 days of signup | `(users with first recommendation_acted ≤ D7) / new_signups` | ≥ 40% | PostHog / Mixpanel | PM | Weekly |
| **D7 Retention** | % users who open app again 7 days after first session | Standard retention curve | ≥ 30% | PostHog / Mixpanel | PM | Weekly |
| **D30 Retention** | % users active 30 days after signup | Standard retention curve | ≥ 20% | PostHog / Mixpanel | PM | Monthly |
| **Transaction Log Rate** | % of estimated transactions logged within 24 hours | `logged_txns / estimated_txns` (estimated from avg spend frequency per persona) | ≥ 70% | Supabase query | Data Engineer | Weekly |
| **Auto-Capture Rate** | % of logged transactions captured automatically (F26/F27) vs manually entered | `auto_captured_txns / total_logged_txns` | ≥ 25% by v1.8 | PostHog | Data Engineer | Weekly |
| **Cap Breach Rate** | % of transactions where user exceeded a bonus cap (recommendation accuracy proxy) | `cap_breach_events / total_txns` | < 5% | Supabase query | PM | Monthly |
| **Premium Conversion Rate** | % free users who upgrade to paid tier | `premium_subscriptions / total_signups` (rolling 90 days) | 10–15% | Supabase / revenue tool | PM | Monthly |

### 3.2 Marketing & Acquisition KPIs

| Metric | Definition | Formula | Target | Tracking Tool | Owner | Cadence |
|--------|------------|---------|--------|---------------|-------|---------|
| **Total Installs** | App downloads (iOS + Android) | App Store Connect + Google Play Console | 2,000 by Month 1 | App Store Console | Marketing | Weekly |
| **Signup Conversion Rate** | % of installs that complete signup | `signups / installs` | ≥ 50% | PostHog | PM | Weekly |
| **Channel Mix** | % of new users by acquisition source | Source breakdown from attribution | Community > 60% at launch | PostHog UTM tracking | Marketing | Monthly |
| **NPS** | User satisfaction + referral likelihood | Standard NPS survey (0–10 scale) | ≥ 40 | In-app survey (PostHog) | PM | Quarterly |
| **MileLion/Community Referral Rate** | % new users attributed to community channels | UTM `source=milelion`, `source=telegram`, etc. | > 40% of organic | PostHog | Marketing | Monthly |

### 3.3 System & Data Quality KPIs

| Metric | Definition | Target | Tracking Tool | Owner | Cadence |
|--------|------------|--------|---------------|-------|---------|
| **Card Rules Error Rate** | % of earn rate entries with known inaccuracies (user-reported or audit-detected) | < 5% | Admin dashboard (Supabase) | Data Engineer | Monthly |
| **Rate Change Detection Lag** | Avg days between a rate change going live and MaxiMile reflecting it | < 7 days | Pipeline health dashboard | Data Engineer | Weekly |
| **Push Notification Delivery Rate** | % of rate change alerts successfully delivered to opted-in users (F29) | ≥ 95% | Expo Push + PostHog | Developer | Per alert |
| **Recommendation Response Time** | p95 latency for recommendation RPC call | < 2 seconds | Supabase metrics | Software Engineer | Weekly |
| **Scraper/MileLion Pipeline Uptime** | % of scheduled pipeline runs that complete without error (F25) | ≥ 99% | Pipeline health dashboard | Data Engineer | Daily |

### 3.4 What We Are NOT Measuring (and Why)

| Metric | Reason for Exclusion |
|--------|---------------------|
| **Total page views / screen views** | Vanity metric — doesn't indicate value delivery |
| **Time in app** | MaxiMile is designed for speed (<2 sec use case); long sessions may indicate confusion, not engagement |
| **Cards added to portfolio** | Leading indicator only — useful for onboarding funnel but misleading as a standalone KPI |
| **Notification open rate alone** | Without pairing with downstream action (recommendation_acted), open rate is vanity |
| **Social shares / referral count** | Too early for v1 — focus on activation and retention first |
| **Revenue MRR (v1)** | Free tier at launch; no monetization until post-MVP; premature to track |

---

## 4. Instrumentation Plan

### 4.1 Tool Stack Decision

| Layer | Recommended Tool | Rationale | Alternative |
|-------|-----------------|-----------|-------------|
| **Primary analytics** | **PostHog** (self-hosted or cloud) | Open source; strong funnel + cohort tools; PDPA-friendly (data residency control); generous free tier; React Native SDK available | Mixpanel (better UX, higher cost) |
| **Session recording** | **PostHog Session Replay** | Bundled with PostHog; no extra integration; privacy masking for financial fields | Microsoft Clarity (free but less cohort integration) |
| **In-app surveys / NPS** | **PostHog Surveys** | Bundled; no extra tool; trigger on events (e.g., after 5th recommendation_acted) | Typeform (better UX but adds integration) |
| **Push notification tracking** | **Expo Notifications + PostHog** | PostHog captures delivery/open events; Expo handles send | — |
| **Error tracking** | **Sentry** | Standard React Native error tracking; complements PostHog; free tier sufficient | — |
| **Backend metrics** | **Supabase Dashboard + custom SQL queries** | Server-side events (log rates, cap breaches) best measured at DB layer | — |

> **PDPA Note**: PostHog self-hosted (on a Singapore-region AWS/GCP instance) ensures user data never leaves Singapore jurisdiction. If using PostHog Cloud, select the EU region and review PDPA adequacy decisions. All `user_id` values should be pseudonymised UUIDs — never store Singapore NRIC, full name, or card numbers in analytics events.

### 4.2 Event Taxonomy — Priority 0 (Ship Day 1)

These events are **launch-blockers**. MARU cannot be measured without them.

| Event Name | Trigger | Required Properties | Optional Properties |
|------------|---------|---------------------|---------------------|
| `app_opened` | App foregrounded | `user_id`, `session_id`, `platform` (ios/android) | `app_version`, `source` (cold/warm) |
| `onboarding_started` | First screen of onboarding shown | `user_id`, `session_id` | — |
| `card_added` | User adds a card to portfolio | `user_id`, `card_id`, `card_name`, `bank` | `cards_in_portfolio_count` |
| `onboarding_completed` | User exits onboarding with ≥1 card added | `user_id`, `cards_added_count` | `time_to_complete_sec` |
| `recommendation_viewed` | Recommendation screen rendered with results | `user_id`, `session_id`, `category`, `top_card_id`, `top_card_mpd`, `alternatives_count` | `cap_remaining_top_card` |
| `recommendation_acted` | User taps "Use This Card" or equivalent CTA | `user_id`, `session_id`, `category`, `card_id`, `card_mpd`, `followed_top_recommendation` (bool) | `time_to_act_sec` |
| `recommendation_skipped` | User closes recommendation screen without acting | `user_id`, `session_id`, `category`, `top_card_id` | `time_on_screen_sec` |
| `transaction_logged` | Transaction saved successfully | `user_id`, `card_id`, `category`, `amount_sgd`, `capture_method` (manual/apple_pay/android_notif) | `recommendation_match` (bool — did they use recommended card?) |

### 4.3 Event Taxonomy — Priority 1 (Within 2 Weeks of Launch)

| Event Name | Trigger | Required Properties | Optional Properties |
|------------|---------|---------------------|---------------------|
| `cap_alert_viewed` | Cap warning banner/modal shown | `user_id`, `card_id`, `cap_used_pct`, `cap_type` (monthly/quarterly/annual) | `category` |
| `cap_hit` | User's spend exceeds a bonus cap | `user_id`, `card_id`, `cap_type`, `overflow_amount_sgd` | — |
| `push_permission_requested` | System push permission dialog triggered | `user_id`, `trigger_context` (onboarding/organic/rate_change) | — |
| `push_permission_granted` | User approves push notifications | `user_id` | — |
| `push_received` | Rate change push notification delivered | `user_id`, `notification_id`, `severity` (high/medium/low), `cards_affected_count` | — |
| `push_tapped` | User taps push notification to open app | `user_id`, `notification_id`, `severity` | — |
| `rate_change_viewed` | User views rate change detail screen | `user_id`, `card_id`, `change_type` (earn_rate/cap/exclusion), `change_detected_date` | — |
| `miles_portfolio_viewed` | Miles portfolio tab opened | `user_id`, `total_programs_tracked` | — |
| `goal_set` | User sets a miles redemption goal | `user_id`, `program`, `target_miles`, `target_date` | — |
| `session_ended` | App backgrounded or killed | `user_id`, `session_id`, `session_duration_sec`, `screens_viewed_count` | — |

### 4.4 Event Taxonomy — Priority 2 (Month 2+)

| Event Name | Trigger | Required Properties |
|------------|---------|---------------------|
| `community_rate_submission` | User submits a rate change (F24) | `user_id`, `card_id`, `change_type`, `evidence_provided` (bool) |
| `rate_submission_verified` | Admin approves a community submission | `submission_id`, `card_id`, `reviewer_time_sec` |
| `nps_survey_shown` | NPS survey triggered (after 5th recommendation_acted) | `user_id`, `trigger_event` |
| `nps_survey_submitted` | NPS response recorded | `user_id`, `score` (0–10), `verbatim_response` |
| `demo_mode_activated` | Demo mode entered (F28) | `user_id`, `context` (stakeholder_demo/testing) |
| `card_removed` | User removes card from portfolio | `user_id`, `card_id`, `cards_remaining` |
| `settings_changed` | User modifies notification or display settings | `user_id`, `setting_key`, `new_value` |

### 4.5 Data Governance Checklist

| Requirement | Status | Action Required |
|-------------|--------|-----------------|
| **PDPA consent mechanism** | ❌ Missing | Add analytics consent toggle in onboarding (opt-in preferred; opt-out minimum) |
| **PII fields excluded from events** | ❌ Not yet defined | Never include: card number, full name, NRIC, bank account. Use `card_id` (UUID), `user_id` (UUID) only |
| **Financial amounts in events** | ⚠️ Use carefully | Log `amount_sgd` as a numeric value only — no merchant name, no full transaction description |
| **Data residency** | ❌ Not decided | Self-host PostHog in Singapore region (AWS ap-southeast-1) or confirm PostHog Cloud EU adequacy |
| **Data retention policy** | ❌ Missing | Define: raw events retained 24 months; aggregates retained indefinitely; user deletion cascades to events |
| **User data deletion** | ❌ Missing | Implement "Delete My Account" → triggers PostHog person deletion API + Supabase user row purge |
| **Analytics opt-out** | ❌ Missing | Honour opt-out in app settings; PostHog `posthog.optOut()` call |
| **Event validation** | ❌ Missing | Add PostHog data tests or schema enforcement to catch missing required properties at development time |

---

## 5. Activation Funnel

This is the **primary diagnostic framework** for MaxiMile. Every step needs a corresponding P0 event.

```
[Install]
    ↓
[App Opened]             → app_opened
    ↓
[Onboarding Started]     → onboarding_started
    ↓
[First Card Added]       → card_added (cards_in_portfolio_count = 1)
    ↓
[Onboarding Completed]   → onboarding_completed
    ↓
[Recommendation Viewed]  → recommendation_viewed
    ↓
[Recommendation Acted]   ← ACTIVATION EVENT → recommendation_acted
    ↓
[Transaction Logged]     → transaction_logged
    ↓
[Return Next Day]        ← RETENTION SIGNAL → app_opened (D1+)
```

### Funnel Benchmarks to Target

| Step | Drop-off Expectation | Action if Below Benchmark |
|------|---------------------|--------------------------|
| Install → App Opened | < 10% loss | Store listing / first-run performance |
| App Opened → Onboarding Started | < 20% loss | Reduce friction before onboarding entry |
| Onboarding → First Card Added | < 30% loss | Key onboarding UX test; search + add card flow |
| First Card → Onboarding Completed | < 10% loss | One-card minimum is achievable; investigate if high drop-off |
| Onboarding → First Recommendation | < 20% loss | Home screen and navigation clarity |
| Recommendation Viewed → Acted | < 40% loss | Trust signal; recommendation accuracy; UI confidence cues |
| Acted → Transaction Logged | < 40% loss | Logging friction; auto-capture adoption (F26/F27) |
| Logged → D7 Return | Target ≥ 30% | Core retention; habit formation |

---

## 6. Cohort Analysis Plan

### Cohort 1: Signup Week Retention (Launch)
Track D1, D7, D14, D30, D60, D90 retention by signup week. Look for:
- Is retention improving week over week as onboarding is refined?
- Is there a specific day where users fall off (e.g., D3 suggests they tried it once and didn't form a habit)?

### Cohort 2: Auto-Capture vs Manual Logger Retention
Compare D30 retention between users who:
- A) Have at least one auto-captured transaction (F26 iOS / F27 Android)
- B) Log all transactions manually

**Hypothesis**: Auto-capture users retain significantly better because the logging friction is removed. This cohort analysis is the primary business case for prioritising F26/F27 in the roadmap.

### Cohort 3: Activation Speed vs Retention
Group users by how quickly they acted on their first recommendation:
- < 1 hour of signup
- 1–24 hours
- 1–7 days
- > 7 days

**Hypothesis**: Faster activation (first recommendation acted on same day as signup) predicts significantly better 30-day retention. Use this to tune onboarding — push users toward their first recommendation before they leave.

### Cohort 4: Card Portfolio Size vs MARU
Group users by number of cards added at onboarding:
- 1 card
- 2–3 cards
- 4–5 cards
- 6+ cards

**Hypothesis**: Users with 4+ cards act on more recommendations per month (higher MARU), validating the "Active Maya" persona as the core engagement driver. Use to tune acquisition targeting.

---

## 7. A/B Test Roadmap

### Test 1: Onboarding Recommendation Hook (Priority: High — Month 1)
**Hypothesis**: If we show a sample recommendation during onboarding ("Here's what MaxiMile would recommend at a restaurant with your cards"), then activation rate will increase by ≥10pp because users understand the value before they need it.
**Control**: Current onboarding ends at card added
**Variant**: Add a simulated recommendation step after first card is added
**Primary metric**: Activation rate (recommendation_acted within D7)
**Guard-rail metrics**: Onboarding completion rate (don't sacrifice completion for activation)
**Min sample size**: 200 users per variant
**Decision rule**: Ship if activation rate lifts ≥5pp with p < 0.05; roll back if onboarding completion drops > 5pp

### Test 2: Recommendation Act CTA Wording (Priority: Medium — Month 2)
**Hypothesis**: Changing "Use This Card" to "I'll use [card name]" (first-person affirmation) increases recommendation_acted rate because it feels like a commitment rather than a command.
**Primary metric**: recommendation_acted / recommendation_viewed ratio
**Min sample size**: 500 recommendation views per variant

### Test 3: Cap Alert Timing (Priority: Medium — Month 2)
**Hypothesis**: Surfacing a cap alert at 70% utilisation (rather than 80%) results in fewer cap_hit events because users adjust card selection earlier.
**Primary metric**: cap_hit rate per user per month
**Guard-rail**: recommendation_viewed rate (don't introduce alert fatigue)

### Test 4: Push Notification Opt-In Framing (Priority: High — Post F29 launch)
**Hypothesis**: Framing push opt-in as "Get alerted when [card name] earn rates change" (personalised, specific) converts better than generic "Enable notifications for MaxiMile".
**Primary metric**: push_permission_granted / push_permission_requested ratio
**Min sample size**: 300 users per variant

---

## 8. Qualitative Research Plan

### Research Round 1: Activation Friction (Month 1 Post-Launch)
**Trigger**: Funnel analysis showing drop-off > 40% at any single onboarding step
**Method**: Usability testing — 5 users from target persona (Maya: 3–5 miles cards, active optimizer)
**Format**: 30-minute remote session; screen recorded; think-aloud protocol
**Key tasks**:
1. Add your real cards to MaxiMile
2. I want to pay for dinner — what do you do?
3. You just paid — what do you do now?
**Focus**: Where do users hesitate? What do they expect but don't find?

### Research Round 2: Retention Drivers (Month 2 Post-Launch)
**Trigger**: D7 retention below 30% benchmark
**Method**: Exit interviews — 8 users who installed but have not opened app in 7+ days
**Key questions**:
1. Walk me through the last time you used MaxiMile. What happened?
2. What would need to be different for you to open it again this week?
3. What does your current process look like at the checkout now?

### Research Round 3: Premium Conversion Blockers (Month 3 Post-Launch)
**Trigger**: Premium conversion rate below 5% in first 3 months
**Method**: In-app NPS survey (score 0–6, detractors) + 5 follow-up interviews
**Key questions**:
1. What would need to be true for you to pay SGD X/month for MaxiMile?
2. What feature is missing that would make this a must-have?

---

## 9. Performance Dashboard Spec

### Dashboard 1: Daily Health Check (Real-Time)

> **Question it answers**: Is the product healthy today?

| Metric | Display | Alert Threshold |
|--------|---------|-----------------|
| MARU (MTD) | Number + progress bar vs monthly target | < 70% of month-to-date pro-rata |
| DAU | Number + 7-day sparkline | Drop > 20% vs prior 7-day avg |
| New Signups Today | Number | — |
| Recommendation Act Rate | % (7-day rolling) | < 30% |
| App Crashes (Sentry) | Count + affected users | Any P0 crash affecting > 1% DAU |
| Pipeline Health | Green/Amber/Red (scraper uptime) | Any failed run |

### Dashboard 2: Weekly Product Review

> **Question it answers**: Are we activating and retaining users?

| Section | Metrics |
|---------|---------|
| **Acquisition** | New installs, new signups, channel breakdown |
| **Activation Funnel** | Install → Onboarding → First Card → First Recommendation → First Act (step conversion %) |
| **Engagement** | MAU, MARU, Recommendation Reach Rate, Act Rate |
| **Retention** | D1 / D7 / D30 retention curves by signup cohort |
| **Logging Health** | Transaction log rate, auto-capture rate, manual vs auto breakdown |

### Dashboard 3: Monthly Business Review

> **Question it answers**: Are we on track for 6-month targets?

| Section | Metrics |
|---------|---------|
| **North Star** | MARU vs target (10,000 by Month 6) — trend projection |
| **User Growth** | MAU vs target (5,000 by Month 6) |
| **Retention Quality** | D30 retention cohort table (one row per signup month) |
| **Data Quality** | Card rules error rate, rate change detection lag |
| **Product Health** | Premium conversion rate, NPS score (quarterly), cap breach rate |
| **A/B Tests** | Status of active tests + decisions made from completed tests |

---

## 10. Analysis Roadmap

### Month 1 (Launch → Post-Launch Week 4)
- [ ] **Integrate PostHog** into React Native app (1–2 dev days)
- [ ] **Instrument P0 events** (8 events from Section 4.2)
- [ ] **Set up activation funnel** in PostHog
- [ ] **Build Daily Health Check dashboard** (Dashboard 1)
- [ ] **Document MARU definition** precisely in PostHog event naming conventions
- [ ] **Run first funnel analysis** after first 100 signups — identify biggest drop-off step
- [ ] **PDPA compliance** — add analytics consent to onboarding

### Month 2 (Post-Launch)
- [ ] **Instrument P1 events** (Section 4.3)
- [ ] **Set up cohort analysis** — Signup Week Retention (Cohort 1)
- [ ] **Launch A/B Test 1** (Onboarding Recommendation Hook)
- [ ] **Research Round 1** if activation funnel shows > 40% drop-off at any step
- [ ] **Set up Auto-Capture vs Manual cohort** (Cohort 2) — builds business case for F26/F27 roadmap priority

### Month 3 (Post-Launch)
- [ ] **First cohort retention report** — are D30 numbers improving?
- [ ] **Activation Speed vs Retention analysis** (Cohort 3)
- [ ] **Read A/B Test 1 results** — ship or roll back onboarding variant
- [ ] **Launch A/B Test 2** (CTA wording)
- [ ] **Research Round 2** if D7 retention < 30%
- [ ] **NPS survey launch** (trigger after 5th recommendation_acted event)
- [ ] **First Monthly Business Review** with full dashboard

### Month 4–6 (Scaling)
- [ ] **Card Portfolio Size vs MARU cohort** (Cohort 4) — informs acquisition targeting
- [ ] **Premium conversion funnel analysis** — where do free users fall off in the upgrade flow?
- [ ] **Research Round 3** if conversion < 5%
- [ ] **A/B Test roadmap** — Cap Alert Timing (Test 3), Push Opt-In Framing (Test 4)
- [ ] **Community submission analytics** — are F24 contributors retaining better? (proxy for power user engagement)

---

## 11. Open Questions (Pre-Launch Decisions Required)

| Question | Decision Required By | Options | Recommendation |
|----------|---------------------|---------|----------------|
| Which analytics tool? | Before first beta build | PostHog self-hosted / PostHog Cloud / Mixpanel | **PostHog self-hosted** (PDPA control + cost) |
| PDPA consent model? | Before public launch | Opt-in (GDPR-style) / Opt-out (weaker) | **Opt-in** — users are financially literate; trust matters |
| Who owns analytics? | Sprint 1 post-integration | PM / Developer / Data Engineer | **PM owns definition; Developer owns implementation; DE owns data quality** |
| ~~Survey results documented?~~ | ~~Before finalising PRD assumptions~~ | ~~Run survey if not done~~ | ✅ **RESOLVED** — Survey complete. See `docs/research/SURVEY_INSIGHTS.md` |
| How is "recommendation acted" defined precisely? | Before PostHog integration | Tap "Use This Card" only / Any forward navigation from recommendation screen | **Tap explicit CTA only** — conservative, higher signal quality |
| Premium price point? | Before monetisation sprint | $1.99 / $2.99 / $4.99 / $9.99/month | **Survey suggests $2.99–4.99/month** — $1–3 captures 28.1%; $3–5 captures 15.6%; above $5 has thin support |
| Free tier feature split? | Before monetisation sprint | Cap tracker free / premium only | **Cap tracker must be in free tier** — 68.8% weekly usage intent; paywalling it destroys activation |

---

## 12. Current Findings — Survey Data (n=32)

> **Full analysis**: `docs/research/SURVEY_INSIGHTS.md`
> **Survey instrument**: `docs/research/CUSTOMER_SURVEY.md`
> **Data**: `docs/research/CC Reward Survey.csv`
> Collected: 2026-02-19 to 2026-02-27 | 44 total responses | 32 qualified miles users

### 12.1 Assumption Validation Status

| Assumption | Status | Key Evidence |
|------------|--------|-------------|
| Users rely on manual methods to decide card | ✅ Validated | 100% use manual methods; 0% use an app |
| Bonus cap tracking is a top pain | ✅ Validated | 87.5% not tracking carefully; 78.1% unsure/breached |
| Core feature appeal ≥ 3.5/5 | ✅ Validated | MCC reco: 4.5/5; Cap tracker: 4.4/5 |
| Users willing to check app at payment | ✅ Validated | 93.7% tolerant; only 6.3% won't use if it takes time |
| Freemium is right monetisation model | ✅ Validated | 81.3% want free baseline; 0% want subscription-only |
| 60%+ hold 3+ cards | ⚠️ Partially | Only 50% hold 3+ (but 84.4% hold 2+); complexity is real |
| MCC uncertainty is top pain | ⚠️ Revised | It's 4th (40.6%); rule changes (#1, 65.6%) and time/effort (#2, 59.4%) dominate |
| Cap breach is primary anxiety | ⚠️ Revised | Only 7th (18.8%) as explicit pain; but 78.1% unsure/breached — latent not stated |
| Pure monthly subscription viable | ❌ Invalidated | 0% support; must use freemium structure |

### 12.2 Key Quantitative Benchmarks Established

| Metric | Survey Finding | Implication for Analytics |
|--------|----------------|--------------------------|
| Self-reported optimisation rate | 78% believe <70% optimal | Baseline for MARU improvement narrative |
| Top pain: rule changes | 65.6% cite it | Rate change notification delivery rate becomes a KPI |
| Feature weekly usage intent | Best card reco: 90.6% | Recommendation Reach Rate target should be ≥ 70% |
| Time tolerance at payment | 62.5% expect ≤ 10 seconds | P95 recommendation response time target: < 3 seconds |
| WTP: pay $1+/month | 56.3% willing | Premium conversion target (10–15%) is realistic for active segment |
| WTP: pay $3+/month | 28.1% willing | Premium tier pricing: $2.99–4.99/month |
| Segment split: Active vs Casual | 31% / 69% | Target MARU driver is active segment; casual drives MAU |

### 12.3 Revised Feature Priority (Post-Survey)

| Feature | Pre-Survey Priority | Post-Survey Signal | Recommendation |
|---------|--------------------|--------------------|----------------|
| Best card recommendation | P0 (MVP) | 90.6% weekly usage intent | Unchanged — confirmed hero feature |
| Cap tracker | P0 (MVP) | 68.8% weekly usage intent | Unchanged — confirmed #2 feature |
| Rate change notifications (F29) | P1 | #1 pain = rule changes (65.6%) | **Elevate to MVP or Sprint 2 at latest** |
| Transaction history | P2 | 53.1% weekly usage intent — tied #3 | **Bring forward to Sprint 3–4** |
| MCC lookup | P1 | 53.1% weekly usage intent | Maintain P1 |
| Community MCC database | P2 | 31.3% weekly usage intent | Maintain P2 |
| Annual fee management | Not planned | 31.3% cite as top-3 pain | Add to backlog; validate in qualitative round |

### 12.4 Revised GTM Channel Priority (Post-Survey)

| Channel | Survey Evidence | Priority |
|---------|----------------|---------|
| The MileLion (blog + Telegram) | 37.5% use as info source; cited by active optimizers | P0 — launch partner |
| SingSaver | 43.8% use — top source overall | P1 — content/SEO play |
| Telegram communities | 21.9% use | P1 — soft launch distribution |
| Friends / word of mouth | 34.4% rely on it | P1 — design referral loop from Day 1 |
| Reddit (r/singaporefi) | 9.4% — tech-savvy early adopters | P2 |

### 12.5 Revised Messaging Framework (Post-Survey)

Based on pain point ranking, the primary messaging hierarchy should be:

1. **Time savings** ("Know the right card to tap in seconds — no research needed")
2. **Always up to date** ("We track rule changes so you never have to")
3. **Cap protection** ("Never exceed a bonus cap without knowing it")
4. **Proven ROI** ("Users avoid losing average SGD X in miles per year")

This replaces earlier MCC-first framing — MCC uncertainty is real but doesn't emotionally resonate as the hero message.

---

## 13. Document History

| Version | Date | Change |
|---------|------|--------|
| 1.0 | 2026-02-28 | Initial analytics plan created from PRD v2.4 and project assessment |
| 1.1 | 2026-02-28 | Added Section 12: Survey findings (n=32); revised feature priority, GTM channels, messaging hierarchy; resolved "Survey documented?" open question; added premium pricing open questions |
