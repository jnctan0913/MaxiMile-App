# Cowork Mode

Start collaborative multi-agent workflow with **tiered ceremony**.

## Quick Start

Just describe your project. The orchestrator will:
1. Understand your needs
2. Recommend a tier
3. Begin the appropriate workflow

## Tiers at a Glance

| Say This | Get This Tier | What Happens |
|----------|---------------|--------------|
| "prototype", "quick", "just build it" | **QUICK** | Minimal docs → straight to code |
| "normal project", "standard" | **STANDARD** | Key docs + approvals |
| "enterprise", "compliance", "full" | **FULL** | Complete documentation |

## Tier Workflows

### QUICK (Fastest)
```
You → PM (Quick PRD) → Developer → Done
         └── Only commit approvals
```

### STANDARD (Balanced)
```
You → Market Researcher → PM → Scrum → Architects → Developer → (Optional Feedback)
                └── Approvals at key phases
```

### FULL (Complete)
```
You → Market Researcher (Research + Survey) → PM (Discovery) → PM (PRD) →
      Scrum → Architects → AI Eng → Developer → Feedback → Retro → Iterate
         └── Approvals everywhere
```

## Commands

| Command | Description |
|---------|-------------|
| `/orchestrate start` | Start with tier selection |
| `/orchestrate continue` | Resume from saved state |
| `/orchestrate status` | Check where you are |
| `/orchestrate tier [quick/standard/full]` | Change tier |

## Agent Commands

| Command | Agent | QUICK | STANDARD | FULL |
|---------|-------|-------|----------|------|
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

## State Files

```
.claude/state/
├── resume.md    # Always - how to continue
└── context.md   # Standard/Full - agent context
```

## Resuming Work

Token limit hit? No problem.

1. State auto-saves to `resume.md`
2. New session: "Continue from where we left off"
3. Or: `/orchestrate continue`

## Example Sessions

### Quick Prototype
```
You: "Build a todo app, just prototype it"
→ Tier: QUICK
→ PM writes quick PRD
→ Developer implements
→ You approve commits
→ Done in one session
```

### Standard Project
```
You: "Build a habit tracker for personal use"
→ Tier: STANDARD (recommended)
→ PM writes PRD with RICE
→ You approve PRD
→ Scrum creates sprint plan
→ Architects design system
→ Developer implements
→ You approve each commit
```

### Enterprise Project
```
You: "Build auth system, need full docs for compliance"
→ Tier: FULL
→ PM does discovery
→ You approve discovery
→ PM writes comprehensive PRD
→ ... full ceremony ...
→ Feedback and retro required
```

## Pro Tips

1. **Default to STANDARD** unless you have a reason not to
2. **Use QUICK** for throwaway experiments
3. **Use FULL** when documentation matters
4. **Check resume.md** when returning to a project
5. **Commits always need approval** — no exceptions
