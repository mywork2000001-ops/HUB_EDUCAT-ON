import { supabaseAdmin } from "@/lib/supabase";
import { AiInsights } from "./AiInsights";

export const revalidate = 60;

const PLATFORM_LABEL: Record<string, string> = {
  P001: "DİM Testlər", P002: "Riyaziyyat Dərsliyi",
  P003: "Blok İmtahan", P004: "TAİM 2026",
};
const PLATFORM_COLOR: Record<string, string> = {
  P001: "#f97316", P002: "#3b82f6", P003: "#a855f7", P004: "#22c55e",
};

type Row = { student_name: string; student_class: string; platform: string; lesson_title: string; percent: number; finished_at: string };

function avg(arr: number[]) { return arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0; }

export default async function AnalyticsPage() {
  let results: Row[] = [];
  if (supabaseAdmin) {
    const { data } = await supabaseAdmin
      .from("results")
      .select("student_name, student_class, platform, lesson_title, percent, finished_at")
      .order("finished_at", { ascending: true })
      .limit(1000);
    results = data ?? [];
  }

  const total    = results.length;
  const avgPct   = avg(results.map(r => r.percent));
  const passRate = total ? Math.round(results.filter(r => r.percent >= 70).length / total * 100) : 0;
  const students = new Set(results.map(r => r.student_name)).size;

  /* ── Last 14 days ── */
  const days14: { label: string; count: number }[] = [];
  const now = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now); d.setDate(d.getDate() - i);
    const ds = d.toISOString().slice(0, 10);
    days14.push({
      label: d.toLocaleDateString("az-AZ", { day: "2-digit", month: "2-digit" }),
      count: results.filter(r => r.finished_at?.startsWith(ds)).length,
    });
  }
  const maxDay = Math.max(...days14.map(d => d.count), 1);

  /* ── SVG line chart points ── */
  const W = 540, H = 80;
  const linePts = days14.map((d, i) => {
    const x = (i / 13) * (W - 20) + 10;
    const y = H - 10 - (d.count / maxDay) * (H - 20);
    return { x, y, count: d.count };
  });
  const polyline = linePts.map(p => `${p.x},${p.y}`).join(" ");
  const fillPoly = `10,${H - 10} ${polyline} ${W - 10},${H - 10}`;

  /* ── Platform breakdown ── */
  const pMap = new Map<string, number[]>();
  results.forEach(r => { (pMap.get(r.platform) ?? pMap.set(r.platform, []).get(r.platform)!).push(r.percent); });
  const byPlatform = [...pMap.entries()].map(([p, pcts]) => ({ p, count: pcts.length, avg: avg(pcts) })).sort((a, b) => b.count - a.count);

  /* ── Class performance ── */
  const cMap = new Map<string, number[]>();
  results.forEach(r => { if (r.student_class) (cMap.get(r.student_class) ?? cMap.set(r.student_class, []).get(r.student_class)!).push(r.percent); });
  const byClass = [...cMap.entries()].map(([cls, pcts]) => ({ cls, count: pcts.length, avg: avg(pcts) })).sort((a, b) => b.avg - a.avg);

  /* ── Score distribution (10 buckets) ── */
  const buckets = Array.from({ length: 10 }, (_, i) => {
    const lo = i * 10, hi = i === 9 ? 100 : (i + 1) * 10;
    const n = results.filter(r => r.percent >= lo && r.percent < hi + (i === 9 ? 1 : 0)).length;
    return { label: `${lo}–${hi}`, n };
  });
  const maxBucket = Math.max(...buckets.map(b => b.n), 1);

  /* ── Weak topics ── */
  const tMap = new Map<string, number[]>();
  results.forEach(r => { if (r.lesson_title?.trim()) (tMap.get(r.lesson_title) ?? tMap.set(r.lesson_title, []).get(r.lesson_title)!).push(r.percent); });
  const weakTopics = [...tMap.entries()]
    .filter(([, p]) => p.length >= 2)
    .map(([t, pcts]) => ({ t, avg: avg(pcts), count: pcts.length }))
    .sort((a, b) => a.avg - b.avg).slice(0, 6);

  /* ── Top students (by avg, min 2 tests) ── */
  const sMap = new Map<string, { cls: string; pcts: number[] }>();
  results.forEach(r => { const e = sMap.get(r.student_name); if (e) e.pcts.push(r.percent); else sMap.set(r.student_name, { cls: r.student_class ?? "", pcts: [r.percent] }); });
  const topStudents = [...sMap.entries()]
    .filter(([, v]) => v.pcts.length >= 2)
    .map(([name, v]) => ({ name, cls: v.cls, avg: avg(v.pcts), tests: v.pcts.length }))
    .sort((a, b) => b.avg - a.avg).slice(0, 6);

  const hasKey = !!process.env.GEMINI_API_KEY;

  if (total === 0) return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-2">Analitika</h1>
      <div className="bg-slate-900 rounded-xl border border-slate-800/70 py-16 text-center">
        <p className="text-4xl mb-3">📊</p>
        <p className="text-slate-500">Şagirdlər test bitirdikdə analitika burada görünəcək.</p>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Analitika</h1>
        <p className="text-slate-500 text-sm mt-0.5">{total} nəticə · {students} şagird · son 1000 qeyd</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { icon: "📋", val: total,               sub: "test nəticəsi",  color: "from-indigo-950/60 to-indigo-900/30 border-indigo-800/40 text-indigo-300" },
          { icon: "👥", val: students,             sub: "unikal şagird", color: "from-blue-950/60 to-blue-900/30 border-blue-800/40 text-blue-300" },
          { icon: "📈", val: `${avgPct}%`,         sub: "orta bal",      color: "from-violet-950/60 to-violet-900/30 border-violet-800/40 text-violet-300" },
          { icon: "✅", val: `${passRate}%`,        sub: "keçmə faizi",  color: passRate >= 70 ? "from-emerald-950/60 to-emerald-900/30 border-emerald-800/40 text-emerald-300" : "from-amber-950/60 to-amber-900/30 border-amber-800/40 text-amber-300" },
        ].map(({ icon, val, sub, color }) => (
          <div key={sub} className={`bg-gradient-to-br ${color} border rounded-xl p-4`}>
            <div className="text-xl mb-2">{icon}</div>
            <div className="text-2xl font-bold text-white">{val}</div>
            <div className="text-xs mt-1 opacity-60">{sub}</div>
          </div>
        ))}
      </div>

      {/* Activity chart + Platform breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Line chart: activity last 14 days */}
        <div className="bg-slate-900 rounded-xl border border-slate-800/70 p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Son 14 Gün — Test Aktivliyi</p>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon points={fillPoly} fill="url(#actGrad)" />
            <polyline points={polyline} fill="none" stroke="#6366f1" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
            {linePts.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={p.count > 0 ? 3 : 2}
                fill={p.count > 0 ? "#6366f1" : "#334155"} stroke="#0f172a" strokeWidth="1.5" />
            ))}
          </svg>
          <div className="flex justify-between mt-2">
            {days14.filter((_, i) => i % 2 === 0).map((d, i) => (
              <span key={i} className="text-[10px] text-slate-600">{d.label}</span>
            ))}
          </div>
        </div>

        {/* Platform breakdown */}
        <div className="bg-slate-900 rounded-xl border border-slate-800/70 p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Platforma Üzrə Nəticələr</p>
          <div className="space-y-3">
            {byPlatform.map(({ p, count, avg: a }) => (
              <div key={p}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-slate-300">{PLATFORM_LABEL[p] ?? p}</span>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>{count} test</span>
                    <span className={`font-bold ${a >= 70 ? "text-green-400" : a >= 50 ? "text-yellow-400" : "text-red-400"}`}>{a}% orta</span>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <div className="flex-1 bg-slate-800 rounded-full h-2">
                    <div className="h-2 rounded-full transition-all"
                      style={{ width: `${Math.round(count / total * 100)}%`, backgroundColor: PLATFORM_COLOR[p] ?? "#6366f1" }} />
                  </div>
                  <span className="text-[10px] text-slate-600 w-8 text-right">{Math.round(count / total * 100)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Score distribution + class performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Score histogram */}
        <div className="bg-slate-900 rounded-xl border border-slate-800/70 p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Bal Paylanması</p>
          <div className="flex items-end gap-1.5 h-28">
            {buckets.map((b, i) => {
              const pct = Math.round(b.n / maxBucket * 100);
              const color = i < 4 ? "#ef4444" : i < 6 ? "#f59e0b" : "#22c55e";
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                  {b.n > 0 && <span className="text-[9px] text-slate-500">{b.n}</span>}
                  <div className="w-full rounded-t transition-all" style={{ height: `${pct}%`, minHeight: b.n > 0 ? "4px" : "0", backgroundColor: color, opacity: 0.8 }} />
                </div>
              );
            })}
          </div>
          <div className="flex gap-1.5 mt-1">
            {buckets.map((b, i) => (
              <div key={i} className="flex-1 text-center text-[9px] text-slate-700">{i === 0 ? "0" : i === 9 ? "100" : ""}</div>
            ))}
          </div>
          <div className="flex items-center gap-3 mt-3 text-xs text-slate-600">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-red-500/70 inline-block" />0–39%</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-amber-500/70 inline-block" />40–59%</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-green-500/70 inline-block" />60–100%</span>
          </div>
        </div>

        {/* Class performance */}
        <div className="bg-slate-900 rounded-xl border border-slate-800/70 p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Sinif Üzrə Orta Bal</p>
          {byClass.length === 0 ? (
            <p className="text-slate-600 text-sm text-center py-6">Sinif məlumatı yoxdur</p>
          ) : (
            <div className="space-y-3">
              {byClass.slice(0, 7).map(({ cls, count: n, avg: a }) => (
                <div key={cls}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-slate-300">🏫 {cls}</span>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-600">{n} test</span>
                      <span className={`font-bold ${a >= 70 ? "text-green-400" : a >= 50 ? "text-yellow-400" : "text-red-400"}`}>{a}%</span>
                    </div>
                  </div>
                  <div className="bg-slate-800 rounded-full h-2">
                    <div className="h-2 rounded-full" style={{ width: `${a}%`, backgroundColor: a >= 70 ? "#22c55e" : a >= 50 ? "#f59e0b" : "#ef4444" }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Weak topics + Top students */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Weak topics */}
        <div className="bg-slate-900 rounded-xl border border-slate-800/70 p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">📉 Ən Zəif Mövzular</p>
          {weakTopics.length === 0 ? (
            <p className="text-slate-600 text-sm text-center py-6">Məlumat yoxdur</p>
          ) : (
            <div className="space-y-2.5">
              {weakTopics.map(({ t, avg: a, count: n }, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs text-slate-700 w-4 shrink-0 text-right">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-300 truncate">{t}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex-1 bg-slate-800 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full bg-red-500/70" style={{ width: `${a}%` }} />
                      </div>
                      <span className="text-[10px] text-red-400 font-bold w-8 shrink-0">{a}%</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-700 shrink-0">{n}×</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top students */}
        <div className="bg-slate-900 rounded-xl border border-slate-800/70 p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">🏆 Ən Yaxşı Şagirdlər</p>
          {topStudents.length === 0 ? (
            <p className="text-slate-600 text-sm text-center py-6">Min 2 test nəticəsi lazımdır</p>
          ) : (
            <div className="space-y-2">
              {topStudents.map(({ name, cls, avg: a, tests }, i) => (
                <div key={i} className="flex items-center gap-3 py-1.5 border-b border-slate-800/40 last:border-0">
                  <span className={`text-xs font-bold w-5 text-right shrink-0 ${i === 0 ? "text-yellow-400" : i === 1 ? "text-slate-400" : i === 2 ? "text-amber-700" : "text-slate-700"}`}>
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`}
                  </span>
                  <div className="w-7 h-7 rounded-full bg-indigo-950 flex items-center justify-center text-indigo-400 text-xs font-bold shrink-0">
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200 truncate">{name}</p>
                    <p className="text-xs text-slate-600">{cls || "—"} · {tests} test</p>
                  </div>
                  <span className="text-sm font-bold text-green-400 shrink-0">{a}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Gemini AI section */}
      <AiInsights hasKey={hasKey} />
    </div>
  );
}
