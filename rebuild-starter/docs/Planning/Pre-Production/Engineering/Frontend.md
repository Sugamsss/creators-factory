# Frontend Planning (Global Architecture)

## Scope
Global frontend architecture principles only. No page-level UI or component decisions.
Reference implementation: `code.html` (verified match for `screen.png`).

## 1) Architectural Goals
- Fast initial load and responsive interaction for high-complexity creative workflows.
- Clear async status handling for long-running operations.
- Deterministic state transitions for generated artifacts.
- Strong observability and debuggability in production.

## 1.1) Reference Tech Stack (from code.html)

The reference prototype establishes baseline technology choices:

**CSS / Styling:**
- **Tailwind CSS** (with `forms` and `container-queries` plugins).
- Custom Tailwind config extending: colors (`primary`, `background-light`, `background-dark`), font families (`display`, `sans`), border radii (12/24/32/48px).
- CSS custom properties for theming: `--primary-color: #3d8b7a`.
- Custom CSS classes: `.grainy-bg`, `.glass-panel`, `.glass-card`, `.sidebar-item-active`.
- Dark mode: Tailwind class-based (`darkMode: "class"`).

**Typography:**
- Google Fonts: `Playfair Display` (display/serif, 400+700) + `Inter` (body/sans, 300-600).

**Iconography:**
- Google Material Symbols Outlined (`wght` 100-700, `FILL` 0-1).
- Default: weight 300 (thin/light), size 22px.
- Active sidebar: `FILL 1` (filled variant).

**Layout patterns:**
- Sidebar: fixed 80px width, icon-only, flex column.
- Main area: flex-1, glass panel, internal scroll.
- Card grids: responsive `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`.
- Discover grid: `grid-cols-2 md:grid-cols-4 lg:grid-cols-5`.

**Note:** The reference is a static HTML prototype. Production frontend framework (React, Next.js, etc.) is a separate decision. The design tokens and patterns above should be preserved regardless of framework choice.

## 2) Frontend System Responsibilities
- Session/auth handling
- Global app shell and navigation framework
- State orchestration for long-running generation flows
- Real-time status updates and notifications
- Artifact version browsing and rollback controls
- Policy/error state visualization

## 3) State Management Contract

### Required state domains
- User/session state
- Project/workspace state
- Generation pipeline state
- Notification/alert state
- Feature flags and experiment state
- Theme/accent color preference state

### Global principles
- Single source of truth for job status.
- Event-driven updates for all async jobs.
- Optimistic UI only when operations are reversible.

## 4) API Interaction Standards
- Idempotent mutation requests where possible.
- Retry-safe client behavior with request correlation IDs.
- Standardized error envelope parsing.
- Server-driven pagination/filtering for heavy feeds.

## 5) Performance Standards
- Instrument route-level and feature-level performance metrics.
- Budget first meaningful interaction and route transition timings.
- Defer non-critical assets aggressively.
- Cache read-heavy metadata with explicit invalidation strategy.

## 6) UX Reliability Standards
- Every async action shows state and retry path.
- No silent failures.
- No irreversible action without confirmation.
- Always preserve unsaved user edits during network interruptions.
- Progressive preview: show rendered segments as they complete for long-form videos.
- Skeleton loading states for all card grids and data-heavy sections.
- Offline/disconnection handling: queue actions, surface reconnection state.

## 7) Accessibility Standards
- Keyboard-accessible primary workflows.
- Announced status changes for async operations.
- Contrast and focus standards enforced.
- Reduced-motion compliance.

## 8) Frontend Observability
- Track user actions with event taxonomy.
- Correlate client events with backend job IDs.
- Capture failure context for reproducibility.

## 9) Real-Time Transport Dependency
- Frontend requires a real-time channel for job status updates (render progress, publish status, policy blocks).
- Backend must decide transport mechanism (WebSocket / SSE / polling) — see Backend.md §9.
- Frontend must handle reconnection, missed events, and state reconciliation.

## 10) Global Search and Filtering
- Cross-object search available from any page (avatars, scripts, videos, events, automations).
- Consistent filter UI: status, avatar, industry, date range, tags.
- Debounced search with server-side pagination.

## 11) Frontend Risks
- State desync during long-running jobs
- Overly complex global state causing regressions
- Performance degradation from heavy live updates
- Large asset previews (video thumbnails, avatar images) causing memory pressure

## 12) Readiness Checklist
- [ ] Global state model finalized
- [ ] Error envelope contract finalized
- [ ] Async interaction standards finalized
- [ ] Telemetry contract finalized
- [ ] Accessibility baseline finalized
