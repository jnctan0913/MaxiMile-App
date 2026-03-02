# MaxiMile — UAT Moderator Guide
### INTERNAL — Do Not Share With Participants

**Version**: 1.1
**Date**: 2026-03-01
**Session Duration**: 50–60 minutes
**Format**: Moderated in-person — Web App + Think-Aloud + Post-Session Interview

---

## Moderator Overview

This guide is your complete playbook for running a MaxiMile UAT session. Read it fully before your first session. Each section tells you exactly what to say, what to watch for, how to record it, and what to do when things go wrong.

**Your two jobs as moderator:**
1. Create a safe, neutral space where the participant feels comfortable thinking aloud
2. Observe and record behaviour, not opinions — what they *do* matters as much as what they *say*

---

## Roles

| Role | Responsibility |
|------|----------------|
| **Moderator** | Reads tasks, manages timing, asks probing questions, stays neutral |
| **Note-taker** | Records observations, quotes, timestamps, severity flags in real-time |
| **Observer (optional)** | Silent. Watches via screen share or secondary screen. No interaction. |

---

## Pre-Session Setup Checklist

**App (Iphone)**
- [ ] Open [Link] in Safari
- [ ] Tap Share
- [ ] “Add to Home Screen”, Name as "MaxiMile"
- [ ] Open the icon from your Home Screen

**Account**
- [ ] Prepare a sign up email that has emaiil access: [Your email]
- [ ] Prepare a password reference for the user: [Your password]

**Room & Equipment**
- [ ] Master Findings Log printed (one per session — see Appendix B)
- [ ] Participant Script — 1 copy per participantr

**Data Hygiene**
- [ ] Confirm browser is fully logged out and cache is cleared between sessions 

---

## Moderator Ground Rules — Read Before Every Session

These are non-negotiable. Violating them introduces bias and invalidates your data.

| Rule | What To Do | What NOT To Do |
|------|-----------|----------------|
| **Never answer "how do I...?" questions** | Say: *"What would you try?"* or *"What are you looking for right now?"* | Tell them where to click, even when they're frustrated |
| **Prompt think-aloud** when they go quiet for >10 seconds | Say: *"Can you tell me what you're thinking right now?"* | Stay silent — you'll miss the richest data |
| **Do not lead** | Ask: *"What did you expect to happen there?"* | Ask: *"Did you find that confusing?"* (leading) |
| **Time every task** | Start timer when you finish reading the task; stop when participant says "done" or gives up | Forget to record times — they are key metrics |
| **Task failure protocol** | If participant cannot complete after ~3 minutes, say: *"Let's move on to the next task."* Mark as **Fail** on your sheet | Keep pushing — you'll stress the participant and skew later tasks |
| **Record quotes verbatim** | Write their exact words in quotes | Paraphrase or interpret in the moment |

---

## Session Flow

```
[0–5 min]    Welcome, consent, briefing
[5–10 min]   Pre-session screener (verbal)
[10–15 min]  Scenario 1: Sign Up
[15–22 min]  Scenario 2: Onboarding
[22–32 min]  Scenario 3: Card Recommendation
[32–38 min]  Scenario 4: Log Transaction + Edit
[38–44 min]  Scenario 5: Bonus Cap
[44–49 min]  Scenario 6: Miles Dashboard
[49–58 min]  Post-session interview + SUS
[58–60 min]  Wrap-up, thank you
```

---

## Opening Script (Read Aloud — Word for Word)

> *"Hi [name], thank you so much for joining us today. My name is [your name] and this is [note-taker name], who'll be taking some notes.*
>
> *Today we're testing an app called MaxiMile — it's a credit card miles optimizer for Singapore. The goal is to see how easy the app is to use. I want to be really clear: **we are testing the app, not you**. If something doesn't work the way you expect, that's incredibly useful feedback — it means we need to improve something.*
>
> *As you use the app, I'm going to ask you to **think out loud** — tell me what you're looking for, what you expect to happen, and anything that surprises or confuses you. I'll sometimes ask you questions about what you're thinking. I won't answer questions about how to use the app — not because I'm being unhelpful, but because we genuinely want to see how you'd naturally approach it.*
>
> *The session will take about 50–60 minutes. We'd like to record the screen and audio for our internal research. Is that okay with you?*
>
> *Do you have any questions before we start?"*

---

## Scenario 1: Sign Up & Account Activation

