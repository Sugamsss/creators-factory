# 02 — Agent Operating Rules

## Purpose

This document tells implementation agents exactly how to work inside this execution package.

## Rule 1 — Work From Task IDs Only

Do not pick random work.
Always start from `03-Task-Breakdown.md`.

A task may be started only if:
- its dependencies are complete
- no blocker is recorded against it
- it is not already assigned to another active agent unless explicitly collaborative

## Rule 2 — Update Progress Before and After Work

Before starting a task:
- mark the task as `in_progress`
- update the related milestone if necessary
- record who is working on it

After finishing a task:
- mark the task as `done` or `in_review`
- update milestone progress
- add handoff notes in `04-Handoffs-and-Blockers.md`

## Rule 3 — Do Not Invent Product Behavior

If the product behavior is not clear from the docs:
- stop
- record the ambiguity in `04-Handoffs-and-Blockers.md`
- do not silently invent a rule

## Rule 4 — Respect the State Model

Agents must not collapse build state and deployment summary into a single field.

Always preserve:
- `build_state`
- binding-level status
- derived deployment summary

## Rule 5 — Protect Immutable Visual Rules

Once an avatar is completed:
- Steps 1 and 2 are not editable
- clones do not retrain LoRA
- clone visuals are not editable

If code being written violates those rules, the task is incorrect.

## Rule 6 — Smaller Agents Must Stay Within Their Lane

### Frontend agents
May:
- build routes
- build components
- integrate APIs
- implement interactions
- add client validation

May not:
- redefine backend contract semantics
- change permission rules
- invent new states

### Backend agents
May:
- implement data models
- implement endpoints
- implement state transitions
- implement jobs and SSE
- enforce permissions

May not:
- change UX expectations without explicit documentation change
- collapse lock rules or ownership rules for convenience

### QA agents
May:
- add missing scenario coverage
- raise blockers
- reject incomplete work

May not:
- declare acceptance unless requirements are satisfied

## Rule 7 — Always Produce Handoff Evidence

Every completed task must include:
- what changed
- where it changed
- what was tested
- remaining risks or gaps

## Rule 8 — One Source of Next Work

If asked “what should I do next?”, answer from:
1. `00-Master-Status.md`
2. `01-Execution-Order.md`
3. the highest-priority unblocked task in `03-Task-Breakdown.md`

## Rule 9 — Blockers Must Be Concrete

A blocker entry must state:
- task ID
- exact blocker
- why it blocks progress
- what decision or dependency is needed
- who should resolve it

## Rule 10 — Definition of Done Is Enforced

No task should be marked `done` unless it satisfies `05-Definition-of-Done.md`.

If work is partially complete, use:
- `in_progress`
- `blocked`
- `in_review`

Never mark partial work as `done` just to move the board forward.
