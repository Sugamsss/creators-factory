# Avatars Page — Final Build Specification (MVP)

## 1) Purpose

The Avatars page is the identity layer of the product.

It is the place where users:
- create synthetic avatars
- define and finalize avatar appearance
- train visual consistency via LoRA
- define avatar personality, role, reactions, voice, and tone
- manage where avatars are used across automations
- publish eligible avatars to Explore
- clone public avatars made by other users

This page does **not** handle:
- organisational logos, brand assets, and overlays
- script authoring or script versioning
- video editing or timeline review
- publishing and distribution workflows

---

## 2) Locked Product Decisions Applied Here

- Canonical UI term is **Avatar**.
- Voices are generated only.
- No real voice cloning.
- No voice training uploads.
- Avatar image creation uses iterative prompt + feedback refinement.
- Free users can create up to 10 personal avatars.
- Paid users can create unlimited personal avatars.
- Publish is part of the video flow, not a separate page.

---

## 3) Core Invariants

- Every avatar is fully synthetic.
- Draft creation is always resumable.
- Incomplete avatars appear in `Continue Creation`, not in completed inventory sections.
- Completed avatars have immutable visual identity in MVP.
- Personality can change after completion, but visuals cannot.
- `Use` and `Pause` operate on automation bindings, not directly on videos.
- Clones reuse the source avatar visual LoRA snapshot and do not retrain LoRA in MVP.
- Personality edits affect only future outputs, never already-generated assets or already-running jobs.
- Only completed personal original avatars can be made public.
- Org avatars are internal only and do not appear in Explore.

---

## 4) Ownership, Source, and Visibility Model

### 4.1 Ownership Scope

- **Personal**
  - owned by one user
  - appears in `My Avatars`
  - can be private or public if eligible

- **Organisation**
  - owned by the org workspace
  - appears in `Organisational Avatars`
  - visible to all org members
  - usable by all org members
  - not publishable to Explore in MVP

### 4.2 Source Type

- **Original**
  - created from scratch in the avatar creation flow

- **Clone**
  - created from a public Explore avatar
  - always personal in MVP
  - private by default
  - cannot be re-published to Explore in MVP

### 4.3 Visibility

- **Private**
  - visible only in the owner context

- **Public**
  - visible in Explore
  - allowed only for completed personal original avatars

---

## 5) Route Structure

- `/avatars` — main page
- `/avatars/all` — full list of completed personal avatars
- `/avatars/create/:draftId` — create or resume draft
- `/avatars/:avatarId/edit` — edit completed avatar
- `/recycle-bin` — global recycle bin page

---

## 6) Top-Level Page Layout

### 6.1 Header

- Title: `Avatars`
- Subtitle: `Create and manage your AI avatars`
- Primary CTA: `Create Avatar`

CTA behavior:
- creates a new draft record
- opens `/avatars/create/:draftId`
- if the user is in an org workspace, ownership scope is chosen at draft start

### 6.2 Section Order

1. Continue Creation
2. My Avatars
3. Organisational Avatars
4. Explore Avatars

---

## 7) Section Specifications

### 7.1 Continue Creation

Purpose:
- surface incomplete drafts and training jobs

Visible when:
- the user has at least one incomplete personal draft
- org drafts may also appear here for org-capable users if they created the draft or can edit it

Sort order:
- newest first by `updated_at DESC`

Eligible build states for this section:
- `draft_visual`
- `draft_appearance`
- `training_lora`
- `failed_training`
- `draft_personality`

Card content:
- thumbnail
- current draft name, else `Untitled Avatar`
- ownership badge: `Personal` or `Org`
- current step badge
- last updated time
- training progress and ETA when applicable

Card actions:

| Build State | Buttons |
|---|---|
| `draft_visual` | Continue, Delete |
| `draft_appearance` | Continue, Delete |
| `training_lora` | Continue, Delete |
| `failed_training` | Continue, Retry Training, Delete |
| `draft_personality` | Continue, Delete |

Rules:
- `Continue` reopens the correct step
- `Retry Training` appears only after the current training job fails
- `Retry Training` is disabled while a job is active
- user can continue filling personality fields while LoRA training runs
- user can start other avatars while one avatar is training

### 7.2 My Avatars

Purpose:
- show completed personal avatars only

Does not include:
- incomplete drafts
- org avatars

