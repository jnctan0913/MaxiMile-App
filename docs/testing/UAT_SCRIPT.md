# UAT Script: MaxiMile — Credit Card Miles Optimizer

**Version**: 1.0
**Date**: 2026-03-01
**Converted From**: UAT Script (Draft).pdf
**Prepared By**: PM Agent
**Testing Format**: Moderated in-person session — Web App + User Interview
**Estimated Session Duration**: 50–60 minutes

---

## UAT Analysis: Strengths & Weaknesses of Draft Script

### Strengths

| # | Strength | Why It Matters |
|---|----------|----------------|
| S1 | Think-aloud protocol correctly instructed | Industry-standard qualitative method; surfaces mental models |
| S2 | Realistic task framing (restaurant scenario) | Matches primary persona Maya's exact pain point at POS |
| S3 | 3-column table (Task / Observe / Metrics) | Clean, facilitator-friendly format |
| S4 | 1-minute free-exploration after onboarding | Reveals organic navigation behaviour and unexpected discoveries |
| S5 | Standardised card seed data (Citi Rewards, Citi PremierMiles, DBS Altitude) | Ensures consistent, comparable test conditions across participants |
| S6 | Edit/Delete transaction task included | Tests error-recovery path, which is essential for trust |
| S7 | Per-scenario feedback questions | Closes each scenario with targeted qualitative probes |

### Weaknesses & Gaps

| # | Weakness | Impact | Recommendation |
|---|----------|--------|----------------|
| W1 | Scenario 4 objective copy-pasted from Scenario 3 | Breaks credibility; wrong objective = wrong success criteria | Correct to: "assess whether users can easily log a transaction and feel confident it was recorded" |
| W2 | Single spend category tested (dining only) | Cannot validate recommendation accuracy across categories; user mental model transfer untested | Add 2nd scenario with different category (online shopping or transport) |
| W3 | Recommendation *trust* not probed | Core value = *confidence* at checkout, not just navigation success | Add: "Do you trust this recommendation? Why / why not?" |
| W4 | Miles-savings visibility (Epic 4) entirely absent | Retention hook and proof of value not tested; users may not see *why* the app is worth keeping | Add Miles Dashboard scenario post-logging |
| W5 | Cap scenario is passive only | Does not test F6 (Cap Approach Alerts) — the proactive alert is a core differentiator | Add: trigger near-cap state, observe if user notices alert |
| W6 | No cross-scenario narrative continuity | Recommend → Pay → Log → Cap → Savings are tested as isolated tasks, not as a flow | Reframe as a single continuous user journey |
| W7 | No usability benchmark (SUS, NPS) | No industry-standard output for test report | Add post-session SUS questionnaire + NPS |
| W8 | No pre-session screener | Unknown if participants match target persona | Add 5-question screener before session |
| W9 | No facilitator protocol | Inconsistent moderation across sessions | Add facilitator guide with prompting rules |
| W10 | No severity rating framework | Cannot triage findings post-session | Add Critical / Major / Minor / Cosmetic taxonomy |
| W11 | Edit/Delete marked "(If Needed)" | Error recovery is mandatory for trust | Make mandatory |
| W12 | End-of-session questions too vague | "Any other feedback?" produces noise | Map to specific product hypotheses |

---

## Product Value Proposition: What UAT Must Prove

> **Core Hypothesis**: A context-aware mobile app that automatically recommends the optimal credit card at point of payment — based on spend category, remaining bonus cap, and user portfolio — eliminates the cognitive burden of miles optimization and turns complexity into a confident, one-tap decision.

The UAT must validate these **3 critical value assertions**:

| Assertion | What We're Testing | EPIC |
|-----------|--------------------|------|
| **V1 — Instant clarity at checkout** | User can get the right card recommendation in <10 seconds without help | Epic 2 (E2) |
| **V2 — Confident cap awareness** | User knows when they're approaching a bonus cap and acts on it | Epic 3 (E3) |
| **V3 — Visible value earned** | User can see how many miles they've earned/saved using the app | Epic 4 (E4) |

If V1, V2, V3 are not validated in UAT, the product cannot demonstrate its value proposition to users or stakeholders.

---

## Testing Format: How to Run This UAT

### Format Overview

