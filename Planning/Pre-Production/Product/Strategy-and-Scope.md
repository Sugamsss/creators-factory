# Product Strategy and Scope (Global)

## 1) Product Thesis

Creators Factory is a web-first platform for building and operating synthetic avatar identities that can generate, iterate, and distribute high-quality content with persistent personality.

## 2) Stage Boundary

This document defines global product strategy only.

Excluded from this document:
- Page-level IA decisions
- Page-level flow logic
- Field-level configuration details

## 3) Strategic Positioning

### 3.1 Category
- Digital Avatar Operating System (not just a video generator).

### 3.2 Core Differentiators
- Persistent synthetic identity with personality continuity.
- Industry/event-informed ideation.
- Long-form generation with segment-level regeneration.
- End-to-end pipeline from concept to publish.
- Open from day one.

### 3.3 Strategic Constraints
- Web-first and API-first in MVP.
- Local model helper apps deferred post-v1.
- Long-form cap starts at 30 minutes.

## 4) MVP Outcome Contract

MVP is successful if users can:
1. Onboard and create their first synthetic identity within minutes (guided flow).
2. Create a synthetic identity with controllable personality traits.
3. Generate both short and long-form content (up to 30 minutes).
4. Use event/industry context to drive content direction.
5. Generate and manage content strategies (30/60/90-day plans).
6. Edit/regenerate at segment granularity.
7. Publish/export reliably with clear failure recovery.
8. Switch between accent color themes.

## 5) Non-Goals (Current Stage)

- Full LMS/course product design
- Marketplace economy details
- Team workflow and enterprise permissions
- Native mobile app

## 6) Product Guardrails

- Identity trust must not be sacrificed for generation speed.
- Policy compliance must not be delegated entirely to provider APIs.
- Automation must remain explainable and interruptible.
- User edits must not silently corrupt long-term identity behavior.

## 7) Exhaustive Scope Checklist (Global)

### A. User + Market
- [ ] Segment ranking and launch sequence
- [ ] Jobs-to-be-done map
- [ ] Value proposition matrix
- [ ] Adoption barriers map

### B. Product + UX
- [ ] End-to-end macro flow defined
- [ ] State model defined
- [ ] Error handling model defined
- [ ] Explainability requirements defined
- [ ] Onboarding / first-run experience defined
- [ ] Glass morphism design system and component library planned
- [x] Sidebar navigation architecture finalized (D-016/D-017/D-018: Dashboard, Avatars, Industries, Scripts, Videos, Automations)
- [ ] Avatar lifecycle model defined (Configure → Deploy)
- [ ] Discover / archetype template scope decided

### C. AI + Generation
- [ ] Personality contract defined
- [ ] Opinion resolution policy defined
- [ ] Regeneration contract defined
- [ ] Long-form continuity contract defined
- [ ] Style/vibe reference contract defined
- [ ] Video enrichment scope decided (music, B-roll, subtitles, chapters, end screens)
- [ ] Content strategy generation logic defined
- [ ] Voice model pipeline defined (selection, training, provider strategy)
- [ ] LoRA/IP-Adapter training pipeline scoped

### D. Platform + Distribution
- [ ] Publish/export requirements defined
- [ ] Automation governance defined
- [ ] Notification and escalation model defined
- [ ] Asset/file storage architecture defined
- [ ] Real-time transport mechanism decided (WebSocket / SSE / polling)

### E. Trust + Governance
- [ ] Policy framework defined
- [ ] Abuse/misuse model defined
- [ ] Audit and traceability model defined

### F. Delivery
- [ ] Phasing and gates defined
- [ ] Risks and mitigations assigned
- [ ] Metrics/SLOs defined

## 8) Dependencies (Global)

- External feed APIs (X API, Reddit API) and policy constraints
- Social platform publish APIs (YouTube, TikTok, Instagram)
- Rendering/model providers and quotas (Wan2.2, LTX-Video, Stable Video, ComfyUI)
- Voice providers (TTS API selection, voice model training capability)
- Image generation providers (Flux, SD3, Aurora for character generation)
- LoRA/IP-Adapter training infrastructure
- Cloud object storage and CDN for generated media assets
- Internal moderation and audit infrastructure
- Google Fonts CDN (Playfair Display, Inter, Material Symbols)

## 9) Exit Criteria for Pre-Production

- [ ] All global decisions moved into Decision Log
- [ ] Open questions are bounded and owner-assigned
- [ ] Execution plan is phase-gated and risk-adjusted
- [x] Canonical UI terminology locked (D-015: "Avatars")
- [x] Sidebar navigation structure finalized (D-016/D-017/D-018)
- [x] All build-relevant decisions resolved (see Decisions.md). Remaining items deferred to page-level.
- [ ] Team agrees page-level planning can begin
