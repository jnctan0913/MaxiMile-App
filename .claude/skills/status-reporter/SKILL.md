---
name: status-reporter
description: >
  Generates comprehensive project status reports by aggregating state files,
  git history, documentation progress, and sprint metrics. Supports summary
  and full report modes.
user-invocable: true
argument-hint: "'summary' for brief, 'full' for comprehensive, 'export' for markdown file"
---

# Status Reporter

Generate a project status report from all available state and documentation.

## Gather Status Data

!`bash .claude/skills/status-reporter/scripts/gather-status.sh 2>/dev/null || echo "Script not found. Reading state manually..."`

## State File

!`cat .claude/state/resume.md 2>/dev/null || echo "No resume file."`

## Documentation Inventory

!`ls -la docs/*.md 2>/dev/null || echo "No documentation yet."`

## Recent Git Activity

!`git log --oneline -10 2>/dev/null || echo "No git history."`

## Current Branch

!`git branch 2>/dev/null || echo "Not a git repo."`

---

## Report Mode: $ARGUMENTS

Generate the requested report format:

### Summary Mode (default)

One-screen dashboard:

```markdown
## Project Status Dashboard

**Project**: [name]
**Tier**: [tier]
**Phase**: [current] / [total phases]
**Last Updated**: [date]

### Progress
[=========>          ] 45% (Phase 3 of 7)

### Documentation
| Document | Status |
|----------|--------|
| Market Research | [Done/Pending/N/A] |
| PRD | [Done/Pending/N/A] |
| Sprint Plan | [Done/Pending/N/A] |
| Design (DRD) | [Done/Pending/N/A] |
| Data Architecture | [Done/Pending/N/A] |
| Technical Architecture | [Done/Pending/N/A] |
| AI Architecture | [Done/Pending/N/A] |

### Git State
- Branch: [current branch]
- Uncommitted changes: [yes/no]
- Recent commits: [count in last 7 days]

### Blockers
- [Blocker or "None"]

### Next Action
[Specific next step with skill command]
```

### Full Mode

Multi-section comprehensive report:

```markdown
## Comprehensive Status Report

### 1. Executive Summary
[2-3 sentence project overview and current state]

### 2. Phase-by-Phase Progress
| Phase | Status | Agent | Key Output | Notes |
|-------|--------|-------|------------|-------|
| Research | [status] | Market Researcher | docs/MARKET_RESEARCH.md | |
| Discovery | [status] | PM | docs/DISCOVERY.md | |
| PRD | [status] | PM | docs/PRD.md | |
| Sprint Plan | [status] | Scrum Master | docs/SPRINT_PLAN.md | |
| Design | [status] | Designer | docs/DRD.md | |
| Data Arch | [status] | Data Engineer | docs/DATA_ARCHITECTURE.md | |
| Tech Arch | [status] | Software Engineer | docs/TECHNICAL_ARCHITECTURE.md | |
| AI Arch | [status] | AI Engineer | docs/AI_ARCHITECTURE.md | |
| Implementation | [status] | Developer | Source code | |
| Testing | [status] | Tester | docs/TEST_PLAN.md | |

### 3. Artifact Inventory
[List all generated files with sizes and dates]

### 4. Risk Status
[From risk register if available, or from PRD risks section]

### 5. Key Decisions Made
[From decision log if available, or from resume.md]

### 6. Git Activity
[Branch status, recent commits, merge status]

### 7. Recommendations
[Suggested next actions based on current state]
```

### Export Mode

Save the full report to `docs/STATUS_REPORT.md`.
