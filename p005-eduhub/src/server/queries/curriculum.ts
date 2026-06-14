import { db } from "@/lib/db";

export async function getGradeBySlug(slug: string) {
  return await db.grade.findUnique({
    where: { slug },
    include: {
      subjects: { include: { subject: true }, orderBy: { subject_id: "asc" } },
    },
  });
}

export async function getCurriculumItems(gradeSlug: string, subjectSlug: string) {
  return await db.curriculumItem.findMany({
    where: {
      parent_id: null,
      grade_subject: {
        grade:   { slug: gradeSlug },
        subject: { slug: subjectSlug },
      },
    },
    include: {
      children: {
        orderBy: { order_index: "asc" },
        include: { _count: { select: { resources: true } } },
      },
      _count: { select: { resources: true } },
    },
    orderBy: { order_index: "asc" },
  });
}

export type CurriculumItemRow = Awaited<ReturnType<typeof getCurriculumItems>>[number];

export async function getCurriculumItem(
  gradeSlug: string,
  subjectSlug: string,
  topicSlug: string,
) {
  // findFirst is intentional: the unique key uses grade_id+subject_id+slug (IDs), but
  // we filter by grade.slug + subject.slug (strings). The DB @@unique ensures there's
  // at most one match; findFirst returns it or null — no ambiguity in practice.
  return await db.curriculumItem.findFirst({
    where: {
      slug: topicSlug,
      grade_subject: {
        grade:   { slug: gradeSlug },
        subject: { slug: subjectSlug },
      },
    },
    include: {
      grade_subject: {
        include: { grade: true, subject: true },
      },
    },
  });
}
