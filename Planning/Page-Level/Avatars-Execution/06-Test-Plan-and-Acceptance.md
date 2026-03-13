# 06 — Test Plan and Acceptance

## Objective

Verify that the implemented Avatars page matches the product behavior defined in the final spec and execution package.

This document is written so QA, developers, or smaller models can validate the page systematically.

## Test Strategy

Use 4 test layers:
- unit tests for validation and state derivation
- integration tests for API/business rules
- UI tests for route and interaction coverage
- end-to-end tests for full user journeys

## Highest-Risk Areas

- build state vs deployment summary correctness
- clone lock enforcement
- LoRA invalidation and retry behavior
- delete/restore side effects on bindings
- public eligibility enforcement
- org access rules
- resume behavior for drafts

## Core Scenarios

### A. Draft Creation and Resume
- create new personal draft
- save in Step 1 and resume
- save in Step 3 while LoRA still trains
- confirm draft remains in Continue Creation until all completion rules are met

### B. Visual Identity Flow
- generate base image from prompt
- refine with no mask
- refine with mask
- verify version history cap of 10
- verify active base face selection required

### C. Finalize Appearance and Training
- generate 15 unique reference images
- refine one reference slot
- start LoRA training
- verify SSE progress updates render
- verify 3 auto-retries then manual retry path
- verify retry disabled while active

### D. Personality Completion
- validate required fields
- validate industry/role dependency
- validate custom role questionnaire flow
- complete avatar successfully
- verify completed avatar leaves Continue Creation

### E. My Avatars Inventory
- completed original avatar renders correctly
- completed clone renders with yellow `Cloned` badge
- paused avatar renders with `Paused` badge when appropriate
- `/avatars/all` search/filter/sort works

### F. Explore and Clone
- public eligible avatar appears in Explore
- ineligible avatar cannot be made public
- clone creates personal copy
- clone reuses source visual snapshot
- locked fields are read-only
- unlocked fields are editable
- source private/delete does not break existing clones

### G. Use and Pause
- deploy avatar to one automation
- deploy avatar to multiple automations
- deploy avatar to automation that already has active avatar and verify replacement handling
- pause with one active binding and verify immediate pause
- pause with multiple active bindings and verify picker behavior
- use flow resumes paused bindings

### H. Delete and Restore
- delete personal avatar
- delete public avatar and verify Explore removal
- delete avatar with active bindings and verify pause/detach behavior
- restore within 10 days
- verify restored avatar returns as `not_in_use`
- verify restore blocked when plan limit exceeded

### I. Organisation Behavior
- org avatars visible to org users
- org avatars hidden from personal-only users
- org non-admin user can use but not edit/delete avatar they do not own
- org admin can edit/delete
- org avatars never appear in Explore

## Unit Test Recommendations

Test pure logic for:
- deployment summary derivation
- public eligibility checks
- completion validation
- clone editability resolution
- restore plan-limit checks
- one-active-binding enforcement

## Integration Test Recommendations

Test APIs for:
- draft create/update/read
- base generation and version retention
- reference generation slot completeness
- training retry transitions
- clone creation rules
- deploy/pause behavior
- delete/restore side effects

## UI Test Recommendations

Test:
- section visibility
- card button states
- empty states
- error states
- stepper flow
- disabled actions during loading
- lock rendering in clone edit mode

## Accessibility Verification

Verify:
- keyboard access to all actions
- focus visibility
- color-independent badge meaning
- screen-reader labels on canvas tools
- live announcements for training progress

## Acceptance Checklist

The page is accepted only when all are true:
- [ ] `/avatars` shows all sections correctly
- [ ] Continue Creation only shows incomplete drafts
- [ ] completed avatars never appear in Continue Creation
- [ ] Step 1 supports masked and non-masked refinement
- [ ] visual version history is capped at 10
- [ ] Step 2 generates 15 unique reference images
- [ ] LoRA retries automatically 3 times then exposes manual retry
- [ ] Step 3 can be saved while training is running
- [ ] avatar cannot complete without all required fields and LoRA success
- [ ] My Avatars only shows completed personal avatars
- [ ] Org avatars only show in Organisational Avatars
- [ ] Explore only shows eligible public personal originals
- [ ] clones do not retrain LoRA
- [ ] clone locks are enforced at UI and API levels
- [ ] Use works across multiple automations
- [ ] Pause behaves correctly for single and multiple bindings
- [ ] deleting an in-use avatar pauses/detaches bindings
- [ ] restore returns avatar as `not_in_use`
- [ ] org avatars are usable by all org members
- [ ] org avatars never become public
- [ ] SSE updates are visible in the UI

## Exit Criteria

QA for this page is complete only when:
- all critical and high-severity defects are resolved
- all acceptance checklist items are checked
- all blocking items in workflow docs are closed
- no unresolved ambiguity remains between implemented behavior and page spec
