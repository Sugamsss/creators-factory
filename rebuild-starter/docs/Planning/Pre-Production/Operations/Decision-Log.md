# Decision Log (Global)

## Purpose
Record global decisions, rationale, alternatives, and impact.

## Decision Template
- **ID:**
- **Date:**
- **Decision:**
- **Status:** Proposed / Accepted / Superseded
- **Context:**
- **Alternatives considered:**
- **Consequences:**
- **Owner:**

---

## Accepted Decisions

### D-001
- **Decision:** MVP is web-first and API-first.
- **Status:** Accepted
- **Context:** Need rapid accessible delivery and centralized control.
- **Alternatives considered:** local-first desktop at MVP.
- **Consequences:** local model helper apps deferred post-v1.

### D-002
- **Decision:** Maintain internal moderation and policy checks in MVP.
- **Status:** Accepted
- **Context:** Provider API restrictions are baseline only.
- **Alternatives considered:** rely primarily on provider moderation.
- **Consequences:** requires internal policy service and auditability.

### D-003
- **Decision:** Keep broad MVP ambition with strict phase gates.
- **Status:** Accepted
- **Context:** Product differentiation depends on integrated experience.
- **Alternatives considered:** heavily reduced MVP.
- **Consequences:** tighter execution discipline required.

### D-004
- **Decision:** Adaptive memory supports direct user edits.
- **Status:** Accepted
- **Context:** users need strong control over identity evolution.
- **Alternatives considered:** approval-only adaptive updates.
- **Consequences:** snapshot/rollback must be robust.

### D-005
- **Decision:** MVP videos use one opinion profile per video.
- **Status:** Accepted
- **Context:** reduce complexity and ambiguity for initial release.
- **Alternatives considered:** multi-opinion mixing in every video.
- **Consequences:** collaboration mode planned for later.

### D-006
- **Decision:** Free Edit mode still enforces hard policy blocks.
- **Status:** Accepted
- **Context:** trust/safety cannot be bypassed by edit mode.
- **Alternatives considered:** unrestricted free edit.
- **Consequences:** policy checks required in all authoring paths.

### D-007
- **Decision:** Autopublish default is OFF.
- **Status:** Accepted
- **Context:** reduce accidental or unsafe publishing risk.
- **Alternatives considered:** autopublish on by default.
- **Consequences:** explicit opt-in flows required later.

### D-008
- **Decision:** Automation failures retry 3 times with backoff; notify on every failure via in-app and email.
- **Status:** Accepted
- **Context:** balance resilience with transparency.
- **Alternatives considered:** silent retries or unlimited retries.
- **Consequences:** alerting and preference controls required.

### D-009
- **Decision:** External feed sources for MVP are X (Twitter) and Reddit.
- **Status:** Accepted
- **Context:** user specified real-time external feeds linked to X and Reddit.
- **Alternatives considered:** RSS aggregators, news APIs, broader social platforms.
- **Consequences:** requires X API and Reddit API integrations, rate limit management, and source trust scoring.

### D-010
- **Decision:** Distribution targets for MVP are YouTube, TikTok, and Instagram.
- **Status:** Accepted
- **Context:** vision specifies these as primary publishing destinations.
- **Alternatives considered:** YouTube-only MVP.
- **Consequences:** requires three platform API integrations with distinct format/policy requirements.

### D-011
- **Decision:** Design system uses glass morphism aesthetic with Tailwind CSS.
- **Status:** Accepted
- **Context:** established by reference prototype (code.html / screen.png). Layered transparency with backdrop blur is core visual identity.
- **Alternatives considered:** traditional opaque card-on-white, material design.
- **Consequences:** requires browser compatibility validation; backdrop-filter support required.

### D-012
- **Decision:** Typography uses Playfair Display (display/serif) + Inter (body/sans).
- **Status:** Accepted
- **Context:** established by reference prototype. Editorial serif for brand moments, clean sans for operational text.
- **Alternatives considered:** single-family system, custom typeface.
- **Consequences:** two Google Font loads; must verify performance impact.

