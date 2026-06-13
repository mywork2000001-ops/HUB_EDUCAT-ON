import { db } from "@/lib/db";

export async function getAssignedTopicIds(
  studentId: string,
  className: string,
  groupName: string | null,
): Promise<Set<number>> {
  try {
    const orClauses: object[] = [
      { class_name: className, group_name: null },
      { student_id: studentId },
    ];
    if (groupName) {
      orClauses.push({ class_name: className, group_name: groupName });
    }

    const rows = await db.assignment.findMany({
      where: { OR: orClauses },
      select: { item_id: true },
    });
    return new Set(rows.map((r) => r.item_id));
  } catch {
    return new Set();
  }
}

export async function getStudentSchedule(
  studentId: string,
  className: string,
  groupName: string | null,
) {
  try {
    const orClauses: object[] = [
      { class_name: className, group_name: null },
      { student_id: studentId },
    ];
    if (groupName) {
      orClauses.push({ class_name: className, group_name: groupName });
    }

    const rows = await db.assignment.findMany({
      where: {
        OR: orClauses,
        due_date: { gte: new Date(Date.now() - 24 * 3600 * 1000) },
      },
      include: {
        item: {
          include: {
            grade_subject: { include: { grade: true, subject: true } },
          },
        },
      },
      orderBy: { due_date: "asc" },
      take: 20,
    });
    return rows;
  } catch {
    return [];
  }
}
