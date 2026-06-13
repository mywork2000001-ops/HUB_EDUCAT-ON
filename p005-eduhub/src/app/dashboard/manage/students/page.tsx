import Link from "next/link";
import { db } from "@/lib/db";

async function getStudents() {
  try {
    return await db.student.findMany({
      orderBy: [{ class_name: "asc" }, { name: "asc" }],
      select: { id: true, name: true, email: true, class_name: true, group_name: true, is_active: true, created_at: true },
    });
  } catch {
    return [];
  }
}

export const revalidate = 0;

export default async function StudentsManagePage() {
  const students = await getStudents();

  const byClass = students.reduce<Record<string, typeof students>>((acc, s) => {
    (acc[s.class_name] ??= []).push(s);
    return acc;
  }, {});

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Şagirdlər</h1>
          <p className="text-slate-400 text-sm mt-0.5">{students.length} şagird qeydiyyatda</p>
        </div>
        <Link
          href="/dashboard/manage/students/new"
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
        >
          + Yeni şagird
        </Link>
      </div>

      {students.length === 0 ? (
        <div className="py-16 rounded-2xl bg-slate-900 border border-slate-800 text-center">
          <p className="text-4xl mb-3">👥</p>
          <p className="text-slate-400 text-sm">Hələ şagird əlavə edilməyib.</p>
          <Link
            href="/dashboard/manage/students/new"
            className="inline-block mt-4 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm transition-colors"
          >
            İlk şagirdi əlavə et
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(byClass).map(([className, list]) => (
            <section key={className}>
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 px-1">
                {className} sinfi — {list.length} şagird
              </h2>
              <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                {list.map((s, i) => (
                  <div
                    key={s.id}
                    className={`flex items-center gap-4 px-4 py-3 ${i < list.length - 1 ? "border-b border-slate-800/60" : ""}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-950 flex items-center justify-center
                                    text-indigo-400 text-xs font-bold shrink-0">
                      {s.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate">{s.name}</p>
                      <p className="text-xs text-slate-500 truncate">
                        {s.email}
                        {s.group_name && <span className="ml-2 text-slate-600">· {s.group_name}</span>}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${
                      s.is_active
                        ? "bg-green-900/30 text-green-400 border-green-800/50"
                        : "bg-slate-800 text-slate-500 border-slate-700"
                    }`}>
                      {s.is_active ? "Aktiv" : "Deaktiv"}
                    </span>
                    <Link
                      href={`/dashboard/manage/students/${s.id}`}
                      className="text-xs text-slate-500 hover:text-slate-300 transition-colors px-2 py-1 rounded hover:bg-slate-800"
                    >
                      Düzəlt
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
