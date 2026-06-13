import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword, signStudentToken } from "@/lib/student-auth";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  // Rate-limit: max 5 attempts per IP per 10 minutes
  const ip  = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const rl  = checkRateLimit(`student-login:${ip}`, 5, 10 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Çox sayda cəhd. ${rl.retryAfterSec} saniyə gözləyin.` },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    );
  }

  try {
    const { email, password } = await req.json();
    if (!email || !password)
      return NextResponse.json({ error: "E-poçt və şifrə tələb olunur" }, { status: 400 });

    const student = await db.student.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // Constant-time response to avoid timing attacks
    if (!student || !student.is_active) {
      await verifyPassword("dummy", "$2a$10$dummy.hash.to.prevent.timing");
      return NextResponse.json({ error: "E-poçt və ya şifrə səhvdir" }, { status: 401 });
    }

    const ok = await verifyPassword(password, student.password);
    if (!ok)
      return NextResponse.json({ error: "E-poçt və ya şifrə səhvdir" }, { status: 401 });

    const token = await signStudentToken({
      id:         student.id,
      name:       student.name,
      class_name: student.class_name,
      group_name: student.group_name,
    });

    const response = NextResponse.json({ ok: true });
    response.cookies.set("eduhub-student-token", token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge:   60 * 60 * 24 * 7,
      path:     "/",
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Server xətası" }, { status: 500 });
  }
}
