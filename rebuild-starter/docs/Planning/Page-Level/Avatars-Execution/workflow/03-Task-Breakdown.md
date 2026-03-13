# 03 — Task Breakdown

This is the actionable build board for the Avatars page.

## Status Legend

- `not_started`
- `in_progress`
- `blocked`
- `in_review`
- `done`

## Backend Tasks

| ID     | Task                                                                                                 | Status      | Dependencies                           | Output                               |
| ------ | ---------------------------------------------------------------------------------------------------- | ----------- | -------------------------------------- | ------------------------------------ |
| BE-001 | Implement base avatar schema and enums (`ownership_scope`, `source_type`, `build_state`)             | done        | none                                   | stable core avatar model and schemas |
| BE-002 | Implement visual versions storage with 10-version retention policy                                   | done        | BE-001                                 | version history persistence          |
| BE-003 | Implement reference image storage and slot model                                                     | done        | BE-001                                 | 15-slot reference set persistence    |
| BE-004 | Implement visual profile / LoRA training status model                                                | done        | BE-001                                 | training state persistence           |
| BE-005 | Implement personality snapshots, reaction assets, field locks, and automation bindings tables/models | done        | BE-001                                 | downstream contract support          |
| BE-006 | Implement draft create/read/update/delete endpoints                                                  | done        | BE-001, BE-002, BE-003, BE-004, BE-005 | usable draft CRUD                    |
| BE-007 | Implement list queries for `/avatars`, `/avatars/all`, Org section, and Explore feed                 | done        | BE-001, BE-005, BE-006                 | section-ready queries                |
| BE-008 | Implement base image generation endpoint                                                             | done        | BE-002, BE-006                         | Step 1 generation path               |
| BE-009 | Implement reference set generation endpoint for exactly 15 unique images                             | done        | BE-003, BE-008                         | Step 2 reference set generation      |
| BE-010 | Implement LoRA training orchestration and job state tracking                                         | done        | BE-004, BE-009                         | train-lora flow                      |
| BE-011 | Implement 3-attempt auto-retry and manual retry rules                                                | done        | BE-010                                 | deterministic failure policy |
| BE-012 | Implement SSE training events endpoint                                                               | done        | BE-010, BE-011                         | real-time progress stream |
| BE-013 | Implement personality completion validation rules                                                    | done        | BE-005, BE-006                         | completion gate                      |
| BE-014 | Implement avatar completion transition to `ready`                                                    | done        | BE-010, BE-013                         | ready-state transition               |
| BE-015 | Queue asynchronous reaction generation on completion                                                 | done        | BE-014                                 | reaction jobs                        |
| BE-016 | Implement public eligibility enforcement                                                             | done        | BE-014                                 | public toggle guardrails             |
| BE-017 | Implement public visibility toggle and field-lock persistence                                        | done        | BE-016, BE-005                         | share configuration                  |
| BE-018 | Implement clone creation using source visual snapshot                                                | done        | BE-017, BE-014                         | clone flow                           |
| BE-019 | Enforce clone visual immutability and lock-aware field editing                                       | done        | BE-018                                 | protected clone behavior             |
| BE-020 | Implement deploy endpoint and one-active-avatar-per-automation rule                                  | done        | BE-005, BE-014                         | binding creation                     |
| BE-021 | Implement replace-confirmation path for binding conflicts                                            | done        | BE-020                                 | safe replace behavior                |
| BE-022 | Implement pause endpoint for one or many bindings                                                    | done        | BE-020                                 | pause flow                           |
| BE-023 | Implement soft delete with pause/detach side effects                                                 | done        | BE-020, BE-022                         | recycle behavior                     |
| BE-024 | Implement restore endpoint with plan-limit checks and `not_in_use` reset                             | done        | BE-023                                 | restore flow                         |

## Frontend Tasks

