# Auth Health Check (Local)

Use this checklist when auth appears broken.

## 1. Confirm same-origin transport
- Frontend requests should go to `/api/v1/*` (not an absolute backend URL).
- `frontend/next.config.js` rewrite must map `/api/:path*` to `http://localhost:8000/api/:path*`.

## 2. Verify cookie flags
- `COOKIE_SAMESITE` must be one of `lax`, `strict`, `none`.
- If `COOKIE_SAMESITE=none`, then `COOKIE_SECURE=true` is required.
- Local dev default: `COOKIE_SECURE=false`, `COOKIE_SAMESITE=lax`.

## 3. Validate core auth endpoints
1. `POST /api/v1/auth/signup` or `POST /api/v1/auth/login` sets both cookies: `auth_token`, `refresh_token`.
2. `GET /api/v1/auth/me` returns `200` with user payload when access cookie is valid.
3. `POST /api/v1/auth/refresh` rotates cookies when refresh cookie is valid.
4. `POST /api/v1/auth/logout` always returns `200` and clears cookies.

## 4. Expected 401 contract
- Response shape: `{ "detail": "...", "code": "..." }`
- Auth codes:
  - `AUTH_INVALID_CREDENTIALS`
  - `AUTH_SESSION_EXPIRED`
  - `AUTH_NOT_AUTHENTICATED`

## 5. Frontend session-expiry behavior
- On unrecoverable `401` (refresh fails), frontend should:
  1. Best-effort call logout
  2. Clear in-memory auth state
  3. Redirect to `/login?next=<original-path>`
- `/login` and `/signup` must remain reachable even with stale cookies.

## 6. Middleware behavior
- Middleware protects app routes only: `/dashboard`, `/avatars`, `/industries`, `/scripts`, `/videos`, `/automations`.
- Middleware must not handle API routes.
- Missing cookie on protected page redirects to login with `next` path.
