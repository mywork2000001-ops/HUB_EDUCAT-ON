import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifyStudentToken } from "@/lib/student-auth";
import { getStudentCurriculumTree, getStudentSchedule } from "@/server/queries/assignments";
import { supabaseAdmin } from "@/lib/supabase";
import { LangToggle } from "@/components/student/LangToggle";
import { LiveClock } from "@/components/ui/LiveClock";
import { LearnView } from "./LearnView";

export const dynamic = "force-dynamic";

const PLATFORM_COLOR: Record<string, string> = {
  P001: "#f97316", P002: "#3b82f6", P003: "#a855f7", P004: "#22c55e",
};

const SUBJ_META: Record<string, { az: string; ru: string; icon: string; accent: string; light: string }> = {
  "math":         { az: "Riyaziyyat",   ru: "Математика",      icon: "📐", accent: "text-blue-700",    light: "bg-blue-50" },
  "block-exam":   { az: "Blok İmtahan", ru: "Блок İmtahan",   icon: "📝", accent: "text-purple-700",  light: "bg-purple-50" },
  "taim-2026":    { az: "TAİM 2026",    ru: "TAİM 2026",       icon: "🎓", accent: "text-emerald-700", light: "bg-emerald-50" },
  "algorithmics": { az: "Alqoritmlər",  ru: "Алгоритмика",     icon: "🧩", accent: "text-orange-700",  light: "bg-orange-50" },
  "informatics":  { az: "İnformatika",  ru: "Информатика",     icon: "💻", accent: "text-cyan-700",    light: "bg-cyan-50" },
  "physics":      { az: "Fizika",       ru: "Физика",          icon: "⚛️", accent: "text-violet-700",  light: "bg-violet-50" },
  "chemistry":    { az: "Kimya",        ru: "Химия",           icon: "🧪", accent: "text-teal-700",    light: "bg-teal-50" },
};