**Epic**: Authentication (Pre-Epic)
**Time Budget**: ~2 minutes
**Value Being Tested**: Can new users enter the product without friction?

### What to Say

> *"We're going to start by creating a new account on MaxiMile. I'll describe the task, and then I'd like you to try to complete it while thinking out loud."*

**Task 1A** *(read aloud)*:
> *"Please create a new account on MaxiMile. Use any [email_address] & [password]"*

▶ **Start timer.**

**Task 1B** *(read aloud after Task 1A)*:
> *"Now check your email and follow the instructions to activate your account."*

▶ **Stop timer when participant confirms account is active.**

---

### What to Observe & Record

| Observation Point | Notes | Severity if Fails |
|-------------------|-------|------------------|
| Does user find the sign-up CTA without scrolling or hesitation? | | Minor |
| Does user pause or express confusion at any form field? Which field? | | Minor |
| Does user attempt to submit with errors? What errors appear? | | Minor |
| Does confirmation email arrive within 60 seconds? | | Major |
| Does user check spam folder? | | Minor |
| Does activation link work on first click? | | **Critical** |
| Does user express frustration or confusion at any point? (quote verbatim) | | |

**Timing**

| Task | Start Time | End Time | Duration | Pass / Fail |
|------|-----------|---------|---------|------------|
| 1A — Create account | | | | |
| 1B — Email activation | | | | |

**Task Outcome**

| Task | Completed Without Help? | Completed With Help? | Failed |
|------|------------------------|---------------------|--------|
| 1A Sign Up | ☐ | ☐ | ☐ |
| 1B Email Activation | ☐ | ☐ | ☐ |

### Post-Scenario Interview (Say These Questions)

> *"Quick check-in before we move on."*

1. *"Was creating your account straightforward? Was anything unclear?"*
2. *"How long did it feel like you were waiting for the confirmation email?"*
3. *"Did anything during sign-up confuse you?"*

**Record Responses**:

_________________________________________________________________

_________________________________________________________________

---

## Scenario 2: Onboarding — Building the Card Portfolio

**Epic**: Epic 1 — Card Portfolio Management (P0 MVP)
**Time Budget**: ~7 minutes (including 1-minute free exploration)
**Value Being Tested**: Can users set up their portfolio — the foundation for all personalised recommendations?

> **MODERATOR NOTE**: The participant is using their real, freshly created account. There is no pre-loaded data. They will add cards themselves during this scenario. For consistency across sessions, ask all participants to add the same 5 cards so that downstream scenarios (recommendation, cap tracking) produce comparable results.

### What to Say

> *"Now the app will walk you through a setup process. I'd like you to follow the steps that appear, while continuing to think out loud."*

**Task 2A** *(read aloud)*:
> *"Please follow the onboarding steps as they appear on screen."*

▶ **Start timer.**

**Task 2B** *(read aloud when card-adding step is reached)*:
> *"As part of setup, please add these three cards to your profile*

▶ **Stop timer when all 3 cards are added and onboarding is complete.**

**Free Exploration** *(say this immediately after onboarding completes)*:
> *"You've completed setup. Take about a minute to freely explore the app — click on whatever catches your interest. I'll let you know when the minute is up."*

▶ **Set a 1-minute timer. Note-taker: record every section the participant visits.**

---

### What to Observe & Record

| Observation Point | Notes | Severity if Fails |
|-------------------|-------|------------------|
| Does user understand what onboarding is asking them to do? | | Major |
| Can user find all 3 cards via search without help? | | Major |
| Does user read the earn rates / cap info shown? Do they seem to understand? | | Minor |
| Does user ask "what does mpd mean?" or express terminology confusion? | | Minor |
| Does user hesitate before adding any specific card? Which one? | | Minor |
| Does user try to skip or rush through any step? | | Minor |

**Free Exploration — Navigation Tracking** *(1-minute window)*

| Section Visited | Time Spent | Any Verbal Reaction |
|----------------|-----------|-------------------|
| | | |
| | | |
| | | |
| | | |

**Timing**

| Task | Start Time | End Time | Duration | Pass / Fail |
|------|-----------|---------|---------|------------|
| Onboarding + 3 cards added | | | | |

**Task Outcome**

| Task | Completed Without Help? | Completed With Help? | Failed |
|------|------------------------|---------------------|--------|
| Onboarding complete | ☐ | ☐ | ☐ |
| All 3 cards added | ☐ | ☐ | ☐ |

### Post-Scenario Interview

> *"Quick check-in."*

