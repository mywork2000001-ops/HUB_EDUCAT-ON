import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";

type Result = {
  id: string;
  student_name: string;
  student_class: string;
  platform: string;
  lesson_title: string;
  score: number;
  total: number;
  percent: number;
  finished_at: string;
};

const PLATFORM_LABEL: Record<string, string> = {
  P001: "DİM Testlər",
  P004: "TAİM 2026",
};

export const revalidate = 60;

export default async function ResultsPage() {
  let results: Result[] = [];
  let tableError = false;

  if (supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from("results")
      .select("id, student_name, student_class, platform, lesson_title, score, total, percent, finished_at")
      .order("finished_at", { ascending: false })
      .limit(200);

    if (error) tableError = true;
    else results = data ?? [];
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8">
      <header className="max-w-5xl mx-auto mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Test Nəticələri</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {results.length > 0 ? `${results.length} nəticə` : "Şagird nəticələri"}
          </p>
        </div>
        <Link href="/dashboard" className="text-slate-400 hover:text-white text-sm transition-colors">
          ← Panel
        </Link>
      </header>

      {tableError ? (
        <div className="max-w-5xl mx-auto bg-red-950/40 border border-red-800 rounded-xl p-6 text-red-300 text-sm">
          <p className="font-semibold mb-1">Cədvəl tapılmadı</p>
          <p>Supabase SQL redaktorunda <code className="bg-red-900/50 px-1 rounded">supabase/migration.sql</code> faylını işlədin.</p>
        </div>
      ) : results.length === 0 ? (
        <div className="max-w-5xl mx-auto bg-slate-900 rounded-xl p-10 text-center">
          <p className="text-slate-500 text-sm">
            Hələ heç bir nəticə yoxdur. Şagirdlər test bitirdikdə burada görünəcək.
          </p>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto bg-slate-900 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-left">
                <th className="px-4 py-3 font-medium">Şagird</th>
                <th className="px-4 py-3 font-medium">Sinif</th>
                <th className="px-4 py-3 font-medium">Platforma</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Mövzu</th>
                <th className="px-4 py-3 font-medium text-right">Nəticə</th>
                <th className="px-4 py-3 font-medium text-right hidden sm:table-cell">Tarix</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3 text-white font-medium">{r.student_name}</td>
                  <td className="px-4 py-3 text-slate-300">{r.student_class || "—"}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 whitespace-nowrap">
                      {PLATFORM_LABEL[r.platform] ?? r.platform}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300 max-w-[200px] truncate hidden md:table-cell">
                    {r.lesson_title || "—"}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <span
                      className={`font-bold ${
                        r.percent >= 70
                          ? "text-green-400"
                          : r.percent >= 50
                          ? "text-yellow-400"
                          : "text-red-400"
                      }`}
                    >
                      {r.percent}%
                    </span>
                    <span className="text-slate-500 text-xs ml-1">
                      ({r.score}/{r.total})
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-slate-500 text-xs hidden sm:table-cell">
                    {new Date(r.finished_at).toLocaleDateString("az-AZ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