```
Format:    Moderated in-person session
Platform:  Web App (desktop or mobile browser)
Method:    Think-aloud observation + post-task interview
Duration:  50–60 minutes per participant
Participants: 5–8 (see screener below)
Environment: Quiet room, screen recording on (with consent), note-taker present
```

### Session Structure

```
[0–5 min]   Welcome & Consent
[5–10 min]  Pre-session Screener Interview
[10–45 min] Task Scenarios (Scenarios 1–7)
[45–55 min] Post-session Interview + SUS Questionnaire
[55–60 min] Wrap-up & Thank You
```

### Roles Required

| Role | Responsibility |
|------|----------------|
| **Facilitator** | Reads tasks, prompts think-aloud, stays neutral, does not help |
| **Note-taker** | Records observations, timestamps errors, flags severity |
| **Optional: Observer** | Silent observer (product team) via second screen or one-way glass |

### Facilitator Ground Rules

1. **Never answer "how do I do X?"** — say: *"What would you try?"* or *"What are you looking for?"*
2. **Prompt think-aloud** when participant goes silent for >10 seconds: *"Can you tell me what you're thinking right now?"*
3. **Do not react** to errors or confusion — maintain neutral expression
4. **Task failure protocol**: If participant cannot complete in 3 minutes, say *"Let's move on"* and mark as failure. Do not assist.
5. **Record task time** from when you finish reading the task to when participant says "done" or gives up

### Pre-Session Setup Checklist

- [ ] Web app loaded on test device, logged out, cleared cache
- [ ] Test account pre-created (email: `uat-test@maximile.app`, password: `UAT2026!`)
- [ ] Standardised card portfolio seeded: Citi Rewards, Citi PremierMiles, DBS Altitude
- [ ] Test transactions pre-loaded (for cap tracking scenarios — see Appendix A)
- [ ] Screen recording software running (Loom / QuickTime)
- [ ] Consent form signed
- [ ] Note-taking sheet printed (one per scenario)

---

## Pre-Session Screener

*Administered verbally by facilitator before starting tasks. Takes ~5 minutes.*

> "Before we start, I'd like to ask a few quick questions to understand your background. There are no right or wrong answers."

| # | Question | Why We Ask |
|---|----------|------------|
| Q1 | How many credit cards do you currently hold? | Validate primary persona (3+ cards = active optimizer) |
| Q2 | Do you actively track miles or rewards points? If yes, how? | Confirm pain point (spreadsheet / blog = Maya persona) |
| Q3 | How often do you think about which card to use when paying? | Calibrate friction level |
| Q4 | Have you ever missed a bonus cap or used the wrong card by mistake? | Validate problem exists for this participant |
| Q5 | How comfortable are you using apps on [device]? (1 = not comfortable, 5 = very comfortable) | Baseline digital literacy |

**Participant Classification**:
- **Active Optimizer** (target): 3+ cards, actively tracks, Q3 answer "often" or "always", experienced cap miss
- **Passive Holder**: 1–2 cards, does not track, matches Secondary Persona (Peter) — still valuable for discoverability testing

---

## Scenarios

---

### Scenario 0: Briefing (Do Not Skip)

*Read aloud to participant:*

> "Thank you for helping us test MaxiMile. This is a credit card miles optimizer app for Singapore. The goal today is to see if the app is easy to understand and use — not to test you personally. There are no wrong answers.
>
> As you complete the tasks, please **think aloud** — tell me what you're looking for, what you expect to happen, and anything that confuses or surprises you. I won't answer questions about how to use the app, but I want to hear everything you're thinking.
>
> We'll be recording the session. Is that okay?
>
> Do you have any questions before we begin?"

---

### Scenario 1: Sign Up & Account Activation

**Objective**: Verify that new users can create an account and activate it through email confirmation without friction.

**Epic Link**: Auth / Onboarding (Pre-Epic)

| Task | Facilitator Reads Aloud |
|------|------------------------|
| Create a new account | "Please create a new account on MaxiMile. Use any email address you'd like." |
| Activate via email | "Check your email and follow the instructions to activate your account." |

| What to Observe | Severity if Fails |
|-----------------|-----------------|
| Does user find sign-up CTA without scrolling or hesitation? | Minor |
| Does user pause at any form field? Which one? | Minor |
| Does confirmation email arrive within 60 seconds? | Major |
| Does user check spam folder? | Minor |
| Does activation link work correctly? | Critical |

