# 04 — Handoffs and Blockers

Use this file for handoff notes, blocker reports, and progress summaries.

## Current Active Blockers

- none

## Handoff Template

### Task Completion Handoff

- Task ID:
- Agent:
- Status moved to:
- Files changed:
- APIs or contracts used:
- Tests run:
- Known risks remaining:
- Recommended next task:

## Blocker Template

### Blocker Entry

- Task ID:
- Agent:
- Blocker type: contract / dependency / bug / missing context / failing test
- Exact blocker:
- Why it blocks execution:
- Suggested resolution:
- Who should resolve it:
- Date/time:

## Progress Update Template

### In-Progress Update

- Task ID:
- Agent:
- Current status:
- What is complete:
- What remains:
- Risks noticed:
- ETA guess:

## Example Guidance

Good blocker:
- `BE-020 blocked because automation binding uniqueness is not enforced in the current data model, and deploy behavior would allow multiple active avatars on one automation.`

Bad blocker:
- `deploy is confusing`

Good handoff:
- clearly states what files changed and which acceptance condition moved forward

Bad handoff:
- `done, please continue`

## Logging Rule

If a task was significant, log it here even if it is complete.
This file should help the next agent understand context without re-reading the whole code diff.
