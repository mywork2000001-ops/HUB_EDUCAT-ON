import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/student-auth";
import { verifyTeacher } from "@/lib/verify-teacher";

export async function GET(req: NextRequest) {
  if (!verifyTeacher(req)) return NextResponse.json({ error: "Icazə yoxdur" }, { status: 401 });

  const students = await db.student.findMany({
    orderBy: [{ class_name: "asc" }, { name: "asc" }],
    select: { id: true, name: true, email: true, class_name: true, group_name: true, is_active: true, created_at: true },
  });
  return NextResponse.json({ students });
}

export async function POST(req: NextRequest) {
  if (!verifyTeacher(req)) return NextResponse.json({ error: "Icazə yoxdur" }, { status: 401 });

  try {
    const { name, email, password, class_name, group_name } = await req.json();
    if (!name || !email || !password || !class_name)
      return NextResponse.json({ error: "Bütün sahələri doldurun" }, { status: 400 });
    if (String(password).length < 6)
      return NextResponse.json({ error: "Şifrə minimum 6 simvol olmalıdır" }, { status: 400 });

    const existing = await db.student.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existing)
      return NextResponse.json({ error: "Bu e-poçt artıq mövcuddur" }, { status: 409 });

    const hashed = await hashPassword(password);
    const student = await db.student.create({
      data: { name, email: email.toLowerCase().trim(), password: hashed, class_name, group_name: group_name || null },
      select: { id: true, name: true, email: true, class_name: true, group_name: true, is_active: true },
    });
    return NextResponse.json({ student }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server xətası" }, { status: 500 });
  }
}
