import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/login",
  "/api/auth/login",
  "/api/auth/logout",
  "/api/auth/session",
];

function isPublicPath(pathname: string): boolean {
  for (const p of PUBLIC_PATHS) {
    if (pathname === p || pathname.startsWith(p + "/") || pathname.startsWith(p + "?")) {
      return true;
    }
  }
  return false;
}

function parseSessionToken(token: string): { userId: string; expiry: number } | null {
  try {
    const parts = token.split(":");
    if (parts.length !== 3) return null;
    const [userId, expiryStr] = parts;
    const expiry = parseInt(expiryStr, 10);
    if (isNaN(expiry)) return null;
    return { userId, expiry };
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get("session");
  const token = sessionCookie?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const parsed = parseSessionToken(token);
  if (!parsed) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("session");
    return response;
  }

  if (parsed.expiry <= Date.now()) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    loginUrl.searchParams.set("expired", "1");
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("session");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff|woff2)$).*)",
  ],
};
