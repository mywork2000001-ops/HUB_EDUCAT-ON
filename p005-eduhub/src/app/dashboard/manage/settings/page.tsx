"use client";
import { useState, useEffect } from "react";
import { useTeacherLang, type Lang } from "@/hooks/useTeacherLang";

const T = {
  az: {
    title:        "Tənzimləmələr",
    subtitle:     "Hesab parametrləri və üstünlüklər",
    profile:      "Profil",
    email_label:  "E-poçt",
    member_since: "Üzv olma tarixi",
    lang_title:   "İnterfeys Dili",
    lang_sub:     "Panel dili bütün etiketlərə tətbiq olunur",
    lang_az:      "Azərbaycan dili",
    lang_ru:      "Rus dili",
    lang_saved:   "Dil dəyişdirildi",
    pw_title:     "Şifrəni dəyiş",
    current_pw:   "Cari şifrə",
    new_pw:       "Yeni şifrə (min 8 simvol)",
    confirm_pw:   "Yeni şifrəni təsdiqlə",
    save_pw:      "Şifrəni yenilə",
    saving:       "Gözləyin…",
    pw_ok:        "Şifrə uğurla dəyişdirildi",
    pw_mismatch:  "Yeni şifrələr uyğun gəlmir",
    pw_short:     "Yeni şifrə minimum 8 simvol olmalıdır",
    pw_wrong:     "Cari şifrə yanlışdır",
    notif_title:  "E-poçt Bildirişləri",
    notif_desc:   "Yeni test nəticəsi əldə edildikdə bildiriş göndərilir.",
    notif_how:    "Bildirişləri fəallaşdırmaq üçün Vercel Dashboard-da bu mühit dəyişənlərini əlavə edin:",
    notif_google: "Gmail App Password yaratmaq üçün:",
  },
  ru: {
    title:        "Настройки",
    subtitle:     "Параметры аккаунта и предпочтения",
    profile:      "Профиль",
    email_label:  "Эл. почта",
    member_since: "Дата регистрации",
    lang_title:   "Язык интерфейса",
    lang_sub:     "Применяется ко всем меткам панели",
    lang_az:      "Азербайджанский язык",
    lang_ru:      "Русский язык",
    lang_saved:   "Язык изменён",
    pw_title:     "Сменить пароль",
    current_pw:   "Текущий пароль",
    new_pw:       "Новый пароль (мин 8 символов)",
    confirm_pw:   "Подтвердите новый пароль",
    save_pw:      "Обновить пароль",
    saving:       "Подождите…",
    pw_ok:        "Пароль успешно изменён",
    pw_mismatch:  "Пароли не совпадают",
    pw_short:     "Новый пароль должен быть минимум 8 символов",
    pw_wrong:     "Текущий пароль неверен",
    notif_title:  "Email-уведомления",
    notif_desc:   "При поступлении нового результата теста отправляется уведомление.",
    notif_how:    "Для активации уведомлений добавьте переменные в Vercel Dashboard:",
    notif_google: "Для создания Gmail App Password:",
  },
} as const;

type Profile = { email: string; name: string; created_at: string | null };

const inputCls = "w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 placeholder:text-slate-400";