**Metrics**

| Metric | How to Measure | Target |
|--------|---------------|--------|
| Sign-up completion rate | % of participants who complete email confirmation | ≥ 90% |
| Time to activated account | Stopwatch from task start to "account active" confirmation screen | < 3 min |
| Field error rate | Number of form validation errors triggered per participant | 0 |

**Post-Scenario Interview Questions**

1. Was creating your account straightforward? What, if anything, felt unclear?
2. How long did it feel like you were waiting for the email?
3. If the email had gone to your spam folder, how would you have felt?

---

### Scenario 2: Onboarding — Building Your Card Portfolio

**Objective**: Assess whether users can complete onboarding and correctly add their credit cards — the foundation for all recommendations.

**Epic Link**: Epic 1 — Card Portfolio Management (P0 MVP)

**Facilitator Note**: Use standardised card set. After the participant adds cards, allow 1 minute of free exploration before reading the next task.

| Task | Facilitator Reads Aloud |
|------|------------------------|
| Complete onboarding | "The app will now walk you through setup. Please follow the steps." |
| Add your cards | "Add these three cards to your profile: Citi Rewards, Citi PremierMiles, and DBS Altitude." |
| Free exploration | *(After onboarding)* "Feel free to click around for a minute. Explore whatever you'd like." |

| What to Observe | Severity if Fails |
|-----------------|-----------------|
| Does user understand what they're setting up and why? | Major |
| Can user find all 3 cards by search without facilitator help? | Major |
| Does user understand what the earn rates and caps shown mean? | Minor |
| Does user explore any section during free-play? Note which sections they visit. | Informational |
| Does user ask "what does mpd mean?" or any terminology question? | Minor |

**Metrics**

| Metric | How to Measure | Target |
|--------|---------------|--------|
| Onboarding completion rate | % who add all 3 cards without abandoning | ≥ 90% |
| Time to complete portfolio setup | Stopwatch | < 3 min |
| Unprompted exploration rate | % who visit ≥ 2 sections during free-play | Track (baseline) |

**Post-Scenario Interview Questions**

1. Were the instructions during setup clear? Was anything confusing?
2. Did you feel like you understood why you were adding these cards?
3. After exploring for a minute, what section caught your attention most, and why?

---

### Scenario 3: Core Value — Smart Card Recommendation at Point of Payment

**Objective**: Validate that users can get the right card recommendation **instantly**, **trust it**, and **understand the miles advantage** — this is the #1 value proposition of MaxiMile.

**Epic Link**: Epic 2 — Smart Card Recommendation (P0 MVP)

> **Why This Scenario Is Critical**: If users cannot get a confident answer in under 10 seconds without help, the product fails its primary hypothesis. This scenario must be observed rigorously.

**Task A — Dining (Primary Category)**

| Task | Facilitator Reads Aloud |
|------|------------------------|
| Find card for dining | "Imagine you're at a restaurant and about to pay a $45 bill. You want to earn the most miles. Use the app to find out which card to use." |

| What to Observe | Severity if Fails |
|-----------------|-----------------|
| Does user navigate to recommendation without guidance? | Critical |
| Does user hesitate > 5 seconds at any screen? At which screen? | Major |
| Does user tap wrong sections before finding the right one? Note the path. | Major |
| Does user read the recommendation and act on it? | Critical |
| Does user understand *why* this card was recommended (e.g., 4 mpd, cap remaining)? | Major |
| Does user express verbal confidence ("oh, that's easy") or confusion ("I'm not sure this is right")? | Major |

**Task B — Online Shopping (Second Category)**

| Task | Facilitator Reads Aloud |
|------|------------------------|
| Find card for online purchase | "Now imagine you're about to buy something online for $120. Which card would MaxiMile recommend for online spending?" |

> **Why Task B**: Tests if the user can apply the mental model they developed in Task A to a new category. Mental model transfer is evidence of intuitive UX.

| What to Observe | Severity if Fails |
|-----------------|-----------------|
| Is Task B faster than Task A? (Expected: yes — user has learned the flow) | Informational |
| Does user understand that different categories earn different rates? | Major |
| Does user compare Task A and Task B results without prompting? | Informational |

**Metrics**

