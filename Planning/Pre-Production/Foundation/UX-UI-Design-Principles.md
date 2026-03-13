# UX / UI / Design Principles (Global)

## Scope
Global principles only. No page-level wireframes or component placements.
Reference: `screen.png` + `code.html` (Avatars page in green theme) establishes the visual DNA.
Source code verified as exact match for the reference screen.

---

## 1) Product Experience Principles

1. **Avatar Identity First**
   - The system should preserve character continuity across all outputs.
   - Every surface that shows an avatar should reinforce their visual and personality identity.
2. **Fast-to-First-Output**
   - Minimize setup friction for first usable video.
   - Onboarding should produce a tangible artifact (an avatar card, a draft script) within minutes.
3. **Controlled Automation**
   - Automation should be powerful but transparent and reversible.
   - Every automated action shows what it did, why, and how to undo it.
4. **Granular Iteration**
   - User can refine small parts without losing entire progress.
   - Segment-level control in videos; scene-level control in scripts; trait-level control in avatars.
5. **Trust Through Visibility**
   - Show status, confidence, source context, and policy checks clearly.
   - Never hide AI decisions behind a black box.
6. **No Dead Ends**
   - Every error state must include recovery actions.
   - Every empty state must include a clear path to first action.
7. **Progressive Disclosure**
   - Surface essential controls first; advanced options available on demand.
   - Avoid overwhelming new users while still empowering power users.

---

## 2) Visual System Direction (Foundation)

### 2.1 Reference Implementation Analysis (code.html → screen.png)

The reference code establishes the following DNA with exact values:

**Layout architecture:**
- Icon-only sidebar (fixed left, `w-20` / 80px).
- Main content area: glass panel with `rounded-3xl` (48px radius), `shadow-2xl`.
- Full-height layout (`h-screen`, `overflow-hidden`).
- Grainy textured background behind glass (full-bleed, fixed position).
- Header: `px-12 pt-12 pb-8`, separated by `border-b border-white/10`.
- Content area: `px-12 py-10`, sections separated by `space-y-16` (64px).

**Glass morphism design system (core visual identity):**
- **Glass panel** (main content container):
  - Light: `rgba(255,255,255,0.75)`, `backdrop-filter: blur(24px)`, border `rgba(255,255,255,0.4)`.
  - Dark: `rgba(15,26,24,0.65)`, `backdrop-filter: blur(24px)`, border `rgba(255,255,255,0.08)`.
  - Shadow: `0 25px 50px -12px rgba(0,0,0,0.15)`.
- **Glass card** (content cards):
  - Light: `rgba(255,255,255,0.4)`, `backdrop-filter: blur(8px)`, border `rgba(255,255,255,0.4)`.
  - Dark: `rgba(255,255,255,0.03)`, border `rgba(255,255,255,0.08)`.
  - Hover: `translateY(-6px) scale(1.01)`, bg `rgba(255,255,255,0.6)`, shadow `0 20px 25px -5px rgba(0,0,0,0.1)`.
  - Transition: `all 0.4s cubic-bezier(0.4, 0, 0.2, 1)`.

**Component vocabulary (from code):**
- **Avatar cards:** glass-card `rounded-3xl`, hero image `h-72` (288px) with gradient overlay `from-black/80 via-black/20 to-transparent`, body `p-8`.
- **Placeholder card:** glass-card with `border-dashed border-2`, `min-h-[450px]`, centered `+` icon in `w-16 h-16 rounded-full bg-slate-100`.
- **Section headers:** colored bar `w-1 h-4` (4×16px) `bg-primary rounded-full` + label `text-xs font-bold tracking-[0.25em] uppercase text-slate-400`.
- **Primary CTA:** `bg-primary text-white px-8 py-3.5 rounded-2xl`, shadow `shadow-xl shadow-primary/20`, icon rotates 90° on hover.
- **Configure button:** `bg-primary/10 text-primary rounded-xl`, hover becomes `bg-primary text-white`.
- **Deploy button:** `border border-slate-200 rounded-xl`, hover `bg-white/20`.
- **Circular discover thumbnails:** `w-24 h-24 rounded-full` with `ring-2` border.
- **Role badges:** `text-[9px] font-bold tracking-widest uppercase px-3 py-1 rounded-full`.

