import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const PROTECTED_PREFIXES = ["/admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for auth cookie/token
  const token =
    request.cookies.get("auth_token")?.value ?? // backend sets this cookie
    request.cookies.get("token")?.value ??
    request.cookies.get("authToken")?.value ??
    request.cookies.get("jwt")?.value;

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );

  if (isProtected && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Note: We intentionally do NOT redirect authenticated users away from /login here.
  // The login page handles the "already signed in" check itself via the /auth/me API,
  // which also correctly routes admins vs GP users. Doing it in middleware would require
  // decoding the JWT here and risks redirect loops.

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files and Next.js internals:
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
