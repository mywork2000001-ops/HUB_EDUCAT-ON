import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/student-auth";
import { verifyTeacher } from "@/lib/verify-teacher";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!verifyTeacher(req)) return NextResponse.json({ error: "Icazə yoxdur" }, { status: 401 });

  const { id } = await params;
  try {
    const body = await req.json();
    const data: Record<string, unknown> = {};

    if (body.name)       data.name       = body.name;
    if (body.email)      data.email      = body.email.toLowerCase().trim();
    if (body.class_name) data.class_name = body.class_name;
    if ("group_name" in body) data.group_name = body.group_name || null;
    if ("is_active"  in body) data.is_active  = body.is_active;
    if (body.password)   data.password   = await hashPassword(body.password);

    const student = await db.student.update({ where: { id }, data,
      select: { id: true, name: true, email: true, class_name: true, group_name: true, is_active: true },
    });
    return NextResponse.json({ student });
  } catch {
    return NextResponse.json({ error: "Server xətası" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!verifyTeacher(req)) return NextResponse.json({ error: "Icazə yoxdur" }, { status: 401 });

  const { id } = await params;
  await db.student.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
