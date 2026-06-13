import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";
import { db } from "@/lib/db";

export const revalidate = 60;

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

async function getDashboardData() {
  const empty = { total: 0, students: 0, avg: 0, passRate: 0, recent: [] as ResultRow[], byPlatform: [] as PlatformStat[] };
  if (!supabaseAdmin) return empty;

  const { data } = await supabaseAdmin
    .from("results")
    .select("id, student_name, student_class, platform, lesson_title, percent, score, total, finished_at")
    .order("finished_at", { ascending: false })
    .limit(500);

  if (!data || data.length === 0) return empty;

  const unique     = new Set(data.map((r) => `${r.student_name}|||${r.student_class}`));
  const avg        = Math.round(data.reduce((s, r) => s + r.percent, 0) / data.length);
  const passRate   = Math.round(data.filter((r) => r.percent >= 70).length / data.length * 100);

  const byPlatform = Object.entries(
    data.reduce<Record<string, number>>((acc, r) => { acc[r.platform] = (acc[r.platform] ?? 0) + 1; return acc; }, {})
  ).map(([platform, count]) => ({ platform, count })).sort((a, b) => b.count - a.count);

  return { total: data.length, students: unique.size, avg, passRate, recent: data.slice(0, 8) as ResultRow[], byPlatform };
}

async function getSystemStats() {
  try {
    const [studentCount, gradeCount] = await Promise.all([
      db.student.count(),
      db.grade.count(),
    ]);
    return { studentCount, gradeCount };
  } catch { return { studentCount: 0, gradeCount: 0 }; }
}

type ResultRow = { id: string; student_name: string; student_class: string; platform: string; lesson_title: string; percent: number; score: number; total: number; finished_at: string };
type PlatformStat = { platform: string; count: number };

export default async function DashboardPage() {
  const [{ total, students, avg, passRate, recent, byPlatform }, sys] = await Promise.all([
    getDashboardData(),
    getSystemStats(),
  ]);

  const STATS = [
    { label: "Toplam nəticə",    value: String(total),                  icon: "📋", sub: "test başa çatdı",        href: "/dashboard/results",  color: "indigo" },
    { label: "Unikal şagird",    value: String(students),               icon: "👥", sub: "aktiv test iştirakçısı", href: "/dashboard/students", color: "blue"   },
    { label: "Orta bal",         value: total ? `${avg}%` : "—",        icon: "📈", sub: "bütün testlər üzrə",     href: "/dashboard/results",  color: "violet" },
    { label: "Keçmə faizi",      value: total ? `${passRate}%` : "—",   icon: "✅", sub: "≥70% nəticə",            href: "/dashboard/results",  color: "emerald"},
  ];

  const colorMap: Record<string, string> = {
    indigo:  "bg-indigo-950/60 border-indigo-800/40 text-indigo-300",
    blue:    "bg-blue-950/60 border-blue-800/40 text-blue-300",
    violet:  "bg-violet-950/60 border-violet-800/40 text-violet-300",
    emerald: "bg-emerald-950/60 border-emerald-800/40 text-emerald-300",
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* Header */}
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-white">İcmal</h1>
        <p className="text-slate-500 text-sm mt-0.5">Şagird fəaliyyəti və statistika</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-7">
        {STATS.map((s) => (
          <Link key={s.label} href={s.href}
            className={`rounded-xl border p-4 transition-all hover:scale-[1.02] ${colorMap[s.color]}`}>
            <div className="text-xl mb-2">{s.icon}</div>
            <div className="text-2xl font-bold text-white">{s.value}</div>
            <div className="text-xs mt-1 opacity-70">{s.label}</div>
            <div className="text-xs mt-0.5 opacity-50">{s.sub}</div>
          </Link>
        ))}
      </div>

      {/* System overview row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-7">

        {/* Registered students */}
        <div className="bg-slate-900 rounded-xl border border-slate-800/70 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Qeydiyyat</p>
            <Link href="/dashboard/manage/students" className="text-xs text-indigo-400 hover:text-indigo-300">Hamısı →</Link>
          </div>
          <div className="flex items-end gap-3">
            <span className="text-3xl font-bold text-white">{sys.studentCount}</span>
            <span className="text-slate-500 text-sm mb-0.5">qeydiyyatlı şagird</span>
          </div>
          <div className="mt-2 text-xs text-slate-600">{sys.gradeCount} sinif seqmenti · Prisma DB</div>
        </div>

        {/* By platform */}
        <div className="bg-slate-900 rounded-xl border border-slate-800/70 p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Platforma üzrə</p>
          {byPlatform.length === 0 ? (
            <p className="text-slate-600 text-sm">Hələ nəticə yoxdur</p>
          ) : (
            <div className="space-y-1.5">
              {byPlatform.map(({ platform, count }) => (
                <div key={platform} className="flex items-center gap-2">
                  <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ${PLATFORM_COLOR[platform] ?? "bg-slate-800 text-slate-400 border-slate-700"}`}>
                    {PLATFORM_LABEL[platform] ?? platform}
                  </span>
                  <div className="flex-1 bg-slate-800 rounded-full h-1.5">
                    <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${Math.round(count / total * 100)}%` }} />
                  </div>
                  <span className="text-xs text-slate-400 w-5 text-right">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="bg-slate-900 rounded-xl border border-slate-800/70 p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Sürətli keçid</p>
          <div className="space-y-1.5">
            {[
              { href: "/dashboard/manage/students/new", label: "Yeni şagird əlavə et", icon: "👤" },
              { href: "/dashboard/manage/assignments",   label: "Mövzu tə'yin et",       icon: "📋" },
              { href: "/dashboard/manage/subjects",      label: "Fənn idarə et",         icon: "📚" },
              { href: "/dashboard/manage/teachers",      label: "Müəllim əlavə et",      icon: "👨‍🏫" },
            ].map(({ href, label, icon }) => (
              <Link key={href} href={href}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white text-xs transition-colors">
                <span>{icon}</span>{label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent results table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800/70">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800/70">
          <h2 className="text-sm font-semibold text-white">Son nəticələr</h2>
          {recent.length > 0 && (
            <Link href="/dashboard/results" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
              Hamısı →
            </Link>
          )}
        </div>

        {recent.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-slate-600 text-sm">Şagirdlər test bitirdikdə burada görünəcək.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-500 text-xs text-left">
                  <th className="px-5 py-2.5 font-medium">Şagird</th>
                  <th className="px-3 py-2.5 font-medium hidden sm:table-cell">Sinif</th>
                  <th className="px-3 py-2.5 font-medium">Platforma</th>
                  <th className="px-3 py-2.5 font-medium hidden md:table-cell">Mövzu</th>
                  <th className="px-3 py-2.5 font-medium text-right">Nəticə</th>
                  <th className="px-3 py-2.5 font-medium text-right hidden lg:table-cell">Tarix</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((r) => (
                  <tr key={r.id} className="border-t border-slate-800/50 hover:bg-slate-800/20 transition-colors">
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
                    <td className="px-3 py-3 text-slate-400 text-xs max-w-[180px] truncate hidden md:table-cell">
                      {r.lesson_title || "—"}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <span className={`font-bold text-sm ${r.percent >= 70 ? "text-green-400" : r.percent >= 50 ? "text-yellow-400" : "text-red-400"}`}>
                        {r.percent}%
                      </span>
                      <span className="text-slate-600 text-xs ml-1">({r.score}/{r.total})</span>
                    </td>
                    <td className="px-3 py-3 text-right text-slate-600 text-xs hidden lg:table-cell">
                      {new Date(r.finished_at).toLocaleDateString("az-AZ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
