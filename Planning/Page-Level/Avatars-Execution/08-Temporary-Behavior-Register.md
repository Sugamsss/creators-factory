# 08 — Temporary Behavior Register

## Purpose

Tracks intentional temporary behavior that is accepted for Phase 1 but must be revisited.

## Contract Version

- `avatars-phase1-v2`

## Active Temporary Items

1. Org collaboration permissions are restricted to owner-only.
   - Reason: org membership/admin model is not implemented yet.
   - Upgrade path: introduce `organization_memberships` + role checks and re-enable org member read/use/edit policies.

2. Step 2 slot-level refinement UI is partially implemented.
   - Reason: reference regeneration path exists, but per-slot refine entry/replace UX is not fully surfaced.
   - Upgrade path: add per-slot actions and state refresh hooks in Finalize Appearance step.

3. SSE event durability is currently append-only and replay-limited.
   - Reason: events are persisted for reconnect safety, but no retention/compaction policy exists.
   - Upgrade path: add retention job + bounded replay by cursor/event id.

4. Database migration system is SQL-file based (not fully Alembic-managed).
   - Reason: Phase 1 introduced new formal migration SQL files, but runtime still uses `create_all` in development.
   - Upgrade path: adopt full Alembic migration flow in startup/deploy pipelines.
