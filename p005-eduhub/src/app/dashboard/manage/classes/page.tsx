"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

type Student = { id: string; name: string; email: string; group_name: string | null; is_active: boolean };
type ClassGroup = { name: string; count: number };
type ClassData = { class_name: string; students: Student[]; groups: ClassGroup[] };

export default function ManageClassesPage() {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [open, setOpen]       = useState<string | null>(null);
  const [newClass, setNewClass] = useState("");
  const [adding, setAdding]   = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/students");
    const d   = await res.json();
    const students: (Student & { class_name: string })[] = d.students ?? [];

    const map = new Map<string, (Student & { class_name: string })[]>();
    for (const s of students) {
      (map.get(s.class_name) ?? map.set(s.class_name, []).get(s.class_name)!).push(s);
    }

    const out: ClassData[] = [...map.entries()].sort(([a],[b]) => a.localeCompare(b)).map(([cls, list]) => {
      const gMap = new Map<string, number>();
      for (const s of list) {
        const g = s.group_name ?? "Qrupsuz";
        gMap.set(g, (gMap.get(g) ?? 0) + 1);
      }
      return {
        class_name: cls,
        students:   list,
        groups:     [...gMap.entries()].map(([name, count]) => ({ name, count })),
      };
    });
    setClasses(out);
    if (out.length > 0 && !open) setOpen(out[0].class_name);
  }, [open]);

  useEffect(() => { load(); }, [load]);

  async function handleAddClass() {
    if (!newClass.trim()) return;
    setAdding(true);
    // Navigate to new student form pre-filled with this class
    window.location.href = `/dashboard/manage/students/new?class=${encodeURIComponent(newClass.trim())}`;
  }

  const totalStudents = classes.reduce((s, c) => s + c.students.length, 0);
  const totalGroups   = classes.reduce((s, c) => s + c.groups.filter(g => g.name !== "Qrupsuz").length, 0);

  return (
    <div className="p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Siniflər və Qruplar</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {classes.length} sinif · {totalStudents} şagird · {totalGroups} qrup
          </p>
        </div>
        <Link href="/dashboard/manage/students/new"
          className="shrink-0 flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors">
          + Yeni şagird
        </Link>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { icon: "🏫", val: classes.length,  label: "Sinif"    },
          { icon: "👥", val: totalStudents,    label: "Şagird"   },
          { icon: "🔀", val: totalGroups,      label: "Qrup"     },
        ].map(({ icon, val, label }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-center">
            <div className="text-2xl mb-1">{icon}</div>
            <div className="text-2xl font-bold text-slate-900">{val}</div>
            <div className="text-xs text-slate-400 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Add new class shortcut */}
      <div className="mb-5 bg-white border border-dashed border-indigo-300 rounded-xl p-4 flex items-center gap-3">
        <span className="text-2xl">➕</span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-700 mb-0.5">Yeni sinif yarat</p>
          <p className="text-xs text-slate-400">Sinif adı yazın, şagird əlavə etmə forması açılacaq</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <input
            value={newClass}
            onChange={e => setNewClass(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAddClass()}
            placeholder="5A, Robototexnika..."
            className="w-40 text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 bg-white text-slate-900"
          />
          <button
            onClick={handleAddClass}
            disabled={!newClass.trim() || adding}
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg disabled:opacity-40 transition-colors"
          >
            Davam →
          </button>
        </div>
      </div>

      {/* Class list */}
      {classes.length === 0 ? (
        <div className="py-20 bg-white rounded-2xl border border-slate-200 text-center shadow-sm">
          <p className="text-4xl mb-3">🏫</p>
          <p className="text-slate-500 font-medium">Hələ şagird əlavə edilməyib</p>
          <p className="text-slate-400 text-sm mt-1 mb-5">Şagirdlər əlavə edildikdə siniflər burada görünəcək</p>
          <Link href="/dashboard/manage/students/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors">
            İlk şagirdi əlavə et
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {classes.map(cls => {
            const isOpen = open === cls.class_name;
            const activeCount = cls.students.filter(s => s.is_active).length;
            return (
              <div key={cls.class_name} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Class header */}
                <button
                  onClick={() => setOpen(isOpen ? null : cls.class_name)}
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors text-left">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm shrink-0">
                    {cls.class_name.slice(0,2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900">{cls.class_name}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-slate-400">{cls.students.length} şagird</span>
                      {cls.groups.filter(g => g.name !== "Qrupsuz").map(g => (
                        <span key={g.name} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                          {g.name} · {g.count}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      activeCount === cls.students.length
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}>
                      {activeCount}/{cls.students.length} aktiv
                    </span>
                    <span className="text-slate-400 text-sm">{isOpen ? "▲" : "▼"}</span>
                  </div>
                </button>

                {/* Students list */}
                {isOpen && (
                  <div className="border-t border-slate-100">
                    {/* Group tabs */}
                    {cls.groups.length > 1 && (
                      <div className="flex items-center gap-1.5 px-5 py-3 border-b border-slate-100 flex-wrap">
                        {cls.groups.map(g => (
                          <span key={g.name} className="flex items-center gap-1.5 text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-1 rounded-full font-medium">
                            {g.name === "Qrupsuz" ? "🔓" : "🔀"} {g.name}
                            <span className="bg-indigo-100 text-indigo-600 rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">{g.count}</span>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Students */}
                    <div className="divide-y divide-slate-100">
                      {cls.students.map(s => (
                        <div key={s.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xs font-bold shrink-0">
                            {s.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800 truncate">{s.name}</p>
                            <p className="text-xs text-slate-400 truncate">{s.email}</p>
                          </div>
                          {s.group_name && (
                            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full hidden sm:inline">
                              {s.group_name}
                            </span>
                          )}
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.is_active ? "bg-green-500" : "bg-slate-300"}`} />
                          <Link href={`/dashboard/manage/students/${s.id}`}
                            className="text-xs text-slate-400 hover:text-indigo-600 transition-colors shrink-0">
                            Düzəlt
                          </Link>
                        </div>
                      ))}
                    </div>

                    {/* Footer actions */}
                    <div className="flex items-center gap-3 px-5 py-3 border-t border-slate-100 bg-slate-50">
                      <Link
                        href={`/dashboard/manage/students/new?class=${encodeURIComponent(cls.class_name)}`}
                        className="text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
                        + Bu sinfə şagird əlavə et
                      </Link>
                      <Link
                        href={`/dashboard/manage/assignments?class=${encodeURIComponent(cls.class_name)}`}
                        className="text-xs text-slate-400 hover:text-slate-700 transition-colors ml-auto">
                        📋 Tə'yinat →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
