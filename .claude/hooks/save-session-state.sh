#!/bin/bash
#
# SessionEnd hook: Auto-save session state to resume.md
#
# Ensures resume.md always records when a session ended,
# even if the agent didn't explicitly save state before termination.
#

INPUT=$(cat)
REASON=$(echo "$INPUT" | jq -r '.reason // "unknown"')
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")

# Resolve project directory
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
STATE_DIR="$PROJECT_DIR/.claude/state"
RESUME_FILE="$STATE_DIR/resume.md"

# Only act if resume.md exists (i.e., a project is active)
if [ ! -f "$RESUME_FILE" ]; then
  exit 0
fi

# Update "Last Updated" timestamp in the table
if grep -q '\*\*Last Updated\*\*' "$RESUME_FILE"; then
  sed -i '' "s/| \*\*Last Updated\*\* |.*|/| **Last Updated** | $TIMESTAMP |/" "$RESUME_FILE"
fi

# Append session-end entry to activity log
if grep -q '## Recent Activity Log' "$RESUME_FILE"; then
  echo "| $TIMESTAMP | System | Session ended ($REASON) | - | State auto-saved by hook |" >> "$RESUME_FILE"
fi

exit 0
