# Page-Level Planning

This folder contains page-specific planning documents — one per top-level page plus cross-cutting flows (onboarding, settings).

## Stage Boundary

This stage **starts after** global pre-production decisions are locked. Each page document will be filled during dedicated planning sessions.

**Prerequisite:** Global decisions locked in `Pre-Production/Decisions.md`.

## Pages (matching finalized sidebar — D-016/D-017/D-018)

| # | Page | Icon | File | Status |
|---|---|---|---|---|
| 1 | Dashboard | `grid_view` | `Dashboard.md` | Not started |
| 2 | Avatars | `face` | `Avatars.md` + `Avatars-Execution/README.md` | Execution package ready |
| 3 | Industries | `business_center` | `Industries.md` | Not started |
| 4 | Scripts | `article` | `Scripts.md` | Not started |
| 5 | Videos | `play_circle` | `Videos.md` | Not started |
| 6 | Automations | `bolt` | `Automations.md` | Not started |

## Cross-Cutting Flows

| Flow | File | Status |
|---|---|---|
| Onboarding (first-run) | `Onboarding.md` | Not started |
| Settings (user/workspace prefs) | `Settings.md` | Not started |

## Template Structure

Each page doc follows the same structure:
1. Page purpose
2. Key objects / entities
3. User goals
4. Layout and sections
5. User flows (with specific flows to map)
6. State management
7. Edge cases
8. Integration points (backend services)
9. Responsive behavior
10. Empty states
11. Error states
12. Accessibility notes
13. Open questions (page-specific)
14. Decisions made
15. Readiness checklist

When a page matures beyond a single-file plan, it may also have a companion execution package folder. Avatars is the first page using this pattern:
- summary entry doc: `Avatars.md`
- detailed execution package: `Avatars-Execution/`

## Planning Order

Suggested order (dependencies flow downward):
1. **Avatars** — core entity, most context from code.html
2. **Industries** — feeds into scripts
3. **Scripts** — feeds into videos
4. **Videos** — production + publishing lifecycle
5. **Automations** — connects everything
6. **Dashboard** — overview of all the above
7. **Onboarding** — entry point that touches avatars + discover
8. **Settings** — independent, can be done anytime

## Completion Gate

Page-level planning is complete when:
- [ ] All page readiness checklists are fully checked
- [ ] All page-specific open questions are resolved
- [ ] Cross-page integration points are consistent
- [ ] State transitions between pages are mapped
- [ ] All empty/error states are designed
- [ ] Accessibility review is complete for all pages
