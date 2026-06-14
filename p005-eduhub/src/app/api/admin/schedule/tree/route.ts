import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyTeacher } from "@/lib/verify-teacher";

export async function GET(req: NextRequest) {
  if (!(await verifyTeacher(req))) return NextResponse.json({ error: "Icazə yoxdur" }, { status: 401 });

  const url         = new URL(req.url);
  const gradeSlug   = url.searchParams.get("grade")   ?? "";
  const subjectSlug = url.searchParams.get("subject") ?? "";

  if (!gradeSlug || !subjectSlug) return NextResponse.json({ modules: [] });

  const items = await db.curriculumItem.findMany({
    where: {
      grade_subject: {
        grade:   { slug: gradeSlug },
        subject: { slug: subjectSlug },
      },
    },
    include: {
      resources: {
        where:   { is_published: true },
        orderBy: { id: "asc" },
        select:  { id: true, type: true, title_az: true, title_ru: true, slug: true },
      },
    },
    orderBy: { order_index: "asc" },
  }).catch(() => []);

  const parents  = items.filter(i => i.parent_id == null);
  const children = items.filter(i => i.parent_id != null);

  const modules = parents.map((p, pi) => ({
    id:       p.id,
    title_az: p.title_az,
    title_ru: p.title_ru,
    slug:     p.slug,
    order:    pi + 1,
    lessons:  children
      .filter(c => c.parent_id === p.id)
      .map((c, ci) => ({
        id:        c.id,
        title_az:  c.title_az,
        title_ru:  c.title_ru,
        slug:      c.slug,
        order:     ci + 1,
        resources: c.resources.map(r => ({
          id:       r.id,
          type:     r.type as string,
          title_az: r.title_az,
          slug:     r.slug,
        })),
      })),
  }));

  return NextResponse.json({ modules });
}
