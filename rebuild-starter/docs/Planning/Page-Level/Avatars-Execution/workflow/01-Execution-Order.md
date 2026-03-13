# 01 — Execution Order

This document defines the recommended build sequence for the Avatars page.

## Guiding Principle

Build in dependency order.
Do not begin downstream UI or workflow behavior until the underlying state model and contracts are stable enough to support it.

## Phase Order

### Phase 1 — Contracts and foundations
Start here.

Goals:
- lock backend model names and state rules
- align frontend on route and section responsibilities
- prevent state-model drift later

Primary tasks:
- BE-001 to BE-005
- FE-001 to FE-003
- QA-001

Outputs:
- stable model contract
- stable route map
- stable section/query contract

### Phase 2 — Base page shells and inventory sections

Goals:
- render `/avatars` and `/avatars/all`
- establish section loading, empty states, and card system

Primary tasks:
- FE-004 to FE-008
- BE-006 to BE-007

Outputs:
- section rendering
- card states wired to real data
- list/filter/sort foundations

### Phase 3 — Visual creation flow

Goals:
- make Step 1 and Step 2 functional
- support base generation, version history, reference set generation, and LoRA progress

Primary tasks:
- BE-008 to BE-012
- FE-009 to FE-014
- QA-002

Outputs:
- create flow shell
- prompt-driven generation
- 10-version cap
- 15-reference-image grid
- training progress + retry flow

### Phase 4 — Personality and avatar completion

Goals:
- make Step 3 fully functional
- allow valid completion into ready avatars

Primary tasks:
- BE-013 to BE-015
- FE-015 to FE-020
- QA-003

Outputs:
- required validation
- industry/role dependency
- custom role questionnaire
- ready avatars entering completed sections

### Phase 5 — Public sharing, Explore, and clone

Goals:
- enable public visibility for eligible avatars
- implement Explore
- implement clone and field lock behavior

Primary tasks:
- BE-016 to BE-019
- FE-021 to FE-026
- QA-004

Outputs:
- Explore feed
- public toggle rules
- clone flow
- lock-aware edit mode

### Phase 6 — Use, Pause, Delete, Restore

Goals:
- connect avatars to automations
- support pause/resume/delete/restore correctly

Primary tasks:
- BE-020 to BE-024
- FE-027 to FE-031
- QA-005

Outputs:
- automation picker
- replacement warning path
- pause binding logic
- delete side effects
- restore reset behavior

### Phase 7 — Hardening, accessibility, and acceptance

Goals:
- close remaining gaps
- verify acceptance criteria
- remove high-risk regressions

Primary tasks:
- FE-032 to FE-034
- QA-006 to QA-009
- cross-functional bugfix tasks as needed

Outputs:
- accessibility pass
- responsive pass
- end-to-end validation
- acceptance signoff

## Parallelization Rules

### Safe to do in parallel
- frontend shell work and backend model scaffolding
- QA test case authoring while implementation starts
- section card UI while list endpoints are being completed
- personality form UI while validation APIs are being built

### Should not run in parallel without coordination
- frontend clone UI and backend clone rules
- frontend deploy/pause flows and backend binding semantics
- delete/restore UX and backend recycle behavior
- final SSE UI and unstable event payloads

## Critical Path

These items define the true critical path:
1. state model and data contracts
2. visual generation and LoRA orchestration
3. personality completion rules
4. clone/sharing rules
5. automation binding rules
6. delete/restore side effects
7. QA acceptance

## Handoff Gates Between Phases

A phase should not be treated as complete until:
- all required tasks for the phase are done or intentionally deferred
- blocker list is clean or clearly acknowledged
- next phase has stable contracts to work from
- `00-Master-Status.md` is updated

## Recommended Next-Task Logic

When unsure what to do next:
- first choose the highest-priority unblocked backend task in the current phase
- then choose the highest-priority unblocked frontend task in the same phase
- only move to later phases when the current phase is stable enough not to create rework
