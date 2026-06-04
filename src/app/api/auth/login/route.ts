import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSessionToken, verifyPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    const storedPassword = process.env.AUTH_PASSWORD;
    const secret = process.env.SESSION_SECRET;

    if (!storedPassword || !secret) {
      return NextResponse.json(
        { error: "Server misconfiguration" },
        { status: 500 }
      );
    }

    if (!verifyPassword(password, storedPassword)) {
      return NextResponse.json(
        { error: "Wrong password" },
        { status: 401 }
      );
    }

    const token = createSessionToken(secret, "1");
    const cookieStore = await cookies();
    cookieStore.set("session", token, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      maxAge: 30 * 60,
      secure: true,
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("[Auth] Login error:", err);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}