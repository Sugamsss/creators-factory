# Videos — Page-Level Planning

## Page Purpose
Manage the full video production lifecycle: rendering, preview, segment-level regeneration, enrichment, approval, and publishing. This page consolidates what was previously considered separate "Videos" and "Publish" pages (D-018: Publish is part of the video flow).

## Sidebar Position
5th item — `play_circle` icon (D-017)

## Key Objects / Entities
- Video project (title, avatar, script source, status, render progress, version history)
- Video segments (individual rendered pieces with continuity tracking)
- Enrichment assets (music, B-roll, subtitles, chapters, end screens — all in MVP, all AI-generated per D-019)
- Timeline view (segment-by-segment review)
- Quality scores (per-segment and overall)
- Policy check results (pre-publish compliance)
- Publish targets (YouTube, TikTok, Instagram — D-010)
- Publish status per platform

## Video Lifecycle States
- `queued` → `rendering` → `rendered` / `render_failed`
- `rendered` → `in_review` → `ready_for_publish` → `publishing` → `published` / `publish_failed`
- Any state → `needs_revision` (user edits or policy flags)

## User Goals on This Page
- _To be defined_

## Layout and Sections
- _To be defined_

## User Flows
- _To be defined_

### Flows to Map
- View all videos (list/grid with status filters)
- View video detail (timeline, segments, quality scores)
- Preview a rendered video
- Regenerate specific segments (with prompt adjustment)
- Add/edit enrichment (music, B-roll, subtitles, chapters, end screens)
- Review quality scores and policy checks
- Approve for publishing
- Select publish targets (YouTube, TikTok, Instagram)
- Dry-run preview before publish
- Publish / export
- View publish status per platform
- View video version history / rollback
- Handle render failure (retry, adjust, abandon)
- Handle publish failure (retry, adjust platform settings)

## State Management
- _To be defined_

## Edge Cases
- _To be defined_

## Integration Points
- Render orchestration → Orchestrator + Generation Service
- Segment continuity → AI long-form generation contract
- Quality scoring → AI Quality Evaluation
- Policy checks → Policy Service
- Enrichment → Enrichment Service
- Publishing → Publishing Service (YouTube, TikTok, Instagram connectors)
- Real-time progress updates → SSE (D-027)
- Asset storage → Asset Storage Service
- _To be defined_

## Responsive Behavior
- _To be defined_

## Empty States
- No videos yet → prompt to create first video (link to script or avatar)
- Video rendering in progress → show progress indicator with segment completion
- _To be defined_

## Error States
- Render failure → show error category, retry option, guided remediation
- Publish failure → show platform error, retry option, platform-specific guidance
- Partial render (some segments failed) → show which segments need attention
- _To be defined_

## Accessibility Notes
- _To be defined_

## Open Questions (Page-Specific)
- What does the timeline/segment review interface look like?
- How does segment-level regeneration work in the UI (select segment → edit prompt → re-render)?
- How is enrichment (music, B-roll, etc.) added — separate step or integrated into timeline?
- What does the publish flow look like (target selection → dry-run → confirm → status)?
- Is there a video comparison view (before/after regeneration)?
- How does progressive preview work (watch as segments complete)?
- What format/resolution options are available for export?
- How are platform-specific format requirements handled (YouTube vs TikTok aspect ratios)?
- AI disclosure labeling per platform — how does the user configure this?
- **Confidence Score Display:** (moved from global) Show AI confidence as numeric ("87%") or banded ("High / Medium / Low")?
- _Add more as they arise_

## Decisions Made
| ID | Decision | Date |
|---|---|---|
| D-010 | Distribution targets: YouTube, TikTok, Instagram | |
| D-017 | Videos is a top-level sidebar page | |
| D-018 | Publish is part of video flow, not a separate page | |

## Readiness Checklist
- [ ] Page purpose and user goals defined
- [ ] Layout and sections designed
- [ ] Video list/grid view designed
- [ ] Timeline/segment review interface designed
- [ ] Segment regeneration flow designed
- [ ] Enrichment addition flow designed
- [ ] Publish flow designed (target selection, dry-run, confirm, status)
- [ ] Platform-specific format handling designed
- [ ] AI disclosure labeling flow designed
- [ ] Progressive preview / render progress UX designed
- [ ] User flows mapped (full lifecycle)
- [ ] State management defined
- [ ] Edge cases documented
- [ ] Empty/error states designed
- [ ] Accessibility reviewed
- [ ] Integration points confirmed with backend
- [ ] All page-specific questions resolved
