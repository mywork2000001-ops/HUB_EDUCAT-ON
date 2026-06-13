import Link from "next/link";
import { cookies } from "next/headers";
import { StudentNav } from "@/components/student/StudentNav";
import { ResourceGrid } from "@/components/curriculum/ResourceGrid";
import { VideoGrid } from "@/components/curriculum/VideoGrid";
import { getCurriculumItem, getGradeBySlug } from "@/server/queries/curriculum";
import { getResourcesByTopic } from "@/server/queries/resources";

interface Props {
  params:      Promise<{ grade: string; subject: string; topic: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export const revalidate = 60;

export default async function LearnTopicPage({ params, searchParams }: Props) {
  const { grade: gradeSlug, subject: subjectSlug, topic: topicSlug } = await params;
  const jar  = await cookies();
  const lang = (jar.get("eduhub-lang")?.value ?? "az") as "az" | "ru";

  const [topicData, resources, gradeData] = await Promise.all([
    getCurriculumItem(gradeSlug, subjectSlug, topicSlug),
    getResourcesByTopic(gradeSlug, subjectSlug, topicSlug),
    getGradeBySlug(gradeSlug),
  ]);

  const subjectData  = gradeData?.subjects.find((gs) => gs.subject.slug === subjectSlug)?.subject;
  const gradeLabel   = gradeData ? (lang === "ru" ? gradeData.label_ru : gradeData.label_az) : gradeSlug;
  const subjectLabel = subjectData ? (lang === "ru" ? subjectData.label_ru : subjectData.label_az) : subjectSlug;
  const topicTitle   = topicData
    ? (lang === "ru" ? topicData.title_ru : topicData.title_az)
    : topicSlug;

  /* ── Split resources ── */
  const videos  = resources.filter((r) => r.type === "VIDEO");
  const lessons = resources.filter((r) => r.type !== "VIDEO");
  const hasVideos = videos.length > 0;

  /* ── Active tab ── */
  const defaultTab = lessons.length === 0 && hasVideos ? "video" : "lessons";
  const { tab = defaultTab } = await searchParams;
  const isVideoTab = tab === "video" && hasVideos;

  const basePath = `/learn/${gradeSlug}/${subjectSlug}/${topicSlug}`;

  return (
    <>
      <StudentNav
        title={topicTitle}
        backHref={`/learn/${gradeSlug}/${subjectSlug}`}
        lang={lang}
        crumbs={[
          { label: lang === "ru" ? "Классы" : "Siniflər", href: "/learn" },
          { label: gradeLabel,   href: `/learn/${gradeSlug}` },
          { label: subjectLabel, href: `/learn/${gradeSlug}/${subjectSlug}` },
        ]}
      />

      <div className="max-w-3xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="mb-5">
          <h1 className="text-xl font-bold text-slate-900">{topicTitle}</h1>
          {resources.length > 0 && (
            <p className="text-slate-500 text-sm mt-0.5">
              {resources.length} {lang === "ru" ? "ресурс" : "resurs"}
              {hasVideos && ` · ${videos.length} video`}
            </p>
          )}
        </div>

        {/* Tabs — only when videos exist */}
        {hasVideos && (
          <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 mb-6">
            <Link
              href={basePath}
              className={`flex-1 text-center text-sm font-semibold py-2 rounded-lg transition-colors ${
                !isVideoTab
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}>
              📚 {lang === "ru" ? "Материалы" : "Materiallar"}
              {lessons.length > 0 && (
                <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                  !isVideoTab ? "bg-indigo-100 text-indigo-600" : "bg-slate-200 text-slate-500"
                }`}>
                  {lessons.length}
                </span>
              )}
            </Link>
            <Link
              href={`${basePath}?tab=video`}
              className={`flex-1 text-center text-sm font-semibold py-2 rounded-lg transition-colors ${
                isVideoTab
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}>
              ▶️ Video
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                isVideoTab ? "bg-rose-100 text-rose-600" : "bg-slate-200 text-slate-500"
              }`}>
                {videos.length}
              </span>
            </Link>
          </div>
        )}

        {/* Content */}
        {isVideoTab ? (
          <VideoGrid videos={videos} basePath={basePath} lang={lang} />
        ) : (
          <ResourceGrid
            resources={lessons.length > 0 ? lessons : resources}
            basePath={basePath}
            lang={lang}
          />
        )}
      </div>
    </>
  );
}
