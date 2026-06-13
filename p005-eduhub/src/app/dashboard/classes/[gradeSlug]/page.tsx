import Link from "next/link";
import { BreadcrumbNav } from "@/components/curriculum/BreadcrumbNav";
import { AppHeader } from "@/components/layout/AppHeader";
import { getGradeBySlug } from "@/server/queries/curriculum";

interface Props {
  params: Promise<{ gradeSlug: string }>;
}

export const revalidate = 60;

export default async function GradePage({ params }: Props) {
  const { gradeSlug } = await params;
  const grade    = await getGradeBySlug(gradeSlug);
  const subjects = grade?.subjects?.map((gs) => gs.subject) ?? [];

  if (!grade) {
    return (
      <div className="p-8 text-slate-400 text-sm">
        Sinif tapılmadı: <code>{gradeSlug}</code>
      </div>
    );
  }

  return (
    <>
      <AppHeader title={grade.label_az} />
      <div className="p-6 max-w-4xl">
        <BreadcrumbNav
          crumbs={[
            { label: "Siniflər" },
            { label: grade.label_az },
          ]}
        />

        <div className="mt-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">{grade.label_az}</h1>
            <p className="mt-1 text-slate-400 text-sm">Fənn seçin</p>
          </div>
          <Link
            href="/dashboard/manage/subjects"
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors
                       px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700"
          >
            + Fənn əlavə et
          </Link>
        </div>

        {subjects.length === 0 ? (
          <div className="mt-6 py-16 rounded-2xl bg-slate-900 border border-slate-800 text-center">
            <p className="text-4xl mb-3">📚</p>
            <p className="text-slate-400 text-sm">Bu sinif üçün hələ fənn əlavə edilməyib.</p>
            <Link
              href="/dashboard/manage/subjects"
              className="inline-block mt-4 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500
                         text-white text-sm transition-colors"
            >
              Fənn əlavə et
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {subjects.map((sub) => (
              <Link
                key={sub.slug}
                href={`/dashboard/classes/${gradeSlug}/${sub.slug}`}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-900
                           border border-slate-800 hover:border-slate-600 hover:bg-slate-800
                           transition-all text-center group"
              >
                <span className="text-3xl">{sub.icon ?? "📚"}</span>
                <span className="text-sm font-medium text-slate-300 group-hover:text-white">
                  {sub.label_az}
                </span>
                <span className="text-xs text-slate-600">{sub.label_ru}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
