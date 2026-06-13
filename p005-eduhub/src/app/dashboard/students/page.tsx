import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";
import { db } from "@/lib/db";

export const revalidate = 60;

export default async function StudentsPage() {
  // Registered students from Prisma
  let registered: { id: string; name: string; email: string; class_name: string; group_name: string | null; is_active: boolean }[] = [];
  try {
    registered = await db.student.findMany({
      orderBy: [{ class_name: "asc" }, { name: "asc" }],
      select: { id: true, name: true, email: true, class_name: true, group_name: true, is_active: true },
    });
  } catch {}

  // Activity stats from results table
  type ActivityMap = Map<string, { percents: number[]; last: string; cls: string; count: number }>;
  const actMap: ActivityMap = new Map();

  if (supabaseAdmin) {
    const { data } = await supabaseAdmin
      .from("results")
      .select("student_name, student_class, percent, finished_at")
      .order("finished_at", { ascending: false });

    if (data) {
      for (const r of data) {
        const key = `${r.student_name}|||${r.student_class ?? ""}`;
        const e   = actMap.get(key);
        if (e) { e.percents.push(r.percent); e.count++; }
        else   actMap.set(key, { percents: [r.percent], last: r.finished_at, cls: r.student_class ?? "", count: 1 });
      }
    }
  }

  const actStats = Array.from(actMap.entries())
    .map(([key, v]) => ({
      name:       key.split("|||")[0],
      cls:        v.cls,
      tests:      v.count,
      avgPct:     Math.round(v.percents.reduce((a, b) => a + b, 0) / v.percents.length),
      lastAt:     v.last,
    }))
    .sort((a, b) => b.tests - a.tests);

  const byClass = registered.reduce<Record<string, typeof registered>>((acc, s) => {
    (acc[s.class_name] ??= []).push(s);
    return acc;
  }, {});

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Şagirdlər</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {registered.length} qeydiyyatlı · {actStats.length} aktiv test iştirakçısı
          </p>
        </div>
        <Link href="/dashboard/manage/students/new"
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">
          + Yeni şagird
        </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Registered students by class */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-300">Qeydiyyatlı şagirdlər</h2>
            <Link href="/dashboard/manage/students" className="text-xs text-indigo-400 hover:text-indigo-300">Ətraflı →</Link>
          </div>

          {registered.length === 0 ? (
            <div className="bg-slate-900 rounded-xl border border-slate-800/70 py-10 text-center">
              <p className="text-slate-600 text-sm">Hələ şagird əlavə edilməyib.</p>
              <Link href="/dashboard/manage/students/new"
                className="inline-block mt-3 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs transition-colors">
                İlk şagirdi əlavə et
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(byClass).map(([cls, list]) => (
                <div key={cls} className="bg-slate-900 rounded-xl border border-slate-800/70 overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-slate-800/50 flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">🏫 {cls} sinfi</span>
                    <span className="ml-auto text-xs text-slate-600">{list.length} şagird</span>
                  </div>
                  {list.map((s) => (
                    <div key={s.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-slate-800/30 last:border-0">
                      <div className="w-7 h-7 rounded-full bg-indigo-950 flex items-center justify-center text-indigo-400 text-xs font-bold shrink-0">
                        {s.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-200 truncate">{s.name}</p>
                        <p className="text-xs text-slate-600 truncate">{s.email}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {s.group_name && (
                          <span className="text-xs text-slate-600 hidden sm:inline">{s.group_name}</span>
                        )}
                        <span className={`w-1.5 h-1.5 rounded-full ${s.is_active ? "bg-green-500" : "bg-slate-600"}`} />
                        <Link href={`/dashboard/manage/students/${s.id}`}
                          className="text-xs text-slate-600 hover:text-slate-300 transition-colors">
                          Düzəlt
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Activity stats */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-300">Test aktivliyi</h2>
            <Link href="/dashboard/results" className="text-xs text-indigo-400 hover:text-indigo-300">Nəticələr →</Link>
          </div>

          {actStats.length === 0 ? (
            <div className="bg-slate-900 rounded-xl border border-slate-800/70 py-10 text-center">
              <p className="text-slate-600 text-sm">Hələ test nəticəsi yoxdur.</p>
            </div>
          ) : (
            <div className="bg-slate-900 rounded-xl border border-slate-800/70 overflow-hidden">
              {actStats.slice(0, 20).map((s, i) => (
                <div key={`${s.name}-${s.cls}`}
                  className="flex items-center gap-3 px-4 py-3 border-b border-slate-800/30 last:border-0">
                  <span className="text-xs text-slate-700 w-5 text-right shrink-0">{i + 1}</span>
                  <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 text-xs font-bold shrink-0">
                    {s.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200 truncate">{s.name}</p>
                    <p className="text-xs text-slate-600">{s.cls || "—"} · {s.tests} test</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-bold ${s.avgPct >= 70 ? "text-green-400" : s.avgPct >= 50 ? "text-yellow-400" : "text-red-400"}`}>
                      {s.avgPct}%
                    </p>
                    <p className="text-xs text-slate-600">orta</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
