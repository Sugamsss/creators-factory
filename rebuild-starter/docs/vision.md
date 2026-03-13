# Creator Studio

**Content Factory – Product Vision Summary** (for co-founder discussion – Feb 28, 2026)

We are building **the first open-source digital creator studio** that lets anyone instantly spin up complete, fully autonomous, emotionally connectable digital humans who produce consistent, high-quality YouTube/TikTok/Instagram content at scale — without ever using a real human face or voice.

### Core Vision
Content Factory is not another wrapper around HeyGen or Synthesia.  
It is a **character factory + content operating system** that creates persistent digital creators who feel like real people viewers fall in love with and keep coming back to.  

Think “GPT-4o personality” but applied to the entire creator experience: visual, voice, script tone, quirks, growth over time. The result is not “AI-generated content” — it’s a new category: **subscription-worthy digital humans** that can run entire educational, lifestyle, or niche channels 24/7 while still feeling warm, consistent, and human.

Your mom’s phonics channel is the perfect first real-world use case, but the product is built from day one as a general-purpose content factory for teachers, creators, coaches, brands, and indie YouTubers.

### Key Differentiators (what makes this actually new)

1. **Completely Synthetic Personas (no real human photos or faces)** - Every creator starts as 100% AI-generated.  
   - User describes or chooses a base style → Flux / SD3 / Aurora generates a full consistent character (face, body, wardrobe, expressions).  
   - We then train lightweight LoRAs/IP-Adapters on those generated images only.  
   - This removes any “deepfake unease” and gives us perfect legal & ethical control over the character forever.

2. **Personality as a First-Class, Persistent Object** - When creating a persona you define (or AI helps generate):  
     - Core traits, backstory, emotional tone, catchphrases, quirks, signature gestures, favorite analogies.  
   - This personality card is injected into **every** stage: script writing, voice modulation, visual prompt, gesture control.  
   - Long-term memory vector store: after every video (and optionally after YouTube comments), the personality subtly evolves — new catchphrases, refined humor, growing confidence, audience-preferred topics.  
   - Result: after 20 videos the creator feels like a real evolving person, not a static template. This is the retention moat no current tool has.

3. **The "Newsroom" Ideation Engine (No More Blank Screens)**
   - Creators don't start with a blank text box. The studio features an active "Industries" engine that pulls in the latest news, trending topics, and prevailing outlooks for a user's selected niche.
   - Think of it like Twitter, but instead of single tweets, opinions form the seed for a complete ecosystem of video content. 
   - Users can select a trending news item, apply premade stances, or write their own opinion. The system then uses the Avatar's unique "Personality Card" to react to this news, instantly generating scripts and content strategies based on their specific worldview and tone.

4. **End-to-End Automation with Human Taste** - One flow:  
     Newsroom Spark / Industry niche → 90-day content strategy & calendar → detailed per-video plans → editable script (with scene-by-scene breakdown) → vibe references (user uploads style images or we generate them) → voice (trainable or selectable) → full video.  
   - Built-in smart AI video editor (timeline view): click any 15-second segment → “regenerate with this prompt” or “make her more excited here” → only that section re-renders and auto re-stitches seamlessly.  
   - Add music, effects, B-roll, subtitles, chapters, end screens — all AI-assisted.

5. **Video Pipeline Innovation (the technical heart)** We refuse to ship the “obvious AI avatar” look.  
   Instead we built a custom long-form engine using open-source models (Wan2.2, LTX-Video, Stable Video Infinity, Mochi 1, etc.) inside ComfyUI:  
   - Generate consistent 15–25 second clips with strong character reference + personality-driven expressions/gestures.  
   - Seamless chaining via last-frame I2V + frame overlap + light diffusion inpainting + interpolation.  
   - Supports both short-form (15–60s) and true long-form (10–30+ min) videos that feel continuous and cinematic.  
   - Fully local-first, but can boost with any API when user wants speed/quality.

6. **Zero-Cost Local + Premium Hybrid Monetization** - Core is 100% local (Ollama + local TTS + ComfyUI on user’s GPU) → completely free forever.  
   - Optional cloud boost: user pastes their own keys or pays us for hosted fast rendering.  
   - Our business: open-core (GitHub) + paid hosted SaaS tiers ($9–29/mo) for unlimited fast generation, priority queue, premium templates, marketplace of community personas/LoRAs, white-label, etc.  
   - Future: enterprise plans for brands/agencies running dozens of digital creators.