Display:
- horizontal carousel on `/avatars`
- `View All →` opens `/avatars/all`
- card image is always the front-facing normal-smile image

Card metadata:
- image
- name
- age
- role
- description
- badges where relevant:
  - `Cloned` in yellow
  - `Public`
  - `Paused`

Card actions by deployment summary:

| Deployment Summary | Buttons |
|---|---|
| `not_in_use` | Edit, Use, Delete |
| `in_use` | Edit, Use, Pause, Delete |
| `partially_paused` | Edit, Use, Pause, Delete |
| `fully_paused` | Edit, Use, Delete |

Action notes:
- `Use` remains visible when already in use so the user can add more automations or resume paused ones
- `Pause` is hidden when there are no active bindings left

### 7.3 Organisational Avatars

Purpose:
- show completed org-owned avatars

Visibility:
- only visible to org/enterprise users

Rules:
- all org members can view org avatars
- all org members can use org avatars
- edit/delete is limited to creator and org admins in MVP
- org avatars do not appear in `My Avatars`
- org avatars do not appear in Explore

### 7.4 Explore Avatars

Purpose:
- public gallery of eligible personal original avatars

Discovery features in MVP:
- keyword search
- industry filter
- featured carousel
- popular carousel
- endless scroll feed
- sort tabs: `Featured`, `Popular`, `Newest`

Eligibility for Explore:
- build state = `ready`
- ownership scope = `personal`
- source type = `original`
- avatar is public
- avatar is not soft-deleted

Card content:
- image
- name
- age
- role
- short description
- industry
- creator display name
- `Use Avatar` button

`Use Avatar` behavior:
- creates a personal clone
- clone appears in `My Avatars`
- clone gets a yellow `Cloned` badge
- clone uses the source visual profile snapshot
- clone does not retrain LoRA in MVP

Public sharing controls on source avatar:
- public/private toggle
- field lock configuration
- `Use as-is only` shortcut that locks all clone-editable fields

---

## 8) `/avatars/all` Page

Purpose:
- vertical full-list page for completed personal avatars only

Controls:
- search by name
- filter by source type: original, clone
- filter by visibility: private, public
- filter by deployment summary: not in use, in use, paused
- sort by newest, oldest, recently edited, alphabetical

This page does not include drafts.

---

## 9) State Model

The page uses two layers of status.

### 9.1 Build State

- `draft_visual`
- `draft_appearance`
- `training_lora`
- `failed_training`
- `draft_personality`
- `ready`
- `soft_deleted`

### 9.2 Deployment Summary

- `not_in_use`
- `in_use`
- `partially_paused`
- `fully_paused`

### 9.3 Derivation Rules

- if build state is not `ready`, deployment summary is `null`
- if build state is `ready` and there are zero bindings, deployment summary = `not_in_use`
- if at least one binding is active and none are paused, deployment summary = `in_use`
- if at least one binding is active and at least one is paused, deployment summary = `partially_paused`
- if all existing bindings are paused, deployment summary = `fully_paused`

### 9.4 Build State Transitions

- `draft_visual` → `draft_appearance` when user accepts a base face
- `draft_appearance` → `training_lora` when reference set is confirmed and training begins
- `training_lora` → `failed_training` when retries are exhausted
- `failed_training` → `training_lora` on manual retry
- `training_lora` → `draft_personality` when LoRA succeeds but required personality completion is still missing
- `draft_visual` / `draft_appearance` / `training_lora` / `failed_training` / `draft_personality` → `ready` only when all completion criteria are met
- any non-deleted state → `soft_deleted` on delete

---

## 10) Creation and Edit Workspace

### 10.1 Container

The avatar creation experience is a **full-page workspace with an internal stepper**.

Stepper stages:
1. Visual Identity
2. Finalize Appearance
3. Personality

Rules:
- it is not a modal
- it has its own URL
- autosave is always on
- `Save & Exit` is always available
- completed avatars open in edit mode, not draft mode

### 10.2 Entry Paths

- `Create Avatar` starts a new draft
- `Continue` resumes a draft at the correct step
- `Edit` opens a completed avatar in edit mode
- cloning creates the clone first, then opens edit mode if unlocked fields exist

### 10.3 Edit Mode for Completed Avatars

- completed avatars open to Step 3 by default
- Steps 1 and 2 are view-only after completion
- clones show locked fields as read-only

---

## 11) Step 1 — Visual Identity

