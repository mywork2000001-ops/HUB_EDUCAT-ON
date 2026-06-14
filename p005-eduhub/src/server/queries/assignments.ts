import { db } from "@/lib/db";

// CONTRACT: studentId, className, groupName MUST come from a verified JWT payload,
// never from raw URL params. Callers that violate this allow class-name spoofing.
export async function getAssignedTopicIds(
  studentId: string,
  className: string,
  groupName: string | null,
): Promise<Set<number>> {
  const orClauses: object[] = [
    { class_name: className, group_name: null },
    { student_id: studentId },
  ];
  if (groupName) {
    orClauses.push({ class_name: className, group_name: groupName });
  }

  const rows = await db.assignment.findMany({
    where: {
      AND: [
        { OR: orClauses },
        { NOT: { status: "CLOSED" } },
      ],
    },
    select: { item_id: true },
  });
  return new Set(rows.map((r) => r.item_id));
}

export async function getStudentSchedule(
  studentId: string,
  className: string,
  groupName: string | null,
) {
  const orClauses: object[] = [
    { class_name: className, group_name: null },
    { student_id: studentId },
  ];
  if (groupName) {
    orClauses.push({ class_name: className, group_name: groupName });
  }

  try {
    return await db.assignment.findMany({
      where: {
        OR: orClauses,
        due_date: { gte: new Date(Date.now() - 24 * 3600 * 1000) },
      },
      include: {
        item: {
          include: {
            parent:        { select: { slug: true } },
            grade_subject: { include: { grade: true, subject: true } },
            resources: {
              where:   { is_published: true },
              orderBy: { id: "asc" },
              take:    1,
              select:  { slug: true, type: true },
            },
          },
        },
      },
      orderBy: { due_date: "asc" },
      take: 20,
    });
  } catch {
    return [];
  }
}

// ── Student curriculum tree (for Algorithmics-style /learn view) ──────────────
export type CurriculumResource = {
  id: number; type: string; slug: string;
  title_az: string; title_ru: string; content_url: string | null;
};
export type CurriculumLesson = {
  id: number; title_az: string; title_ru: string; slug: string; order_index: number;
  gradeSlug: string; subjectSlug: string; parentSlug: string;
  resources: CurriculumResource[];
};
export type CurriculumModule = {
  id: number; title_az: string; title_ru: string; slug: string; order_index: number;
  lessons: CurriculumLesson[];
};
export type CurriculumSubject = {
  slug: string; label_az: string; label_ru: string; icon: string | null; gradeSlug: string;
  modules: CurriculumModule[];
};

export async function getStudentCurriculumTree(
  studentId: string,
  className: string,
  groupName: string | null,
): Promise<CurriculumSubject[]> {
  const assignedIds = await getAssignedTopicIds(studentId, className, groupName);
  if (assignedIds.size === 0) return [];

  const items = await db.curriculumItem.findMany({
    where: { id: { in: [...assignedIds] } },
    include: {
      parent: true,
      grade_subject: { include: { grade: true, subject: true } },
      resources: {
        where:   { is_published: true },
        orderBy: { id: "asc" },
        select:  { id: true, type: true, slug: true, title_az: true, title_ru: true, content_url: true },
      },
      children: {
        orderBy: { order_index: "asc" },
        include: {
          resources: {
            where:   { is_published: true },
            orderBy: { id: "asc" },
            select:  { id: true, type: true, slug: true, title_az: true, title_ru: true, content_url: true },
          },
        },
      },
    },
    orderBy: { order_index: "asc" },
  });

  const sMap = new Map<string, { data: Omit<CurriculumSubject, "modules">; mMap: Map<number, CurriculumModule> }>();

  function ensureSubj(slug: string, label_az: string, label_ru: string, icon: string | null, gradeSlug: string) {
    if (!sMap.has(slug)) sMap.set(slug, { data: { slug, label_az, label_ru, icon, gradeSlug }, mMap: new Map() });
    return sMap.get(slug)!;
  }
  function ensureMod(s: ReturnType<typeof ensureSubj>, id: number, title_az: string, title_ru: string, slug: string, order_index: number) {
    if (!s.mMap.has(id)) s.mMap.set(id, { id, title_az, title_ru, slug, order_index, lessons: [] });
    return s.mMap.get(id)!;
  }

  for (const item of items) {
    const { grade, subject } = item.grade_subject;
    const s = ensureSubj(subject.slug, subject.label_az, subject.label_ru, subject.icon, grade.slug);

    if (item.parent_id == null) {
      // Item IS the module — add all its children as lessons
      const mod = ensureMod(s, item.id, item.title_az, item.title_ru, item.slug, item.order_index);
      for (const child of item.children) {
        if (!mod.lessons.find(l => l.id === child.id)) {
          mod.lessons.push({
            id:          child.id,
            title_az:    child.title_az,
            title_ru:    child.title_ru,
            slug:        child.slug,
            order_index: child.order_index,
            gradeSlug:   grade.slug,
            subjectSlug: subject.slug,
            parentSlug:  item.slug,
            resources:   child.resources.map(r => ({ ...r, type: r.type as string })),
          });
        }
      }
    } else {
      // Item IS a lesson — group under its parent module
      const parent = item.parent!;
      const mod = ensureMod(s, parent.id, parent.title_az, parent.title_ru, parent.slug, parent.order_index);
      if (!mod.lessons.find(l => l.id === item.id)) {
        mod.lessons.push({
          id:          item.id,
          title_az:    item.title_az,
          title_ru:    item.title_ru,
          slug:        item.slug,
          order_index: item.order_index,
          gradeSlug:   grade.slug,
          subjectSlug: subject.slug,
          parentSlug:  parent.slug,
          resources:   item.resources.map(r => ({ ...r, type: r.type as string })),
        });
      }
    }
  }

  return [...sMap.values()].map(({ data, mMap }) => ({
    ...data,
    modules: [...mMap.values()]
      .sort((a, b) => a.order_index - b.order_index)
      .map(m => ({ ...m, lessons: m.lessons.sort((a, b) => a.order_index - b.order_index) })),
  }));
}
