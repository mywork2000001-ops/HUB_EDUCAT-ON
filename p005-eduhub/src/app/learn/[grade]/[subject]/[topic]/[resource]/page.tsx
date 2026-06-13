import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { StudentNav } from "@/components/student/StudentNav";
import { getResourceBySlug, getResourcesByTopic } from "@/server/queries/resources";
import { verifyStudentToken } from "@/lib/student-auth";
import { getAssignedTopicIds } from "@/server/queries/assignments";
import { GRADES, SUBJECTS, RESOURCE_TYPE_LABELS, RESOURCE_TYPE_COLOR } from "@/lib/constants";
import { extractYouTubeId, isDirectVideo } from "@/lib/utils";
import { VideoExplanationPanel } from "@/components/student/VideoExplanationPanel";

interface Props {
  params: Promise<{
    grade:    string;
    subject:  string;
    topic:    string;
    resource: string;
  }>;
  searchParams: Promise<{ vidopen?: string }>;
}

export default async function LearnResourcePage({ params, searchParams }: Props) {
  const { grade: gradeSlug, subject: subjectSlug, topic: topicSlug, resource: resourceSlug } =
    await params;
  const { vidopen } = await searchParams;

  const res = await getResourceBySlug(gradeSlug, subjectSlug, topicSlug, resourceSlug);
  if (!res) notFound();

  const jar          = await cookies();
  const studentToken = jar.get("eduhub-student-token")?.value;
  const student      = studentToken ? await verifyStudentToken(studentToken) : null;

  if (student) {
    const assignedIds = await getAssignedTopicIds(student.id, student.class_name, student.group_name);
    if (!assignedIds.has(res.curriculum_id)) notFound();
  }

  const lang = (jar.get("eduhub-lang")?.value ?? "az") as "az" | "ru";

  // ── Fetch video explanations for this topic (only if current resource is not VIDEO) ──
  const explanationVideos = res.type !== "VIDEO"
    ? await getResourcesByTopic(gradeSlug, subjectSlug, topicSlug, "VIDEO")
    : [];

  const grade   = GRADES.find((g) => g.slug === gradeSlug);
  const subject = SUBJECTS.find((s) => s.slug === subjectSlug);

  const gradeLabel   = grade?.label     ?? gradeSlug;
  const subjectLabel = subject?.label_az ?? subjectSlug;
  const title        = lang === "ru" ? res.title_ru : res.title_az;
  const typeLabel    = RESOURCE_TYPE_LABELS[res.type]?.[lang] ?? res.type;
  const typeColor    = RESOURCE_TYPE_COLOR[res.type] ?? "bg-slate-100 text-slate-600 border-slate-200";
  const meta         = res.metadata as Record<string, number | string | boolean> | null;

  const isVideoOpen  = vidopen === "1" && explanationVideos.length > 0;
  const firstVideo   = explanationVideos[0];
  const firstVidId   = firstVideo ? extractYouTubeId(firstVideo.content_url ?? "") : null;

  return (
    <div className="flex flex-col h-screen bg-slate-950">
      <StudentNav
        title={title}
        backHref={`/learn/${gradeSlug}/${subjectSlug}/${topicSlug}`}
        lang={lang}
        crumbs={[
          { label: gradeLabel,   href: `/learn/${gradeSlug}` },
          { label: subjectLabel, href: `/learn/${gradeSlug}/${subjectSlug}` },
          { label: "…",          href: `/learn/${gradeSlug}/${subjectSlug}/${topicSlug}` },
        ]}
      />

      {/* Resource meta strip */}
      <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center gap-3 flex-wrap shrink-0">
        <span className={`text-xs px-2 py-0.5 rounded-md border font-medium ${typeColor}`}>
          {typeLabel}
        </span>
        {typeof meta?.questions_count === "number" && (
          <span className="text-xs text-slate-500">{meta.questions_count} sual</span>
        )}
        {typeof meta?.duration_min === "number" && (
          <span className="text-xs text-slate-500">· {meta.duration_min} dəq</span>
        )}

        {/* ── Video explanation button ── */}
        {explanationVideos.length > 0 && (
          <a
            href={`?vidopen=${isVideoOpen ? "0" : "1"}`}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full transition-all ${
              isVideoOpen
                ? "bg-rose-500 text-white"
                : "bg-rose-100 text-rose-700 hover:bg-rose-200 border border-rose-200"
            }`}
          >
            ▶ {lang === "ru" ? "Объяснение" : "Vidyo izahat"}
            {!isVideoOpen && explanationVideos.length > 1 && (
              <span className="bg-rose-200 text-rose-700 rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                {explanationVideos.length}
              </span>
            )}
          </a>
        )}

        {res.content_url && (
          <a
            href={res.content_url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Tam ekranda aç
          </a>
        )}
      </div>

      {/* Video explanation panel (collapsible) */}
      {isVideoOpen && explanationVideos.length > 0 && (
        <VideoExplanationPanel
          videos={explanationVideos.map(v => ({
            title:       lang === "ru" ? v.title_ru : v.title_az,
            content_url: v.content_url ?? "",
            slug:        v.slug,
          }))}
          lang={lang}
          basePath={`/learn/${gradeSlug}/${subjectSlug}/${topicSlug}`}
        />
      )}

      {/* Main content */}
      <div className="flex-1 min-h-0 bg-black">
        {!res.content_url ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="text-5xl mb-4">⏳</div>
            <p className="text-white font-semibold mb-2">{title}</p>
            <p className="text-slate-400 text-sm max-w-xs">
              {lang === "ru"
                ? "Ресурс готовится. Скоро будет доступен."
                : "Bu resurs hazırlanır. Tezliklə əlavə ediləcək."}
            </p>
            <span className={`mt-4 text-xs px-3 py-1 rounded-full border ${typeColor}`}>
              {typeLabel}
            </span>
          </div>
        ) : res.type === "VIDEO" && extractYouTubeId(res.content_url) ? (
          <div className="w-full h-full flex items-center justify-center bg-black">
            <div className="w-full max-w-4xl aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${extractYouTubeId(res.content_url)}?rel=0&autoplay=1`}
                className="w-full h-full border-0 rounded-lg"
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        ) : res.type === "VIDEO" && isDirectVideo(res.content_url) ? (
          <div className="w-full h-full flex items-center justify-center bg-black">
            <video
              src={res.content_url}
              controls
              autoPlay
              className="w-full max-w-4xl max-h-full rounded-lg"
              title={title}
            />
          </div>
        ) : (
          <iframe
            src={res.content_url}
            className="w-full h-full border-0"
            title={title}
            allow="fullscreen"
          />
        )}
      </div>
    </div>
  );
}
