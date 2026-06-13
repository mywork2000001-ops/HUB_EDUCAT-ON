import { AppSidebar } from "@/components/layout/AppSidebar";
import { db } from "@/lib/db";

async function getAvailableGrades() {
  try {
    const grades = await db.grade.findMany({
      orderBy: { number: "asc" },
      select: { number: true, slug: true, label_az: true },
    });
    return grades;
  } catch {
    return [];
  }
}

export default async function ClassesLayout({ children }: { children: React.ReactNode }) {
  const grades = await getAvailableGrades();
  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">
      <AppSidebar grades={grades} />
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