export default function SettingsPage() {
  const [lang, setLang]   = useTeacherLang();
  const tx                = T[lang];

  const [profile,  setProfile]  = useState<Profile | null>(null);
  const [langMsg,  setLangMsg]  = useState(false);
  const [form,     setForm]     = useState({ current_password: "", new_password: "", confirm: "" });
  const [msg,      setMsg]      = useState<{ ok: boolean; text: string } | null>(null);
  const [busy,     setBusy]     = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => setProfile(d))
      .catch(() => {});
  }, []);

  function handleLang(l: Lang) {
    setLang(l);
    setLangMsg(true);
    setTimeout(() => setLangMsg(false), 2000);
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (form.new_password !== form.confirm) { setMsg({ ok: false, text: tx.pw_mismatch }); return; }
    if (form.new_password.length < 8)       { setMsg({ ok: false, text: tx.pw_short });    return; }
    setBusy(true);
    const r = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ current_password: form.current_password, new_password: form.new_password }),
    });
    const d = await r.json();
    setBusy(false);
    if (!r.ok) { setMsg({ ok: false, text: d.error }); return; }
    setMsg({ ok: true, text: tx.pw_ok });
    setForm({ current_password: "", new_password: "", confirm: "" });
  }

  const initials = profile?.name
    ? profile.name.split(" ").map((w: string) => w[0]?.toUpperCase()).slice(0, 2).join("")
    : "M";

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString(lang === "az" ? "az-AZ" : "ru-RU", { year: "numeric", month: "long", day: "numeric" })
    : "—";

  return (
    <div className="p-6 max-w-xl mx-auto space-y-5">

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{tx.title}</h1>
        <p className="text-slate-400 text-sm mt-0.5">{tx.subtitle}</p>
      </div>

      {/* ── Profile ── */}
      <section className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
          {tx.profile}
        </h2>
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600
                          flex items-center justify-center text-white text-xl font-bold shadow-sm shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-slate-900 truncate">
              {profile?.name ?? "—"}
            </p>
            <p className="text-sm text-slate-500 truncate mt-0.5">
              {profile?.email ?? "—"}
            </p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-slate-400 mb-0.5">{tx.email_label}</p>
            <p className="text-sm font-medium text-slate-700 truncate">{profile?.email ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-0.5">{tx.member_since}</p>
            <p className="text-sm font-medium text-slate-700">{memberSince}</p>
          </div>
        </div>
      </section>

      {/* ── Language ── */}
      <section className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              🌐 {tx.lang_title}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">{tx.lang_sub}</p>
          </div>
          {langMsg && (
            <span className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg font-medium">
              ✓ {tx.lang_saved}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {(["az", "ru"] as Lang[]).map((l) => (
            <button key={l} type="button" onClick={() => handleLang(l)}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all text-left ${
                lang === l
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}>
              <span className="text-2xl leading-none">{l === "az" ? "🇦🇿" : "🇷🇺"}</span>
              <div>
                <p className={`text-sm font-semibold ${lang === l ? "text-indigo-700" : "text-slate-700"}`}>
                  {l === "az" ? "AZ" : "RU"}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {l === "az" ? tx.lang_az : tx.lang_ru}
                </p>
              </div>
              {lang === l && (
                <span className="ml-auto text-indigo-500 text-lg">✓</span>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* ── Password ── */}
      <section className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
          🔑 {tx.pw_title}
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

        <form onSubmit={handlePasswordChange} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">{tx.current_pw}</label>
            <input required type="password" value={form.current_password}
              onChange={(e) => setForm((f) => ({ ...f, current_password: e.target.value }))}
              className={inputCls} placeholder="••••••••" autoComplete="current-password" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">{tx.new_pw}</label>
            <input required type="password" minLength={8} value={form.new_password}
              onChange={(e) => setForm((f) => ({ ...f, new_password: e.target.value }))}
              className={inputCls} placeholder="••••••••" autoComplete="new-password" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">{tx.confirm_pw}</label>
            <input required type="password" minLength={8} value={form.confirm}
              onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
              className={inputCls} placeholder="••••••••" autoComplete="new-password" />
          </div>
          <button type="submit" disabled={busy}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium transition-colors shadow-sm">
            {busy ? tx.saving : tx.save_pw}
          </button>
        </form>
      </section>

      {/* ── Notifications ── */}
      <section className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
          📧 {tx.notif_title}
        </h2>
        <p className="text-sm text-slate-600 mb-3">
          {tx.notif_desc}{" "}
          <span className="text-indigo-600 font-mono font-medium">mywork2000001@gmail.com</span>
        </p>
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-500 space-y-2">
          <p className="font-medium text-slate-600">{tx.notif_how}</p>
          <code className="block text-slate-700 font-mono bg-white border border-slate-200 rounded-lg px-3 py-2 leading-relaxed">
            NOTIFY_EMAIL=mywork2000001@gmail.com<br />
            GMAIL_USER=mywork2000001@gmail.com<br />
            GMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx
          </code>
          <p className="text-slate-500">
            {tx.notif_google}{" "}
            <span className="text-indigo-600 font-medium">Google Account → Security → 2FA → App Passwords</span>
          </p>
        </div>
      </section>

    </div>
  );
}
