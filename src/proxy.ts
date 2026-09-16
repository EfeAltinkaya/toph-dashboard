import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Optimistic check only: just whether a session cookie is present, so
// logged-out users get redirected before any page even starts rendering.
// The real, authoritative check (is this session still valid in the DB?)
// happens in getCurrentUser() on each protected page — Proxy must not hit
// the database itself.
const PUBLIC_ROUTES = ["/login", "/signup"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has("session");
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  if (!hasSession && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (hasSession && isPublicRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|audio|.*\\.(?:png|jpg|svg|ico)$).*)"],
};
