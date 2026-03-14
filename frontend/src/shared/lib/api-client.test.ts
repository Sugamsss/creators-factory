import { beforeEach, describe, expect, it, vi } from "vitest";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function mockWindow(pathname: string, search = "") {
  const assign = vi.fn();
  const dispatchEvent = vi.fn();

  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      location: {
        pathname,
        search,
        assign,
      },
      dispatchEvent,
    },
  });

  return { assign, dispatchEvent };
}

describe("api client auth recovery", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it("retries request once when refresh succeeds", async () => {
    const fetchMock = vi.fn();
    let draftsCalls = 0;

    fetchMock.mockImplementation((input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith("/api/v1/auth/refresh")) {
        return Promise.resolve(jsonResponse({ user: { id: "1" } }, 200));
      }
      if (url.endsWith("/api/v1/avatars")) {
        draftsCalls += 1;
        if (draftsCalls === 1) {
          return Promise.resolve(jsonResponse({ detail: "Session token expired" }, 401));
        }
        return Promise.resolve(jsonResponse([{ id: 1 }], 200));
      }
      throw new Error(`Unexpected URL: ${url}`);
    });

    global.fetch = fetchMock as typeof fetch;
    mockWindow("/avatars");

    const { apiRequest } = await import("./api-client");
    const result = await apiRequest<Array<{ id: number }>>("/avatars");

    expect(result).toEqual([{ id: 1 }]);
    expect(fetchMock.mock.calls.filter((call) => String(call[0]).endsWith("/api/v1/auth/refresh"))).toHaveLength(1);
    expect(fetchMock.mock.calls.filter((call) => String(call[0]).endsWith("/api/v1/avatars"))).toHaveLength(2);
  });

  it("logs out and redirects with return path when refresh fails", async () => {
    const fetchMock = vi.fn();

    fetchMock.mockImplementation((input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith("/api/v1/auth/refresh")) {
        return Promise.resolve(jsonResponse({ detail: "Refresh token missing" }, 401));
      }
      if (url.endsWith("/api/v1/auth/logout")) {
        return Promise.resolve(jsonResponse({ message: "Logged out" }, 200));
      }
      if (url.endsWith("/api/v1/avatars")) {
        return Promise.resolve(jsonResponse({ detail: "Session token expired" }, 401));
      }
      throw new Error(`Unexpected URL: ${url}`);
    });

    global.fetch = fetchMock as typeof fetch;
    const { assign, dispatchEvent } = mockWindow("/avatars", "?tab=mine");

    const { apiRequest, SessionExpiredError } = await import("./api-client");

    await expect(apiRequest("/avatars")).rejects.toBeInstanceOf(SessionExpiredError);

    expect(fetchMock.mock.calls.some((call) => String(call[0]).endsWith("/api/v1/auth/logout"))).toBe(true);
    expect(assign).toHaveBeenCalledWith("/login?next=%2Favatars%3Ftab%3Dmine");
    expect(dispatchEvent).toHaveBeenCalledTimes(1);
  });

  it("does not redirect when already on auth pages", async () => {
    const fetchMock = vi.fn();

    fetchMock.mockImplementation((input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith("/api/v1/auth/refresh")) {
        return Promise.resolve(jsonResponse({ detail: "Refresh token missing" }, 401));
      }
      if (url.endsWith("/api/v1/auth/logout")) {
        return Promise.resolve(jsonResponse({ message: "Logged out" }, 200));
      }
      if (url.endsWith("/api/v1/avatars")) {
        return Promise.resolve(jsonResponse({ detail: "Session token expired" }, 401));
      }
      throw new Error(`Unexpected URL: ${url}`);
    });

    global.fetch = fetchMock as typeof fetch;
    const { assign } = mockWindow("/login");

    const { apiRequest } = await import("./api-client");
    await expect(apiRequest("/avatars")).rejects.toBeDefined();

    expect(assign).not.toHaveBeenCalled();
  });

  it("does not run auth redirect flow for non-401 API errors", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({ detail: "Server exploded" }, 500)
    );

    global.fetch = fetchMock as typeof fetch;
    const { assign } = mockWindow("/avatars");

    const { apiRequest, ApiError } = await import("./api-client");
    await expect(apiRequest("/avatars")).rejects.toBeInstanceOf(ApiError);

    expect(fetchMock.mock.calls.some((call) => String(call[0]).endsWith("/api/v1/auth/refresh"))).toBe(false);
    expect(assign).not.toHaveBeenCalled();
  });

  it("shares one refresh promise for concurrent 401 requests", async () => {
    const fetchMock = vi.fn();
    let firstCalls = 0;
    let secondCalls = 0;
    let refreshCalls = 0;

    fetchMock.mockImplementation((input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith("/api/v1/auth/refresh")) {
        refreshCalls += 1;
        return new Promise((resolve) => {
          setTimeout(() => resolve(jsonResponse({ ok: true }, 200)), 5);
        });
      }
      if (url.endsWith("/api/v1/avatars/1")) {
        firstCalls += 1;
        if (firstCalls === 1) {
          return Promise.resolve(jsonResponse({ detail: "Session token expired" }, 401));
        }
        return Promise.resolve(jsonResponse({ id: 1 }, 200));
      }
      if (url.endsWith("/api/v1/avatars/2")) {
        secondCalls += 1;
        if (secondCalls === 1) {
          return Promise.resolve(jsonResponse({ detail: "Session token expired" }, 401));
        }
        return Promise.resolve(jsonResponse({ id: 2 }, 200));
      }
      throw new Error(`Unexpected URL: ${url}`);
    });

    global.fetch = fetchMock as typeof fetch;
    mockWindow("/avatars");

    const { apiRequest } = await import("./api-client");
    const [first, second] = await Promise.all([
      apiRequest<{ id: number }>("/avatars/1"),
      apiRequest<{ id: number }>("/avatars/2"),
    ]);

    expect(first).toEqual({ id: 1 });
    expect(second).toEqual({ id: 2 });
    expect(refreshCalls).toBe(1);
  });
});
