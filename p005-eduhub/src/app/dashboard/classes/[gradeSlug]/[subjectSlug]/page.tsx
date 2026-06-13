import Link from "next/link";
import { AppHeader } from "@/components/layout/AppHeader";
import { ChapterList } from "@/components/curriculum/ChapterList";
import { getCurriculumItems, getGradeBySlug } from "@/server/queries/curriculum";

interface Props {
  params:      Promise<{ gradeSlug: string; subjectSlug: string }>;
  searchParams: Promise<{ lang?: string }>;
}

export const revalidate = 0;

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

  const totalLessons = topics.reduce((acc, t) => acc + Math.max(t.children.length, 1), 0);

  return (
    <>
      <AppHeader title={`${subjectLabel} — ${gradeLabel}`} />
      <div className="p-6 max-w-4xl">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-4">
          <Link href={`/dashboard/classes/${gradeSlug}`} className="hover:text-slate-700 transition-colors">
            {gradeLabel}
          </Link>
          <span>/</span>
          <span className="text-slate-600 font-medium">{subjectLabel}</span>
        </nav>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {subjectLabel}
              <span className="text-slate-400 font-normal ml-2 text-xl">— {gradeLabel}</span>
            </h1>
            <p className="text-slate-400 text-sm mt-0.5">
              {topics.length} bölmə · {totalLessons} mövzu
            </p>
          </div>
          <Link
            href="/dashboard/manage/assignments"
            className="shrink-0 flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700
                       text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            📋 Tə'yin et
          </Link>
        </div>

        <ChapterList
          chapters={topics as Parameters<typeof ChapterList>[0]["chapters"]}
          gradeSlug={gradeSlug}
          subjectSlug={subjectSlug}
        />
      </div>
    </>
  );
}
