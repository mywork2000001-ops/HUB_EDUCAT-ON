import Link from "next/link";
import { StudentNav } from "@/components/student/StudentNav";
import { SUBJECTS, GRADES } from "@/lib/constants";

interface Props {
  params: Promise<{ grade: string }>;
}

export default async function LearnGradePage({ params }: Props) {
  const { grade: gradeSlug } = await params;
  const grade = GRADES.find((g) => g.slug === gradeSlug);
  const gradeLabel = grade?.label ?? gradeSlug;

  return (
    <>
      <StudentNav
        title={gradeLabel}
        backHref="/learn"
        crumbs={[{ label: "Siniflər", href: "/learn" }]}
      />

      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-white">{gradeLabel}</h1>
          <p className="text-slate-400 text-sm mt-0.5">Fənn seçin</p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {SUBJECTS.map((sub) => (
            <Link
              key={sub.slug}
              href={`/learn/${gradeSlug}/${sub.slug}`}
              className="group flex flex-col items-center gap-3 p-5 rounded-2xl
                         bg-slate-900 border border-slate-800
                         hover:border-indigo-500/50 hover:bg-slate-800
                         transition-all active:scale-95 text-center"
            >
              <span className="text-3xl">{sub.icon}</span>
              <span className="text-sm font-medium text-slate-300 group-hover:text-white leading-tight">
                {sub.label_az}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
