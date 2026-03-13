# AI Systems Planning (Global)

## Scope
This document defines global AI behavior and quality architecture, not per-page controls.

## 1) AI System Objectives
- Preserve avatar identity consistency across outputs.
- Produce high-quality short and long-form assets.
- Allow controlled regeneration of targeted segments.
- Make AI decisions explainable and reviewable.

## 2) Personality System Contract

### Layers
- Core Layer (stable)
- Adaptive Layer (evolving)
- Context Layer (temporary)

### Locked decisions
- Manual user edits to adaptive memory are allowed.
- System-suggested adaptive updates above threshold require approval.

## 3) Opinion and Collaboration Contract
- MVP videos use one opinion profile.
- Future collaboration mode can include multiple avatars, each with one opinion profile.

## 4) Script Governance Contract
- Manual edits do not disable personality influence.
- Free Edit mode still enforces hard policy blocks.
- Alignment scoring remains visible during edits.

## 5) Long-Form Generation Contract
- Segment-based generation strategy.
- Continuity package carried between segments.
- Segment-level regeneration with continuity locks.
- Auto-restitching with boundary quality checks.

## 5.1) Style / Vibe Reference Contract (Missing — from vision.md)
Vision says: "vibe references (user uploads style images or we generate them)."
This is not captured anywhere in the planning docs.

- Style references inform visual generation (lighting, mood, framing, color grade).
- Attachment scope options: per-avatar (default visual style), per-script (episode mood), or per-scene (shot-level direction).
- Can be user-uploaded images or AI-generated from text prompts.
- Must be versioned and linked to generation lineage.
- **Decision needed:** where does this entity live and what scope does it have? → deferred to page-level (Avatars.md / Scripts.md)

## 5.2) Video Enrichment Contract (Missing — from vision.md)
Vision says: "Add music, effects, B-roll, subtitles, chapters, end screens — all AI-assisted."
None of these are captured in the planning docs.

**Enrichment capabilities to define scope for:**
- **Music:** AI-selected or user-uploaded background music. Mood-matched to personality.
- **B-roll:** supplementary footage/images inserted between talking-head segments.
- **Effects:** transitions, overlays, visual enhancements.
- **Subtitles/captions:** auto-generated, editable, styled.
- **Chapters:** auto-detected topic boundaries with titles.
- **End screens:** templated outro with CTAs.

**Decided (D-019):** All enrichment types ship in MVP, all AI-generated from descriptions.

## 5.3) Content Strategy Generation Contract (Underspecified)
The 90-day content strategy is listed as a domain entity but generation logic is absent.

- **Input:** industry context + opinion profiles + avatar goals + event signals.
- **Output:** calendar of per-video topic plans with suggested angles.
- **Modes:** fully automated, hybrid (AI-suggested, user-approved), or manual.
- **Update triggers:** new events, performance feedback, manual user edits.
- **Drift tracking:** when scripts deviate from the strategy, should the strategy update or flag the drift?
- **Decision needed:** is strategy generation automatic or user-initiated? → deferred to page-level (Scripts.md)

## 5.4) Voice Model Pipeline Contract (Missing — core to avatar identity)
Vision specifies "trainable or selectable" voice for each avatar. No planning doc covers this.

**Voice pipeline components:**
- **Voice selection:** choose from a library of pre-built voice profiles (varying gender, age, accent, tone).
- **Voice customization:** adjust parameters (pitch, speed, warmth, expressiveness) per avatar.
- **Voice training (future/premium):** fine-tune a voice model on reference audio samples to create a unique voice.
- **Voice consistency:** the same avatar must sound identical across all videos, even when scripts change.
- **Voice-personality alignment:** voice characteristics should match personality traits (e.g., authoritative avatar ≠ soft voice).

**Provider strategy:**
- Evaluate 3+ TTS providers (e.g., ElevenLabs, Play.ht, Azure TTS, Google Cloud TTS).
- Abstraction layer to swap providers without changing avatar voice config.
- Latency target: voice generation for a 30-minute script should complete within X minutes (TBD).

**Decided (D-020):** Generated voices only. No voice training. No real voices.

## 5.5) LoRA / IP-Adapter Training Pipeline Contract (Missing — core to visual consistency)
Vision specifies generating consistent character appearances using trained LoRA models.

**Pipeline components:**
- **Character image generation:** initial set of reference images for an avatar (face, poses, expressions).
- **LoRA training:** fine-tune a LoRA model on the generated reference images to ensure visual consistency.
- **IP-Adapter integration:** alternative/complementary approach using IP-Adapter for style/face transfer.
- **Consistency validation:** automated scoring of generated frames against reference images.
- **Model versioning:** LoRA weights must be versioned alongside avatar config; updating appearance = new LoRA version.

**Infrastructure requirements:**
- GPU-intensive training (even small LoRAs require significant compute).
- Storage for LoRA weights per avatar (typically 10-100MB per model).
- Training time budget: target < 30 minutes for a usable LoRA from initial reference images.

**Provider strategy:**
- Self-hosted training via ComfyUI/kohya_ss (open-source path).
- Managed training via cloud GPU providers (hosted path).
- Abstraction layer for training backend swap.

**Decided (D-021):** Iterative prompt + feedback loop. User writes prompt, AI generates, user refines. Each iteration adds reference images.

## 6) Explainability Contract
Every generated artifact should be traceable to:
- active personality layers,
- context source,
- opinion profile,
- model/prompt/version lineage.

## 7) Quality Evaluation Framework

### Dimensions
- Avatar consistency
- Visual continuity
- Voice continuity
- Narrative coherence
- Policy compliance

### Evaluation modes
- Automated scoring
- Human review for high-impact outputs

## 8) AI Safety Model
- Hard policy constraints block unsafe outputs.
- Sensitive categories require elevated review.
- Provider-level checks are treated as baseline, not complete coverage.

## 9) Global AI Risks
- Identity drift across long-form renders
- Hallucinated event framing from noisy feeds
- Quality regression after repeated partial regenerations
- Latency/cost spikes from complex workflows
- Style reference misinterpretation causing visual inconsistency
- Music/B-roll selection misaligned with avatar tone
- Content strategy drift when manual edits accumulate without strategy reconciliation
- Voice quality inconsistency across TTS providers
- LoRA training producing low-quality or inconsistent character representations
- LoRA training compute costs exceeding budget projections
- Voice-visual mismatch (voice doesn't match the avatar's apparent age/gender/personality)

## 10) Readiness Checklist
- [ ] AI behavior contract finalized
- [ ] Quality scoring framework finalized
- [ ] Explainability metadata model finalized
- [ ] Safety escalation model finalized
- [ ] Long-form regeneration contract finalized
- [ ] Style/vibe reference contract finalized
- [ ] Video enrichment scope (music, B-roll, subtitles, chapters, end screens) decided
- [ ] Content strategy generation logic defined
- [ ] Voice model pipeline defined (provider selection, consistency, training scope)
- [ ] LoRA/IP-Adapter training pipeline defined (automation level, compute budget, versioning)
- [ ] Voice-personality alignment criteria defined
