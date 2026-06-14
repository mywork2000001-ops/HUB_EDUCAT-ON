"use client";

import { useState, useEffect, useCallback } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────
type GradeSubjectItem = {
  gradeSlug: string; gradeNumber: number; gradeLabel: string;
  subjSlug: string; subjLabel: string; subjIcon: string | null;
};
type StudentItem = { id: string; name: string; class_name: string; group_name: string | null };
type ResourceChip = { id: number; slug: string; type: string; title_az: string; content_url: string | null };
type LessonItem  = { id: number; title_az: string; order: number; code: string; due_date: string | null; status: string; enabled: boolean; resources?: ResourceChip[] };
type ModuleItem  = { id: number; title_az: string; order: number; lessons: LessonItem[] };
type LessonState = { enabled: boolean; date: string; time: string; status: "OPEN" | "CLOSED" };

const TYPE_ICONS: Record<string, string> = {
  LESSON:    "📖",
  TEST:      "📝",
  TAIM_TEST: "🎓",
  BSQ:       "📋",
  KSQ:       "📋",
  VIDEO:     "🎬",
  WORKBOOK:  "📓",
};

// ── Main component ─────────────────────────────────────────────────────────────
export function GroupSchedule({ gradeSubjectsList }: { gradeSubjectsList: GradeSubjectItem[] }) {
  const [classSel,  setClassSel]  = useState("");
  const [groupSel,  setGroupSel]  = useState("");
  const [gradeSlug, setGradeSlug] = useState(gradeSubjectsList[0]?.gradeSlug ?? "");
  const [subjSlug,  setSubjSlug]  = useState(gradeSubjectsList[0]?.subjSlug  ?? "");

  const [students, setStudents] = useState<StudentItem[]>([]);
  const [modules,  setModules]  = useState<ModuleItem[]>([]);
  const [states,   setStates]   = useState<Record<number, LessonState>>({});
  const [original, setOriginal] = useState<string>("");
  const [loading,  setLoading]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  // Load students once
  useEffect(() => {
    fetch("/api/admin/students").then(r => r.json())
      .then(d => setStudents(d.students ?? [])).catch(() => {});
  }, []);

  // Auto-detect grade+subject from class number
  useEffect(() => {
    if (!classSel) return;
    const num = parseInt(classSel);
    if (isNaN(num)) return;
    const found = gradeSubjectsList.find(gs => gs.gradeNumber === num);
    if (found) { setGradeSlug(found.gradeSlug); setSubjSlug(found.subjSlug); }
  }, [classSel, gradeSubjectsList]);

  // Load schedule when class/group/subject changes
  const loadSchedule = useCallback(() => {
    if (!classSel || !gradeSlug || !subjSlug) return;
    setLoading(true);
    const q = `class=${encodeURIComponent(classSel)}&group=${encodeURIComponent(groupSel)}&grade=${gradeSlug}&subject=${subjSlug}`;
    fetch(`/api/admin/schedule/group?${q}`)
      .then(r => r.json())
      .then(d => {
        const mods: ModuleItem[] = d.modules ?? [];
        setModules(mods);
        const init: Record<number, LessonState> = {};
        for (const m of mods) {
          for (const l of m.lessons) {
            const [date, timeRaw] = (l.due_date ?? "").split("T");
            init[l.id] = {
              enabled: l.enabled,
              date:    date ?? "",
              time:    timeRaw?.slice(0, 5) ?? "",
              status:  l.status === "CLOSED" ? "CLOSED" : "OPEN",
            };
          }
        }
        setStates(init);
        setOriginal(JSON.stringify(init));
      })
      .catch(() => setModules([]))
      .finally(() => setLoading(false));
  }, [classSel, groupSel, gradeSlug, subjSlug]);

  useEffect(() => { loadSchedule(); }, [loadSchedule]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const classes = [...new Set(students.map(s => s.class_name))].sort();
  const gradeNum = classSel ? parseInt(classSel) : null;
  const subjectsForGrade = gradeSubjectsList.filter(gs =>
    gradeNum !== null ? gs.gradeNumber === gradeNum : gs.gradeSlug === gradeSlug
  );
  const groupsForClass = [...new Set(
    students.filter(s => s.class_name === classSel && s.group_name).map(s => s.group_name!)
  )].sort();

  const allLessons   = modules.flatMap(m => m.lessons);
  const enabledCount = allLessons.filter(l => states[l.id]?.enabled).length;
  const changed      = JSON.stringify(states) !== original;

  // ── State updaters ────────────────────────────────────────────────────────
  function update(id: number, field: keyof LessonState, value: unknown) {
    setStates(p => ({ ...p, [id]: { ...p[id], [field]: value } }));
  }

  function toggleEnabled(id: number, val?: boolean) {
    update(id, "enabled", val ?? !states[id]?.enabled);
  }

  function toggleStatus(id: number) {
    const cur = states[id]?.status ?? "OPEN";
    update(id, "status", cur === "OPEN" ? "CLOSED" : "OPEN");
  }

  function toggleModule(m: ModuleItem, val: boolean) {
    setStates(p => {
      const next = { ...p };
      for (const l of m.lessons) next[l.id] = { ...next[l.id], enabled: val };
      return next;
    });
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  async function handleSave() {
    if (!classSel || saving) return;
    setSaving(true);
    const items = allLessons.map(l => {
      const s = states[l.id];
      const due_date = s?.date ? `${s.date}T${s.time || "00:00"}:00.000Z` : null;
      return { item_id: l.id, enabled: s?.enabled ?? false, due_date, status: s?.status ?? "OPEN" };
    });
    try {
      await fetch("/api/admin/schedule/group", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ class_name: classSel, group_name: groupSel || null, items }),
      });
      setOriginal(JSON.stringify(states));
      setSavedMsg(`✓ ${enabledCount} dərs saxlandı`);
      setTimeout(() => setSavedMsg(""), 3000);
    } catch {}
    setSaving(false);
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex gap-5 min-h-0">

      {/* ── LEFT PANEL ──────────────────────────────────────────────────── */}
      <div className="w-64 shrink-0 space-y-4">

        {/* Class pills */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">🏫 Sinif</p>
          {classes.length === 0
            ? <p className="text-xs text-slate-400 italic">Şagird yoxdur</p>
            : (
              <div className="flex flex-wrap gap-1.5">
                {classes.map(cls => (
                  <button key={cls} type="button"
                    onClick={() => { setClassSel(cls); setGroupSel(""); }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                      classSel === cls
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                        : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
                    }`}>
                    {cls}
                  </button>
                ))}
              </div>
            )
          }
        </div>

        {/* Group pills */}
        {classSel && groupsForClass.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">👥 Qrup</p>
            <div className="flex flex-wrap gap-1.5">
              <button type="button" onClick={() => setGroupSel("")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                  !groupSel ? "bg-slate-700 text-white border-slate-700" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                }`}>
                Bütün sinif
              </button>
              {groupsForClass.map(g => (
                <button key={g} type="button" onClick={() => setGroupSel(g)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                    groupSel === g ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-500 border-slate-200 hover:border-indigo-300"
                  }`}>
                  {g}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Platform / Subject */}
        {classSel && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-2">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">📚 Platform</p>
            {subjectsForGrade.length === 0
              ? <p className="text-xs text-slate-400 italic">Bu sinif üçün platforma yoxdur</p>
              : subjectsForGrade.map(s => (
                  <button key={s.subjSlug} type="button"
                    onClick={() => { setSubjSlug(s.subjSlug); setGradeSlug(s.gradeSlug); }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      subjSlug === s.subjSlug
                        ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                        : "text-slate-600 hover:bg-slate-50 border border-transparent"
                    }`}>
                    {s.subjIcon ?? "📚"} {s.subjLabel}
                  </button>
                ))
            }
          </div>
        )}

        {/* Stats */}
        {classSel && modules.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-2">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">📊 Statistika</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Aktiv dərslər</span>
              <span className="font-bold text-indigo-600">{enabledCount} / {allLessons.length}</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full transition-all"
                style={{ width: allLessons.length > 0 ? `${Math.round(enabledCount / allLessons.length * 100)}%` : "0%" }} />
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
              <span>{allLessons.filter(l => states[l.id]?.status === "OPEN" && states[l.id]?.enabled).length} açıq</span>
              <span>{allLessons.filter(l => states[l.id]?.status === "CLOSED" && states[l.id]?.enabled).length} bağlı</span>
            </div>
          </div>
        )}
      </div>

      {/* ── RIGHT PANEL ─────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 overflow-x-auto">

        {/* Toolbar */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-slate-800 truncate">
              {classSel
                ? `${classSel}${groupSel ? ` · ${groupSel}` : ""} — Dərslər və cədvəl`
                : "Dərslər və cədvəl"}
            </h3>
          </div>
          {loading && <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin shrink-0" />}
          {savedMsg && <span className="text-xs text-emerald-600 font-semibold shrink-0">{savedMsg}</span>}
          {changed && !savedMsg && (
            <span className="text-xs text-amber-500 font-medium shrink-0">● Yadda saxlanmayıb</span>
          )}
          <button type="button" onClick={handleSave}
            disabled={saving || !changed || !classSel || modules.length === 0}
            className="shrink-0 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700
                       disabled:opacity-40 disabled:cursor-not-allowed
                       text-white text-sm font-semibold transition-colors shadow-sm">
            {saving ? "⏳ Saxlanır…" : "✓ Saxla"}
          </button>
        </div>

        {/* Empty states */}
        {!classSel && (
          <div className="py-20 rounded-2xl bg-white border border-slate-200 shadow-sm text-center">
            <p className="text-5xl mb-3">🏫</p>
            <p className="text-slate-500 text-sm font-medium">Sol paneldən sinif seçin</p>
            <p className="text-slate-400 text-xs mt-1">Sonra platformanı seçin — dərslər avtomatik yüklənəcək</p>
          </div>
        )}
        {classSel && loading && (
          <div className="py-20 rounded-2xl bg-white border border-slate-200 text-center">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Dərslər yüklənir…</p>
          </div>
        )}
        {classSel && !loading && modules.length === 0 && (
          <div className="py-20 rounded-2xl bg-white border border-slate-200 shadow-sm text-center">
            <p className="text-5xl mb-3">📭</p>
            <p className="text-slate-500 text-sm font-medium">Bu platforma üçün məzmun tapılmadı</p>
            <p className="text-slate-400 text-xs mt-1">İdarəetmə → Fənlər bölməsindən əlavə edin</p>
          </div>
        )}

        {/* Module + Lesson table */}
        {classSel && !loading && modules.length > 0 && (
          <div className="space-y-4">
            {modules.map(m => {
              const allSel  = m.lessons.length > 0 && m.lessons.every(l => states[l.id]?.enabled);
              const someSel = m.lessons.some(l => states[l.id]?.enabled);
              return (
                <div key={m.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

                  {/* Module header — dark row like Algorithmics */}
                  <div className="flex items-center gap-3 px-4 py-3 bg-slate-800">
                    <input type="checkbox"
                      checked={allSel}
                      ref={el => { if (el) el.indeterminate = someSel && !allSel; }}
                      onChange={e => toggleModule(m, e.target.checked)}
                      className="w-4 h-4 rounded accent-indigo-400 cursor-pointer shrink-0"
                    />
                    <p className="text-sm font-bold text-white uppercase tracking-wide flex-1 truncate">
                      MODUL {m.order}. {m.title_az}
                    </p>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {m.lessons.filter(l => states[l.id]?.enabled).length} / {m.lessons.length}
                    </span>
                  </div>

                  {/* Column labels */}
                  <div className="grid px-4 py-1.5 bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest gap-2"
                    style={{ gridTemplateColumns: "44px 36px 210px 1fr 130px 36px" }}>
                    <span></span>
                    <span>#</span>
                    <span>Zaman</span>
                    <span>Dərs</span>
                    <span>Status</span>
                    <span></span>
                  </div>

                  {/* Lesson rows */}
                  <div className="divide-y divide-slate-50">
                    {m.lessons.length === 0 && (
                      <p className="px-4 py-3 text-xs text-slate-400 italic">Bu modul üçün dərs yoxdur</p>
                    )}
                    {m.lessons.map(l => {
                      const s = states[l.id] ?? { enabled: false, date: "", time: "", status: "OPEN" as const };
                      return (
                        <div key={l.id}
                          className={`grid items-center px-4 py-2.5 gap-2 transition-all ${
                            s.enabled ? "bg-white hover:bg-slate-50/50" : "bg-white opacity-50 hover:opacity-75"
                          }`}
                          style={{ gridTemplateColumns: "44px 36px 210px 1fr 130px 36px" }}>

                          {/* ON/OFF toggle */}
                          <div onClick={() => toggleEnabled(l.id)} className="cursor-pointer">
                            <div className={`relative w-9 h-5 rounded-full transition-colors ${s.enabled ? "bg-indigo-500" : "bg-slate-200"}`}>
                              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200 ${s.enabled ? "left-4" : "left-0.5"}`} />
                            </div>
                          </div>

                          {/* Lesson number */}
                          <span className="text-xs font-bold text-slate-400 tabular-nums">{l.order}</span>

                          {/* Date + Time */}
                          <div className="flex items-center gap-1">
                            <input type="date" value={s.date}
                              onChange={e => {
                                update(l.id, "date", e.target.value);
                                if (e.target.value) update(l.id, "enabled", true);
                              }}
                              className="text-[11px] border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:border-indigo-400 text-slate-700 w-[116px] cursor-pointer"
                            />
                            <input type="time" value={s.time}
                              onChange={e => update(l.id, "time", e.target.value)}
                              disabled={!s.date}
                              className="text-[11px] border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:border-indigo-400 text-slate-700 w-[76px] disabled:opacity-40 cursor-pointer"
                            />
                          </div>

                          {/* Title + code + resource chips */}
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-800 leading-tight truncate">{l.title_az}</p>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{l.code}</p>
                            {(l.resources?.length ?? 0) > 0 && (
                              <div className="mt-1 flex flex-wrap gap-1">
                                {l.resources!.map(r => {
                                  const filename = r.content_url?.split("/").pop() ?? r.slug;
                                  return (
                                    <a key={r.id}
                                      href={r.content_url ?? "#"}
                                      target="_blank" rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-slate-200
                                                 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200
                                                 text-[10px] text-slate-500 hover:text-indigo-600 font-mono
                                                 transition-colors">
                                      {TYPE_ICONS[r.type] ?? "📄"} {filename}
                                    </a>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          {/* Status badge */}
                          <button type="button"
                            onClick={() => { if (s.enabled) toggleStatus(l.id); }}
                            disabled={!s.enabled}
                            className={`flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all w-full ${
                              !s.enabled
                                ? "bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed"
                                : s.status === "OPEN"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                  : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                            }`}>
                            {!s.enabled ? "—" : s.status === "OPEN" ? "Açıqdır ▾" : "Bağlıdır ▾"}
                          </button>

                          {/* + / × toggle */}
                          <button type="button"
                            onClick={() => toggleEnabled(l.id)}
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                              s.enabled
                                ? "bg-slate-100 text-slate-400 hover:bg-rose-50 hover:text-rose-500"
                                : "bg-slate-100 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600"
                            }`}>
                            {s.enabled ? "×" : "+"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