**Interaction patterns (from code):**
- **Dual-action per card:** "Configure" (accent-tinted secondary) vs "Deploy" (neutral bordered).
- **Section links:** "VIEW REPOSITORY →" with arrow icon that translates on hover (`group-hover:translate-x-1`).
- **Sidebar active state:** `rgba(61,139,122,0.1)` background + filled icon (`font-variation-settings: 'FILL' 1`).
- **Card hover:** lift + scale + brighter background.
- **"+ Create Persona" icon:** rotates 90° on button hover.
- **Discover avatars:** scale 110% on hover.

### 2.2 Multi-Theme Accent Color System

The reference code uses a CSS variable `--primary-color: #3d8b7a` (teal-green) and Tailwind `primary` token. The product supports **multiple accent themes** by swapping this single variable.

**Default theme (from code):**
- Primary: `#3d8b7a` (teal-green)
- Background light: `#f0f4f3`
- Background dark: `#0f1a18`

**Additional accent themes (user-requested):**
- Orange
- Blue
- Red
- Magenta
- Charcoal
- Purple

**How theming works (accent color swap via `--primary-color` / Tailwind `primary`):**

Each theme swaps ONE accent hue. The code already uses `primary` as a token everywhere:
- Sidebar active: `sidebar-item-active` uses `var(--primary-color)` at 10% opacity bg + solid text.
- Section bars: `bg-primary`.
- CTA buttons: `bg-primary`, shadow `shadow-primary/20`.
- Secondary buttons: `bg-primary/10 text-primary`.
- Links: `text-primary/80 hover:text-primary`.
- Discover active badge: `text-primary bg-primary/10`.
- Icon hover: `group-hover:text-primary`.

**What stays constant across themes:**
- Glass morphism system (backdrop blur, opacity, shadows).
- Structural neutrals (`slate-` scale for text, borders, backgrounds).
- Typography (Playfair Display + Inter).
- Layout grid, spacing, border radii.
- Shadow and elevation system.
- Grainy background texture (tinted to match primary).

**Decided (D-025):** Theme scope is per-user only (whole app uses one accent color).

### 2.3 Neutral Foundation (Theme-Independent, from code)

- **Page background:** `#f0f4f3` (light), `#0f1a18` (dark) — soft tinted, never pure white.
- **Glass panels:** semi-transparent white with backdrop blur (see §2.1 glass morphism).
- **Glass cards:** lower-opacity white with lighter blur.
- **Text primary:** `text-slate-900` (light) / `text-slate-100` (dark).
- **Text secondary:** `text-slate-500` / `text-slate-400` / `text-slate-600` for descriptions.
- **Borders:** `border-white/10` (dividers), `border-slate-200` (buttons), `border-white/40` (glass).
- **Shadows:** `shadow-2xl` on main panel, `shadow-xl` on primary CTA, soft card shadows on hover.

### 2.4 Typography System (from code)

**Font families (Google Fonts):**
- **Display:** `Playfair Display` (weights: 400, 700) — serif, editorial.
- **Body:** `Inter` (weights: 300, 400, 500, 600) — sans-serif, high legibility.

**Type scale (from code):**
- **Page title:** `font-display text-6xl font-normal tracking-tight` (Playfair Display, ~60px).
- **Page subtitle:** `text-[10px] font-medium tracking-[0.2em] uppercase` (Inter, 10px, wide tracking).
- **Section label:** `text-xs font-bold tracking-[0.25em] uppercase text-slate-400` (Inter, ~12px).
- **Card name:** `font-display text-3xl text-white` (Playfair Display, ~30px).
- **Card age:** `opacity-60 text-xl font-sans font-light` (Inter, ~20px).
- **Card role:** `text-white/60 text-xs font-medium tracking-wide uppercase` (Inter, ~12px).
- **Body/description:** `text-sm text-slate-600 leading-relaxed font-light` (Inter, ~14px).
- **Button text:** `text-[10px] font-bold tracking-widest uppercase` (Inter, 10px).
- **CTA button text:** `font-semibold text-sm` (Inter, ~14px).
- **Role badge:** `text-[9px] font-bold tracking-widest uppercase` (Inter, 9px).
- **Code / technical info:** monospace for IDs, versions, trace data (font TBD).

### 2.5 Spacing and Layout System (from code)

