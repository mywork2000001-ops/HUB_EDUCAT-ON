import { cookies } from "next/headers";
import { StudentNav } from "@/components/student/StudentNav";
import { ResourceGrid } from "@/components/curriculum/ResourceGrid";
import { getCurriculumItem, getGradeBySlug } from "@/server/queries/curriculum";
import { getResourcesByTopic } from "@/server/queries/resources";

interface Props {
  params: Promise<{ grade: string; subject: string; topic: string }>;
}

export const revalidate = 60;

export default async function LearnTopicPage({ params }: Props) {
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
        <div className="mb-6">
          <h1 className="text-xl font-bold text-white">{topicTitle}</h1>
          {resources.length > 0 && (
            <p className="text-slate-400 text-sm mt-0.5">
              {resources.length} {lang === "ru" ? "ресурс" : "resurs"}
            </p>
          )}
        </div>

        <ResourceGrid
          resources={resources}
          basePath={`/learn/${gradeSlug}/${subjectSlug}/${topicSlug}`}
          lang={lang}
        />
      </div>
    </>
  );
}
