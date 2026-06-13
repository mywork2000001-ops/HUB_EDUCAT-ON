"use client";
import { useState, useEffect, useCallback } from "react";

type Topic   = { id: number; title_az: string; slug: string };
type Student = { id: string; name: string; class_name: string; group_name: string | null };
type Assignment = {
  id: number; class_name: string | null; group_name: string | null; student_id: string | null;
  due_date: string | null; note: string | null; created_at: string;
  item: { title_az: string }; student: { name: string; email: string } | null;
};

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [topics,    setTopics]    = useState<Topic[]>([]);
  const [students,  setStudents]  = useState<Student[]>([]);
  const [showForm,  setShowForm]  = useState(false);
  const [loading,   setLoading]   = useState(false);

  const [form, setForm] = useState({
    item_id: "", target: "class", class_name: "", group_name: "", student_id: "", due_date: "", note: "",
  });

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
    fetch("/api/admin/assignments/topics").then((r) => r.json())
      .then((d) => setTopics(d.topics ?? []))
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const body: Record<string, unknown> = { item_id: Number(form.item_id) };
      if (form.target === "class")   { body.class_name = form.class_name; if (form.group_name) body.group_name = form.group_name; }
      if (form.target === "student") body.student_id = form.student_id;
      if (form.due_date) body.due_date = form.due_date;
      if (form.note)     body.note     = form.note;

      await fetch("/api/admin/assignments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      setShowForm(false);
      setForm({ item_id: "", target: "class", class_name: "", group_name: "", student_id: "", due_date: "", note: "" });
      await load();
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    await fetch(`/api/admin/assignments?id=${id}`, { method: "DELETE" });
    await load();
  }

  const field = "w-full bg-slate-800 text-white rounded-lg px-3 py-2 text-sm border border-slate-700 focus:outline-none focus:border-indigo-500";
  const classes = [...new Set(students.map((s) => s.class_name))].sort();

  return (
    <div className="p-6 max-w-4xl">
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

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-slate-900 rounded-2xl border border-slate-800 p-5 mb-6 space-y-4">
          <h2 className="text-sm font-semibold text-slate-300">Yeni tə'yinat</h2>

          <div>
            <label className="block text-slate-400 text-xs mb-1">Mövzu</label>
            <select className={field} value={form.item_id} onChange={(e) => setForm(f => ({ ...f, item_id: e.target.value }))} required>
              <option value="">Mövzu seçin…</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id}>{t.title_az}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 text-xs mb-1">Hədəf</label>
            <div className="flex gap-3">
              {["class", "student"].map((t) => (
                <button key={t} type="button" onClick={() => setForm(f => ({ ...f, target: t }))}
                  className={`px-4 py-1.5 rounded-lg text-sm transition-colors ${form.target === t ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}>
                  {t === "class" ? "Sinif / Qrup" : "Şagird"}
                </button>
              ))}
            </div>
          </div>

          {form.target === "class" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 text-xs mb-1">Sinif</label>
                <select className={field} value={form.class_name} onChange={(e) => setForm(f => ({ ...f, class_name: e.target.value }))} required>
                  <option value="">Seçin…</option>
                  {classes.map((c) => <option key={c} value={c}>{c}</option>)}
                  <option value="__custom__">Digər (əl ilə)</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 text-xs mb-1">Qrup (istəyə görə)</label>
                <input className={field} value={form.group_name} onChange={(e) => setForm(f => ({ ...f, group_name: e.target.value }))} placeholder="Qrup 1" />
              </div>
            </div>
          )}

          {form.target === "student" && (
            <div>
              <label className="block text-slate-400 text-xs mb-1">Şagird</label>
              <select className={field} value={form.student_id} onChange={(e) => setForm(f => ({ ...f, student_id: e.target.value }))} required>
                <option value="">Seçin…</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.class_name}{s.group_name ? ` · ${s.group_name}` : ""})</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 text-xs mb-1">Son tarix (istəyə görə)</label>
              <input className={field} type="date" value={form.due_date} onChange={(e) => setForm(f => ({ ...f, due_date: e.target.value }))} />
            </div>
            <div>
              <label className="block text-slate-400 text-xs mb-1">Qeyd</label>
              <input className={field} value={form.note} onChange={(e) => setForm(f => ({ ...f, note: e.target.value }))} placeholder="İstəyə görə qeyd" />
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-lg py-2.5 text-sm transition-colors">
            {loading ? "Saxlanılır…" : "Tə'yin et"}
          </button>
        </form>
      )}

      {assignments.length === 0 ? (
        <div className="py-16 rounded-2xl bg-slate-900 border border-slate-800 text-center">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-slate-400 text-sm">Hələ tə'yinat yoxdur.</p>
        </div>
      ) : (
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          {assignments.map((a, i) => (
            <div key={a.id}
              className={`flex items-center gap-4 px-4 py-3 ${i < assignments.length - 1 ? "border-b border-slate-800/60" : ""}`}>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">{a.item.title_az}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {a.student
                    ? `👤 ${a.student.name}`
                    : a.group_name
                      ? `👥 ${a.class_name} · ${a.group_name}`
                      : `🏫 ${a.class_name} sinfi`}
                  {a.due_date && <span className="ml-2 text-slate-600">· {new Date(a.due_date).toLocaleDateString("az")}</span>}
                  {a.note && <span className="ml-2 text-slate-600 italic">· {a.note}</span>}
                </p>
              </div>
              <button onClick={() => handleDelete(a.id)}
                className="text-xs text-slate-600 hover:text-red-400 transition-colors px-2 py-1 rounded hover:bg-slate-800">
                Sil
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
