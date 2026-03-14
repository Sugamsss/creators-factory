const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api/v1";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export class SessionExpiredError extends ApiError {
  constructor(message = "Session expired. Please log in again.") {
    super(message, 401);
  }
}

let refreshPromise: Promise<boolean> | null = null;

function shouldAttemptRefresh(path: string): boolean {
  return ![
    "/auth/login",
    "/auth/signup",
    "/auth/refresh",
    "/auth/logout",
  ].includes(path);
}

async function tryRefreshSession(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      return response.ok;
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

async function parseError(response: Response): Promise<string> {
  try {
    const payload = await response.json();
    return payload?.detail || payload?.message || "Request failed";
  } catch {
    return "Request failed";
  }
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  allowRefresh = true
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
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
  }

  if (!response.ok) {
    const message = await parseError(response);
    if (response.status === 401) {
      throw new SessionExpiredError(message);
    }
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
}