### Why This Wins
- Solves the exact problems that kill most AI content today: soullessness, short length limits, detectable “AI look”, and high recurring cost.  
- Creates emotional connection at scale — viewers will treat these digital creators like real teachers or friends.  
- Open-source from day one → massive community growth, contributions, and defensibility through ecosystem (think ComfyUI + Hugging Face combined for creators).  
- Starts narrow (education/phonics + 2–3 verticals) but is architected to become the default studio for anyone who wants to run a content channel without being on camera.

This is not a video generator.  
It is the infrastructure layer for the next wave of digital-first creators.

We are deliberately building something that will look obviously better and more alive than anything on the market in 2026, while staying fully open and accessible.

---

# Master Planning Document (Single Source of Truth)

**Status:** Draft v0.2 (planning stage)  
**Last updated:** Mar 1, 2026  
**Goal:** Capture complete planning clarity in one document before splitting into multiple docs and starting heavy development.

## 1) Product Definition (Locked)

### 1.1 Who this is for
- People who want to create content with a face/persona, but not their own real face or voice.

### 1.2 Core promise
- Create fully synthetic, persistent digital creators.
- Keep personality consistent over time while allowing growth.
- Generate high-quality short + long-form videos.
- Drive content from real-time industry/newsroom signals.

### 1.3 MVP must include
1. Personality system that feels real and persistent.
2. High-quality video output.
3. Industry/Newsroom logic from real-time external feeds.
4. Both short-form and long-form generation.
5. Full timeline/runtime editing with segment regeneration.
6. Voice support: both local and provider/integration based.
7. Direct publishing + file exports.
8. Web app deployment.
9. Open from day one.

### 1.4 Initial hard limits
- Maximum video duration at launch: **30 minutes**.
- Expansion roadmap: 30m -> 1h -> 2h -> 5h.

---

## 2) Scope Control (Critical for Success)

To avoid collapsing under scope, this MVP requires strict boundaries.

### 2.1 In scope for MVP
- Persona creation and management.
- Industry + event + opinion-driven ideation.
- Script generation and script editing.
- Storyboard/scene plan generation.
- Video generation pipeline with continuity across segments.
- Segment-level regeneration and restitching.
- Publish/export flow.
- Automation setup and scheduled execution.

### 2.2 Explicitly out of scope for MVP
- Marketplace economy and monetized template stores.
- Team collaboration/roles/permissions.
- White-label enterprise workflows.
- Native mobile app.
- Full “course platform” LMS (quizzes, student analytics, cohorts).

> Recommendation: For education use-cases in MVP, support **Series/Programs** (multi-video structured playlists), not full LMS.

---

## 3) Core Domain Model (Foundation)

The following entities are required to avoid logic drift later.

### 3.1 Entities
1. **Workspace**
   - Top-level project/account context.
2. **Creator (Avatar Identity)**
   - The synthetic character users publish as.
3. **Personality Core**
   - Stable traits: tone, phrases, quirks, values, cadence, style.
4. **Voice Profile**
   - Voice model + tuning parameters + emotional range.
5. **Visual Identity Profile**
   - Face/body references, wardrobe sets, environment presets.
6. **Industry**
   - Domain lens (e.g., education, finance, tech, health).
7. **Event**
   - Time-bound item (news event/topic/trend) in an industry.
8. **Opinion Profile**
   - A stance package for how a creator reacts within an industry/event.
9. **Content Strategy**
   - 30/60/90 day topic plan generated from goals + signals.
10. **Script**
   - Voiceover/dialogue narrative with scene-level breakdown.
11. **Video Project**
   - End-to-end production object for one video.
12. **Video Segment**
   - Small renderable chunk (e.g., 15-25s) with continuity metadata.
13. **Render Job**
   - Execution unit for generation/regeneration.
14. **Automation Rule**
   - Trigger + condition + action pipeline.
15. **Distribution Target**
   - YouTube/TikTok/Instagram destination config.

### 3.2 Key relationships
- One Creator -> many Opinion Profiles.
- One Industry -> many Events.
- One Event -> many Opinion variants per Creator.
- One Script -> many Video Segments.
- One Video Project -> many Render Jobs (initial + regen).
- Automation Rules can create Content Strategies, Scripts, and Video Projects.

---

## 4) Personality Logic (Needs to be deterministic)

### 4.1 Personality layering model
1. **Core Layer (stable):** identity, values, speech DNA, visual DNA.
2. **Adaptive Layer (slowly evolving):** learned preferences from performance and audience responses.
3. **Context Layer (temporary):** industry/event/opinion instructions.

Final generation behavior = `Core + Adaptive + Context` with weighted precedence.

