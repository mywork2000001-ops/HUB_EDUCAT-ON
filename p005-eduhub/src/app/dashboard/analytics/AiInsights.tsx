"use client";
import { useState } from "react";
import type { GeminiInsight } from "@/lib/gemini";

export function AiInsights({ hasKey }: { hasKey: boolean }) {
  const [state,  setState]  = useState<"idle" | "loading" | "done" | "error">("idle");
  const [data,   setData]   = useState<GeminiInsight | null>(null);
  const [errMsg, setErrMsg] = useState("");

  async function analyze() {
    setState("loading");
    setErrMsg("");
    try {
      const r = await fetch("/api/admin/ai/insights", { method: "POST" });
      const d = await r.json();
      if (!r.ok) { setErrMsg(d.error || "Xəta"); setState("error"); return; }
      setData(d);
      setState("done");
    } catch { setState("error"); setErrMsg("Şəbəkə xətası"); }
  }

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800/70 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/70">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white text-sm font-bold">G</div>
          <div>
            <p className="text-sm font-semibold text-white">Gemini AI Təhlili</p>
            <p className="text-xs text-slate-500">gemini-2.0-flash · məlumatların süni intellekt analizi</p>
          </div>
        </div>
        {!hasKey ? (
          <span className="text-xs text-amber-400 border border-amber-800/50 bg-amber-950/40 px-2.5 py-1 rounded-lg">API açarı yoxdur</span>
        ) : state !== "loading" ? (
          <button onClick={analyze}
            className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white text-xs font-medium transition-all">
            {state === "done" ? "Yenidən analiz et" : "✨ Analiz et"}
          </button>
        ) : (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="animate-spin">⟳</span> Analiz edilir…
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {!hasKey && (
          <div className="text-center py-6">
            <p className="text-slate-500 text-sm mb-3">Gemini AI analitikasını fəallaşdırmaq üçün:</p>
            <div className="bg-slate-800/60 rounded-lg px-4 py-3 text-left max-w-md mx-auto text-xs font-mono text-slate-400 space-y-1">
              <p>1. <a href="https://aistudio.google.com/app/apikey" className="text-blue-400 underline" target="_blank">aistudio.google.com</a> → Get API key</p>
              <p>2. Vercel Dashboard → Settings → Env Vars</p>
              <p className="text-slate-300">   GEMINI_API_KEY = AI.....</p>
              <p>3. Redeploy → AI aktiv olacaq</p>
            </div>
          </div>
        )}

        {hasKey && state === "idle" && (
          <div className="text-center py-8">
            <p className="text-4xl mb-3">✨</p>
            <p className="text-slate-400 text-sm">Şagird nəticələrini avtomatik analiz etmək üçün "Analiz et" düyməsini basın.</p>
            <p className="text-slate-600 text-xs mt-1">Son 500 nəticə Gemini 2.0 Flash-a göndəriləcək.</p>
          </div>
        )}

        {state === "error" && (
          <div className="bg-red-950/30 border border-red-800/40 rounded-lg px-4 py-3 text-red-400 text-sm">
            ⚠️ {errMsg}
          </div>
        )}

        {state === "done" && data && (
          <div className="space-y-5">
            {/* Summary */}
            <div className="bg-gradient-to-r from-blue-950/40 to-violet-950/40 border border-blue-800/30 rounded-xl px-4 py-4">
              <p className="text-xs text-blue-400 font-semibold uppercase tracking-wider mb-2">Ümumi Qiymətləndirmə</p>
              <p className="text-slate-200 text-sm leading-relaxed">{data.summary}</p>
              {data.weeklyVerdict && (
                <p className="text-xs text-slate-500 mt-2 italic">Bu həftə: {data.weeklyVerdict}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Strengths */}
              <div className="bg-emerald-950/20 border border-emerald-800/30 rounded-xl p-4">
                <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider mb-2.5">✅ Güclü Tərəflər</p>
                <ul className="space-y-1.5">
                  {data.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className="text-emerald-500 mt-0.5 shrink-0">•</span>{s}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses */}
              <div className="bg-red-950/20 border border-red-800/30 rounded-xl p-4">
                <p className="text-xs text-red-400 font-semibold uppercase tracking-wider mb-2.5">⚠️ Zəif Tərəflər</p>
                <ul className="space-y-1.5">
                  {data.weaknesses.map((w, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className="text-red-500 mt-0.5 shrink-0">•</span>{w}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* At-risk students */}
            {data.atRisk?.length > 0 && (
              <div className="bg-amber-950/20 border border-amber-800/30 rounded-xl p-4">
                <p className="text-xs text-amber-400 font-semibold uppercase tracking-wider mb-2.5">🔶 Risk Qrupu Şagirdlər</p>
                <div className="space-y-2">
                  {data.atRisk.map((s, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-amber-950 flex items-center justify-center text-amber-400 text-xs font-bold shrink-0 mt-0.5">
                        {s.student.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-200">{s.student} <span className="text-amber-400 font-bold">({s.avg}%)</span></p>
                        <p className="text-xs text-slate-500">{s.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Recommendations */}
              <div className="bg-indigo-950/20 border border-indigo-800/30 rounded-xl p-4">
                <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wider mb-2.5">💡 Tövsiyələr</p>
                <ol className="space-y-2">
                  {data.recommendations.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className="text-indigo-400 font-bold shrink-0 mt-0.5">{i + 1}.</span>{r}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Topic focus */}
              {data.topicFocus?.length > 0 && (
                <div className="bg-violet-950/20 border border-violet-800/30 rounded-xl p-4">
                  <p className="text-xs text-violet-400 font-semibold uppercase tracking-wider mb-2.5">📚 Diqqət Tələb Edən Mövzular</p>
                  <ul className="space-y-1.5">
                    {data.topicFocus.map((t, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                        <span className="text-violet-500 mt-0.5 shrink-0">▸</span>{t}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-700 text-right">Gemini 2.0 Flash · {new Date().toLocaleString("az-AZ")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
