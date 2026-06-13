import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export default async function ClassesIndexPage() {
  const first = await db.grade.findFirst({ orderBy: { number: "asc" }, select: { slug: true } }).catch(() => null);
  if (first) redirect(`/dashboard/classes/${first.slug}`);
  redirect("/dashboard");
}
