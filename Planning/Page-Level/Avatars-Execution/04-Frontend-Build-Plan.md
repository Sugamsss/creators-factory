# 04 — Frontend Build Plan

## Objective

Build the complete Avatars frontend experience against the contracts in `03-Data-API-and-Events.md`.

The frontend build must be organized so smaller agents can implement it in phases without losing state-model clarity.

## Frontend Deliverables

Routes to implement:
- `/avatars`
- `/avatars/all`
- `/avatars/create/:draftId`
- `/avatars/:avatarId/edit`

Required UI systems:
- avatar section layouts
- avatar card system
- creation workspace and stepper
- generation canvas tooling
- reference grid and training status panel
- personality editor
- explore feed
- clone/public controls
- use/pause pickers
- error/loading/empty states

## Recommended Route Responsibilities

### `/avatars`
Responsible for:
- loading section data
- showing Continue Creation
- showing My Avatars
- showing Organisational Avatars when applicable
- showing Explore Avatars
- launching Create Avatar flow

### `/avatars/all`
Responsible for:
- search/filter/sort for completed personal avatars
- bulk browsing of personal inventory

### `/avatars/create/:draftId`
Responsible for:
- stepper shell
- autosave
- Step 1 visual identity
- Step 2 reference generation and training
- Step 3 personality drafting
- Save & Exit
- Complete Avatar

### `/avatars/:avatarId/edit`
Responsible for:
- editing completed avatar personality
- exposing Steps 1 and 2 as read-only views
- honoring clone field locks

## Suggested Frontend Module Breakdown

### Page Shell Modules
- `AvatarsPageShell`
- `AvatarsSectionHeader`
- `AvatarSectionEmptyState`
- `AvatarCard`
- `AvatarBadgeRow`
- `AvatarActionBar`

### Continue Creation Modules
- `DraftAvatarCard`
- `TrainingStatusInline`
- `RetryTrainingButton`

### Creation Workspace Modules
- `AvatarBuilderShell`
- `AvatarBuilderStepper`
- `VisualIdentityStep`
- `FinalizeAppearanceStep`
- `PersonalityStep`
- `SaveAndExitBar`

### Visual Creation Modules
- `AvatarCanvas`
- `PromptComposer`
- `MaskToolRail`
- `VersionHistoryPanel`
- `VersionHistoryItem`

### Finalize Appearance Modules
- `ReferenceGrid`
- `ReferenceImageTile`
- `TrainingProgressPanel`
- `RetryTrainingPanel`

### Personality Modules
- `BasicInfoForm`
- `BackstoryForm`
- `IndustryRoleForm`
- `WardrobeForm`
- `EnvironmentForm`
- `HobbiesForm`
- `PhrasesForm`
- `GesturesForm`
- `ReactionsForm`
- `VoiceToneForm`

### Explore and Sharing Modules
- `ExploreFeed`
- `ExploreFilters`
- `ExploreSortTabs`
- `PublicVisibilityControl`
- `CloneLockConfig`

### Deployment Modules
- `AutomationPicker`
- `PauseBindingsPicker`
- `ReplaceBindingWarning`

## Frontend State Model

### Server-backed state
- avatar section data
- build state
- deployment summary
- reference images
- training status
- field locks
- automation bindings
- public visibility state

### Local UI state
- selected step
- active mask state
- unsaved text input before autosave flush
- selected automations in deploy picker
- selected active bindings in pause picker
- local filter/sort state for `/avatars/all` and Explore

### Key rule
Do not derive business state from UI assumptions.
Always use backend-provided `build_state`, binding data, and explicit permissions.

## Autosave Strategy

Autosave should trigger on:
- prompt submit
- blur on text inputs
- list item add/edit/remove
- industry selection
- role selection
- voice selection
- reaction config changes
- public visibility config changes

UI requirements for autosave:
- optimistic pending indicator
- error recovery state if save fails
- no silent data loss

## Frontend Implementation Order

### Phase FE-1 — Shell and data loading
- build `/avatars` route shell
- load section data
- render placeholders, empty states, loading states
- render avatar cards

### Phase FE-2 — Create/Edit workspace shell
- build stepper shell
- build route shell for create/edit
- implement Save & Exit
- implement read-only mode for completed visuals

### Phase FE-3 — Step 1 visual flow
- prompt composer
- mask tools
- version history
- active base face selection

### Phase FE-4 — Step 2 appearance flow
- 15-image grid
- per-slot open/refine affordance
- training status panel
- retry behavior
- SSE subscription UI updates

### Phase FE-5 — Step 3 personality flow
- forms and validation
- industry/role dependency
- custom role questionnaire
- reactions form
- voice/tone form

### Phase FE-6 — Explore and cloning
- Explore feed
- search/filter/tabs
- public visibility UI
- lock configuration UI
- clone action UI

### Phase FE-7 — Use/Pause/Delete flows
- automation picker
- replace warning
- pause picker
- delete confirmations
- post-action refresh behavior

### Phase FE-8 — polish and regression hardening
- responsive cleanup
- accessibility pass
- error handling pass
- loading state pass

## Frontend Edge Cases to Handle Explicitly

- user opens edit page for a completed clone with all fields locked
- training SSE stream drops mid-process
- user changes base face after reference generation started
- restore returns avatar with no bindings even if it was previously in use
- public toggle attempted for ineligible avatar
- clone source disappears before action resolves
- retry button clicked twice while mutation still in flight

## Recommended Frontend Done Checks

A frontend task is not done until:
- the UI matches behavior in `02-UX-and-Interaction-Spec.md`
- the UI respects contracts in `03-Data-API-and-Events.md`
- loading, empty, and error states exist
- keyboard navigation still works
- all destructive actions have explicit feedback

## Frontend Handoff Output

When a frontend agent finishes a task, the handoff should include:
- route(s) changed
- component(s) created or modified
- contract assumptions used
- remaining known gaps
- manual test steps performed
