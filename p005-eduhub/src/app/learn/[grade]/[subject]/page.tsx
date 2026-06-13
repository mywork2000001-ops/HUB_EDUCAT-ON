import Link from "next/link";
import { cookies } from "next/headers";
import { StudentNav } from "@/components/student/StudentNav";
import { getCurriculumItems, getGradeBySlug } from "@/server/queries/curriculum";
import { getAssignedTopicIds } from "@/server/queries/assignments";
import { verifyStudentToken } from "@/lib/student-auth";

interface Props {
  params: Promise<{ grade: string; subject: string }>;
}

export const revalidate = 60;

export default async function LearnSubjectPage({ params }: Props) {
  const { grade: gradeSlug, subject: subjectSlug } = await params;
  const jar    = await cookies();
  const lang   = (jar.get("eduhub-lang")?.value ?? "az") as "az" | "ru";
  const token  = jar.get("eduhub-student-token")?.value;
  const student = token ? await verifyStudentToken(token) : null;

  const gradeData   = await getGradeBySlug(gradeSlug);
  const subjectData = gradeData?.subjects.find((gs) => gs.subject.slug === subjectSlug)?.subject;
  const allTopics   = await getCurriculumItems(gradeSlug, subjectSlug);

  const gradeLabel   = gradeData ? (lang === "ru" ? gradeData.label_ru : gradeData.label_az) : gradeSlug;
  const subjectLabel = subjectData
    ? (lang === "ru" ? subjectData.label_ru : subjectData.label_az)
    : subjectSlug;

  let assignedIds: Set<number> = new Set();
  if (student) {
    assignedIds = await getAssignedTopicIds(student.id, student.class_name, student.group_name);
  }
  const topics = allTopics.filter((t) => assignedIds.has(t.id));

  return (
    <>
      <StudentNav
        title={subjectLabel}
        backHref={`/learn/${gradeSlug}`}
        lang={lang}
        crumbs={[
          { label: lang === "ru" ? "Классы" : "Siniflər", href: "/learn" },
          { label: gradeLabel, href: `/learn/${gradeSlug}` },
        ]}
      />

      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-900">{subjectLabel} — {gradeLabel}</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {topics.length > 0
              ? `${topics.length} ${lang === "ru" ? "тем назначено" : "mövzu tə'yin edilib"}`
              : (lang === "ru" ? "Нет назначенных тем" : "Hələ tə'yinat yoxdur")}
          </p>
        </div>

        {topics.length === 0 ? (
          <div className="py-16 rounded-2xl bg-slate-50 border border-slate-200 text-center">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-slate-500 text-sm">
              {lang === "ru"
                ? "Учитель ещё не назначил вам темы."
                : "Müəllim sizə hələ mövzu tə'yin etməyib."}
            </p>
            <p className="text-slate-400 text-xs mt-2">
              {lang === "ru" ? "Скоро здесь появятся темы." : "Tezliklə burada mövzular görünəcək."}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {topics.map((topic, idx) => (
              <Link
                key={topic.id}
                href={`/learn/${gradeSlug}/${subjectSlug}/${topic.slug}`}
                className="flex items-center gap-4 p-4 rounded-xl bg-white border border-slate-200 shadow-sm
                           hover:border-indigo-300 hover:shadow-md hover:bg-indigo-50/20 transition-all group active:scale-[0.99]"
              >
                <span className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center
                                 text-sm font-bold text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white shrink-0 transition-colors">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 group-hover:text-indigo-700 truncate">
                    {lang === "ru" ? topic.title_ru : topic.title_az}
                  </p>
                  {topic._count.resources > 0 && (
                    <p className="text-xs text-slate-400 mt-0.5">
                      {topic._count.resources} {lang === "ru" ? "ресурс" : "resurs"}
                    </p>
                  )}
                </div>
                <span className="text-indigo-400 group-hover:text-indigo-600 shrink-0 text-sm transition-colors">→</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
