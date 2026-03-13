# Execution Plan (Global, Pre-Production)

## Goal
Sequence work to reduce risk while preserving ambitious MVP scope.

## Guiding Constraints
- Keep decisions global at this stage.
- Defer page-level specifics to next-stage chats.
- Lock contracts before implementation-heavy work.

## Phase Plan

### Phase 0: Foundation Lock
- Finalize product, UX, architecture, and policy contracts.
- Finalize data/event model and quality framework.
- Build complete risk register and ownership map.
- ~~Lock canonical UI terminology~~ — DONE (D-015: "Avatars").
- ~~Lock sidebar navigation architecture~~ — DONE (D-016/D-017/D-018: Dashboard, Avatars, Industries, Scripts, Videos, Automations).
- Select production frontend framework (React/Next.js/etc.).
- Decide video enrichment MVP scope (which of music/B-roll/subtitles/chapters/end screens).
- Decide Discover/archetype template scope.
- Define style/vibe reference contract.
- Define content strategy generation logic.

### Phase 1: Platform Baseline
- Establish API skeleton and service boundaries.
- Implement orchestration, auth, telemetry, and policy baseline.
- Enable non-UI validation via integration test harness.
- Set up cloud object storage and CDN for media assets.
- Implement glass morphism design system and component library (from code.html reference).
- Implement multi-theme accent color system.
- Implement sidebar navigation shell and global app layout.
- Implement real-time transport layer (SSE/WebSocket — per Backend.md §9).

### Phase 2: Generation Core
- Integrate script/voice/video orchestration pathways.
- Validate segment continuity and regeneration contracts.
- Establish quality scoring pipelines.
- Implement voice model selection/training pipeline.
- Implement LoRA/IP-Adapter training pipeline for character consistency.
- Implement video enrichment pipeline (subtitles minimum, others per MVP scope decision).
- Implement content strategy generation service.

### Phase 3: Feed + Automation + Distribution
- Integrate X API and Reddit API feed ingestion with trust scoring.
- Finalize automation execution and alerting.
- Integrate publish/export lifecycle with retries (YouTube, TikTok, Instagram).
- Implement AI-generated content disclosure labeling per platform requirements.
- Implement onboarding / first-run experience flow.
- Create and integrate Discover archetype starter templates.

### Phase 4: Hardening and Launch Readiness
- Security, policy, and reliability hardening.
- Synthetic identity verification pipeline (face similarity checks).
- Failure drills and incident simulations.
- DMCA/takedown process implementation.
- Dark mode validation (if included in MVP).
- Beta evaluation and launch gate checks.
- ToS / acceptable use policy finalized.

## Deliverables by Phase
- **Phase 0:** Signed-off contracts, locked terminology, framework selection, scope decisions.
- **Phase 1:** Running API skeleton, component library, storage infra, real-time transport, global app shell.
- **Phase 2:** Working generation pipeline (script → voice → video), quality scoring, enrichment baseline.
- **Phase 3:** Working feed ingestion, automation engine, publish pipeline, onboarding flow, starter templates.
- **Phase 4:** Security hardening, incident playbooks, operational dashboards, beta results, launch checklist.

## Gate Conditions

### Gate A (after Phase 0)
- All global planning docs signed off.
- Open questions triaged with owners and deadlines.
- Canonical terminology locked.
- Sidebar navigation finalized.
- Frontend framework selected.
- All "Decision Needed" items resolved.

### Gate B (after Phase 2)
- Quality thresholds validated in controlled runs.
- Continuity/regeneration reliability meets target.
- Voice model pipeline producing acceptable output.
- Component library covers all global patterns.
- Asset storage operational with lifecycle policies.

### Gate C (before launch)
- Policy and moderation controls validated.
- Publish reliability and rollback procedures validated.
- Onboarding flow tested with target users.
- AI disclosure labeling implemented per platform.
- ToS and legal docs finalized.
- Synthetic identity verification operational.

## Roles and Ownership Template
- Product owner
- UX lead
- Frontend lead
- Backend lead
- AI systems lead
- Trust and safety owner
- DevOps/SRE owner

## Execution Risks to Watch
- Cross-team dependency blocking
- Scope leakage into page-specific details too early
- Underestimating long-form performance constraints
- Insufficient observability before integration scale-up
- Glass morphism browser compatibility issues
- Font loading performance (3 Google Font requests)
- Video enrichment scope creep
- Voice model quality not meeting user expectations
- Storage costs exceeding projections before launch
