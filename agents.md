# Project-Wide Instructions

- Treat the planning docs and locked decisions as the source of truth. Before making, accepting, or recommending a change, cross-check it against the relevant docs, existing code, and any already-set product or architecture decisions.
- If something conflicts across documents, code, or new requests, surface the conflict clearly instead of papering over it. Call out inconsistencies directly and propose the best resolution.
- Do not take shortcuts in thinking or architecture. Optimize for long-term scalability, maintainability, and extensibility, even when implementing small steps.
- Think from multiple angles before changing anything: product, UX, engineering, data model, reliability, security, operations, cost, and future scope expansion.
- Challenge weak decisions. If a request is suboptimal, risky, or likely to create debt, say so plainly and recommend a better alternative.

- Preserve architecture discipline:
  - keep shared UI primitives centralized
  - keep feature/domain logic inside feature modules
  - keep backend modules bounded by domain
  - separate transport, business logic, persistence, and provider integrations
  - avoid god files, god components, god services, and duplicated logic
  - split large files before they become hard to reason about

- Favor explicit contracts and single sources of truth. If a change affects entities, naming, flows, states, schemas, or API behavior, update the related docs, types, and contracts together.
- Do not let implementation drift away from the plan silently. If the plan needs to change, make that explicit.

- Frontend standards:
  - preserve the established visual language unless a deliberate redesign is requested
  - centralize design tokens, shared components, and repeated patterns
  - avoid generic, low-intent UI; aim for clarity, hierarchy, and polished UX
  - design for desktop and mobile from the start
  - maintain accessibility and sensible interaction states by default

- Backend standards:
  - design for modular growth, async workflows, retries, and observability
  - keep APIs and domain boundaries clear
  - avoid coupling feature logic to framework glue or external providers

- Dependency policy:
  - first check whether a new dependency is truly needed
  - compare alternatives before adding one
  - prefer actively maintained, widely trusted, non-deprecated packages
  - use current stable versions unless there is a strong reason not to
  - understand the dependency well enough to use it properly and to spot future UX opportunities it unlocks

- Be proactive about improving the product. Regularly suggest stronger UX, user journey, workflow, and system-design ideas where they genuinely improve the application.
- Ask questions when needed, but only after doing all non-blocked thinking first. When you ask, make the question targeted and explain the tradeoff behind it.
- If something is intentionally temporary, say so explicitly and describe the clean upgrade path.
- Leave the codebase and plans in a better state after each change: clearer, more reusable, less coupled, and easier to extend.
