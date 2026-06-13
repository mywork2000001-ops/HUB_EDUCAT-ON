import Link from "next/link";
import { cookies } from "next/headers";
import { StudentNav } from "@/components/student/StudentNav";
import { getCurriculumItems } from "@/server/queries/curriculum";
import { getAssignedTopicIds } from "@/server/queries/assignments";
import { verifyStudentToken } from "@/lib/student-auth";
import { GRADES, SUBJECTS } from "@/lib/constants";

interface Props {
  params: Promise<{ grade: string; subject: string }>;
}

export const revalidate = 60;

export default async function LearnSubjectPage({ params }: Props) {
  const { grade: gradeSlug, subject: subjectSlug } = await params;

  const jar     = await cookies();
  const token   = jar.get("eduhub-student-token")?.value;
  const student = token ? await verifyStudentToken(token) : null;

  const grade   = GRADES.find((g) => g.slug === gradeSlug);
  const subject = SUBJECTS.find((s) => s.slug === subjectSlug);
  const allTopics = await getCurriculumItems(gradeSlug, subjectSlug);

  const gradeLabel   = grade?.label    ?? gradeSlug;
  const subjectLabel = subject?.label_az ?? subjectSlug;

  // Filter to assigned topics only
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
        crumbs={[
          { label: "Siniflər", href: "/learn" },
          { label: gradeLabel, href: `/learn/${gradeSlug}` },
        ]}
      />

      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-white">{subjectLabel} — {gradeLabel}</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {topics.length > 0 ? `${topics.length} mövzu tə'yin edilib` : "Hələ tə'yinat yoxdur"}
          </p>
        </div>

        {topics.length === 0 ? (
          <div className="py-16 rounded-2xl bg-slate-900 border border-slate-800 text-center">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-slate-400 text-sm">
              Müəllim sizə hələ mövzu tə'yin etməyib.
            </p>
            <p className="text-slate-600 text-xs mt-2">
              Tezliklə burada mövzular görünəcək.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {topics.map((topic, idx) => (
              <Link
                key={topic.id}
                href={`/learn/${gradeSlug}/${subjectSlug}/${topic.slug}`}
                className="flex items-center gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800
                           hover:border-indigo-500/50 hover:bg-slate-800 transition-all group active:scale-[0.99]"
              >
                <span className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center
                                 text-sm font-bold text-indigo-400 group-hover:bg-indigo-950 shrink-0 transition-colors">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-200 group-hover:text-white truncate">
                    {topic.title_az}
                  </p>
                  {topic._count.resources > 0 && (
                    <p className="text-xs text-slate-500 mt-0.5">{topic._count.resources} resurs</p>
                  )}
                </div>
                <span className="text-indigo-500 shrink-0 text-sm">→</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
