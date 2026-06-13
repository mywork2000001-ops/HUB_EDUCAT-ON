"use client";
import { useState, useEffect, useCallback } from "react";

type Teacher = {
  id: string; email: string; name: string; role: string;
  created_at: string; last_sign_in: string | null; confirmed: boolean;
};

export const dynamic = "force-dynamic";

export default function TeachersManagePage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [adding,   setAdding]   = useState(false);
  const [form,     setForm]     = useState({ email: "", password: "", name: "" });
  const [msg,      setMsg]      = useState<{ ok: boolean; text: string } | null>(null);
  const [delId,    setDelId]    = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch("/api/admin/teachers");
    const d = await r.json();
    setTeachers(d.teachers ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const r = await fetch("/api/admin/teachers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const d = await r.json();
    if (!r.ok) { setMsg({ ok: false, text: d.error }); return; }
    setMsg({ ok: true, text: "Müəllim uğurla əlavə edildi" });
    setForm({ email: "", password: "", name: "" });
    setAdding(false);
    load();
  }

  async function handleDelete(id: string) {
    const r = await fetch(`/api/admin/teachers?id=${id}`, { method: "DELETE" });
    const d = await r.json();
    if (!r.ok) { setMsg({ ok: false, text: d.error }); return; }
    setMsg({ ok: true, text: "Müəllim silindi" });
    setDelId(null);
    load();
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Müəllimlər</h1>
          <p className="text-slate-400 text-sm mt-0.5">{teachers.length} müəllim qeydiyyatda</p>
        </div>
        <button onClick={() => { setAdding(!adding); setMsg(null); }}
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">
          {adding ? "Ləğv et" : "+ Yeni müəllim"}
        </button>
      </div>

      {msg && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${msg.ok ? "bg-green-900/30 text-green-400 border border-green-800/50" : "bg-red-900/30 text-red-400 border border-red-800/50"}`}>
          {msg.text}
        </div>
      )}

      {adding && (
        <form onSubmit={handleAdd}
          className="mb-6 bg-slate-900 border border-slate-700 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-300">Yeni müəllim əlavə et</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Ad Soyad</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                placeholder="Müəllim Adı" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">E-poçt *</label>
              <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                placeholder="muellim@school.az" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Şifrə * (min 8)</label>
              <input required type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                placeholder="••••••••" minLength={8} />
            </div>
          </div>
          <button type="submit"
            className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">
            Əlavə et
          </button>
        </form>
      )}

      {loading ? (
        <div className="py-16 text-center text-slate-500 text-sm">Yüklənir…</div>
      ) : teachers.length === 0 ? (
        <div className="py-16 rounded-2xl bg-slate-900 border border-slate-800 text-center">
          <p className="text-4xl mb-3">👨‍🏫</p>
          <p className="text-slate-400 text-sm">Hələ müəllim əlavə edilməyib.</p>
        </div>
      ) : (
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <div className="grid grid-cols-12 px-4 py-2 border-b border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span className="col-span-3">Ad</span>
            <span className="col-span-4">E-poçt</span>
            <span className="col-span-2">Son giriş</span>
            <span className="col-span-2">Status</span>
            <span className="col-span-1"></span>
          </div>
          {teachers.map((t) => (
            <div key={t.id}
              className="grid grid-cols-12 items-center px-4 py-3 border-b border-slate-800/50 last:border-0 hover:bg-slate-800/20 transition-colors text-sm">
              <div className="col-span-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-950 flex items-center justify-center text-indigo-400 text-xs font-bold shrink-0">
                  {(t.name || t.email).charAt(0).toUpperCase()}
                </div>
                <span className="text-slate-200 truncate">{t.name || "—"}</span>
              </div>
              <div className="col-span-4">
                <p className="text-slate-300 font-mono text-xs truncate">{t.email}</p>
              </div>
              <div className="col-span-2">
                <p className="text-slate-500 text-xs">
                  {t.last_sign_in
                    ? new Date(t.last_sign_in).toLocaleDateString("az")
                    : "Heç vaxt"}
                </p>
              </div>
              <div className="col-span-2">
                <span className={`text-xs px-2 py-0.5 rounded-full border ${
                  t.confirmed
                    ? "bg-green-900/30 text-green-400 border-green-800/50"
                    : "bg-yellow-900/30 text-yellow-500 border-yellow-800/50"
                }`}>
                  {t.confirmed ? "Aktiv" : "Gözləyir"}
                </span>
              </div>
              <div className="col-span-1 flex justify-end">
                {delId === t.id ? (
                  <div className="flex gap-1">
                    <button onClick={() => handleDelete(t.id)}
                      className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded bg-red-900/20">Sil</button>
                    <button onClick={() => setDelId(null)}
                      className="text-xs text-slate-500 hover:text-slate-300 px-2 py-1 rounded">×</button>
                  </div>
                ) : (
                  <button onClick={() => setDelId(t.id)}
                    className="text-xs text-slate-600 hover:text-red-400 px-2 py-1 rounded hover:bg-red-900/20 transition-colors">
                    🗑
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-4 text-xs text-slate-600">
        Müəllim şifrəsini dəyişmək üçün: <a href="/dashboard/manage/settings" className="text-indigo-500 hover:text-indigo-400 underline">Tənzimləmələr</a>
      </p>
    </div>
  );
}