- **Spacing scale:** Tailwind default (4px base: 4/8/12/16/20/24/32/40/48/64px).
- **Sidebar width:** `w-20` (80px), icon buttons `w-12 h-12` (48×48px).
- **Header padding:** `px-12 pt-12 pb-8` (48px horizontal, 48px top, 32px bottom).
- **Content padding:** `px-12 py-10` (48px horizontal, 40px vertical).
- **Section spacing:** `space-y-16` (64px between sections).
- **Card grid:** `gap-10` (40px), responsive: 1 col (sm) → 2 col (md) → 3 col (lg).
- **Discover grid:** `gap-8` (32px), responsive: 2 col (sm) → 4 col (md) → 5 col (lg).
- **Card internal padding:** `p-8` (32px) for body, `p-6` (24px) for discover cards.
- **Button spacing:** `gap-3` (12px) between action buttons.
- **Sidebar icon spacing:** `gap-6` (24px) between nav items.

### 2.6 Elevation and Surface System (from code)

The reference uses **glass morphism** instead of traditional solid elevation:

- **Level 0:** grainy textured background (full-bleed, fixed, primary-tinted).
- **Level 1:** glass panel — `rgba(255,255,255,0.75)`, `blur(24px)`, `shadow-2xl`. This is the main content container.
- **Level 2:** glass cards — `rgba(255,255,255,0.4)`, `blur(8px)`. Cards inside the main panel.
- **Level 3:** modals, overlays — TBD but should continue the glass language (stronger blur, dimmed backdrop).

Note: this is not a traditional opaque card-on-white system. The layered transparency is a core aesthetic.

### 2.7 Iconography (from code)

- **Icon library:** Google Material Symbols Outlined.
- **Default weight:** `font-variation-settings: 'wght' 300` (light/thin).
- **Active state:** `font-variation-settings: 'FILL' 1` (filled variant for active sidebar items).
- **Icon size:** `font-size: 22px` (default), `text-3xl` for placeholder card icon, `text-sm` for inline arrow icons.
- **Sidebar icons used:**
  - Brand: `auto_awesome` (sparkle).
  - Dashboard: `grid_view`.
  - Avatars: `face`.
  - Industries: `business_center`.
  - Scripts: `article`.
  - Automations: `bolt`.
  - Dark mode toggle: `dark_mode`.
  - CTA add icon: `add`.
  - Section arrow: `arrow_forward`.
- Icons in buttons are paired with text labels.

### 2.8 Motion Strategy (from code)

**Implemented animations:**
- **Card hover:** `translateY(-6px) scale(1.01)`, transition `all 0.4s cubic-bezier(0.4, 0, 0.2, 1)` — smooth lift + subtle scale.
- **Card image hover:** `scale-105`, `transition-transform duration-700` — slow zoom within card frame.
- **Discover avatar hover:** `scale-110` on image.
- **CTA icon rotation:** `group-hover:rotate-90 transition-transform` — "+" icon rotates on button hover.
- **Section arrow:** `group-hover:translate-x-1 transition-transform` — subtle rightward nudge.
- **Sidebar hover:** `transition-all` on background, `transition-colors` on icon tint.
- **All transitions:** use `transition-all` or `transition-colors` / `transition-transform` — intentional and consistent.

**Principles:**
- Avoid decorative over-animation that hides system status.
- Long-running operations: show progress bar or percentage, not just a spinner.
- Skeleton loading states for card grids and content areas.

### 2.9 Border Radius System (from code)

- **Default:** `12px` (Tailwind `rounded`).
- **XL:** `24px` (`rounded-xl`) — sidebar icon buttons, CTA buttons.
- **2XL:** `32px` (`rounded-2xl`) — discover cards.
- **3XL:** `48px` (`rounded-3xl`) — main content panel, avatar cards.
- **Full:** `rounded-full` — circular avatars, role badges, section bars, profile images.

This is a generous, soft-radius system. No sharp corners anywhere in the reference.

---

## 3) Sidebar Navigation Architecture (Global, finalized)

**Sidebar structure (from code.html + user decisions D-016, D-017, D-018):**

**Top — brand mark:**
- `auto_awesome` (sparkle) icon in `w-12 h-12 bg-primary rounded-2xl` with `shadow-lg shadow-primary/30`.

**Main navigation (6 items):**
1. Dashboard — `grid_view` icon. (D-016: confirmed as top-level page)
2. Avatars — `face` icon. (active in reference, uses `sidebar-item-active` class)
3. Industries — `business_center` icon.
4. Scripts — `article` icon.
5. Videos — `play_circle` icon. (D-017: added to sidebar; includes publish flow per D-018)
6. Automations — `bolt` icon.

**Bottom section:**
- Dark mode toggle — `dark_mode` icon in `w-10 h-10 rounded-full`.
- User profile — `w-10 h-10 rounded-full` avatar image with `border-2 border-white/50`, `ring-2 ring-primary` on hover.

