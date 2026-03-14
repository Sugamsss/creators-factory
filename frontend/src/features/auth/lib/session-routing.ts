export const AUTH_COOKIE_NAME = "auth_token";
export const AUTH_LOGIN_PATH = "/login";
export const AUTH_SIGNUP_PATH = "/signup";
export const DEFAULT_POST_LOGIN_PATH = "/avatars";

const PROTECTED_ROUTE_PREFIXES = [
  "/dashboard",
  "/avatars",
  "/industries",
  "/scripts",
  "/videos",
  "/automations",
];

type SearchParamsLike = {
  get: (name: string) => string | null;
};

export function isAuthPagePath(pathname: string): boolean {
  return pathname === AUTH_LOGIN_PATH || pathname === AUTH_SIGNUP_PATH;
}

export function isProtectedAppPath(pathname: string): boolean {
  return PROTECTED_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function isMiddlewareBypassPath(pathname: string): boolean {
  return (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico" ||
    /\.[^/]+$/.test(pathname)
  );
}

export function getMiddlewareRedirectPath(
  pathname: string,
  search: string,
  hasAccessCookie: boolean
): string | null {
  if (isMiddlewareBypassPath(pathname) || isAuthPagePath(pathname)) {
    return null;
  }

  if (!hasAccessCookie && isProtectedAppPath(pathname)) {
    return buildLoginPath(`${pathname}${search}`);
  }

  return null;
}

export function sanitizeReturnPath(rawPath: string | null | undefined): string | null {
  if (!rawPath || !rawPath.startsWith("/") || rawPath.startsWith("//")) {
    return null;
  }

  try {
    const normalizedUrl = new URL(rawPath, "http://localhost");
    if (isAuthPagePath(normalizedUrl.pathname)) {
      return null;
    }
    return `${normalizedUrl.pathname}${normalizedUrl.search}`;
  } catch {
    return null;
  }
}

export function buildLoginPath(nextPath?: string | null): string {
  const safeNextPath = sanitizeReturnPath(nextPath);
  if (!safeNextPath) {
    return AUTH_LOGIN_PATH;
  }

  return `${AUTH_LOGIN_PATH}?next=${encodeURIComponent(safeNextPath)}`;
}

export function getPostLoginPath(searchParams?: SearchParamsLike | null): string {
  const safeNextPath = sanitizeReturnPath(searchParams?.get("next"));
  return safeNextPath ?? DEFAULT_POST_LOGIN_PATH;
}

export function getCurrentPathWithSearch(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return `${window.location.pathname}${window.location.search}`;
}
