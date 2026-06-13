"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const TEXT = {
  az: {
    title:       "Şagird Paneli",
    subtitle:    "Müəllim tərəfindən verilən məlumatlarla daxil olun",
    email:       "E-poçt",
    password:    "Şifrə",
    emailPh:     "ad.soyad@gmail.com",
    pwPh:        "••••••••",
    submit:      "Daxil ol",
    loading:     "Yüklənir…",
    hint:        "Giriş məlumatlarınızı müəlliminizdən alın",
    teacherLink: "Müəllim paneli →",
  },
  ru: {
    title:       "Кабинет ученика",
    subtitle:    "Войдите с данными, которые выдал учитель",
    email:       "Эл. почта",
    password:    "Пароль",
    emailPh:     "imya.familiya@gmail.com",
    pwPh:        "••••••••",
    submit:      "Войти",
    loading:     "Загрузка…",
    hint:        "Данные для входа получите у учителя",
    teacherLink: "Кабинет учителя →",
  },
} as const;

type Lang = "az" | "ru";

export default function StudentLoginPage() {
  const router = useRouter();
  const [lang,     setLang]     = useState<Lang>("az");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const T = TEXT[lang];

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
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Xəta baş verdi");
      router.push("/learn");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xəta baş verdi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Lang toggle */}
        <div className="flex justify-end mb-4">
          <button
            type="button"
            onClick={() => setLang(l => l === "az" ? "ru" : "az")}
            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400
                       hover:bg-slate-700 hover:text-white transition-colors"
          >
            {lang === "az" ? "RU" : "AZ"}
          </button>
        </div>

        {/* Logo + title */}
        <div className="text-center mb-7">
          <div className="relative inline-flex items-center justify-center w-16 h-16
                          rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700
                          text-white text-3xl shadow-lg shadow-indigo-900/40 mb-4">
            🎓
          </div>
          <h1 className="text-xl font-bold text-white">{T.title}</h1>
          <p className="text-slate-400 text-sm mt-1.5 leading-snug max-w-xs mx-auto">
            {T.subtitle}
          </p>
        </div>

        {/* Form card */}
        <form onSubmit={handleSubmit} className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4">

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1.5">{T.email}</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder={T.emailPh}
              className="w-full bg-slate-800 text-white rounded-xl px-4 py-3 text-sm
                         border border-slate-700 focus:outline-none focus:border-indigo-500
                         focus:ring-1 focus:ring-indigo-500/30 placeholder:text-slate-600
                         transition-colors"
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1.5">{T.password}</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder={T.pwPh}
              className="w-full bg-slate-800 text-white rounded-xl px-4 py-3 text-sm
                         border border-slate-700 focus:outline-none focus:border-indigo-500
                         focus:ring-1 focus:ring-indigo-500/30 placeholder:text-slate-600
                         transition-colors"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm
                            rounded-xl px-4 py-3 flex items-center gap-2">
              <span className="shrink-0">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600
                       hover:from-indigo-500 hover:to-violet-500
                       disabled:opacity-50 disabled:cursor-not-allowed
                       text-white font-semibold rounded-xl py-3 text-sm
                       transition-all shadow-lg shadow-indigo-900/30 active:scale-[0.98]"
          >
            {loading ? T.loading : T.submit}
          </button>
        </form>

        {/* Hints */}
        <div className="mt-6 space-y-2 text-center">
          <p className="text-slate-600 text-xs">{T.hint}</p>
          <a
            href="/auth/login"
            className="text-xs text-slate-700 hover:text-indigo-400 transition-colors"
          >
            {T.teacherLink}
          </a>
        </div>
      </div>
    </main>
  );
}