**Resolved decisions:**
- Videos added to sidebar (was missing from code.html prototype).
- Publish is NOT a separate page — it is part of the video production/approval flow (D-018).
- Dashboard confirmed as a top-level page (D-016). Content scope TBD in page-level planning.
- Notifications: bell icon not in code sidebar. Consider adding to bottom section or as a global overlay — page-level decision.

**Navigation behavior (from code):**
- Active: `sidebar-item-active` class → `rgba(primary, 0.1)` background + `color: var(--primary-color)` + filled icon.
- Hover: `hover:bg-white/20` (light) / `hover:bg-white/5` (dark) + icon color `group-hover:text-primary`.
- Tooltips: `title` attribute on links (native browser tooltip, not custom).
- Icon buttons: `w-12 h-12 rounded-2xl` (48px, 24px radius).

---

## 4) Card and Object Presentation (Global Patterns)

### 4.1 Avatar Card Pattern (from code)
- Glass card: `glass-card rounded-3xl overflow-hidden`.
- Hero image: `h-72` (288px), `object-cover`, slow zoom on hover (`scale-105 duration-700`).
- Gradient overlay: `bg-gradient-to-t from-black/80 via-black/20 to-transparent`, increases to `opacity-90` on hover.
- Identity overlay (bottom-left on image): name `font-display text-3xl text-white` + age `opacity-60 text-xl font-sans font-light` + role `text-white/60 text-xs font-medium tracking-wide uppercase`.
- Body: `p-8`, description `text-sm text-slate-600 leading-relaxed font-light`.
- Action buttons: `mt-8 flex gap-3`, each `flex-1 py-3 text-[10px] font-bold tracking-widest uppercase rounded-xl`.
  - Configure: `bg-primary/10 text-primary`, hover → `bg-primary text-white`.
  - Deploy: `border border-slate-200`, hover → `bg-white/20`.

### 4.2 Empty/Placeholder Card Pattern (from code)
- Glass card with `border-dashed border-2`, no image.
- `min-h-[450px]`, centered flex column, `p-12`.
- Circle icon: `w-16 h-16 rounded-full bg-slate-100`, hover → `bg-primary text-white`.
- Title: `font-display text-xl` ("New Identity").
- Description: `text-xs text-slate-400 max-w-[180px] leading-relaxed`.

### 4.3 Section Pattern (from code)
- **My Creations:** colored bar `w-1 h-4 bg-primary rounded-full` + label `text-xs font-bold tracking-[0.25em] text-slate-400 uppercase`.
- **Discover:** bar uses `bg-slate-300` (NOT primary — subtler, de-emphasized).
- Right-aligned link: `text-xs font-bold text-primary/80 hover:text-primary` + arrow icon with hover translate.

### 4.4 Browse/Discovery Pattern (from code)
- Glass cards `rounded-2xl p-6`, centered flex column.
- Circular avatar: `w-24 h-24 rounded-full overflow-hidden`, `ring-2 ring-inset`.
  - Featured (Sarah/Storyteller): `ring-primary/30`.
  - Default (David, Elena, Leo): `ring-slate-200`.
- Name: `font-display text-xl`.
- Role badge: `text-[9px] font-bold tracking-widest uppercase px-3 py-1 rounded-full`.
  - Featured: `text-primary bg-primary/10` (accent-tinted).
  - Default: `text-slate-400 bg-slate-100`.
- Discover items have **role/archetype labels** (Storyteller, News Anchor, Educator, Performance) — these function as template categories, not community user content.

---

## 5) State Presentation Standards (Global)

### 5.1 Object Lifecycle States
Every major object (avatar, script, video, automation) must show its current state:
- `draft` | `configured` | `active` / `deployed` | `paused` | `archived`

### 5.2 Job/Process States
Every async operation must expose:
- `queued` | `running` | `succeeded` | `failed` | `retrying`

### 5.3 Long-Running Operation UX
Rendering a 30-minute video is not instant. Required:
- Progress indicator (percentage or segment progress, not just spinner).
- Estimated time remaining.
- Option to continue working on other tasks while rendering.
- Notification on completion or failure.
- Progressive preview of rendered segments as they complete.

### 5.4 Empty States
Every page and section needs a designed empty state:
- Clear explanation of what belongs here.
- Single primary action to get started.
- Optional illustration or contextual tip.

### 5.5 Error States
- Category-specific error messaging (not generic).
- Always show: what happened, why, and what to do next.
- Retry action if applicable.
- Link to related object or support context.

---

