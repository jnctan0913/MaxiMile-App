# Vibe Coding Agent Team - Instructions

## Overview

A multi-agent system for collaborative software development with **tiered ceremony** — from quick prototypes to full enterprise documentation.

---

## Quick Start

```
/cowork
```
Then describe your project. The orchestrator will:
1. Ask about your project
2. **Recommend a tier** (or you can specify)
3. Begin the appropriate workflow

---

## The Tier System

### Why Tiers?
Not every project needs full ceremony. Tiers let you match process to project:

| Tier | Best For | Token Usage | Time |
|------|----------|-------------|------|
| **QUICK** | Prototypes, experiments, "just build it" | Minimal | Fast |
| **STANDARD** | Most projects, balanced approach | Moderate | Medium |
| **FULL** | Enterprise, compliance, audit trails | High | Thorough |

### Tier Comparison

| Aspect | QUICK | STANDARD | FULL |
|--------|-------|----------|------|
| Discovery | Skip | Optional | Required |
| PRD | 1 page | Standard | Comprehensive |
| RICE Scoring | Skip | Simplified | Full |
| Stakeholder Map | Skip | Skip | Required |
| Competitive Analysis | Skip | Skip | Required |
| Sprint Planning | Basic list | DoR/DoD | Full ceremony |
| Architecture Docs | Inline notes | Standard docs | Full specs |
| Handovers | None | context.md only | Full |
| Retros | Skip | Optional | Required |
| Checkpoints | Commit only | Key phases | Everything |

### Tier Selection
The orchestrator will detect or ask:

```
User says "prototype" → QUICK
User says "normal project" → STANDARD
User says "enterprise" → FULL
Unclear → Orchestrator asks
```

You can always override: `/orchestrate tier quick`

---

## Workflows by Tier

### QUICK Workflow
```
Idea → Quick PRD → Code → Commit (approval) → Done
```

### STANDARD Workflow
```
Idea → Market Research (approval) → PRD (approval) →
Sprint Plan (approval) → Architecture (approval) →
Code → Commits (approval) → Optional feedback
```

### FULL Workflow
```
Idea → Market Research + Survey Design (approval) →
Discovery (approval) → PRD (approval) →
Sprint Plan (approval) → Architecture (approval) →
Code → Commits (approval) → Feedback (required) →
Retro (required) → Iterate
```

---

## State Management (Simplified)

Instead of many handover files, we use **two state files**:

```
.claude/state/
├── resume.md    # Always updated - how to continue
└── context.md   # Standard/Full only - agent context
```

### resume.md
- Updated after every significant change
- Contains current phase, last action, next steps
- Includes "Quick Resume Prompt" for new sessions
- **This is how you resume after token limits**

### context.md
- Used in STANDARD and FULL tiers only
- Passes context between agents
- Keeps only the most recent handoff

### Why This Matters
When tokens run out mid-session:
1. State is saved to `resume.md`
2. Next session reads `resume.md`
3. Work continues seamlessly

---

## Skills

All agents are available as skills in `.claude/skills/`. Skills use the latest format with YAML frontmatter, dynamic context injection, and progressive disclosure.

### Core Workflow

| Skill | Description |
|-------|-------------|
| `/cowork` | Start collaborative workflow |
| `/orchestrate start` | Start new project with tier selection |
| `/orchestrate continue` | Resume from resume.md |
| `/orchestrate status` | Check current state |
| `/orchestrate tier [quick/standard/full]` | Change tier |
| `/session-resume` | Smart session resumption with context reconstruction |
| `/status-reporter` | Generate comprehensive status reports |

### Research & Planning

| Skill | Description |
|-------|-------------|
| `/market-researcher` | Run Market Researcher |
| `/competitive-monitor` | Ongoing competitive landscape updates |
| `/pm` | Run Product Manager |
| `/scrum` | Run Scrum Master |
| `/story-generator` | Generate sprint-ready user stories from PRD |

### Architecture

| Skill | Description |
|-------|-------------|
| `/designer` | Run UI/UX Designer |
| `/data-engineer` | Run Data Engineer |
| `/software-engineer` | Run Software Engineer |
| `/ai-engineer` | Run AI Engineer |

### Implementation & Quality

| Skill | Description |
|-------|-------------|
| `/developer` | Run Developer |
| `/debugger` | Run Debugger |
| `/tester` | Run Tester |

### Tracking & Governance

| Skill | Description |
|-------|-------------|
| `/decision-log` | Track product/tech decisions in ADR format |
| `/risk-register` | Consolidated risk tracking with 5x5 matrix |
| `/feedback-collector` | Collect and synthesize user feedback |
| `/sprint-retro` | Structured sprint retrospectives |
| `/project-health` | RAG health dashboard across all dimensions |
| `/doc-exporter` | Export docs to PDF/DOCX/HTML via pandoc |

---

## Human-in-the-Loop

### Checkpoints by Tier

| Checkpoint | QUICK | STANDARD | FULL |
|------------|-------|----------|------|
| Tier selection | Yes | Yes | Yes |
| Market Research | - | Yes | Yes |
| Survey Design | - | - | Yes (if recommended) |
| Discovery | - | - | Yes |
| PRD | - | Yes | Yes |
| Sprint Plan | - | Yes | Yes |
| Architecture | - | Yes | Yes |
| **Every Commit** | **Yes** | **Yes** | **Yes** |
| Feedback | - | Optional | Yes |
| Retro | - | - | Yes |

