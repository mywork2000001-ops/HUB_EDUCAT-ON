"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { LiveClock } from "@/components/ui/LiveClock";

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
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
        (exact ? isActive(href) : isPrefix(href))
          ? "bg-indigo-50 text-indigo-700"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
      )}>
      <span className="text-base leading-none">{icon}</span>
      <span>{label}</span>
    </Link>
  );

  const sectionLabel = (text: string) => (
    <p className="px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
      {text}
    </p>
  );

  return (
    <aside className="hidden lg:flex lg:flex-col w-60 shrink-0 bg-white border-r border-slate-200">

      {/* Logo */}
      <div className="px-4 py-4 border-b border-slate-200 shrink-0">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center
                          text-white font-bold text-sm shadow-sm">
            E
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 leading-none">EduHub</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Müəllim Paneli</p>
          </div>
        </Link>
      </div>

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">

        {sectionLabel("Ümumi baxış")}
        {navLink("/dashboard", "🏠", "İcmal", true)}
        {navLink("/dashboard/content", "📚", "Dərslər və Testlər")}
        {navLink("/dashboard/results", "📋", "Nəticələr")}
        {navLink("/dashboard/students", "👥", "Şagird fəaliyyəti")}
        {navLink("/dashboard/analytics", "📊", "Analitika")}
        {navLink("/dashboard/progress", "📈", "Proqres")}

        {sectionLabel("Siniflər")}

        {grades.length === 0 && (
          <p className="px-3 py-2 text-xs text-slate-400 italic">Sinif yoxdur</p>
        )}

        {grades.map((grade) => {
          const active = gradeSlug === grade.slug;
          return (
            <Link key={grade.slug}
              href={`/dashboard/classes/${grade.slug}`}
              className={cn(
                "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all",
                active
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              )}>
              <span>{grade.label_az}</span>
              {active && <span className="text-indigo-400 text-xs">▾</span>}
            </Link>
          );
        })}

        <Link href="/dashboard/classes"
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all mt-0.5",
            isActive("/dashboard/classes")
              ? "text-indigo-600"
              : "text-slate-400 hover:text-slate-700 hover:bg-slate-100",
          )}>
          + Bütün siniflər
        </Link>

        {sectionLabel("Planlaşdırma")}
        {navLink("/dashboard/schedule", "📅", "Həftəlik Cədvəl")}
        {navLink("/dashboard/manage/assignments", "📋", "Tə'yinatlar")}

        {sectionLabel("İdarəetmə")}
        {[
          { href: "/dashboard/manage/subjects",    icon: "📚", label: "Fənlər" },
          { href: "/dashboard/manage/students",    icon: "👥", label: "Şagirdlər" },
          { href: "/dashboard/manage/teachers",    icon: "👨‍🏫", label: "Müəllimlər" },
        ].map(({ href, icon, label }) => navLink(href, icon, label))}
      </nav>

      {/* Footer */}
      <div className="px-2 py-3 border-t border-slate-200 shrink-0 space-y-0.5">
        {/* Live clock */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg">
          <span className="text-base leading-none">🕐</span>
          <LiveClock className="text-sm text-slate-600" showDate />
        </div>
        {navLink("/dashboard/manage/settings", "⚙️", "Tənzimləmələr")}
        {navLink("/", "🏠", "Ana Səhifə")}
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
                     text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all">
          <span className="text-base leading-none">🚪</span>
          <span>Çıxış</span>
        </button>
      </div>
    </aside>
  );
}
