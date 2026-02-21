# Problem-Solution Fit Analysis: MaxiMile

**Date**: 2026-02-21
**Author**: PM Agent
**Version**: 1.1
**Status**: Updated post-Sprint 13 implementation

---

## 1. Problem Statement Recap

> An **urban working professional in Singapore** struggles with **manually tracking credit card rules across spreadsheets, blogs, and memory** to **maximize airline miles earned from everyday spending** but cannot do so effectively because **bonus caps, category rules, and exclusions across multiple cards are too complex to track in real-time at the point of payment**, which leads to **thousands of lost miles annually (worth SGD 200–500+ in flights), chronic decision fatigue, and eroding trust in their own optimization strategy**.

---

## 2. Problem Validation Screening

| Criterion | Pass? | Assessment |
|-----------|-------|------------|
| **Not too broad or unclear** | Yes | Highly specific: optimizing miles from credit card spend in Singapore. Clear persona, measurable friction. |
| **Outcomes are measurable** | Yes | Miles per dollar, cap breach rate, time-to-decide — all quantifiable. |
| **Solution isn't already well-known** | Yes | Blogs/comparison sites exist but are static. No real-time, state-aware optimizer in SG. Validated by community sentiment (HardwareZone users giving up on miles chasing). |
| **Does not require hardware** | Yes | Purely mobile software. |
| **Not a marketplace** | Yes | Single-sided — serves the cardholder only. |
| **Friction is not purely personal** | Yes | Systemic complexity (multi-bank rules, caps, MCCs) — not a willpower issue. Product can directly remove this friction. |

**Verdict: Problem passes all 6 screening criteria.**

---

## 3. Decomposing the Frictions & Checking Solution Coverage

7 distinct frictions were identified from the problem statement and user research. Each is mapped to the corresponding product feature and assessed for solution completeness.

### Friction F1: Can't remember which card earns best for each category

- **Evidence**: 5 Whys root cause; HardwareZone: users going from 7→2 cards out of frustration
- **MaxiMile Feature**: Spend Category Recommendation Engine (F2) — tap category, get best card instantly
- **Solved?**: **Yes**
- **Notes**: Core value prop. Fully implemented with ranked alternatives and earn rate reasoning.

### Friction F2: Bonus caps are forgotten or exceeded unknowingly

- **Evidence**: Survey: majority reported breaching a cap at least once
- **MaxiMile Feature**: Bonus Cap Tracker (F3) + Cap Approach Alerts (F6) — real-time progress bars, color-coded (green/amber/red), alert at 80%/95% thresholds
- **Solved?**: **Yes**
- **Notes**: Strongest differentiator. Recommendations dynamically switch when caps are exhausted.

### Friction F3: Decision fatigue at checkout (10–30 sec under pressure)

- **Evidence**: Survey Q14: users tolerate max 5–10 sec; contactless payments leave no time to think
- **MaxiMile Feature**: Category grid as home screen — one tap from cold open → recommendation in <1 sec
- **Solved?**: **Yes**
- **Notes**: Design iteration moved recommendation to primary tab (not buried in navigation). Cognitive walkthrough: ~15 sec total flow.

### Friction F4: Rules change frequently across banks

- **Evidence**: MileLion: even expert bloggers need annual strategy overhauls; Amex MR devaluation Feb 2026
- **MaxiMile Feature**: Rate Change Monitoring & Alerts (F23) + Community Rate Submissions (F24) — in-app banners with severity levels, old vs. new rate, card-specific alerts; community-driven rate change detection with dedup fingerprinting, admin review workflow, and contributor badges
- **Solved?**: **Mostly Yes** *(upgraded from Partially)*
- **Notes**: Previously admin-triggered only. Now supplemented by a **community submission system** where users report rate changes with evidence (screenshots, URLs). Submissions are deduplicated via SHA-256 fingerprinting (30-day window), rate-limited (5/day per user), and go through admin review before being merged into the live rate_changes table. Detection source tracking (`manual`, `community`, `automated`) provides an audit trail. Contributor badges (3+ approved submissions) gamify participation. The `rate_changes` table with severity-based alerts (critical/warning/info) and 90-day auto-expiry ensures users see relevant changes. Still not fully automated (scraping/F25 is planned), but the crowdsourced mechanism significantly reduces the operational burden and detection latency.

### Friction F5: No visibility into total miles picture across programs

