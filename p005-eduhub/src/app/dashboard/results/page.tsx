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

const PLATFORM_STYLE: Record<string, string> = {
  P001: "bg-orange-50 text-orange-700 border-orange-200",
  P002: "bg-blue-50 text-blue-700 border-blue-200",
  P003: "bg-purple-50 text-purple-700 border-purple-200",
  P004: "bg-emerald-50 text-emerald-700 border-emerald-200",
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
        <h1 className="text-2xl font-bold text-slate-900">Test Nəticələri</h1>
        <p className="text-slate-400 text-sm mt-0.5">{results.length} nəticə · Son 300</p>
      </div>

      {/* Summary chips */}
      {results.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-6">
          {[
            { label: "Toplam",       value: String(results.length), cls: "bg-slate-100 text-slate-700 border-slate-200" },
            { label: "Orta bal",     value: `${avg}%`,              cls: "bg-indigo-50 text-indigo-700 border-indigo-200" },
            { label: "Keçdi (≥70%)", value: String(pass),           cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
            { label: "Keçmə faizi",  value: `${passRate}%`,         cls: passRate >= 70 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200" },
          ].map(({ label, value, cls }) => (
            <div key={label} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm shadow-sm ${cls}`}>
              <span className="font-bold">{value}</span>
              <span className="text-xs opacity-70">{label}</span>
            </div>
          ))}
        </div>
      )}

      {results.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm py-16 text-center">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-slate-400 text-sm">Şagirdlər test bitirdikdə burada görünəcək.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-xs text-left">
                  <th className="px-5 py-3 font-semibold uppercase tracking-wider">Şagird</th>
                  <th className="px-3 py-3 font-semibold uppercase tracking-wider hidden sm:table-cell">Sinif</th>
                  <th className="px-3 py-3 font-semibold uppercase tracking-wider">Platforma</th>
                  <th className="px-3 py-3 font-semibold uppercase tracking-wider hidden md:table-cell">Mövzu</th>
                  <th className="px-3 py-3 font-semibold uppercase tracking-wider text-right">Nəticə</th>
                  <th className="px-3 py-3 font-semibold uppercase tracking-wider text-right hidden lg:table-cell">Tarix</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {results.map((r, i) => (
                  <tr key={r.id} className={`hover:bg-slate-50 transition-colors ${i % 2 === 0 ? "" : "bg-slate-50/40"}`}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold shrink-0">
                          {r.student_name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-slate-800 font-medium">{r.student_name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 hidden sm:table-cell">
                      <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        {r.student_class || "—"}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${PLATFORM_STYLE[r.platform] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>
                        {PLATFORM_LABEL[r.platform] ?? r.platform}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-slate-500 text-xs max-w-[200px] truncate hidden md:table-cell">
                      {r.lesson_title || "—"}
                    </td>
                    <td className="px-3 py-3 text-right whitespace-nowrap">
                      <span className={`font-bold ${r.percent >= 70 ? "text-emerald-600" : r.percent >= 50 ? "text-amber-600" : "text-rose-600"}`}>
                        {r.percent}%
                      </span>
                      <span className="text-slate-400 text-xs ml-1.5">({r.score}/{r.total})</span>
                    </td>
                    <td className="px-3 py-3 text-right text-slate-400 text-xs hidden lg:table-cell">
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
