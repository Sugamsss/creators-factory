import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  AUTH_COOKIE_NAME,
  getMiddlewareRedirectPath,
} from "@/features/auth/lib/session-routing";

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasAccessCookie = Boolean(request.cookies.get(AUTH_COOKIE_NAME)?.value);
  const loginPath = getMiddlewareRedirectPath(pathname, search, hasAccessCookie);
  if (loginPath) {
    return NextResponse.redirect(new URL(loginPath, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