- **Evidence**: Persona need: "show me one number that proves this is worth my time" (Peter)
- **MaxiMile Feature**: Miles Portfolio Dashboard (F13) with My Miles/My Points segmented view, potential miles calculation, transfer partner mapping
- **Solved?**: **Yes**
- **Notes**: Substantially implemented. Two-layer architecture (airline vs. bank points) aligns with user mental model. Transfer nudges surface hidden optimization.

### Friction F6: No tangible proof that optimization is working

- **Evidence**: Survey: low confidence scores; "imaginary coins subject to devaluation" sentiment
- **MaxiMile Feature**: Miles Earning Insights (F7) — hero stats (miles earned, miles saved vs. 1.4 mpd SG avg), top earning card, 3-month trend
- **Solved?**: **Partially**
- **Notes**: Hero summary exists on Miles tab. Full insights screen referenced but depth unclear. Fixed baseline (1.4 mpd) was a good iteration based on user feedback.

### Friction F7: Manual tracking is unsustainable (spreadsheet fatigue)

- **Evidence**: HardwareZone: users giving up entirely; existing tools all require manual effort
- **MaxiMile Feature**: Transaction Logging (F4) — custom keypad, pre-filled category/card, ~20 sec per entry; future: bank API auto-import. Now augmented with **screen-level data refresh** (`useFocusEffect`) and **post-transaction cap recalculation** so logged data is immediately reflected across all tabs.
- **Solved?**: **Partially**
- **Notes**: This remains the **biggest risk**. Target was <10 sec; actual is ~20 sec. However, the data freshness improvements (focus-based refresh, pull-to-refresh on My Cards, instant cap recalculation after logging) reduce friction *around* the logging act — users no longer experience stale data after adding cards or logging transactions. The feedback loop is now tighter: log → see updated cap progress → see adjusted recommendation. This doesn't eliminate manual input but makes the effort feel more immediately rewarding. Bank API integration (SGFinDex) remains the v2 unlock.

### Summary Table

| # | Friction | Solved? | Feature | Change from v1.0 |
|---|---------|---------|---------|-------------------|
| F1 | Can't remember best card per category | Yes | Recommendation Engine | — |
| F2 | Bonus caps forgotten/exceeded | Yes | Cap Tracker + Alerts | — |
| F3 | Decision fatigue at checkout | Yes | Category grid home screen | — |
| F4 | Rules change frequently | **Mostly Yes** | Rate Change Alerts + Community Submissions + Admin Review | **Upgraded** |
| F5 | No visibility into total miles | Yes | Miles Portfolio Dashboard | — |
| F6 | No proof optimization works | Partially | Earning Insights | — |
| F7 | Manual tracking unsustainable | Partially | Transaction Logging (~20 sec) + Data Freshness Improvements | Improved UX |

**Result: 4 of 7 frictions fully solved. 1 mostly solved (F4, upgraded via community submissions). 2 partially solved with known mitigations planned.**

---

## 4. Problem-Solution Fit Scorecard

| Dimension | Score | Rationale | Change |
|-----------|-------|-----------|--------|
| **Problem Clarity** | **9/10** | Exceptionally well-articulated. 5-component framework, 5 Whys, validated personas, community evidence. One of the strongest problem statements possible. | — |
| **Problem Significance** | **8/10** | SGD 200–500+ annual loss per user is meaningful. Emotional impact (anxiety, decision fatigue) adds urgency. Market size (200–400K target users) is credible. Slight deduction: this is a "nice-to-have optimization" not a "burning platform" — users survive without it. | — |
| **Solution-Problem Alignment** | **8.5/10** | Core frictions (F1, F2, F3) are directly and effectively solved. F4 (rule changes) upgraded from partial to mostly solved via community submissions + admin review. The recommendation engine + cap tracker is exactly the "state-aware layer" the 5 Whys identified as missing. Remaining deduction for F7 (manual logging) being the Achilles' heel — though data freshness improvements (focus-based refresh, instant cap recalculation) tighten the feedback loop. | **+0.5** |
| **Differentiation** | **9/10** | Clear blue ocean in Singapore. No competitor operates at the intersection of real-time + personalized + state-aware. Community-driven rate detection adds a network effect moat — as more users submit changes, data freshness improves for everyone. US precedent (Kudos, $10.2M Series A) validates the model. | Strengthened |
| **Feasibility of Solution** | **7.5/10** | Tech stack is sound (React Native + Supabase). Manual transaction logging remains the critical dependency, but the **card rules DB maintenance burden has been substantially reduced** by the community submission system — crowdsourced detection with dedup fingerprinting, rate limiting, and admin review shifts the operational model from "rules team monitors all bank T&Cs" to "community flags changes, admin verifies." Detection source tracking (`manual`/`community`/`automated`) provides a clean migration path to full automation. | **+0.5** |
| **Evidence Base** | **8/10** | Strong community research (HardwareZone, MileLion, Suitesmile). Survey designed with 7 testable hypotheses and red-flag thresholds. Slight deduction: survey data appears to be "directional" (pre-launch validation) rather than statistically robust sample sizes. | — |