1. *"Were the instructions during setup clear? Was anything confusing?"*
2. *"Did you feel like you understood why you were adding these cards?"*
3. *"After exploring for a minute — which part caught your attention most, and why?"*

**Record Responses**:

_________________________________________________________________

_________________________________________________________________

---

## Scenario 3: Smart Card Recommendation at Point of Payment

**Epic**: Epic 2 — Smart Card Recommendation (P0 MVP)
**Time Budget**: ~10 minutes
**Value Being Tested**: THE core value proposition — can users get the right recommendation instantly, and do they trust it?

> **MODERATOR ALERT — This is the most important scenario.** Observe rigorously. Record hesitation moments with timestamps. The hypothesis fails if users cannot self-navigate to a recommendation within 10 seconds without prompting.

### What to Say

> *"For the next two tasks, I'd like you to imagine some real-life situations. I'll describe each one, then ask you to use the app to help you."*

**Task 3A** *(read aloud)*:
> *"Imagine you're at a merchant and about to pay a \$45 bill. You want to earn the most miles possible from this purchase. Use the app to find out which credit card you should use."*

▶ **Start timer the moment you finish reading.**

▶ **Stop timer when participant says "I'd use [card name]" or "done."**

**If participant is stuck after 3 minutes**: Say *"Let's move on"* and mark Task 3A as **Fail**.

---

**Task 3B** *(read aloud after Task 3A debrief)*:
> *"Now imagine you're about to make a \$120 online purchase — shopping online. Which card would the app recommend for this?"*

▶ **Start timer. Stop when participant says "done."**

---

### What to Observe & Record

**Task 3A — Navigation Path Tracking** *(record every tap/click)*

| Step # | Action Taken by Participant | Time from Start | Correct Path? |
|--------|---------------------------|----------------|--------------|
| 1 | | | ☐ Yes ☐ No |
| 2 | | | ☐ Yes ☐ No |
| 3 | | | ☐ Yes ☐ No |
| 4 | | | ☐ Yes ☐ No |
| 5 | | | ☐ Yes ☐ No |

| Observation Point | Notes | Severity if Fails |
|-------------------|-------|------------------|
| Does user navigate to recommendation without any guidance? | | **Critical** |
| Does user hesitate > 5 seconds on any screen? Which screen? | | Major |
| Does user tap the wrong section before finding the right one? | | Major |
| Does user read and act on the recommendation? | | **Critical** |
| Does user express understanding of *why* this card (earn rate, cap)? | | Major |
| Does user express confidence: *"Oh great, easy"*? Or doubt: *"I'm not sure this is right"*? | | Major |

**Task 3B — Comparison**

| Observation Point | Notes |
|-------------------|-------|
| Is Task 3B faster than 3A? (expect: yes — learning effect) | |
| Does user understand different categories earn different rates? | |
| Does user compare Task 3A and 3B results without being asked? | |

**Timing**

| Task | Start Time | End Time | Duration | Pass / Fail |
|------|-----------|---------|---------|------------|
| 3A — Dining recommendation | | | | |
| 3B — Online recommendation | | | | |

**Task Outcome**

| Task | Completed Without Help? | Completed With Help? | Failed |
|------|------------------------|---------------------|--------|
| 3A Dining | ☐ | ☐ | ☐ |
| 3B Online | ☐ | ☐ | ☐ |

### Post-Scenario Interview

> *"Before we move on, a few questions about that experience."*

1. *"Was it easy to find which card to use? What was the first thing you looked for?"*

   Response: _________________________________________________________________

2. *"Did you understand why that card was recommended over the others?"*

   Response: _________________________________________________________________

3. *"On a scale of 1 to 5, how confident would you be to actually use that card in a real situation? Why did you give that score?"*

   Score: _______ &nbsp;&nbsp; Reason: _________________________________________________________________

4. *"Was there anything missing from the recommendation that would have made you more confident?"*

   Response: _________________________________________________________________

> **Moderator note**: Score of ≥ 4 is the target for recommendation trust. If you're hearing scores of 3 or lower across participants, flag as a **Major** issue.

---

## Scenario 4: Transaction Logging & Error Recovery

**Epic**: Epic 3 — Spending & Cap Tracking (P0 MVP)
**Time Budget**: ~6 minutes
**Value Being Tested**: Can users complete the Recommend → Pay → Log loop? Can they correct mistakes?

### What to Say

