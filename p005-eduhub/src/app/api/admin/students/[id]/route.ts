import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/student-auth";
import { verifyTeacher } from "@/lib/verify-teacher";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await verifyTeacher(req))) return NextResponse.json({ error: "Icazə yoxdur" }, { status: 401 });
  const { id } = await params;
  try {
    const student = await db.student.findUniqueOrThrow({
      where:  { id },
      select: { id: true, name: true, email: true, class_name: true, group_name: true, is_active: true, display_password: true },
    });
    return NextResponse.json({ student });
  } catch {
    return NextResponse.json({ error: "Şagird tapılmadı" }, { status: 404 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await verifyTeacher(req))) return NextResponse.json({ error: "Icazə yoxdur" }, { status: 401 });

  const { id } = await params;
  try {
    const body = await req.json();
    const data: Record<string, unknown> = {};

    if (body.name)       data.name       = String(body.name).trim();
    if (body.email)      data.email      = String(body.email).toLowerCase().trim();
    if (body.class_name) data.class_name = String(body.class_name).trim();
    if ("group_name" in body) data.group_name = body.group_name || null;
    if ("is_active"  in body) data.is_active  = Boolean(body.is_active);
    if (body.password) {
      if (String(body.password).length < 6)
        return NextResponse.json({ error: "Şifrə minimum 6 simvol olmalıdır" }, { status: 400 });
      data.password         = await hashPassword(String(body.password));
      data.display_password = String(body.password);
    }

    const student = await db.student.update({ where: { id }, data,
      select: { id: true, name: true, email: true, class_name: true, group_name: true, is_active: true },
    });
    return NextResponse.json({ student });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("P2025")) return NextResponse.json({ error: "Şagird tapılmadı" }, { status: 404 });
    if (msg.includes("P2002")) return NextResponse.json({ error: "Bu e-poçt artıq istifadə olunur" }, { status: 409 });
    return NextResponse.json({ error: "Server xətası" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await verifyTeacher(req))) return NextResponse.json({ error: "Icazə yoxdur" }, { status: 401 });

  const { id } = await params;
  try {
    await db.student.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Şagird tapılmadı" }, { status: 404 });
  }
}
