import { NextRequest, NextResponse } from "next/server";
import { supabaseAuth } from "@/lib/supabase";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const rl = await checkRateLimit(`login:${ip}`, 5, 10 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Çox sayda uğursuz cəhd. Bir az gözləyin." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    );
  }

  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "E-poçt və şifrə tələb olunur" }, { status: 400 });
    }

    if (!supabaseAuth) {
      return NextResponse.json({ error: "Server konfiqurasiyası xətası" }, { status: 500 });
    }

    const { data, error } = await supabaseAuth.auth.signInWithPassword({ email, password });

    if (error || !data.session) {
      return NextResponse.json({ error: "E-poçt və ya şifrə səhvdir" }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set("eduhub-token", data.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60, // 1 hour — matches Supabase access_token TTL
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Server xətası" }, { status: 500 });
  }
}
