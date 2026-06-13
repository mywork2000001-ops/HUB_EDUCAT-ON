import Link from "next/link";
import { cookies } from "next/headers";
import { StudentNav } from "@/components/student/StudentNav";
import { getGradeBySlug } from "@/server/queries/curriculum";

interface Props {
  params: Promise<{ grade: string }>;
}

export const revalidate = 60;

export default async function LearnGradePage({ params }: Props) {
  const { grade: gradeSlug } = await params;
  const jar  = await cookies();
  const lang = (jar.get("eduhub-lang")?.value ?? "az") as "az" | "ru";

  const grade    = await getGradeBySlug(gradeSlug);
  const gradeLabel = grade
    ? (lang === "ru" ? grade.label_ru : grade.label_az)
    : gradeSlug;
  const subjects = grade?.subjects?.map((gs) => gs.subject) ?? [];

  return (
    <>
      <StudentNav
        title={gradeLabel}
        backHref="/learn"
        lang={lang}
        crumbs={[{ label: lang === "ru" ? "Классы" : "Siniflər", href: "/learn" }]}
      />

      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-900">{gradeLabel}</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {lang === "ru" ? "Выберите предмет" : "Fənn seçin"}
          </p>
        </div>

        {subjects.length === 0 ? (
          <div className="py-16 rounded-2xl bg-slate-50 border border-slate-200 text-center">
            <p className="text-4xl mb-3">📚</p>
            <p className="text-slate-500 text-sm">
              {lang === "ru" ? "Предметы ещё не добавлены." : "Hələ fənn əlavə edilməyib."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {subjects.map((sub) => (
              <Link
                key={sub.slug}
                href={`/learn/${gradeSlug}/${sub.slug}`}
                className="group flex flex-col items-center gap-3 p-5 rounded-2xl
                           bg-white border border-slate-200 shadow-sm
                           hover:border-indigo-300 hover:shadow-md hover:bg-indigo-50/30
                           transition-all active:scale-95 text-center"
              >
                <span className="text-3xl">{sub.icon ?? "📚"}</span>
                <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-700 leading-tight">
                  {lang === "ru" ? sub.label_ru : sub.label_az}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
