"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type GradeItem = { number: number; slug: string; label_az: string };

export function AppSidebar({ grades }: { grades: GradeItem[] }) {
  const pathname = usePathname();
  const router   = useRouter();

  const gradeSlug = pathname.match(/\/classes\/([^/]+)/)?.[1];

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth/login");
  }

  function isActive(href: string) { return pathname === href; }
  function isPrefix(href: string) { return pathname.startsWith(href); }

  const navLink = (href: string, icon: string, label: string, exact = false) => (
    <Link key={href} href={href}
      className={cn(
        "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
        (exact ? isActive(href) : isPrefix(href))
          ? "bg-indigo-600/20 text-indigo-300 font-medium border border-indigo-500/20"
          : "text-slate-400 hover:bg-slate-800 hover:text-slate-200",
      )}>
      <span className="text-base">{icon}</span>
      <span>{label}</span>
    </Link>
  );

  return (
    <aside className="hidden lg:flex lg:flex-col w-64 shrink-0 bg-slate-900 border-r border-slate-800/70">

      {/* Logo */}
      <div className="px-5 py-4 border-b border-slate-800/70 shrink-0">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">E</div>
          <div>
            <p className="text-sm font-bold text-white leading-none">EduHub</p>
            <p className="text-xs text-slate-500 mt-0.5">Müəllim Paneli</p>
          </div>
        </Link>
      </div>

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">

        {/* Overview */}
        <div className="mb-1">
          <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-700">
            Ümumi baxış
          </p>
          {navLink("/dashboard", "🏠", "İcmal", true)}
          {navLink("/dashboard/results", "📋", "Nəticələr")}
          {navLink("/dashboard/students", "👥", "Şagird fəaliyyəti")}
          {navLink("/dashboard/analytics", "📊", "Analitika")}
          {navLink("/dashboard/progress", "📈", "Proqres")}
        </div>

        {/* Grades */}
        <div>
          <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
            Siniflər
          </p>

          {grades.length === 0 && (
            <p className="px-3 py-2 text-xs text-slate-600 italic">Sinif yoxdur</p>
          )}

          {grades.map((grade) => {
            const active = gradeSlug === grade.slug;
            return (
              <div key={grade.slug}>
                <Link
                  href={`/dashboard/classes/${grade.slug}`}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                    active
                      ? "bg-indigo-600/20 text-indigo-300 font-medium border border-indigo-500/20"
                      : "text-slate-400 hover:bg-slate-800 hover:text-slate-200",
                  )}>
                  <span>{grade.label_az}</span>
                  {active && <span className="text-indigo-400 text-xs">▾</span>}
                </Link>
              </div>
            );
          })}

          <Link href="/dashboard/classes"
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors mt-0.5",
              isActive("/dashboard/classes")
                ? "text-indigo-400"
                : "text-slate-600 hover:text-slate-400",
            )}>
            + Bütün siniflər
          </Link>
        </div>

        {/* Management */}
        <div className="pt-3">
          <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
            İdarəetmə
          </p>
          {[
            { href: "/dashboard/manage/subjects",    icon: "📚", label: "Fənlər" },
            { href: "/dashboard/manage/students",    icon: "👥", label: "Şagirdlər" },
            { href: "/dashboard/manage/teachers",    icon: "👨‍🏫", label: "Müəllimlər" },
            { href: "/dashboard/manage/assignments", icon: "📋", label: "Tə'yinatlar" },
          ].map(({ href, icon, label }) => navLink(href, icon, label))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-slate-800/70 shrink-0 space-y-0.5">
        {navLink("/dashboard/manage/settings", "⚙️", "Tənzimləmələr")}
        {navLink("/", "🏠", "Ana Səhifə")}
        <button onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-red-950/40 hover:text-red-400 transition-colors">
          <span className="text-base">🚪</span>
          <span>Çıxış</span>
        </button>
      </div>
    </aside>
  );
}
