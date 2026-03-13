# Avatars — Page-Level Planning

## Page Purpose

The Avatars page is the identity-management core of the product.

It allows users to:
- create synthetic avatars from scratch
- resume incomplete avatar drafts
- finalize avatar appearance and train LoRA
- define personality, role, reactions, voice, and tone
- manage personal and organisation-owned avatars
- publish eligible personal avatars to Explore
- clone public avatars from Explore
- deploy avatars to automations
- pause avatar usage per automation
- soft delete and restore avatars

This page is one of the highest-leverage pages in the product because Scripts, Videos, and Automations all depend on avatar identity being modeled correctly.

## Sidebar Position

2nd top-level sidebar page — `face` icon.

## Canonical References

- Final behavior source: `Avatar-page-initial-idea.md`
- Execution package: `Planning/Page-Level/Avatars-Execution/README.md`
- Agent workflow: `Planning/Page-Level/Avatars-Execution/workflow/`

This file is the **page-level planning summary**.
The execution package is the **implementation system**.

---

## Page Scope

### In Scope
- avatar creation
- resumable draft flow
- visual refinement and visual history
- 15-image reference generation
- LoRA training and retry handling
- personality creation and editing
- personal avatars
- organisational avatars
- Explore public gallery
- cloning public avatars
- deploy/use flow for automations
- pause flow for automations
- delete and recycle restore behavior

### Out of Scope
- organisational logos and overlays
- script authoring
- video editing and timeline review
- publish/distribution controls
- public marketplace monetization
- clone republishing
- visual editing after completion

---

## Key Objects / Entities

- Avatar
- Avatar draft
- Avatar visual version
- Avatar reference image set
- Avatar visual profile / LoRA
- Avatar personality snapshot
- Avatar reaction asset
- Avatar field lock map
- Avatar automation binding
- Personal avatar
- Organisation avatar
- Public avatar
- Clone avatar

---

## Core Product Rules

- Every avatar is fully synthetic.
- Draft creation is always resumable.
- Incomplete avatars appear in `Continue Creation`, not completed inventory sections.
- Completed avatars have immutable visual identity in MVP.
- Personality can be edited after completion.
- Visual identity cannot be edited after completion.
- `Use` and `Pause` operate on automation bindings, not directly on videos.
- Clones reuse the source avatar visual profile snapshot and do not retrain LoRA in MVP.
- Personality edits affect only future outputs, not previously generated assets.
- Only completed personal original avatars can be made public.
- Org avatars are internal only and do not appear in Explore.

---

## Ownership and Visibility Model

### Ownership Scope

- **Personal**
  - owned by one user
  - appears in `My Avatars`
  - may be private or public if eligible

- **Organisation**
  - owned by the organisation workspace
  - appears in `Organisational Avatars`
  - visible to all org members
  - usable by all org members
  - not public-gallery eligible in MVP

### Source Type

- **Original**
  - created from scratch in the avatar builder

- **Clone**
  - created from a public Explore avatar
  - always personal in MVP
  - private by default
  - cannot be republished to Explore in MVP

### Visibility Type

- **Private**
  - visible in the owner context only

- **Public**
  - visible in Explore
  - allowed only for completed personal original avatars

---

## User Goals on This Page

- create a new avatar from scratch
- continue and complete a previously saved draft
- finalize a visual identity and train consistency
- configure a believable and useful personality
- create an avatar for personal use or for an organisation
- browse public avatars made by others
- clone a public avatar and customize unlocked fields
- deploy an avatar into one or more automations
- pause avatar usage cleanly without deleting it
- manage avatar inventory over time

---

## Layout and Sections

### Header
- title: `Avatars`
- subtitle: `Create and manage your AI avatars`
- primary CTA: `Create Avatar`

### Section 1 — Continue Creation

Purpose:
- show incomplete avatar drafts and training jobs

Visible for:
- incomplete personal drafts
- relevant org drafts if the user can edit them

Shows:
- thumbnail
- draft name or `Untitled Avatar`
- ownership badge
- step/build-state indicator
- updated time
- training progress and ETA if applicable

Build states shown here:
- `draft_visual`
- `draft_appearance`
- `training_lora`
- `failed_training`
- `draft_personality`

Actions:
- Continue
- Retry Training when failed
- Delete

### Section 2 — My Avatars

Purpose:
- show completed personal avatars only

Does not include:
- drafts
- org avatars

Display:
- horizontal carousel on `/avatars`
- `View All →` opens `/avatars/all`

