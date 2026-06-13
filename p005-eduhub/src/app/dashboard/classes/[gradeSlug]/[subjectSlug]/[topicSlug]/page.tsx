import { BreadcrumbNav } from "@/components/curriculum/BreadcrumbNav";
import { ResourceGrid } from "@/components/curriculum/ResourceGrid";
import { AppHeader } from "@/components/layout/AppHeader";
import { getCurriculumItem } from "@/server/queries/curriculum";
import { getResourcesByTopic } from "@/server/queries/resources";
import { GRADES, SUBJECTS } from "@/lib/constants";
import type { Lang } from "@/lib/constants";
import type { ResourceType } from "@/generated/prisma/client";

interface Props {
  params:       Promise<{ gradeSlug: string; subjectSlug: string; topicSlug: string }>;
  searchParams: Promise<{ lang?: string; type?: string }>;
}

export const revalidate = 3600;

export default async function TopicPage({ params, searchParams }: Props) {
  const { gradeSlug, subjectSlug, topicSlug } = await params;
  const { lang = "az", type }                 = await searchParams;

  const [topic, resources] = await Promise.all([
    getCurriculumItem(gradeSlug, subjectSlug, topicSlug),
    getResourcesByTopic(gradeSlug, subjectSlug, topicSlug, type as ResourceType | undefined),
  ]);

  const grade   = GRADES.find((g) => g.slug === gradeSlug);
  const subject = SUBJECTS.find((s) => s.slug === subjectSlug);

  const gradeLabel   = grade?.label     ?? gradeSlug;
  const subjectLabel = (lang as Lang) === "ru"
    ? (subject?.label_ru ?? subject?.label_az ?? subjectSlug)
    : (subject?.label_az ?? subjectSlug);
  const topicTitle = topic
    ? ((lang as Lang) === "az" ? topic.title_az : topic.title_ru)
    : topicSlug;

  return (
    <>
      <AppHeader title={topicTitle} />
      <div className="p-6 max-w-5xl">
        <BreadcrumbNav
          crumbs={[
            { label: gradeLabel,   href: `/dashboard/classes/${gradeSlug}` },
            { label: subjectLabel, href: `/dashboard/classes/${gradeSlug}/${subjectSlug}?lang=${lang}` },
            { label: topicTitle },
          ]}
        />

        <div className="mt-4 flex items-baseline gap-3">
          <h1 className="text-2xl font-bold text-white">{topicTitle}</h1>
          <span className="text-slate-500 text-sm">{resources.length} resurs</span>
        </div>

        <div className="mt-6">
          <ResourceGrid
            resources={resources}
            basePath={`/dashboard/classes/${gradeSlug}/${subjectSlug}/${topicSlug}`}
            lang={lang as Lang}
          />
        </div>
      </div>
    </>
  );
}
