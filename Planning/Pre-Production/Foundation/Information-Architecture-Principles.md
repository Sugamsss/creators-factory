# Information Architecture Principles (Global)

## Scope
Global IA principles only. No page-level sitemap decisions.

## IA Objectives
- Make the product mentally predictable for users.
- Separate configuration from execution from governance.
- Reduce mode-switching and context loss.
- Keep AI system state visible across the app.

## Core IA Principles
1. **Object-first structure**
   - Organize around persistent objects (avatar, strategy, script, video, automation), not temporary actions.
2. **Lifecycle clarity**
   - Every object should display current lifecycle state and next available action.
3. **History and lineage visibility**
   - Users should be able to trace outputs back to sources and decisions.
4. **Global status layer**
   - Rendering, publishing, failures, and policy blocks should be visible globally.
5. **Recoverability**
   - Undo/rollback/version access should be discoverable across object types.

## Cross-Product Navigation Rules
- Keep top-level sections stable over time.
- Keep terminology consistent with domain model.
- Avoid duplicating the same object in unrelated contexts.
- Expose active risks/warnings globally, not buried in one area.

## Navigation Architecture — RESOLVED (D-016, D-017, D-018)

**Finalized sidebar (6 items + brand mark):**
1. Dashboard (`grid_view`) — D-016: confirmed as top-level page.
2. Avatars (`face`) — from code.html.
3. Industries (`business_center`) — from code.html.
4. Scripts (`article`) — from code.html.
5. Videos (`play_circle`) — D-017: added to sidebar.
6. Automations (`bolt`) — from code.html.

**Resolved decisions:**
- Dashboard is a top-level page (D-016). Was in code.html but not vision.md.
- Videos is a top-level page (D-017). Was in vision.md but not code.html.
- Publish is NOT a separate page (D-018). It is part of the video production/approval flow.
- Canonical entity term is "Avatars" (D-015). Vision's "Personas" term deprecated in UI.

## Avatar Lifecycle Model (Configure vs Deploy)

code.html shows two actions per avatar card: "Configure" and "Deploy."
This defines a lifecycle:

1. **Draft / Configuring** — avatar exists but is not attached to any active pipeline.
2. **Deployed / Active** — avatar is live: eligible for automation, scheduling, and video production.
3. **Paused** — temporarily inactive but preserves state.
4. **Archived** — retained for history but no longer operational.

This lifecycle affects:
- Which avatars show in automation and video flows.
- Whether an avatar can receive feed/event triggers.
- How "Deploy" is different from "Publish" (Deploy = activate avatar; Publish = release a specific video as part of the video flow).

## "Discover" / "Repository" Concept vs Marketplace Exclusion

screen.png / code.html shows:
- "VIEW REPOSITORY →" link in My Creations section.
- "DISCOVER" section with avatar thumbnails.

But marketplace is explicitly out of MVP scope.

**Code analysis reveals Discover is NOT a marketplace.** The Discover items in code.html are:
- Sarah — "Storyteller" (featured, accent-tinted badge)
- David — "News Anchor"
- Elena — "Educator"
- Leo — "Performance"

These are **archetype/role templates** with category badges, not user-generated community content. This aligns with **Option A** below.

Resolution options:
- **Option A (supported by code):** "Discover" = curated starter templates/archetype presets. Repository = user's own full avatar list/archive. No commerce, no user-generated content.
- **Option B:** Defer both entirely and remove from MVP UI.
- **Option C:** "Discover" shows open-source community-contributed avatar templates from GitHub/registry (read-only, no commerce).

This must be resolved before page-level design.

## Global Search and Filtering

With potentially many avatars, scripts, videos, events, and automations:
- Global search must be available across all object types.
- Filtering by status, avatar, industry, date range, and tags should be consistent.
- Search result presentation should be standardized across object types.

## Terminology Alignment Requirement

**RESOLVED (D-015):** Canonical UI term is **"Avatars"** (from code.html).
- "Digital Identity / Identity" = conceptual description.
- "Persona" = retained only for personality/behavioral layer concept.
- "Creator" = deprecated in UI context.

## IA Readiness Checklist
- [ ] Object model and terminology are finalized
- [ ] Lifecycle states are consistent across object types
- [ ] Cross-product status visibility model is defined
- [ ] Lineage/provenance navigation requirements are defined
- [ ] Avatar lifecycle (Configure/Deploy) is defined
- [ ] Discover/Repository scope is resolved against marketplace exclusion
- [ ] Global search/filtering model is defined
- [x] Canonical UI terminology is locked (D-015: "Avatars")
- [x] Sidebar navigation structure finalized (D-016, D-017, D-018: 6 items — Dashboard, Avatars, Industries, Scripts, Videos, Automations)
- [x] Top-level page list locked and matched to sidebar
