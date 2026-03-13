# Risk Register (Global)

## Usage
Track cross-product risks only. Keep page-specific risks out of this register.

## Risk Scale
- **Probability:** Low / Medium / High
- **Impact:** Low / Medium / High / Critical
- **Status:** Open / Mitigating / Contained / Closed

---

## Active Risks

| ID | Risk | Probability | Impact | Owner | Mitigation | Status |
|---|---|---|---|---|---|---|
| R-001 | Long-form quality inconsistency across segment boundaries | High | Critical | AI Lead | Continuity package, boundary scoring, targeted regen rules | Open |
| R-002 | API/provider rate limits degrade ingestion/publish reliability | High | High | Backend Lead | Adapter abstraction, backoff, queueing, provider fallbacks | Open |
| R-003 | Policy gaps cause unsafe content leakage | Medium | Critical | Trust & Safety | Internal moderation gates + audit trails + escalation | Open |
| R-004 | State desync between frontend and backend job status | Medium | High | Frontend Lead | Correlation IDs, event-driven sync, reconciliation jobs | Open |
| R-005 | Scope leakage into page-level details during global planning | High | High | Product Owner | Enforce stage boundary and decision process | Open |
| R-006 | Render costs exceed sustainable range in MVP | Medium | High | Platform/FinOps | Cost budget controls, quality tiers, job caps | Open |
| R-007 | External feed quality/noise causes poor content direction | Medium | High | Product + AI | Source trust tiers, relevance/risk scoring, citation policy | Open |
| R-008 | Notification fatigue from retries/failures | Medium | Medium | Product + Ops | Severity-based alerting, digest options, smart escalation | Open |
| R-009 | Security gaps in third-party integrations | Medium | Critical | Security Owner | Secret management, scoped auth, integration threat model | Open |
| R-010 | Lack of observability slows debugging and recovery | High | High | SRE/Platform | Unified telemetry + dashboards + runbooks | Open |
| R-011 | Asset storage costs grow unbounded without lifecycle policies | Medium | High | Platform/FinOps | Storage quotas per tier, auto-archive, compression policies | Open |
| R-012 | Video enrichment scope (music, B-roll, subtitles, chapters, end screens) balloons MVP timeline | High | High | Product Owner | Decide MVP vs post-MVP scope per enrichment type before build | Open |
| R-013 | ~~Terminology inconsistency~~ | — | — | — | **RESOLVED (D-015):** Canonical term is "Avatars." | Closed |
| R-014 | Onboarding abandonment if first-run experience is not guided | High | High | Product + UX | Design and test onboarding flow before page-level build | Open |
| R-015 | Style/vibe reference misinterpretation causes visual drift across videos | Medium | High | AI Lead | Define scope, versioning, and validation for style references | Open |
| R-016 | Voice quality from TTS providers insufficient for recurring avatar identity | Medium | Critical | AI Lead | Benchmark 3+ providers; abstraction layer for swap; fallback to curated presets | Open |
| R-017 | LoRA training compute costs exceed budget or training quality is inconsistent | High | High | AI Lead + FinOps | Spike LoRA training cost/quality early; consider IP-Adapter as lighter alternative | Open |
| R-018 | Glass morphism (backdrop-filter) renders poorly on some target browsers | Low | High | Frontend Lead | Cross-browser testing in Phase 1; solid fallback backgrounds ready | Open |
| R-019 | Font loading (Playfair Display + Inter + Material Symbols = 3 requests) degrades initial page load | Medium | Medium | Frontend Lead | Font preloading, font-display: swap, subset fonts if needed | Open |
| R-020 | AI-generated content disclosure requirements differ across YouTube/TikTok/Instagram and change frequently | High | High | Trust & Safety + Legal | Monitor platform policies; implement per-platform disclosure labeling; build update mechanism | Open |
| R-021 | DMCA/takedown exposure from AI-generated content or enrichment assets (music, B-roll) | Medium | Critical | Legal + Trust & Safety | Licensing verification in enrichment pipeline; takedown process documented; incident playbook | Open |
| R-022 | Self-hosting documentation insufficient for OSS adoption, harming community growth | High | Medium | Product + Backend | Prioritize self-hosting docs in Phase 3; include in beta validation | Open |

---

## Risk Review Cadence
- Weekly risk review in pre-production.
- All Critical risks require mitigation owner and due date.
- No launch gate pass with unresolved Critical risks without explicit waiver.

## Risk Acceptance Rules
- Risk acceptance must include:
  - rationale,
  - temporary controls,
  - review date,
  - approval owner.
