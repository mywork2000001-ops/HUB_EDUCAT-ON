import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";

type StudentStat = {
  name: string;
  studentClass: string;
  tests: number;
  avgPercent: number;
  lastActivity: string;
};

export const revalidate = 60;

export default async function StudentsPage() {
  let stats: StudentStat[] = [];
  let tableError = false;

  if (supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from("results")
      .select("student_name, student_class, percent, finished_at")
      .order("finished_at", { ascending: false });

    if (error) {
      tableError = true;
    } else if (data) {
      const map = new Map<
        string,
        { percents: number[]; last: string; studentClass: string }
      >();

      for (const r of data) {
        const key = `${r.student_name}|||${r.student_class ?? ""}`;
        const entry = map.get(key);
        if (entry) {
          entry.percents.push(r.percent);
        } else {
          map.set(key, {
            percents: [r.percent],
            last: r.finished_at,
            studentClass: r.student_class ?? "",
          });
        }
      }

      stats = Array.from(map.entries()).map(([key, v]) => ({
        name: key.split("|||")[0],
        studentClass: v.studentClass,
        tests: v.percents.length,
        avgPercent: Math.round(
          v.percents.reduce((a, b) => a + b, 0) / v.percents.length
        ),
        lastActivity: v.last,
      }));

      stats.sort((a, b) => b.tests - a.tests);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8">
      <header className="max-w-5xl mx-auto mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Şagirdlər</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {stats.length > 0 ? `${stats.length} şagird` : "Şagird siyahısı"}
          </p>
        </div>
        <Link
          href="/dashboard"
          className="text-slate-400 hover:text-white text-sm transition-colors"
        >
          ← Panel
        </Link>
      </header>

      {tableError ? (
        <div className="max-w-5xl mx-auto bg-red-950/40 border border-red-800 rounded-xl p-6 text-red-300 text-sm">
          <p className="font-semibold mb-1">Cədvəl tapılmadı</p>
          <p>
            Supabase SQL redaktorunda{" "}
            <code className="bg-red-900/50 px-1 rounded">supabase/migration.sql</code>{" "}
            faylını işlədin.
          </p>
        </div>
      ) : stats.length === 0 ? (
        <div className="max-w-5xl mx-auto bg-slate-900 rounded-xl p-10 text-center">
          <p className="text-slate-500 text-sm">
            Hələ heç bir şagird yoxdur. Test bitirildikdə burada görünəcək.
          </p>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.map((s) => (
            <div
              key={`${s.name}-${s.studentClass}`}
              className="bg-slate-900 rounded-xl p-5 hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold shrink-0">
                  {s.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-white font-medium text-sm truncate">{s.name}</div>
                  <div className="text-slate-400 text-xs">
                    {s.studentClass ? `${s.studentClass}-ci sinif` : "Sinif yoxdur"}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-slate-800 rounded-lg p-2 text-center">
                  <div className="text-slate-400 mb-0.5">Testlər</div>
                  <div className="text-white font-bold text-base">{s.tests}</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-2 text-center">
                  <div className="text-slate-400 mb-0.5">Orta bal</div>
                  <div
                    className={`font-bold text-base ${
                      s.avgPercent >= 70
                        ? "text-green-400"
                        : s.avgPercent >= 50
                        ? "text-yellow-400"
                        : "text-red-400"
                    }`}
                  >
                    {s.avgPercent}%
                  </div>
                </div>
                <div className="bg-slate-800 rounded-lg p-2 text-center">
                  <div className="text-slate-400 mb-0.5">Son gün</div>
                  <div className="text-slate-300 font-medium">
                    {new Date(s.lastActivity).toLocaleDateString("az-AZ", {
                      day: "numeric",
                      month: "short",
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
