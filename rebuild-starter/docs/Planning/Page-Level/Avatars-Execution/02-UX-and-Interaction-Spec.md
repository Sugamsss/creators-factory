# 02 — UX and Interaction Specification

## Route Inventory

| Route | Purpose | Primary User |
|---|---|---|
| `/avatars` | Main avatar hub | all users |
| `/avatars/all` | Full list of completed personal avatars | personal users |
| `/avatars/create/:draftId` | Create or resume draft | creator |
| `/avatars/:avatarId/edit` | Edit completed avatar | owner / permitted org editor |
| `/recycle-bin` | Restore soft-deleted assets | owner / permitted user |

## `/avatars` — Page Layout

### Header
- title: `Avatars`
- subtitle: `Create and manage your AI avatars`
- primary CTA: `Create Avatar`

Primary CTA behavior:
- creates a new draft record
- opens the full-page creation workspace
- if the user can create both personal and org avatars, show ownership choice first

### Section Order
1. Continue Creation
2. My Avatars
3. Organisational Avatars
4. Explore Avatars

## Section Rules

### Continue Creation

Shows only incomplete work.

Allowed build states:
- `draft_visual`
- `draft_appearance`
- `training_lora`
- `failed_training`
- `draft_personality`

Card fields:
- thumbnail
- name or `Untitled Avatar`
- ownership badge
- step badge
- updated time
- training progress when applicable

Actions:
- Continue
- Retry Training when failed
- Delete

Behavior rules:
- Continue returns to the correct step
- Retry is disabled while training is active
- Delete performs soft delete
- training cards must show ETA when available

### My Avatars

Shows only completed personal avatars.

Card fields:
- image
- name
- age
- role
- description
- badges:
  - `Cloned`
  - `Public`
  - `Paused`

Actions by deployment summary:
- `not_in_use` -> Edit, Use, Delete
- `in_use` -> Edit, Use, Pause, Delete
- `partially_paused` -> Edit, Use, Pause, Delete
- `fully_paused` -> Edit, Use, Delete

### Organisational Avatars

Shows only completed org-owned avatars.

Rules:
- visible only to org/enterprise users
- all org members may use them
- creator and org admins may edit/delete them
- non-admin non-creators may only use or pause them if relevant

### Explore Avatars

Shows only eligible public personal original avatars.

Discovery features:
- keyword search
- industry filter
- featured carousel
- popular carousel
- endless scroll
- tabs: Featured, Popular, Newest

Explore card fields:
- image
- name
- age
- role
- short description
- industry
- creator name
- `Use Avatar`

`Use Avatar` behavior:
- creates a personal clone
- clone appears in My Avatars
- clone has yellow `Cloned` badge
- clone points to source visual profile snapshot
- clone does not retrain LoRA

## `/avatars/all` — Full Inventory Page

Purpose:
- show all completed personal avatars in a searchable/filterable list

Controls:
- search by name
- filter by source type
- filter by visibility
- filter by deployment summary
- sort by newest, oldest, recently edited, alphabetical

Does not include:
- incomplete drafts
- org avatars

## Create/Edit Workspace

### Container
- full-page workspace
- internal stepper
- autosave enabled
- manual `Save & Exit`

Stepper stages:
1. Visual Identity
2. Finalize Appearance
3. Personality

### Entry Paths
- create new avatar
- continue draft
- edit completed avatar
- edit clone

### Completed Avatar Edit Mode
- open directly to Step 3
- Steps 1 and 2 are visible but read-only
- clone locked fields are read-only

## Step 1 — Visual Identity

Purpose:
- create/refine the base face and visual anchor

Required inputs:
- prompt
- age
- ownership scope when needed

UI elements:
- preview canvas
- prompt composer
- tool rail
- version history panel

Tool rail actions:
- red mask brush
- eraser
- clear mask
- undo
- redo
- jump to version

Generation rules:
- prompt is enhanced server-side
- no mask = global refinement
- mask = inpainting refinement
- each successful generation creates a new version

Version history rules:
- cap at 10
- oldest drops first
- each version stores prompt, enhanced prompt, title, image, timestamp, optional mask metadata

Exit rule:
- one image must be marked as active base face

Reset rule after Step 2 started:
- changing base face invalidates reference set
- cancels/invalidates LoRA
- invalidates generated reactions
- returns build state to `draft_appearance`

## Step 2 — Finalize Appearance

Purpose:
- generate the reference set and train LoRA