| ID     | Task                                                                             | Status      | Dependencies                                   | Output                      |
| ------ | -------------------------------------------------------------------------------- | ----------- | ---------------------------------------------- | --------------------------- |
| FE-001 | Build `/avatars` route shell and data loading scaffolding | done        | none                                           | page shell                  |
| FE-002 | Build `/avatars/all` route shell                                                 | done        | none                                           | full inventory shell        |
| FE-003 | Build create/edit workspace shell and stepper                                    | done        | none                                           | route shell for create/edit |
| FE-004 | Build shared avatar card, badge row, and action bar components | done        | FE-001                                         | reusable card system        |
| FE-005 | Build Continue Creation section UI                               | done        | FE-001, FE-004                                 | draft section               |
| FE-006 | Build My Avatars section UI                                                      | done        | FE-001, FE-004                                 | completed personal section  |
| FE-007 | Build Organisational Avatars section UI                                          | done        | FE-001, FE-004                                 | org section                 |
| FE-008 | Build Explore section shell with search/filter/tabs/feed                         | done        | FE-001, FE-004                                 | Explore shell               |
| FE-009 | Build Step 1 prompt composer and canvas layout                                   | done        | FE-003, BE-008 contract                        | base visual UI              |
| FE-010 | Build mask tool rail and version history panel                                   | done        | FE-009, BE-008 contract                        | visual refinement UI        |
| FE-011 | Implement active base face selection and reset handling UI                       | done        | FE-009, BE-008, BE-009 contract                | base-face selection flow    |
| FE-012 | Build Step 2 reference image grid and per-slot refine entry points               | done        | FE-003, BE-009                                 | reference review UI         |
| FE-013 | Build training progress panel and failure/retry states                           | done        | FE-012, BE-010, BE-011                         | training UX                 |
| FE-014 | Subscribe to SSE and update training UI in real time                             | done        | FE-013, BE-012                                 | live training updates       |
| FE-015 | Build Step 3 shell and required validation scaffolding                           | done        | FE-003, BE-013 contract                        | personality shell           |
| FE-016 | Build Basic Info and Backstory forms                                             | done        | FE-015                                         | core personality forms      |
| FE-017 | Build Industry and Role forms including custom role questionnaire                | done        | FE-015                                         | industry/role UI            |
| FE-018 | Build Visual Personality forms for wardrobe and environments                     | done        | FE-015                                         | visual personality UI       |
| FE-019 | Build Behavioral Personality forms for hobbies, phrases, gestures, and reactions | done        | FE-015                                         | behavioral personality UI   |
| FE-020 | Build Voice and Tone form with library/custom modes and preview flow             | done        | FE-015                                         | voice/tone UI               |
| FE-021 | Build completion action behavior and ready-state transition handling             | done        | FE-016, FE-017, FE-018, FE-019, FE-020, BE-014 | avatar completion UX        |
| FE-022 | Build public/private toggle UI and lock configuration controls                   | done        | FE-006, BE-017                                 | sharing controls            |
| FE-023 | Complete Explore feed behavior with real filters, tabs, and pagination/scroll    | done        | FE-008, BE-007                                 | Explore functional UI       |
| FE-024 | Implement clone action UI and post-clone navigation behavior                     | done        | FE-023, BE-018                                 | clone UX                    |
| FE-025 | Implement clone edit mode with read-only locked fields                           | done        | FE-015, BE-019                                 | lock-aware editing          |
| FE-026 | Build `/avatars/all` filters, sorting, and list rendering                        | not_started | FE-002, BE-007                                 | inventory page behavior     |
| FE-027 | Build Use automation picker                                                      | done        | FE-004, BE-020                                 | deploy UI                   |
| FE-028 | Build replace-binding warning flow                                               | done        | FE-027, BE-021                                 | safe deploy conflict UX     |
| FE-029 | Build Pause flow with single-binding shortcut and multi-binding picker           | done        | FE-004, BE-022                                 | pause UX                    |
| FE-030 | Build Delete and restore-aware feedback flows                                    | done        | FE-004, BE-023, BE-024                         | delete UX                   |
| FE-031 | Build edit mode for completed avatars with Steps 1/2 read-only                   | done        | FE-003, BE-014                                 | completed edit mode         |
| FE-032 | Implement empty, loading, and error states across all avatar routes              | done        | FE-001 through FE-031                          | resilient UI                |
| FE-033 | Accessibility pass across routes and interaction controls                        | done        | FE-001 through FE-032                          | accessible UI               |
| FE-034 | Responsive pass across sections and builder workspace                            | done        | FE-001 through FE-033                          | mobile/tablet readiness     |

## QA Tasks

| ID     | Task                                                              | Status      | Dependencies          | Output                   |
| ------ | ----------------------------------------------------------------- | ----------- | --------------------- | ------------------------ |
| QA-001 | Draft the test matrix from the execution package                  | done        | none                  | initial QA coverage plan |
| QA-002 | Validate Step 1 and Step 2 flows against spec                     | not_started | BE-012, FE-014        | visual/training coverage |
| QA-003 | Validate Step 3 completion logic and required-field enforcement   | not_started | BE-014, FE-021        | completion coverage      |
| QA-004 | Validate Explore, public eligibility, clone flow, and field locks | not_started | BE-019, FE-025        | sharing/clone coverage   |
| QA-005 | Validate Use, Pause, Delete, and Restore behaviors                | not_started | BE-024, FE-030        | lifecycle coverage       |
| QA-006 | Validate org access rules                                         | not_started | BE-024, FE-031        | org behavior coverage    |
| QA-007 | Validate empty, loading, and error states                         | not_started | FE-032                | resilience coverage      |
| QA-008 | Validate accessibility requirements                               | not_started | FE-033                | accessibility coverage   |
| QA-009 | Run final acceptance checklist and signoff                        | not_started | QA-002 through QA-008 | final release validation |

## Recommended Starting Tasks

Start with these first:

- BE-001
- BE-002
- BE-003
- FE-001
- FE-003
- QA-001

## Task Update Rule

Each time a task changes state, also update:

- `00-Master-Status.md`
- `04-Handoffs-and-Blockers.md` if context is needed
