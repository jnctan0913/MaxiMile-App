# PM Reference: Strategy Frameworks

---

## Phase 2.0: Product Strategy Quality Check

Before developing your strategy, keep in mind the **four quality dimensions** of a strong product strategy:

| Dimension | What It Means | How to Assess |
|-----------|---------------|---------------|
| **Alignment** | Strategy aligns with overall business goals and company vision | Does this contribute to the company's long-term objectives? |
| **Clarity** | Clear objectives and measurable outcomes | Are objectives well-defined enough to evaluate success? |
| **Validation** | Deep understanding of target market, customer needs, and competitive landscape | Validated via user research, surveys, and interviews? |
| **Competitiveness** | Unique value proposition and differentiation from competitors | Can we solve customer problems more effectively than existing solutions? |

### Why Product Strategies Fail -- Common Pitfalls

- Lack of alignment with business goals
- Unclear prioritization
- Changing market conditions (strategy must be adaptable)
- Poor resourcing
- Mitigation: take an **iterative, agile approach** to validate hypotheses and keep stakeholders engaged

---

## Phase 2.1b: Product Strategy Canvas

Use the **Product Strategy Canvas** to communicate and develop the strategy holistically. Strategy is an integrated set of choices that reinforce each other.

```markdown
## Product Strategy Canvas

### Vision
In [time frame], [company/product] will be [vision statement].

### Challenge
In order to reach our vision, we need to [measurable objective] by [time frame].

### Target Condition
In order to reach our Challenge, we first need to [measurable objective].

### Current State
After measuring, we know our current state is [measurements of current state].

### Full Canvas Elements (FULL tier)
| Element | Key Question |
|---------|-------------|
| **Vision** | How do I inspire people to get up every day and come to work? |
| **Market** | What problems do people have? What are TAM, SAM, SOM? |
| **Value Proposition** | How can we solve customers' problems significantly better than competitors? |
| **Constraints** | Are there any constraints (e.g., geographic, regulatory)? |
| **Relative Costs** | What do we optimize for? Low cost or unique value? |
| **Growth & Marketing** | How will we communicate it? PLG or Sales-led? How to measure success? |
| **Unique Activities** | What distinct activities define creating, producing, and delivering our product? |
| **Capabilities** | What competencies and resources do we need? |
| **Supporting Systems** | What systems are required to support our strategy? |
| **Trade Offs** | What will we NOT do? (Trade offs create focus and make strategy hard to copy) |
```

---

## Phase 2.1c: Gap Analysis

```markdown
## Gap Analysis

### Where We Want to Be (Vision/Target)
[Description of desired future state]

### Where We Are Now (Current State)
[Description of current state with metrics]

### The Gap
[What needs to change to move from current to target]

### Success Metrics to Close the Gap
| Metric | Current | Target | Gap |
|--------|---------|--------|-----|
| | | | |
```

---

## Phase 2.3: KPIs (Key Performance Indicators)

KPIs complement OKRs by focusing on **identifying and measuring metrics critical to the success of the organization or product**. KPIs should be specific, measurable, achievable, relevant, and time-bound.

```markdown
## Key Performance Indicators

| KPI | Category | Current | Target | Measurement Method | Frequency |
|-----|----------|---------|--------|--------------------|-----------|
| | Acquisition | | | | |
| | Activation | | | | |
| | Retention | | | | |
| | Revenue | | | | |
| | Referral | | | | |

### KPI vs OKR
- **OKRs** = ambitious, outcome-oriented goals (what we want to achieve)
- **KPIs** = ongoing performance metrics (how we measure health/success)
- Use OKRs for direction-setting; use KPIs for continuous monitoring
```

### DORA Metrics (Software Delivery Performance)

The DORA (DevOps Research and Assessment) metrics evaluate software delivery performance. PMs should be aware of these to set realistic expectations and track engineering health:

| Metric | What It Measures | Why PM Cares |
|--------|-----------------|--------------|
| **Deployment Frequency** | How often new code is deployed to production | Faster releases = faster feedback loops & user value |
| **Lead Time for Changes** | Time from code commit to production deployment | Shorter lead time = quicker response to user needs |
| **Change Failure Rate** | % of deployments causing production failures | Lower rate = more reliable product experience |
| **Mean Time to Restore (MTTR)** | Time to recover from production incidents | Faster recovery = less user impact from issues |

These metrics help improve **reliability, speed, and efficiency** in software delivery. Use them alongside product KPIs to ensure both product value AND delivery health.
