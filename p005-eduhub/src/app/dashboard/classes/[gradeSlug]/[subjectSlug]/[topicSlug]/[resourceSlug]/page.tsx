import { notFound } from "next/navigation";
import { BreadcrumbNav } from "@/components/curriculum/BreadcrumbNav";
import { AppHeader } from "@/components/layout/AppHeader";
import { getResourceBySlug } from "@/server/queries/resources";
import { GRADES, SUBJECTS, RESOURCE_TYPE_LABELS, RESOURCE_TYPE_COLOR } from "@/lib/constants";
import type { Lang } from "@/lib/constants";

interface Props {
  params:       Promise<{
    gradeSlug:    string;
    subjectSlug:  string;
    topicSlug:    string;
    resourceSlug: string;
  }>;
  searchParams: Promise<{ lang?: string }>;
}

export default async function ResourcePage({ params, searchParams }: Props) {
  const { gradeSlug, subjectSlug, topicSlug, resourceSlug } = await params;
  const { lang = "az" } = await searchParams;

  const resource = await getResourceBySlug(gradeSlug, subjectSlug, topicSlug, resourceSlug);
  if (!resource) notFound();

  const grade   = GRADES.find((g) => g.slug === gradeSlug);
  const subject = SUBJECTS.find((s) => s.slug === subjectSlug);
  const L       = lang as Lang;
  const title   = L === "az" ? resource.title_az : resource.title_ru;

  const subjectLabel = L === "ru"
    ? (subject?.label_ru ?? subjectSlug)
    : (subject?.label_az ?? subjectSlug);

  const typeLabel  = RESOURCE_TYPE_LABELS[resource.type]?.[L] ?? resource.type;
  const typeColor  = RESOURCE_TYPE_COLOR[resource.type] ?? "bg-slate-800 text-slate-300 border-slate-700";
  const meta       = resource.metadata as Record<string, number | string | boolean> | null;
  const qCount     = meta?.questions_count as number | undefined;
  const duration   = meta?.duration_min   as number | undefined;

  return (
    <>
      <AppHeader title={title} />
      <div className="flex flex-col h-[calc(100vh-56px)]">

        {/* ── Top bar ── */}
        <div className="px-6 py-3 border-b border-slate-800 bg-slate-950 flex items-center gap-3 flex-wrap shrink-0">
          <BreadcrumbNav
            crumbs={[
              { label: grade?.label ?? gradeSlug,   href: `/dashboard/classes/${gradeSlug}` },
              { label: subjectLabel,                 href: `/dashboard/classes/${gradeSlug}/${subjectSlug}` },
              { label: "…",                          href: `/dashboard/classes/${gradeSlug}/${subjectSlug}/${topicSlug}?lang=${lang}` },
              { label: title },
            ]}
          />
        </div>

        {/* ── Resource header ── */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900 shrink-0">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs px-2 py-0.5 rounded-full border ${typeColor}`}>
                  {typeLabel}
                </span>
                {qCount && (
                  <span className="text-xs text-slate-500">{qCount} sual</span>
                )}
                {duration && (
                  <span className="text-xs text-slate-500">· {duration} dəq</span>
                )}
              </div>
              <h1 className="text-lg font-bold text-white">{title}</h1>
            </div>

            {resource.content_url && (
              <a
                href={resource.content_url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700
                           text-slate-300 hover:text-white text-xs font-medium transition-colors
                           flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Yeni sekmədə aç
              </a>
            )}
          </div>
        </div>

        {/* ── Content ── */}
        <div className="flex-1 min-h-0">
          {resource.content_url ? (
            <iframe
              src={resource.content_url}
              className="w-full h-full border-0"
              title={title}
              allow="fullscreen"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="text-4xl mb-4">📋</div>
              <p className="text-white font-semibold mb-1">{title}</p>
              <p className="text-slate-400 text-sm mb-6">
                {L === "az"
                  ? "Bu resurs hazırlanır. Tezliklə əlavə ediləcək."
                  : "Ресурс готовится. Скоро будет добавлен."}
              </p>
              <span className={`text-xs px-3 py-1 rounded-full border ${typeColor}`}>
                {typeLabel}
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
