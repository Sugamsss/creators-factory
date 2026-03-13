# Pre-Production Planning

Global product and architecture decisions. Page-specific design happens in `Planning/Page-Level/`.

## Source Artifacts

- `vision.md` — product vision
- `code.html` + `screen.png` — reference UI prototype (Avatars page, glass morphism)
- `Decisions.md` — **all locked decisions in one place**

## Active Docs

```
Pre-Production/
  Decisions.md              ← all locked decisions (tech, product, nav, deferred prefs)
  Foundation/
    Journey.md              ← global user journey
    UX-UI-Design-Principles.md  ← design system, tokens, patterns
    Information-Architecture-Principles.md  ← navigation, entity model, lifecycle
  Product/
    Strategy-and-Scope.md   ← MVP scope and constraints
  Engineering/
    Frontend.md             ← frontend architecture
    Backend.md              ← backend services and API
    AI-Systems.md           ← AI pipelines, personality, generation
    Data-Security-Reliability.md  ← data model, storage, events
  Operations/
    Decision-Log.md         ← full decision history (D-001+)
```

## Archived (revisit when needed)

`_archive/` contains governance, business, operations process docs (risk register, RACI, GTM, commercial model, legal, trust-safety, etc.). These aren't needed to build functional pages — pull them back when the relevant feature or process demands it.

## Next Step

Start page-level planning in `Planning/Page-Level/` — one doc per page.
