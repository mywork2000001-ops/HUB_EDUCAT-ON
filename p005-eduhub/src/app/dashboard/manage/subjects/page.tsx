"use client";
import { useState, useEffect, useCallback } from "react";

type Subject = { id: number; slug: string; label_az: string; label_ru: string; icon: string | null };
type GradeSubject = { subject: Subject };
type Grade = { id: number; number: number; label_az: string; slug: string; subjects: GradeSubject[] };

const SUBJECT_PRESETS = [
  { slug: "math",         label_az: "Riyaziyyat",        label_ru: "Математика",        icon: "📐" },
  { slug: "informatics",  label_az: "İnformatika",       label_ru: "Информатика",       icon: "💻" },
  { slug: "algorithmics", label_az: "Alqoritmlər",       label_ru: "Алгоритмика",       icon: "🧩" },
  { slug: "physics",      label_az: "Fizika",            label_ru: "Физика",            icon: "⚛️" },
  { slug: "chemistry",    label_az: "Kimya",             label_ru: "Химия",             icon: "🧪" },
  { slug: "biology",      label_az: "Biologiya",         label_ru: "Биология",          icon: "🌿" },
  { slug: "history",      label_az: "Tarix",             label_ru: "История",           icon: "📜" },
  { slug: "language",     label_az: "Azərbaycan dili",   label_ru: "Азерб. язык",       icon: "🗣️" },
  { slug: "english",      label_az: "İngilis dili",      label_ru: "Английский язык",   icon: "🌐" },
  { slug: "geography",    label_az: "Coğrafiya",         label_ru: "География",         icon: "🌍" },
  { slug: "arts",         label_az: "İncəsənət",         label_ru: "Искусство",         icon: "🎨" },
  { slug: "music",        label_az: "Musiqi",            label_ru: "Музыка",            icon: "🎵" },
  { slug: "pe",           label_az: "Bədən tərbiyəsi",   label_ru: "Физкультура",       icon: "🏃" },
  // NOT listed: block-exam, taim-2026 — they are testing platforms, not class subjects
];

const EMPTY_FORM = { label_az: "", label_ru: "", slug: "", icon: "" };

