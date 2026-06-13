import Link from "next/link";
import { BreadcrumbNav } from "@/components/curriculum/BreadcrumbNav";
import { AppHeader } from "@/components/layout/AppHeader";
import { GRADES, SUBJECTS } from "@/lib/constants";

interface Props {
  params: Promise<{ gradeSlug: string }>;
}

export default async function GradePage({ params }: Props) {
  const { gradeSlug } = await params;
  const grade = GRADES.find((g) => g.slug === gradeSlug);

  if (!grade) {
    return (
      <div className="p-8 text-slate-400 text-sm">
        Sinif tapılmadı: <code>{gradeSlug}</code>
      </div>
    );
  }

  return (
    <>
      <AppHeader title={grade.label} />
      <div className="p-6 max-w-4xl">
        <BreadcrumbNav
          crumbs={[
            { label: "Siniflər" },
            { label: grade.label },
          ]}
        />

        <h1 className="mt-4 text-2xl font-bold text-white">{grade.label}</h1>
        <p className="mt-1 text-slate-400 text-sm">Fənn seçin</p>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {SUBJECTS.map((sub) => (
            <Link
              key={sub.slug}
              href={`/dashboard/classes/${gradeSlug}/${sub.slug}`}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-900
                         border border-slate-800 hover:border-slate-600 hover:bg-slate-800
                         transition-all text-center group"
            >
              <span className="text-3xl">{sub.icon}</span>
              <span className="text-sm font-medium text-slate-300 group-hover:text-white">
                {sub.label_az}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