### Universal Rule
**Commits ALWAYS require your approval, regardless of tier.**

---

## Agent Behaviors by Tier

### Market Researcher
| Tier | Output |
|------|--------|
| QUICK | Quick market scan (top 3 competitors, key stats) |
| STANDARD | Full market research with citations (`docs/MARKET_RESEARCH.md`) |
| FULL | Comprehensive research + survey design (`docs/MARKET_RESEARCH.md` + `docs/SURVEY_DESIGN.md`) |

### Product Manager
| Tier | Output |
|------|--------|
| QUICK | Quick PRD (problem + features + metric) |
| STANDARD | Standard PRD with simplified RICE |
| FULL | Discovery + Comprehensive PRD with full RICE |

### Scrum Master
| Tier | Output |
|------|--------|
| QUICK | Basic task list (or skip) |
| STANDARD | Sprint Plan with DoR/DoD |
| FULL | Full sprint planning ceremony |

### Architects (Designer, Data, Software, AI)
| Tier | Output |
|------|--------|
| QUICK | Inline notes or skip |
| STANDARD | Standard documentation |
| FULL | Comprehensive specifications |

### Debugger
**Always thorough** — bugs need proper analysis regardless of tier.

### Tester
| Tier | Output |
|------|--------|
| QUICK | Basic tests |
| STANDARD | Test plan + tests |
| FULL | Comprehensive test plan + tests |

---

## Resuming Work

### After Token Limits
1. State is automatically saved to `resume.md`
2. Start new session
3. Say: "Continue from where we left off"
4. Or use: `/orchestrate continue`

### After Days Away
1. Run `/orchestrate status` to see current state
2. Run `/orchestrate continue` to resume
3. Check `resume.md` for context

---

## Documentation Generated

### By Tier

| File | QUICK | STANDARD | FULL |
|------|-------|----------|------|
| `docs/MARKET_RESEARCH.md` | - | Yes | Yes |
| `docs/SURVEY_DESIGN.md` | - | - | Yes (if recommended) |
| `docs/DISCOVERY.md` | - | - | Yes |
| `docs/PRD.md` | Minimal/inline | Yes | Yes |
| `docs/SPRINT_PLAN.md` | - | Yes | Yes |
| `docs/DRD.md` | - | Yes | Yes |
| `docs/DATA_ARCHITECTURE.md` | - | Yes | Yes |
| `docs/TECHNICAL_ARCHITECTURE.md` | - | Yes | Yes |
| `docs/AI_ARCHITECTURE.md` | - | If needed | Yes |
| `docs/IMPLEMENTATION_PLAN.md` | - | Yes | Yes |

### Always Present
- `.claude/state/resume.md` — project state
- `.claude/state/context.md` — agent context (Standard/Full)

### Generated by Tracking Skills (when used)
- `docs/DECISION_LOG.md` — Product and technical decisions (ADR format)
- `docs/RISK_REGISTER.md` — Consolidated risk tracking
- `docs/FEEDBACK_LOG.md` — User feedback collection
- `docs/RETROSPECTIVES.md` — Sprint retrospective history
- `docs/COMPETITIVE_UPDATES.md` — Ongoing competitive intelligence
- `exports/` — Exported documents (PDF/DOCX/HTML)

---

## Git Protocol

**Never commits or merges without approval.**

### Feature Branch Workflow
All development uses feature branches to keep `main` clean:

```
main (always deployable)
  │
  └── feat/user-auth       ← Development here
        ├── commit 1
        ├── commit 2
        └── merge to main  ← You approve
```

### Branch Usage by Tier
| Tier | Branching |
|------|-----------|
| QUICK | Optional (can use main for speed) |
| STANDARD | Required |
| FULL | Required |

### Checkpoints (all require approval)

**1. Branch Creation:**
```
## Creating Feature Branch
Branch: feat/[name]
Purpose: [description]
Create branch? (y/n)
```

**2. Each Commit:**
```
## Ready to Commit
Branch: feat/[name]
Files: [list]
Message: feat(scope): description
Approve? (y/n)
```

**3. Merge to Main:**
```
## Ready to Merge
Branch: feat/[name] → main
Commits: [list]
Tests: Passing
Approve merge? (y/n)
```

**4. Push to Remote:**
```
## Ready to Push
Branch: main
Commits to push: X
Push? (y/n)
```

---

## Best Practices

1. **Start with tier selection** — Match ceremony to project
2. **QUICK for experiments** — Don't over-document throwaway code
3. **STANDARD for most work** — Balanced approach
4. **FULL for compliance** — When audit trails matter
5. **Trust the state files** — They're designed for resumability
6. **Run retros (when appropriate)** — Learning compounds

---

## Configuration

Edit `.claude/settings.json` to customize:
- Tier defaults and keywords
- Agent outputs by tier
- Checkpoint requirements
- State management triggers

---

## Token Economics

| Tier | Estimated Tokens | Sessions |
|------|------------------|----------|
| QUICK | 10-30k | 1 |
| STANDARD | 50-100k | 1-3 |
| FULL | 100-200k+ | 3+ |

The tier system helps you:
- **Use fewer tokens** for simple projects
- **Preserve context** for complex projects
- **Resume seamlessly** when limits hit