### 11.1 Purpose
- create and refine the avatar's base face and visual anchor

### 11.2 Required Inputs
- initial visual prompt, minimum 10 characters
- age, integer 1-120
- ownership scope if user can create both personal and org avatars

### 11.3 Layout
- main preview canvas
- prompt/chat composer below canvas
- tool rail
- version history panel

### 11.4 Tool Rail
- red mask brush
- mask eraser
- clear mask
- undo
- redo
- jump to prior version

### 11.5 Generation Logic
- every prompt is enhanced server-side before generation
- no mask means global refinement
- mask means localized inpainting refinement
- every successful generation creates a new version

### 11.6 Version History
- maximum retained versions: 10
- retention policy: FIFO
- each version stores:
  - image URL
  - raw prompt
  - enhanced prompt
  - AI-generated edit title
  - timestamp
  - mask metadata if used

### 11.7 Exit Criterion
- user must mark one generated image as active base face

### 11.8 Reset Rule
- if the active base face changes after Step 2 has started:
  - reference set is invalidated
  - active LoRA training is cancelled
  - completed LoRA is invalidated
  - generated reaction assets are invalidated
  - build state returns to `draft_appearance`

---

## 12) Step 2 — Finalize Appearance

### 12.1 Purpose
- generate the reference set and train the visual consistency model

### 12.2 Trigger
- user clicks `Finalize Appearance`

### 12.3 Reference Image Policy

Exactly **15 unique reference images** are generated:

- 9 angle shots with `normal smile`
  - front
  - slight left
  - full left
  - slight right
  - full right
  - slight up
  - full up
  - slight down
  - full down

- 7 front-facing expression shots
  - excited
  - happy
  - normal smile
  - serious
  - normal sad
  - sad
  - devastated

- `front + normal smile` overlaps and is counted once

### 12.4 Review and Refinement
- the 15 images are displayed in a grid
- any image can be opened and refined using the Step 1 tooling
- any refined image replaces its slot in the reference set

### 12.5 LoRA Training UX

Training starts only after the user confirms the set.

Display:
- progress bar
- ETA
- current retry count
- status label

Status labels:
- `Preparing dataset`
- `Training`
- `Validating`
- `Retrying`
- `Failed`
- `Completed`

### 12.6 Failure Policy
- automatic retry limit: 3
- after retries are exhausted:
  - build state becomes `failed_training`
  - `Retry Training` appears
- manual retries are unlimited
- retry is disabled while a job is active

### 12.7 Exit Criterion
- LoRA training must succeed

### 12.8 Reset Rule
- editing any confirmed reference image after LoRA success invalidates the LoRA and requires retraining

---

## 13) Step 3 — Personality

### 13.1 Purpose
- define how the avatar behaves, speaks, reacts, and fits within an industry

### 13.2 Timing
- Step 3 may be filled while LoRA is still training
- final completion is blocked until LoRA succeeds

### 13.3 Save Modes
- `Save Draft` is always allowed
- `Complete Avatar` is allowed only when all completion criteria are satisfied

If incomplete:
- avatar remains in `draft_personality`
- avatar stays in `Continue Creation`

### 13.4 Field Groups

#### A) Basic Info
- `name`
  - required
  - 2-40 characters
- `age`
  - required
  - 1-120
- `description`
  - required
  - 20-240 characters

#### B) Identity and Backstory
- `backstory`
  - required
  - 80-800 characters
- `communication_principles`
  - required list
  - minimum 1
  - maximum 8
  - each item 5-140 characters

#### C) Industry and Role
- `industry_id`
  - dropdown of configured industries only
  - may be skipped temporarily in draft stage
  - required for completion

- `role`
  - available only after industry is selected
  - show 6 predefined role paragraphs for that industry
  - or allow `Custom Role`

Custom Role questionnaire:
1. Primary responsibility
2. Audience served
3. Seniority level: `entry`, `mid`, `senior`, `lead`
4. Communication style in role
5. Top 3 recurring scenarios this role handles

System behavior:
- system drafts one role paragraph from the questionnaire
- user may edit that paragraph before saving

#### D) Visual Personality
- `wardrobe_items`
  - optional list
  - max 12
  - each item contains title, descriptor, optional reference image

- `environment_items`
  - optional list
  - max 12
  - each item contains title, descriptor, optional reference image

