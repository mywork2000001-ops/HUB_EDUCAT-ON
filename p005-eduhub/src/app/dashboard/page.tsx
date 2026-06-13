import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";
import { db } from "@/lib/db";
import { StatCard } from "@/components/ui/StatCard";
import { PageHeader } from "@/components/ui/PageHeader";

export const revalidate = 60;

const PLATFORM_LABEL: Record<string, string> = {
  P001: "DİM Testlər", P002: "Riyaziyyat Dərsliyi",
  P003: "Blok İmtahan", P004: "TAİM 2026",
};
const PLATFORM_HEX: Record<string, string> = {
  P001: "#f97316", P002: "#3b82f6", P003: "#a855f7", P004: "#22c55e",
};

async function getData() {
  const empty = { total: 0, students: 0, avg: 0, passRate: 0, recent: [] as Row[], byPlatform: [] as PStat[], last7: 0, prev7: 0 };
  if (!supabaseAdmin) return empty;

  const { data } = await supabaseAdmin
    .from("results")
    .select("id,student_name,student_class,platform,lesson_title,percent,score,total,finished_at")
    .order("finished_at", { ascending: false })
    .limit(500);

  if (!data || !data.length) return empty;

  const now   = Date.now();
  const day7  = 7 * 24 * 3600 * 1000;
  const last7  = data.filter(r => r.finished_at && now - new Date(r.finished_at).getTime() < day7).length;
  const prev7  = data.filter(r => r.finished_at && now - new Date(r.finished_at).getTime() >= day7 && now - new Date(r.finished_at).getTime() < 2 * day7).length;

  const avg      = Math.round(data.reduce((s, r) => s + r.percent, 0) / data.length);
  const passRate = Math.round(data.filter(r => r.percent >= 70).length / data.length * 100);
  const students = new Set(data.map(r => `${r.student_name}|||${r.student_class}`)).size;

  const pMap = new Map<string, number>();
  data.forEach(r => pMap.set(r.platform, (pMap.get(r.platform) ?? 0) + 1));
  const byPlatform = [...pMap.entries()].map(([platform, count]) => ({ platform, count })).sort((a, b) => b.count - a.count);

  return { total: data.length, students, avg, passRate, recent: data.slice(0, 10) as Row[], byPlatform, last7, prev7 };
}

async function getSys() {
  try {
    const [studentCount, gradeCount, assignCount] = await Promise.all([
      db.student.count(),
      db.grade.count(),
      db.assignment.count(),
    ]);
    return { studentCount, gradeCount, assignCount };
  } catch { return { studentCount: 0, gradeCount: 0, assignCount: 0 }; }
}

type Row   = { id: string; student_name: string; student_class: string; platform: string; lesson_title: string; percent: number; score: number; total: number; finished_at: string };
type PStat = { platform: string; count: number };

