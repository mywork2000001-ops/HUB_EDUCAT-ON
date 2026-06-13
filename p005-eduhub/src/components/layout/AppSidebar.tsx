"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { SUBJECTS } from "@/lib/constants";

type GradeItem = { number: number; slug: string; label_az: string };

function getActiveSegments(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  const idx = parts.indexOf("classes");
  return {
    gradeSlug:   idx >= 0 ? parts[idx + 1] : undefined,
    subjectSlug: idx >= 0 ? parts[idx + 2] : undefined,
  };
}

export function AppSidebar({ grades }: { grades: GradeItem[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const { gradeSlug: activeGrade, subjectSlug: activeSubject } = getActiveSegments(pathname);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth/login");
  }

  return (
    <aside className="hidden lg:flex lg:flex-col w-60 shrink-0 bg-slate-900 border-r border-slate-800 overflow-y-auto">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-slate-800">
        <Link href="/" className="block">
          <span className="text-lg font-bold text-indigo-400">EduHub</span>
        </Link>
        <p className="text-xs text-slate-500 mt-0.5">Tədris Platforması</p>
      </div>

      {/* Grades */}
      <nav className="flex-1 p-2 overflow-y-auto">
        <p className="px-2 py-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
          Siniflər
        </p>

        {grades.length === 0 && (
          <p className="px-3 py-2 text-xs text-slate-600 italic">Məlumat yoxdur</p>
        )}

        {grades.map((grade) => {
          const isActive = activeGrade === grade.slug;
          return (
            <div key={grade.slug}>
              <Link
                href={`/dashboard/classes/${grade.slug}`}
                className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors mb-0.5",
                  isActive
                    ? "bg-indigo-600 text-white font-medium"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200",
                )}
              >
                <span>{grade.label_az}</span>
                {isActive && <span className="text-indigo-300 text-xs">▾</span>}
              </Link>

              {isActive && (
                <div className="ml-4 border-l border-slate-700 pl-3 mb-1">
                  {SUBJECTS.map((sub) => (
                    <Link
                      key={sub.slug}
                      href={`/dashboard/classes/${grade.slug}/${sub.slug}`}
                      className={cn(
                        "flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors",
                        activeSubject === sub.slug
                          ? "text-indigo-400 font-semibold"
                          : "text-slate-500 hover:text-slate-300",
                      )}
                    >
                      <span>{sub.icon}</span>
                      {sub.label_az}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer links */}
      <div className="p-2 border-t border-slate-800 shrink-0">
        <Link
          href="/dashboard"
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
            pathname === "/dashboard"
              ? "bg-slate-800 text-slate-200"
              : "text-slate-500 hover:bg-slate-800 hover:text-slate-300",
          )}
        >
          <span>📊</span>
          <span>Müəllim Paneli</span>
        </Link>
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition-colors"
        >
          <span>🏠</span>
          <span>Ana Səhifə</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-500 hover:bg-red-900/30 hover:text-red-400 transition-colors mt-1"
        >
          <span>🚪</span>
          <span>Çıxış</span>
        </button>
      </div>
    </aside>
  );
}
