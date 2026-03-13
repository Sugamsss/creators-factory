# Locked Decisions — Build Reference

Everything decided so far in one place. No process, no questions — just what's locked.

---

## Tech Stack

| Decision | Choice |
|---|---|
| Frontend framework | Next.js |
| Styling | Tailwind CSS + glass morphism |
| Typography | Playfair Display + Inter |
| Icons | Material Symbols Outlined |
| Real-time transport | SSE (upgrade to WebSocket if collab added later) |
| Asset storage | S3-compatible (MinIO for self-host, S3-compatible for cloud) |
| Architecture | Web-first, API-first |
| Theming | Per-user accent color via CSS variable swap |

## Product Decisions

| Decision | Choice |
|---|---|
| Canonical entity term | "Avatars" |
| Avatar creation | Iterative prompt + feedback loop (AI generates, user refines) |
| Voices | Generated only — no real voices, no voice training |
| Visual consistency | LoRA trained on iteratively refined reference images |
| Video enrichment (MVP) | All types: music, B-roll, effects, subtitles, chapters, end screens — all AI-generated |
| Videos per avatar | Single avatar per video project (collab deferred) |
| Render modes | Single quality mode (no draft render) |
| Dark mode | In MVP (already prototyped in code.html) |
| Max video length | 30 minutes |
| Personality model | Three layers: Core / Adaptive / Context |
| Generation model | Segment-based with continuity package |
| Feed sources | X (Twitter) and Reddit |
| Distribution targets | YouTube, TikTok, Instagram |
| Open-source | From day one |

## Navigation — Sidebar (6 items)

| Position | Page | Icon |
|---|---|---|
| 1 | Dashboard | `grid_view` |
| 2 | Avatars | `face` |
| 3 | Industries | `category` |
| 4 | Scripts | `article` |
| 5 | Videos | `play_circle` |
| 6 | Automations | `bolt` |

Publish is part of the Videos flow, not a separate page (D-018).

## Limits & Tiers

| Limit | Free | Paid |
|---|---|---|
| Concurrent renders | 1 | 5 |

## Deferred Preferences

These were noted but aren't needed until the relevant feature is actually built. Revisit when relevant.

| Topic | Preference | Revisit When |
|---|---|---|
| Quality gate | Strict (blocks publish below threshold) | Publishing pipeline built |
| Human review | Optional (user decides per-avatar/video) | Publishing pipeline built |
| Render time | Quality over speed, no specific targets | Rendering pipeline built |
| Voice latency | 5 min target for 30-min script | Voice pipeline built |
| Feed trust default | Balanced (Tier 1+2 pass, Tier 3 flagged) | Feed integration built |
| Source citations | Mandatory | Feed integration built |
| Values vs source conflict | User decides; updates avatar values if overridden | Feed integration built |
| Launch segments | Educators, Agencies, Brands (1,3,4) | Go-to-market planning |
| Open-core boundary | Free=self-hosted+BYOK, Commercial=hosted+subscriptions | Monetization planning |
| Long-form expansion | Quality score ≥80% to unlock 1hr | 30-min quality proven |
| Moderation override | Admin level only | Moderation system built |
| Notifications | Critical=in-app+email, Warning=in-app, Info=in-app+optional digest | Notification system built |
| Incident severity | P0=blocker, P1=24h fix, P2/P3=lower | Ops process needed |
| Failure handling | Retry 3× with backoff; notify on every failure | Pipeline built |
