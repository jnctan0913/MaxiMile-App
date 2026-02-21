# Survey Design Framework

This reference contains the full survey recommendation assessment and survey design framework for the market-researcher skill.

---

## Phase 3.1: Survey Recommendation Assessment

Before designing a survey, document why it is needed:

```markdown
## Primary Research Recommendation

### Is a Survey Needed?
| Criterion | Assessment | Rationale |
|-----------|-----------|-----------|
| Secondary data sufficiency | Sufficient / Gaps exist / Insufficient | [Explain what's missing] |
| Target segment coverage | Well-covered / Partially covered / Niche | [Explain gap] |
| Hypothesis validation needed | Yes / No | [List hypotheses to test] |
| Pricing sensitivity unknown | Yes / No | [What we need to learn] |
| Pain point intensity unmeasured | Yes / No | [What we need to quantify] |

### Recommendation
**[RECOMMEND SURVEY / RECOMMEND INTERVIEWS / NO PRIMARY RESEARCH NEEDED]**

**Justification**: [Why this recommendation, based on evidence gaps above]
```

---

## Phase 3.2: Full Survey Design Framework

When a survey is recommended, design it professionally using the complete framework below.

### Survey Metadata

```markdown
## User Survey Design

### Survey Metadata
| Field | Value |
|-------|-------|
| **Objective** | [What this survey aims to learn] |
| **Target Population** | [Who should respond] |
| **Sampling Method** | [Random / Convenience / Stratified / Snowball] |
| **Recommended Sample Size** | [Number with justification -- use confidence level 95%, margin of error 5%] |
| **Distribution Channel** | [Online panel, social media, email list, in-app, etc.] |
| **Estimated Completion Time** | [X minutes -- keep under 10 min for higher completion] |
| **Incentive** | [None / Discount / Gift card / Entry into draw] |
```

### Screening Questions

Purpose: Filter for qualified respondents

```markdown
### Screening Questions

| # | Question | Type | Qualifying Answer | Purpose |
|---|----------|------|------------------|---------|
| S1 | [Screening question] | Single choice | [Answer that qualifies] | [Why this filter] |
| S2 | [Screening question] | Single choice | [Answer that qualifies] | [Why this filter] |
```

### Survey Sections

#### Section 1: Demographics & Context

Purpose: Segment respondents for cross-analysis

```markdown
#### Section 1: Demographics & Context

| # | Question | Type | Options | Required | Analysis Purpose |
|---|----------|------|---------|----------|-----------------|
| Q1 | [Question text] | Single choice / Multi-select / Open | [Options] | Yes/No | [How this data will be used] |
| Q2 | [Question text] | [Type] | [Options] | Yes/No | [Analysis purpose] |
```

#### Section 2: Current Behavior & Pain Points

Purpose: Understand existing behavior and frustrations

```markdown
#### Section 2: Current Behavior & Pain Points

| # | Question | Type | Options | Required | Hypothesis Tested |
|---|----------|------|---------|----------|------------------|
| Q3 | [Question about current behavior] | [Type] | [Options] | Yes | [Which hypothesis] |
| Q4 | [Question about pain points] | Likert (1-5) | Strongly disagree -> Strongly agree | Yes | [Which hypothesis] |
| Q5 | [Frequency/intensity question] | Scale | [Range] | Yes | [Which hypothesis] |
```

#### Section 3: Solution Validation

Purpose: Test receptivity to proposed solution concepts

```markdown
#### Section 3: Solution Validation

| # | Question | Type | Options | Required | What We Learn |
|---|----------|------|---------|----------|--------------|
| Q6 | [Concept test question] | Likert (1-5) | Not at all interested -> Extremely interested | Yes | [Demand signal] |
| Q7 | [Feature preference] | Ranking / MaxDiff | [Features to rank] | Yes | [Priority signal] |
| Q8 | [Willingness to pay] | Single choice | [Price ranges] | Yes | [Pricing insight] |
```

#### Section 4: Willingness to Pay (Van Westendorp)

Purpose: Determine price sensitivity using the Van Westendorp Price Sensitivity Meter

