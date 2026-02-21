---
name: cowork
description: >
  Start collaborative multi-agent workflow with tiered ceremony. Entry point
  for new users - describe your project and the orchestrator recommends a tier
  and begins the appropriate workflow.
user-invocable: true
argument-hint: "Describe your project idea"
---

# Cowork Mode

Start collaborative multi-agent workflow with **tiered ceremony**.

## Current State

!`cat .claude/state/resume.md 2>/dev/null | head -10 || echo "No active project. Ready to start fresh."`

## Quick Start

Just describe your project: $ARGUMENTS

The orchestrator will:
1. Understand your needs
2. Recommend a tier
3. Begin the appropriate workflow

## Tiers at a Glance

| Say This | Get This Tier | What Happens |
|----------|---------------|--------------|
| "prototype", "quick", "just build it" | **QUICK** | Minimal docs -> straight to code |
| "normal project", "standard" | **STANDARD** | Key docs + approvals |
| "enterprise", "compliance", "full" | **FULL** | Complete documentation |

## Tier Workflows

### QUICK (Fastest)
```
You -> PM (Quick PRD) -> Developer -> Done
         +-- Only commit approvals
```

### STANDARD (Balanced)
```
You -> Market Researcher -> PM -> Scrum -> Architects -> Developer -> (Optional Feedback)
                +-- Approvals at key phases
```

### FULL (Complete)
```
You -> Market Researcher (Research + Survey) -> PM (Discovery) -> PM (PRD) ->
      Scrum -> Architects -> AI Eng -> Developer -> Feedback -> Retro -> Iterate
         +-- Approvals everywhere
```

## Available Skills

| Skill | Agent | QUICK | STANDARD | FULL |
|-------|-------|-------|----------|------|
| `/market-researcher` | Market Researcher | Quick scan | Full research + citations | Comprehensive + survey design |
| `/pm` | Product Manager | Quick PRD | Standard PRD | Full Discovery + PRD |
| `/scrum` | Scrum Master | Skip/Basic | DoR/DoD | Full ceremony |
| `/designer` | UI/UX Designer | Skip | Standard | Full |
| `/data-engineer` | Data Engineer | Skip | Standard | Full |
| `/software-engineer` | Software Engineer | Skip | Standard | Full |
| `/ai-engineer` | AI Engineer | Skip | If needed | Full |
| `/developer` | Developer | Direct code | With plan | Full plan |
| `/debugger` | Debugger | Always thorough | Always thorough | Always thorough |
| `/tester` | Tester | Basic | Standard | Full |

## Utility Skills

| Skill | Purpose |
|-------|---------|
| `/session-resume` | Smart session resumption with context reconstruction |
| `/status-reporter` | Project status dashboard |
| `/sprint-retro` | Sprint retrospective (FULL tier) |
| `/feedback-collector` | Collect and synthesize feedback |
| `/story-generator` | Generate user stories from PRD |
| `/decision-log` | Track product/architecture decisions |
| `/risk-register` | Consolidated risk tracking |
| `/project-health` | Project health dashboard |
| `/doc-exporter` | Export docs to PDF/DOCX/HTML |
| `/competitive-monitor` | Ongoing competitive landscape updates |

## Resuming Work

Token limit hit? No problem.

1. State auto-saves to `resume.md`
2. New session: `/session-resume` or "Continue from where we left off"
3. Or: `/orchestrate continue`

## Pro Tips

1. **Default to STANDARD** unless you have a reason not to
2. **Use QUICK** for throwaway experiments
3. **Use FULL** when documentation matters
4. **Check resume.md** when returning to a project
5. **Commits always need approval** — no exceptions
