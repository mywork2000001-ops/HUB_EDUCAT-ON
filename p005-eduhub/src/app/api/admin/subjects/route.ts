import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyTeacher } from "@/lib/verify-teacher";

export async function GET(req: NextRequest) {
  if (!(await verifyTeacher(req))) return NextResponse.json({ error: "Icazə yoxdur" }, { status: 401 });
  try {
    const [grades, allSubjects] = await Promise.all([
      db.grade.findMany({
        orderBy: { number: "asc" },
        include: {
          subjects: { include: { subject: true }, orderBy: { subject_id: "asc" } },
        },
      }),
      db.subject.findMany({ orderBy: { label_az: "asc" } }),
    ]);
    return NextResponse.json({ grades, allSubjects });
  } catch {
    return NextResponse.json({ error: "Server xətası" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await verifyTeacher(req))) return NextResponse.json({ error: "Icazə yoxdur" }, { status: 401 });
  try {
    const { grade_id, subject_id, label_az, label_ru, slug, icon } = await req.json();
    if (!grade_id) return NextResponse.json({ error: "grade_id tələb olunur" }, { status: 400 });

    let subjectId = subject_id ? Number(subject_id) : null;

    if (!subjectId) {
      if (!label_az || !slug)
        return NextResponse.json({ error: "Fənn adı (AZ) və slug tələb olunur" }, { status: 400 });
      const created = await db.subject.create({
        data: {
          slug: String(slug).trim().toLowerCase(),
          label_az: String(label_az).trim(),
          label_ru: label_ru ? String(label_ru).trim() : String(label_az).trim(),
          icon: icon ? String(icon).trim() : null,
        },
      });
      subjectId = created.id;
    }

    await db.gradeSubject.create({ data: { grade_id: Number(grade_id), subject_id: subjectId } });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("P2002")) return NextResponse.json({ error: "Bu fənn artıq bu sinifdə mövcuddur" }, { status: 409 });
    return NextResponse.json({ error: "Server xətası" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await verifyTeacher(req))) return NextResponse.json({ error: "Icazə yoxdur" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const gradeId   = Number(searchParams.get("grade_id"));
  const subjectId = Number(searchParams.get("subject_id"));
  if (!gradeId || !subjectId)
    return NextResponse.json({ error: "grade_id və subject_id tələb olunur" }, { status: 400 });
  try {
    await db.gradeSubject.delete({
      where: { grade_id_subject_id: { grade_id: gradeId, subject_id: subjectId } },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Tapılmadı" }, { status: 404 });
  }
}
