"use client";

import { useState, useEffect, useCallback } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────
type GradeSubjectItem = {
  gradeSlug:    string;
  gradeNumber:  number;
  gradeLabel:   string;
  subjSlug:     string;
  subjLabel:    string;
  subjIcon:     string | null;
};
type StudentItem = {
  id: string; name: string; class_name: string; group_name: string | null;
};
type ResourceRow = { id: number; type: string; title_az: string; slug: string };
type LessonRow   = { id: number; title_az: string; slug: string; order: number; resources: ResourceRow[] };
type ModuleRow   = { id: number; title_az: string; slug: string; order: number; lessons: LessonRow[] };

const RES_ICON: Record<string, string> = {
  LESSON: "📄", TEST: "📝", TAIM_TEST: "🎓", VIDEO: "▶️", WORKBOOK: "📒", BSQ: "📊", KSQ: "📋",
};

function setsEqual(a: Set<number>, b: Set<number>) {
  if (a.size !== b.size) return false;
  for (const x of a) if (!b.has(x)) return false;
  return true;
}

// ── Indeterminate checkbox ────────────────────────────────────────────────────
function IndeterminateCheckbox({
  checked, indeterminate, onChange,
}: { checked: boolean; indeterminate: boolean; onChange: (v: boolean) => void }) {
  return (
    <input
      type="checkbox"
      checked={checked}
      ref={(el) => { if (el) el.indeterminate = indeterminate; }}
      onChange={(e) => onChange(e.target.checked)}
      className="w-4 h-4 accent-indigo-600 cursor-pointer rounded"
    />
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function ActivationPanel({
  gradeSubjectsList,
}: {
  gradeSubjectsList: GradeSubjectItem[];
}) {
  // ── Target state ──────────────────────────────────────────────────────────
  const [targetMode, setTargetMode] = useState<"class" | "group" | "student">("class");
  const [classSel,   setClassSel]   = useState("");
  const [groupSel,   setGroupSel]   = useState("");
  const [studentSel, setStudentSel] = useState("");

  // ── Curriculum state ──────────────────────────────────────────────────────
  const [gradeSlug, setGradeSlug] = useState(gradeSubjectsList[0]?.gradeSlug ?? "");
  const [subjSlug,  setSubjSlug]  = useState(gradeSubjectsList[0]?.subjSlug  ?? "");
  const [modules,   setModules]   = useState<ModuleRow[]>([]);
  const [expanded,  setExpanded]  = useState<Set<number>>(new Set());
  const [loadingTree, setLoadingTree] = useState(false);

  // ── Assignment state ──────────────────────────────────────────────────────
  const [selectedIds,   setSelectedIds]   = useState<Set<number>>(new Set());
  const [originalIds,   setOriginalIds]   = useState<Set<number>>(new Set());
  const [loadingAssign, setLoadingAssign] = useState(false);
  const [saving,        setSaving]        = useState(false);
  const [savedMsg,      setSavedMsg]      = useState("");
  const [dueDate,       setDueDate]       = useState("");

  // ── Student data ──────────────────────────────────────────────────────────
  const [students, setStudents] = useState<StudentItem[]>([]);

  useEffect(() => {
    fetch("/api/admin/students")
      .then(r => r.json())
      .then(d => setStudents(d.students ?? []))
      .catch(() => {});
  }, []);

  // ── Derived ───────────────────────────────────────────────────────────────
  const classes = [...new Set(students.map(s => s.class_name))].sort();

  const gradeNum = classSel ? parseInt(classSel) : null;
  const subjectsForGrade = gradeSubjectsList.filter(gs =>
    gradeNum !== null ? gs.gradeNumber === gradeNum : gs.gradeSlug === gradeSlug
  );

  const groupsForClass = [...new Set(
    students
      .filter(s => s.class_name === classSel && s.group_name)
      .map(s => s.group_name!)
  )].sort();

  const studentsForGroup = students.filter(s =>
    s.class_name === classSel && (targetMode !== "group" || !groupSel || s.group_name === groupSel)
  );

  const allLessonIds = modules.flatMap(m => m.lessons.map(l => l.id));
  const changed      = !setsEqual(selectedIds, originalIds);
  const addedCount   = [...selectedIds].filter(id => !originalIds.has(id)).length;
  const removedCount = [...originalIds].filter(id => !selectedIds.has(id)).length;

  // ── Auto-detect grade from class name ────────────────────────────────────
  useEffect(() => {
    if (!classSel) return;
    const num = parseInt(classSel);
    if (isNaN(num)) return;
    const found = gradeSubjectsList.find(gs => gs.gradeNumber === num);
    if (found) {
      setGradeSlug(found.gradeSlug);
      setSubjSlug(found.subjSlug);
    }
  }, [classSel, gradeSubjectsList]);

  // ── Load tree when grade+subject changes ──────────────────────────────────
  useEffect(() => {
    if (!gradeSlug || !subjSlug) return;
    setLoadingTree(true);
    fetch(`/api/admin/schedule/tree?grade=${gradeSlug}&subject=${subjSlug}`)
      .then(r => r.json())
      .then(d => {
        const mods: ModuleRow[] = d.modules ?? [];
        setModules(mods);
        setExpanded(new Set(mods.map(m => m.id)));
      })
      .catch(() => setModules([]))
      .finally(() => setLoadingTree(false));
  }, [gradeSlug, subjSlug]);

  // ── Load assignments when target changes ──────────────────────────────────
  const getTargetQuery = useCallback(() => {
    if (targetMode === "student" && studentSel) return `student=${studentSel}`;
    if (targetMode === "group"   && classSel && groupSel) return `class=${encodeURIComponent(classSel)}&group=${encodeURIComponent(groupSel)}`;
    if (classSel) return `class=${encodeURIComponent(classSel)}`;
    return "";
  }, [targetMode, classSel, groupSel, studentSel]);

  useEffect(() => {
    const q = getTargetQuery();
    if (!q) { setSelectedIds(new Set()); setOriginalIds(new Set()); return; }

    setLoadingAssign(true);
    fetch(`/api/admin/schedule/activate?${q}`)
      .then(r => r.json())
      .then(d => {
        const ids = new Set<number>(d.assignedItemIds ?? []);
        setSelectedIds(new Set(ids));
        setOriginalIds(new Set(ids));
      })
      .catch(() => {})
      .finally(() => setLoadingAssign(false));
  }, [getTargetQuery]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  function toggleLesson(id: number) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleModule(m: ModuleRow, checked: boolean) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      for (const l of m.lessons) {
        if (checked) next.add(l.id); else next.delete(l.id);
      }
      return next;
    });
  }

  function toggleExpand(id: number) {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selectedIds.size < allLessonIds.length) {
      setSelectedIds(new Set(allLessonIds));
    } else {
      setSelectedIds(new Set());
    }
  }

  async function handleSave() {
    const q = getTargetQuery();
    if (!q) return;
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        item_ids: [...selectedIds],
        ...(dueDate ? { due_date: dueDate } : {}),
      };
      if (targetMode === "student" && studentSel) {
        body.student_id = studentSel;
      } else if (targetMode === "group" && classSel && groupSel) {
        body.class_name = classSel;
        body.group_name = groupSel;
      } else {
        body.class_name = classSel;
      }
      await fetch("/api/admin/schedule/activate", {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });
      setOriginalIds(new Set(selectedIds));
      const target = targetMode === "student" && studentSel
        ? students.find(s => s.id === studentSel)?.name ?? "şagird"
        : classSel;
      setSavedMsg(`✓ ${selectedIds.size} dərs — ${target}`);
      setTimeout(() => setSavedMsg(""), 3000);
    } catch {}
    setSaving(false);
  }

  const modAllSel  = (m: ModuleRow) => m.lessons.length > 0 && m.lessons.every(l => selectedIds.has(l.id));
  const modSomeSel = (m: ModuleRow) => m.lessons.some(l => selectedIds.has(l.id));

  const hasTarget = !!getTargetQuery();

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex gap-5 min-h-0">

      {/* ── LEFT PANEL ─────────────────────────────────────────────────── */}
      <div className="w-68 shrink-0 space-y-4">

        {/* Target selector */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3.5">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">🎯 Hədəf</p>

          {/* Mode tabs */}
          <div className="flex bg-slate-100 rounded-xl p-0.5 gap-0.5">
            {(["class", "group", "student"] as const).map(m => (
              <button key={m} type="button"
                onClick={() => { setTargetMode(m); setGroupSel(""); setStudentSel(""); }}
                className={`flex-1 text-[11px] py-1.5 rounded-lg font-semibold transition-colors ${
                  targetMode === m ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-700"
                }`}>
                {m === "class" ? "Sinif" : m === "group" ? "Qrup" : "Şagird"}
              </button>
            ))}
          </div>

          {/* Class pills */}
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Sinif</p>
            {classes.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Şagird yoxdur</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {classes.map(cls => (
                  <button key={cls} type="button"
                    onClick={() => { setClassSel(cls); setGroupSel(""); setStudentSel(""); }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                      classSel === cls
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                        : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
                    }`}>
                    {cls}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Group pills */}
          {targetMode !== "class" && groupsForClass.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Qrup</p>
              <div className="flex flex-wrap gap-1.5">
                <button type="button" onClick={() => setGroupSel("")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                    !groupSel ? "bg-slate-700 text-white border-slate-700" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                  }`}>Hamısı</button>
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

          {/* Student dropdown — shown directly in student mode, no class pre-selection required */}
          {targetMode === "student" && (
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Şagird</p>
              <select
                value={studentSel}
                onChange={e => {
                  const id = e.target.value;
                  setStudentSel(id);
                  // Auto-fill class from selected student so curriculum tree loads correctly
                  const found = students.find(s => s.id === id);
                  if (found) setClassSel(found.class_name);
                }}
                className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-white focus:outline-none focus:border-indigo-400 text-slate-700">
                <option value="">— Şagird seçin —</option>
                {[...students]
                  .sort((a, b) => a.class_name.localeCompare(b.class_name) || a.name.localeCompare(b.name))
                  .map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} · {s.class_name}{s.group_name ? ` (${s.group_name})` : ""}
                    </option>
                  ))}
              </select>
              {studentSel && classSel && (
                <p className="text-[10px] text-indigo-500 mt-1.5 font-medium">
                  Sinif: {classSel} · Sağ paneldən dərsi seçib saxlayın
                </p>
              )}
            </div>
          )}
        </div>

        {/* Subject selector */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">📚 Fənn</p>
          {subjectsForGrade.length === 0 ? (
            <p className="text-xs text-slate-400 italic">
              {classSel
                ? "Bu sinif üçün fənn yoxdur"
                : targetMode === "student"
                  ? "Əvvəlcə şagird seçin"
                  : "Sinif seçin"}
            </p>
          ) : (
            <div className="space-y-1">
              {subjectsForGrade.map(s => (
                <button key={s.subjSlug} type="button"
                  onClick={() => { setSubjSlug(s.subjSlug); setGradeSlug(s.gradeSlug); }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    subjSlug === s.subjSlug
                      ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
                  }`}>
                  {s.subjIcon ?? "📚"} {s.subjLabel}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Due date */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">📅 Son tarix</p>
          <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-400 bg-white text-slate-700" />
          {dueDate && (
            <button type="button" onClick={() => setDueDate("")}
              className="text-[11px] text-slate-400 mt-1.5 hover:text-slate-600 transition-colors">
              × Sil
            </button>
          )}
        </div>
      </div>

      {/* ── RIGHT PANEL ────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0">

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <h3 className="text-base font-bold text-slate-800 shrink-0">Dərs aktivasiyası</h3>
            {(loadingTree || loadingAssign) && (
              <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin shrink-0" />
            )}
            {hasTarget && !loadingAssign && (
              <span className="text-xs text-slate-400 truncate">
                {selectedIds.size} / {allLessonIds.length} aktiv
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {savedMsg && (
              <span className="text-xs text-emerald-600 font-semibold">{savedMsg}</span>
            )}
            {changed && !savedMsg && (
              <span className="text-xs text-slate-400">
                {addedCount > 0   && <span className="text-emerald-600 font-medium">+{addedCount} </span>}
                {removedCount > 0 && <span className="text-red-500 font-medium">-{removedCount}</span>}
              </span>
            )}
            {allLessonIds.length > 0 && (
              <button type="button" onClick={toggleAll}
                className="text-xs text-indigo-500 hover:text-indigo-700 font-medium transition-colors">
                {selectedIds.size < allLessonIds.length ? "Hamısını seç" : "Hamısını sil"}
              </button>
            )}
            <button type="button" onClick={handleSave}
              disabled={saving || !changed || !hasTarget}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700
                         disabled:opacity-40 disabled:cursor-not-allowed
                         text-white text-sm font-semibold transition-colors shadow-sm">
              {saving ? "⏳ Saxlanır…" : "✓ Saxla"}
            </button>
          </div>
        </div>

        {/* No target */}
        {!hasTarget && (
          <div className="py-20 rounded-2xl bg-white border border-slate-200 shadow-sm text-center">
            <p className="text-5xl mb-3">🎯</p>
            <p className="text-slate-500 text-sm font-medium">Sol paneldən sinif seçin</p>
            <p className="text-slate-400 text-xs mt-1">Dərslər seçdikdən sonra görünəcək</p>
          </div>
        )}

        {/* Loading tree */}
        {hasTarget && loadingTree && (
          <div className="py-20 rounded-2xl bg-white border border-slate-200 text-center">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Mövzular yüklənir…</p>
          </div>
        )}

        {/* Empty */}
        {hasTarget && !loadingTree && modules.length === 0 && (
          <div className="py-20 rounded-2xl bg-white border border-slate-200 shadow-sm text-center">
            <p className="text-5xl mb-3">📭</p>
            <p className="text-slate-500 text-sm font-medium">Bu fənn üçün mövzu tapılmadı</p>
            <p className="text-slate-400 text-xs mt-1">Məzmun əlavə edin: Tənzimləmə → Fənlər</p>
          </div>
        )}

        {/* Module list */}
        {hasTarget && !loadingTree && modules.length > 0 && (
          <div className="space-y-3">
            {modules.map(m => {
              const allSel  = modAllSel(m);
              const someSel = modSomeSel(m);
              const isOpen  = expanded.has(m.id);
              const activeCnt = m.lessons.filter(l => selectedIds.has(l.id)).length;

              return (
                <div key={m.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

                  {/* Module header */}
                  <div
                    className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-colors ${
                      someSel ? "bg-indigo-50/50" : "bg-white hover:bg-slate-50"
                    }`}
                    onClick={() => toggleExpand(m.id)}>
                    <div onClick={e => e.stopPropagation()}>
                      <IndeterminateCheckbox
                        checked={allSel}
                        indeterminate={someSel && !allSel}
                        onChange={v => toggleModule(m, v)}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 leading-tight truncate">{m.title_az}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {m.lessons.length} dərs
                        {someSel && (
                          <span className={`ml-1.5 font-semibold ${allSel ? "text-emerald-600" : "text-amber-500"}`}>
                            · {activeCnt} aktiv
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {someSel && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          allSel
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}>
                          {allSel ? "Tam" : `${activeCnt}/${m.lessons.length}`}
                        </span>
                      )}
                      <span className={`text-slate-300 text-xs transition-transform ${isOpen ? "rotate-180" : ""}`}>▼</span>
                    </div>
                  </div>

                  {/* Lessons */}
                  {isOpen && (
                    <div className="border-t border-slate-100 divide-y divide-slate-50">
                      {m.lessons.length === 0 && (
                        <p className="px-4 py-3 text-xs text-slate-400 italic">Bu modul üçün dərs yoxdur</p>
                      )}
                      {m.lessons.map(l => {
                        const on = selectedIds.has(l.id);
                        return (
                          <div key={l.id}
                            onClick={() => toggleLesson(l.id)}
                            className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors select-none ${
                              on ? "bg-indigo-50/30 hover:bg-indigo-50/50" : "hover:bg-slate-50"
                            }`}>

                            {/* Toggle switch */}
                            <div className={`relative w-9 h-5 rounded-full shrink-0 transition-colors ${on ? "bg-indigo-500" : "bg-slate-200"}`}>
                              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200 ${on ? "left-4" : "left-0.5"}`} />
                            </div>

                            {/* Number circle */}
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                              on ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"
                            }`}>
                              {l.order}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium leading-tight truncate transition-colors ${
                                on ? "text-slate-800" : "text-slate-500"
                              }`}>
                                {l.title_az}
                              </p>
                              {l.resources.length > 0 && (
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  {l.resources.map(r => (
                                    <span key={r.id} title={r.title_az}
                                      className="text-[11px] opacity-60">
                                      {RES_ICON[r.type] ?? "📄"}
                                    </span>
                                  ))}
                                  <span className="text-[10px] text-slate-300">
                                    {l.resources.length} resurs
                                  </span>
                                </div>
                              )}
                            </div>

                            {on && (
                              <span className="text-[11px] text-indigo-500 font-semibold shrink-0">✓ Aktiv</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
