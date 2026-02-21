---
name: state-management
description: >
  Protocol for reading and updating .claude/state/resume.md and context.md.
  Defines when to update, templates for updates, and state file locations.
  Background reference for all agents.
user-invocable: false
---

# State Management Protocol

## State Files

```
.claude/state/
├── resume.md    # Always updated - primary resume point
└── context.md   # Standard/Full only - agent context transfer
```

## When to Update State

| Event | Update resume.md | Update context.md |
|-------|------------------|-------------------|
| Project starts | Yes | Tier: Standard/Full only |
| Phase completes | Yes | Yes |
| Agent handoff | Yes | Yes |
| Important decision | Yes | - |
| Session ends | Yes | - |
| Token limit approaching | Yes | Yes |

## resume.md Template

When updating `resume.md`, use this structure:

```markdown
# Project Resume

## Project Info
| Field | Value |
|-------|-------|
| **Project** | [Project name] |
| **Tier** | [QUICK/STANDARD/FULL] |
| **Started** | [Date] |
| **Last Updated** | [Date] |

## Current State
| Field | Value |
|-------|-------|
| **Phase** | [Current phase] |
| **Active Agent** | [Agent name] |
| **Last Action** | [What was just done] |
| **Status** | [In progress / Blocked / Complete] |

## Progress
- [x] Completed phases
- [ ] Pending phases

## Key Decisions
- [Decision 1]
- [Decision 2]

## Blockers
- [Blocker if any, or "None"]

## Git State
| Field | Value |
|-------|-------|
| Current Branch | [branch name] |
| Main Status | [Clean/Dirty] |
| Uncommitted Changes | [None/Description] |

## Quick Resume Prompt
> [Specific prompt to continue exactly where left off]

## Activity Log
| Date | Agent | Action |
|------|-------|--------|
| [Date] | [Agent] | [Action taken] |
```

## context.md Template (Standard/Full Only)

When updating `context.md` for agent handoffs:

```markdown
# Agent Context Transfer

## Current Handoff
**From**: [Previous agent]
**To**: [Next agent]
**Timestamp**: [Now]

## Summary
[2-3 sentences of what was done]

## Key Artifacts
- [Artifact]: `path/to/file`

## Critical Context
- [Key decision or constraint the next agent must know]

## Next Steps
1. [Immediate next action]
2. [Following action]
```

## Token Limit Protocol

When approaching token limits:

1. **Detection signals**: Conversation getting long, multiple phases completed, user mentions "running low"
2. **Action**: Immediately update both state files
3. **Notify user** with specific resume prompt for next session
4. **Include**: Current branch, uncommitted changes, exact next step
