import { supabaseAdmin } from "@/lib/supabase";

export const revalidate = 120;

type Row = {
  student_name: string;
  student_class: string | null;
  platform: string;
  lesson_title: string;
  percent: number;
  finished_at: string;
};

function avg(arr: number[]) {
  return arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;
}

const PLATFORM_COLOR: Record<string, string> = {
  P001: "#f97316", P002: "#3b82f6", P003: "#a855f7", P004: "#22c55e",
};

export default async function ProgressPage() {
  let results: Row[] = [];
  if (supabaseAdmin) {
    const { data } = await supabaseAdmin
      .from("results")
      .select("student_name, student_class, platform, lesson_title, percent, finished_at")
      .order("finished_at", { ascending: true })
      .limit(2000);
    results = data ?? [];
  }

  /* ── Per-student aggregates ── */
  const sMap = new Map<string, { cls: string; rows: Row[] }>();
  for (const r of results) {
    const e = sMap.get(r.student_name);
    if (e) e.rows.push(r);
    else sMap.set(r.student_name, { cls: r.student_class ?? "", rows: [r] });
  }

  const students = [...sMap.entries()]
    .map(([name, v]) => {
      const pcts   = v.rows.map(r => r.percent);
      const sorted = [...v.rows].sort((a, b) => new Date(a.finished_at).getTime() - new Date(b.finished_at).getTime());
      const first3 = sorted.slice(0, 3).map(r => r.percent);
      const last3  = sorted.slice(-3).map(r => r.percent);
      const trend  = avg(last3) - avg(first3);
      const plat   = new Map<string, number>();
      v.rows.forEach(r => plat.set(r.platform, (plat.get(r.platform) ?? 0) + 1));
      const topPlat = [...plat.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
      return { name, cls: v.cls, tests: v.rows.length, avgPct: avg(pcts), best: Math.max(...pcts), trend, topPlat, sorted };
    })
    .sort((a, b) => b.tests - a.tests);

  /* ── Per-class progress ── */
  const cMap = new Map<string, number[]>();
  results.forEach(r => {
    if (r.student_class) (cMap.get(r.student_class) ?? cMap.set(r.student_class, []).get(r.student_class)!).push(r.percent);
  });
  const byClass = [...cMap.entries()]
    .map(([cls, pcts]) => ({ cls, avg: avg(pcts), tests: pcts.length }))
    .sort((a, b) => b.avg - a.avg);

  /* ── Weekly progress (last 8 weeks) ── */
  const weeks: { label: string; avg: number; count: number }[] = [];
  for (let w = 7; w >= 0; w--) {
    const start = new Date(); start.setDate(start.getDate() - w * 7 - 6);
    const end   = new Date(); end.setDate(end.getDate() - w * 7);
    const startS = start.toISOString().slice(0, 10);
    const endS   = end.toISOString().slice(0, 10);
    const wRows  = results.filter(r => r.finished_at >= startS && r.finished_at <= endS);
    weeks.push({
      label: `${start.toLocaleDateString("az-AZ", { day: "2-digit", month: "2-digit" })}`,
      avg:   avg(wRows.map(r => r.percent)),
      count: wRows.length,
    });
  }
  const maxWeekAvg = Math.max(...weeks.map(w => w.avg), 1);

  if (results.length === 0) return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Proqres</h1>
      <div className="bg-slate-50 rounded-xl border border-slate-200 py-16 text-center">
        <p className="text-4xl mb-3">📈</p>
        <p className="text-slate-500">Şagirdlər test bitirdikdə proqres burada görünəcək.</p>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Proqres İzləmə</h1>
        <p className="text-slate-500 text-sm mt-0.5">{students.length} şagird · {results.length} nəticə</p>
      </div>

      {/* Weekly avg bar chart */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Son 8 Həftə — Orta Bal Trendi</p>
        <div className="flex items-end gap-2 h-32">
          {weeks.map((w, i) => {
            const h = maxWeekAvg > 0 ? Math.round((w.avg / maxWeekAvg) * 100) : 0;
            const color = w.avg >= 70 ? "#22c55e" : w.avg >= 50 ? "#f59e0b" : w.avg > 0 ? "#ef4444" : "#e2e8f0";
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                {w.count > 0 && <span className="text-[10px] text-slate-500 font-bold">{w.avg}%</span>}
                <div className="w-full rounded-t-sm transition-all flex-1 flex items-end">
                  <div className="w-full rounded-t-sm" style={{ height: `${Math.max(h, w.count > 0 ? 4 : 0)}%`, backgroundColor: color }} />
                </div>
                <span className="text-[9px] text-slate-400 text-center leading-tight">{w.label}</span>
                {w.count > 0 && <span className="text-[9px] text-slate-400">{w.count}×</span>}
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-green-500 inline-block" />≥70% (keçdi)</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-amber-400 inline-block" />50–69%</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-red-400 inline-block" />&lt;50%</span>
        </div>
      </div>

      {/* Class comparison */}
      {byClass.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Sinif Müqayisəsi</p>
          <div className="space-y-3">
            {byClass.map(({ cls, avg: a, tests }) => (
              <div key={cls} className="flex items-center gap-4">
                <div className="w-16 shrink-0 text-xs font-semibold text-slate-700 text-right">{cls}</div>
                <div className="flex-1 bg-slate-100 rounded-full h-5 relative overflow-hidden">
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${a}%`, backgroundColor: a >= 70 ? "#22c55e" : a >= 50 ? "#f59e0b" : "#ef4444", opacity: 0.85 }} />
                  <span className="absolute inset-y-0 left-2 flex items-center text-[10px] font-bold text-white drop-shadow">{a}%</span>
                </div>
                <span className="text-xs text-slate-400 w-12 shrink-0">{tests} test</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Per-student progress table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Şagird Proqresi</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Şagird</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Sinif</th>
                <th className="px-3 py-2.5 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">Test</th>
                <th className="px-3 py-2.5 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">Orta</th>
                <th className="px-3 py-2.5 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">Ən yaxşı</th>
                <th className="px-4 py-2.5 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">Trend</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Platform</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Proqres (son 5)</th>
              </tr>
            </thead>
            <tbody>
              {students.slice(0, 30).map(({ name, cls, tests, avgPct, best, trend, topPlat, sorted }, idx) => {
                const last5 = sorted.slice(-5);
                return (
                  <tr key={idx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold shrink-0">
                          {name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-slate-800 font-medium">{name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{cls || "—"}</td>
                    <td className="px-3 py-3 text-center text-slate-500 text-xs font-mono">{tests}</td>
                    <td className="px-3 py-3 text-center">
                      <span className={`text-sm font-bold ${avgPct >= 70 ? "text-green-600" : avgPct >= 50 ? "text-amber-600" : "text-red-600"}`}>
                        {avgPct}%
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center text-slate-500 text-xs font-mono">{best}%</td>
                    <td className="px-4 py-3 text-center">
                      {tests < 3 ? (
                        <span className="text-slate-300 text-xs">—</span>
                      ) : trend > 5 ? (
                        <span className="text-green-600 text-xs font-bold">▲ +{trend}</span>
                      ) : trend < -5 ? (
                        <span className="text-red-500 text-xs font-bold">▼ {trend}</span>
                      ) : (
                        <span className="text-slate-400 text-xs">→ {trend > 0 ? "+" : ""}{trend}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: `${PLATFORM_COLOR[topPlat] ?? "#6366f1"}18`, color: PLATFORM_COLOR[topPlat] ?? "#6366f1" }}>
                        {topPlat}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-end gap-0.5 h-6">
                        {last5.map((r, i) => (
                          <div key={i} className="flex-1 rounded-sm"
                            style={{
                              height: `${Math.max(Math.round(r.percent / 100 * 100), 8)}%`,
                              backgroundColor: r.percent >= 70 ? "#22c55e" : r.percent >= 50 ? "#f59e0b" : "#ef4444",
                              opacity: 0.8,
                            }}
                            title={`${r.percent}% — ${r.lesson_title}`}
                          />
                        ))}
                        {Array.from({ length: Math.max(0, 5 - last5.length) }).map((_, i) => (
                          <div key={`e${i}`} className="flex-1 rounded-sm bg-slate-100" style={{ height: "8%" }} />
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {students.length > 30 && (
          <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-400 text-center">
            + {students.length - 30} şagird daha (ən aktiv 30 göstərilir)
          </div>
        )}
      </div>

    </div>
  );
}