### 4.2 Personality input schema
- Catchphrases and phrase bans.
- Voice characteristics (warmth, speed, authority, playfulness).
- Wardrobe and environment defaults.
- Gesture profile.
- Communication principles (e.g., “never humiliates beginners”).

### 4.3 Drift guardrails
- Hard constraints cannot be overwritten by temporary context.
- System-suggested adaptive changes above threshold require user approval; manual user edits are allowed directly.
- Store personality snapshots for rollback.

---

## 5) Industry + Events + Opinion Engine

### 5.1 Industry model
- Industry = stable topical lane.
- Feeds and trends are tagged to one or more industries.

### 5.2 Event model
- Event = specific, time-sensitive discussion node.
- Event has metadata: urgency, polarity, relevance window, confidence.

### 5.3 Opinion model
- One creator can hold multiple opinion profiles per industry/event.
- Opinion profile includes:
  - stance,
  - conviction level,
  - rhetorical style,
  - boundaries (what never to say).

### 5.4 Resolution logic when multiple opinions exist
Priority order:
1. Explicitly selected opinion by user for this video.
2. Automation-default opinion for this creator + industry.
3. Highest-performing opinion profile in recent history.
4. Neutral fallback profile.

### 5.5 Opinion policy for MVP vs later
- MVP: one video uses exactly one opinion profile.
- Later: support collaboration videos where each participating creator carries one opinion profile.

---

## 6) Script System Logic

### 6.1 Script sources
- News/event-driven.
- Manual idea prompt.
- Strategy calendar auto-generated topic.

### 6.2 Script edit modes
1. **Strict Persona Mode** (high consistency; edits constrained).
2. **Adaptive Persona Mode** (default; edits allowed with alignment checks).
3. **Free Edit Mode** (user override; alignment score shown, no hard lock).

### 6.3 Should manual edits disable industry/personality?
- **No.** Manual edits should not disable personality engine.
- Instead, recalculate alignment score and update adaptive memory via direct user edits or approved suggestions.

---

## 7) Product Information Architecture (Web)

### 7.1 Core pages (MVP)
1. **Personas**
   - Create/edit avatars, personality, voice, visual profile.
2. **Industries**
   - Live feeds, events, opinion profiles, stance mapping.
3. **Scripts**
   - Script generation, versioning, and edit modes.
4. **Videos**
   - Per-video review, timeline, segment regen, quality checks, publish readiness.
5. **Automations**
   - Schedule and trigger recurring creation pipelines.
6. **Publish**
   - Channel connections, direct posting, export formats, logs.

### 7.2 Why separate Videos and Automations
- Videos = hands-on craft/review.
- Automations = rules/orchestration.
- Combining both in one page increases cognitive load and causes state conflicts.

---

## 8) Long-Form Video Logic (Main Technical Risk)

### 8.1 Segment strategy
- Render in chained segments (15-25s target).
- Maintain continuity package between adjacent segments:
  - visual seed/reference,
  - pose/expression state,
  - environment state,
  - voice prosody state,
  - pacing and emotional arc state.

### 8.2 Stitching strategy
- Overlap frames at segment boundaries.
- Use boundary blending + interpolation.
- Apply continuity correction pass.

### 8.3 Regeneration strategy
- Regenerate single segment or segment range.
- Lock predecessor/successor continuity constraints.
- Auto-restitch and run artifact detection.

### 8.4 Duration roadmap architecture requirement
- Design timeline and storage now for 5h target, but enforce 30m cap in MVP.

---

## 9) Newsroom / External Feed Architecture

### 9.1 Sources (initial)
- X (Twitter) feeds.
- Reddit feeds.

### 9.2 Ingestion pipeline
1. Fetch items by curated sources + keywords.
2. Deduplicate and cluster related items.
3. Tag by industry/event.
4. Score by relevance, momentum, and risk.
5. Surface to user with suggested stance angles.

### 9.3 Risk controls
- API dependency volatility (especially X).
- Rate limits and outages.
- Policy-compliance filtering.

---

## 10) Voice System (Both Local + Integrated)

### 10.1 Required modes
- Local voice generation mode.
- Provider-backed mode for speed/quality.

### 10.2 Voice continuity requirements
- Preserve voice identity across long-form outputs.
- Maintain emotional modulation per scene.
- Keep loudness/prosody stable after segment regen.

---

## 11) Publish + Export System

### 11.1 Direct publish
- YouTube, TikTok, Instagram connectors.

### 11.2 Export
- Video file formats.
- Captions/subtitles.
- Metadata package (title, description, chapters, tags).

