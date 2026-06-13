import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyTeacher } from "@/lib/verify-teacher";

export async function GET(req: NextRequest) {
  if (!(await verifyTeacher(req))) return NextResponse.json({ error: "Icazə yoxdur" }, { status: 401 });
  try {
    const topics = await db.curriculumItem.findMany({
      where:   { parent_id: null },
      orderBy: [{ grade_id: "asc" }, { subject_id: "asc" }, { order_index: "asc" }],
      select:  {
        id: true,
        title_az: true,
        slug: true,
        order_index: true,
        grade_subject: {
          select: {
            grade:   { select: { label_az: true } },
            subject: { select: { label_az: true, slug: true } },
          },
        },
      },
    });
    return NextResponse.json({ topics });
  } catch {
    return NextResponse.json({ error: "Server xətası" }, { status: 500 });
  }
}