| Metric | How to Measure | Target |
|--------|---------------|--------|
| Time to find recommendation (Task A) | Stopwatch: task read → user says "I'd use [card]" | < 10 seconds |
| Time to find recommendation (Task B) | Stopwatch | < 7 seconds (faster with learning) |
| Task completion rate (first attempt) | % who complete without facilitator assistance | ≥ 80% |
| Recommendation trust score | Post-task: "How confident are you this is the right card?" (1–5) | ≥ 4.0 mean |
| Navigation error rate | Wrong taps before reaching recommendation | 0 per task (target) |

**Post-Scenario Interview Questions**

1. Was it easy to find which card to use? What was the first thing you looked for?
2. Did you understand why that card was recommended over the others?
3. On a scale of 1–5, how confident are you that you would use the recommended card if this were a real situation? Why did you give that score?
4. Was there anything missing from the recommendation that would have made you more confident?

---

### Scenario 4: Transaction Logging & Confirmation

**Objective**: Assess whether users can log a transaction accurately and feel confident it was recorded — completing the Recommend → Pay → Log loop.

**Epic Link**: Epic 3 — Spending & Cap Tracking (P0 MVP)

| Task | Facilitator Reads Aloud |
|------|------------------------|
| Log the dining transaction | "You just paid $45 at the restaurant using the recommended card. Use the app to log this transaction." |
| Verify it was recorded | "Can you confirm the transaction was saved?" |

| What to Observe | Severity if Fails |
|-----------------|-----------------|
| Can user find the logging entry point without help? | Critical |
| Does user understand which fields to fill in (amount, category, card)? | Major |
| Does user feel uncertain at any field? | Minor |
| Does user verify the transaction was saved? How do they check? | Minor |
| Does any confirmation screen reinforce the miles earned from this transaction? | Informational (design gap if missing) |

**Metrics**

| Metric | How to Measure | Target |
|--------|---------------|--------|
| Task completion rate | % who successfully log and confirm transaction | ≥ 85% |
| Time to complete | Stopwatch | < 45 seconds |
| User confidence post-log | "Did you feel confident the transaction was recorded correctly?" (Y/N + why) | ≥ 80% Yes |

**Post-Scenario Interview Questions**

1. Was it easy to log your transaction? What was the hardest part?
2. Was it clear what each field meant?
3. Did you feel confident the transaction was saved correctly? How would you know if it wasn't?

---

### Scenario 4B: Error Recovery — Edit or Delete a Transaction (Mandatory)

**Objective**: Test whether users can correct a mistake — critical for building trust in data accuracy.

**Epic Link**: Epic 3 — Spending & Cap Tracking (P0 MVP)

| Task | Facilitator Reads Aloud |
|------|------------------------|
| Correct a mistake | "You just noticed you entered the wrong amount — it should have been $52, not $45. Use the app to fix this." |

| What to Observe | Severity if Fails |
|-----------------|-----------------|
| Can user find the edit option? | Critical |
| Is the path to edit/delete discoverable (e.g., long-press, swipe, menu)? | Major |
| Does user express confusion about how to make changes? | Major |

**Metrics**

| Metric | How to Measure | Target |
|--------|---------------|--------|
| Task completion rate | % who successfully edit transaction | ≥ 80% |
| Time to complete | Stopwatch | < 30 seconds |
| Discoverability | Did user find edit without facilitator help? | ≥ 80% Yes |

---

### Scenario 5: Bonus Cap Awareness — Proactive & Reactive

**Objective**: Validate that users can check their bonus cap status AND respond appropriately when a cap is approaching — the #2 retention driver and core differentiator.

**Epic Link**: Epic 3 — Spending & Cap Tracking (P0 MVP + F6 Cap Approach Alerts)

**Facilitator Note**: Before this scenario, ensure test data shows Citi Rewards card at ~85% of monthly bonus cap (pre-configured in Appendix A test dataset).

**Task A — Check Cap Status**

| Task | Facilitator Reads Aloud |
|------|------------------------|
| Check bonus cap | "You've been spending on your Citi Rewards card this month. Use the app to check how much of your bonus cap you have remaining." |

**Task B — Interpret a Near-Cap Alert**

| Task | Facilitator Reads Aloud |
|------|------------------------|
| Respond to cap alert | "The app is showing that you're close to your bonus cap. What would you do next?" |

