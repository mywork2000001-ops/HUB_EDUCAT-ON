"use client";
import { useState } from "react";

const inputCls = "w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 placeholder:text-slate-400";

export default function SettingsPage() {
  const [form,  setForm]  = useState({ current_password: "", new_password: "", confirm: "" });
  const [msg,   setMsg]   = useState<{ ok: boolean; text: string } | null>(null);
  const [busy,  setBusy]  = useState(false);

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (form.new_password !== form.confirm) {
      setMsg({ ok: false, text: "Yeni şifrələr uyğun gəlmir" });
      return;
    }
    if (form.new_password.length < 8) {
      setMsg({ ok: false, text: "Yeni şifrə minimum 8 simvol olmalıdır" });
      return;
    }

    setBusy(true);
    const r = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        current_password: form.current_password,
        new_password:     form.new_password,
      }),
    });
    const d = await r.json();
    setBusy(false);

    if (!r.ok) { setMsg({ ok: false, text: d.error }); return; }
    setMsg({ ok: true, text: "Şifrə uğurla dəyişdirildi" });
    setForm({ current_password: "", new_password: "", confirm: "" });
  }

  return (
    <div className="p-6 max-w-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Tənzimləmələr</h1>
        <p className="text-slate-400 text-sm mt-0.5">Hesab parametrləri</p>
      </div>

      {/* Password change */}
      <section className="bg-white border border-slate-200 shadow-sm rounded-xl p-5">
        <h2 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
          🔑 Şifrəni dəyiş
        </h2>

        {msg && (
          <div className={`mb-4 px-4 py-3 rounded-xl text-sm border ${
            msg.ok
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-red-50 text-red-600 border-red-200"
          }`}>
            {msg.text}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Cari şifrə</label>
            <input required type="password" value={form.current_password}
              onChange={e => setForm(f => ({ ...f, current_password: e.target.value }))}
              className={inputCls} placeholder="••••••••" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Yeni şifrə (min 8 simvol)</label>
            <input required type="password" minLength={8} value={form.new_password}
              onChange={e => setForm(f => ({ ...f, new_password: e.target.value }))}
              className={inputCls} placeholder="••••••••" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Yeni şifrəni təsdiqlə</label>
            <input required type="password" minLength={8} value={form.confirm}
              onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
              className={inputCls} placeholder="••••••••" />
          </div>
          <button type="submit" disabled={busy}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium transition-colors shadow-sm">
            {busy ? "Gözləyin…" : "Şifrəni yenilə"}
          </button>
        </form>
      </section>

      {/* Notification info */}
      <section className="mt-5 bg-white border border-slate-200 shadow-sm rounded-xl p-5">
        <h2 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
          📧 E-poçt Bildirişləri
        </h2>
        <p className="text-sm text-slate-600 mb-3">
          Yeni test nəticəsi əldə edildikdə{" "}
          <span className="text-indigo-600 font-mono font-medium">mywork2000001@gmail.com</span>{" "}
          ünvanına bildiriş göndərilir.
        </p>
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-500 space-y-1">
          <p className="font-medium text-slate-600">Bildirişləri fəallaşdırmaq üçün Vercel Dashboard-da bu mühit dəyişənlərini əlavə edin:</p>
          <code className="block mt-2 text-slate-700 font-mono bg-slate-100 rounded-lg px-3 py-2 leading-relaxed">
            NOTIFY_EMAIL=mywork2000001@gmail.com<br />
            GMAIL_USER=mywork2000001@gmail.com<br />
            GMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx
          </code>
          <p className="mt-2 text-slate-500">
            Gmail App Password yaratmaq üçün:{" "}
            <span className="text-indigo-600 font-medium">Google Account → Security → 2FA → App Passwords</span>
          </p>
        </div>
      </section>
    </div>
  );
}
