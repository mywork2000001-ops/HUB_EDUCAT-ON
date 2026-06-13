import Link from "next/link";
import { StudentNav } from "@/components/student/StudentNav";
import { getCurriculumItems } from "@/server/queries/curriculum";
import { GRADES, SUBJECTS } from "@/lib/constants";

interface Props {
  params: Promise<{ grade: string; subject: string }>;
}

export const revalidate = 3600;

export default async function LearnSubjectPage({ params }: Props) {
  const { grade: gradeSlug, subject: subjectSlug } = await params;

  const grade   = GRADES.find((g) => g.slug === gradeSlug);
  const subject = SUBJECTS.find((s) => s.slug === subjectSlug);
  const topics  = await getCurriculumItems(gradeSlug, subjectSlug);

  const gradeLabel   = grade?.label    ?? gradeSlug;
  const subjectLabel = subject?.label_az ?? subjectSlug;

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
          <h1 className="text-xl font-bold text-white">
            {subjectLabel} — {gradeLabel}
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {topics.length > 0 ? `${topics.length} mövzu` : "Mövzular hazırlanır"}
          </p>
        </div>

        {topics.length === 0 ? (
          <div className="py-16 rounded-2xl bg-slate-900 border border-slate-800 text-center">
            <p className="text-4xl mb-3">📚</p>
            <p className="text-slate-400 text-sm">Bu fənn üzrə mövzular tezliklə əlavə ediləcək.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {topics.map((topic, idx) => (
              <Link
                key={topic.id}
                href={`/learn/${gradeSlug}/${subjectSlug}/${topic.slug}`}
                className="flex items-center gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800
                           hover:border-slate-600 hover:bg-slate-800 transition-all group
                           active:scale-[0.99]"
              >
                <span className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center
                                 text-sm font-bold text-indigo-400 group-hover:bg-indigo-950 shrink-0
                                 transition-colors">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-200 group-hover:text-white truncate">
                    {topic.title_az}
                  </p>
                  {topic._count.resources > 0 && (
                    <p className="text-xs text-slate-500 mt-0.5">
                      {topic._count.resources} resurs
                    </p>
                  )}
                </div>
                <span className="text-slate-600 group-hover:text-indigo-400 transition-colors shrink-0 text-sm">
                  →
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