**Task 4A** *(read aloud)*:
> *"You just paid the \$45 restaurant bill using the card the app recommended. Use the app to log this transaction so it can track your spending and rewards."*

▶ **Start timer. Stop when participant says "done" and the transaction appears saved.**

---

**Task 4B** *(read aloud immediately after 4A)*:
> *"You just noticed you entered the wrong amount — it should have been \$52, not \$45. Use the app to correct this."*

▶ **Start timer. Stop when participant successfully edits the transaction.**

---

### What to Observe & Record

| Observation Point | Notes | Severity if Fails |
|-------------------|-------|------------------|
| Can user find the logging entry point without help? | | **Critical** |
| Does user understand all the fields (amount, category, card)? | | Major |
| Does user hesitate or express uncertainty at any field? Which one? | | Minor |
| Does user verify the transaction was saved? How do they check? | | Minor |
| Does any screen confirm miles earned from this transaction? Does user notice? | | Informational |
| For Task 4B: Can user find edit/delete option? Is it discoverable? | | **Critical** |
| Does user try long-press, swipe, or menu to edit? Note the method. | | Major |

**Timing**

| Task | Start Time | End Time | Duration | Pass / Fail |
|------|-----------|---------|---------|------------|
| 4A — Log transaction | | | | |
| 4B — Edit transaction | | | | |

**Task Outcome**

| Task | Completed Without Help? | Completed With Help? | Failed |
|------|------------------------|---------------------|--------|
| 4A Log | ☐ | ☐ | ☐ |
| 4B Edit | ☐ | ☐ | ☐ |

### Post-Scenario Interview

1. *"Was it easy to log your transaction? What was the hardest part, if any?"*

   Response: _________________________________________________________________

2. *"Was it clear what each field meant?"*

   Response: _________________________________________________________________

3. *"When you needed to correct a mistake, was it easy to figure out how?"*

   Response: _________________________________________________________________

4. *"Did you feel confident that the transaction was saved correctly?"*

   Response: _________________________________________________________________

---

## Scenario 5: Bonus Cap Awareness

**Epic**: Epic 3 — Spending & Cap Tracking (P0 MVP)
**Time Budget**: ~6 minutes
**Value Being Tested**: Can users find cap tracking, understand what it means, and reason about what they would do as their cap fills up?

> **MODERATOR NOTE**: The participant's account has only the transaction they just logged in Scenario 4. The cap will show minimal usage — that is expected and intentional. This scenario tests **discoverability and comprehension** of the cap tracking feature, not a near-cap alert state. Focus your observation on whether the user understands the concept and can explain the implication in their own words. Ask them to imagine the cap filling up.

### What to Say

**Task 5A** *(read aloud)*:
> *"You've been using your Citi Rewards card for dining this month. Use the app to find out how much of your monthly bonus cap you've used and how much is remaining."*

▶ **Start timer. Stop when participant locates and reads cap information.**

---

**Task 5B** *(read aloud after 5A — no navigation required)*:
> *"Imagine it's now the end of the month and you're getting close to that cap limit. Based on what you see here, what do you think you'd do next?"*

*(Verbal/think-aloud question — no timer needed.)*

---

### What to Observe & Record

| Observation Point | Notes | Severity if Fails |
|-------------------|-------|------------------|
| Can user locate cap information without guidance? | | **Critical** |
| Does user understand what the numbers mean (amount used vs amount remaining vs total cap)? | | Major |
| Does user understand the implication without prompting — that they should switch cards when cap is reached? | | Major |
| Does user express interest in or awareness of what would happen when the cap is full? | | Major |
| Does the app provide any visual indicator of cap progress (e.g., progress bar)? Does user notice it? | | Informational |
| Does user ask "what happens when I hit the cap?" — indicating they understand the concept but want more from the UI? | | Minor |

**Timing**

| Task | Start Time | End Time | Duration | Pass / Fail |
|------|-----------|---------|---------|------------|
| 5A — Find cap status | | | | |

**Task Outcome**

| Task | Completed Without Help? | Completed With Help? | Failed |
|------|------------------------|---------------------|--------|
| 5A Cap found | ☐ | ☐ | ☐ |

**Cap Comprehension Check** *(post-task — ask participant to explain in their own words)*

> *"Can you explain in your own words what that number is telling you?"*

| Classification | What They Said |
|---------------|----------------|
| ☐ Fully correct | |
| ☐ Partially correct | |
| ☐ Incorrect / confused | |

### Post-Scenario Interview

