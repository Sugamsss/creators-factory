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

## Recent Handoff

### Task Completion Handoff

- Task ID: BE-006/007/010/011/012/017/018/020/022/023/024 + FE-026
- Agent: Codex
- Status moved to: done (feature implementation), QA still in progress
- Files changed:
  - backend avatars models/schemas/router + recycle-bin router + tests
  - frontend avatars hub, all page, edit page, API client/types/hooks, creation steps
- APIs or contracts used:
  - canonicalized to `/avatars`, `/avatars/all`, `/avatars/:id/*` and `/recycle-bin/:id/restore`
- Tests run:
  - backend `pytest -q` (25 passed)
  - frontend `typecheck`, `lint`, `vitest` (all passing)
- Known risks remaining:
  - org admin/member nuance is still constrained by current data model (creator-only edit)
  - full manual QA acceptance matrix still needs explicit scenario-by-scenario execution
- Recommended next task:
  - execute QA-002 through QA-009 checklist with manual UX/accessibility verification
