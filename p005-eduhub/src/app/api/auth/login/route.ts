import { NextRequest, NextResponse } from "next/server";
import { supabaseAuth } from "@/lib/supabase";

export async function POST(req: NextRequest) {
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
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Server xətası" }, { status: 500 });
  }
}
