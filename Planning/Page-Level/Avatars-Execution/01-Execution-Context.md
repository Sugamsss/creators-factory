# 01 — Execution Context

## Objective

Build the Avatars page as the product's identity-management system for MVP.

The result must support:
- avatar creation from scratch
- resumable draft creation
- visual refinement and LoRA training
- personality setup
- personal and organisation ownership modes
- public Explore publishing for eligible avatars
- cloning of public avatars
- deployment to automations
- pausing avatar usage per automation
- soft delete and recycle restore

## Why This Page Matters

The Avatars page is upstream of Scripts, Videos, and Automations.
If this page is wrong, every downstream page inherits bad identity, state, and automation behavior.

## Scope

### In Scope
- `/avatars`
- `/avatars/all`
- `/avatars/create/:draftId`
- `/avatars/:avatarId/edit`
- avatar section rendering
- avatar cards and action menus
- creation stepper
- visual generation flow
- LoRA training lifecycle
- personality forms
- public/private sharing
- clone flow
- use/pause flows
- recycle/delete flows
- SSE progress updates for training and reaction generation

### Out of Scope
- video page brand asset selection
- script generation logic itself
- publish/distribution UX
- monetization or marketplace economics for public avatars
- non-MVP advanced permissions for org assets
- clone re-publication
- visual re-edit after avatar completion

## Locked Decisions Used Here

These are already decided and must not be re-opened during implementation:

- UI term is `Avatars`.
- Voices are generated only.
- No real voice cloning.
- No voice training uploads.
- Creation flow is full-page with internal stepper.
- Drafts can always be saved and resumed.
- Visual training uses a 15-image curated reference set.
- Visual history retains the last 10 iterations.
- Free users can have 10 personal avatars.
- Paid users can have unlimited personal avatars.
- Explore is part of MVP.
- Public avatars are cloned into the user's account.
- Clones use the source visual LoRA snapshot.
- Clones do not retrain LoRA.
- Public source creators can lock clone-editable fields.
- Org avatars are visible and usable by all org members.
- Org avatars do not appear in Explore.
- Pause operates at automation-binding level.
- If only one active automation exists, Pause acts immediately without picker.
- In-progress content pauses when its avatar binding is paused or deleted.
- Delete is soft delete with 10-day recycle retention.
- Recycle restore does not auto-reconnect automations.

## Engineering Assumptions

These should be followed unless the codebase proves otherwise:

- Frontend architecture should align with Next.js.
- Real-time progress should use SSE.
- The page should be built in a way that keeps backend and frontend contracts explicit.
- Async jobs are required for LoRA training and reaction clip generation.
- Basic models implementing this page should not infer hidden behavior outside the docs.

## Cross-Page Dependencies

| Dependent Area | Dependency on Avatars | Implementation Impact |
|---|---|---|
| Industries | Industry dropdown and role presets depend on configured industries | avatar completion cannot require non-existent industry data |
| Scripts | Personality, tone, phrases, hobbies, reactions affect script generation | personality snapshot structure must be stable |
| Videos | Avatar visual profile, reactions, and org assets are consumed in video generation | org assets must not be built on Avatars page |
| Automations | Use/Pause works through automation bindings | deployment API must be designed around binding state |
| Dashboard | Will later summarize avatar state and activity | state model must be queryable and stable |
| Recycle Bin | Soft delete restore path lives outside this page | restore behavior must be deterministic |

## Non-Negotiable Invariants

- Every avatar is fully synthetic.
- Incomplete avatars never appear in completed avatar sections.
- Completed avatars have immutable visuals in MVP.
- Personality edits may continue after completion.
- Personality edits never mutate previously generated outputs.
- Clones remain functional even if the source later becomes private or is deleted.
- Only completed personal original avatars can be public.
- Org avatars are internal assets, not public-gallery assets.
- Each automation can have only one active avatar at a time.

## Main Risks to Manage During Build

### 1. State confusion
If build state and deployment state are mixed, the UI and backend will drift.

Mitigation:
- keep `build_state` persisted
- keep deployment summary derived from bindings

### 2. Clone mutation mistakes
If clones are allowed to touch visual assets, the core visual consistency rule breaks.

Mitigation:
- lock all visual entities at data, API, and UI levels

### 3. Inconsistent delete behavior
If delete does not pause/detach bindings, downstream automations will behave unpredictably.

Mitigation:
- make delete effects explicit in backend logic and test coverage

### 4. Agent drift
A smaller model may invent behavior if documents are vague.

Mitigation:
- always drive implementation from task IDs and workflow docs
- do not permit undocumented behavior changes

## Recommended Build Principle

Implement the page in this order:
1. state and data contracts
2. backend persistence and endpoint scaffolding
3. frontend shell and routes
4. creation flow
5. inventory sections and sharing/clone flows
6. automation deploy/pause flows
7. QA and acceptance

## Execution Output Expected

A complete implementation must deliver:
- all routes working
- all avatar states render correctly
- all build and deployment transitions behave as specified
- low-ambiguity contracts for future pages to integrate with