#### E) Behavioral Personality
- `hobbies`
  - optional list
  - max 10
  - used later for examples and analogies in scripts

- `phrases`
  - optional list
  - max 20
  - each item contains situation label, phrase or analogy text, optional note

- `gestures_text`
  - optional free text
  - max 400 characters
  - used as baseline speaking-body-language guidance

#### F) Reactions

Predefined reaction templates in MVP:
1. Subtle Approval
2. Excited Breakthrough
3. Thoughtful Pause
4. Friendly Laugh
5. Concerned Empathy
6. Confident Emphasis

Rules:
- user can select 0-6 predefined reactions
- user can create up to 4 custom reactions
- each reaction stores:
  - name
  - usage intent
  - hook description
  - generation prompt
  - asset status
  - clip URL when ready

Generation behavior:
- reaction clips are generated asynchronously after avatar completion
- prompts must be dynamic so outputs vary by avatar identity
- avatar completion does not wait for reaction generation to finish
- if a reaction is referenced before ready, the system falls back to gesture/tone guidance

#### G) Voice and Tone

Voice modes:
- `Library`
- `Custom Generated`

Library mode:
- 24 generated voices in MVP
- organized into 6 archetypes with 4 variations each
- each voice exposes:
  - voice archetype
  - perceived age range
  - accent
  - base tone
- user can add custom descriptors up to 40 words
- user must preview before selecting

Custom generated mode:
- user writes a voice description prompt
- system generates preview samples
- user chooses one sample as the saved voice

Tone:
- multi-select predefined tags
- maximum 8 predefined tags
- up to 5 custom tone tags

---

## 14) Completion Rules

`Complete Avatar` requires all of the following:
- active base face selected
- reference set confirmed
- LoRA training successful
- valid name
- valid age
- valid description
- valid backstory
- at least one communication principle
- industry selected
- role selected or generated

On success:
- build state becomes `ready`
- avatar leaves `Continue Creation`
- avatar appears in `My Avatars` or `Organisational Avatars`
- reaction assets enter async generation queue if configured

---

## 15) Public Sharing and Clone Rules

### 15.1 Public Eligibility

Only avatars matching all conditions may be public:
- build state = `ready`
- ownership scope = `personal`
- source type = `original`
- not soft-deleted

### 15.2 Public Configuration

When the owner toggles public on, they configure:
- public visibility
- which clone-editable fields are locked
- whether `Use as-is only` should lock all clone-editable fields

### 15.3 Clone Behavior

When a user clones a public avatar:
- a new personal avatar record is created
- source type = `clone`
- the clone receives a copy of cloneable metadata
- the clone receives the field lock map
- the clone points to the source visual profile snapshot
- the clone does not use Step 1 or Step 2 in MVP

### 15.4 Clone Editing Rules

Always non-editable in clones:
- base visual image
- reference set
- LoRA / visual profile snapshot

Editable only if not locked by the source creator:
- name
- description
- backstory
- communication principles
- industry
- role
- wardrobe
- environments
- hobbies
- reactions
- phrases
- gestures
- voice
- tone

### 15.5 Source Change Safety

If the original avatar later becomes private or is deleted:
- it disappears from Explore immediately
- existing clones remain functional
- clones keep their linked visual profile snapshot

---

## 16) Use and Pause Mechanics

### 16.1 Automation Binding Rule
- each automation can have only one active avatar at a time

If a selected automation already has another active avatar:
- show a replacement warning before confirmation
- confirming replaces the previous active binding

### 16.2 Use Flow

Trigger:
- user clicks `Use`

Picker behavior:
- lists only automations the user can access
- supports multi-select
- shows search if automation count is greater than 8

Controls:
- Select All
- Clear All
- Cancel
- Use

On confirmation:
- selected automations receive active bindings to this avatar
- deployment summary is re-derived immediately

### 16.3 Pause Flow

Trigger:
- user clicks `Pause`

Behavior:
- if exactly one active binding exists, pause immediately without picker
- if multiple active bindings exist, show checklist picker

Picker controls:
- Select All
- Clear All
- Cancel
- Confirm Pause

Result:
- selected active bindings become paused
- in-progress content under those bindings also pauses
- deployment summary is re-derived immediately

### 16.4 Resume Rule

There is no separate `Resume` button.
`Use` is the resume path.

If a previously paused automation is selected in `Use`:
- that binding becomes active again

---

## 17) Editing Rules After Completion

