import { supabaseAdmin } from "@/lib/supabase";

export const revalidate = 60;

type Result = {
  id: string; student_name: string; student_class: string;
  platform: string; lesson_title: string;
  score: number; total: number; percent: number; finished_at: string;
};

const PLATFORM_LABEL: Record<string, string> = {
  P001: "DİM Testlər",
  P002: "Riyaziyyat Dərsliyi",
  P003: "Blok İmtahan",
  P004: "TAİM 2026",
};

const PLATFORM_COLOR: Record<string, string> = {
  P001: "bg-orange-950/50 text-orange-300 border-orange-800/40",
  P002: "bg-blue-950/50 text-blue-300 border-blue-800/40",
  P003: "bg-purple-950/50 text-purple-300 border-purple-800/40",
  P004: "bg-green-950/50 text-green-300 border-green-800/40",
};

export default async function ResultsPage() {
  let results: Result[] = [];

  if (supabaseAdmin) {
    const { data } = await supabaseAdmin
      .from("results")
      .select("id, student_name, student_class, platform, lesson_title, score, total, percent, finished_at")
      .order("finished_at", { ascending: false })
      .limit(300);
    results = data ?? [];
  }

  const avg      = results.length ? Math.round(results.reduce((s, r) => s + r.percent, 0) / results.length) : 0;
  const pass     = results.filter((r) => r.percent >= 70).length;
  const passRate = results.length ? Math.round(pass / results.length * 100) : 0;

  return (
    <div className="p-6 max-w-6xl mx-auto">

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Test Nəticələri</h1>
        <p className="text-slate-500 text-sm mt-0.5">{results.length} nəticə · Son 300</p>
      </div>

      {/* Summary chips */}
      {results.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-6">
          {[
            { label: "Toplam",         value: String(results.length), color: "slate"   },
            { label: "Orta bal",       value: `${avg}%`,              color: "indigo"  },
            { label: "Keçdi (≥70%)",   value: String(pass),           color: "emerald" },
            { label: "Keçmə faizi",    value: `${passRate}%`,         color: avg >= 70 ? "emerald" : "amber" },
          ].map(({ label, value, color }) => {
            const c: Record<string, string> = {
              slate:   "bg-slate-800 text-slate-300 border-slate-700",
              indigo:  "bg-indigo-950/60 text-indigo-300 border-indigo-800/40",
              emerald: "bg-emerald-950/60 text-emerald-300 border-emerald-800/40",
              amber:   "bg-amber-950/60 text-amber-300 border-amber-800/40",
            };
            return (
              <div key={label} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm ${c[color]}`}>
                <span className="font-bold">{value}</span>
                <span className="text-xs opacity-70">{label}</span>
              </div>
            );
          })}
        </div>
      )}

      {results.length === 0 ? (
        <div className="bg-slate-900 rounded-xl border border-slate-800/70 py-16 text-center">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-slate-500 text-sm">Şagirdlər test bitirdikdə burada görünəcək.</p>
        </div>
      ) : (
        <div className="bg-slate-900 rounded-xl border border-slate-800/70 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800/70 text-slate-500 text-xs text-left">
                  <th className="px-5 py-3 font-medium">Şagird</th>
                  <th className="px-3 py-3 font-medium hidden sm:table-cell">Sinif</th>
                  <th className="px-3 py-3 font-medium">Platforma</th>
                  <th className="px-3 py-3 font-medium hidden md:table-cell">Mövzu</th>
                  <th className="px-3 py-3 font-medium text-right">Nəticə</th>
                  <th className="px-3 py-3 font-medium text-right hidden lg:table-cell">Tarix</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.id} className="border-t border-slate-800/40 hover:bg-slate-800/20 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-indigo-950 flex items-center justify-center text-indigo-400 text-xs font-bold shrink-0">
                          {r.student_name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-white font-medium">{r.student_name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-slate-400 text-xs hidden sm:table-cell">{r.student_class || "—"}</td>
                    <td className="px-3 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${PLATFORM_COLOR[r.platform] ?? "bg-slate-800 text-slate-400 border-slate-700"}`}>
                        {PLATFORM_LABEL[r.platform] ?? r.platform}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-slate-400 text-xs max-w-[200px] truncate hidden md:table-cell">
                      {r.lesson_title || "—"}
                    </td>
                    <td className="px-3 py-3 text-right whitespace-nowrap">
                      <span className={`font-bold ${r.percent >= 70 ? "text-green-400" : r.percent >= 50 ? "text-yellow-400" : "text-red-400"}`}>
                        {r.percent}%
                      </span>
                      <span className="text-slate-600 text-xs ml-1.5">({r.score}/{r.total})</span>
                    </td>
                    <td className="px-3 py-3 text-right text-slate-600 text-xs hidden lg:table-cell">
                      {r.finished_at ? new Date(r.finished_at).toLocaleDateString("az-AZ") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