Card shows:
- front-facing normal-smile image
- name
- age
- role
- description
- badges as needed:
  - `Cloned`
  - `Public`
  - `Paused`

Actions vary by deployment summary:
- `not_in_use` -> Edit, Use, Delete
- `in_use` -> Edit, Use, Pause, Delete
- `partially_paused` -> Edit, Use, Pause, Delete
- `fully_paused` -> Edit, Use, Delete

### Section 3 — Organisational Avatars

Purpose:
- show completed org-owned avatars

Rules:
- visible only to org/enterprise users
- all org members can view and use org avatars
- creator and org admins can edit/delete in MVP
- org avatars do not appear in Explore

### Section 4 — Explore Avatars

Purpose:
- public gallery of eligible personal original avatars

Discovery features:
- keyword search
- industry filter
- featured carousel
- popular carousel
- endless scroll feed
- tabs: `Featured`, `Popular`, `Newest`

Card shows:
- image
- name
- age
- role
- short description
- industry
- creator display name
- `Use Avatar`

Clone behavior from Explore:
- creates a personal clone
- clone appears in `My Avatars`
- clone gets a yellow `Cloned` badge
- clone uses source visual profile snapshot
- clone does not retrain LoRA

---

## Main Routes

- `/avatars`
- `/avatars/all`
- `/avatars/create/:draftId`
- `/avatars/:avatarId/edit`
- `/recycle-bin`

---

## User Flows

### 1. Create Avatar from Scratch
1. User clicks `Create Avatar`
2. Draft record is created
3. User enters the full-page builder
4. User completes Step 1 visual generation
5. User completes Step 2 appearance finalization and LoRA training
6. User completes Step 3 personality configuration
7. Avatar becomes `ready`
8. Avatar appears in completed inventory

### 2. Save and Resume Draft
1. User exits during any draft step
2. Draft persists automatically
3. Draft appears in `Continue Creation`
4. User clicks `Continue`
5. Flow resumes at the correct step

### 3. Create Org Avatar
1. User starts avatar creation from an org-capable context
2. User chooses ownership scope = organisation
3. Avatar is created through the same 3-step flow
4. Completed avatar appears in `Organisational Avatars`

### 4. Publish Personal Avatar to Explore
1. User opens a completed eligible personal original avatar
2. User toggles it public
3. User configures lockable fields or `Use as-is only`
4. Avatar becomes visible in Explore

### 5. Clone Public Avatar
1. User browses Explore
2. User clicks `Use Avatar`
3. System creates a personal clone
4. Clone appears in `My Avatars`
5. Clone can edit only unlocked fields

### 6. Deploy Avatar to Automations
1. User clicks `Use`
2. Automation picker opens
3. User selects one or more automations
4. If replacement is required, user confirms
5. Avatar bindings become active

### 7. Pause Avatar Usage
1. User clicks `Pause`
2. If one active binding exists, pause happens immediately
3. If multiple active bindings exist, user chooses which to pause
4. In-progress content under those bindings pauses too

### 8. Delete and Restore Avatar
1. User deletes avatar
2. Avatar soft-deletes and moves to recycle bin
3. Public avatar is removed from Explore immediately
4. Active bindings are paused and detached
5. User may restore within 10 days
6. Restored avatar returns as `not_in_use`

---

## Creation Flow Design

### Container
- full-page workspace
- internal stepper
- autosave always on
- `Save & Exit` available

### Step 1 — Visual Identity
- prompt-driven generation
- red-mask localized refinement
- global refinement without mask
- version history capped at 10
- user must select one active base face

### Step 2 — Finalize Appearance
- generate 15 unique reference images
- 9 angle shots with normal smile
- 7 front-facing expression shots with one overlap
- allow per-image refinement
- LoRA training begins after confirmation
- 3 automatic retries, then unlimited manual retry

### Step 3 — Personality
- can be filled while LoRA is still training
- final completion waits for LoRA success
- includes:
  - Basic Info
  - Identity and Backstory
  - Industry and Role
  - Visual Personality
  - Behavioral Personality
  - Reactions
  - Voice and Tone

---

## Personality Scope

### Required Core Fields
- name
- age
- description
- backstory
- at least one communication principle
- industry
- role

### Industry and Role
- industry comes from configured industries only
- role unlocks after industry selection
- 6 predefined role paragraphs per industry
- custom role option uses questionnaire and generated paragraph

