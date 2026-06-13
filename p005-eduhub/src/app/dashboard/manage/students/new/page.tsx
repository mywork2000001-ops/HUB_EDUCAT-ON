"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

type Created = { name: string; email: string; class_name: string; group_name: string | null; password: string };

export default function NewStudentPage() {
  const router_push = () => { window.location.href = "/dashboard/manage/students"; };

  const [form, setForm]       = useState({ name: "", email: "", password: "", class_name: "", group_name: "" });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<string[]>([]);
  const [created, setCreated] = useState<Created | null>(null);
  const [copied,  setCopied]  = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/students")
      .then((r) => r.json())
      .then((d) => {
        const names = [...new Set<string>((d.students ?? []).map((s: { class_name: string }) => s.class_name))].sort();
        setClasses(names);
      })
      .catch(() => {});
  }, []);

  function set(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })); }

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password.length < 6) { setError("Şifrə minimum 6 simvol olmalıdır"); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/students", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Xəta baş verdi");
      setCreated({
        name:       data.student.name,
        email:      data.student.email,
        class_name: data.student.class_name,
        group_name: data.student.group_name,
        password:   data.plainPassword,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xəta baş verdi");
    } finally {
      setLoading(false);
    }
  }

  const inputCls = "w-full bg-white text-slate-900 rounded-xl px-4 py-2.5 text-sm border border-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 placeholder:text-slate-400 transition-all";

  // ── Credentials screen (shown once after creation) ──────────────
  if (created) {
    return (
      <div className="p-6 max-w-lg">
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-lg">✓</div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Şagird əlavə edildi</h2>
              <p className="text-xs text-emerald-600 mt-0.5">Giriş məlumatlarını indi saxlayın — sonra göstərilməyəcək</p>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            {[
              { label: "Ad Soyad",    value: created.name,       key: "name" },
              { label: "Sinif",       value: created.class_name + (created.group_name ? ` · ${created.group_name}` : ""), key: "class" },
              { label: "E-poçt (ID)", value: created.email,      key: "email" },
              { label: "Şifrə",      value: created.password,   key: "pw" },
            ].map(({ label, value, key }) => (
              <div key={key} className="bg-white rounded-xl px-4 py-3 flex items-center justify-between gap-3 border border-slate-200 shadow-sm">
                <div className="min-w-0">
                  <p className="text-xs text-slate-400 mb-0.5">{label}</p>
                  <p className={`text-sm font-mono text-slate-900 select-all truncate ${key === "pw" ? "font-bold text-emerald-700 tracking-wider" : ""}`}>
                    {value}
                  </p>
                </div>
                <button type="button" onClick={() => copy(value, key)}
                  className="shrink-0 text-xs text-slate-500 hover:text-slate-900 px-2.5 py-1 rounded-lg
                             bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors whitespace-nowrap">
                  {copied === key ? "✓ Kopyalandı" : "Kopyala"}
                </button>
              </div>
            ))}
          </div>

          <button type="button"
            onClick={() => {
              const w = window.open("", "_blank");
              if (!w) return;
              w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Şagird Məlumatı</title>
              <style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:system-ui,sans-serif;padding:15mm;display:flex;justify-content:center}
              .card{border:1.5px solid #334155;border-radius:10px;padding:8mm;max-width:90mm;width:100%}
              .school{font-size:9px;color:#64748b;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4mm}
              .name{font-size:15px;font-weight:700;color:#0f172a;margin-bottom:4mm;border-bottom:1px solid #e2e8f0;padding-bottom:3mm}
              .row{display:flex;gap:3mm;margin-bottom:2mm;font-size:11px}.label{color:#64748b;min-width:22mm}
              .val{color:#0f172a;font-weight:600;font-family:monospace}.url{font-size:9px;color:#6366f1;margin-top:4mm;text-align:center}
              </style></head><body><div class="card">
              <div class="school">EduHub — ${created.class_name}${created.group_name ? ` · ${created.group_name}` : ""} sinfi</div>
              <div class="name">${created.name}</div>
              <div class="row"><span class="label">E-poçt:</span><span class="val">${created.email}</span></div>
              <div class="row"><span class="label">Şifrə:</span><span class="val">${created.password}</span></div>
              <div class="url">hub-educat-on.vercel.app/learn/login</div>
              </div><script>window.onload=()=>window.print()</script></body></html>`);
              w.document.close();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
                       bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium
                       transition-colors border border-slate-200 shadow-sm mb-3">
            🖨️ Kart çap et
          </button>

          <div className="flex gap-3">
            <button type="button" onClick={() => { setCreated(null); setForm({ name: "", email: "", password: "", class_name: form.class_name, group_name: form.group_name }); }}
              className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors shadow-sm">
              + Növbəti şagird
            </button>
            <button type="button" onClick={router_push}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-medium transition-colors">
              Siyahıya qayıt
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Creation form ────────────────────────────────────────────────
  return (
    <div className="p-6 max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/manage/students" className="text-slate-400 hover:text-slate-700 text-sm transition-colors">← Geri</Link>
        <h1 className="text-xl font-bold text-slate-900">Yeni şagird</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div>
          <label className="block text-slate-700 text-sm font-medium mb-1.5">Ad Soyad</label>
          <input className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)}
            required placeholder="Əli Məmmədov" />
        </div>

        <div>
          <label className="block text-slate-700 text-sm font-medium mb-1.5">E-poçt</label>
          <input className={inputCls} type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
            required placeholder="eli.mammadov@gmail.com" />
        </div>

        <div>
          <label className="block text-slate-700 text-sm font-medium mb-1.5">Şifrə</label>
          <input className={inputCls} type="password" value={form.password} onChange={(e) => set("password", e.target.value)}
            required placeholder="Ən azı 6 simvol" minLength={6} />
        </div>

        <div>
          <label className="block text-slate-700 text-sm font-medium mb-1.5">Sinif</label>
          {classes.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {classes.map((c) => (
                <button key={c} type="button" onClick={() => set("class_name", c)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors border ${
                    form.class_name === c
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
                  }`}>
                  {c}
                </button>
              ))}
            </div>
          )}
          <input className={inputCls} value={form.class_name} onChange={(e) => set("class_name", e.target.value)}
            required placeholder="5A, 6B, 7A …" />
        </div>

        <div>
          <label className="block text-slate-700 text-sm font-medium mb-1.5">
            Qrup <span className="text-slate-400 font-normal">(istəyə görə)</span>
          </label>
          <input className={inputCls} value={form.group_name} onChange={(e) => set("group_name", e.target.value)}
            placeholder="Qrup 1" />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-3 py-2">{error}</div>
        )}

        <button type="submit" disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-xl py-2.5 text-sm transition-colors shadow-sm">
          {loading ? "Əlavə edilir…" : "Şagirdi əlavə et"}
        </button>
      </form>
    </div>
  );
}
