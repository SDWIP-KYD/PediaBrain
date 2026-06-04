import { createHmac, randomBytes } from "crypto";

const SESSION_COOKIE = "session";
const SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Create a session token: userId:expiry:hmac_signature
 * - userId = "1" (single user)
 * - expiry = now + 30min in ms
 * - signature = HMAC-SHA256("userId:expiry", SECRET)
 */
export function createSessionToken(secret: string, userId = "1"): string {
  const expiry = Date.now() + SESSION_TTL_MS;
  const data = `${userId}:${expiry}`;
  const sig = createHmac("sha256", secret).update(data).digest("hex");
  return `${userId}:${expiry}:${sig}`;
}

/**
 * Verify session token.
 * Returns { valid: true } if signature matches and not expired.
 * Returns { valid: false, reason: "expired" | "invalid" | "missing" }
 */
export function verifySessionToken(token: string, secret: string): {
  valid: boolean;
  reason?: "expired" | "invalid" | "missing";
  newToken?: string; // for sliding window — if you want to refresh
} {
  if (!token) return { valid: false, reason: "missing" };

  const parts = token.split(":");
  if (parts.length !== 3) return { valid: false, reason: "invalid" };

  const [userId, expiryStr, signature] = parts;
  const expiry = parseInt(expiryStr, 10);

  if (isNaN(expiry)) return { valid: false, reason: "invalid" };

  if (expiry < Date.now()) return { valid: false, reason: "expired" };

  const data = `${userId}:${expiryStr}`;
  const expectedSig = createHmac("sha256", secret).update(data).digest("hex");

  if (signature !== expectedSig) return { valid: false, reason: "invalid" };

  // Valid — optionally refresh (sliding window)
  const newToken = createSessionToken(secret, userId);
  return { valid: true, newToken };
}

/**
 * Build Set-Cookie header value for session.
 * - HttpOnly: prevents XSS access to cookie
 * - SameSite=Lax: works for navigation
 * - Secure: only over HTTPS (auto in Vercel prod)
 * - Path=/: available on all routes
 * - Max-Age: 30 minutes
 */
export function buildSessionCookie(token: string): string {
  const maxAge = Math.floor(SESSION_TTL_MS / 1000); // in seconds
  return [
    `${SESSION_COOKIE}=${token}`,
    `HttpOnly`,
    `Path=/`,
    `SameSite=Lax`,
    `Max-Age=${maxAge}`,
    `Secure`,
  ].join("; ");
}

/**
 * Clear session cookie.
 */
export function clearSessionCookie(): string {
  return [
    `${SESSION_COOKIE}=`,
    `HttpOnly`,
    `Path=/`,
    `SameSite=Lax`,
    `Max-Age=0`,
    `Secure`,
  ].join("; ");
}

/**
 * Check if request password matches AUTH_PASSWORD.
 */
export function verifyPassword(input: string, stored: string): boolean {
  // Constant-time comparison
  if (!input || !stored) return false;
  if (input.length !== stored.length) return false;

  let diff = 0;
  for (let i = 0; i < input.length; i++) {
    diff |= input.charCodeAt(i) ^ stored.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Generate a secure random string (for SESSION_SECRET fallback).
 */
export function generateSecret(length = 64): string {
  return randomBytes(length).toString("hex");
}