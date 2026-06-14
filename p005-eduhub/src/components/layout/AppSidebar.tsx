"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { LiveClock } from "@/components/ui/LiveClock";
import { useTeacherLang, type Lang } from "@/hooks/useTeacherLang";

type GradeItem = { number: number; slug: string; label_az: string };

const LABELS = {
  az: {
    panel:       "Müəllim Paneli",
    overview:    "Ümumi baxış",
    icmal:       "İcmal",
    platforms:   "Platformalar",
    dersler:     "Dərslər və Testlər",
    neticeler:   "Nəticələr",
    sagird_act:  "Şagird fəaliyyəti",
    analitika:   "Analitika",
    proqres:     "Proqres",
    sinfler:     "Siniflər",
    all_classes: "+ Bütün siniflər",
    planning:    "Planlaşdırma",
    schedule:    "Həftəlik Cədvəl",
    assignments: "Tə'yinatlar",
    manage:      "İdarəetmə",
    cls_groups:  "Siniflər & Qruplar",
    subjects:    "Fənlər",
    students:    "Şagirdlər",
    teachers:    "Müəllimlər",
    resources:   "Video Resurslar",
    settings:    "Tənzimləmələr",
    home:        "Ana Səhifə",
    logout:      "Çıxış",
  },
  ru: {
    panel:       "Панель учителя",
    overview:    "Обзор",
    icmal:       "Главная",
    platforms:   "Платформы",
    dersler:     "Уроки и Тесты",
    neticeler:   "Результаты",
    sagird_act:  "Активность учеников",
    analitika:   "Аналитика",
    proqres:     "Прогресс",
    sinfler:     "Классы",
    all_classes: "+ Все классы",
    planning:    "Планирование",
    schedule:    "Недельное расписание",
    assignments: "Назначения",
    manage:      "Управление",
    cls_groups:  "Классы и Группы",
    subjects:    "Предметы",
    students:    "Ученики",
    teachers:    "Учителя",
    resources:   "Видео ресурсы",
    settings:    "Настройки",
    home:        "Главная страница",
    logout:      "Выйти",
  },
} as const;

export function AppSidebar({ grades }: { grades: GradeItem[] }) {
  const pathname   = usePathname();
  const router     = useRouter();
  const [lang, setLang] = useTeacherLang();
  const t          = LABELS[lang];

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
            <p className="text-[11px] text-slate-400 mt-0.5">{t.panel}</p>
          </div>
        </Link>
      </div>

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">

        {sectionLabel(t.overview)}
        {navLink("/dashboard",           "🏠", t.icmal,      true)}
        {navLink("/dashboard/platforms", "🚀", t.platforms)}
        {navLink("/dashboard/content",   "📚", t.dersler)}
        {navLink("/dashboard/results",   "📋", t.neticeler)}
        {navLink("/dashboard/students",  "👥", t.sagird_act)}
        {navLink("/dashboard/analytics", "📊", t.analitika)}
        {navLink("/dashboard/progress",  "📈", t.proqres)}

        {sectionLabel(t.sinfler)}

        {grades.length === 0 && (
          <p className="px-3 py-2 text-xs text-slate-400 italic">—</p>
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
          {t.all_classes}
        </Link>

        {sectionLabel(t.planning)}
        {navLink("/dashboard/schedule",            "📅", t.schedule)}
        {navLink("/dashboard/manage/assignments",  "📋", t.assignments)}

        {sectionLabel(t.manage)}
        {navLink("/dashboard/manage/classes",    "🏫", t.cls_groups)}
        {navLink("/dashboard/manage/subjects",   "📚", t.subjects)}
        {navLink("/dashboard/manage/students",   "👥", t.students)}
        {navLink("/dashboard/manage/teachers",   "👨‍🏫", t.teachers)}
        {navLink("/dashboard/manage/resources",  "🎬", t.resources)}
      </nav>

      {/* Footer */}
      <div className="px-2 py-3 border-t border-slate-200 shrink-0 space-y-0.5">

        {/* Live clock */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg">
          <span className="text-base leading-none">🕐</span>
          <LiveClock className="text-sm text-slate-600" showDate />
        </div>

        {/* Language toggle */}
        <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg">
          <span className="text-base leading-none">🌐</span>
          <div className="flex gap-1 ml-1">
            {(["az", "ru"] as Lang[]).map((l) => (
              <button key={l} onClick={() => setLang(l)}
                className={cn(
                  "px-2.5 py-1 rounded-md text-xs font-bold transition-all border",
                  lang === l
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600",
                )}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {navLink("/dashboard/manage/settings", "⚙️", t.settings)}
        {navLink("/", "🏠", t.home)}
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
                     text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all">
          <span className="text-base leading-none">🚪</span>
          <span>{t.logout}</span>
        </button>
      </div>
    </aside>
  );
}
