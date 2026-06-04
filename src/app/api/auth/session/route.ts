import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, buildSessionCookie } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    return NextResponse.json({ authenticated: false });
  }

  const token = request.cookies.get("session")?.value;
  if (!token) {
    return NextResponse.json({ authenticated: false });
  }

  const result = verifySessionToken(token, secret);
  if (!result.valid) {
    return NextResponse.json({ authenticated: false, reason: result.reason });
  }

  // Refresh token (sliding window)
  const newToken = result.newToken || token;
  const cookie = buildSessionCookie(newToken);

  return NextResponse.json(
    { authenticated: true },
    {
      headers: {
        "Set-Cookie": cookie,
      },
    }
  );
}