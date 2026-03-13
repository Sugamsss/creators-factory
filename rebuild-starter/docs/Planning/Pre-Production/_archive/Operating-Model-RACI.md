# Operating Model, RACI, and Planning Cadence (Global)

## Scope
Defines ownership and operating rhythm for pre-production decisions.

## 1) Core Roles
- Product Owner
- UX Lead
- **Design Lead** (glass morphism system, component library, theming, visual QA)
- Frontend Lead
- Backend Lead
- AI Systems Lead
- Trust & Safety Owner
- Security/Compliance Owner
- DevOps/SRE Owner
- Business/GTM Owner
- **Content Lead** (onboarding copy, archetype templates, help docs, microcopy)

## 2) RACI Framework (Template)

| Workstream | Responsible | Accountable | Consulted | Informed |
|---|---|---|---|---|
| Product strategy | Product | Product | UX, Business | Engineering |
| UX/UI principles | UX | UX | Product, Frontend | All |
| Frontend architecture | Frontend | Frontend | Backend, UX | Product |
| Backend architecture | Backend | Backend | Frontend, AI | Product |
| AI behavior + quality | AI | AI | Product, Backend | UX |
| Policy/safety | Trust & Safety | Trust & Safety | Legal, Product | All |
| Legal/IP/compliance | Compliance | Compliance | Product, Trust & Safety | All |
| NFR + reliability | SRE | SRE | Backend, Frontend | Product |
| Design system + component library | Design | Design | UX, Frontend | All |
| Voice + media pipeline | AI | AI | Backend, Product | UX |
| Content (templates, copy, docs) | Content | Content | UX, Product | All |
| Community / OSS governance | Product | Product | Backend, Business | All |
| GTM/commercial | Business | Business | Product | All |

## 3) Decision Cadence
- Weekly global planning review
- Weekly risk review
- Bi-weekly architecture review
- Bi-weekly policy review
- Milestone gate review at each phase transition

## 4) Meeting Outputs (Required)
- Decision deltas -> Decision-Log.md
- New unknowns -> Open-Questions.md
- New risks -> Risk-Register.md
- Invalid assumptions -> Assumptions-Register.md

## 5) Escalation Rules
- Any Critical risk unresolved for >7 days escalates to accountable owner.
- Any architecture disagreement unresolved for >2 reviews triggers RFC path.
- Any policy/legal blocker can pause implementation gates.
