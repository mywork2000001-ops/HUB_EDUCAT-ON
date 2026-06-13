"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const T = {
  az: {
    title:    "Şagird Paneli",
    sub:      "Müəllim tərəfindən verilən məlumatlarla daxil olun",
    email:    "E-poçt ünvanı",
    password: "Şifrə",
    submit:   "Daxil ol",
    loading:  "Giriş edilir…",
    hint:     "Giriş məlumatlarını müəlliminizdən alın",
    teacher:  "Müəllim paneli",
  },
  ru: {
    title:    "Кабинет ученика",
    sub:      "Войдите с данными, которые выдал учитель",
    email:    "Электронная почта",
    password: "Пароль",
    submit:   "Войти",
    loading:  "Вход…",
    hint:     "Данные для входа получите у учителя",
    teacher:  "Кабинет учителя",
  },
} as const;

export default function StudentLoginPage() {
  const router                 = useRouter();
  const [lang, setLang]        = useState<"az" | "ru">("az");
  const [email, setEmail]      = useState("");
  const [password, setPassword]= useState("");
  const [error, setError]      = useState("");
  const [loading, setLoading]  = useState(false);
  const [showPw, setShowPw]    = useState(false);

  const tx = T[lang];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/student/auth/login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const d = await res.json();
      if (!res.ok) {
        setError(d.error ?? "Xəta baş verdi");
        return;
      }
      router.push("/learn");
      router.refresh();
    } catch {
      setError("Şəbəkə xətası. Yenidən cəhd edin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 relative overflow-hidden">

      {/* ── Background grid pattern ── */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />

      {/* ── Glow blobs ── */}
      <div className="absolute top-1/4 -left-32 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-72 h-72 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm">

        {/* ── Lang toggle ── */}
        <div className="flex justify-end mb-5">
          <button
            type="button"
            onClick={() => setLang(l => l === "az" ? "ru" : "az")}
            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-800/80
                       text-slate-400 hover:text-white hover:bg-slate-700
                       border border-slate-700/50 transition-all backdrop-blur-sm"
          >
            {lang === "az" ? "RU" : "AZ"}
          </button>
        </div>

        {/* ── Logo + title ── */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl
                          bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700
                          shadow-2xl shadow-indigo-900/50 mb-5 text-3xl">
            🎓
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{tx.title}</h1>
          <p className="text-slate-400 text-sm mt-2 leading-relaxed">{tx.sub}</p>
        </div>

        {/* ── Form card ── */}
        <form onSubmit={handleSubmit}
          className="bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-800/70
                     shadow-2xl shadow-black/40 p-6 space-y-4">

          {/* Email */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">{tx.email}</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="ad@gmail.com"
              className="w-full bg-slate-800/60 text-white rounded-xl px-4 py-3 text-sm
                         border border-slate-700/60 focus:outline-none
                         focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20
                         placeholder:text-slate-600 transition-all"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">{tx.password}</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full bg-slate-800/60 text-white rounded-xl px-4 py-3 pr-11 text-sm
                           border border-slate-700/60 focus:outline-none
                           focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20
                           placeholder:text-slate-600 transition-all"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500
                           hover:text-slate-300 transition-colors p-1"
              >
                {showPw ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7
                         a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878
                         l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59
                         m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7
                         a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7
                         -1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 bg-rose-500/10 border border-rose-500/20
                            text-rose-400 text-sm rounded-xl px-4 py-3">
              <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732
                     4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600
                       hover:from-indigo-500 hover:to-violet-500
                       disabled:opacity-50 disabled:cursor-not-allowed
                       text-white font-semibold rounded-xl py-3 text-sm
                       transition-all shadow-lg shadow-indigo-900/40
                       active:scale-[0.98] mt-2"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                {tx.loading}
              </span>
            ) : tx.submit}
          </button>
        </form>

        {/* ── Footer ── */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-slate-600 text-xs">{tx.hint}</p>
          <Link href="/auth/login"
            className="text-xs text-slate-700 hover:text-indigo-400 transition-colors">
            {tx.teacher} →
          </Link>
        </div>
      </div>
    </div>
  );
}
