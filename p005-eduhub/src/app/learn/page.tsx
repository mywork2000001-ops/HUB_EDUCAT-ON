import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifyStudentToken } from "@/lib/student-auth";
import { getAssignedTopicIds } from "@/server/queries/assignments";
import { supabaseAdmin } from "@/lib/supabase";
import { db } from "@/lib/db";
import { LangToggle } from "@/components/student/LangToggle";

export const dynamic = "force-dynamic";

const PLATFORM_COLOR: Record<string, string> = {
  P001: "#f97316", P002: "#3b82f6", P003: "#a855f7", P004: "#22c55e",
};

export default async function LearnPage() {
  const jar     = await cookies();
  const token   = jar.get("eduhub-student-token")?.value;
  const student = token ? await verifyStudentToken(token) : null;
  const lang    = (jar.get("eduhub-lang")?.value ?? "az") as "az" | "ru";

  if (!student) redirect("/learn/login");

  /* ── Assigned topic IDs ── */
  const assignedIds = await getAssignedTopicIds(
    student.id,
    student.class_name,
    student.group_name,
  );
  const idArray = [...assignedIds];

  /* ── Full topic data ── */
  const topics = idArray.length > 0
    ? await db.curriculumItem.findMany({
        where:   { id: { in: idArray } },
        include: {
          grade_subject: { include: { grade: true, subject: true } },
          _count:        { select: { resources: true } },
        },
        orderBy: { order_index: "asc" },
      })
    : [];

  /* ── Results from Supabase ── */
  type Res = { platform: string; lesson_title: string; percent: number; finished_at: string };
  let recentResults: Res[] = [];
  let totalTests = 0;
  let avgScore   = 0;

  if (supabaseAdmin) {
    const [allR, recentR] = await Promise.all([
      supabaseAdmin.from("results").select("percent").eq("student_name", student.name),
      supabaseAdmin
        .from("results")
        .select("platform, lesson_title, percent, finished_at")
        .eq("student_name", student.name)
        .order("finished_at", { ascending: false })
        .limit(5),
    ]);
    if (allR.data) {
      totalTests = allR.data.length;
      avgScore   = allR.data.length
        ? Math.round(allR.data.reduce((s, r) => s + r.percent, 0) / allR.data.length)
        : 0;
    }
    recentResults = recentR.data ?? [];
  }

  /* ── Group topics by grade/subject ── */
  type Group = {
    label:     { az: string; ru: string };
    icon:      string | null;
    gradeSlug: string;
    subjSlug:  string;
    items:     typeof topics;
  };
  const groupMap = new Map<string, Group>();
  for (const t of topics) {
    const gs  = t.grade_subject;
    const key = `${gs.grade.slug}/${gs.subject.slug}`;
    if (!groupMap.has(key)) {
      groupMap.set(key, {
        label:     { az: gs.subject.label_az, ru: gs.subject.label_ru },
        icon:      gs.subject.icon,
        gradeSlug: gs.grade.slug,
        subjSlug:  gs.subject.slug,
        items:     [],
      });
    }
    groupMap.get(key)!.items.push(t);
  }
  const groups = [...groupMap.values()];

  const T = {
    hi:        lang === "ru" ? "Привет"                              : "Salam",
    assigned:  lang === "ru" ? "Назначено"                           : "Tə'yin edilib",
    tests:     lang === "ru" ? "Тестов"                              : "Test",
    avg:       lang === "ru" ? "Средний балл"                        : "Orta bal",
    myTopics:  lang === "ru" ? "Мои темы"                            : "Mövzularım",
    noTopics:  lang === "ru" ? "Учитель пока не назначил темы"       : "Müəllim hələ mövzu tə'yin etməyib",
    recent:    lang === "ru" ? "Последние результаты"                : "Son nəticələr",
    resources: lang === "ru" ? "ресурс"                              : "resurs",
    logout:    lang === "ru" ? "Выйти"                               : "Çıxış",
  };

  const firstName = student.name.split(/[\s_]+/)[0];

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Header ── */}
      <header className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center
                          text-white font-bold text-sm shrink-0 shadow-sm">
            E
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 leading-tight truncate">{student.name}</p>
            <p className="text-[11px] text-slate-400 leading-tight">
              {student.class_name}
              {student.group_name ? ` · ${student.group_name}` : ""}
            </p>
          </div>

          <LangToggle lang={lang} />

          <form action="/api/student/auth/logout" method="POST">
            <button type="submit"
              className="text-xs text-slate-400 hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-50">
              {T.logout}
            </button>
          </form>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

        {/* ── Greeting ── */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {T.hi},{" "}
            <span className="text-indigo-600">{firstName}</span>! 👋
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {lang === "ru"
              ? "Ваши назначенные темы и результаты"
              : "Tə'yin edilmiş mövzular və nəticələr"}
          </p>
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { emoji: "📚", val: topics.length,                         label: T.assigned, color: "text-indigo-600",  bg: "bg-indigo-50" },
            { emoji: "✅", val: totalTests,                             label: T.tests,    color: "text-emerald-600", bg: "bg-emerald-50" },
            { emoji: "📊", val: avgScore > 0 ? `${avgScore}%` : "—",  label: T.avg,
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

        {/* ── Assigned topics ── */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-sm font-semibold text-slate-700">{T.myTopics}</h2>
            {topics.length > 0 && (
              <span className="text-xs text-slate-400 bg-slate-200 rounded-full px-2 py-0.5">
                {topics.length}
              </span>
            )}
          </div>

          {topics.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 py-14 text-center shadow-sm">
              <p className="text-5xl mb-3">📋</p>
              <p className="text-slate-500 text-sm font-medium">{T.noTopics}</p>
              <p className="text-slate-400 text-xs mt-1.5">
                {lang === "ru" ? "Обратитесь к вашему учителю" : "Müəllimə müraciət edin"}
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {groups.map((group, gi) => (
                <div key={gi}>
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <span className="text-lg">{group.icon ?? "📚"}</span>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      {lang === "ru" ? group.label.ru : group.label.az}
                    </span>
                    <span className="text-xs text-slate-400 ml-auto">
                      {group.items.length}{" "}
                      {lang === "ru" ? "тем" : "mövzu"}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {group.items.map((topic, ti) => (
                      <Link
                        key={topic.id}
                        href={`/learn/${group.gradeSlug}/${group.subjSlug}/${topic.slug}`}
                        className="flex items-center gap-3.5 p-4 rounded-xl bg-white
                                   border border-slate-200 hover:border-indigo-300
                                   hover:shadow-sm transition-all active:scale-[0.99] group shadow-sm"
                      >
                        <span className="w-8 h-8 rounded-full bg-indigo-100 flex items-center
                                         justify-center text-xs font-bold text-indigo-600
                                         group-hover:bg-indigo-200 shrink-0 transition-colors">
                          {ti + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 group-hover:text-indigo-700 truncate">
                            {lang === "ru" ? topic.title_ru : topic.title_az}
                          </p>
                          {topic._count.resources > 0 && (
                            <p className="text-xs text-slate-400 mt-0.5">
                              {topic._count.resources} {T.resources}
                            </p>
                          )}
                        </div>
                        <svg className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors shrink-0"
                          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Recent results ── */}
        {recentResults.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-slate-700 mb-3">{T.recent}</h2>
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              {recentResults.map((r, i) => (
                <div key={i}
                  className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                  <span className="w-2 h-2 rounded-full shrink-0 mt-0.5"
                    style={{ backgroundColor: PLATFORM_COLOR[r.platform] ?? "#6366f1" }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 truncate">
                      {r.lesson_title || r.platform}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                        style={{
                          backgroundColor: `${PLATFORM_COLOR[r.platform] ?? "#6366f1"}15`,
                          color: PLATFORM_COLOR[r.platform] ?? "#6366f1",
                        }}>
                        {r.platform}
                      </span>
                      {new Date(r.finished_at).toLocaleDateString(
                        lang === "ru" ? "ru-RU" : "az-AZ",
                        { day: "2-digit", month: "short" },
                      )}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-base font-bold ${
                      r.percent >= 70 ? "text-emerald-600"
                      : r.percent >= 50 ? "text-amber-600"
                      : "text-rose-600"
                    }`}>
                      {r.percent}%
                    </span>
                    {r.percent >= 70 && (
                      <p className="text-[10px] text-emerald-500 mt-0.5">
                        {lang === "ru" ? "Сдал" : "Keçdi"}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Footer ── */}
        <div className="pb-4 text-center">
          <Link href="/" className="text-xs text-slate-300 hover:text-slate-500 transition-colors">
            EduHub © 2026
          </Link>
        </div>
      </div>
    </div>
  );
}
