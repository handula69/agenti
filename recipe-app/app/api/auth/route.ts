import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, computeSessionToken } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const appPin = process.env.APP_PIN;
  const secret = process.env.SESSION_SECRET;
  if (!appPin || !secret) {
    return NextResponse.json({ error: "Aplikace není nakonfigurována (chybí APP_PIN/SESSION_SECRET)." }, { status: 500 });
  }

  let body: { pin?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Neplatný požadavek." }, { status: 400 });
  }

  if (!body.pin || body.pin !== appPin) {
    return NextResponse.json({ error: "Nesprávný PIN." }, { status: 401 });
  }

  const token = await computeSessionToken(appPin, secret);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 180, // 180 dní
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
