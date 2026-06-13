import { db } from "@/lib/db";

export async function getGradeBySlug(slug: string) {
  try {
    return await db.grade.findUnique({
      where: { slug },
      include: {
        subjects: { include: { subject: true }, orderBy: { subject_id: "asc" } },
      },
    });
  } catch {
    return null;
  }
}

export async function getCurriculumItems(gradeSlug: string, subjectSlug: string) {
  try {
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
  } catch {
    return [];
  }
}

export type CurriculumItemRow = Awaited<ReturnType<typeof getCurriculumItems>>[number];

export async function getCurriculumItem(
  gradeSlug: string,
  subjectSlug: string,
  topicSlug: string,
) {
  try {
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
  } catch {
    return null;
  }
}
