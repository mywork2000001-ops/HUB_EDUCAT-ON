"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

type Teacher = {
  id: string; email: string; name: string; role: string;
  created_at: string; last_sign_in: string | null; confirmed: boolean;
};

export const dynamic = "force-dynamic";

const inputCls = "w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 placeholder:text-slate-400";

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
          <h1 className="text-2xl font-bold text-slate-900">Müəllimlər</h1>
          <p className="text-slate-400 text-sm mt-0.5">{teachers.length} müəllim qeydiyyatda</p>
        </div>
        <button onClick={() => { setAdding(!adding); setMsg(null); }}
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors shadow-sm">
          {adding ? "Ləğv et" : "+ Yeni müəllim"}
        </button>
      </div>

      {msg && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm border ${msg.ok ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-600 border-red-200"}`}>
          {msg.text}
        </div>
      )}

      {adding && (
        <form onSubmit={handleAdd}
          className="mb-6 bg-white border border-slate-200 shadow-sm rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700">Yeni müəllim əlavə et</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Ad Soyad</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className={inputCls} placeholder="Müəllim Adı" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">E-poçt *</label>
              <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className={inputCls} placeholder="muellim@school.az" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Şifrə * (min 8)</label>
              <input required type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className={inputCls} placeholder="••••••••" minLength={8} />
            </div>
          </div>
          <button type="submit"
            className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors shadow-sm">
            Əlavə et
          </button>
        </form>
      )}

      {loading ? (
        <div className="py-16 text-center text-slate-400 text-sm">Yüklənir…</div>
      ) : teachers.length === 0 ? (
        <div className="py-16 rounded-2xl bg-white border border-slate-200 shadow-sm text-center">
          <p className="text-4xl mb-3">👨‍🏫</p>
          <p className="text-slate-400 text-sm">Hələ müəllim əlavə edilməyib.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="grid grid-cols-12 px-4 py-2.5 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50">
            <span className="col-span-3">Ad</span>
            <span className="col-span-4">E-poçt</span>
            <span className="col-span-2">Son giriş</span>
            <span className="col-span-2">Status</span>
            <span className="col-span-1"></span>
          </div>
          {teachers.map((t) => (
            <div key={t.id}
              className="grid grid-cols-12 items-center px-4 py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors text-sm">
              <div className="col-span-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold shrink-0">
                  {(t.name || t.email).charAt(0).toUpperCase()}
                </div>
                <span className="text-slate-800 truncate font-medium">{t.name || "—"}</span>
              </div>
              <div className="col-span-4">
                <p className="text-slate-500 font-mono text-xs truncate">{t.email}</p>
              </div>
              <div className="col-span-2">
                <p className="text-slate-400 text-xs">
                  {t.last_sign_in ? new Date(t.last_sign_in).toLocaleDateString("az") : "Heç vaxt"}
                </p>
              </div>
              <div className="col-span-2">
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                  t.confirmed
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-amber-50 text-amber-600 border-amber-200"
                }`}>
                  {t.confirmed ? "Aktiv" : "Gözləyir"}
                </span>
              </div>
              <div className="col-span-1 flex justify-end">
                {delId === t.id ? (
                  <div className="flex gap-1">
                    <button onClick={() => handleDelete(t.id)}
                      className="text-xs text-red-600 hover:text-red-700 px-2 py-1 rounded-lg bg-red-50 border border-red-200 font-medium">Sil</button>
                    <button onClick={() => setDelId(null)}
                      className="text-xs text-slate-400 hover:text-slate-700 px-2 py-1 rounded-lg hover:bg-slate-100">×</button>
                  </div>
                ) : (
                  <button onClick={() => setDelId(t.id)}
                    className="text-xs text-slate-300 hover:text-red-500 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors">
                    🗑
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-4 text-xs text-slate-400">
        Müəllim şifrəsini dəyişmək üçün:{" "}
        <Link href="/dashboard/manage/settings" className="text-indigo-600 hover:text-indigo-700 underline">
          Tənzimləmələr
        </Link>
      </p>
    </div>
  );
}
