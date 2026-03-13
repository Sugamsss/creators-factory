# 05 — Backend Build Plan

## Objective

Implement the persistence, API surface, permission rules, state transitions, and async processing needed to support the Avatars page exactly as specified.

## Backend Deliverables

- avatar data entities and relations
- draft creation and update flow
- visual generation endpoints
- reference set generation
- LoRA training orchestration
- public visibility and clone logic
- automation binding deploy/pause behavior
- soft delete and restore logic
- SSE event stream for training and reaction generation

## Backend Architecture Responsibilities

### CRUD Layer
Responsible for:
- creating drafts
- updating draft and completed avatar data
- reading sectioned avatar data
- soft deleting and restoring avatars

### Visual Service Layer
Responsible for:
- generating base images
- generating 15 reference images
- invalidating LoRA when inputs change
- storing visual history and reference slots

### Training Orchestration Layer
Responsible for:
- queueing LoRA jobs
- tracking progress
- handling 3 auto-retries
- exposing manual retry path
- emitting SSE-friendly progress updates

### Personality Layer
Responsible for:
- validating completion payload
- writing personality snapshots
- handling reaction generation job enqueueing

### Explore and Clone Layer
Responsible for:
- eligibility checks for public visibility
- field lock storage
- cloning from public avatars
- protecting clone visual immutability

### Automation Binding Layer
Responsible for:
- creating active bindings
- enforcing one active avatar per automation
- replacing active bindings when confirmed
- pausing selected bindings
- deriving deployment summary

## Backend Build Order

### Phase BE-1 — schema and models
- create or adapt avatar entities
- create visual history tables/entities
- create reference image storage
- create personality snapshot storage
- create field-lock storage
- create automation binding storage

### Phase BE-2 — draft CRUD and reads
- implement draft create/update/read/delete
- implement section list queries
- implement `/avatars/all` query support

### Phase BE-3 — visual generation flows
- implement base image generation endpoint
- implement reference set generation endpoint
- persist visual versions and reference slots
- enforce 10-version retention

### Phase BE-4 — LoRA orchestration
- implement train endpoint
- implement progress tracking
- implement retry policy
- implement invalidation rules
- expose SSE progress stream

### Phase BE-5 — personality and completion
- validate completion criteria
- persist personality snapshot
- queue reaction generation
- mark build state transitions correctly

### Phase BE-6 — sharing and clone behavior
- implement visibility toggle rules
- implement field locks
- implement clone creation with visual snapshot linkage
- block clone re-publication rules in backend

### Phase BE-7 — deploy, pause, delete, restore
- deploy multi-binding behavior
- replace warning support signal
- pause selected bindings
- delete pause/detach logic
- restore with `not_in_use` reset
- limit enforcement on restore

## Query Requirements by UI Section

### Continue Creation query must return
- incomplete drafts only
- current build state
- last updated time
- training status summary
- ownership scope

### My Avatars query must return
- completed personal avatars only
- deployment summary
- badges/visibility state
- source type

### Organisational Avatars query must return
- completed org avatars visible to current user
- whether current user can edit/delete
- deployment summary

### Explore query must return
- only eligible public personal originals
- search/filter/sort support
- creator display metadata
- clone eligibility

## Required Business Rules

### Base face change after Step 2 started
Must:
- invalidate reference set
- cancel active training if possible
- invalidate completed LoRA
- invalidate generated reactions
- move build state back to `draft_appearance`

### Reference image change after LoRA success
Must:
- invalidate current LoRA
- require retraining before completion remains valid

### Clone creation
Must:
- verify source is public, ready, personal, original, not deleted
- create new personal avatar record
- copy cloneable data
- copy field locks
- link to source visual profile snapshot
- not create new LoRA job

### Public toggle
Must reject when avatar is:
- not ready
- org-owned
- a clone
- soft-deleted

### Delete
Must:
- soft delete avatar
- remove public Explore visibility immediately
- pause and detach active bindings
- pause downstream in-progress work tied to those bindings
- set recycle retention fields

### Restore
Must:
- verify retention window
- verify plan limit
- restore avatar record
- clear active bindings
- return deployment summary as `not_in_use`

## SSE Requirements

At minimum expose:
- training start
- training progress
- training retry
- training failed
- training completed
- reaction generation start/completion/failure

Payload must be stable enough for a smaller frontend agent to consume without inferring missing fields.

## Permission Checks

Must exist server-side for:
- personal avatar owner actions
- org member use access
- org creator/admin edit access
- public Explore clone access
- clone locked-field write rejection

## Failure Handling Requirements

### LoRA failures
- 3 auto-retries
- clear failure state after retries exhausted
- manual retry only when current status is failed

### Reaction failures
- do not invalidate completed avatar
- preserve failure state for later retry

### Binding conflicts
- backend must enforce one active avatar per automation even if frontend misses warning path

## Backend Handoff Output

When a backend agent finishes a task, the handoff should include:
- models or tables affected
- endpoints added or changed
- state transitions implemented
- permissions enforced
- jobs or workers touched
- migrations or seed assumptions
- manual/API tests run
