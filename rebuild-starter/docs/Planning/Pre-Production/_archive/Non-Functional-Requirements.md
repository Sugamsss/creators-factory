# Non-Functional Requirements (Global)

## Scope
System-wide quality attributes and constraints.

## 1) Performance
- **Synchronous API latency:** p95 < 200ms for read operations, p95 < 500ms for write/mutation operations.
- **Orchestration queue throughput:** support N concurrent render jobs per instance (exact N TBD after cost modeling).
- **Status/notification updates:** delivered within 2 seconds of state change via real-time transport.
- **Page load:** first meaningful paint < 2 seconds on 1280px+ desktop with broadband.
- **Search:** global search results returned within 500ms for up to 10,000 objects per workspace.
- **Asset delivery:** video/image preview load via CDN < 1 second for cached assets.

## 2) Scalability
- Horizontal scaling model for orchestration and workers.
- Capacity planning assumptions for burst workloads (e.g., 10x normal during launch/events).
- Queue partitioning strategy for fair scheduling (no single user starving others).
- **Concurrent render limit:** define max concurrent renders per user tier (free/pro/scale).
- **Storage scaling:** object storage must handle linear growth; no hard ceiling per workspace without explicit quota.

## 3) Reliability
- **Uptime target:** 99.5% for API gateway and core services (initial target, increase post-launch).
- **Render job success rate:** > 95% first-attempt success for short-form, > 90% for long-form.
- **Publish success rate:** > 99% for queued publish jobs (with retries).
- Failover and graceful-degradation strategy: degrade to reduced functionality (e.g., disable automation) if rendering provider is down.

## 4) Resilience
- Dependency outage handling strategy.
- Circuit-breaker and fallback policy.
- Retry idempotency guarantees.

## 5) Security
- Authentication and authorization baseline (JWT/OAuth2, session management).
- Secret management and rotation policy (no secrets in code, automated rotation).
- Threat model review cadence (quarterly, plus ad-hoc for new integrations).
- **API rate limiting:** per-user and per-IP rate limits on all endpoints.
- **CORS policy:** strict origin allowlisting.

## 6) Privacy and Compliance
- Data minimization strategy.
- Retention and deletion policy.
- Regional compliance assumptions.

## 7) Maintainability
- Test pyramid expectations (unit/integration/e2e).
- API and schema versioning policy.
- Backward compatibility policy.

## 8) Observability
- Required logs/metrics/traces per service.
- Alerting thresholds and ownership.
- Incident triage and RCA requirements.

## 9) Operability
- Runbooks for top failure scenarios.
- Manual override procedures.
- Disaster recovery playbook baseline.

## 10) Browser Compatibility
- **Required support:** Chrome (latest 2 versions), Firefox (latest 2 versions), Safari (latest 2 versions), Edge (latest 2 versions).
- **Glass morphism dependency:** `backdrop-filter` is required for the core visual identity. Browsers without support must receive a graceful fallback (solid semi-transparent background).
- **Variable font support:** required for Material Symbols Outlined icon system.
- No IE11 support.

## 11) NFR Readiness Checklist
- [ ] Numeric targets assigned for all critical NFRs
- [ ] Monitoring and alert coverage map complete
- [ ] DR and incident playbooks drafted
- [ ] Capacity model reviewed against launch projections