## 6) Interaction Standards (Global)

- Every async action must expose its state visibly.
- Every generated artifact must expose provenance/version metadata.
- Every policy block must explain the violated category and next action.
- Every high-impact action must confirm intent (publish, overwrite, delete).
- Every destructive action must be reversible or require explicit confirmation.
- Keyboard shortcuts for power users (global shortcut system, not page-specific).
- Search and filtering available globally for all object types.

---

## 7) Notification System (Global UX)

Notifications are not just for automation failures. Global notification events:
- Render job completion (success or failure).
- Publish completion (success or failure).
- Policy block triggered.
- Automation execution events.
- Adaptive memory suggestions (personality evolution proposals).
- System alerts (provider outage, quota warnings).

**Notification presentation:**
- In-app notification panel (bell icon in sidebar).
- Email for critical/configurable events.
- Toast/snackbar for immediate feedback on user actions.
- Severity levels: info, warning, error, critical.

---

## 8) Onboarding and First-Run Experience (Global)

Currently missing from all docs. Critical for "Fast-to-First-Output" principle.

**First-run journey (high-level, not page-specific):**
1. Welcome + goal selection (what kind of content? what niche?).
2. Create first avatar (guided, with AI assistance).
3. See first generated artifact (script or short video preview).
4. Understand the workspace layout.

**Principles:**
- Never dump user into an empty shell with no guidance.
- Show value before asking for configuration depth.
- Allow skipping detailed setup and refining later.

---

## 9) Accessibility Baseline

- WCAG AA contrast minimum for core flows.
- Keyboard-first operability for all primary actions.
- Reduced-motion mode support.
- Persistent focus visibility.
- Semantic status announcements for long-running operations.
- Screen reader support for all state changes and notifications.
- Touch-friendly targets for future tablet/responsive support.

---

## 10) Content Tone and Microcopy Principles

- Use direct language, not vague AI jargon.
- Explain system decisions in user terms ("We used your avatar's confident tone" not "Context layer applied").
- Avoid blame wording in errors.
- Keep alerts actionable and specific.
- Use personality-aware language in the product itself (warm, creative, empowering).

---

## 11) Responsive and Viewport Strategy

- Primary target: desktop web (1280px+ viewport).
- Minimum supported: 1024px width.
- Tablet consideration: deferred to post-MVP but layout should not break at tablet sizes.
- No mobile-first requirement for MVP.

---

## 12) Dark Mode (Already Built in Reference)

The reference code **already includes full dark mode support** via Tailwind's class-based toggle (`darkMode: "class"`).

**Dark mode implementation in code.html:**
- Toggle: `dark_mode` icon button in sidebar bottom, toggles `dark` class on `<html>`.
- Glass panel dark: `rgba(15,26,24,0.65)`, `blur(24px)`, border `rgba(255,255,255,0.08)`.
- Glass card dark: `rgba(255,255,255,0.03)`, border `rgba(255,255,255,0.08)`.
- Text: `dark:text-slate-100` (body), `dark:text-slate-400` (secondary), `dark:text-slate-500` (labels).
- Borders: `dark:border-white/10`.
- Backgrounds: `dark:bg-white/5` for icon containers and badges.

**Decided (D-022):** Dark mode is in MVP. Already prototyped in code.html.

---

## 13) Design Quality Gates

- [ ] Visual hierarchy is understandable in 5 seconds.
- [ ] Critical action states are always visible.
- [ ] Error recovery path exists for every failure state.
- [ ] Empty state exists for every page and section.
- [ ] Accessibility checks pass for core workflows.
- [ ] All automation actions are explainable and interruptible.
- [ ] Long-running operations show meaningful progress.
- [ ] Multi-theme accent system renders correctly across all themes.
- [ ] Onboarding flow produces first artifact within 5 minutes.
- [ ] Notification system covers all critical event types.

---

## 14) Terminology — DECIDED (D-015)

Canonical UI term: **"Avatars"** (from code.html page title and sidebar label).

**Terminology map:**
- **Avatar(s)** — the primary entity. Used in UI, sidebar, page titles, API endpoints, docs.
- **Digital Identity / Identity** — conceptual description (code subtitle: "Orchestrate Your Digital Identities", placeholder: "New Identity").
- **Persona** — retained ONLY for the personality/behavioral layer concept (code CTA: "Create Persona" — refers to the personality creation step).
- **Creator** — deprecated in UI context. May appear in vision.md but not in product UI.

All planning docs updated to use "Avatars" as the canonical term.