| What to Observe | Severity if Fails |
|-----------------|-----------------|
| Can user locate cap information without guidance? | Critical |
| Does user understand what "bonus cap remaining" means? | Major |
| Does user notice the near-cap state without being prompted? | Major |
| Does user understand the implication (switch to another card soon)? | Major |
| Does the app suggest an alternative card? Does user notice this? | Informational |

**Metrics**

| Metric | How to Measure | Target |
|--------|---------------|--------|
| Cap findability rate | % who find cap info without facilitator help | ≥ 80% |
| Cap comprehension rate | Post-task: "Can you explain in your own words what that number means?" — mark correct/incorrect | ≥ 70% correct |
| Near-cap alert notice rate | % who notice alert without being told to look | ≥ 60% |
| Time to complete Task A | Stopwatch | < 20 seconds |

**Post-Scenario Interview Questions**

1. Was the bonus cap information presented clearly? Could you explain what it means in your own words?
2. When you saw that you were close to the cap, what did you think you should do?
3. Would this kind of alert change how you use your cards? Why or why not?

---

### Scenario 6: Miles Earned — Seeing the Value (NEW)

**Objective**: Validate that users can see the total miles they've earned through MaxiMile — the proof of product value and the primary retention hook.

**Epic Link**: Epic 4 — Miles Performance & Insights (P1)

> **Why This Scenario Is Critical**: If users cannot see how much value the app has delivered, they have no reason to keep using it. The miles dashboard is the emotional payoff of the entire product.

| Task | Facilitator Reads Aloud |
|------|------------------------|
| Find your miles summary | "After a few weeks of using MaxiMile, you're curious to see how many miles you've earned this month. Where would you go to see this?" |
| Understand miles saved | "Can you see if you've earned more miles than you would have without the app's recommendations?" |

| What to Observe | Severity if Fails |
|-----------------|-----------------|
| Can user navigate to the Miles/Dashboard section? | Major |
| Does user understand the difference between "earned" and "would have earned without app"? | Major |
| Does the data create an emotional response (surprise, satisfaction, motivation)? | Informational |
| Does user mention wanting to share this or show it to someone? | Informational (PLG signal) |

**Metrics**

| Metric | How to Measure | Target |
|--------|---------------|--------|
| Dashboard findability | % who navigate there without help | ≥ 75% |
| Value comprehension | Post-task: "Does this show you the value of the app?" (Y/N) | ≥ 70% Yes |
| Emotional response rate | % who express positive emotion (verbal or non-verbal) | Track (baseline) |

**Post-Scenario Interview Questions**

1. Looking at this screen, do you feel like the app is working for you? What tells you that?
2. Is the information here motivating? Does it make you want to keep using the app?
3. Is there anything you expected to see here that's missing?

---

## Post-Session: System Usability Scale (SUS)

*Administered immediately after all scenarios. Read each statement and have participant respond on a 1–5 scale: 1 = Strongly Disagree, 5 = Strongly Agree.*

> "I'll now read 10 quick statements about your experience today. Please answer with a number from 1 (strongly disagree) to 5 (strongly agree)."

| # | Statement | Score (1–5) |
|---|-----------|------------|
| 1 | I think I would like to use this app frequently | |
| 2 | I found the app unnecessarily complex | |
| 3 | I thought the app was easy to use | |
| 4 | I think I would need the support of a technical person to use this app | |
| 5 | I found the various functions in the app were well integrated | |
| 6 | I thought there was too much inconsistency in this app | |
| 7 | I would imagine that most people would learn to use this app quickly | |
| 8 | I found the app very cumbersome to use | |
| 9 | I felt very confident using the app | |
| 10 | I needed to learn a lot of things before I could get going with this app | |

**SUS Scoring**: Odd items: score − 1. Even items: 5 − score. Sum all, multiply by 2.5.
**Benchmarks**: ≥ 80.3 = Excellent (A), 68–80 = Good (B), 51–68 = OK (C), < 51 = Poor (F).
**Target for MaxiMile MVP**: ≥ 72 (Good).

---

## Post-Session: Qualitative Interview (10 minutes)

> "We're almost done. I have a few broader questions about your overall experience."

