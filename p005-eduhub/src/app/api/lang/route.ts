import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { lang } = await req.json().catch(() => ({}));
  const value = lang === "ru" ? "ru" : "az";
  const res = NextResponse.json({ ok: true });
  res.cookies.set("eduhub-lang", value, {
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
  });
  return res;
}
