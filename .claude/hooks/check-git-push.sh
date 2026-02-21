#!/bin/bash
#
# PreToolUse hook: Git push safety guard
#
# - Force push (--force, -f): Always blocked
# - Regular git push: Forces permission dialog so user sees and approves
#

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# No command extracted — allow
if [ -z "$COMMAND" ]; then
  exit 0
fi

# Block force push — never allowed
if echo "$COMMAND" | grep -qE 'git\s+push\s+.*(-f|--force)'; then
  echo "BLOCKED: Force push is never allowed. Use regular 'git push' instead." >&2
  exit 2
fi

# Regular git push — force the permission dialog even if in allowlist
if echo "$COMMAND" | grep -qE 'git\s+push'; then
  cat <<'EOF'
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "ask"
  }
}
EOF
  exit 0
fi

# All other Bash commands — allow
exit 0
