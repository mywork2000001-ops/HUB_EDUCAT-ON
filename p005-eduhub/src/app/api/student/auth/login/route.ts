import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword, signStudentToken } from "@/lib/student-auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password)
      return NextResponse.json({ error: "E-poçt və şifrə tələb olunur" }, { status: 400 });

    const student = await db.student.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!student || !student.is_active)
      return NextResponse.json({ error: "E-poçt və ya şifrə səhvdir" }, { status: 401 });

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