1. *"Was the bonus cap information presented clearly?"*

   Response: _________________________________________________________________

2. *"Can you explain in your own words what that number means?"*

   Response: _________________________________________________________________

3. *"If you were getting close to hitting that cap, would this screen give you enough information to decide what to do? What would you do?"*

   Response: _________________________________________________________________

---

## Scenario 6: Miles Earned — Seeing the Value

**Epic**: Epic 4 — Miles Performance & Insights (P1)
**Time Budget**: ~5 minutes
**Value Being Tested**: Can users find the miles summary section? Do they understand its purpose and feel motivated by what it promises to show over time?

> **MODERATOR NOTE**: The participant's account has only 1 logged transaction from this session. The dashboard will show limited real data — this is expected and intentional. Do not apologise for this or explain it. The goal is to test **discoverability** (can they find it?) and **comprehension** (do they understand what it will show them?). For the value question, ask them to imagine they've been using the app for a few weeks — you are testing the *concept* of the feature, not the richness of the data.

### What to Say

**Task 6A** *(read aloud)*:
> *"Imagine you've been using MaxiMile for a few weeks and you want to see a summary of how many miles you've been earning. Where in the app would you go to find that?"*

▶ **Start timer. Stop when participant locates the miles/dashboard section.**

---

**Task 6B** *(read aloud after 6A — no navigation required)*:
> *"Looking at this screen — even if it doesn't have much data yet — what do you think this section is meant to show you? Does it tell you what you want to know?"*

*(Verbal question — no timer.)*

---

### What to Observe & Record

| Observation Point | Notes | Severity if Fails |
|-------------------|-------|------------------|
| Can user navigate to Miles / Dashboard section without help? | | Major |
| Does user understand what the section is for, even with limited data? | | Major |
| Does user express that they'd want to come back to this screen after more usage? | | Informational (retention signal) |
| Does user express confusion about why data is limited, or frustration at lack of content? | | Minor |
| Does user express excitement about what the screen *could* show over time? | | Informational (PLG signal) |
| Does user mention wanting to share earnings with someone? | | Informational (PLG signal) |

**Timing**

| Task | Start Time | End Time | Duration | Pass / Fail |
|------|-----------|---------|---------|------------|
| 6A — Find miles summary | | | | |

**Task Outcome**

| Task | Completed Without Help? | Completed With Help? | Failed |
|------|------------------------|---------------------|--------|
| 6A Dashboard found | ☐ | ☐ | ☐ |

**Emotional Response** *(circle one)*

Positive (enthusiastic, engaged) &nbsp;&nbsp;&nbsp; Neutral &nbsp;&nbsp;&nbsp; Negative (confused, disappointed)

Quote: _________________________________________________________________

### Post-Scenario Interview

1. *"Based on what you see here, what do you think this section of the app is for?"*

   Response: _________________________________________________________________

2. *"If you had been using the app for a month, what would you hope to see on this screen?"*

   Response: _________________________________________________________________

3. *"Would you come back to check this screen regularly? What would make you want to?"*

   Response: _________________________________________________________________

---

## Post-Session Interview (10 Minutes)

> *"You've completed all the tasks — thank you. I have a few broader questions before we wrap up."*

| # | Ask This | Record Response |
|---|----------|----------------|
| Q1 | *"If you had to describe MaxiMile to a friend in one sentence, what would you say?"* | |
| Q2 | *"What was the single most useful thing the app did for you today?"* | |
| Q3 | *"Was there a moment where you thought 'this is exactly what I needed'? Describe it."* | |
| Q4 | *"Was there a moment where you felt frustrated or lost? Describe it."* | |
| Q5 | *"On a scale of 0 to 10, how likely would you be to recommend this app to a friend who uses multiple credit cards for miles?"* | NPS: _______ |
| Q6 *(if NPS < 7)* | *"What would need to change for you to give it a higher score?"* | |
| Q7 | *"Did you understand the difference between bank reward points and airline miles in the app?"* | ☐ Yes ☐ Somewhat ☐ No |
| Q8 | *"Were there any features you expected to find but couldn't?"* | |

---

## SUS Administration

> *"I'm going to read you 10 short statements. For each one, please tell me a number from 1 to 5 — where 1 means you strongly disagree and 5 means you strongly agree. Just go with your gut — no need to overthink."*

