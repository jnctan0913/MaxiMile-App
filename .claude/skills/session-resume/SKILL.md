---
name: session-resume
description: >
  Smart session resumption - reads state files, reconstructs context,
  identifies next actions, and offers continuation options. Use this
  when returning to a project after a break or token limit.
user-invocable: true
argument-hint: "Optional: 'deep' for full context reconstruction"
---

# Session Resume

Intelligently reconstruct project context and identify the next action.

## Current Project State

!`cat .claude/state/resume.md 2>/dev/null || echo "NO_RESUME_FILE"`

## Agent Context

!`cat .claude/state/context.md 2>/dev/null || echo "No context file."`

## Pending Handovers

!`ls -la .claude/handover/*.md 2>/dev/null || echo "No handover files."`

## Git State

!`git branch --show-current 2>/dev/null && echo "---" && git status --short 2>/dev/null && echo "---" && git log --oneline -5 2>/dev/null || echo "Not a git repo."`

## Documentation Inventory

!`ls -la docs/*.md 2>/dev/null || echo "No docs yet."`

---

## Your Task

Based on the state data above, provide a session resume:

### 1. Context Reconstruction

Parse `resume.md` and identify:
- Current project name and tier
- Current phase and active agent
- Last completed action
- Any blockers

### 2. Anomaly Detection

Check for:
- **Uncommitted git changes** (possible interrupted work)
- **Stale handover files** (pending agent transitions)
- **Missing expected docs** for the current tier/phase
- **Branch misalignment** (on wrong branch)

### 3. Resume Summary

Present to the user:

```markdown
## Session Resume

**Project**: [name] | **Tier**: [tier] | **Phase**: [phase]
**Last action**: [what] by [agent] on [date]
**Git state**: [branch, uncommitted changes?]

### What happened last session:
[2-3 sentence summary from resume.md]

### Anomalies detected:
[List any issues found, or "None"]

### Recommended next step:
[Specific action with skill to invoke]

### Options:
1. Continue where we left off: `/orchestrate agent [next-agent]`
2. Check project health: `/project-health`
3. Review status in detail: `/status-reporter full`
4. Change tier: `/orchestrate tier [tier]`
5. Start fresh: `/orchestrate start`
```

### 4. If No Resume File

If no `resume.md` exists:

```markdown
## No Active Project Found

No saved state found. Would you like to:

1. Start a new project: `/cowork [describe your project]`
2. Start with orchestrator: `/orchestrate start`

Just describe what you'd like to build!
```