### Overall Problem-Solution Fit: 8.5 / 10 *(up from 8.2)*

---

## 5. Critical Gaps & Risks

### Gap 1: The Manual Logging Paradox (HIGH RISK)

The product's #1 promise is to **eliminate manual tracking**. Yet the product **requires manual transaction logging** for cap tracking accuracy. This creates a paradox:

- **Promise**: "No more spreadsheets"
- **Reality**: Users must log every transaction (amount + category + card) after every payment
- **Mitigation in place**: Pre-filled fields, custom keypad, immediate feedback loop
- **Mitigation needed**: SGFinDex bank API integration (acknowledged as v2, but this is the existential feature). Without it, the product reduces cognitive complexity but doesn't eliminate manual effort — it replaces a spreadsheet with an app form.

**Recommendation**: Frame this honestly in positioning. Don't claim "zero manual effort" until bank API exists. Current value prop should be: **"smarter decisions with minimal logging"** not **"fully automated."**

### Gap 2: Card Rules Database Freshness (MEDIUM RISK → LOW-MEDIUM RISK) *(Downgraded)*

- The database is seeded statically (SQL migrations with hardcoded earn rates/caps)
- ~~No auto-sync mechanism detected — updates depend on a human "rules team" monitoring bank T&Cs~~ **Now supplemented by community submissions (F24)**
- The Rate Change Alerts feature (F23) is admin-triggered; community submissions (F24) add a crowdsourced detection layer
- **Risk**: A wrong recommendation (due to stale rules) is **worse than no recommendation** — it actively destroys trust. This risk is now **mitigated but not eliminated.**

**What changed (Sprint 13)**:
- Community rate submission system implemented with full workflow: user submits → dedup check (SHA-256 fingerprint, 30-day window) → rate limit (5/day) → admin review → merged into `rate_changes` table
- Evidence requirements (screenshot upload to Supabase Storage, source URLs) add credibility to submissions
- Contributor badges (3+ approved submissions) incentivize ongoing participation
- Detection source tracking (`manual`/`community`/`automated`) provides audit trail and migration path to automation
- Admin review dashboard (pending submissions queue, approve/reject with notes) ensures quality control

**Previous recommendation**: *"Consider crowdsourced rule verification (community flag feature mentioned but not implemented) as a near-term mitigation."*
**Status**: **Implemented.** The recommendation has been directly addressed.

**Remaining gap**: The system still depends on users noticing and reporting changes. Automated scraping (F25) remains the next step to close this gap fully. The current community model works well when user base is engaged, but may have blind spots for less popular cards or obscure T&C changes.

### Gap 3: Cold Start Experience for "Passive Peter" (LOW-MEDIUM RISK)

- Peter's trigger is: *"Show me one number that proves this is worth my time"*
- But the "miles saved" metric only works **after** transactions are logged — Peter won't log transactions because he's passive
- The product delivers instant value for Maya (active optimizer) but has a **weaker Day 1 experience for Peter**

**Recommendation**: Add a "projected savings" calculator at onboarding: "Based on your 3 cards, you could earn X more miles per month." Give Peter the number before asking him to commit.

---

## 6. What the Product Gets Right

### 1. Root cause nailed
The 5 Whys correctly identifies the gap as a "real-time, state-aware recommendation layer." The product builds exactly this.

### 2. Anti-feature-jamming discipline
Features map tightly to frictions. No bloat. Every P0 feature (F1–F5) directly serves the core loop: add cards → get recommendation → log transaction → track cap → repeat.

### 3. Design iterations grounded in research
4 documented iterations (dashboard → category grid, raw numbers → progress bars, card-only → reasoning shown, arbitrary baseline → 1.4 mpd). Each tied to a specific user feedback signal.

### 4. Honest about constraints
Out-of-scope list is deliberate (no cashback, no affiliate links in v1, no bank API). Trade-offs are explicit, not hidden.

### 5. Miles Portfolio elevates from utility to engagement
The two-layer architecture (airline → bank) with transfer nudges transforms a tracking tool into a strategic planning tool. This addresses the emotional JTBD ("feeling smart about money") beyond just the functional one.

