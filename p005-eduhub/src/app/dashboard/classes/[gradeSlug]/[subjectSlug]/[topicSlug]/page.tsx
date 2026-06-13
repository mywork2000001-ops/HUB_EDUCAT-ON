import { BreadcrumbNav } from "@/components/curriculum/BreadcrumbNav";
import { ResourceGrid } from "@/components/curriculum/ResourceGrid";
import { AppHeader } from "@/components/layout/AppHeader";
import { AddResourceForm } from "@/components/curriculum/AddResourceForm";
import { getCurriculumItem } from "@/server/queries/curriculum";
import { getResourcesByTopic } from "@/server/queries/resources";
import { getGradeBySlug } from "@/server/queries/curriculum";
import type { ResourceType } from "@/generated/prisma/client";

interface Props {
  params:       Promise<{ gradeSlug: string; subjectSlug: string; topicSlug: string }>;
  searchParams: Promise<{ lang?: string; type?: string }>;
}

export const revalidate = 0;

export default async function TopicPage({ params, searchParams }: Props) {
  const { gradeSlug, subjectSlug, topicSlug } = await params;
  const { lang = "az", type }                 = await searchParams;

  const [topic, resources, gradeData] = await Promise.all([
    getCurriculumItem(gradeSlug, subjectSlug, topicSlug),
    getResourcesByTopic(gradeSlug, subjectSlug, topicSlug, type as ResourceType | undefined),
    getGradeBySlug(gradeSlug),
  ]);

  const subjectData  = gradeData?.subjects.find((gs) => gs.subject.slug === subjectSlug)?.subject;
  const gradeLabel   = gradeData?.label_az ?? gradeSlug;
  const subjectLabel = subjectData?.label_az ?? subjectSlug;
  const topicTitle   = topic
    ? (lang === "az" ? topic.title_az : topic.title_ru)
    : topicSlug;

  return (
    <>
      <AppHeader title={topicTitle} />
      <div className="p-6 max-w-5xl">
        <BreadcrumbNav
          crumbs={[
            { label: gradeLabel,   href: `/dashboard/classes/${gradeSlug}` },
            { label: subjectLabel, href: `/dashboard/classes/${gradeSlug}/${subjectSlug}` },
            { label: topicTitle },
          ]}
        />

        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">{topicTitle}</h1>
            <span className="text-slate-500 text-sm">{resources.length} resurs</span>
          </div>
        </div>

        {topic && (
          <div className="mt-6 mb-8">
            <AddResourceForm topicId={topic.id} />
          </div>
        )}

        <div className="mt-2">
          <ResourceGrid
            resources={resources}
            basePath={`/dashboard/classes/${gradeSlug}/${subjectSlug}/${topicSlug}`}
            lang={lang as "az" | "ru"}
          />
        </div>
      </div>
    </>
  );
}
