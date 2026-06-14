"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { LiveClock } from "@/components/ui/LiveClock";
import { useTeacherLang } from "@/hooks/useTeacherLang";

type GradeItem = { number: number; slug: string; label_az: string };

// ── Bilingual labels ─────────────────────────────────────────────────────────
const LABELS = {
  az: {
    panel:       "Müəllim Paneli",
    // sections
    s_main:      "Əsas",
    s_teach:     "Tədris Prosesi",
    s_classes:   "Siniflər",
    s_manage:    "İdarəetmə",
    // main
    icmal:       "İcmal",
    neticeler:   "Nəticələr",
    analitika:   "Analitika",
    proqres:     "Proqres",
    // teaching
    platforms:   "Platformalar",
    content:     "Məzmun",
    sagird_act:  "Şagird fəaliyyəti",
    cedvel:      "Həftəlik Cədvəl",
    // classes
    all_classes: "+ Bütün siniflər",
    // manage
    assignments: "Tə'yinatlar",
    cls_groups:  "Siniflər & Qruplar",
    students:    "Şagirdlər",
    teachers:    "Müəllimlər",
    subjects:    "Fənlər",
    resources:   "Video Resurslar",
    // footer
    settings:    "Tənzimləmələr",
    home:        "Ana Səhifə",
    logout:      "Çıxış",
  },
  ru: {
    panel:       "Панель учителя",
    s_main:      "Главная",
    s_teach:     "Учебный процесс",
    s_classes:   "Классы",
    s_manage:    "Управление",
    icmal:       "Обзор",
    neticeler:   "Результаты",
    analitika:   "Аналитика",
    proqres:     "Прогресс",
    platforms:   "Платформы",
    content:     "Материалы",
    sagird_act:  "Активность учеников",
    cedvel:      "Расписание",
    all_classes: "+ Все классы",
    assignments: "Назначения",
    cls_groups:  "Классы и Группы",
    students:    "Ученики",
    teachers:    "Учителя",
    subjects:    "Предметы",
    resources:   "Видео ресурсы",
    settings:    "Настройки",
    home:        "Главная страница",
    logout:      "Выйти",
  },
} as const;

// ── Component ────────────────────────────────────────────────────────────────
export function AppSidebar({ grades }: { grades: GradeItem[] }) {
  const pathname       = usePathname();
  const router         = useRouter();
  const [lang]         = useTeacherLang();
  const t              = LABELS[lang];
  const gradeSlug      = pathname.match(/\/classes\/([^/]+)/)?.[1];

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth/login");
  }

  const navLink = (href: string, icon: string, label: string, exact = false) => {
    const active = exact ? pathname === href : pathname.startsWith(href);
    return (
      <Link key={href} href={href}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
          active ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
        )}>
        <span className="text-[15px] leading-none">{icon}</span>
        <span>{label}</span>
      </Link>
    );
  };

  const sec = (text: string) => (
    <p className="px-3 pt-5 pb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400 select-none">
      {text}
    </p>
  );

  return (
    <aside className="hidden lg:flex lg:flex-col w-60 shrink-0 bg-white border-r border-slate-200">

      {/* ── Logo + Clock ── */}
      <div className="px-4 pt-4 pb-3 border-b border-slate-200 shrink-0">
        <Link href="/" className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center
                          text-white font-bold text-sm shadow-sm shrink-0">
            E
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900 leading-none">EduHub</p>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">{t.panel}</p>
          </div>
        </Link>

        {/* Clock with seconds */}
        <div className="flex items-center gap-2 px-2 py-2 rounded-lg bg-slate-50 border border-slate-100">
          <span className="text-slate-400 text-sm">🕐</span>
          <LiveClock
            className="text-sm text-slate-700 tabular-nums"
            showDate
            showSeconds
            locale={lang}
          />
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">

        {/* Əsas / Главная */}
        {sec(t.s_main)}
        {navLink("/dashboard",           "🏠", t.icmal,      true)}
        {navLink("/dashboard/results",   "📋", t.neticeler)}
        {navLink("/dashboard/analytics", "📊", t.analitika)}
        {navLink("/dashboard/progress",  "📈", t.proqres)}

        {/* Tədris Prosesi / Учебный процесс */}
        {sec(t.s_teach)}
        {navLink("/dashboard/platforms", "🚀", t.platforms)}
        {navLink("/dashboard/content",   "📚", t.content)}
        {navLink("/dashboard/students",  "👥", t.sagird_act)}
        {navLink("/dashboard/schedule",  "📅", t.cedvel)}

        {/* Siniflər / Классы */}
        {sec(t.s_classes)}

        {grades.length === 0 && (
          <p className="px-3 py-1.5 text-xs text-slate-400 italic">—</p>
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
            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
            pathname === "/dashboard/classes"
              ? "text-indigo-600"
              : "text-slate-400 hover:text-slate-700 hover:bg-slate-100",
          )}>
          {t.all_classes}
        </Link>

        {/* İdarəetmə / Управление */}
        {sec(t.s_manage)}
        {navLink("/dashboard/manage/assignments", "📋", t.assignments)}
        {navLink("/dashboard/manage/classes",     "🏫", t.cls_groups)}
        {navLink("/dashboard/manage/students",    "👥", t.students)}
        {navLink("/dashboard/manage/teachers",    "👨‍🏫", t.teachers)}
        {navLink("/dashboard/manage/subjects",    "📚", t.subjects)}
        {navLink("/dashboard/manage/resources",   "🎬", t.resources)}
      </nav>

      {/* ── Footer ── */}
      <div className="px-2 py-3 border-t border-slate-200 shrink-0 space-y-0.5">
        {navLink("/dashboard/manage/settings", "⚙️", t.settings)}
        {navLink("/", "🏠", t.home)}
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
                     text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all">
          <span className="text-[15px] leading-none">🚪</span>
          <span>{t.logout}</span>
        </button>
      </div>
    </aside>
  );
}
