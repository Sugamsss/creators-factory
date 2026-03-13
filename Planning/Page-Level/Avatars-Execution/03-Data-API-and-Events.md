# 03 — Data, API, and Events

## Purpose

This document defines the backend contracts needed so frontend, backend, and QA agents can implement and verify the Avatars page without guessing.

## Status Model

The page uses two different state layers.

### Build State
Persisted on the avatar record.

Allowed values:
- `draft_visual`
- `draft_appearance`
- `training_lora`
- `failed_training`
- `draft_personality`
- `ready`
- `soft_deleted`

### Deployment Summary
Derived from automation bindings.

Allowed values:
- `not_in_use`
- `in_use`
- `partially_paused`
- `fully_paused`

Derivation rules:
- non-ready avatars return `null`
- zero bindings -> `not_in_use`
- all active -> `in_use`
- mix of active + paused -> `partially_paused`
- all paused -> `fully_paused`

## Core Data Model

### `avatars`
Required fields:
- `id`
- `owner_user_id`
- `org_id` nullable
- `ownership_scope` enum: `personal`, `org`
- `source_type` enum: `original`, `clone`
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

### `avatar_visual_versions`
Stores iterative image history.

Fields:
- `id`
- `avatar_id`
- `version_index`
- `image_url`
- `raw_prompt`
- `enhanced_prompt`
- `edit_title`
- `mask_metadata` nullable
- `created_at`

Rules:
- keep max 10 per avatar draft
- when 11th is created, oldest is dropped

### `avatar_reference_images`
Stores the 15 reference slots.

Fields:
- `id`
- `avatar_id`
- `slot_key`
- `image_url`
- `angle`
- `expression`
- `is_confirmed`
- `created_at`

### `avatar_visual_profiles`
Stores LoRA linkage and training status.

Fields:
- `id`
- `avatar_id`
- `lora_model_id`
- `training_status`
- `training_attempt_count`
- `training_started_at`
- `training_completed_at` nullable
- `training_error_code` nullable

Allowed `training_status` values:
- `not_started`
- `queued`
- `running`
- `retrying`
- `failed`
- `completed`

### `avatar_personality_snapshots`
Stores versioned personality payloads.

Fields:
- `id`
- `avatar_id`
- `version_number`
- `payload_json`
- `created_at`

### `avatar_reaction_assets`
Stores reaction asset generation and clips.

Fields:
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

Allowed `status` values:
- `pending`
- `generating`
- `ready`
- `failed`

### `avatar_field_locks`
Stores clone lock rules.

Fields:
- `id`
- `avatar_id`
- `field_path`
- `is_locked`

### `avatar_automation_bindings`
Stores avatar deployment per automation.

Fields:
- `id`
- `avatar_id`
- `automation_id`
- `binding_status` enum: `active`, `paused`
- `created_at`
- `updated_at`

Constraint:
- at most one active avatar binding per automation

## Personality Payload Contract

Minimum payload keys:
- `backstory`
- `communication_principles[]`
- `wardrobe_items[]`
- `environment_items[]`
- `hobbies[]`
- `phrases[]`
- `gestures_text`
- `reactions[]`
- `voice_config`
- `tone_tags[]`

Recommended reaction object shape:
- `name`
- `usage_intent`
- `hook_description`
- `generation_prompt`
- `asset_status`
- `clip_url`
- `is_predefined`

Recommended voice config shape:
- `mode` (`library` | `custom_generated`)
- `voice_id` nullable
- `archetype` nullable
- `accent` nullable
- `base_tone` nullable
- `custom_descriptors[]`
- `selected_preview_id` nullable
- `prompt` nullable

## Validation Rules

### Required for Draft Step 1
- visual prompt present
- age present and valid
- ownership scope present when applicable

### Required for Completion
- active base face selected
- reference set confirmed
- LoRA success
- valid name
- valid age
- valid description
- valid backstory
- at least one communication principle
- industry selected
- role selected or generated

