import {
  buildLoginPath,
  getCurrentPathWithSearch,
  isAuthPagePath,
} from "@/features/auth/lib/session-routing";

export const API_BASE_PATH = "/api/v1";

interface ApiErrorPayload {
  detail?: unknown;
  message?: unknown;
  code?: unknown;
}

export interface ParsedApiError {
  message: string;
  code?: string;
}

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export class SessionExpiredError extends ApiError {
  constructor(message = "Session expired. Please log in again.", code?: string) {
    super(message, 401, code);
  }
}

let refreshPromise: Promise<boolean> | null = null;
let sessionFailurePromise: Promise<void> | null = null;

function shouldAttemptRefresh(path: string): boolean {
  return ![
    "/auth/login",
    "/auth/signup",
    "/auth/refresh",
    "/auth/logout",
  ].includes(path);
}

function getErrorPayload(value: unknown): ParsedApiError {
  const fallback = { message: "Request failed" };
  if (!value || typeof value !== "object") {
    return fallback;
  }

  const payload = value as ApiErrorPayload;
  const detail =
    typeof payload.detail === "string"
      ? payload.detail
      : typeof payload.detail === "object" &&
          payload.detail &&
          "message" in payload.detail &&
          typeof (payload.detail as Record<string, unknown>).message === "string"
        ? ((payload.detail as Record<string, unknown>).message as string)
        : undefined;
  const message = typeof payload.message === "string" ? payload.message : undefined;
  const code = typeof payload.code === "string" ? payload.code : undefined;

  return {
    message: detail || message || fallback.message,
    code,
  };
}

async function parseError(response: Response): Promise<ParsedApiError> {
  try {
    const payload = await response.json();
    return getErrorPayload(payload);
  } catch {
    return { message: "Request failed" };
  }
}

async function tryRefreshSession(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const response = await fetch(`${API_BASE_PATH}/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });
        return response.ok;
      } catch {
        return false;
      }
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

async function bestEffortLogout(): Promise<void> {
  try {
    await fetch(`${API_BASE_PATH}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch {
    // Ignore network errors during cleanup.
  }
}

async function handleSessionFailure(): Promise<void> {
  if (sessionFailurePromise) {
    return sessionFailurePromise;
  }

  sessionFailurePromise = (async () => {
    await bestEffortLogout();

    if (typeof window === "undefined") {
      return;
    }

    window.dispatchEvent(new Event("auth:session-expired"));

    const { pathname } = window.location;
    if (isAuthPagePath(pathname)) {
      return;
    }

    const nextPath = getCurrentPathWithSearch();
    const loginPath = buildLoginPath(nextPath);
    window.location.assign(loginPath);
  })().finally(() => {
    sessionFailurePromise = null;
  });

  return sessionFailurePromise;
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  allowRefresh = true
): Promise<T> {
  const response = await fetch(`${API_BASE_PATH}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      ...(init.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(init.headers || {}),
    },
  });

  if (response.status === 401 && allowRefresh && shouldAttemptRefresh(path)) {
    const refreshed = await tryRefreshSession();
    if (refreshed) {
      return apiRequest<T>(path, init, false);
    }

    const parsed = await parseError(response);
    await handleSessionFailure();
    throw new SessionExpiredError(parsed.message, parsed.code);
  }

  if (!response.ok) {
    const parsed = await parseError(response);
    if (response.status === 401) {
      throw new SessionExpiredError(parsed.message, parsed.code);
    }
    throw new ApiError(parsed.message, response.status, parsed.code);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function parseAuthErrorResponse(response: Response): Promise<ParsedApiError> {
  const parsed = await parseError(response);
  if (response.status === 401) {
    return {
      message: parsed.message || "Authentication failed",
      code: parsed.code,
    };
  }
  return parsed;
}
