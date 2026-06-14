import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyTeacher } from "@/lib/verify-teacher";

const MAX_ITEM_IDS = 500;

function buildWhere(
  class_name: string | null,
  group_name: string | null,
  student_id: string | null,
) {
  if (student_id)               return { student_id };
  if (group_name && class_name) return { class_name, group_name };
  return { class_name, group_name: null };
}

export async function GET(req: NextRequest) {
  if (!(await verifyTeacher(req))) return NextResponse.json({ error: "Icazə yoxdur" }, { status: 401 });

  const url        = new URL(req.url);
  const class_name = url.searchParams.get("class")   || null;
  const group_name = url.searchParams.get("group")   || null;
  const student_id = url.searchParams.get("student") || null;

  if (!class_name && !student_id) return NextResponse.json({ assignedItemIds: [] });

  const rows = await db.assignment.findMany({
    where:  buildWhere(class_name, group_name, student_id),
    select: { item_id: true },
  }).catch(() => []);

  return NextResponse.json({ assignedItemIds: rows.map(r => r.item_id) });
}

export async function PUT(req: NextRequest) {
  if (!(await verifyTeacher(req))) return NextResponse.json({ error: "Icazə yoxdur" }, { status: 401 });

  const body = await req.json() as {
    class_name?: string; group_name?: string; student_id?: string;
    item_ids: number[]; due_date?: string;
  };
  const {
    class_name = null, group_name = null, student_id = null,
    item_ids = [], due_date,
  } = body;

  if (!class_name && !student_id)
    return NextResponse.json({ error: "Hədəf tələb olunur" }, { status: 400 });

  if (!Array.isArray(item_ids) || item_ids.length > MAX_ITEM_IDS)
    return NextResponse.json(
      { error: `item_ids maks ${MAX_ITEM_IDS} element ola bilər` },
      { status: 400 },
    );

  // Validate due_date before any DB work
  let parsedDueDate: Date | null = null;
  if (due_date) {
    parsedDueDate = new Date(due_date);
    if (isNaN(parsedDueDate.getTime()))
      return NextResponse.json({ error: "due_date formatı yanlışdır" }, { status: 400 });
  }

  const where    = buildWhere(class_name, group_name, student_id);
  const existing = await db.assignment.findMany({ where, select: { id: true, item_id: true } });
  const existSet = new Set(existing.map(a => a.item_id));
  const newSet   = new Set(item_ids);

  const toAdd    = [...newSet].filter(id => !existSet.has(id));
  const toRemove = existing.filter(a => !newSet.has(a.item_id)).map(a => a.id);

  if (toAdd.length > 0 || toRemove.length > 0) {
    await db.$transaction([
      ...(toRemove.length > 0
        ? [db.assignment.deleteMany({ where: { id: { in: toRemove } } })]
        : []),
      ...(toAdd.length > 0
        ? [db.assignment.createMany({
            data: toAdd.map(item_id => ({
              item_id,
              class_name:  student_id ? null : class_name,
              group_name:  student_id ? null : (group_name || null),
              student_id:  student_id || null,
              due_date:    parsedDueDate,
            })),
            skipDuplicates: true,
          })]
        : []),
    ]);
  }

  return NextResponse.json({ ok: true, added: toAdd.length, removed: toRemove.length });
}
