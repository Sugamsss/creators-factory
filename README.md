# Creator Studio

An open-source digital creator studio for building fully synthetic AI avatars that produce consistent, high-quality video content at scale.

## Project Structure

```
creators-factory/
├── frontend/                    # Next.js 15 (App Router)
│   ├── src/
│   │   ├── app/                # App Router pages
│   │   │   ├── (app)/          # Authenticated app shell
│   │   │   │   ├── dashboard/
│   │   │   │   ├── avatars/
│   │   │   │   ├── industries/
│   │   │   │   ├── scripts/
│   │   │   │   ├── videos/
│   │   │   │   └── automations/
│   │   │   └── (auth)/         # Login, signup
│   │   ├── features/           # Feature-based modules
│   │   │   ├── avatars/
│   │   │   ├── industries/
│   │   │   ├── scripts/
│   │   │   ├── videos/
│   │   │   └── automations/
│   │   ├── shared/             # Truly shared utilities
│   │   │   ├── ui/             # Reusable UI primitives
│   │   │   ├── hooks/          # Shared hooks
│   │   │   ├── lib/            # Utilities, API client
│   │   │   └── types/          # Shared types
│   │   ├── styles/             # Global styles, tokens
│   │   └── providers/          # React context providers
│   └── tailwind.config.ts
│
├── backend/                     # FastAPI
│   ├── src/
│   │   ├── core/               # Config, DB, Security, Exceptions
│   │   ├── modules/            # Domain modules (self-contained)
│   │   │   ├── avatars/
│   │   │   ├── industries/
│   │   │   ├── scripts/
│   │   │   ├── videos/
│   │   │   └── automations/
│   │   └── services/           # Cross-cutting services
│   └── pyproject.toml
│
└── packages/
    └── types/                   # Shared TypeScript types
```

## Architecture Principles

### 1. Feature-Based Organization
Each feature owns its own slice:
- `features/avatars/components/` - Avatar-specific components
- `features/avatars/hooks/` - Avatar-specific hooks
- `features/avatars/services/` - API calls

**Why:** When you add a feature, you add one folder. When you delete a feature, you delete one folder.

### 2. Shared vs Feature Components
- `shared/ui/` - Generic primitives (Button, Card, Badge) - NO domain logic
- `features/*/components/` - Feature-specific compositions

### 3. Backend Module Pattern
Each module is self-contained:
```
modules/avatars/
  router.py       # HTTP concerns
  service.py      # Business logic
  models.py       # SQLAlchemy models
  schemas.py      # Pydantic schemas
```

### 4. Monorepo with Shared Types
`packages/types/` ensures frontend and backend stay in sync.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, React 18, Tailwind CSS |
| State | TanStack Query + Zustand |
| Backend | FastAPI, SQLAlchemy 2.0 (async) |
| Database | PostgreSQL |
| Auth | HttpOnly cookie-session JWT (access + refresh rotation) |

## Getting Started

### Prerequisites
- Node.js 20+
- Python 3.11+
- PostgreSQL 14+
- pnpm 9+

### Setup

1. Clone and install dependencies:
```bash
cd creators-factory
pnpm install
```

2. Set up the backend:
```bash
cd backend
cp .env.example .env
# Edit .env with your database credentials
pip install -e .
```

3. Set up the frontend:
```bash
cd frontend
# Already configured via pnpm workspace
```

4. Run development servers:
```bash
# Both frontend and backend
pnpm dev

# Or individually
pnpm dev:frontend  # http://localhost:3000
pnpm dev:backend   # http://localhost:8000
```

## Design System

### Colors
- Primary: `#1a3a2a` (deep forest green)
- Accent: `#4a9e8a` (teal)
- Surface: grays for content hierarchy

### Typography
- Display: Playfair Display (serif)
- Body: Inter (sans-serif)

### Components
All components use glass morphism:
- `glass-panel` - Main content containers
- `glass-card` - Card components with backdrop blur

## API Endpoints

### Auth (Cookie-Session Only)
- `POST /api/v1/auth/signup` - Create user and issue `auth_token` + `refresh_token` cookies
- `POST /api/v1/auth/login` - Authenticate and issue `auth_token` + `refresh_token` cookies
- `GET /api/v1/auth/me` - Return current authenticated user from access cookie
- `POST /api/v1/auth/refresh` - Rotate session cookies from refresh cookie
- `POST /api/v1/auth/logout` - Idempotently clear auth cookies

Auth transport in the browser is same-origin only (`/api/v1/*` via Next.js rewrite), and all authenticated requests must include cookies (`credentials: "include"`). Bearer/localStorage auth is intentionally unsupported.

### Avatars
- `GET /api/v1/avatars` - List user avatars
- `POST /api/v1/avatars/drafts` - Create avatar draft (canonical)
- `POST /api/v1/avatars` - Create avatar draft (alias, parity with docs)
- `GET /api/v1/avatars/:id` - Get avatar
- `GET /api/v1/avatars/:id/readiness` - Server-backed step readiness and blockers
- `PATCH /api/v1/avatars/:id` - Update avatar
- `DELETE /api/v1/avatars/:id` - Delete avatar
- `POST /api/v1/avatars/:id/generate-base` - Queue base generation (`accepted`, `operation_id`, `avatar_id`, `started_at`)
- `POST /api/v1/avatars/:id/edit-base` - Queue base edit generation (same async envelope)
- `POST /api/v1/avatars/:id/generate-references` - Queue 15-slot reference generation (same async envelope)
- `POST /api/v1/avatars/:id/train-lora` - Queue LoRA training (same async envelope)
- `POST /api/v1/avatars/:id/retry-lora` - Queue LoRA retry (same async envelope)

### Industries
- `GET /api/v1/industries` - List industries

## Contributing

1. Create a feature branch
2. Follow the existing code structure
3. Add types to `packages/types` if adding new data structures
4. Run typecheck before submitting

```bash
pnpm typecheck
```

## License

MIT
