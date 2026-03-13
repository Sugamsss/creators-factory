# Open-Source Governance (Global)

## Scope
Defines how the open project is governed from day one.

## 1) Governance Objectives
- Encourage high-quality contributions.
- Maintain product/security standards.
- Keep roadmap and decision making transparent.

## 2) Governance Structure
- Maintainers and review owners
- Module ownership map
- Escalation path for disputes

## 3) Contribution Model
- PR standards and templates
- Review requirements (code + docs + tests)
- Breaking-change process
- Security disclosure process

## 4) Release Governance
- Versioning strategy
- Release cadence
- Changelog and migration note requirements
- Rollback and hotfix policy

## 5) Community Rules
- Code of conduct and enforcement model
- Issue triage SLA
- RFC process for major architectural changes

## 6) Open-Core Boundary Tracking
- Explicit map of open vs paid-hosted capabilities
- Change-control process for boundary modifications

## 6.1) Design Assets in Open Source
The glass morphism design system, Tailwind configuration, and component library are significant assets. Scope decision:

- **Included in open source:** Tailwind config (colors, fonts, radii), glass morphism CSS classes (`.glass-panel`, `.glass-card`, `.sidebar-item-active`), component patterns, theming system.
- **Rationale:** design consistency across self-hosted and hosted versions benefits ecosystem; no competitive moat in CSS.
- **Excluded:** hosted CDN, managed build pipeline, premium component variants (if any).

## 6.2) Starter Archetype Templates
Discover section shows curated avatar templates (Storyteller, News Anchor, Educator, Performance).

- **Included in open source:** all starter archetype templates shipped with the product.
- **Community contribution model:** community can submit new templates via PR; review by Content Lead.
- **Premium templates (future):** TBD — could be a paid add-on but not for MVP.

## 6.3) Self-Hosting Documentation Requirements
For open-source adoption to work, self-hosting must be documented:
- Infrastructure requirements (compute, storage, GPU access).
- Provider API key setup (LLM, TTS, image gen, video gen).
- Feed API setup (X, Reddit).
- Publish API setup (YouTube, TikTok, Instagram).
- Environment configuration guide.
- Upgrade/migration procedures.

## 7) Readiness Checklist
- [ ] Maintainer structure finalized
- [ ] Contribution standards documented
- [ ] Security disclosure path documented
- [ ] RFC and decision process documented
- [ ] Open-core boundary map approved
