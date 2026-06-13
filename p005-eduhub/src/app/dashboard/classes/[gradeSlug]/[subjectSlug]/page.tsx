import Link from "next/link";
import { BreadcrumbNav } from "@/components/curriculum/BreadcrumbNav";
import { AppHeader } from "@/components/layout/AppHeader";
import { getCurriculumItems, getGradeBySlug } from "@/server/queries/curriculum";
import type { Lang } from "@/lib/constants";

interface Props {
  params:      Promise<{ gradeSlug: string; subjectSlug: string }>;
  searchParams: Promise<{ lang?: string }>;
}

export const revalidate = 60;

export default async function SubjectPage({ params, searchParams }: Props) {
  const { gradeSlug, subjectSlug } = await params;
  const { lang = "az" }            = await searchParams;

  const [gradeData, topics] = await Promise.all([
    getGradeBySlug(gradeSlug),
    getCurriculumItems(gradeSlug, subjectSlug),
  ]);

  const subjectData  = gradeData?.subjects.find((gs) => gs.subject.slug === subjectSlug)?.subject;
  const gradeLabel   = gradeData ? gradeData.label_az : gradeSlug;
  const subjectLabel = subjectData
    ? (lang === "ru" ? subjectData.label_ru : subjectData.label_az)
    : subjectSlug;

  return (
    <>
      <AppHeader title={`${subjectLabel} — ${gradeLabel}`} />
      <div className="p-6 max-w-4xl">
        <BreadcrumbNav
          crumbs={[
            { label: gradeLabel, href: `/dashboard/classes/${gradeSlug}` },
            { label: subjectLabel },
          ]}
        />

        <h1 className="mt-4 text-2xl font-bold text-white">
          {subjectLabel} — {gradeLabel}
        </h1>
        <p className="mt-1 text-slate-400 text-sm">
          {topics.length > 0
            ? `${topics.length} mövzu`
            : lang === "az" ? "Mövzu tapılmadı" : "Темы не найдены"}
        </p>

        {topics.length === 0 ? (
          <div className="mt-12 text-center py-16 rounded-2xl bg-slate-900 border border-slate-800">
            <p className="text-slate-500 text-sm">
              {lang === "az"
                ? "Məlumat bazası qurulduqdan sonra mövzular burada görünəcək."
                : "Темы появятся после настройки базы данных."}
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-2">
            {topics.map((topic, idx) => {
              const title = (lang as Lang) === "az" ? topic.title_az : topic.title_ru;
              return (
                <Link
                  key={topic.id}
                  href={`/dashboard/classes/${gradeSlug}/${subjectSlug}/${topic.slug}?lang=${lang}`}
                  className="flex items-center gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800
                             hover:border-slate-600 hover:bg-slate-800 transition-all group"
                >
                  <span className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center
                                   text-sm font-semibold text-slate-400 group-hover:bg-slate-700 shrink-0">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-200 group-hover:text-white truncate">
                      {title}
                    </p>
                    {topic._count.resources > 0 && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        {topic._count.resources} resurs
                      </p>
                    )}
                  </div>
                  <span className="text-slate-600 group-hover:text-slate-400 shrink-0">→</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