| # | Question | Maps To |
|---|----------|---------|
| Q1 | If you had to describe MaxiMile to a friend in one sentence, what would you say? | Core value proposition clarity |
| Q2 | What was the single most useful thing the app did for you today? | North Star Metric validation (MARU) |
| Q3 | Was there a moment where you thought "this is exactly what I needed"? Describe it. | "Aha moment" identification |
| Q4 | Was there a moment where you felt frustrated or lost? Describe it. | Critical usability issues |
| Q5 | On a scale of 0–10, how likely would you be to recommend this app to a friend who uses multiple credit cards for miles? | NPS baseline |
| Q6 | *(If NPS < 7)* What would need to change for you to give it a higher score? | Improvement prioritisation |
| Q7 | Did you understand the difference between bank points and airline miles in the app? | Knowledge gap validation (Pain Point 4 from PRD) |
| Q8 | What features, if any, did you expect to find but couldn't? | Feature gap discovery |

---

## Findings Log Template

*Complete one row per issue observed. Use this during the session.*

| # | Scenario | Observation | Participant Quote | Severity | Epic Affected |
|---|----------|-------------|-----------------|----------|---------------|
| 1 | | | | | |
| 2 | | | | | |

**Severity Definitions**:

| Level | Definition | Action Required |
|-------|-----------|----------------|
| **Critical** | Prevents task completion; blocks core value delivery | Fix before launch |
| **Major** | Task completed but with significant difficulty or confusion | Fix in next sprint |
| **Minor** | Small friction, user recovers quickly | Backlog for improvement |
| **Cosmetic** | Visual/copy issue, no functional impact | Low-priority polish |

---

## UAT Success Criteria

The product is ready to proceed post-UAT if **all** of the following are met:

| Criterion | Threshold | Epic |
|-----------|-----------|------|
| Sign-up completion rate | ≥ 90% | Auth |
| Onboarding completion rate | ≥ 90% | E1 |
| Card recommendation found without help (dining) | ≥ 80% | E2 |
| Time to recommendation < 10 seconds | ≥ 70% of participants | E2 |
| Recommendation trust score | ≥ 4.0 / 5.0 mean | E2 |
| Transaction logged correctly | ≥ 85% | E3 |
| Bonus cap found without help | ≥ 80% | E3 |
| Near-cap alert noticed unprompted | ≥ 60% | E3 |
| Miles dashboard found without help | ≥ 75% | E4 |
| SUS Score | ≥ 72 | Overall |
| Zero Critical severity issues | 0 critical bugs | All |

---

## Appendix A: Test Data Configuration

Pre-configure the UAT test account with the following state before each session:

| Card | Spend Category | Monthly Cap | Amount Pre-Spent | % Cap Used |
|------|---------------|------------|-----------------|-----------|
| Citi Rewards | Online / Shopping | $1,000 | $150 | 15% |
| Citi Rewards | Dining | $500 | $425 | **85%** (near-cap for Scenario 5) |
| Citi PremierMiles | All spend | $2,000 | $400 | 20% |
| DBS Altitude | Online | $2,000 | $200 | 10% |

**Why**: This configuration ensures:
1. Citi Rewards dining cap is near-full → triggers near-cap alert in Scenario 5
2. DBS Altitude and Citi PremierMiles have capacity → app should recommend them for Scenario 3
3. Scenario 6 (miles dashboard) shows meaningful earned miles data

---

## Appendix B: Participant Recruitment Brief

**Who to Recruit**:
- Age 25–45, Singapore-based
- Holds 3+ credit cards (minimum 2 miles cards)
- Spends $1,500+/month on credit cards
- Has heard of or uses miles programs (KrisFlyer, Asia Miles)
- **Not required**: prior experience with miles optimization apps (naive users are valuable)

**How Many**: 5 participants minimum (Nielsen: 5 users reveal ~85% of usability issues); 8 for higher confidence

**Channels**: Miles community Telegram groups, MileLion community, university alumni networks

**Incentive**: SGD 30–50 voucher per session

---

## Appendix C: Session Debrief Checklist

After each session, complete within 30 minutes while memory is fresh:

- [ ] Upload screen recording to shared folder
- [ ] Complete findings log (Appendix — Findings Log) for all observed issues
- [ ] Note participant's SUS score and NPS
- [ ] Flag any Critical issues immediately to product lead
- [ ] Rate overall session: Smooth / Some friction / Major blockers
- [ ] Note 1 most memorable observation from this participant
