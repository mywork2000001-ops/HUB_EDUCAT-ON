"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { CurriculumSubject, CurriculumModule, CurriculumLesson, CurriculumResource } from "@/server/queries/assignments";

// ── Types ─────────────────────────────────────────────────────────────────────
type ResultRow = { lesson_id: string; lesson_title: string; percent: number };

interface Props {
  subjects:  CurriculumSubject[];
  lang:      "az" | "ru";
  results:   ResultRow[];
  studentName: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function isCompleted(resource: CurriculumResource, results: ResultRow[]): boolean {
  const url = (resource.content_url ?? "").toLowerCase();
  const slug = resource.slug.toLowerCase();
  return results.some(r => {
    if (r.percent < 70) return false;
    const lid = (r.lesson_id ?? "").toLowerCase();
    return lid.includes(slug) || url.includes(lid) || (lid && url.endsWith(lid + ".html"));
  });
}

// ── Progress ring (SVG) ───────────────────────────────────────────────────────
function ProgressRing({ done, total }: { done: number; total: number }) {
  const size = 36;
  const r    = 15;
  const circ = 2 * Math.PI * r;
  const pct  = total > 0 ? Math.min(done / total, 1) : 0;
  const isDone = pct >= 1 && total > 0;
  const isNone = pct === 0;

  return (
    <svg width={size} height={size} className="-rotate-90 shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={3} />
      {!isNone && (
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={isDone ? "#22c55e" : "#6366f1"}
          strokeWidth={3}
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct)}
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

// ── Resource icon circle ──────────────────────────────────────────────────────
function ResourceIcon({
  type, num, done, href,
}: { type: string; num: number; done: boolean; href: string }) {
  const isTest = ["TEST", "TAIM_TEST", "BSQ", "KSQ"].includes(type);
  const isVideo = type === "VIDEO";

  const base = done
    ? "ring-2 ring-emerald-400 bg-emerald-50"
    : isTest
    ? "bg-amber-400 hover:bg-amber-500"
    : isVideo
    ? "bg-cyan-500 hover:bg-cyan-600"
    : "bg-indigo-600 hover:bg-indigo-700";

  return (
    <Link href={href}
      className={`relative w-14 h-14 rounded-full flex flex-col items-center justify-center
                  text-white font-bold shadow-md transition-transform hover:scale-105 active:scale-95 ${base}`}>
      {done && (
        <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-emerald-500 rounded-full
                         flex items-center justify-center text-[10px] text-white border-2 border-white shadow-sm">
          ✓
        </span>
      )}
      {isTest ? (
        <span className="text-xl leading-none">⭐</span>
      ) : isVideo ? (
        <span className="text-xl leading-none">▶</span>
      ) : (
        <span className="text-lg font-black leading-none">{num}</span>
      )}
      <span className={`text-[9px] mt-0.5 font-medium opacity-90 ${done ? "text-emerald-700" : ""}`}>
        {isTest ? "Test" : isVideo ? "Video" : "Dərs"}
      </span>
    </Link>
  );
}

// ── Module progress from results ──────────────────────────────────────────────
function calcModuleProgress(module: CurriculumModule, results: ResultRow[]) {
  const all = module.lessons.flatMap(l => l.resources);
  const done = all.filter(r => isCompleted(r, results)).length;
  return { done, total: all.length };
}

// ── Main component ────────────────────────────────────────────────────────────
export function LearnView({ subjects, lang, results }: Props) {
  const [subjIdx,  setSubjIdx]  = useState(0);
  const [modId,    setModId]    = useState<number | null>(subjects[0]?.modules[0]?.id ?? null);

  const subj   = subjects[subjIdx] ?? subjects[0];
  const module = subj?.modules.find(m => m.id === modId) ?? subj?.modules[0] ?? null;

  // Sequential resource numbers across the whole module (LESSON type only)
  const lessonNums = useMemo(() => {
    if (!module) return new Map<number, number>();
    const m = new Map<number, number>();
    let n = 1;
    for (const lesson of module.lessons) {
      for (const r of lesson.resources) {
        if (!["TEST", "TAIM_TEST", "BSQ", "KSQ", "VIDEO"].includes(r.type)) {
          m.set(r.id, n++);
        }
      }
    }
    return m;
  }, [module]);

  const t = {
    noAssigned: lang === "ru" ? "Нет назначенных тем" : "Tə'yin edilmiş mövzu yoxdur",
    noAssignedSub: lang === "ru" ? "Обратитесь к учителю" : "Müəllimə müraciət edin",
    lesson:  lang === "ru" ? "Урок" : "Dərs",
    module:  lang === "ru" ? "Модуль" : "Modul",
    done:    lang === "ru" ? "выполн." : "tamamlandı",
    noRes:   lang === "ru" ? "Нет ресурсов" : "Resurs yoxdur",
  };

  if (subjects.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-5xl mb-3">📋</p>
          <p className="text-slate-500 text-sm font-medium">{t.noAssigned}</p>
          <p className="text-slate-400 text-xs mt-1">{t.noAssignedSub}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">

      {/* Subject tabs */}
      {subjects.length > 1 && (
        <div className="flex gap-1 px-4 py-2 border-b border-slate-100 bg-white overflow-x-auto">
          {subjects.map((s, i) => (
            <button key={s.slug} type="button"
              onClick={() => { setSubjIdx(i); setModId(s.modules[0]?.id ?? null); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                subjIdx === i
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              }`}>
              <span>{s.icon ?? "📚"}</span>
              <span>{lang === "ru" ? s.label_ru : s.label_az}</span>
            </button>
          ))}
        </div>
      )}

      {/* 2-column layout */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* ── LEFT: Module list ── */}
        <aside className="w-56 shrink-0 bg-white border-r border-slate-100 overflow-y-auto">
          <div className="px-2 py-3 space-y-1">
            {subj?.modules.map((m, mi) => {
              const { done, total } = calcModuleProgress(m, results);
              const active = m.id === modId;
              const pct    = total > 0 ? Math.round(done / total * 100) : 0;

              return (
                <button key={m.id} type="button"
                  onClick={() => setModId(m.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all text-left ${
                    active
                      ? "bg-indigo-50 border border-indigo-200 shadow-sm"
                      : "hover:bg-slate-50 border border-transparent"
                  }`}>
                  <ProgressRing done={done} total={total} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold leading-tight ${active ? "text-indigo-700" : "text-slate-400"}`}>
                      {t.module} {mi + 1}
                    </p>
                    <p className={`text-[11px] leading-tight mt-0.5 truncate ${active ? "text-indigo-600 font-semibold" : "text-slate-700 font-medium"}`}>
                      {lang === "ru" ? m.title_ru : m.title_az}
                    </p>
                    {total > 0 && (
                      <p className={`text-[10px] mt-0.5 ${done === total ? "text-emerald-500 font-semibold" : "text-slate-400"}`}>
                        {done === total ? `✓ ${t.done}` : `${pct}%`}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* ── RIGHT: Module content ── */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          {!module ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-slate-400 text-sm">Modul seçin</p>
            </div>
          ) : (
            <div className="px-6 py-5 max-w-2xl">
              {/* Module title */}
              <h2 className="text-lg font-bold text-slate-800 mb-5">
                {lang === "ru" ? module.title_ru : module.title_az}
              </h2>

              {/* Lessons */}
              {module.lessons.length === 0 ? (
                <p className="text-slate-400 text-sm italic">{t.noAssigned}</p>
              ) : (
                <div className="space-y-6">
                  {module.lessons.map((lesson, li) => (
                    <LessonSection
                      key={lesson.id}
                      lesson={lesson}
                      lessonNum={li + 1}
                      lang={lang}
                      results={results}
                      lessonNums={lessonNums}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// ── Lesson Section ────────────────────────────────────────────────────────────
function LessonSection({
  lesson, lessonNum, lang, results, lessonNums,
}: {
  lesson:     CurriculumLesson;
  lessonNum:  number;
  lang:       "az" | "ru";
  results:    ResultRow[];
  lessonNums: Map<number, number>;
}) {
  const title = lang === "ru" ? lesson.title_ru : lesson.title_az;

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500 shrink-0">
          {lessonNum}
        </div>
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
          {lang === "ru" ? `УРОК ${lessonNum}` : `DƏRS ${lessonNum}`}. {title.toUpperCase()}
        </p>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      {/* Resource icons */}
      {lesson.resources.length === 0 ? (
        <p className="text-xs text-slate-400 italic ml-8">
          {lang === "ru" ? "Нет ресурсов" : "Resurs yoxdur"}
        </p>
      ) : (
        <div className="flex flex-wrap gap-3 ml-8">
          {lesson.resources.map(r => {
            const done = isCompleted(r, results);
            const num  = lessonNums.get(r.id) ?? 1;
            const href = `/learn/${lesson.gradeSlug}/${lesson.subjectSlug}/${lesson.parentSlug}/${lesson.slug}/${r.slug}`;
            return (
              <div key={r.id} className="flex flex-col items-center gap-1.5">
                <ResourceIcon type={r.type} num={num} done={done} href={href} />
                <p className="text-[9px] text-slate-400 text-center max-w-[56px] leading-tight truncate">
                  {lang === "ru" ? r.title_ru : r.title_az}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