### Field Length/Count Rules
- `name`: 2-40 chars
- `age`: 1-120
- `description`: 20-240 chars
- `backstory`: 80-800 chars
- `communication_principles`: 1-8 items, each 5-140 chars
- `wardrobe_items`: max 12
- `environment_items`: max 12
- `hobbies`: max 10
- `phrases`: max 20
- `gestures_text`: max 400 chars
- predefined tone tags: max 8
- custom tone tags: max 5
- custom reactions: max 4

## Permission Rules

### Personal avatars
- owner can edit, delete, deploy, pause, publish
- others cannot access unless avatar is public in Explore

### Public Explore avatars
- anyone with access to Explore can clone
- only owner can toggle visibility and edit lock configuration

### Clone avatars
- clone owner can edit only unlocked fields
- clone owner cannot edit visual profile or reference set

### Org avatars
- all org members can view and use
- creator and org admins can edit/delete in MVP
- org avatars cannot be made public

## API Contract

### Draft and CRUD Endpoints
- `POST /api/avatars/drafts`
- `GET /api/avatars`
- `GET /api/avatars/:id`
- `PATCH /api/avatars/:id`
- `DELETE /api/avatars/:id`

Expected capabilities:
- create new draft
- fetch filtered sections
- update step progress and personality data
- soft delete avatar

### Visual Generation Endpoints
- `POST /api/avatars/:id/generate-base`
- `POST /api/avatars/:id/generate-references`
- `POST /api/avatars/:id/train-lora`
- `POST /api/avatars/:id/retry-lora`

Backend rules:
- base generation creates a new visual version
- when multiple reference images are provided for edit/composition, image order is preserved end-to-end
- prompts that reference `image 1`, `image 2`, etc. must map to upload order
- reference generation populates all 15 slots
- LoRA training starts only from confirmed reference set
- retry endpoint is allowed only when latest job is failed

### Sharing and Clone Endpoints
- `POST /api/avatars/:id/toggle-visibility`
- `POST /api/avatars/:id/clone`

Rules:
- public toggle rejected unless avatar is eligible
- clone rejected unless source is public, ready, personal, original, and not deleted

### Deployment Endpoints
- `POST /api/avatars/:id/deploy`
- `POST /api/avatars/:id/pause`

Deploy rules:
- supports multi-automation selection
- replacing active avatar on an automation requires explicit confirmation signal

Pause rules:
- accepts one or more active automation bindings
- paused bindings remain attached but inactive

### Recycle Endpoints
- `POST /api/recycle-bin/:id/restore`

Restore rules:
- allowed only inside 10-day window
- restored avatar returns with no active bindings
- restore blocked if plan limit would be exceeded

## Recommended API Response Shape

Every avatar payload returned to the frontend should include:
- avatar core fields
- `build_state`
- `deployment_summary`
- `ownership_scope`
- `source_type`
- badges/derived booleans if helpful
- training status summary if applicable
- field locks if caller can edit the avatar

## SSE Contract

### Endpoint
- `GET /api/avatars/:id/events`

### Required event types
- `avatar.training.started`
- `avatar.training.progress`
- `avatar.training.retrying`
- `avatar.training.failed`
- `avatar.training.completed`
- `avatar.reaction.generation.started`
- `avatar.reaction.generation.completed`
- `avatar.reaction.generation.failed`

### Required training event payload
- `avatarId`
- `status`
- `progressPercent`
- `retryAttempt`
- `etaSeconds`
- `message`

## Async Job Rules

### LoRA training job
- queued after reference set confirmation
- auto-retries up to 3 times
- manual retries unlimited
- editing reference images invalidates completed LoRA

### Reaction generation job
- queued after avatar completion
- does not block avatar completion
- clip failure does not invalidate the avatar
- failed reactions may be retried later without rebuilding the avatar

## Data Integrity Rules

- changing the active base face after Step 2 begins invalidates Step 2 outputs
- changing confirmed reference images after training success invalidates the current LoRA
- deleting an avatar must pause and detach active bindings
- deleting a public avatar must remove it from Explore immediately
- source deletion or privatization must not break existing clones

## Backend Acceptance Conditions

Backend work for this page is complete only when:
- all data entities above exist or are faithfully mapped to existing models
- all required endpoints exist
- all permission rules are enforced
- state transition logic is deterministic
- SSE training updates are available
- plan-limit, delete, restore, clone, and binding edge cases are handled
