"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type TopicOption = {
  id: number; title_az: string; order_index: number;
  grade_subject: { grade: { label_az: string }; subject: { label_az: string; slug: string } };
};

interface Props {
  defaultDate?: string; // YYYY-MM-DD
}

const EMPTY = { item_id: "", class_name: "", group_name: "", due_date: "", due_time: "", note: "" };

export function ScheduleQuickAdd({ defaultDate }: Props) {
  const router  = useRouter();
  const [open, setOpen]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [topics, setTopics]   = useState<TopicOption[]>([]);
  const [students, setStudents] = useState<{ class_name: string; group_name: string | null }[]>([]);
  const [form, setForm] = useState({ ...EMPTY, due_date: defaultDate ?? "" });

  useEffect(() => {
    if (!open) return;
    Promise.all([
      fetch("/api/admin/assignments/topics").then(r => r.json()),
      fetch("/api/admin/students").then(r => r.json()),
    ]).then(([t, s]) => {
      setTopics(t.topics ?? []);
      setStudents(s.students ?? []);
    }).catch(() => {});
  }, [open]);

  const classes = [...new Set(students.map(s => s.class_name))].sort();
  const groups  = students
    .filter(s => s.class_name === form.class_name && s.group_name)
    .map(s => s.group_name as string);
  const uniqueGroups = [...new Set(groups)].sort();

  const grouped: Record<string, TopicOption[]> = {};
  for (const t of topics) {
    const key = `${t.grade_subject.grade.label_az} — ${t.grade_subject.subject.label_az}`;
    (grouped[key] ??= []).push(t);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.item_id || !form.class_name) return;
    setLoading(true);
    try {
      const body: Record<string, unknown> = {
        item_id:    Number(form.item_id),
        class_name: form.class_name,
      };
      if (form.group_name.trim()) body.group_name = form.group_name.trim();
      if (form.due_date) {
        const dtStr = form.due_time
          ? `${form.due_date}T${form.due_time}:00`
          : `${form.due_date}T09:00:00`;
        body.due_date = new Date(dtStr).toISOString();
      }
      if (form.note.trim()) body.note = form.note.trim();

      const res = await fetch("/api/admin/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setOpen(false);
      setForm({ ...EMPTY, due_date: defaultDate ?? "" });
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Xəta baş verdi");
    } finally {
      setLoading(false);
    }
  }

  const fd = "w-full bg-white text-slate-900 rounded-lg px-3 py-2 text-sm border border-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10";

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700
                   text-white text-sm font-semibold transition-colors shadow-sm shrink-0"
      >
        <span className="text-base">+</span> Tə'yinat əlavə et
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800">📅 Yeni tə'yinat</h3>
        <button type="button" onClick={() => setOpen(false)}
          className="text-xs text-slate-400 hover:text-slate-700 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors">
          ✕ Ləğv et
        </button>
      </div>

      {/* Mövzu */}
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Mövzu *</label>
        <select className={fd} value={form.item_id} onChange={e => setForm(f => ({ ...f, item_id: e.target.value }))} required>
          <option value="">Mövzu seçin…</option>
          {Object.entries(grouped).map(([group, items]) => (
            <optgroup key={group} label={group}>
              {items.map(t => (
                <option key={t.id} value={t.id}>{t.order_index}. {t.title_az}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {/* Sinif + Qrup */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Sinif *</label>
          {classes.length > 0 ? (
            <select className={fd} value={form.class_name} onChange={e => setForm(f => ({ ...f, class_name: e.target.value, group_name: "" }))} required>
              <option value="">Sinif seçin…</option>
              {classes.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          ) : (
            <input className={fd} placeholder="5A" value={form.class_name} onChange={e => setForm(f => ({ ...f, class_name: e.target.value }))} required />
          )}
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Qrup <span className="text-slate-400">(istəyə görə)</span>
          </label>
          {uniqueGroups.length > 0 ? (
            <select className={fd} value={form.group_name} onChange={e => setForm(f => ({ ...f, group_name: e.target.value }))}>
              <option value="">Bütün sinif</option>
              {uniqueGroups.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          ) : (
            <input className={fd} placeholder="Qrup 1" value={form.group_name} onChange={e => setForm(f => ({ ...f, group_name: e.target.value }))} />
          )}
        </div>
      </div>

      {/* Tarix + Vaxt */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Tarix *</label>
          <input className={fd} type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} required />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Vaxt</label>
          <input className={fd} type="time" value={form.due_time} onChange={e => setForm(f => ({ ...f, due_time: e.target.value }))} placeholder="09:00" />
        </div>
      </div>

      {/* Qeyd */}
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">
          Qeyd <span className="text-slate-400">(istəyə görə)</span>
        </label>
        <input className={fd} placeholder="Ev tapşırığı…" value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} />
      </div>

      <button type="submit" disabled={loading || !form.item_id || !form.class_name}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white
                   font-semibold rounded-xl py-2.5 text-sm transition-colors shadow-sm">
        {loading ? "Saxlanılır…" : "Tə'yin et"}
      </button>
    </form>
  );
}
