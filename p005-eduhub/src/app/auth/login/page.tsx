"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Xəta baş verdi");
      router.refresh();
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xəta baş verdi");
    } finally {
      setLoading(false);
    }
  }

  const inputCls = "w-full bg-white text-slate-900 rounded-xl px-4 py-3 text-sm border border-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 placeholder:text-slate-400 transition-all";

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl
                          bg-indigo-600 shadow-lg shadow-indigo-200 mb-5 text-2xl">
            🏫
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Müəllim Paneli</h1>
          <p className="text-slate-500 text-sm mt-2">EduHub — hesabınıza daxil olun</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-slate-700 text-sm font-medium mb-1.5">E-poçt</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="muellim@school.az"
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-slate-700 text-sm font-medium mb-1.5">Şifrə</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={inputCls + " pr-11"}
                />
                <button type="button" tabIndex={-1} onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors p-1">
                  {showPw ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed
                         text-white font-semibold rounded-xl py-3 text-sm transition-colors shadow-sm mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Daxil olunur…
                </span>
              ) : "Daxil ol"}
            </button>
          </form>
        </div>

        <div className="text-center mt-5">
          <Link href="/" className="text-sm text-slate-400 hover:text-slate-700 transition-colors">
            ← Ana səhifəyə qayıt
          </Link>
        </div>
      </div>
    </main>
  );
}
