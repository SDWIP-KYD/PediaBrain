import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Protected routes — everything except these is public
const PUBLIC_PATHS = [
  "/login",
  "/api/auth/login",
  "/api/auth/logout",
  "/api/auth/session", // check session endpoint
  "/favicon.ico",
  "/_next",
  "/fonts",
];

const SKIP_PROTECTION = ["/api/ai/chat"]; // AI chat is always open (or add API key check here)

function isPublicPath(pathname: string): boolean {
  // Exact public paths
  for (const p of PUBLIC_PATHS) {
    if (pathname === p || pathname.startsWith(p + "/") || pathname.startsWith(p + "?")) {
      // More precise check
      if (p === "/api/auth/login" || p === "/api/auth/logout" || p === "/api/auth/session") {
        if (pathname.startsWith(p)) return true;
      }
      if (p === "/_next" || p === "/fonts") {
        if (pathname.startsWith("/_next") || pathname.startsWith("/fonts")) return true;
      }
      if (pathname === p) return true;
    }
  }
  // Exact match
  if (PUBLIC_PATHS.includes(pathname)) return true;
  // Starts with
  for (const p of PUBLIC_PATHS) {
    if (pathname.startsWith(p)) return true;
  }
  return false;
}

function isSkipped(pathname: string): boolean {
  for (const s of SKIP_PROTECTION) {
    if (pathname.startsWith(s)) return true;
  }
  return false;
}

// Parse and verify session token: "userId:expiry:signature"
function verifySession(token: string, secret: string): { valid: boolean; expired: boolean } {
  try {
    const parts = token.split(":");
    if (parts.length !== 3) return { valid: false, expired: false };

    const [userId, expiryStr, signature] = parts;
    const expiry = parseInt(expiryStr, 10);
    const now = Date.now();

    if (isNaN(expiry)) return { valid: false, expired: false };

    // Check expiry
    if (expiry <= now) return { valid: true, expired: true };

    // Verify HMAC
    const data = `${userId}:${expiryStr}`;
    const expectedSig = createHmac(data, secret);
    if (signature !== expectedSig) return { valid: false, expired: false };

    return { valid: true, expired: false };
  } catch {
    return { valid: false, expired: false };
  }
}

function createHmac(data: string, secret: string): string {
  // Use Web Crypto API (available in Next.js Edge runtime)
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(data);

  // Simple HMAC-SHA256 using crypto.subtle
  // We use a sync-compatible approach with the built-in module
  const crypto = require("crypto");
  return crypto.createHmac("sha256", secret).update(data).digest("hex");
}

function createSessionToken(secret: string): string {
  const userId = "1";
  const expiry = Date.now() + 30 * 60 * 1000; // 30 minutes
  const data = `${userId}:${expiry}`;
  const sig = createHmac(data, secret);
  return `${userId}:${expiry}:${sig}`;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip public paths
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Skip specific routes (like AI chat API)
  if (isSkipped(pathname)) {
    return NextResponse.next();
  }

  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    // If no secret set, allow all (dev mode)
    console.warn("[Auth] SESSION_SECRET not set — allowing all requests");
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get("session");
  const token = sessionCookie?.value;

  if (!token) {
    // No session
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const { valid, expired } = verifySession(token, secret);

  if (!valid || expired) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    if (expired) loginUrl.searchParams.set("expired", "1");
    const response = NextResponse.redirect(loginUrl);
    // Clear invalid cookie
    response.cookies.delete("session");
    return response;
  }

  // Session valid — allow
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff|woff2)$).*)",
  ],
};