Reference set:
- 9 angle shots with normal smile
- 7 front-facing expression shots
- front + normal smile overlaps once
- total unique images = 15

Review behavior:
- show 15-image grid
- each image can be opened and refined
- refined image replaces its slot

Training UI:
- progress bar
- ETA
- retry count
- status label

Allowed status labels:
- Preparing dataset
- Training
- Validating
- Retrying
- Failed
- Completed

Failure behavior:
- 3 automatic retries
- then show `Retry Training`
- manual retries unlimited
- retry disabled while active

Exit rule:
- LoRA must succeed

Post-success invalidation rule:
- changing any confirmed reference image invalidates current LoRA and requires retraining

## Step 3 — Personality

Purpose:
- define behavior, voice, role, reactions, and tone

Save behavior:
- `Save Draft` always allowed
- `Complete Avatar` only when all required conditions are met

If incomplete:
- keep build state in `draft_personality`
- keep avatar in Continue Creation

### Field Groups

#### Basic Info
- name
- age
- description

#### Identity and Backstory
- backstory
- communication principles

#### Industry and Role
- industry dropdown from configured industries only
- role unlocked after industry choice
- 6 predefined role paragraphs per industry
- custom role questionnaire

Custom role questionnaire fields:
- primary responsibility
- audience served
- seniority level
- communication style in role
- top 3 recurring scenarios

#### Visual Personality
- wardrobe items
- environment items

#### Behavioral Personality
- hobbies
- phrases
- gestures text

#### Reactions
Predefined reaction set:
1. Subtle Approval
2. Excited Breakthrough
3. Thoughtful Pause
4. Friendly Laugh
5. Concerned Empathy
6. Confident Emphasis

Rules:
- 0-6 predefined reactions may be selected
- up to 4 custom reactions may be created
- reaction clips generate asynchronously after completion
- if reaction clip not ready, use gesture/tone fallback

#### Voice and Tone
Voice modes:
- Library
- Custom Generated

Library mode:
- 24 generated voices
- 6 archetypes x 4 variations
- descriptors exposed before selection
- preview required before selection

Custom mode:
- prompt-based sample generation
- user chooses sample before save

Tone:
- multi-select predefined tags
- additional custom tags allowed

## Completion Rules

Avatar completion requires:
- active base face selected
- reference set confirmed
- LoRA success
- valid required fields
- industry selected
- role selected or generated

On completion:
- build state becomes `ready`
- avatar exits Continue Creation
- avatar appears in the appropriate completed section
- reaction assets queue asynchronously

## Public Sharing and Clone UX

### Public eligibility
Only if avatar is:
- personal
- original
- completed
- not deleted

### Public configuration UX
Owner can set:
- public on/off
- lock map for clone-editable fields
- `Use as-is only`

### Clone UX
After clone:
- create a new personal avatar record
- open in edit mode if any fields are editable
- otherwise show it as ready-to-use clone

## Use and Pause UX

### Use
- opens automation picker
- multi-select supported
- search appears when there are many automations
- supports Select All, Clear All, Cancel, Use
- if automation already has another avatar, show replace warning

### Pause
- if exactly one active binding exists, pause immediately
- otherwise show active-bindings checklist
- supports Select All, Clear All, Cancel, Confirm Pause

### Resume
- no dedicated Resume button
- Use is also the resume path

## Delete and Restore UX

### Delete
- soft delete only
- remove from current section immediately
- remove from Explore immediately if public
- pause and detach active bindings
- pause in-progress content using those bindings

### Restore
- restore from recycle bin within 10 days
- returns as completed avatar
- deployment summary resets to `not_in_use`
- no automatic automation reattachment

## Empty States

- no avatars -> show primary CTA with onboarding guidance
- no drafts -> hide Continue Creation
- no Explore results -> show clear filters action

## Error States

- training failed after retries -> show retry CTA
- clone failure -> do not create partial clone
- deploy failure -> preserve previous binding state and show non-destructive error
- restore blocked by plan limit -> show actionable upgrade or cleanup message

## Accessibility

- all card actions keyboard reachable
- visible focus states on all controls
- ARIA labels on generation tools and history actions
- live region for training updates
- badges cannot rely on color alone

## Responsive Rules

- mobile: sections stack vertically, carousels become snap-scroll lists
- tablet/desktop: My Avatars and Org sections remain horizontal rows
- stepper compresses on small screens but remains visible