### 11.3 Required safeguards
- Dry-run preview before publish.
- Per-platform compliance checks.
- Retry + failure queue with logs.

---

## 12) Automation System

### 12.1 Automation structure
- Trigger: schedule/event/feed condition.
- Inputs: creator + industry + opinion profile + duration target.
- Actions: strategy -> script -> video -> review gate -> publish/export.

### 12.2 Human-in-the-loop checkpoints
- Optional approval gate before rendering.
- Optional approval gate before direct publish.
- Autopublish default is **OFF** and must be explicit opt-in.
- Automation failures retry up to 3 times with backoff.
- Every failed attempt triggers notifications and email alerts.

---

## 13) Safety, Policy, and Ethical Constraints

### 13.1 Identity constraints
- 100% synthetic personas by default.
- No real-person impersonation in MVP.

### 13.2 Content constraints
- Platform-specific prohibited content checks.
- Hate/harassment and harmful misinformation filters.

### 13.3 Operational constraints
- Duration hard cap enforced by policy service.
- Rate and budget safeguards.

---

## 14) Quality Bar and Evaluation

### 14.1 Quality dimensions
- Visual consistency.
- Voice consistency.
- Personality consistency.
- Narrative coherence.
- Publish readiness.

### 14.2 Suggested measurable gates
- Persona consistency score above threshold.
- Boundary artifact score below threshold.
- Script-persona alignment score above threshold.
- Human review pass rate for first 20 videos.

---

## 15) Reality Check: Current Tensions to Resolve

These are important contradictions/risk concentrations to resolve now:

1. **"Local-first" vision vs "Web-first" MVP**
   - Decision: MVP is web-first and API-first.
   - Local model support is deferred to post-v1 desktop apps (macOS and Windows helper apps/agents).

2. **Open from day one + direct publishing + external feeds**
   - This increases abuse/compliance surface area from day one.
   - APIs provide baseline restrictions, but baseline restrictions are not sufficient for full risk coverage.
   - Must still include internal policy and moderation checks in MVP (cannot defer).

3. **MVP breadth risk**
   - Long-form, full timeline regen, real-time feeds, voice dual-mode, direct publish, and automation in one MVP is extremely ambitious.
   - Direction locked: keep full ambition and execute with strict phase gates.

4. **Industry page vs education/courses**
   - Mixing full course product into industry logic creates conceptual sprawl.
   - Deferred decision: finalize when designing page-level flows.

---

## 16) Proposed MVP Phasing (Inside MVP, not post-MVP)

Even if all capabilities are required in MVP, sequence matters:

### Phase A: Logic and data contracts
- Finalize entity model.
- Finalize personality and opinion resolution rules.
- Define script edit mode behavior.

### Phase B: Core generation loop
- Persona -> script -> segmented video -> review.
- Manual segment regen + restitch.

### Phase C: Newsroom and automation
- Real-time feed ingestion.
- Opinion/event-driven content generation.
- Scheduling and workflow automation.

### Phase D: Distribution
- Direct publishing connectors.
- Export, retry, and audit logs.

---

## 17) Acceptance Criteria Before Full Build Starts

We begin heavy implementation only when:
- [ ] Entity and relationship model is signed off.
- [ ] Personality layering logic is signed off.
- [ ] Opinion behavior is signed off (single-opinion per MVP video, collaboration mode later).
- [ ] Script edit modes and adaptation policy are signed off.
- [ ] Videos page and Automations page boundaries are signed off.
- [ ] Long-form continuity + regen strategy is signed off.
- [ ] External feed ingestion compliance plan is signed off.
- [ ] Publish safety checks are signed off.

---

## 18) Decision Log (Answered)

### 18.1 Locked decisions
1. Adaptive memory edits are allowed directly.
2. MVP videos use a single opinion profile; collaboration videos are planned later.
3. Free Edit mode still enforces hard policy blocks.
4. Autopublish default is OFF.
5. Automation failures retry with backoff and trigger notifications + emails per failure.

### 18.2 Remaining decisions (still open)
1. Should catchphrases have mandatory frequency controls (to avoid repetition fatigue)?
2. If external feeds conflict with creator values, should value constraints always win?
3. Do we require scene-level citations/source links when script is generated from live events?
4. What is acceptable render time for 10m and 30m outputs in MVP?
5. Do we need a draft render quality mode for fast iteration before final export?
6. For education, do we explicitly lock to Series/Program in MVP and defer full Course flows?

---

## 19) Next Step

After we close the remaining Section 18 decisions, we will convert this document to implementation-ready specs and then split into page-level spec documents.