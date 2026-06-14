import { AppHeader } from "@/components/layout/AppHeader";
import { getGradeBySlug } from "@/server/queries/curriculum";
import { db } from "@/lib/db";
import { supabaseAdmin } from "@/lib/supabase";
import { GradeDashboard, type ResultRow } from "./GradeDashboard";

interface Props {
  params: Promise<{ gradeSlug: string }>;
}

export const revalidate = 60;

export default async function GradePage({ params }: Props) {
  const { gradeSlug } = await params;
  const gradeNumber   = gradeSlug.replace("grade-", "");

  const [grade, students] = await Promise.all([
    getGradeBySlug(gradeSlug),
    db.student.findMany({
      where:   { class_name: { startsWith: gradeNumber } },
      orderBy: [{ class_name: "asc" }, { name: "asc" }],
      select:  { id: true, name: true, email: true, class_name: true, group_name: true, is_active: true },
    }),
  ]);

  if (!grade) {
    return (
      <div className="p-8 text-slate-400 text-sm">
        Sinif tapılmadı: <code>{gradeSlug}</code>
      </div>
    );
  }

  let results: ResultRow[] = [];
  if (supabaseAdmin) {
    const { data } = await supabaseAdmin
      .from("results")
      .select("student_name,student_class,platform,lesson_id,lesson_title,percent,score,total,finished_at")
      .ilike("student_class", `${gradeNumber}%`)
      .order("finished_at", { ascending: false })
      .limit(1000);
    results = (data ?? []) as ResultRow[];
  }

  const subjects = grade.subjects.map((gs) => gs.subject);

  return (
    <>
      <AppHeader title={grade.label_az} />
      <GradeDashboard
        gradeSlug={gradeSlug}
        gradeLabel={grade.label_az}
        subjects={subjects}
        students={students}
        results={results}
      />
    </>
  );
}