### 17.1 Visual Editing
- not allowed after avatar completion
- to change visual identity, user must create a new avatar

### 17.2 Personality Editing
- allowed after completion
- allowed while avatar is deployed
- locked clone fields remain read-only

### 17.3 Runtime Effect Rule
- personality edits apply only to future generations
- they do not mutate:
  - rendered videos
  - queued segments
  - generated scripts
  - already-running jobs started before the edit

### 17.4 Snapshot Rule
- each successful personality save creates a new personality snapshot version
- UI rollback is not required in MVP
- backend must preserve snapshot lineage

---

## 18) Delete and Recycle Bin

### 18.1 Delete Behavior
- all deletes are soft deletes
- deleted avatars move to `/recycle-bin`

### 18.2 Immediate Delete Effects
- avatar disappears from its source section immediately
- if public, it is removed from Explore immediately
- if it has active bindings, those bindings are paused and detached
- in-progress content tied to those bindings pauses

### 18.3 Retention
- recycle bin retention is 10 days
- hard delete runs automatically after 10 days

### 18.4 Restore Behavior
- restore is allowed within 10 days
- restored avatars return as completed avatars with deployment summary reset to `not_in_use`
- restore does not auto-reactivate previous automations

---

## 19) Limits and Counting Rules

### 19.1 Personal Avatar Limits
- Free: 10
- Paid: unlimited

### 19.2 Counts Toward Personal Limit
- completed personal originals
- completed personal clones
- incomplete personal drafts

### 19.3 Does Not Count Toward Personal Limit
- soft-deleted avatars in recycle bin
- org-owned avatars

### 19.4 Restore Edge Case
- if restoring would exceed the limit, restore is blocked with an upgrade or cleanup message

---

## 20) Data Model Contract

### 20.1 `avatars`
- `id`
- `owner_user_id`
- `org_id` nullable
- `ownership_scope` (`personal` | `org`)
- `source_type` (`original` | `clone`)
- `source_avatar_id` nullable
- `visual_profile_snapshot_id`
- `build_state`
- `name`
- `age`
- `description`
- `industry_id` nullable
- `role_paragraph` nullable
- `active_card_image_url`
- `is_public`
- `deleted_at` nullable
- `hard_delete_at` nullable
- `created_at`
- `updated_at`

### 20.2 `avatar_visual_versions`
- `id`
- `avatar_id`
- `version_index`
- `image_url`
- `raw_prompt`
- `enhanced_prompt`
- `edit_title`
- `mask_metadata` nullable
- `created_at`

### 20.3 `avatar_reference_images`
- `id`
- `avatar_id`
- `slot_key`
- `image_url`
- `angle`
- `expression`
- `is_confirmed`
- `created_at`

### 20.4 `avatar_visual_profiles`
- `id`
- `avatar_id`
- `lora_model_id`
- `training_status`
- `training_attempt_count`
- `training_started_at`
- `training_completed_at` nullable
- `training_error_code` nullable

### 20.5 `avatar_personality_snapshots`
- `id`
- `avatar_id`
- `version_number`
- `payload_json`
- `created_at`

### 20.6 `avatar_reaction_assets`
- `id`
- `avatar_id`
- `name`
- `usage_intent`
- `hook_description`
- `generation_prompt`
- `status`
- `clip_url` nullable
- `is_predefined`
- `created_at`

### 20.7 `avatar_field_locks`
- `id`
- `avatar_id`
- `field_path`
- `is_locked`

### 20.8 `avatar_automation_bindings`
- `id`
- `avatar_id`
- `automation_id`
- `binding_status` (`active` | `paused`)
- `created_at`
- `updated_at`

---

## 21) API Contract

### 21.1 Core Avatar Endpoints
- `POST /api/avatars/drafts`
- `GET /api/avatars`
- `GET /api/avatars/:id`
- `PATCH /api/avatars/:id`
- `DELETE /api/avatars/:id`

### 21.2 Visual Generation Endpoints
- `POST /api/avatars/:id/generate-base`
- `POST /api/avatars/:id/generate-references`
- `POST /api/avatars/:id/train-lora`
- `POST /api/avatars/:id/retry-lora`

### 21.3 Sharing and Clone Endpoints
- `POST /api/avatars/:id/toggle-visibility`
- `POST /api/avatars/:id/clone`

