"use client";
import { useState } from "react";

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
        <h1 className="text-2xl font-bold text-white">Tənzimləmələr</h1>
        <p className="text-slate-400 text-sm mt-0.5">Hesab parametrləri</p>
      </div>

      {/* Password change */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h2 className="text-base font-semibold text-slate-200 mb-4 flex items-center gap-2">
          🔑 Şifrəni dəyiş
        </h2>

        {msg && (
          <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${
            msg.ok
              ? "bg-green-900/30 text-green-400 border border-green-800/50"
              : "bg-red-900/30 text-red-400 border border-red-800/50"
          }`}>
            {msg.text}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Cari şifrə</label>
            <input
              required type="password"
              value={form.current_password}
              onChange={e => setForm(f => ({ ...f, current_password: e.target.value }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Yeni şifrə (min 8 simvol)</label>
            <input
              required type="password" minLength={8}
              value={form.new_password}
              onChange={e => setForm(f => ({ ...f, new_password: e.target.value }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Yeni şifrəni təsdiqlə</label>
            <input
              required type="password" minLength={8}
              value={form.confirm}
              onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit" disabled={busy}
            className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium transition-colors">
            {busy ? "Gözləyin…" : "Şifrəni yenilə"}
          </button>
        </form>
      </section>

      {/* Notification info */}
      <section className="mt-5 bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h2 className="text-base font-semibold text-slate-200 mb-3 flex items-center gap-2">
          📧 E-poçt Bildirişləri
        </h2>
        <p className="text-sm text-slate-400 mb-3">
          Yeni test nəticəsi əldə edildikdə <span className="text-indigo-400 font-mono">mywork2000001@gmail.com</span> ünvanına bildiriş göndərilir.
        </p>
        <div className="bg-slate-800/50 rounded-lg px-4 py-3 text-xs text-slate-500 space-y-1">
          <p>Bildirişləri fəallaşdırmaq üçün Vercel Dashboard-da bu mühit dəyişənlərini əlavə edin:</p>
          <code className="block mt-2 text-slate-400 font-mono">
            NOTIFY_EMAIL=mywork2000001@gmail.com<br />
            GMAIL_USER=mywork2000001@gmail.com<br />
            GMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx
          </code>
          <p className="mt-2">
            Gmail App Password yaratmaq üçün:{" "}
            <span className="text-indigo-400">Google Account → Security → 2FA → App Passwords</span>
          </p>
        </div>
      </section>
    </div>
  );
}
