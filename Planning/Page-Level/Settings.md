# Settings — Page-Level Planning

## Page Purpose
Global user and workspace settings. Not a sidebar nav item — accessed from user profile avatar (bottom of sidebar) or a gear icon. Covers account, preferences, integrations, and billing.

## Key Objects / Entities
- User profile (name, email, avatar image)
- Theme preference (accent color selection — per-user only, D-025)
- Dark mode toggle (also in sidebar, but persisted in settings)
- Connected accounts (YouTube, TikTok, Instagram API keys/OAuth)
- Feed source connections (X API, Reddit API)
- Notification preferences (which events, which channels, digest frequency)
- Storage usage and quota
- Billing / plan tier (if hosted)

## User Goals on This Page
- _To be defined_

## Layout and Sections
- _To be defined_

## User Flows
- _To be defined_

### Flows to Map
- Update profile
- Change accent color theme
- Connect/disconnect distribution platforms (YouTube, TikTok, Instagram)
- Connect/disconnect feed sources (X, Reddit)
- Manage notification preferences
- View storage usage
- Manage billing / upgrade plan (hosted only)
- Export data / delete account

## Open Questions (Page-Specific)
- Is Settings a full page or a slide-out panel?
- Where does API key management live (for self-hosters)?
- How does the theme picker work (color swatches? live preview?)?
- _Add more as they arise_

## Decisions Made
| ID | Decision | Date |
|---|---|---|
| D-014 | Multi-theme via CSS variable swap | |

## Readiness Checklist
- [ ] Page purpose and user goals defined
- [ ] Layout and sections designed
- [ ] User flows mapped
- [ ] Integration connection flows designed
- [ ] Notification preference UI designed
- [ ] All page-specific questions resolved
