import { db } from "@/lib/db";

export async function getAssignedTopicIds(
  studentId: string,
  className: string,
  groupName: string | null,
): Promise<Set<number>> {
  try {
    const orClauses: object[] = [{ class_name: className }];
    if (groupName) orClauses.push({ group_name: groupName });
    orClauses.push({ student_id: studentId });

    const rows = await db.assignment.findMany({
      where: { OR: orClauses },
      select: { item_id: true },
    });
    return new Set(rows.map((r) => r.item_id));
  } catch {
    return new Set();
  }
}