export default function ManageSubjectsPage() {
  const [grades, setGrades]         = useState<Grade[]>([]);
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [loading, setLoading]       = useState(false);
  const [openGrade, setOpenGrade]   = useState<number | null>(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [useExisting, setUseExisting] = useState<number | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/subjects");
    const d = await res.json();
    setGrades(d.grades ?? []);
    setAllSubjects(d.allSubjects ?? []);
  }, []);

  useEffect(() => { load(); }, [load]);

  function slugify(s: string) {
    return s.toLowerCase()
      .replace(/ə/g,"e").replace(/ö/g,"o").replace(/ü/g,"u").replace(/ğ/g,"g")
      .replace(/ı/g,"i").replace(/ş/g,"sh").replace(/ç/g,"ch")
      .replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");
  }

  function applyPreset(p: typeof SUBJECT_PRESETS[0]) {
    setForm({ label_az: p.label_az, label_ru: p.label_ru, slug: p.slug, icon: p.icon });
    setUseExisting(null);
  }

  function handleLabelChange(val: string) {
    setForm(f => ({ ...f, label_az: val, slug: slugify(val) }));
  }

  async function handleAdd(gradeId: number) {
    setLoading(true);
    try {
      const body = useExisting !== null
        ? { grade_id: gradeId, subject_id: useExisting }
        : { grade_id: gradeId, ...form };

      const res = await fetch("/api/admin/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setForm(EMPTY_FORM);
      setUseExisting(null);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Xəta baş verdi");
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(gradeId: number, subjectId: number) {
    if (!confirm("Bu fənni bu sinifdən silmək istədiyinizə əminsiniz?")) return;
    await fetch(`/api/admin/subjects?grade_id=${gradeId}&subject_id=${subjectId}`, { method: "DELETE" });
    await load();
  }

  const fd = "w-full bg-white text-slate-900 rounded-lg px-3 py-2 text-sm border border-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10";

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Fənlər</h1>
        <p className="text-slate-400 text-sm mt-0.5">Hər sinif üçün fənlər idarə edin</p>
      </div>

      <div className="space-y-4">
        {grades.map((grade) => {
          const isOpen = openGrade === grade.id;
          const gradeSubjects = grade.subjects.map((gs) => gs.subject);
          // Subjects not yet added to this grade
          const available = allSubjects.filter(
            (s) => !gradeSubjects.some((gs) => gs.id === s.id)
          );

          return (
            <div key={grade.id} className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
              <button
                onClick={() => setOpenGrade(isOpen ? null : grade.id)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-slate-300 font-medium">{grade.label_az}</span>
                  <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
                    {gradeSubjects.length} fənn
                  </span>
                </div>
                <span className="text-slate-500 text-xs">{isOpen ? "▲" : "▼"}</span>
              </button>

              {isOpen && (
                <div className="border-t border-slate-800 p-4 space-y-4">
                  {/* Existing subjects */}
                  {gradeSubjects.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {gradeSubjects.map((sub) => (
                        <div key={sub.id} className="flex items-center gap-1.5 bg-slate-800 rounded-lg px-3 py-1.5">
                          <span>{sub.icon ?? "📚"}</span>
                          <span className="text-sm text-slate-200">{sub.label_az}</span>
                          <button
                            onClick={() => handleRemove(grade.id, sub.id)}
                            className="ml-1 text-slate-500 hover:text-red-400 transition-colors text-xs"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add form */}
                  <div className="pt-2 border-t border-slate-800/60">
                    <p className="text-xs font-semibold text-slate-400 mb-3">Fənn əlavə et</p>

                    {/* Presets */}
                    <div className="mb-3">
                      <p className="text-xs text-slate-500 mb-1.5">Hazır fənlər:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {SUBJECT_PRESETS.map((p) => {
                          const alreadyAdded = gradeSubjects.some((gs) => gs.slug === p.slug);
                          return (
                            <button
                              key={p.slug}
                              onClick={() => !alreadyAdded && applyPreset(p)}
                              disabled={alreadyAdded}
                              className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${
                                alreadyAdded
                                  ? "bg-slate-800/40 text-slate-600 cursor-not-allowed"
                                  : form.slug === p.slug
                                    ? "bg-indigo-600 text-white"
                                    : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                              }`}
                            >
                              {p.icon} {p.label_az}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Existing subjects not in grade */}
                    {available.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs text-slate-500 mb-1.5">Mövcud fənlər (digər siniflər üçün):</p>
                        <div className="flex flex-wrap gap-1.5">
                          {available.map((s) => (
                            <button
                              key={s.id}
                              onClick={() => { setUseExisting(s.id); setForm(EMPTY_FORM); }}
                              className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${
                                useExisting === s.id
                                  ? "bg-green-700 text-white"
                                  : "bg-slate-800/60 text-slate-400 hover:bg-slate-700 hover:text-white border border-dashed border-slate-700"
                              }`}
                            >
                              {s.icon ?? "📚"} {s.label_az}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Custom subject form */}
                    {useExisting === null && (
                      <div className="space-y-2 mb-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs text-slate-500 mb-1 block">Adı (AZ) *</label>
                            <input className={fd} placeholder="Riyaziyyat 5A" value={form.label_az}
                              onChange={(e) => handleLabelChange(e.target.value)} />
                          </div>
                          <div>
                            <label className="text-xs text-slate-500 mb-1 block">Adı (RU)</label>
                            <input className={fd} placeholder="Математика 5А" value={form.label_ru}
                              onChange={(e) => setForm((f) => ({ ...f, label_ru: e.target.value }))} />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs text-slate-500 mb-1 block">İkon (emoji)</label>
                            <input className={fd} placeholder="📐" value={form.icon}
                              onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))} />
                          </div>
                          <div>
                            <label className="text-xs text-slate-400 mb-1 block">Slug (avtomatik)</label>
                            <div className="px-3 py-2 rounded-lg text-sm bg-slate-50 border border-slate-200 text-slate-400 font-mono truncate">
                              {form.slug || "ad yazdıqca avtomatik"}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {useExisting !== null && (
                      <div className="mb-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700 flex items-center justify-between">
                        <span>✓ {allSubjects.find((s) => s.id === useExisting)?.label_az} → bu sinifə əlavə ediləcək</span>
                        <button className="text-slate-400 hover:text-slate-700 ml-2" onClick={() => setUseExisting(null)}>✕</button>
                      </div>
                    )}

                    <button
                      onClick={() => handleAdd(grade.id)}
                      disabled={loading || (useExisting === null && !form.label_az)}
                      className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40
                                 text-white text-sm font-medium transition-colors shadow-sm"
                    >
                      {loading ? "Əlavə edilir…" : "+ Əlavə et"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
