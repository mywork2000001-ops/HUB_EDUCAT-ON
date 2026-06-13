import Link from "next/link";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifyStudentToken } from "@/lib/student-auth";

async function getGrades() {
  try {
    return await db.grade.findMany({ orderBy: { number: "asc" } });
  } catch {
    return [];
  }
}

const GRADE_ICONS: Record<number, string> = {
  1: "🔢", 2: "🔢", 3: "🔢", 4: "🔢",
  5: "📐", 6: "📐", 7: "📐",
  8: "🧮", 9: "🧮", 10: "🧮", 11: "🎓",
};

export default async function LearnPage() {
  const jar    = await cookies();
  const token  = jar.get("eduhub-student-token")?.value;
  const student = token ? await verifyStudentToken(token) : null;
  const grades  = await getGrades();

  return (
    <main className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-800 bg-slate-950/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-indigo-400">EduHub</span>
            {student && (
              <span className="ml-2 text-xs text-slate-400">
                {student.name} · {student.class_name}
                {student.group_name && ` · ${student.group_name}`}
              </span>
            )}
          </div>
          <form action="/api/student/auth/logout" method="POST">
            <button
              type="submit"
              className="text-xs text-slate-500 hover:text-red-400 transition-colors px-2 py-1"
            >
              Çıxış
            </button>
          </form>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Sinif seçin</h1>
          <p className="text-slate-400 text-sm mt-1">Öyrənməyə başlamaq üçün sinifinizi seçin</p>
        </div>

        {grades.length === 0 ? (
          <div className="text-center py-16 rounded-2xl bg-slate-900 border border-slate-800">
            <p className="text-slate-500 text-sm">Məzmun hazırlanır…</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {grades.map((grade) => (
              <Link
                key={grade.slug}
                href={`/learn/${grade.slug}`}
                className="group relative flex flex-col items-center justify-center gap-3
                           rounded-2xl bg-slate-900 border border-slate-800 p-6
                           hover:border-indigo-500/50 hover:bg-slate-800 transition-all
                           active:scale-95"
              >
                <span className="text-4xl">{GRADE_ICONS[grade.number] ?? "📚"}</span>
                <span className="text-base font-semibold text-slate-200 group-hover:text-white">
                  {grade.label_az}
                </span>
                <span className="absolute top-3 right-3 text-slate-600 group-hover:text-indigo-400
                                 transition-colors text-xs">→</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
