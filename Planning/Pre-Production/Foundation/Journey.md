# Journey (Global, Cross-Product)

## Purpose
Define the end-to-end journey at the product level, without page-specific decisions.

## Journey States

1. **Onboarding (first-run only)**
   - User selects goals, niche, and content ambition.
   - Optionally: choose accent color theme (multi-theme system from code.html).
   - Two paths to first avatar:
     - **From scratch:** guided creation with AI assistance.
     - **From template:** select a Discover archetype preset (Storyteller, News Anchor, Educator, Performance) and customize.
   - Produces first tangible artifact (avatar card, draft script) within minutes.
2. **Identity Establishment (Configure phase)**
   - Synthetic avatar identity is established (personality + voice + visual baseline).
   - Includes: personality traits, demographic attributes (age, role/occupation), voice profile, visual identity, wardrobe, environment defaults.
   - **Voice setup:** select from voice library or configure custom voice parameters (pitch, speed, warmth, expressiveness). Voice training from samples is future/premium.
   - **Visual training:** system generates reference images for the avatar, then trains a LoRA/IP-Adapter model for visual consistency across all future video frames.
   - Optionally: upload or generate style/vibe references for visual direction.
   - Avatar state: `Configuring` / `Draft`.
3. **Deployment**
   - User reviews avatar card (as shown in code.html: name, age, role, description, avatar image).
   - Clicks "Deploy" to activate the avatar for content pipelines.
   - Deployed avatar is eligible for: automation triggers, feed event responses, strategy generation, video production.
   - Avatar state: `Deployed` / `Active`.
   - Can be paused or archived later without losing configuration.
4. **Context Ingestion**
   - System ingests external signals (X, Reddit feeds) and user context.
   - Events surface from feeds, tagged by industry.
   - User creates or selects opinion profiles for their avatars per event/industry.
5. **Strategy Formation**
   - 30/60/90-day content strategy generated from industry context + opinion lens + avatar goals.
   - Calendar with per-video topic plans.
   - Strategy can be manually adjusted or auto-regenerated from new signals.
6. **Draft Generation**
   - Script generated with scene-by-scene breakdown.
   - Style/vibe references attached per scene (user-uploaded or AI-generated).
   - Script edit modes (Strict/Adaptive/Free) applied.
7. **Video Enrichment**
   - Music, B-roll, effects, subtitles, chapters, end screens added (AI-assisted).
   - This is part of the production plan, not a separate page.
8. **Production & Regeneration**
   - Video is rendered segment-by-segment with continuity tracking.
   - User reviews in timeline view.
   - Selective segment regeneration with prompt adjustment.
   - Progressive preview as segments complete.
9. **Approval & Distribution**
   - Asset passes quality and policy checks.
   - Dry-run preview before publish.
   - Published to YouTube/TikTok/Instagram or exported.
10. **Learning Loop**
   - Performance feedback from platform analytics.
   - Optionally: YouTube comment ingestion for audience sentiment.
   - Updates adaptive personality layer (with user approval above threshold).
   - Informs future content strategy generation.

---

## Global Journey Principles

- **Reversible decisions:** every high-impact step should support rollback.
- **Explainability:** user should know why the system chose a direction.
- **Low-friction iteration:** regenerate targeted parts, not entire outputs.
- **Trust by default:** show confidence, risk, and policy status before publishing.
- **Continuity over novelty:** preserve avatar identity over time.

---

## State Machine (High-Level)

- `draft` -> `ready_for_render` -> `rendering` -> `render_failed` or `rendered`
- `rendered` -> `ready_for_publish` -> `publishing` -> `published` or `publish_failed`
- Any state can branch to `needs_revision` when user edits or policy checks fail.

---

## Global Failure Recovery

- On render failure:
  - retry policy with backoff
  - preserve last known good state
  - notify user with root-cause category
- On publish failure:
  - no silent retries beyond configured limit
  - explicit notification + email per failure
  - guided remediation action

---

## Journey Telemetry (Global)

Track conversion and friction between each journey state:
- **Onboarding:** completion rate, template-vs-scratch split, drop-off step, time-to-first-avatar.
- **Configure → Deploy:** conversion rate, average time in configure state.
- **Deploy → First Script:** time-to-first-draft after deployment.
- Draft-to-render conversion.
- Render success rate.
- Revision loops per video.
- Ready-for-publish to published conversion.
- Failure-to-recovery time.

---

## Open Items

- ~~Quality gate strictness~~ → Decided: Strict (deferred preference, see Decisions.md)
- ~~Human review requirement~~ → Decided: Optional (deferred preference, see Decisions.md)
- ~~Deploy definition~~ → Lifecycle defined in IA-Principles (Configure → Deploy → Paused → Archived). Details in page-level planning.
- Confidence score display format → deferred to page-level (Videos.md / Scripts.md)
- Strategy drift tracking → deferred to page-level (Scripts.md)
- YouTube comment ingestion → deferred to page-level (Industries.md)
- Style/vibe reference scope → deferred to page-level (Avatars.md / Scripts.md)
