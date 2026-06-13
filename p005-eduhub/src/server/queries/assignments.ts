import { db } from "@/lib/db";

export async function getAssignedTopicIds(
  studentId: string,
  className: string,
  groupName: string | null,
): Promise<Set<number>> {
  try {
    const orClauses: object[] = [
      // Whole-class assignments (no group restriction) for this student's class
      { class_name: className, group_name: null },
      // Individual assignments for this specific student
      { student_id: studentId },
    ];
    if (groupName) {
      // Group assignments must match BOTH the class AND the group
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
