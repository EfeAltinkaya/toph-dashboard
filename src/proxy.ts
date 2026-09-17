import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Optimistic check only: just whether a session cookie is present, so
// logged-out users get redirected before any page even starts rendering.
// The real, authoritative check (is this session still valid in the DB?)
// happens in getCurrentUser() on each protected page — Proxy must not hit
// the database itself.
//
// "/" is the public marketing/cover page — always accessible, logged in
// or not (the page itself swaps its CTA based on session state). "/login"
// and "/signup" are public too, but redirect away if already logged in.
// Everything else requires a session.
const ALWAYS_PUBLIC_ROUTES = ["/"];
const AUTH_ROUTES = ["/login", "/signup"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has("session");
  const isPublicRoute =
    ALWAYS_PUBLIC_ROUTES.includes(pathname) || AUTH_ROUTES.includes(pathname);

  if (!hasSession && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (hasSession && AUTH_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|audio|.*\\.(?:png|jpg|svg|ico)$).*)"],
};
