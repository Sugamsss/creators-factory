# Scripts — Page-Level Planning

## Page Purpose
Create, edit, review, and manage video scripts. Scripts are the bridge between content strategy and video production — scene-by-scene breakdowns with personality-driven writing, style/vibe references, and edit modes.

## Sidebar Position
4th item — `article` icon

## Key Objects / Entities
- Script (title, avatar association, scenes, edit mode, status, version history)
- Scenes (text, visual direction, style/vibe references, duration estimate)
- Script edit modes: Strict / Adaptive / Free
- Content strategy link (which strategy/calendar entry this script fulfills)
- Alignment score (personality consistency metric)
- Policy check results (pre-generation safety validation)

## User Goals on This Page
- _To be defined_

## Layout and Sections
- _To be defined_

## User Flows
- _To be defined_

### Flows to Map
- Generate a new script from strategy/calendar entry
- Generate a script from scratch (manual topic)
- Edit a script (scene-level editing with edit mode controls)
- Attach style/vibe references to scenes
- Review alignment score and policy check results
- Send script to video production (transition to Videos flow)
- View script version history / rollback
- Duplicate a script
- Delete / archive a script

## State Management
- _To be defined_

## Edge Cases
- _To be defined_

## Integration Points
- Script generation → AI Generation Service (personality + opinion + strategy context)
- Alignment scoring → AI Quality Evaluation
- Policy checks → Policy Service
- Style references → Asset Storage Service
- Strategy link → Strategy Service
- Transition to render → Orchestrator
- _To be defined_

## Responsive Behavior
- _To be defined_

## Empty States
- No scripts yet → prompt to generate first script (link to avatar + strategy if available)
- Script with no scenes → generation in progress or failed
- _To be defined_

## Error States
- _To be defined_

## Accessibility Notes
- _To be defined_

## Open Questions (Page-Specific)
- What does the script editor look like? (Rich text? Structured scene blocks? Timeline?)
- How are style/vibe references attached — drag-drop? Browse? AI-suggested?
- How does the Strict/Adaptive/Free edit mode toggle work in the UI?
- Is there a side-by-side view for original vs edited script?
- How does alignment scoring display during editing (real-time or on-save)?
- Can a script be generated without a content strategy (ad-hoc topics)?
- What's the script-to-video handoff flow?
- **Content Strategy Generation — Automatic or user-initiated?** (moved from global) Options: automatic (system generates on new signals), user-initiated (explicit request), or hybrid (system suggests, user approves).
- **Strategy Drift Tracking:** (moved from global) When scripts deviate from strategy: auto-update strategy, flag drift, or user decides per-instance?
- **Style/Vibe References — per-script scope:** (moved from global, also in Avatars.md) How do script-level and scene-level style overrides work?
- **Catchphrase Frequency Limits:** (moved from global) System-enforced limits on avatar catchphrase frequency, or user-adjustable setting?
- _Add more as they arise_

## Decisions Made
| ID | Decision | Date |
|---|---|---|
| | | |

## Readiness Checklist
- [ ] Page purpose and user goals defined
- [ ] Layout and sections designed
- [ ] Script editor UX designed (scene blocks, edit modes, alignment scoring)
- [ ] User flows mapped (generate, edit, review, handoff to video)
- [ ] Style/vibe reference attachment flow designed
- [ ] Script version history / rollback designed
- [ ] State management defined
- [ ] Edge cases documented
- [ ] Empty/error states designed
- [ ] Accessibility reviewed
- [ ] Integration points confirmed with backend
- [ ] All page-specific questions resolved
