# Industries — Page-Level Planning

## Page Purpose
Manage industry contexts and external feed sources (X, Reddit) that drive content ideation. Industries are the lens through which avatars discover events and form opinions.

## Sidebar Position
3rd item — `business_center` icon

## Key Objects / Entities
- Industry profiles (name, description, keywords, feed sources)
- Feed connections (X accounts/hashtags, Reddit subreddits)
- Events surfaced from feeds (tagged by industry, scored by relevance)
- Opinion profiles per avatar × industry
- Source trust tiers (Tier 1/2/3 — see Trust-Safety-Policy §3.1)

## User Goals on This Page
- _To be defined_

## Layout and Sections
- _To be defined_

## User Flows
- _To be defined_

### Flows to Map
- Create / edit an industry profile
- Connect feed sources (X accounts, Reddit subreddits) to an industry
- Browse surfaced events for an industry
- Create / edit opinion profiles for an avatar within an industry
- Review source trust classification
- Filter events by relevance, recency, trust tier

## State Management
- _To be defined_

## Edge Cases
- _To be defined_

## Integration Points
- Feed ingestion → Feed Service (source ingestion, dedupe, clustering, scoring)
- Trust tier classification → Policy Service
- Opinion profiles → AI personality system
- Event signals → Strategy Service (content strategy generation)
- _To be defined_

## Responsive Behavior
- _To be defined_

## Empty States
- No industries created → guidance to create first industry + connect feeds
- Industry with no feed sources connected → prompt to add feeds
- No events surfaced yet → loading / waiting state
- _To be defined_

## Error States
- _To be defined_

## Accessibility Notes
- _To be defined_

## Open Questions (Page-Specific)
- How many industries can a user create?
- Can an industry be shared across avatars or is it per-avatar?
- How are events presented — timeline? cards? filterable list?
- How does the opinion profile creation flow work?
- Is there an event detail view or just summaries?
- How does source trust tier classification surface to the user?
- **YouTube Comment Ingestion — MVP or deferred?** (moved from global) Vision says personality evolves "optionally after YouTube comments" but feed system currently only covers X and Reddit.
- _Add more as they arise_

## Decisions Made
| ID | Decision | Date |
|---|---|---|
| D-009 | Feed sources: X and Reddit | |
| | | |

## Readiness Checklist
- [ ] Page purpose and user goals defined
- [ ] Layout and sections designed
- [ ] User flows mapped (industry CRUD, feed connection, event browsing, opinion profiles)
- [ ] Industry creation form fields defined
- [ ] Feed source connection flow designed
- [ ] Event presentation designed
- [ ] Opinion profile creation flow designed
- [ ] State management defined
- [ ] Edge cases documented
- [ ] Empty/error states designed
- [ ] Accessibility reviewed
- [ ] Integration points confirmed with backend
- [ ] All page-specific questions resolved