export default async function LearnPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const jar     = await cookies();
  const token   = jar.get("eduhub-student-token")?.value;
  const student = token ? await verifyStudentToken(token) : null;
  const lang    = (jar.get("eduhub-lang")?.value ?? "az") as "az" | "ru";
  const { tab = "all" } = await searchParams;

  if (!student) redirect("/learn/login");

  /* ── Data ── */
  const [subjects, schedule] = await Promise.all([
    getStudentCurriculumTree(student.id, student.class_name, student.group_name),
    getStudentSchedule(student.id, student.class_name, student.group_name),
  ]);

  // Flatten for stat counts
  const totalTopics = subjects.reduce((s, sub) => s + sub.modules.reduce((ms, m) => ms + m.lessons.length, 0), 0);

  /* ── Supabase results ── */
  type Res = { platform: string; lesson_id: string; lesson_title: string; percent: number; finished_at: string };
  let recentResults: Res[] = [];
  let allResults:   { lesson_id: string; lesson_title: string; percent: number }[] = [];
  let totalTests = 0, avgScore = 0;

  if (supabaseAdmin) {
    const [allR, recentR] = await Promise.all([
      supabaseAdmin.from("results")
        .select("lesson_id, lesson_title, percent")
        .eq("student_name", student.name),
      supabaseAdmin.from("results")
        .select("platform, lesson_id, lesson_title, percent, finished_at")
        .eq("student_name", student.name)
        .order("finished_at", { ascending: false }).limit(5),
    ]);
    if (allR.data) {
      allResults = allR.data as typeof allResults;
      totalTests = allR.data.length;
      avgScore   = allR.data.length
        ? Math.round(allR.data.reduce((s, r) => s + r.percent, 0) / allR.data.length)
        : 0;
    }
    recentResults = (recentR.data ?? []) as Res[];
  }

  /* ── Schedule grouped by date ── */
  type SchedItem = typeof schedule[0];

  function getLessonUrl(s: SchedItem): string | null {
    const item = s.item;
    const res  = item.resources?.[0];
    if (!res || !item.parent) return null;
    const grade = item.grade_subject.grade.slug;
    const subj  = item.grade_subject.subject.slug;
    return `/learn/${grade}/${subj}/${item.parent.slug}/${item.slug}/${res.slug}`;
  }

  const todayKey = new Date().toISOString().slice(0, 10);

  const byDate = new Map<string, SchedItem[]>();
  for (const s of schedule) {
    if (!s.due_date) continue;
    const key = s.due_date.toISOString().slice(0, 10);
    if (!byDate.has(key)) byDate.set(key, []);
    byDate.get(key)!.push(s);
  }

  const todayItems = byDate.get(todayKey) ?? [];

  /* ── Translations ── */
  const T = {
    hi:         lang === "ru" ? "Привет"                        : "Salam",
    assigned:   lang === "ru" ? "Тем назначено"                 : "Tə'yin edilib",
    tests:      lang === "ru" ? "Тестов сдано"                  : "Test nəticəsi",
    avg:        lang === "ru" ? "Средний балл"                  : "Orta bal",
    recent:     lang === "ru" ? "Последние результаты"          : "Son nəticələr",
    logout:     lang === "ru" ? "Выйти"                         : "Çıxış",
    schedule:   lang === "ru" ? "Расписание"                    : "Dərs cədvəli",
    today:      lang === "ru" ? "Сегодня"                       : "Bu gün",
    tomorrow:   lang === "ru" ? "Завтра"                        : "Sabah",
    lesson:     lang === "ru" ? "занят."                        : "dərs",
    todayTitle: lang === "ru" ? "Задание на сегодня"            : "Bu günkü dərs",
    start:      lang === "ru" ? "Начать →"                      : "Başla →",
    noUrl:      lang === "ru" ? "Открыть в разделе «Dərslər»"  : "«Dərslər» bölməsindən aç",
  };

  const firstName = student.name.split(/[\s_]+/)[0];

  const todayDate    = new Date(); todayDate.setHours(0, 0, 0, 0);
  const tomorrowDate = new Date(todayDate); tomorrowDate.setDate(tomorrowDate.getDate() + 1);

  function formatDateLabel(dateKey: string): string {
    const d = new Date(dateKey + "T12:00:00");
    const ds = new Date(d); ds.setHours(0, 0, 0, 0);
    if (ds.getTime() === todayDate.getTime())    return T.today;
    if (ds.getTime() === tomorrowDate.getTime()) return T.tomorrow;
    return d.toLocaleDateString(lang === "ru" ? "ru-RU" : "az-AZ", {
      weekday: "long", day: "numeric", month: "long",
    });
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      {/* ── Header ── */}
      <header className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center
                          text-white font-bold text-sm shrink-0 shadow-sm">E</div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 leading-tight truncate">{student.name}</p>
            <p className="text-[11px] text-slate-400 leading-tight">
              {student.class_name}{student.group_name ? ` · ${student.group_name}` : ""}
            </p>
          </div>

          <LiveClock className="text-xs font-bold text-indigo-600 tabular-nums hidden sm:block" />

          <LangToggle lang={lang} />

          <form action="/api/student/auth/logout" method="POST">
            <button type="submit"
              className="text-xs text-slate-400 hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-50">
              {T.logout}
            </button>
          </form>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">

        {/* ── Greeting ── */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {T.hi}, <span className="text-indigo-600">{firstName}</span>! 👋
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {lang === "ru" ? "Ваши назначенные темы и результаты" : "Tə'yin edilmiş mövzular və nəticələr"}
          </p>
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { emoji: "📚", val: totalTopics,                           label: T.assigned, color: "text-indigo-600",  bg: "bg-indigo-50" },
            { emoji: "✅", val: totalTests,                            label: T.tests,    color: "text-emerald-600", bg: "bg-emerald-50" },
            { emoji: "📊", val: avgScore > 0 ? `${avgScore}%` : "—", label: T.avg,
              color: avgScore >= 70 ? "text-emerald-600" : avgScore >= 50 ? "text-amber-600" : avgScore > 0 ? "text-rose-600" : "text-slate-400",
              bg: "bg-white" },
          ].map(({ emoji, val, label, color, bg }, i) => (
            <div key={i} className={`${bg} rounded-2xl border border-slate-200 p-4 text-center shadow-sm`}>
              <div className="text-2xl mb-1.5">{emoji}</div>
              <div className={`text-2xl font-bold ${color}`}>{val}</div>
              <div className="text-[11px] text-slate-400 mt-0.5 leading-tight">{label}</div>
            </div>
          ))}
        </div>

        {/* ── TODAY: assigned lessons ── */}
        {todayItems.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <span className="text-base">🎯</span>
              {T.todayTitle}
              <span className="ml-auto text-[10px] font-bold bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full">
                {todayItems.length} {T.lesson}
              </span>
            </h2>
            <div className="space-y-2">
              {todayItems.map((s) => {
                const url  = getLessonUrl(s);
                const subj = SUBJ_META[s.item.grade_subject.subject.slug];
                const dt   = s.due_date!;
                const hasTime = dt.getHours() > 0 || dt.getMinutes() > 0;
                return (
                  <div key={s.id}
                    className="bg-gradient-to-r from-indigo-50 to-white rounded-2xl border border-indigo-200 shadow-sm px-4 py-3 flex items-center gap-3">
                    <div className="text-2xl shrink-0">{subj?.icon ?? "📚"}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {lang === "ru" ? s.item.title_ru : s.item.title_az}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {subj && (
                          <span className={`text-[10px] font-semibold ${subj.accent} ${subj.light} px-1.5 py-0.5 rounded`}>
                            {lang === "ru" ? subj.ru : subj.az}
                          </span>
                        )}
                        {hasTime && (
                          <span className="text-[10px] text-indigo-500 font-bold tabular-nums">
                            🕐 {dt.toLocaleTimeString("az", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        )}
                        {s.note && (
                          <span className="text-[10px] text-amber-600 italic">{s.note}</span>
                        )}
                      </div>
                    </div>
                    {url ? (
                      <a href={url}
                        className="shrink-0 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700
                                   text-white text-xs font-bold transition-colors shadow-sm whitespace-nowrap">
                        {T.start}
                      </a>
                    ) : (
                      <span className="shrink-0 text-[10px] text-slate-400 italic max-w-[80px] text-right leading-tight">
                        {T.noUrl}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Upcoming schedule / Calendar ── */}
        {byDate.size > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <span className="text-base">📅</span>
              {T.schedule}
            </h2>
            <div className="space-y-3">
              {[...byDate.entries()].map(([dateKey, items]) => (
                <div key={dateKey} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  {/* Date header */}
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 border-b border-indigo-100">
                    <span className="text-xs font-bold text-indigo-700 capitalize">
                      {formatDateLabel(dateKey)}
                    </span>
                    <span className="text-[10px] text-indigo-400 ml-auto bg-indigo-100 rounded-full px-2 py-0.5">
                      {items.length} {T.lesson}
                    </span>
                  </div>

                  {/* Schedule items */}
                  {items.map((s, ii) => {
                    const dt      = s.due_date!;
                    const hasTime = dt.getHours() > 0 || dt.getMinutes() > 0;
                    const subj    = SUBJ_META[s.item.grade_subject.subject.slug];
                    const url     = getLessonUrl(s);
                    return (
                      <div key={s.id}
                        className={`flex items-center gap-3 px-4 py-3 ${ii < items.length - 1 ? "border-b border-slate-100" : ""}`}>

                        {/* Time column */}
                        <div className="shrink-0 w-14 text-center">
                          {hasTime ? (
                            <span className="text-sm font-bold text-indigo-600 tabular-nums">
                              {dt.toLocaleTimeString("az", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          ) : (
                            <span className="text-xl">{subj?.icon ?? "📚"}</span>
                          )}
                        </div>

                        <div className="w-px h-8 bg-slate-200 shrink-0" />

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">
                            {lang === "ru" ? s.item.title_ru : s.item.title_az}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {subj && (
                              <span className={`text-[10px] font-semibold ${subj.accent} ${subj.light} px-1.5 py-0.5 rounded`}>
                                {subj.icon} {lang === "ru" ? subj.ru : subj.az}
                              </span>
                            )}
                            {s.note && (
                              <span className="text-[10px] text-amber-600 italic truncate">{s.note}</span>
                            )}
                          </div>
                        </div>

                        {/* Start button */}
                        {url && (
                          <a href={url}
                            className="shrink-0 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700
                                       text-white text-[11px] font-bold transition-colors shadow-sm whitespace-nowrap">
                            {T.start}
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </section>
        )}

      </div>

      {/* ── Algorithmics-style curriculum view ── */}
      <LearnView
        subjects={subjects}
        lang={lang}
        results={allResults}
        studentName={student.name}
      />

      {/* ── Recent results strip (bottom) ── */}
      {recentResults.length > 0 && (
        <div className="border-t border-slate-200 bg-white px-4 py-3">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-2">{T.recent}</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {recentResults.map((r, i) => (
              <div key={i}
                className="shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100">
                <span className={`text-sm font-bold ${
                  r.percent >= 70 ? "text-emerald-600" : r.percent >= 50 ? "text-amber-500" : "text-rose-500"
                }`}>
                  {r.percent}%
                </span>
                <p className="text-xs text-slate-600 max-w-[140px] truncate">
                  {r.lesson_title || r.platform}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
