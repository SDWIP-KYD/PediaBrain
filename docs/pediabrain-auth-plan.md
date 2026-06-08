---
name: pediabrain-auth
description: Simple password-based auth for PediaBrain — single user, HTTP-only cookie, 30 min session
---
# PediaBrain Auth — Implementation Plan

## Goal
Single-password auth, no user database, 30-minute idle timeout.

## Files to create/modify

### 1. `middleware.ts` (create at src/)
Protects all routes except `/login`, `/api/auth/login`, `/api/auth/logout`, and static assets.

Flow:
- Check for `session` cookie
- If missing → redirect to `/login?from=<current-path>`
- If present → verify token (check signature + expiry)
- If expired → redirect to `/login?expired=1`
- Pass through on success

### 2. `src/app/login/page.tsx` (create)
Simple single-password form:
- Input: password field
- Submit → POST to `/api/auth/login`
- On success → redirect to `from` param or `/`
- On failure → show "Wrong password" error
- Show `expired=1` message if redirected from session timeout

### 3. `src/app/api/auth/login/route.ts` (create)
```ts
// POST — verify password, set session cookie
// Env: AUTH_PASSWORD, SESSION_SECRET
```

### 4. `src/app/api/auth/logout/route.ts` (create)
```ts
// POST — clear session cookie, redirect to /login
```

### 5. `src/lib/auth.ts` (create)
JWT-free session: token = `${userId}:${expiry}:${hmac_sha256}`
- User ID: just "1" (single user)
- Expiry: current time + 30 minutes
- HMAC using SESSION_SECRET env var

### 6. Update `next.config.ts`
Add `AUTH_PASSWORD` and `SESSION_SECRET` to env var list (required at build time).

### 7. `.env.example` — update
```env
AUTH_PASSWORD=your_secure_password_here
SESSION_SECRET=a_random_32char_string_here
```

## Security notes
- Password never stored, just compared
- Session cookie: `HttpOnly`, `SameSite=Lax`, `Secure` (in prod), `Path=/`
- 30 min sliding window: expiry checked in middleware, updated on each request
- `SESSION_SECRET` min 32 chars, used for HMAC integrity

## Flow diagram
```
User → / → middleware checks session cookie
  ├─ No cookie → redirect /login?from=/
  ├─ Invalid/expired → redirect /login?expired=1
  └─ Valid → serve page

/login → form → POST /api/auth/login
  ├─ Wrong password → show error
  └─ Correct → set session cookie (30 min), redirect to from param
```