### Reactions
- 6 predefined MVP reaction templates:
  - Subtle Approval
  - Excited Breakthrough
  - Thoughtful Pause
  - Friendly Laugh
  - Concerned Empathy
  - Confident Emphasis
- up to 4 custom reactions
- clips generate asynchronously after avatar completion

### Voice
- library mode or custom generated mode
- 24 generated voices in MVP
- preview required before selection
- no voice training and no real voice cloning

### Tone
- multi-select predefined tags
- additional custom tags supported

---

## State Management

### Build State
- `draft_visual`
- `draft_appearance`
- `training_lora`
- `failed_training`
- `draft_personality`
- `ready`
- `soft_deleted`

### Deployment Summary
- `not_in_use`
- `in_use`
- `partially_paused`
- `fully_paused`

### Important Rule
Build state and deployment summary must remain separate.
They represent different concerns and must not be collapsed into one status field.

---

## Integration Points

- Avatar CRUD API
- visual generation service
- LoRA training orchestration
- voice generation service
- AI personality / reaction generation systems
- automation binding/deployment system
- recycle bin / restore system
- SSE event stream for training and reaction generation progress

---

## Edge Cases

- user changes base face after reference generation has already begun
- user edits a confirmed reference image after LoRA success
- training fails after retries and must be manually retried
- clone source becomes private or deleted after clones already exist
- user tries to make ineligible avatar public
- restore would exceed plan limit
- completed clone has all fields locked
- org member can use but not edit an org avatar they do not own
- user pauses an avatar with only one active binding
- user deletes an in-use public avatar

---

## Responsive Behavior

- mobile: sections stack vertically
- mobile carousels become snap-scroll lists
- tablet/desktop keep My Avatars and Org rows horizontal
- stepper remains visible across breakpoints and compresses on small screens

---

## Empty States

- no avatars -> show `Create Avatar` guidance
- no drafts -> hide `Continue Creation`
- no Explore results -> show filter reset CTA
- no industries configured -> allow draft continuation but block final completion until industry is selected

---

## Error States

- training failure after auto-retries
- failed autosave
- deploy conflict or deploy API failure
- clone failure without partial clone creation
- restore blocked due to plan limit
- public toggle rejected due to ineligible avatar state

---

## Accessibility Notes

- full keyboard access for cards, pickers, steppers, and dialogs
- visible focus states required
- all badges require readable text, not color only
- canvas tools need ARIA labels
- training progress should announce through live region

---

## Decisions Made

| Area | Decision |
|---|---|
| Terminology | Canonical UI term is `Avatars` |
| Creation container | Full-page with internal stepper |
| Save behavior | Draft creation is resumable |
| Visual training set | 15 curated reference images |
| Visual history | 10 retained versions |
| Voice system | Generated only |
| Explore | In MVP |
| Clone visuals | Reuse source visual snapshot, no retraining |
| Public eligibility | Personal original completed avatars only |
| Org avatars | Internal only, visible/usable by all org members |
| Pause behavior | Operates on automation bindings |
| Delete behavior | Soft delete with 10-day recycle retention |

---

## Execution Package Reference

Detailed execution materials live in:

- `Planning/Page-Level/Avatars-Execution/README.md`
- `Planning/Page-Level/Avatars-Execution/01-Execution-Context.md`
- `Planning/Page-Level/Avatars-Execution/02-UX-and-Interaction-Spec.md`
- `Planning/Page-Level/Avatars-Execution/03-Data-API-and-Events.md`
- `Planning/Page-Level/Avatars-Execution/04-Frontend-Build-Plan.md`
- `Planning/Page-Level/Avatars-Execution/05-Backend-Build-Plan.md`
- `Planning/Page-Level/Avatars-Execution/06-Test-Plan-and-Acceptance.md`
- `Planning/Page-Level/Avatars-Execution/workflow/`

---

## Readiness Checklist

- [x] Page purpose defined
- [x] Core sections designed
- [x] Main user flows mapped
- [x] Avatar creation flow defined
- [x] Personality scope defined
- [x] State model defined
- [x] Ownership and visibility rules defined
- [x] Explore and clone behavior defined
- [x] Use/Pause/Delete/Restore behavior defined
- [x] Edge cases documented
- [x] Empty/error states outlined
- [x] Accessibility expectations defined
- [x] Execution package created
- [x] Workflow folder created for agent execution

## Current Status

Page-level planning is complete.
Execution planning is complete.
Implementation has not started yet.