export default async function DashboardPage() {
  const [d, sys] = await Promise.all([getData(), getSys()]);
  const weekTrend = d.prev7 > 0 ? Math.round((d.last7 - d.prev7) / d.prev7 * 100) : 0;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="İcmal"
        description="Şagird fəaliyyəti və platforma statistikası"
      />

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard label="Toplam nəticə"  value={d.total}                    icon="📋" sub="test başa çatdı"        href="/dashboard/results"  color="indigo" />
        <StatCard label="Aktiv şagird"   value={d.students}                  icon="👥" sub="test iştirakçısı"       href="/dashboard/students" color="blue"   />
        <StatCard label="Orta bal"        value={d.total ? `${d.avg}%` : "—"} icon="📊" sub="bütün testlər üzrə"     href="/dashboard/analytics" color="violet"
          trend={d.total ? { value: weekTrend, label: "%" } : undefined} />
        <StatCard label="Keçmə faizi"    value={d.total ? `${d.passRate}%` : "—"} icon="✅" sub="≥70% nəticə"    href="/dashboard/results"  color={d.passRate >= 70 ? "emerald" : "amber"} />
      </div>

      {/* ── System row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">

        {/* Registration summary */}
        <div className="bg-slate-900 rounded-xl border border-slate-800/70 p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Qeydiyyat</p>
          <div className="space-y-3">
            {[
              { label: "Qeydiyyatlı şagird", val: sys.studentCount, icon: "👥", href: "/dashboard/manage/students" },
              { label: "Aktiv sinif",         val: sys.gradeCount,    icon: "🏫", href: "/dashboard/classes" },
              { label: "Tə'yinat",            val: sys.assignCount,   icon: "📋", href: "/dashboard/manage/assignments" },
            ].map(({ label, val, icon, href }) => (
              <Link key={label} href={href}
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/40 hover:bg-slate-800
                           transition-colors group">
                <span className="text-lg">{icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-500">{label}</p>
                </div>
                <span className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                  {val}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Platform breakdown */}
        <div className="bg-slate-900 rounded-xl border border-slate-800/70 p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Platforma üzrə</p>
            {d.last7 > 0 && (
              <span className="text-xs text-slate-600">Bu həftə: {d.last7}</span>
            )}
          </div>
          {d.byPlatform.length === 0 ? (
            <p className="text-slate-600 text-sm py-4 text-center">Hələ nəticə yoxdur</p>
          ) : (
            <div className="space-y-3">
              {d.byPlatform.map(({ platform, count }) => (
                <div key={platform}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-slate-300">
                      {PLATFORM_LABEL[platform] ?? platform}
                    </span>
                    <span className="text-xs text-slate-500">{count}</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.round(count / d.total * 100)}%`,
                        backgroundColor: PLATFORM_HEX[platform] ?? "#6366f1",
                      }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="bg-slate-900 rounded-xl border border-slate-800/70 p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Sürətli əməliyyat</p>
          <div className="space-y-2">
            {[
              { href: "/dashboard/manage/students/new", label: "Yeni şagird əlavə et",   icon: "👤", color: "hover:bg-indigo-950/50 hover:border-indigo-800/50 hover:text-indigo-300" },
              { href: "/dashboard/manage/assignments",   label: "Mövzu tə'yin et",         icon: "📋", color: "hover:bg-blue-950/50 hover:border-blue-800/50 hover:text-blue-300"     },
              { href: "/dashboard/manage/subjects",      label: "Fənn idarə et",           icon: "📚", color: "hover:bg-violet-950/50 hover:border-violet-800/50 hover:text-violet-300"},
              { href: "/dashboard/analytics",            label: "Analitikaya bax",         icon: "📊", color: "hover:bg-emerald-950/50 hover:border-emerald-800/50 hover:text-emerald-300"},
            ].map(({ href, label, icon, color }) => (
              <Link key={href} href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg
                            border border-slate-800/40 bg-slate-800/20 text-slate-400 text-sm
                            transition-all ${color}`}>
                <span className="text-base">{icon}</span>
                <span>{label}</span>
                <span className="ml-auto text-xs opacity-50">→</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Recent results ── */}
      <div className="bg-slate-900 rounded-xl border border-slate-800/70 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/70">
          <div>
            <h2 className="text-sm font-semibold text-white">Son nəticələr</h2>
            {d.total > 0 && (
              <p className="text-xs text-slate-600 mt-0.5">Ən son {Math.min(d.recent.length, 10)} qeyd</p>
            )}
          </div>
          {d.total > 0 && (
            <Link href="/dashboard/results"
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors px-3 py-1.5
                         rounded-lg hover:bg-indigo-950/30">
              Hamısını gör →
            </Link>
          )}
        </div>

        {d.recent.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-4xl mb-3">📊</p>
            <p className="text-slate-500 text-sm">Şagirdlər test bitirdikdə burada görünəcək.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-950/40 border-b border-slate-800/50">
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Şagird</th>
                  <th className="px-3 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Sinif</th>
                  <th className="px-3 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Platform</th>
                  <th className="px-3 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Mövzu</th>
                  <th className="px-3 py-3 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Nəticə</th>
                  <th className="px-3 py-3 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Tarix</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {d.recent.map((r, i) => (
                  <tr key={r.id}
                    className={`transition-colors hover:bg-slate-800/30 ${i % 2 === 0 ? "" : "bg-slate-900/30"}`}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-indigo-950 flex items-center justify-center
                                        text-indigo-400 text-xs font-bold shrink-0">
                          {r.student_name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-white font-medium">{r.student_name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3.5 hidden sm:table-cell">
                      <span className="text-xs text-slate-500 bg-slate-800/60 px-2 py-0.5 rounded">
                        {r.student_class || "—"}
                      </span>
                    </td>
                    <td className="px-3 py-3.5">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full border"
                        style={{
                          backgroundColor: `${PLATFORM_HEX[r.platform] ?? "#6366f1"}15`,
                          borderColor:     `${PLATFORM_HEX[r.platform] ?? "#6366f1"}40`,
                          color:            PLATFORM_HEX[r.platform] ?? "#6366f1",
                        }}>
                        {r.platform}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 text-slate-400 text-xs max-w-[160px] truncate hidden md:table-cell">
                      {r.lesson_title || "—"}
                    </td>
                    <td className="px-3 py-3.5 text-right">
                      <div className="flex flex-col items-end gap-0.5">
                        <span className={`text-sm font-bold ${
                          r.percent >= 70 ? "text-emerald-400" : r.percent >= 50 ? "text-amber-400" : "text-rose-400"
                        }`}>{r.percent}%</span>
                        <span className="text-[10px] text-slate-600">{r.score}/{r.total}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3.5 text-right text-xs text-slate-600 hidden lg:table-cell">
                      {r.finished_at
                        ? new Date(r.finished_at).toLocaleDateString("az-AZ", { day: "2-digit", month: "short" })
                        : "—"}
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
