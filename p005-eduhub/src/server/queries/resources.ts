import { db } from "@/lib/db";
import type { ResourceType } from "@/generated/prisma/client";

export async function getResourcesByTopic(
  gradeSlug: string,
  subjectSlug: string,
  topicSlug: string,
  type?: ResourceType,
) {
  try {
    return await db.resource.findMany({
      where: {
        is_published: true,
        curriculum_item: {
          slug: topicSlug,
          grade_subject: {
            grade:   { slug: gradeSlug },
            subject: { slug: subjectSlug },
          },
        },
        ...(type ? { type } : {}),
      },
      select: {
        id: true, slug: true, type: true,
        title_az: true, title_ru: true,
        content_url: true, metadata: true, created_at: true,
      },
      orderBy: [{ type: "asc" }, { created_at: "asc" }],
    });
  } catch {
    return [];
  }
}

export async function getResourceBySlug(
  gradeSlug: string,
  subjectSlug: string,
  topicSlug: string,
  resourceSlug: string,
) {
  try {
    return await db.resource.findFirst({
      where: {
        slug: resourceSlug,
        curriculum_item: {
          slug: topicSlug,
          grade_subject: {
            grade:   { slug: gradeSlug },
            subject: { slug: subjectSlug },
          },
        },
      },
    });
  } catch {
    return null;
  }
}

export type ResourceRow = Awaited<ReturnType<typeof getResourcesByTopic>>[number];
