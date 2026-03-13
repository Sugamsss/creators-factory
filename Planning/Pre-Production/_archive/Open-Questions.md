# Open Questions (Global)

## Rule
Only include global questions. Page-specific questions go to future page-specific docs.

## A) AI / Quality
1. Should catchphrase frequency have mandatory limits by default?
2. What render-time targets are acceptable for 10m and 30m outputs?
3. Do we require draft quality mode before final renders?

## B) Newsroom / Trust
4. If external source framing conflicts with avatar values, should avatar values always win?
5. What source trust-tier model should be default (strict, balanced, open)?
6. Are source citations mandatory when outputs are based on live events?

## C) Product Strategy
7. What exact segment order should we prioritize for launch/beta?
8. What measurable threshold unlocks roadmap expansion from 30m to 1h?

## D) Operations
9. What notification severity policy should prevent alert fatigue while preserving transparency?
10. What incident severity matrix will govern launch blocking?

## E) Governance
11. What is the open-core boundary at MVP launch?
12. What moderation override process is allowed and who can authorize it?

## F) UX / Design (NEW — surfaced from second pass)
13. ~~**Terminology:**~~ **DECIDED (D-015):** Canonical UI term is "Avatars." "Persona" retained only for personality/behavioral layer.
14. **Theme scope:** Is accent color theming per-user, per-avatar, or per-workspace?
15. **Avatar lifecycle:** Configure → Deploy lifecycle is defined in IA-Principles and Journey.md. Deploy = activate avatar for pipelines. Publish = release a specific video (part of video flow per D-018). **Partially resolved — exact state machine details TBD in page-level planning.**
16. **Discover/Repository:** screen.png shows "Discover" section and "View Repository" — but marketplace is out of MVP scope. Are these curated templates, community presets, or deferred?
17. **Onboarding flow:** What is the first-run experience? What artifact does the user produce first?
18. **Dark mode:** The reference code (`code.html`) already has full dark mode implemented with class-based toggle. Is dark mode now in MVP scope since it's already prototyped, or still deferred?

## G) Domain Model / Entity Gaps (NEW — surfaced from vision.md cross-check)
19. **Style/Vibe references:** Vision says "vibe references (user uploads style images or we generate them)" — this entity is completely missing from the domain model. Where does it attach? Per-avatar? Per-script? Per-scene?
20. **Video enrichment assets:** Vision says "music, effects, B-roll, subtitles, chapters, end screens — all AI-assisted" — none of these are captured as entities or capabilities in the planning docs. Are all of these in MVP scope?
21. **Content Strategy generation:** The 90-day strategy is listed as an entity but the generation logic isn't defined. Is it auto-generated from industry signals, or manual, or hybrid?
22. **Avatar demographic attributes:** code.html shows age (28, 34) and occupational role (CUSTOMER SUCCESS, TECHNICAL LEAD) on avatar cards — these are now included in Journey.md identity establishment. **Partially resolved.**
23. **Collaboration video data model:** User confirmed collab videos are future, but should Video Project support referencing multiple avatars NOW in the data model to avoid painful retrofitting?
24. **YouTube comment ingestion:** Vision says personality evolves "optionally after YouTube comments" but feed system only covers X and Reddit. Is YouTube comment ingestion in MVP or deferred?

## H) Infrastructure / Engineering (NEW — surfaced from second pass)
25. **File/asset storage:** Generated images, videos, voice files, LoRA weights, style references — cloud storage strategy is completely missing from engineering docs.
26. **Real-time transport:** Frontend says "event-driven updates for all async jobs" but doesn't specify WebSocket, SSE, or polling. This is a global architecture decision.
27. **Strategy drift tracking:** When scripts are manually edited, does the content strategy update to reflect deviation? Or does the system track planned-vs-actual content divergence?
28. **Multi-tab/multi-window:** Creative tools often benefit from this. Any consideration for MVP?

## I) Navigation / Page Architecture — MOSTLY RESOLVED
29. ~~**Sidebar discrepancy:**~~ **DECIDED (D-015/D-016/D-017/D-018):** Finalized sidebar: Dashboard, Avatars, Industries, Scripts, Videos, Automations. Publish is part of video flow.
30. ~~**Dashboard page:**~~ **DECIDED (D-016):** Dashboard is a top-level page. Content scope (global overview, recent activity, job status) TBD in page-level planning.
31. ~~**Videos as top-level:**~~ **DECIDED (D-017):** Videos is a top-level sidebar page.
32. ~~**Publish as top-level:**~~ **DECIDED (D-018):** Publish is NOT a separate page. It is part of the video production/approval flow.
33. **Discover archetype templates:** code.html shows Discover items with role badges (Storyteller, News Anchor, Educator, Performance). Are these curated starter avatar templates? If so, who creates and maintains them? Are they shipped with the product or community-contributed?

---

## Question Lifecycle
- **Open** -> **In Review** -> **Decided** -> **Logged in Decision-Log.md**

Each question should have:
- owner,
- due date,
- decision criteria,
- default fallback if unresolved by deadline.
