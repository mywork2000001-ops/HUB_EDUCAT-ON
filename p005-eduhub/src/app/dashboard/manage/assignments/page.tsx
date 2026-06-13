"use client";
import { useState, useEffect, useCallback } from "react";

type Topic   = { id: number; title_az: string; grade_id: number; subject_id: number };
type Student = { id: string; name: string; class_name: string; group_name: string | null };
type Assignment = {
  id: number; class_name: string | null; group_name: string | null; student_id: string | null;
  due_date: string | null; note: string | null; created_at: string;
  item: { title_az: string }; student: { name: string } | null;
};

const EMPTY = { item_id: "", target: "class", class_name: "", custom_class: "", group_name: "", student_id: "", due_date: "", note: "" };

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [topics,   setTopics]   = useState<Topic[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [form, setForm] = useState(EMPTY);

  const load = useCallback(async () => {
    const [a, s] = await Promise.all([
      fetch("/api/admin/assignments").then((r) => r.json()),
      fetch("/api/admin/students").then((r) => r.json()),
    ]);
    setAssignments(a.assignments ?? []);
    setStudents(s.students ?? []);
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    fetch("/api/admin/assignments/topics")
      .then((r) => r.json())
      .then((d) => setTopics(d.topics ?? []))
      .catch(() => {});
  }, []);

  const classes = [...new Set(students.map((s) => s.class_name))].sort();

  function effectiveClass() {
    return form.class_name === "__custom__" ? form.custom_class.trim() : form.class_name;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cls = effectiveClass();
    if (form.target === "class" && !cls) return;
    if (form.target === "student" && !form.student_id) return;
    setLoading(true);
    try {
      const body: Record<string, unknown> = { item_id: Number(form.item_id) };
      if (form.target === "class") {
        body.class_name = cls;
        if (form.group_name.trim()) body.group_name = form.group_name.trim();
      }
      if (form.target === "student") body.student_id = form.student_id;
      if (form.due_date) body.due_date = form.due_date;
      if (form.note.trim()) body.note = form.note.trim();

      const res = await fetch("/api/admin/assignments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setShowForm(false);
      setForm(EMPTY);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Xəta baş verdi");
    } finally { setLoading(false); }
  }

  async function handleDelete(id: number) {
    if (!confirm("Bu tə'yinatı silmək istədiyinizə əminsiniz?")) return;
    await fetch(`/api/admin/assignments?id=${id}`, { method: "DELETE" });
    await load();
  }

  const fd = "w-full bg-slate-800 text-white rounded-lg px-3 py-2 text-sm border border-slate-700 focus:outline-none focus:border-indigo-500";

  // Group assignments by target type for display
  const byClass: Record<string, Assignment[]> = {};
  const individual: Assignment[] = [];
  for (const a of assignments) {
    if (a.student_id) { individual.push(a); }
    else {
      const key = a.group_name ? `${a.class_name} · ${a.group_name}` : (a.class_name ?? "?");
      (byClass[key] ??= []).push(a);
    }
  }

  return (
    <div className="p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Tə'yinatlar</h1>
          <p className="text-slate-400 text-sm mt-0.5">Mövzuları sinif, qrup və ya şagirdə tə'yin edin</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">
          {showForm ? "Ləğv et" : "+ Tə'yin et"}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-slate-900 rounded-2xl border border-slate-800 p-5 mb-6 space-y-4">
          <h2 className="text-sm font-semibold text-slate-300">Yeni tə'yinat</h2>

          {/* Topic */}
          <div>
            <label className="block text-slate-400 text-xs mb-1">Mövzu</label>
            <select className={fd} value={form.item_id} onChange={(e) => setForm(f => ({ ...f, item_id: e.target.value }))} required>
              <option value="">Mövzu seçin…</option>
              {topics.map((t) => <option key={t.id} value={t.id}>{t.title_az}</option>)}
            </select>
          </div>

          {/* Target type toggle */}
          <div>
            <label className="block text-slate-400 text-xs mb-1.5">Hədəf</label>
            <div className="flex gap-2">
              {[
                { key: "class",   label: "🏫 Sinif / Qrup" },
                { key: "student", label: "👤 Şagird" },
              ].map(({ key, label }) => (
                <button key={key} type="button"
                  onClick={() => setForm(f => ({ ...f, target: key }))}
                  className={`px-4 py-1.5 rounded-lg text-sm transition-colors ${form.target === key ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Class target */}
          {form.target === "class" && (
            <div className="space-y-3">
              <div>
                <label className="block text-slate-400 text-xs mb-1">Sinif</label>
                {/* Existing class chips */}
                {classes.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {classes.map((c) => (
                      <button key={c} type="button"
                        onClick={() => setForm(f => ({ ...f, class_name: c, custom_class: "" }))}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                          form.class_name === c && form.class_name !== "__custom__"
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                        }`}>
                        {c}
                      </button>
                    ))}
                    <button type="button"
                      onClick={() => setForm(f => ({ ...f, class_name: "__custom__" }))}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                        form.class_name === "__custom__"
                          ? "bg-slate-600 text-white"
                          : "bg-slate-800/50 text-slate-500 hover:bg-slate-700 hover:text-slate-300 border border-dashed border-slate-700"
                      }`}>
                      + Yeni
                    </button>
                  </div>
                )}
                {/* Custom class input */}
                {(form.class_name === "__custom__" || classes.length === 0) && (
                  <input className={fd} value={form.custom_class}
                    onChange={(e) => setForm(f => ({ ...f, custom_class: e.target.value }))}
                    placeholder="Yeni sinif adı (5A, 6B…)" required={form.class_name === "__custom__"} />
                )}
              </div>
              <div>
                <label className="block text-slate-400 text-xs mb-1">Qrup <span className="text-slate-600">(istəyə görə)</span></label>
                <input className={fd} value={form.group_name}
                  onChange={(e) => setForm(f => ({ ...f, group_name: e.target.value }))}
                  placeholder="Qrup 1 — boş qoyulsa bütün sinif üçün" />
              </div>
            </div>
          )}

          {/* Student target */}
          {form.target === "student" && (
            <div>
              <label className="block text-slate-400 text-xs mb-1">Şagird</label>
              <select className={fd} value={form.student_id}
                onChange={(e) => setForm(f => ({ ...f, student_id: e.target.value }))} required>
                <option value="">Şagird seçin…</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} — {s.class_name}{s.group_name ? ` · ${s.group_name}` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Due date + note */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 text-xs mb-1">Son tarix <span className="text-slate-600">(istəyə görə)</span></label>
              <input className={fd} type="date" value={form.due_date} onChange={(e) => setForm(f => ({ ...f, due_date: e.target.value }))} />
            </div>
            <div>
              <label className="block text-slate-400 text-xs mb-1">Qeyd <span className="text-slate-600">(istəyə görə)</span></label>
              <input className={fd} value={form.note} onChange={(e) => setForm(f => ({ ...f, note: e.target.value }))} placeholder="Ev tapşırığı…" />
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-lg py-2.5 text-sm transition-colors">
            {loading ? "Saxlanılır…" : "Tə'yin et"}
          </button>
        </form>
      )}

      {/* Empty state */}
      {assignments.length === 0 && (
        <div className="py-16 rounded-2xl bg-slate-900 border border-slate-800 text-center">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-slate-400 text-sm">Hələ tə'yinat yoxdur.</p>
        </div>
      )}

      {/* Class / group assignments */}
      {Object.keys(byClass).length > 0 && (
        <div className="space-y-4 mb-6">
          {Object.entries(byClass).map(([group, list]) => (
            <section key={group}>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2 px-1">
                {group.includes("·") ? "👥" : "🏫"} {group}
              </p>
              <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                {list.map((a, i) => (
                  <div key={a.id}
                    className={`flex items-center gap-3 px-4 py-3 ${i < list.length - 1 ? "border-b border-slate-800/60" : ""}`}>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate">{a.item.title_az}</p>
                      {(a.due_date || a.note) && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          {a.due_date && <span>📅 {new Date(a.due_date).toLocaleDateString("az")}</span>}
                          {a.note && <span className="ml-2 italic">{a.note}</span>}
                        </p>
                      )}
                    </div>
                    <button onClick={() => handleDelete(a.id)}
                      className="text-xs text-slate-600 hover:text-red-400 transition-colors px-2 py-1 rounded hover:bg-slate-800 shrink-0">
                      Sil
                    </button>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Individual student assignments */}
      {individual.length > 0 && (
        <section>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2 px-1">👤 Fərdi tə'yinatlar</p>
          <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
            {individual.map((a, i) => (
              <div key={a.id}
                className={`flex items-center gap-3 px-4 py-3 ${i < individual.length - 1 ? "border-b border-slate-800/60" : ""}`}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">{a.item.title_az}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {a.student?.name}
                    {a.due_date && <span className="ml-2">📅 {new Date(a.due_date).toLocaleDateString("az")}</span>}
                    {a.note && <span className="ml-2 italic">{a.note}</span>}
                  </p>
                </div>
                <button onClick={() => handleDelete(a.id)}
                  className="text-xs text-slate-600 hover:text-red-400 transition-colors px-2 py-1 rounded hover:bg-slate-800 shrink-0">
                  Sil
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