```markdown
#### Section 4: Willingness to Pay (Van Westendorp)

**Van Westendorp Method** (4 questions):

| # | Question | Type |
|---|----------|------|
| Q9 | At what price would you consider this product to be so expensive that you would not consider buying it? | Open numeric |
| Q10 | At what price would you consider this product to be priced so low that you would question its quality? | Open numeric |
| Q11 | At what price would you consider this product starting to get expensive, but you'd still consider it? | Open numeric |
| Q12 | At what price would you consider this product a bargain -- a great buy for the money? | Open numeric |
```

**Van Westendorp Analysis Notes**:
- Plot cumulative distribution curves for all four price points
- The intersection of "too expensive" and "bargain" curves gives the **optimal price point**
- The intersection of "too cheap" and "expensive" curves gives the **indifference price point**
- The range between "too cheap/expensive" and "too expensive/bargain" intersections defines the **acceptable price range**
- Requires minimum ~30 responses for meaningful curves; 100+ recommended

**Alternative: Gabor-Granger Method**
- Use when testing a specific price point or small set of prices
- Present a price and ask: "Would you buy this product at $X?" (Yes/No)
- Vary the price across respondents or in follow-up questions
- Simpler to analyze but provides less granular data than Van Westendorp

#### Section 5: Open-Ended Feedback

Purpose: Capture unanticipated insights

```markdown
#### Section 5: Open-Ended Feedback

| # | Question | Type | Required |
|---|----------|------|----------|
| Q13 | What is the biggest challenge you face with [problem area]? | Open text | No |
| Q14 | Is there anything else you'd like to share? | Open text | No |
```

---

### Survey Logic & Branching

```
IF Q1 = [disqualifying answer] -> End survey (screen out)
IF Q3 = "Never" -> Skip Section 3 (no current behavior to validate against)
IF Q6 < 3 -> Ask Q6a: "What would make this more appealing?"
```

**Branching Best Practices**:
- Keep branching logic simple; complex branching confuses respondents and complicates analysis
- Always test the survey flow with branching before deploying
- Document all branching rules in the analysis plan so analysts know which questions each respondent saw
- Track completion rates at each branch point to identify drop-off issues

---

### Analysis Plan

| Question(s) | Analysis Method | Expected Output |
|-------------|----------------|-----------------|
| Q1-Q2 | Descriptive stats, cross-tabs | Segment profiles |
| Q3-Q5 | Frequency analysis, mean/median | Pain point severity ranking |
| Q6-Q8 | Descriptive stats, segment comparison | Demand validation, feature priorities |
| Q9-Q12 | Van Westendorp price sensitivity meter | Optimal price point, range of acceptable prices |
| Q13-Q14 | Thematic coding, word cloud | Emergent themes, unexpected insights |

**Analysis Workflow**:
1. Clean data: Remove incomplete responses, speeders (completion time < 1/3 of median), and straightliners
2. Run descriptive statistics for all closed-ended questions
3. Perform cross-tabulation by key demographic segments
4. Apply Van Westendorp analysis to pricing questions
5. Code open-ended responses into themes (minimum 2 independent coders for reliability)
6. Synthesize quantitative and qualitative findings into key insights
7. Flag findings with low sample sizes or high variance

---

### Bias Mitigation

| Bias | Risk | Mitigation |
|------|------|------------|
| **Leading questions** | Medium | All questions reviewed for neutral framing |
| **Order effects** | Low | Randomize option order where possible |
| **Social desirability** | Medium | Include indirect/projective questions |
| **Self-selection** | High | Note in limitations; use multiple channels |
| **Survey fatigue** | Medium | Keep under 10 min; progress bar |
| **Anchoring** | Medium | Avoid showing price examples before pricing questions |
| **Acquiescence bias** | Low | Mix positively and negatively worded statements |
| **Recall bias** | Medium | Ask about recent behavior (last 30 days) rather than general habits |

**Additional Quality Controls**:
- Include one attention check question (e.g., "Please select 'Strongly agree' for this question")
- Set a minimum completion time threshold to filter out random clickers
- Use "Other (please specify)" options to catch categories you may have missed
- Pilot the survey with 5-10 respondents before full deployment to catch confusing wording
