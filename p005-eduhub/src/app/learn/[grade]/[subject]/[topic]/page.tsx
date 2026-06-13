import { StudentNav } from "@/components/student/StudentNav";
import { ResourceGrid } from "@/components/curriculum/ResourceGrid";
import { getCurriculumItem } from "@/server/queries/curriculum";
import { getResourcesByTopic } from "@/server/queries/resources";
import { GRADES, SUBJECTS } from "@/lib/constants";

interface Props {
  params: Promise<{ grade: string; subject: string; topic: string }>;
}

export const revalidate = 3600;

export default async function LearnTopicPage({ params }: Props) {
  const { grade: gradeSlug, subject: subjectSlug, topic: topicSlug } = await params;

  const [topicData, resources] = await Promise.all([
    getCurriculumItem(gradeSlug, subjectSlug, topicSlug),
    getResourcesByTopic(gradeSlug, subjectSlug, topicSlug),
  ]);

  const grade   = GRADES.find((g) => g.slug === gradeSlug);
  const subject = SUBJECTS.find((s) => s.slug === subjectSlug);

  const gradeLabel   = grade?.label    ?? gradeSlug;
  const subjectLabel = subject?.label_az ?? subjectSlug;
  const topicTitle   = topicData?.title_az ?? topicSlug;

  return (
    <>
      <StudentNav
        title={topicTitle}
        backHref={`/learn/${gradeSlug}/${subjectSlug}`}
        crumbs={[
          { label: gradeLabel,   href: `/learn/${gradeSlug}` },
          { label: subjectLabel, href: `/learn/${gradeSlug}/${subjectSlug}` },
        ]}
      />

      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-white">{topicTitle}</h1>
          {resources.length > 0 && (
            <p className="text-slate-400 text-sm mt-0.5">{resources.length} resurs</p>
          )}
        </div>

        <ResourceGrid
          resources={resources}
          basePath={`/learn/${gradeSlug}/${subjectSlug}/${topicSlug}`}
          lang="az"
        />
      </div>
    </>
  );
}
