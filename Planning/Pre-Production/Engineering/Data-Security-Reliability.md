# Data, Security, Privacy, Reliability (Global)

## Scope
Global data/security/reliability requirements only.

## 1) Canonical Data Foundations

### Core domains
- Workspace and identity
- Avatar and personality artifacts (including demographic attributes: age, role/occupation)
- Voice model configurations (selected voice profiles, custom parameters, trained voice models)
- Visual training artifacts (reference images, LoRA weights, IP-Adapter models, consistency scores)
- Generation artifacts and versions (scripts, storyboards)
- Generated media assets (video segments, rendered videos, voice files, avatar images)
- Style/vibe reference assets (user-uploaded and AI-generated)
- Video enrichment assets (music, B-roll, subtitles, thumbnails, chapters, end screens)
- Feed/event source artifacts (with trust tier classification)
- Content strategy and calendar artifacts
- Policy decisions and moderation traces
- Distribution and publish outcomes (per-platform: YouTube, TikTok, Instagram)

### Data integrity principles
- Version every generated artifact.
- Never mutate history without audit trace.
- Preserve lineage between inputs and outputs.

## 2) Event Taxonomy (Observability)

Track these event families:
- User intent and control events
- Pipeline orchestration events
- Model/provider events
- Policy enforcement events
- Publish/export events
- Notification/alert events

Each event should include:
- correlation ID
- workspace/project IDs
- actor type (user/system)
- timestamp and latency
- status and failure category

## 3) Security Baseline

- RBAC and scoped tokens
- Encrypted secrets and key rotation
- Transport encryption and at-rest encryption
- Abuse throttling and anomaly detection
- Audit logs for sensitive actions

## 4) Privacy Baseline

- Data minimization for ingestion and retention
- Configurable retention windows for generated artifacts
- User export and deletion pathways
- Compliance-aware handling of third-party data sources

### Asset Storage Strategy (Decided → D-028: S3-compatible)
- Generated media is the largest data category by volume (video files, voice recordings, images).
- Cloud object storage (e.g., S3-compatible) with CDN for delivery.
- Lifecycle policies: auto-archive after inactivity, configurable retention per workspace.
- Versioning: keep N previous versions per asset, oldest auto-pruned.
- Cost controls: storage quotas per tier (free vs paid), compression/transcoding policies.
- Deletion: cascade delete when parent object (avatar, video project) is deleted, with grace period.

## 5) Reliability/SLO Baseline

### Service objectives (initial targets — see also NFR.md)
- API availability: 99.5% uptime for gateway and core services.
- Render job success: > 95% first-attempt (short-form), > 90% (long-form).
- Publish delivery: > 99% for queued jobs (with retries).
- Notification delivery: within 2 seconds of state change.
- LoRA training job success: > 90% (with fallback to IP-Adapter if training fails).
- Voice generation latency: TBD after provider benchmarking.

### Failure handling
- bounded retries
- dead-letter recovery process
- manual override capability
- post-incident root cause tracking

## 6) Policy and Moderation Reliability

- Hard-block categories always enforced.
- Policy decisions must be traceable and reproducible.
- Manual override should require explicit authorization and audit trail.

## 7) Global Risks

- Data lineage breaks across retries
- Missing audit evidence for enforcement actions
- Privacy exposure through external source ingestion
- Cascading failures across provider dependencies
- Unbounded asset storage growth without lifecycle policies
- Orphaned media assets from deleted or failed generation jobs

## 8) Readiness Checklist

- [ ] Canonical schema/version strategy signed off
- [ ] Event taxonomy signed off
- [ ] Security baseline signed off
- [ ] Privacy/retention policy signed off
- [ ] Reliability objectives signed off (cross-ref NFR.md)
- [ ] Incident response ownership assigned
- [ ] Asset storage architecture signed off (cloud object storage + CDN + lifecycle policies)
- [ ] Voice model data retention and versioning policy defined
- [ ] LoRA weight storage and lifecycle policy defined
- [ ] Feed source trust tier data model defined
- [ ] Orphaned asset cleanup strategy defined
