import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyTeacher } from "@/lib/verify-teacher";

export async function GET(req: NextRequest) {
  if (!verifyTeacher(req)) return NextResponse.json({ error: "Icazə yoxdur" }, { status: 401 });

  const assignments = await db.assignment.findMany({
    orderBy: { created_at: "desc" },
    include: {
      item:    { select: { title_az: true, slug: true } },
      student: { select: { name: true, email: true } },
    },
  });
  return NextResponse.json({ assignments });
}

export async function POST(req: NextRequest) {
  if (!verifyTeacher(req)) return NextResponse.json({ error: "Icazə yoxdur" }, { status: 401 });

  try {
    const { item_id, class_name, group_name, student_id, due_date, note } = await req.json();
    if (!item_id || (!class_name && !student_id))
      return NextResponse.json({ error: "item_id və hədəf (sinif/şagird) tələb olunur" }, { status: 400 });

    const assignment = await db.assignment.create({
      data: { item_id, class_name: class_name || null, group_name: group_name || null,
              student_id: student_id || null, due_date: due_date ? new Date(due_date) : null, note: note || null },
      include: { item: { select: { title_az: true } } },
    });
    return NextResponse.json({ assignment }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server xətası" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!verifyTeacher(req)) return NextResponse.json({ error: "Icazə yoxdur" }, { status: 401 });

  const idStr = new URL(req.url).searchParams.get("id");
  const id = Number(idStr);
  if (!idStr || isNaN(id) || id <= 0)
    return NextResponse.json({ error: "Düzgün id tələb olunur" }, { status: 400 });
  try {
    await db.assignment.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Tə'yinat tapılmadı" }, { status: 404 });
  }
}
