import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";

export const revalidate = 60;

type RecentResult = {
  id: string;
  student_name: string;
  student_class: string;
  platform: string;
  lesson_title: string;
  percent: number;
  score: number;
  total: number;
  finished_at: string;
};

const PLATFORM_LABEL: Record<string, string> = {
  P001: "DİM Testlər",
  P004: "TAİM 2026",
};

async function getDashboardData() {
  if (!supabaseAdmin) return { total: 0, students: 0, avg: 0, recent: [] as RecentResult[] };

  const { data } = await supabaseAdmin
    .from("results")
    .select("id, student_name, student_class, platform, lesson_title, percent, score, total, finished_at")
    .order("finished_at", { ascending: false })
    .limit(200);

  if (!data || data.length === 0) return { total: 0, students: 0, avg: 0, recent: [] as RecentResult[] };

  const unique = new Set(data.map((r) => `${r.student_name}|||${r.student_class}`));
  const avg = Math.round(data.reduce((s, r) => s + r.percent, 0) / data.length);

  return {
    total: data.length,
    students: unique.size,
    avg,
    recent: data.slice(0, 5) as RecentResult[],
  };
}

export default async function DashboardPage() {
  const { total, students, avg, recent } = await getDashboardData();

  const STATS = [
    { label: "Ümumi nəticə", value: String(total),              icon: "📋", href: "/dashboard/results" },
    { label: "Şagirdlər",    value: String(students),           icon: "👥", href: "/dashboard/students" },
    { label: "Orta bal",     value: total ? `${avg}%` : "—%",  icon: "📈", href: "/dashboard/results" },
  ];

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8">
      <header className="max-w-5xl mx-auto mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Müəllim Paneli</h1>
          <p className="text-slate-400 text-sm mt-0.5">Şagird nəticələri və statistika</p>
        </div>
        <div className="flex gap-4">
          <Link href="/dashboard/classes/grade-5" className="text-slate-400 hover:text-white text-sm transition-colors">
            Dərslər →
          </Link>
          <Link href="/" className="text-slate-400 hover:text-white text-sm transition-colors">
            ← Hub
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {STATS.map((s) => (
          <Link key={s.label} href={s.href}
            className="bg-slate-900 rounded-xl p-5 hover:bg-slate-800 transition-colors">
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="text-2xl font-bold text-white">{s.value}</div>
            <div className="text-slate-400 text-sm mt-0.5">{s.label}</div>
          </Link>
        ))}
      </div>

      <div className="max-w-5xl mx-auto bg-slate-900 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold">Son nəticələr</h2>
          {recent.length > 0 && (
            <Link href="/dashboard/results" className="text-blue-400 hover:text-blue-300 text-sm transition-colors">
              Hamısı →
            </Link>
          )}
        </div>

        {recent.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-10">
            Hələ heç bir nəticə yoxdur. Şagirdlər test keçdikdə burada görünəcək.
          </p>
        ) : (
          <div className="space-y-2">
            {recent.map((r) => (
              <div key={r.id} className="flex items-center justify-between py-2.5 border-b border-slate-800/50 last:border-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {r.student_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-white text-sm font-medium truncate">{r.student_name}</div>
                    <div className="text-slate-500 text-xs truncate">
                      {r.student_class ? `${r.student_class}-ci sinif · ` : ""}
                      <span className="text-slate-400">{PLATFORM_LABEL[r.platform] ?? r.platform}</span>
                      {r.lesson_title ? ` · ${r.lesson_title}` : ""}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <span className={`text-sm font-bold ${
                    r.percent >= 70 ? "text-green-400" : r.percent >= 50 ? "text-yellow-400" : "text-red-400"
                  }`}>
                    {r.percent}%
                  </span>
                  <span className="text-slate-500 text-xs hidden sm:inline">
                    {r.score}/{r.total}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
