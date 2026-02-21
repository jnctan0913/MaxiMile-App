# PM Reference: Prioritization Frameworks

---

## Phase 3.2: Kano Model Analysis

Classify features into Kano categories to understand their relationship with user satisfaction:

```markdown
## Kano Model Classification

| Feature | Category | Rationale |
|---------|----------|-----------|
| | **Must-Have** (Expected) | Essential; absence causes dissatisfaction, presence doesn't increase satisfaction |
| | **Performance** (Satisfier) | More = more satisfaction; direct correlation between fulfillment and satisfaction |
| | **Delighter** (Exciter) | Unexpected; increases satisfaction when present, no dissatisfaction when absent |

### Key Insight
- **Must-Haves** -> These are your P0s. Non-negotiable for launch.
- **Performance Attributes** -> These are your P1s. The more you deliver, the more satisfied users are.
- **Delighters** -> These are your differentiators. They create "wow" moments and competitive advantage.
- Note: Over time, Delighters become Performance Attributes, and Performance Attributes become Must-Haves.
```

---

## Phase 3.3: Impact-Effort Analysis

Use the **Value vs Complexity Quadrant** to visualize prioritization:

```markdown
## Impact-Effort Matrix

                    HIGH IMPACT
                    |
     Quick Wins     |    Major Projects
     (Do First)     |    (Plan Carefully)
                    |
  ------------------+------------------
                    |
     Fill-Ins       |    Avoid / Deprioritize
     (Do If Time)   |    (High effort, low value)
                    |
                    LOW IMPACT
   LOW EFFORT -------------------- HIGH EFFORT

### Feature Placement
| Feature | Impact (H/M/L) | Effort (H/M/L) | Quadrant | Action |
|---------|----------------|-----------------|----------|--------|
| | | | Quick Win | Do first |
| | | | Major Project | Plan carefully |
| | | | Fill-In | Do if time allows |
| | | | Avoid | Deprioritize |
```

---

## Phase 3.4: Eisenhower Decision Matrix

Use for backlog grooming -- especially to decide what to do with de-prioritized items:

```markdown
## Eisenhower Matrix (for Backlog Triage)

|              | Urgent            | Not Urgent          |
|--------------|-------------------|---------------------|
| **Important**    | DO (Do it now)    | DECIDE (Schedule it)|
| **Not Important**| DELEGATE          | DELETE (Eliminate)   |

Apply to backlog items that keep getting deprioritized:
- If Important + Urgent -> escalate to current sprint
- If Important + Not Urgent -> schedule for future sprint
- If Not Important + Urgent -> delegate or automate
- If Not Important + Not Urgent -> remove from backlog
```

---

## Phase 3.5: Prioritization Rationale

```markdown
## Prioritization Decisions

### P0 Rationale
| Feature | Why P0 | Risk if Deferred |
|---------|--------|------------------|
| | | |

### Explicitly Deferred (P3/Out of Scope)
| Feature | Why Deferred | Revisit When |
|---------|--------------|--------------|
| | | |
```
