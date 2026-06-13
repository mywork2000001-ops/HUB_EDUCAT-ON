import { notFound } from "next/navigation";
import { StudentNav } from "@/components/student/StudentNav";
import { getResourceBySlug } from "@/server/queries/resources";
import { GRADES, SUBJECTS, RESOURCE_TYPE_LABELS, RESOURCE_TYPE_COLOR } from "@/lib/constants";

interface Props {
  params: Promise<{
    grade:    string;
    subject:  string;
    topic:    string;
    resource: string;
  }>;
}

export default async function LearnResourcePage({ params }: Props) {
  const { grade: gradeSlug, subject: subjectSlug, topic: topicSlug, resource: resourceSlug } = await params;

  const res = await getResourceBySlug(gradeSlug, subjectSlug, topicSlug, resourceSlug);
  if (!res) notFound();

  const grade   = GRADES.find((g) => g.slug === gradeSlug);
  const subject = SUBJECTS.find((s) => s.slug === subjectSlug);

  const gradeLabel   = grade?.label    ?? gradeSlug;
  const subjectLabel = subject?.label_az ?? subjectSlug;
  const title        = res.title_az;
  const typeLabel    = RESOURCE_TYPE_LABELS[res.type]?.["az"] ?? res.type;
  const typeColor    = RESOURCE_TYPE_COLOR[res.type] ?? "bg-slate-800 text-slate-300 border-slate-700";
  const meta         = res.metadata as Record<string, number | string | boolean> | null;

  return (
    <div className="flex flex-col h-screen bg-slate-950">
      <StudentNav
        title={title}
        backHref={`/learn/${gradeSlug}/${subjectSlug}/${topicSlug}`}
        crumbs={[
          { label: gradeLabel,   href: `/learn/${gradeSlug}` },
          { label: subjectLabel, href: `/learn/${gradeSlug}/${subjectSlug}` },
          { label: "…",          href: `/learn/${gradeSlug}/${subjectSlug}/${topicSlug}` },
        ]}
      />

      {/* Resource meta strip */}
      <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center gap-3 flex-wrap shrink-0">
        <span className={`text-xs px-2 py-0.5 rounded-md border font-medium ${typeColor}`}>
          {typeLabel}
        </span>
        {typeof meta?.questions_count === "number" && (
          <span className="text-xs text-slate-500">{meta.questions_count} sual</span>
        )}
        {typeof meta?.duration_min === "number" && (
          <span className="text-xs text-slate-500">· {meta.duration_min} dəq</span>
        )}
        {res.content_url && (
          <a
            href={res.content_url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto flex items-center gap-1.5 text-xs text-slate-400
                       hover:text-white transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Tam ekranda aç
          </a>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0">
        {res.content_url ? (
          <iframe
            src={res.content_url}
            className="w-full h-full border-0"
            title={title}
            allow="fullscreen"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="text-5xl mb-4">⏳</div>
            <p className="text-white font-semibold mb-2">{title}</p>
            <p className="text-slate-400 text-sm max-w-xs">
              Bu resurs hazırlanır. Tezliklə əlavə ediləcək.
            </p>
            <span className={`mt-4 text-xs px-3 py-1 rounded-full border ${typeColor}`}>
              {typeLabel}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
