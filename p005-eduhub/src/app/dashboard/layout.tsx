import { AppSidebar } from "@/components/layout/AppSidebar";
import { db } from "@/lib/db";

async function getAvailableGrades() {
  try {
    return await db.grade.findMany({
      where:   { number: { lte: 11 } },   // exclude Abiturient(12), Müəllim(13)
      orderBy: { number: "asc" },
      select: { number: true, slug: true, label_az: true },
    });
  } catch { return []; }
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const grades = await getAvailableGrades();
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <AppSidebar grades={grades} />
      <div className="flex-1 overflow-y-auto min-w-0">{children}</div>
    </div>
  );
}
