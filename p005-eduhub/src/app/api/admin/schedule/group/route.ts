import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyTeacher } from "@/lib/verify-teacher";

// GET — all curriculum items for grade+subject with assignment state for class+group
export async function GET(req: NextRequest) {
  if (!(await verifyTeacher(req)))
    return NextResponse.json({ error: "Icazə yoxdur" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const className   = searchParams.get("class")   ?? "";
  const groupName   = searchParams.get("group")   ?? "";
  const gradeSlug   = searchParams.get("grade")   ?? "";
  const subjectSlug = searchParams.get("subject") ?? "";

  if (!gradeSlug || !subjectSlug || !className)
    return NextResponse.json({ modules: [] });

  const [items, assignments] = await Promise.all([
    db.curriculumItem.findMany({
      where: {
        grade_subject: {
          grade:   { slug: gradeSlug },
          subject: { slug: subjectSlug },
        },
      },
      orderBy: { order_index: "asc" },
    }),
    db.assignment.findMany({
      where: groupName
        ? { class_name: className, group_name: groupName, student_id: null }
        : { class_name: className, group_name: null,      student_id: null },
      select: { item_id: true, due_date: true, status: true },
    }),
  ]);

  const assignMap = new Map(assignments.map(a => [a.item_id, a]));

  const parents  = items.filter(i => i.parent_id == null);
  const children = items.filter(i => i.parent_id != null);

  const modules = parents.map((p, pi) => ({
    id:       p.id,
    title_az: p.title_az,
    order:    pi + 1,
    lessons:  children
      .filter(c => c.parent_id === p.id)
      .sort((a, b) => a.order_index - b.order_index)
      .map((c, ci) => {
        const a = assignMap.get(c.id);
        return {
          id:       c.id,
          title_az: c.title_az,
          order:    ci + 1,
          code:     `M${pi + 1}D${ci + 1}`,
          due_date: a?.due_date?.toISOString() ?? null,
          status:   a?.status ?? "OPEN",
          enabled:  !!a,
        };
      }),
  }));

  return NextResponse.json({ modules });
}

// PUT — bulk upsert assignments with date + status
export async function PUT(req: NextRequest) {
  if (!(await verifyTeacher(req)))
    return NextResponse.json({ error: "Icazə yoxdur" }, { status: 401 });

  type ItemUpdate = {
    item_id:  number;
    enabled:  boolean;
    due_date: string | null;
    status:   string;
  };

  const body: {
    class_name: string;
    group_name: string | null;
    items:      ItemUpdate[];
  } = await req.json();

  const { class_name, group_name = null, items } = body;

  if (!class_name || !Array.isArray(items))
    return NextResponse.json({ error: "Parametrlər çatışmır" }, { status: 400 });

  for (const item of items) {
    const baseWhere = {
      class_name,
      group_name: group_name ?? null,
      student_id: null as string | null,
      item_id:    item.item_id,
    };

    if (!item.enabled) {
      await db.assignment.deleteMany({ where: baseWhere });
    } else {
      const due_date = item.due_date ? new Date(item.due_date) : null;
      const status   = item.status === "CLOSED" ? "CLOSED" : "OPEN";
      const existing = await db.assignment.findFirst({ where: baseWhere });
      if (existing) {
        await db.assignment.update({
          where: { id: existing.id },
          data:  { due_date, status },
        });
      } else {
        await db.assignment.create({
          data: { class_name, group_name, item_id: item.item_id, due_date, status },
        });
      }
    }
  }

  return NextResponse.json({ ok: true, count: items.length });
}
