# Backend Planning (Global Architecture)

## Scope
Global backend system design only. No page-specific endpoint design.

## 1) Architecture Direction (Locked)
- MVP is **web-first, API-first**.
- Local model execution support is deferred to post-v1 desktop helper apps.

## 2) Core Backend Capabilities
- Identity/auth and workspace isolation
- Job orchestration for multi-step generation pipelines
- Feed ingestion and normalization
- Policy and moderation enforcement
- Publish/export integrations
- Notifications and audit logging

## 3) Service Boundary Proposal
- **API Gateway**: auth, request routing, rate limiting
- **Orchestrator**: workflow state machine and job scheduling
- **Generation Service**: script/video/voice pipeline execution management
- **Feed Service**: source ingestion, dedupe, clustering, scoring
- **Policy Service**: moderation checks and policy gates
- **Publishing Service**: platform connectors and publish lifecycle
- **Notification Service**: in-app + email delivery
- **Audit Service**: immutable event history and traceability
- **Asset Storage Service**: generated images, videos, voice files, LoRA weights, style/vibe references, thumbnails. Cloud object storage with CDN for delivery. Lifecycle management (retention, cleanup, versioning).
- **Strategy Service**: content strategy generation from industry signals + opinion lens + avatar goals. Calendar management and strategy-to-script handoff.
- **Voice Service**: TTS provider abstraction, voice profile management, voice generation orchestration, consistency validation. Must support provider swap without avatar config changes.
- **Visual Training Service**: LoRA/IP-Adapter training job management, reference image generation, model versioning, consistency scoring. GPU-intensive — may run on separate infrastructure.
- **Enrichment Service**: music selection/generation, B-roll sourcing, subtitle generation, chapter detection, end screen templating. Licensing validation before output.

## 4) Workflow and Job Model
- Strongly typed job lifecycle states
- Correlation IDs across all sub-jobs
- Idempotent retries for transient failures
- Compensating actions for partially completed workflows

## 5) API Contract Standards
- Versioned APIs
- Explicit schema contracts
- Structured error envelope
- Rate limit headers
- Request and response trace IDs

## 6) Dependency Strategy
- External APIs should be abstracted behind provider adapters.
- Support provider fallback for key dependencies.
- Cache feed fetches to manage quotas and spikes.

## 7) Reliability and Failure Model
- Retry with bounded backoff
- Dead-letter queue for irrecoverable jobs
- Explicit failure categories (transient, policy, dependency, internal)
- Operator visibility into queue depth and job health

## 8) Security and Compliance Baseline
- Least-privilege service credentials
- Encrypted secrets management
- Signed webhook validation where applicable
- Audit trails for high-risk actions

## 9) Real-Time Transport (Decided → D-027: SSE)
- Frontend requires event-driven updates for long-running jobs.
- Options: WebSocket (bi-directional), SSE (server-push), polling (simplest).
- Recommendation: SSE for job status updates, WebSocket if real-time collaboration features are added later.
- Must decide before frontend implementation begins.

## 10) Backend Risks
- Long-running jobs exhausting worker capacity
- Provider quota/rate-limit bottlenecks
- Inconsistent behavior across provider integrations
- Data model drift across services
- Asset storage costs growing unbounded without lifecycle policies

## 11) Readiness Checklist
- [ ] Service boundaries signed off
- [ ] Job lifecycle/state model signed off
- [ ] Error categories and retry policy signed off
- [ ] Policy enforcement architecture signed off
- [ ] Audit and traceability model signed off
