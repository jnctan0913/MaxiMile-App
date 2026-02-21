# PM Reference: Full PRD Template

This is the comprehensive PRD output format with all 16 sections. Use for STANDARD and FULL tiers.

---

## PRD Output Format

```markdown
# PRD: [Project Name]
**Version**: 1.0
**Last Updated**: [Date]
**Author**: PM Agent
**Status**: Draft / In Review / Approved

---

## Executive Summary
[2-3 sentence summary of what we're building and why]

---

## 1. Problem Statement

### The Problem (Structured)
**Persona**: [Who is the user? Key characteristics]
**Goal / Job-to-be-Done**: [What they need to achieve]
**Mental Model**: [How they currently try to achieve it]
**Pain Point / Friction**: [What prevents them from succeeding]
**Impact**: [Consequence of the friction on the user's life]

> Full statement: A **[persona]** struggles with **[current method]** needs to **[goal]** but cannot do so because **[friction]** that has **[impact on life]**.

### Evidence
- Data point 1
- User feedback quote
- Market signal

### Who Has This Problem
[Specific user segments affected]

### Current Alternatives
[How users solve this today]

### Value Creation Opportunity
[What value is created when this pain point is removed? Reference Maslow's/Bain's Elements of Value if applicable]

---

## 2. Product Vision & Strategy

### Vision Statement
[From Phase 2.1]

### North Star Metric
[Single metric that defines success]

### OKRs This Supports
[From Phase 2.2]

---

## 3. Stakeholder Summary

### Key Stakeholders
| Stakeholder | Role | Key Need |
|-------------|------|----------|
| | | |

### Approval Required From
- [ ] [Approver 1]
- [ ] [Approver 2]

---

## 4. Competitive Context

### Our Position
[Brief competitive positioning statement]

### Key Differentiators
- Differentiator 1
- Differentiator 2

---

## 5. User Personas

### Primary Persona: [Name / Archetype]
- **Demographics**: [Age, occupation, digital literacy, relevant context]
- **Behavioral Traits**: [How they currently behave, habits, preferences]
- **Attitudes & Emotions**: [Fears, motivations, trust factors, emotional drivers]
- **Key Needs**: [What they need to accomplish]
- **Pain Points**: [Specific friction they experience]

### Secondary Persona: [Name / Archetype]
- **Demographics**: [Age, occupation, digital literacy, relevant context]
- **Behavioral Traits**: [How they currently behave]
- **Key Needs**: [What they need]
- **Pain Points**: [Their friction]

### User Journey (Primary Persona)
[Key stages from discovery]

---

## 6. Hypothesis & Differentiation

### Hypothesis (Proposed Solution)
[Describe the proposed solution that addresses the friction points. Build on existing products/solutions where applicable.]

**We believe that** [solution] **will** [achieve goal] **for** [persona] **by** [removing friction].

### Key Differentiators (vs Existing Alternatives)
| Our Approach | Existing Alternatives | Why Ours Is Better |
|--------------|----------------------|-------------------|
| | | |

---

## 7. Goals & Success Metrics

### Primary Goal
[One clear goal -- focus on end-point, not means]

### Value Metrics (to User)
| Metric | Type | Current | Target | Measurement |
|--------|------|---------|--------|-------------|
| | Better/Cheaper/Faster | | | |
| | Subjective (satisfaction) | | | |

### Impact Metrics (to System/Business)
| Metric | Time Horizon | Current | Target | Measurement |
|--------|-------------|---------|--------|-------------|
| | Short-term | | | |
| | Long-term | | | |

### Leading Indicators
- [Early signal 1]
- [Early signal 2]

### Lagging Indicators
- [Long-term outcome 1]

---

## 8. Scope & Features

### RICE-Prioritized Features

#### P0 - Must Have (MVP)
| Feature | Description | RICE Score | Acceptance Criteria |
|---------|-------------|------------|---------------------|
| | | | |

#### P1 - Should Have
| Feature | Description | RICE Score | Acceptance Criteria |
|---------|-------------|------------|---------------------|
| | | | |

#### P2 - Could Have
| Feature | Description | RICE Score | Acceptance Criteria |
|---------|-------------|------------|---------------------|
| | | | |

### Explicitly Out of Scope (v1)
| Feature | Reason | Revisit |
|---------|--------|---------|
| | | |

---

## 9. User Stories (High-Level)

### Epic 1: [Name]
- As a [user], I want [capability], so that [benefit]
- As a [user], I want [capability], so that [benefit]

### Epic 2: [Name]
- As a [user], I want [capability], so that [benefit]

---

## 10. Assumptions & Hypotheses

### Assumptions (Believed True)
| Assumption | Evidence | Risk if Wrong |
|------------|----------|---------------|
| | | |

### Hypotheses (To Validate)
| Hypothesis | How to Validate | Success Criteria |
|------------|-----------------|------------------|
| | | |

---

## 11. Constraints

### Technical Constraints
- Constraint 1

### Business Constraints
- Constraint 1

### Resource Constraints
- Constraint 1

---

## 12. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| | H/M/L | H/M/L | | |

---

## 13. Dependencies

| Dependency | Type | Status | Impact if Delayed |
|------------|------|--------|-------------------|
| | Internal/External | | |

---

## 14. Open Questions

| Question | Owner | Due Date | Status |
|----------|-------|----------|--------|
| | | | Open/Resolved |

---

## 15. Release Strategy

### MVP Definition
A **Minimum Viable Product (MVP)** is a product with **enough features** to attract early adopter customers and **validate a product idea early** in the development cycle. The MVP concept is to build a product with the **minimum set of core features** that solve the user's need and deliver value to early adopters.

**MVP Approach (Henrik Kniberg's Iterative Value Delivery)**:
- NOT: Build component by component (wheel -> chassis -> body -> car) where no value is delivered until the end
- YES: Build iteratively with usable value at each stage (skateboard -> bicycle -> motorcycle -> car)
- Each iteration must deliver a **complete, usable product** that solves the core problem at increasing levels of sophistication

**MVP Checklist**:
- [ ] Solves the ONE core user problem identified in discovery
- [ ] Delivers value to early adopters from day one
- [ ] Is testable and generates feedback for next iteration
- [ ] Contains only P0 (Must-Have) features from RICE/Kano analysis
- [ ] Anti-feature-jam check: no feature exists without mapping to the core friction

[What constitutes minimum viable product for this specific project]

### Phase Plan
| Phase | Features | Success Criteria |
|-------|----------|------------------|
| MVP | | |
| v1.1 | | |
| v2.0 | | |

---

## 16. Design Considerations (for Designer Handover)

### Innovation Sweet Spot Validation
- [ ] **Desirability**: Confirmed user demand (research evidence)
- [ ] **Feasibility**: Technically buildable within constraints
- [ ] **Viability**: Business model supports it

### Mental Models & Conceptual Design
- **User's current mental model**: [How users currently think about this task -- e.g., "hailing a taxi on the street", "using a spreadsheet for data"]
- **Our conceptual model**: [How our product represents the task -- must align with or deliberately improve upon the mental model]
- **Gulf of Execution risk**: [Where users may know what they want but can't figure out how to do it in our UI -- ensure actions are visible, intuitive, and align with user goals]
- **Gulf of Evaluation risk**: [Where users may not understand system feedback -- ensure clear, immediate feedback after every action]

### Information Architecture Guidance
- **Organization system**: [How content is grouped and categorized]
- **Labelling system**: [How things are named -- must match user mental models]
- **Navigation system**: [How users move through the product]
- **Search system**: [How users find specific content]

### Usability & Testing Recommendations
- **Prototyping approach**: [Low-fidelity wireframes for early validation -> High-fidelity for user testing]
- **Usability testing plan**:
  - **Formative** (during development): Qualitative, fewer participants, identify design issues early
  - **Summative** (end of development): Quantitative, more participants, evaluate against success metrics
- **Cognitive walkthrough questions** (apply to each key user flow):
  1. Will users be trying to achieve the right effect?
  2. Will users see the control (button, menu) for the action?
  3. Will users recognize the control produces the desired effect?
  4. Will users understand the feedback after taking the action?
- **Heuristic evaluation**: Assess against Nielsen's 10 Usability Heuristics
- **A/B testing candidates**: [Features or flows where data-driven comparison of variations would be valuable]

### Inclusive & Ethical Design
- **Accessibility**: [WCAG compliance level, screen reader support, color contrast, etc.]
- **Inclusivity**: [Design for diverse backgrounds, abilities, and circumstances -- "solve for one, extend to many"]
- **Ethical considerations**: [Privacy, transparency, fairness, non-exploitation, sustainability]

### Behavioral Design Notes
- **Cognitive biases to leverage ethically**: [e.g., defaults, social proof, loss aversion -- used to guide users toward value, NOT to manipulate]
- **Decision paralysis risk**: [Where too many options could overwhelm users -- simplify and present step-by-step]
- **Gamification considerations**: [If applicable -- weigh engagement benefits vs. distraction from core value and reduced intrinsic motivation]

---

## Appendix

### A. Customer Journey Map
[Full journey from discovery]

### B. Competitive Analysis Details
[Full competitive matrix]

### C. Research & References
- [Link/Reference 1]
- [Link/Reference 2]
```
