import { describe, expect, it } from "vitest";
import {
  buildLoginPath,
  getMiddlewareRedirectPath,
  getPostLoginPath,
} from "./session-routing";

describe("session routing", () => {
  it("redirects protected route without cookie to login with next", () => {
    const redirect = getMiddlewareRedirectPath("/avatars/create/123", "?step=2", false);
    expect(redirect).toBe("/login?next=%2Favatars%2Fcreate%2F123%3Fstep%3D2");
  });

  it("keeps auth pages reachable even if cookie exists", () => {
    expect(getMiddlewareRedirectPath("/login", "", true)).toBeNull();
    expect(getMiddlewareRedirectPath("/signup", "", true)).toBeNull();
  });

  it("bypasses api and static paths in middleware logic", () => {
    expect(getMiddlewareRedirectPath("/api/v1/auth/me", "", false)).toBeNull();
    expect(getMiddlewareRedirectPath("/_next/static/chunk.js", "", false)).toBeNull();
    expect(getMiddlewareRedirectPath("/favicon.ico", "", false)).toBeNull();
    expect(getMiddlewareRedirectPath("/image.png", "", false)).toBeNull();
  });

  it("sanitizes next path to avoid auth-loop redirects", () => {
    expect(buildLoginPath("/login")).toBe("/login");
    expect(buildLoginPath("https://evil.example.com")).toBe("/login");
    expect(getPostLoginPath(new URLSearchParams("next=/signup"))).toBe("/avatars");
  });
});
