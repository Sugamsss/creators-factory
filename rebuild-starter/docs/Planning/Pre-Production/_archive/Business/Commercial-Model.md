# Commercial Model (Global Foundation)

## Scope
High-level business model assumptions and boundaries for MVP planning.

## 1) Monetization Structure
- Open from day one with clear open-core boundary.
- Optional paid hosted acceleration and convenience layers.

## 2) Revenue Hypotheses
- Subscription tiers for hosted generation speed and scale.
- Premium operational capabilities for advanced users.
- Future expansion paths (agency and enterprise tiers).

## 3) Cost Drivers
- **Rendering compute:** GPU-hours for video generation, voice synthesis, image generation, LoRA training.
- **Media asset storage:** generated videos, voice files, avatar images, style references, LoRA weights, thumbnails. This is the largest volume cost driver — a single 30-minute video can be multiple GB.
- **External API consumption:** X API, Reddit API, LLM APIs, TTS APIs, image gen APIs.
- **CDN and delivery bandwidth:** serving video previews, avatar images, published content.
- **Moderation and operations overhead:** policy service compute, abuse detection, manual review.
- **Notification and delivery infrastructure:** in-app, email, webhook.
- **Platform publish API costs:** YouTube/TikTok/Instagram API usage (mostly free but rate-limited).

## 4) Pricing Inputs Needed
- Expected workload profiles by user segment
- Target gross margin thresholds
- Competitive pricing benchmarks
- Willingness-to-pay indicators from interviews

## 5) Guardrails
- Avoid pricing that punishes experimentation.
- Keep free path meaningful for open-source adoption.
- Maintain transparency around usage and overage behavior.

## 6) Open-Core Boundary Inputs

**Fully open source (self-hostable):**
- Core orchestration engine
- Personality/opinion/script system
- Policy enforcement framework
- UI framework and glass morphism design system
- Starter archetype templates (Discover presets)
- All API contracts and schemas

**Hosted convenience (paid tiers):**
- Managed rendering compute (faster queues, higher priority)
- Managed asset storage with CDN (storage quotas by tier)
- Managed feed ingestion (X/Reddit API key management)
- Managed publish integrations (platform API key management)
- Premium voice model training (dedicated GPU allocation)
- Premium support and SLA guarantees

**Enterprise-only (future):**
- Team/workspace management
- SSO/SAML authentication
- Custom policy rule configuration
- Dedicated infrastructure and data isolation
- White-label / custom branding

**Storage tiering hypothesis:**
- Free tier: X GB storage, Y concurrent avatars, Z renders/month.
- Pro tier: higher limits, faster render queue, more storage.
- Scale tier: highest limits, priority support, dedicated resources.
- Exact numbers TBD after cost modeling.

## 7) Readiness Checklist
- [ ] Cost model v1 complete (including storage and rendering cost projections)
- [ ] Pricing hypotheses documented
- [ ] Open-core boundary documented with specific feature mapping
- [ ] Revenue-risk scenarios documented
- [ ] Storage tiering and quota model defined
- [ ] Free tier limits defined (must be meaningful for OSS adoption)
