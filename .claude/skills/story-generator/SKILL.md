---
name: story-generator
description: >
  Generates detailed, sprint-ready user stories from a PRD. Produces stories
  with acceptance criteria, estimation hints, and dependency mapping.
  Bridges the gap between PM epics and Scrum sprint stories.
user-invocable: true
argument-hint: "'all' to generate from full PRD, or 'epic:E1' for a specific epic"
---

# User Story Generator

Generate detailed, sprint-ready user stories from PRD features.

## PRD Context

!`cat docs/PRD.md 2>/dev/null | head -100 || echo "No PRD found at docs/PRD.md. Please create a PRD first."`

## Sprint Plan Context

!`cat docs/SPRINT_PLAN.md 2>/dev/null | head -30 || echo "No sprint plan yet."`

---

## Your Task

Generate user stories for: $ARGUMENTS

## Story Generation Rules

### Story Format
Every story must follow:
```
As a [specific user persona],
I want [specific capability/action],
So that [measurable benefit/outcome].
```

### Acceptance Criteria
Each story must have 3-5 **testable** acceptance criteria:
```
Given [precondition]
When [action]
Then [expected result]
```

### Sizing Constraints
- Each story must fit within a single sprint (max size: L)
- XL items are automatically decomposed into smaller stories
- Include estimation hints based on complexity

### Quality Checklist (Definition of Ready)
Each generated story must pass:
- [ ] Follows "As a / I want / So that" format
- [ ] Has 3-5 testable acceptance criteria
- [ ] Size is XS, S, M, or L (not XL)
- [ ] Dependencies are explicitly listed
- [ ] Maps to a specific PRD feature/RICE item
- [ ] Persona matches PRD personas

---

## Output Format

### Per Epic

```markdown
## Epic: [Epic Name] (from PRD Feature [ID])
**Priority**: P[0/1/2] | **RICE Score**: [score]
**Description**: [Epic-level description]

### Stories

#### [EPIC-ID]-S1: [Story Title]
**As a** [persona from PRD],
**I want** [specific capability],
**So that** [benefit].

**Size**: [XS/S/M/L]
**Priority**: P[0/1/2]
**Dependencies**: [List or "None"]
**PRD Feature**: [Feature name from PRD]

**Acceptance Criteria**:
1. Given [context], when [action], then [result]
2. Given [context], when [action], then [result]
3. Given [context], when [action], then [result]

**Technical Notes**: [Any implementation hints from architecture docs]

---
```

### Summary Table

```markdown
## Story Summary

| Story ID | Title | Epic | Size | Priority | Dependencies | DoR |
|----------|-------|------|------|----------|--------------|-----|
| E1-S1 | | E1 | S | P0 | None | Ready |
| E1-S2 | | E1 | M | P0 | E1-S1 | Ready |
| E2-S1 | | E2 | L | P1 | E1-S1 | Ready |

### Dependency Graph
E1-S1 -> E1-S2 -> E1-S3
E1-S1 -> E2-S1
E2-S1 -> E2-S2

### Estimation Summary
| Size | Count | Estimated Total Effort |
|------|-------|----------------------|
| XS | X | X hours |
| S | X | X hours |
| M | X | X days |
| L | X | X days |
| **Total** | **X stories** | **X days** |
```

---

## Process

1. **Read PRD** features (P0, P1, P2) and their RICE scores
2. **Read personas** from PRD to use in story format
3. **Group features** into epics (if not already grouped)
4. **Decompose** each feature into individual user stories
5. **Write acceptance criteria** for each story
6. **Estimate size** using T-shirt sizing
7. **Map dependencies** between stories
8. **Validate** each story against DoR checklist
9. **Present to user** for review before saving

## Output

Save generated stories to `docs/USER_STORIES.md`

## Human-in-the-Loop

Present generated stories and get approval before:
1. Saving to file
2. Passing to Scrum Master for sprint planning
