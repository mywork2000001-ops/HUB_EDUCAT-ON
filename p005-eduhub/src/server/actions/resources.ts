"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { ResourceType, Prisma } from "@/generated/prisma/client";

interface CreateResourceInput {
  curriculum_id: number;
  type:          ResourceType;
  slug:          string;
  title_az:      string;
  title_ru:      string;
  content_url?:  string;
  metadata?:     Prisma.InputJsonValue;
}

export async function createResource(input: CreateResourceInput) {
  const resource = await db.resource.create({
    data: { ...input, is_published: true },
  });
  revalidatePath("/dashboard/classes");
  return resource;
}

export async function togglePublished(id: number, is_published: boolean) {
  const resource = await db.resource.update({
    where: { id },
    data: { is_published },
  });
  revalidatePath("/dashboard/classes");
  return resource;
}
