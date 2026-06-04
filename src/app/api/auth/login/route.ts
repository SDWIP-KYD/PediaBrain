import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, buildSessionCookie, verifyPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    const storedPassword = process.env.AUTH_PASSWORD;
    const secret = process.env.SESSION_SECRET;

    if (!storedPassword || !secret) {
      console.error("[Auth] AUTH_PASSWORD or SESSION_SECRET not set");
      return NextResponse.json(
        { error: "Server misconfiguration" },
        { status: 500 }
      );
    }

    if (!verifyPassword(password, storedPassword)) {
      // Wrong password — still validate timing to prevent timing attacks
      // (verifyPassword already does constant-time)
      return NextResponse.json(
        { error: "Wrong password" },
        { status: 401 }
      );
    }

    // Password correct — create session
    const token = createSessionToken(secret, "1");
    const cookie = buildSessionCookie(token);

    return NextResponse.json(
      { ok: true },
      {
        status: 200,
        headers: {
          "Set-Cookie": cookie,
        },
      }
    );
  } catch (err) {
    console.error("[Auth] Login error:", err);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}