# Assumptions Register (Global)

## Purpose
Track high-impact assumptions made during pre-production and force explicit validation plans.

## Template
- **A-ID:**
- **Assumption statement:**
- **Category:** Product / UX / Engineering / Policy / Business
- **Confidence:** Low / Medium / High
- **Impact if false:** Low / Medium / High / Critical
- **Validation method:**
- **Owner:**
- **Target date:**
- **Fallback plan:**
- **Status:** Open / Validated / Rejected

---

## Seed Assumptions

### A-001
- **Assumption statement:** Users will accept synthetic avatars as credible for recurring content.
- **Category:** Product
- **Confidence:** Medium
- **Impact if false:** Critical
- **Validation method:** interview + pilot engagement benchmarks
- **Status:** Open

### A-002
- **Assumption statement:** 30-minute long-form quality can be maintained with segment continuity architecture.
- **Category:** Engineering/AI
- **Confidence:** Medium
- **Impact if false:** Critical
- **Validation method:** controlled benchmark suite
- **Status:** Open

### A-003
- **Assumption statement:** External feed sources provide sufficient signal quality for consistent ideation.
- **Category:** Product/AI
- **Confidence:** Medium
- **Impact if false:** High
- **Validation method:** source quality scoring and sample quality review
- **Status:** Open

### A-004
- **Assumption statement:** Internal moderation plus provider moderation can keep risk within acceptable bounds.
- **Category:** Policy
- **Confidence:** Medium
- **Impact if false:** Critical
- **Validation method:** red-team tests and incident simulation
- **Status:** Open

### A-005
- **Assumption statement:** Glass morphism (backdrop-filter + blur) renders acceptably across all target browsers (Chrome, Firefox, Safari, Edge latest 2 versions).
- **Category:** Engineering/UX
- **Confidence:** High (backdrop-filter has ~96% global support)
- **Impact if false:** High — core visual identity would need rework.
- **Validation method:** cross-browser testing matrix during Phase 1.
- **Fallback plan:** solid semi-transparent fallback backgrounds.
- **Status:** Open

### A-006
- **Assumption statement:** Starter archetype templates (Discover section) will meaningfully improve onboarding conversion.
- **Category:** Product/UX
- **Confidence:** Low
- **Impact if false:** Medium — feature could be removed without breaking core product.
- **Validation method:** prototype walkthrough testing (§6 research plan).
- **Fallback plan:** remove Discover section; rely on guided avatar creation wizard.
- **Status:** Open

### A-007
- **Assumption statement:** Available TTS APIs can produce voice quality and consistency sufficient for recurring avatars.
- **Category:** Engineering/AI
- **Confidence:** Medium
- **Impact if false:** Critical — voice is core to avatar identity.
- **Validation method:** benchmark 3+ TTS providers against quality criteria.
- **Fallback plan:** reduce voice variation scope; use fewer, higher-quality voice presets.
- **Status:** Open

### A-008
- **Assumption statement:** Media asset storage costs (generated videos, images, voice files, LoRA weights) are sustainable within pricing model.
- **Category:** Business/Engineering
- **Confidence:** Low
- **Impact if false:** High — could make free tier unviable.
- **Validation method:** cost projection model based on estimated storage per video × expected usage.
- **Fallback plan:** aggressive lifecycle policies (auto-archive, compression, lower retention for free tier).
- **Status:** Open

### A-009
- **Assumption statement:** AI-assisted video enrichment (music, B-roll, subtitles) can be implemented within MVP timeline without excessive scope creep.
- **Category:** Engineering/Product
- **Confidence:** Low
- **Impact if false:** High — enrichment is listed as core in vision but could balloon timeline.
- **Validation method:** spike implementation of each enrichment type; estimate effort before committing.
- **Fallback plan:** ship subtitles only for MVP; defer music/B-roll/chapters/end screens.
- **Status:** Open

### A-010
- **Assumption statement:** AI-generated content strategy (30/60/90-day plans) provides actionable, high-quality output from industry signals.
- **Category:** AI/Product
- **Confidence:** Medium
- **Impact if false:** Medium — users could create strategies manually.
- **Validation method:** generate sample strategies for 5 industries; evaluate with target users.
- **Fallback plan:** manual strategy creation with AI-suggested topics (lighter automation).
- **Status:** Open
