# Workflow Folder — Agent Execution Guide

This folder is the operational control center for implementing the Avatars page.

If you are an execution agent, start here.

## Goal

This workflow folder tells agents:
- what to do first
- what is blocked
- what is already complete
- what task to claim next
- what outputs are expected before handoff
- what counts as done

## Reading Order for Agents

1. `00-Master-Status.md`
2. `01-Execution-Order.md`
3. `03-Task-Breakdown.md`
4. relevant build plan doc:
   - frontend -> `../04-Frontend-Build-Plan.md`
   - backend -> `../05-Backend-Build-Plan.md`
   - QA -> `../06-Test-Plan-and-Acceptance.md`
5. `02-Agent-Operating-Rules.md`
6. `04-Handoffs-and-Blockers.md`
7. `05-Definition-of-Done.md`
8. `../08-Temporary-Behavior-Register.md`

## Rules

- Work only from task IDs in `03-Task-Breakdown.md`.
- Never claim a task whose dependencies are incomplete.
- Update `00-Master-Status.md` whenever you start, block, finish, or hand off work.
- If documentation and implementation reality conflict, do not invent behavior. Log the gap in `04-Handoffs-and-Blockers.md`.
- When in doubt, prefer the contracts in `../03-Data-API-and-Events.md` over guesswork.

## Status Vocabulary

Use only these status values:
- `not_started`
- `in_progress`
- `blocked`
- `in_review`
- `done`

## Recommended Agent Roles

- **Frontend agent**
  - routes
  - components
  - client state
  - interaction behavior
  - accessibility

- **Backend agent**
  - schema
  - endpoints
  - jobs
  - permissions
  - state transitions
  - SSE

- **QA agent**
  - test matrix
  - acceptance validation
  - regression verification

## Update Principle

This folder must always make it obvious:
- what is done
- what is in progress
- what is blocked
- what the single next best task is

If that is not obvious from the workflow files, the workflow is being maintained incorrectly.