### D-013
- **Decision:** Icon system uses Google Material Symbols Outlined with variable weight/fill.
- **Status:** Accepted
- **Context:** established by reference prototype. Weight 300 default, FILL 1 for active states.
- **Alternatives considered:** Lucide, Heroicons, custom icon set.
- **Consequences:** variable font load; consistent icon vocabulary across all pages.

### D-014
- **Decision:** Multi-theme accent color system via single CSS variable swap (`--primary-color`).
- **Status:** Accepted
- **Context:** reference uses `#3d8b7a` as default; user requested orange, blue, red, magenta, charcoal, purple themes.
- **Alternatives considered:** per-component theming, multiple CSS variable sets.
- **Consequences:** all components must use `primary` token exclusively for accent color; background tint must adapt to match.

### D-015
- **Decision:** Canonical UI term is "Avatars" (following code.html terminology).
- **Status:** Accepted
- **Context:** code.html uses "Avatars" as page title and sidebar label. Subtitle uses "Digital Identities." CTA uses "Create Persona." All planning docs updated to use "Avatars" as primary entity term.
- **Alternatives considered:** "Personas" (planning docs), "Creators" (vision.md), "Digital Identities" (code subtitle).
- **Consequences:** all UI, API, and doc references updated to "Avatars." "Persona" retained only for the personality/behavioral layer concept.

### D-016
- **Decision:** Dashboard is a top-level page in the sidebar navigation.
- **Status:** Accepted
- **Context:** code.html includes Dashboard (`grid_view` icon) as first nav item. Content TBD (global overview, recent activity, job status).
- **Alternatives considered:** no Dashboard page (vision.md didn't list it).
- **Consequences:** Dashboard page needs scope definition in page-level planning.

### D-017
- **Decision:** Videos is a top-level page added to the sidebar navigation.
- **Status:** Accepted
- **Context:** vision.md §7.1 defines Videos as a core page but code.html sidebar was missing it. User confirmed it should be added.
- **Alternatives considered:** Videos as sub-view within avatar context only.
- **Consequences:** sidebar now has 6 nav items + brand mark. Videos icon: `play_circle` (added to code.html).

### D-018
- **Decision:** Publish is NOT a separate page. It is part of the video flow.
- **Status:** Accepted
- **Context:** user confirmed publishing is a step within the video production/approval workflow, not its own top-level nav item.
- **Alternatives considered:** Publish as standalone sidebar page.
- **Consequences:** video page must include publish/export lifecycle; no separate publish navigation needed.

### D-019
- **Decision:** All video enrichment types ship in MVP — music, B-roll, effects, subtitles, chapters, end screens. All AI-generated from descriptions.
- **Status:** Accepted

### D-020
- **Decision:** Generated voices only. No real voices, no voice training. Matches approach for faces (all synthetic).
- **Status:** Accepted

### D-021
- **Decision:** Avatar creation via iterative prompt + feedback loop. User writes prompt, AI generates, user refines via feedback. Each iteration adds reference images and improves the prompt.
- **Status:** Accepted

### D-022
- **Decision:** Dark mode in MVP. Already prototyped in code.html.
- **Status:** Accepted

### D-023
- **Decision:** Single avatar per video project. Collaboration videos deferred.
- **Status:** Accepted

### D-024
- **Decision:** Single quality mode. No draft render. Keep it simple.
- **Status:** Accepted

### D-025
- **Decision:** Theme scope is per-user only (whole app uses one accent color).
- **Status:** Accepted

### D-026
- **Decision:** Frontend framework is Next.js.
- **Status:** Accepted

### D-027
- **Decision:** Real-time transport is SSE. Upgrade to WebSocket if collab features added later.
- **Status:** Accepted

### D-028
- **Decision:** Asset storage is S3-compatible (MinIO for self-host, any S3-compatible for cloud).
- **Status:** Accepted

### D-029
- **Decision:** Concurrent render limits — Free tier: 1, Paid tier: 5.
- **Status:** Accepted
