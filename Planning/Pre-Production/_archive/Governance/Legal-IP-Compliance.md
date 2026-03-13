# Legal, IP, and Compliance Foundation (Global)

## Scope
Legal/IP/compliance planning foundations for MVP and early scale.

## 1) Identity and Rights Model
- Synthetic identity by default.
- No unauthorized real-person likeness usage.
- Explicit rights model for uploaded assets.

## 2) Content Ownership Model
- **User-generated inputs** (personality config, scripts edits, style references, opinion profiles): owned by the user.
- **AI-generated outputs** (rendered videos, voice audio, generated images, scripts): user retains full usage rights; platform retains no exclusivity.
- **Model derivatives** (LoRA weights, fine-tuned voice models): owned by the user who trained them; platform may retain right to use anonymized training metadata for quality improvement.
- **Shared/community assets** (Discover archetype templates): platform-owned, licensed under product license for user consumption.
- **Enrichment assets** (music, B-roll): subject to source license terms; user must comply with redistribution requirements.
- Ownership model must be documented in user-facing ToS.

## 3) Third-Party Terms Risk
- Track constraints for feed sources (X API, Reddit API) — data usage limitations, rate limits, attribution requirements.
- Track publish platform policy constraints (YouTube, TikTok, Instagram) — AI-generated content labeling, synthetic media policies.
- Track model/provider usage and attribution terms (video gen, image gen, TTS, LLM providers).
- Track music/audio library licensing terms for video enrichment.
- Track Google Fonts licensing for Playfair Display, Inter, Material Symbols (all currently OFL/Apache — verify).

## 3.1) AI-Generated Content Disclosure
- YouTube, TikTok, and Instagram increasingly require disclosure of AI-generated/synthetic content.
- Published videos must include AI-generated labels where platform policy mandates.
- Metadata should include machine-readable synthetic content markers.
- User must be informed of disclosure requirements per platform before publishing.

## 3.2) Terms of Service / EULA Requirements
- ToS must cover:
  - Acceptable use policy (aligned with Trust-Safety-Policy.md).
  - Content ownership and licensing (see §2).
  - AI-generated content disclaimers.
  - Data retention and deletion rights.
  - Third-party service dependency disclaimers (provider outages, API changes).
  - Limitation of liability for AI-generated content accuracy.
  - Open-source license terms for self-hosted usage.
- EULA for future desktop app (deferred but structure should be planned).

## 4) Compliance Baseline
- Data retention and deletion policy
- Regional privacy obligations (as applicable)
- Consent/notice requirements for integrations
- Breach and incident notification pathways

## 5) Open-Source Legal Guardrails
- License selection and compatibility strategy
- Contribution license model (CLA/DCO decision)
- Third-party dependency license scanning policy

## 6) Readiness Checklist
- [ ] Synthetic identity legal policy signed off
- [ ] Asset rights and ownership policy signed off
- [ ] Third-party terms matrix completed
- [ ] Privacy and retention obligations mapped
- [ ] Open-source legal model signed off
- [ ] AI-generated content disclosure policy documented per platform
- [ ] Music/audio enrichment licensing policy documented
- [ ] ToS / acceptable use policy drafted
- [ ] Content ownership model finalized and user-facing