### 6. Community submissions create a network effect moat *(New in v1.1)*
The community rate submission system (F24) is strategically significant beyond its immediate utility. By enabling users to contribute rate change data — with quality controls (dedup fingerprinting, rate limiting, admin review) and incentives (contributor badges) — the product creates a **defensible data advantage** that scales with user base. More users → faster change detection → more accurate recommendations → more trust → more users. This is harder for competitors to replicate than a static database.

### 7. Data freshness improvements close the feedback gap *(New in v1.1)*
The shift from mount-only data fetching to focus-based screen refresh (`useFocusEffect`) across all tabs, plus instant cap recalculation after transactions, means the product now behaves like users expect a modern app to behave — no stale data, no manual refresh needed. This reduces the "cost" of manual logging by making its benefits immediately visible.

---

## 7. Verdict

### Is MaxiMile solving the right problem?

**Yes — strongly.**

The problem statement is rigorous, evidence-backed, and passes all validation criteria. The core product (recommendation engine + cap tracker) directly addresses the root cause identified in discovery. The product is not a "solution looking for a problem."

### Is it solving it completely?

**Getting closer — and progressing in the right direction.**

The v1.0 analysis identified two critical gaps: (1) manual logging dependency and (2) card rules database freshness. **Gap 2 has been substantially addressed** through the community submission system — the product now has a scalable, crowdsourced mechanism for detecting rate changes, with quality controls (dedup, rate limiting, admin review) and participation incentives (contributor badges). This shifts the operational model from "team monitors all bank T&Cs" to "community detects, admin verifies."

Gap 1 (manual logging) remains the honest constraint. The product reduces the **cognitive complexity** of miles optimization from ~30 minutes/week of spreadsheet work to ~20 seconds per transaction. Data freshness improvements (focus-based screen refresh, instant cap recalculation after logging) tighten the feedback loop so manual effort feels more immediately rewarding. But it won't fully deliver on the "zero effort" promise until bank API integration exists.

### Bottom Line

The problem-solution fit is strong on the **decision** side (which card to use), the **awareness** side (cap status, miles visibility), and now **increasingly strong on the data accuracy** side (community-driven rate change detection). It remains weaker on the **data capture** side (still manual logging). The product now has two clear next steps: (1) automated rate scraping (F25) to complement community submissions, and (2) bank API integration to eliminate manual logging. The community submission system also introduces a nascent **network effect** — as more users join, data freshness improves for everyone, creating a defensible advantage.

---

## Appendix A: Feature-to-Friction Mapping

```
FRICTION                              FEATURE                         STATUS
─────────────────────────────────────────────────────────────────────────────
F1: Wrong card selection        ──→   Recommendation Engine (F2)      [SOLVED]
F2: Cap breaches                ──→   Cap Tracker (F3) + Alerts (F6)  [SOLVED]
F3: Checkout decision fatigue   ──→   Category Grid Home (UX)         [SOLVED]
F4: Frequent rule changes       ──→   Rate Change Alerts (F23)        [MOSTLY SOLVED]
                                      Community Submissions (F24)     [IMPLEMENTED]
                                      Automated Scraping (F25)        [PLANNED]
F5: No miles visibility         ──→   Miles Portfolio (F13)           [SOLVED]
F6: No proof of value           ──→   Earning Insights (F7)           [PARTIAL]
F7: Manual tracking fatigue     ──→   Transaction Logging (F4)        [PARTIAL]
                                      Data Freshness (useFocusEffect) [IMPLEMENTED]
                                      Bank API (v2)                   [PLANNED]
```

## Appendix B: What Changed in v1.1 (Post-Sprint 13)

| Area | Before (v1.0) | After (v1.1) | Impact |
|------|---------------|--------------|--------|
| **F4 Status** | Partially solved (admin-triggered only) | Mostly solved (community + admin) | Upgraded |
| **Gap 2 Risk** | Medium | Low-Medium | Downgraded |
| **Community Submissions** | Mentioned but not implemented | Full workflow with dedup, rate limiting, admin review, contributor badges | Gap directly addressed |
| **Data Freshness** | Mount-only data fetch (stale tabs) | Focus-based refresh across all tabs | UX friction reduced |
| **Post-Transaction Feedback** | Delayed cap update | Instant cap recalculation + alert check | Feedback loop tightened |
| **Detection Source Tracking** | Not tracked | `manual` / `community` / `automated` columns | Audit trail + migration path |
| **Overall Score** | 8.2 / 10 | 8.5 / 10 | +0.3 |
