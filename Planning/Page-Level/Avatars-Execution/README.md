# Avatars Execution Package

This package turns `Avatar-page-initial-idea.md` into an execution-ready planning system for building the Avatars page with lower-capability implementation agents.

## Purpose

Use this package when the goal is no longer discussion, but **building the page end-to-end** with minimal ambiguity.

This package is designed to answer:
- what the Avatars page must do
- what is in scope and out of scope
- what backend and frontend contracts must exist
- what order implementation should happen in
- what each agent should work on next
- how progress should be tracked during execution
- what counts as done

## Source of Truth Hierarchy

1. `Avatar-page-initial-idea.md`
   - canonical final product behavior for the Avatars page
2. `Planning/Page-Level/Avatars-Execution/*`
   - execution-ready split documentation
3. `Planning/Page-Level/Avatars-Execution/workflow/*`
   - operational workflow for agents during implementation
4. existing global planning docs in `Planning/Pre-Production/*`
   - supporting product and engineering constraints

If two execution docs seem to conflict, follow this order:
- `03-Data-API-and-Events.md` for contracts and validation
- `02-UX-and-Interaction-Spec.md` for UI behavior
- `01-Execution-Context.md` for scope/invariants
- `workflow/00-Master-Status.md` for current progress and next action

## Package Map

| File | Purpose |
|---|---|
| `README.md` | Entry point for humans and agents |
| `01-Execution-Context.md` | Goals, scope, locked decisions, dependencies, and invariants |
| `02-UX-and-Interaction-Spec.md` | Full page UX, sections, flows, states, and UI rules |
| `03-Data-API-and-Events.md` | Data model, API contracts, SSE, validation, and permissions |
| `04-Frontend-Build-Plan.md` | Component plan, route plan, state plan, and frontend execution tasks |
| `05-Backend-Build-Plan.md` | Persistence, jobs, services, API sequencing, and backend execution tasks |
| `06-Test-Plan-and-Acceptance.md` | QA strategy, scenario coverage, and acceptance checklist |
| `workflow/README.md` | How agents should use the workflow folder |
| `workflow/00-Master-Status.md` | Single-source progress tracker |
| `workflow/01-Execution-Order.md` | Recommended build sequence and dependency order |
| `workflow/02-Agent-Operating-Rules.md` | Rules for agents claiming, updating, and handing off work |
| `workflow/03-Task-Breakdown.md` | Detailed execution task board with IDs, dependencies, and outputs |
| `workflow/04-Handoffs-and-Blockers.md` | Templates for blockers, handoffs, and progress updates |
| `workflow/05-Definition-of-Done.md` | Task, phase, and page completion criteria |
| `workflow/06-Agent-Start-Prompts.md` | Copy-paste prompts for frontend, backend, and QA agents |

## Recommended Reading Order

### For a human lead
1. `README.md`
2. `01-Execution-Context.md`
3. `02-UX-and-Interaction-Spec.md`
4. `03-Data-API-and-Events.md`
5. `workflow/00-Master-Status.md`
6. `workflow/01-Execution-Order.md`

### For a frontend agent
1. `workflow/README.md`
2. `workflow/00-Master-Status.md`
3. `workflow/03-Task-Breakdown.md`
4. `02-UX-and-Interaction-Spec.md`
5. `03-Data-API-and-Events.md`
6. `04-Frontend-Build-Plan.md`

### For a backend agent
1. `workflow/README.md`
2. `workflow/00-Master-Status.md`
3. `workflow/03-Task-Breakdown.md`
4. `03-Data-API-and-Events.md`
5. `05-Backend-Build-Plan.md`
6. `01-Execution-Context.md`

### For a QA agent
1. `workflow/README.md`
2. `workflow/00-Master-Status.md`
3. `06-Test-Plan-and-Acceptance.md`
4. `workflow/05-Definition-of-Done.md`
5. `workflow/03-Task-Breakdown.md`

## How to Use This Package During Execution

- Pick work only from `workflow/03-Task-Breakdown.md`.
- Before starting, verify task dependencies in `workflow/01-Execution-Order.md`.
- Update progress in `workflow/00-Master-Status.md`.
- If blocked, document it in `workflow/04-Handoffs-and-Blockers.md`.
- Do not invent product behavior beyond these docs.
- If implementation reveals a real gap, add the gap to blockers rather than silently changing behavior.

## Tracking Model

All workflow docs use the same status vocabulary:
- `not_started`
- `in_progress`
- `blocked`
- `in_review`
- `done`

## Execution Principle

This package is intentionally written so a basic model can implement the page by following the docs **without needing to reinterpret product intent**.

## Completion Target

Execution is considered complete only when:
- all required tasks in `workflow/03-Task-Breakdown.md` are `done`
- all milestone rows in `workflow/00-Master-Status.md` are `done`
- all acceptance items in `06-Test-Plan-and-Acceptance.md` are satisfied
- the page behavior matches `Avatar-page-initial-idea.md`