| # | Statement | Score |
|---|-----------|-------|
| 1 | I think I would like to use this app frequently. | _______ |
| 2 | I found the app unnecessarily complex. | _______ |
| 3 | I thought the app was easy to use. | _______ |
| 4 | I think I would need help from a technical person to use this app. | _______ |
| 5 | I found the various functions in the app were well integrated. | _______ |
| 6 | I thought there was too much inconsistency in this app. | _______ |
| 7 | I would imagine that most people would learn to use this app very quickly. | _______ |
| 8 | I found the app very cumbersome to use. | _______ |
| 9 | I felt very confident using the app. | _______ |
| 10 | I needed to learn a lot of things before I could get going with this app. | _______ |

**SUS Calculation** (calculate after participant leaves):

- Odd items (1,3,5,7,9): subtract 1 from each score
- Even items (2,4,6,8,10): subtract each score from 5
- Sum all adjusted scores, multiply by 2.5

**Raw SUS Score**: _______ &nbsp;&nbsp;&nbsp; **Calculated Score (×2.5)**: _______

| Score Range | Grade | Interpretation |
|-------------|-------|----------------|
| ≥ 80.3 | A — Excellent | Users find it easy and satisfying |
| 68–80 | B — Good | Above average usability |
| 51–68 | C — OK | Average; improvement needed |
| < 51 | F — Poor | Serious usability problems |

**Target**: ≥ 72

---

## Post-Session Debrief (Complete Within 30 Minutes)

Do this immediately after the participant leaves, while memory is fresh.

- [ ] Complete Master Findings Log (Appendix B) for all issues observed
- [ ] Calculate SUS score
- [ ] Record NPS score
- [ ] Flag any **Critical** issues immediately to product lead via [Slack / WhatsApp / email]
- [ ] Rate overall session: ☐ Smooth &nbsp; ☐ Some friction &nbsp; ☐ Major blockers
- [ ] Write 1 sentence: the single most memorable observation from this participant

**Most Memorable Observation**:

_________________________________________________________________

---

## Appendix B: Master Findings Log

*Complete one row per issue. Use during and after the session.*

| ID | Session # | Scenario | What Happened | Participant Quote | Severity | Epic Affected | Recommended Fix |
|----|-----------|----------|---------------|-----------------|----------|---------------|----------------|
| F01 | | | | | | | |
| F02 | | | | | | | |
| F03 | | | | | | | |
| F04 | | | | | | | |
| F05 | | | | | | | |
| F06 | | | | | | | |
| F07 | | | | | | | |
| F08 | | | | | | | |
| F09 | | | | | | | |
| F10 | | | | | | | |

**Severity Definitions**

| Level | Definition | Required Action |
|-------|-----------|----------------|
| **Critical** | Blocks task completion; user cannot proceed | Fix before any launch or demo |
| **Major** | Task completed with significant difficulty or wrong understanding | Fix in next sprint |
| **Minor** | Small friction; user recovers without help | Backlog for next improvement cycle |
| **Cosmetic** | Visual / copy issue; no functional impact | Low-priority polish |

---

## Appendix D: UAT Pass/Fail Success Criteria

At the end of all sessions, aggregate across all participants and check against these thresholds.

| Criterion | Metric | Threshold | Actual Result | Pass / Fail |
|-----------|--------|-----------|--------------|------------|
| Sign-up completion | % completing email activation | ≥ 90% | | |
| Onboarding completion | % adding all 3 cards | ≥ 90% | | |
| Recommendation found without help (3A) | % self-navigating | ≥ 80% | | |
| Time to recommendation < 10s (3A) | % of participants | ≥ 70% | | |
| Recommendation trust score | Mean score (1–5) | ≥ 4.0 | | |
| Transaction logged correctly | % completing 4A | ≥ 85% | | |
| Edit transaction without help | % completing 4B | ≥ 80% | | |
| Bonus cap found without help | % self-navigating | ≥ 80% | | |
| Cap comprehension (explained correctly) | % correct explanation | ≥ 70% | | |
| Miles dashboard found without help | % self-navigating | ≥ 75% | | |
| SUS Score | Mean across all participants | ≥ 72 | | |
| Zero Critical severity issues | Count of Criticals | 0 | | |

**Overall UAT Outcome**: ☐ **PASS** — proceed to launch &nbsp;&nbsp; ☐ **CONDITIONAL** — fix Majors first &nbsp;&nbsp; ☐ **FAIL** — Critical issues must be resolved

---

*Moderator Guide — INTERNAL — v1.1 — 2026-03-01*
*Do not share with participants*