### 21.4 Deployment Endpoints
- `POST /api/avatars/:id/deploy`
- `POST /api/avatars/:id/pause`

### 21.5 Recycle Bin Endpoints
- `POST /api/recycle-bin/:id/restore`

---

## 22) SSE Contract

### 22.1 Endpoint
- `GET /api/avatars/:id/events`

### 22.2 Required Event Types
- `avatar.training.started`
- `avatar.training.progress`
- `avatar.training.retrying`
- `avatar.training.failed`
- `avatar.training.completed`
- `avatar.reaction.generation.started`
- `avatar.reaction.generation.completed`
- `avatar.reaction.generation.failed`

### 22.3 Training Progress Payload
- `avatarId`
- `status`
- `progressPercent`
- `retryAttempt`
- `etaSeconds`
- `message`

---

## 23) Validation Rules Summary

- name is required
- age is required
- description is required
- backstory is required
- at least one communication principle is required
- industry is required for completion
- role is required once industry is selected
- LoRA must succeed before completion
- public toggle is blocked for ineligible avatars
- clone creation is blocked if source avatar is no longer public or is deleted

---

## 24) Empty, Loading, and Error States

### 24.1 Empty States
- no avatars: show primary CTA and guided hint
- no drafts: hide `Continue Creation`
- no Explore results: show filter reset CTA

### 24.2 Loading States
- skeleton cards for sections
- inline loaders for dropdown fetches
- disabled action state while mutations are in flight

### 24.3 Error States
- training failure after retries shows retry CTA
- deploy failure preserves previous state and shows non-destructive error
- clone failure must not create a partial clone record
- restore failure due to plan limit shows actionable message

---

## 25) Accessibility and Responsive Requirements

### 25.1 Accessibility
- full keyboard access for cards, dropdowns, steppers, and dialogs
- visible focus states for all interactive controls
- ARIA labels on canvas tools and version actions
- polite live region for training progress updates
- all status badges must have readable text labels, not color alone

### 25.2 Responsive Behavior
- mobile: sections stack vertically and carousels become snap-scroll lists
- tablet/desktop: My Avatars and Organisational Avatars remain horizontal rows
- stepper remains visible on all breakpoints and compresses into compact step tabs on small screens

---

## 26) Telemetry Events

- `avatar_create_started`
- `avatar_visual_iteration_added`
- `avatar_visual_iteration_undone`
- `avatar_reference_generation_started`
- `avatar_lora_training_started`
- `avatar_lora_training_failed`
- `avatar_lora_training_completed`
- `avatar_personality_saved`
- `avatar_completed`
- `avatar_deployed`
- `avatar_paused`
- `avatar_cloned`
- `avatar_soft_deleted`
- `avatar_restored`

---

## 27) Cross-Page Dependency

Organisational brand assets, logos, overlays, and similar media are **not** configured on Avatars.
They must be specified in the Videos page planning and attached during video creation or render configuration.

---

## 28) Build Acceptance Checklist

- [ ] `/avatars` shows all sections with correct visibility rules
- [ ] Continue Creation lists only incomplete work and sorts newest first
- [ ] visual iteration supports both masked and non-masked refinement
- [ ] version history caps at 10 retained items
- [ ] Step 2 generates exactly 15 unique reference images
- [ ] LoRA auto-retries 3 times, then exposes manual retry
- [ ] Step 3 supports draft save while LoRA is still training
- [ ] completion is blocked until all required fields and LoRA success are present
- [ ] Industry → Role dependency works correctly, including custom role questionnaire
- [ ] voice supports library selection and custom generation with preview
- [ ] public eligibility rules are enforced
- [ ] Explore supports search, filter, sort tabs, featured, popular, and endless scroll
- [ ] clones reuse the source visual profile and do not retrain LoRA
- [ ] clone locks are enforced field-by-field
- [ ] Use supports multi-select automation deployment
- [ ] Pause supports the single-binding shortcut and multi-binding picker
- [ ] in-progress content pauses when its avatar binding is paused or deleted
- [ ] completed avatars have immutable visual steps in edit mode
- [ ] delete performs soft delete and recycle restore within 10 days
- [ ] restore returns avatar as `not_in_use`
- [ ] org avatars are visible and usable by all org members
- [ ] org avatars never appear in Explore
- [ ] SSE updates training progress in real time

---

## 29) Final Status

This document is final, internally consistent, and ready to build for MVP.