"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

// ── Types ────────────────────────────────────────────────────────────────────
export type StudentRow = {
  id: string; name: string; email: string;
  class_name: string; group_name: string | null; is_active: boolean;
};
export type ResultRow = {
  student_name: string; student_class: string | null;
  platform: string; lesson_id: string; lesson_title: string;
  percent: number; score: number; total: number; finished_at: string;
};
export type SubjectItem = {
  slug: string; label_az: string; label_ru: string; icon: string | null;
};

type Tab = "students" | "results" | "achievements" | "groups";

const TAB_LABELS: [Tab, string][] = [
  ["students",     "Şagirdlər"],
  ["results",      "Dərslər nəticəsi"],
  ["achievements", "Naliyyətlər"],
  ["groups",       "Siniflər"],
];

const PLATFORM_META: Record<string, { label: string; cls: string }> = {
  P001: { label: "DİM",     cls: "bg-orange-100 text-orange-700 border-orange-200" },
  P002: { label: "Dərslik", cls: "bg-blue-100 text-blue-700 border-blue-200" },
  P003: { label: "Blok",    cls: "bg-purple-100 text-purple-700 border-purple-200" },
  P004: { label: "TAİM",    cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
};

// ── Helpers ──────────────────────────────────────────────────────────────────
function pctColor(pct: number | null) {
  if (pct === null) return "bg-slate-100 text-slate-400";
  if (pct >= 70)   return "bg-emerald-100 text-emerald-700";
  if (pct >= 50)   return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-700";
}
function barColor(pct: number) {
  if (pct >= 70) return "bg-emerald-500";
  if (pct >= 50) return "bg-amber-400";
  return "bg-red-400";
}
function avg(arr: number[]) {
  return arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;
}
function timeAgo(d: string) {
  const diff = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (diff < 60)        return `${diff} dəq. əvvəl`;
  if (diff < 1440)      return `${Math.floor(diff / 60)} saat əvvəl`;
  if (diff < 43200)     return `${Math.floor(diff / 1440)} gün əvvəl`;
  return new Date(d).toLocaleDateString("az-AZ", { day: "numeric", month: "short" });
}
function initials(name: string) {
  return name.split(" ").map(w => w[0]?.toUpperCase() ?? "").slice(0, 2).join("");
}

// ── Component ────────────────────────────────────────────────────────────────
export function GradeDashboard({
  gradeSlug, gradeLabel, subjects, students, results,
}: {
  gradeSlug:  string;
  gradeLabel: string;
  subjects:   SubjectItem[];
  students:   StudentRow[];
  results:    ResultRow[];
}) {
  const [tab,    setTab]    = useState<Tab>("students");
  const [clsFlt, setClsFlt] = useState("ALL");

  // ── Class names ──
  const classNames = useMemo(() => {
    const s = new Set(students.map(x => x.class_name));
    return ["ALL", ...Array.from(s).sort()];
  }, [students]);

  // ── Per-student stats ──
  const studentStats = useMemo(() => {
    const m = new Map<string, { percents: number[]; last: string }>();
    for (const r of results) {
      const k = `${r.student_name}|||${r.student_class ?? ""}`;
      const e = m.get(k);
      if (e) {
        e.percents.push(r.percent);
        if (r.finished_at > e.last) e.last = r.finished_at;
      } else {
        m.set(k, { percents: [r.percent], last: r.finished_at });
      }
    }
    return m;
  }, [results]);

  // ── Per-lesson stats ──
  const lessonStats = useMemo(() => {
    const m = new Map<string, { platform: string; title: string; percents: number[] }>();
    for (const r of results) {
      const k = `${r.platform}:::${r.lesson_title}`;
      const e = m.get(k);
      if (e) e.percents.push(r.percent);
      else   m.set(k, { platform: r.platform, title: r.lesson_title, percents: [r.percent] });
    }
    return Array.from(m.values()).sort((a, b) => b.percents.length - a.percents.length);
  }, [results]);

  // ── Top 12 lessons for grade book ──
  const topLessons = useMemo(() => lessonStats.slice(0, 12), [lessonStats]);

  // ── Best percent per student×lesson ──
  const bestMap = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of results) {
      const k = `${r.student_name}|||${r.student_class ?? ""}|||${r.lesson_title}`;
      const ex = m.get(k);
      if (ex === undefined || r.percent > ex) m.set(k, r.percent);
    }
    return m;
  }, [results]);

  // ── Group stats ──
  const groupStats = useMemo(() =>
    classNames.filter(c => c !== "ALL").map(cls => {
      const studs   = students.filter(s => s.class_name === cls);
      const resForC = results.filter(r => r.student_class === cls);
      return {
        cls,
        count:  studs.length,
        active: studs.filter(s => s.is_active).length,
        avgPct: resForC.length ? avg(resForC.map(r => r.percent)) : 0,
        tests:  resForC.length,
      };
    }), [classNames, students, results]);

  // ── Global stats ──
  const totalStudents  = students.length;
  const activeStudents = students.filter(s => s.is_active).length;
  const globalAvg      = results.length ? avg(results.map(r => r.percent)) : 0;
  const totalTests     = results.length;

  // ── Filtered students ──
  const filteredStudents = clsFlt === "ALL"
    ? students
    : students.filter(s => s.class_name === clsFlt);

  // ── Lessons grouped by platform ──
  const byPlatform = useMemo(() => {
    const m = new Map<string, typeof lessonStats>();
    for (const ls of lessonStats) {
      const g = m.get(ls.platform) ?? [];
      g.push(ls);
      m.set(ls.platform, g);
    }
    return m;
  }, [lessonStats]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">

      {/* ── Stats bar ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Şagirdlər", val: totalStudents,  icon: "👥", cls: "text-indigo-600" },
          { label: "Aktiv",     val: activeStudents,  icon: "✅", cls: "text-emerald-600" },
          { label: "Orta faiz", val: `${globalAvg}%`, icon: "📊", cls: globalAvg >= 70 ? "text-emerald-600" : globalAvg >= 50 ? "text-amber-600" : "text-red-500" },
          { label: "Testlər",   val: totalTests,      icon: "📝", cls: "text-slate-700" },
        ].map(st => (
          <div key={st.label} className="bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-sm">{st.icon}</span>
              <p className="text-xs text-slate-400 font-medium">{st.label}</p>
            </div>
            <p className={`text-2xl font-bold ${st.cls}`}>{st.val}</p>
          </div>
        ))}
      </div>

      {/* ── Tab panel ── */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">

        {/* Tab bar */}
        <div className="flex items-stretch border-b border-slate-200 overflow-x-auto">
          {TAB_LABELS.map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`px-5 py-3.5 text-sm font-medium shrink-0 transition-colors border-b-2 ${
                tab === key
                  ? "text-indigo-700 border-indigo-600 bg-indigo-50/40"
                  : "text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-50"
              }`}>
              {label}
              {key === "students" && students.length > 0 && (
                <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                  tab === key ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-500"
                }`}>{students.length}</span>
              )}
            </button>
          ))}
          <div className="flex-1" />
          <div className="flex items-center px-4 gap-2">
            <Link href="/dashboard/manage/students/new"
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium transition-colors shadow-sm whitespace-nowrap">
              + Şagird əlavə et
            </Link>
          </div>
        </div>

        {/* Class group filter (for students + achievements tabs) */}
        {(tab === "students" || tab === "achievements") && classNames.length > 2 && (
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center gap-1.5 flex-wrap">
            {classNames.map(cls => (
              <button key={cls} onClick={() => setClsFlt(cls)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors border ${
                  clsFlt === cls
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
                }`}>
                {cls === "ALL" ? "Hamısı" : cls}
                <span className="ml-1 opacity-60">
                  {cls === "ALL" ? students.length : students.filter(s => s.class_name === cls).length}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* ══ TAB 1: Şagirdlər ══ */}
        {tab === "students" && (
          filteredStudents.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-3xl mb-3">👥</p>
              <p className="text-slate-500 font-medium mb-1">Şagird tapılmadı</p>
              <p className="text-slate-400 text-sm mb-4">Bu sinif üçün şagird əlavə edin</p>
              <Link href="/dashboard/manage/students/new"
                className="inline-block px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm transition-colors shadow-sm">
                Şagird əlavə et
              </Link>
            </div>
          ) : (
            <div>
              {/* Header row */}
              <div className="grid grid-cols-[2fr_1fr_100px_56px_60px_48px] gap-2 px-5 py-2.5
                              text-[10px] font-semibold text-slate-400 uppercase tracking-wider
                              bg-slate-50 border-b border-slate-100">
                <span>Ad Soyad</span>
                <span>Son fəaliyyət</span>
                <span>İrəliləyiş</span>
                <span className="text-center">Orta</span>
                <span className="text-center">Test</span>
                <span />
              </div>
              <div className="divide-y divide-slate-50">
                {filteredStudents.map(s => {
                  const k      = `${s.name}|||${s.class_name}`;
                  const st     = studentStats.get(k);
                  const avgPct = st ? avg(st.percents) : null;
                  const tests  = st?.percents.length ?? 0;
                  return (
                    <div key={s.id}
                      className="grid grid-cols-[2fr_1fr_100px_56px_60px_48px] gap-2 px-5 py-3 items-center hover:bg-slate-50/70 transition-colors">
                      {/* Avatar + name */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          s.is_active ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-400"
                        }`}>
                          {initials(s.name)}
                        </div>
                        <div className="min-w-0">
                          <p className={`text-sm font-medium truncate leading-tight ${
                            s.is_active ? "text-slate-800" : "text-slate-400 line-through"
                          }`}>{s.name}</p>
                          <p className="text-[11px] text-slate-400">
                            {s.class_name}{s.group_name ? ` · ${s.group_name}` : ""}
                          </p>
                        </div>
                      </div>
                      {/* Last activity */}
                      <p className="text-xs text-slate-400 truncate">
                        {st?.last ? timeAgo(st.last) : "—"}
                      </p>
                      {/* Progress bar */}
                      <div>
                        {avgPct !== null ? (
                          <div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full transition-all ${barColor(avgPct)}`}
                                style={{ width: `${avgPct}%` }} />
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5 text-right">{avgPct}%</p>
                          </div>
                        ) : (
                          <div className="h-2 bg-slate-100 rounded-full" />
                        )}
                      </div>
                      {/* Avg badge */}
                      <div className="flex justify-center">
                        {avgPct !== null
                          ? <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${pctColor(avgPct)}`}>{avgPct}%</span>
                          : <span className="text-xs text-slate-300">—</span>}
                      </div>
                      {/* Test count */}
                      <div className="text-center">
                        <span className="text-sm font-medium text-slate-700">{tests > 0 ? tests : "—"}</span>
                      </div>
                      {/* Edit link */}
                      <div className="flex justify-center">
                        <Link href={`/dashboard/manage/students/${s.id}`}
                          className="text-slate-400 hover:text-indigo-600 text-xs hover:bg-indigo-50 px-2 py-1 rounded-lg transition-colors">
                          ✏️
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )
        )}

        {/* ══ TAB 2: Dərslər nəticəsi ══ */}
        {tab === "results" && (
          lessonStats.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-3xl mb-3">📋</p>
              <p className="text-slate-400 text-sm">Hələ test nəticəsi yoxdur</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {Array.from(byPlatform.entries()).map(([platform, lessons]) => {
                const pb      = PLATFORM_META[platform] ?? { label: platform, cls: "bg-slate-100 text-slate-600 border-slate-200" };
                const allPcts = lessons.flatMap(l => l.percents);
                const pAvg    = avg(allPcts);
                return (
                  <div key={platform}>
                    {/* Platform header */}
                    <div className="flex items-center gap-3 px-5 py-3 bg-slate-50/80">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${pb.cls}`}>{pb.label}</span>
                      <span className="text-sm font-medium text-slate-600">{lessons.length} mövzu</span>
                      <span className={`ml-auto text-xs font-bold px-2.5 py-1 rounded-full ${pctColor(pAvg)}`}>{pAvg}% orta</span>
                    </div>
                    {/* Lesson rows */}
                    <div className="divide-y divide-slate-50">
                      {lessons.map((ls, i) => {
                        const a    = avg(ls.percents);
                        const pass = ls.percents.filter(p => p >= 70).length;
                        const mini = ls.percents.slice(-8);
                        return (
                          <div key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
                            <span className="text-xs text-slate-400 w-5 shrink-0 font-mono text-right">{i + 1}.</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-slate-800 truncate">{ls.title}</p>
                              <p className="text-xs text-slate-400 mt-0.5">
                                {ls.percents.length} cəhd · {pass}/{ls.percents.length} keçdi
                              </p>
                            </div>
                            {/* Sparkline */}
                            <div className="hidden sm:flex items-end gap-px h-5 shrink-0">
                              {mini.map((p, j) => (
                                <div key={j} className={`w-1.5 rounded-sm ${barColor(p)}`}
                                  style={{ height: `${Math.max(15, p)}%` }} />
                              ))}
                            </div>
                            {/* Avg badge */}
                            <span className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-full min-w-[50px] text-center ${pctColor(a)}`}>
                              {a}%
                            </span>
                            {/* Mini bar */}
                            <div className="w-16 shrink-0">
                              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${barColor(a)}`} style={{ width: `${a}%` }} />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* ══ TAB 3: Naliyyətlər (Grade book) ══ */}
        {tab === "achievements" && (
          topLessons.length === 0 || filteredStudents.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-3xl mb-3">🏆</p>
              <p className="text-slate-400 text-sm">Nəticə yoxdur</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="sticky left-0 z-10 bg-slate-50 px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap min-w-[160px] border-r border-slate-200">
                      Ad Soyad
                    </th>
                    {topLessons.map((ls, i) => {
                      const pb = PLATFORM_META[ls.platform] ?? { label: ls.platform, cls: "bg-slate-100 text-slate-500 border-slate-200" };
                      return (
                        <th key={i} className="px-2 py-2 text-center min-w-[52px]" title={ls.title}>
                          <div className="flex flex-col items-center gap-1">
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${pb.cls}`}>{pb.label}</span>
                            <span className="text-[11px] font-bold text-slate-500">{i + 1}</span>
                          </div>
                        </th>
                      );
                    })}
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase min-w-[60px] border-l border-slate-200">
                      Orta
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredStudents.map(s => {
                    const k      = `${s.name}|||${s.class_name}`;
                    const st     = studentStats.get(k);
                    const avgPct = st ? avg(st.percents) : null;
                    return (
                      <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="sticky left-0 z-10 bg-white hover:bg-slate-50 px-4 py-2.5 border-r border-slate-100">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                              s.is_active ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-400"
                            }`}>
                              {s.name[0]?.toUpperCase()}
                            </div>
                            <span className="text-sm text-slate-800 truncate max-w-[110px]">{s.name}</span>
                          </div>
                        </td>
                        {topLessons.map((ls, i) => {
                          const aKey = `${s.name}|||${s.class_name}|||${ls.title}`;
                          const pct  = bestMap.get(aKey) ?? null;
                          return (
                            <td key={i} className="px-1.5 py-2 text-center">
                              {pct !== null ? (
                                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${pctColor(pct)}`}>
                                  {pct}
                                </span>
                              ) : (
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 text-slate-300 text-xs">
                                  –
                                </span>
                              )}
                            </td>
                          );
                        })}
                        <td className="px-4 py-2 text-center border-l border-slate-100">
                          {avgPct !== null
                            ? <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${pctColor(avgPct)}`}>{avgPct}%</span>
                            : <span className="text-xs text-slate-300">—</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        )}

        {/* ══ TAB 4: Siniflər (Groups) ══ */}
        {tab === "groups" && (
          groupStats.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-3xl mb-3">🏫</p>
              <p className="text-slate-400 text-sm">Sinif tapılmadı</p>
            </div>
          ) : (
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {groupStats.map(g => (
                <div key={g.cls}
                  className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-700">
                        {g.cls}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{g.cls} sinifi</p>
                        <p className="text-xs text-slate-400">{g.count} şagird · {g.active} aktiv</p>
                      </div>
                    </div>
                    <span className={`text-sm font-bold px-2.5 py-1 rounded-full ${pctColor(g.avgPct)}`}>
                      {g.avgPct > 0 ? `${g.avgPct}%` : "—"}
                    </span>
                  </div>
                  {/* Progress */}
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-2.5">
                    <div className={`h-full rounded-full ${barColor(g.avgPct)}`} style={{ width: `${g.avgPct}%` }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-400">{g.tests} test nəticəsi</p>
                    <button onClick={() => { setTab("students"); setClsFlt(g.cls); }}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors">
                      Şagirdlərə bax →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* ── Subject grid ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-700">Fənlər</h2>
          <Link href="/dashboard/manage/subjects"
            className="text-xs text-slate-500 hover:text-indigo-600 transition-colors">
            + Fənn əlavə et
          </Link>
        </div>
        {subjects.length === 0 ? (
          <div className="py-8 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <p className="text-slate-400 text-sm">Fənn əlavə edilməyib</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
            {subjects.map(sub => (
              <Link key={sub.slug}
                href={`/dashboard/classes/${gradeSlug}/${sub.slug}`}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white border border-slate-200 shadow-sm
                           hover:border-indigo-300 hover:shadow-md transition-all text-center group">
                <span className="text-2xl">{sub.icon ?? "📚"}</span>
                <span className="text-xs font-medium text-slate-700 group-hover:text-indigo-700 leading-tight">{sub.label_az}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
