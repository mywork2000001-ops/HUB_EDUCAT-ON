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
        ) : subjectSlug === "algorithmics" ? (
          /* ── Algorithmics: gamified level map ── */
          <div>
            <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-xl flex items-center gap-3">
              <span className="text-2xl">🧩</span>
              <div>
                <p className="text-sm font-bold text-orange-800">
                  {lang === "ru" ? "Карта уровней" : "Səviyyə xəritəsi"}
                </p>
                <p className="text-xs text-orange-600">
                  {lang === "ru"
                    ? `${topics.length} səviyyə · Ardıcıllıqla keç`
                    : `${topics.length} səviyyə · Ardıcıllıqla keç`}
                </p>
              </div>
            </div>
            <div className="relative">
              {/* Connector line */}
              <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gradient-to-b from-orange-300 to-orange-100 z-0" />
              <div className="space-y-3 relative z-10">
                {topics.map((topic, idx) => {
                  const isFirst = idx === 0;
                  return (
                    <Link
                      key={topic.id}
                      href={`/learn/${gradeSlug}/${subjectSlug}/${topic.slug}`}
                      className="flex items-center gap-4 p-4 rounded-xl bg-white border border-orange-200 shadow-sm
                                 hover:border-orange-400 hover:shadow-md hover:bg-orange-50/40 transition-all group active:scale-[0.99]"
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold shrink-0 transition-all
                        ${isFirst
                          ? "bg-orange-500 text-white shadow-md shadow-orange-200"
                          : "bg-orange-100 text-orange-600 group-hover:bg-orange-500 group-hover:text-white"}`}>
                        <div className="text-center leading-none">
                          <div className="text-[9px] font-medium opacity-70">{lang === "ru" ? "ур." : "lvl"}</div>
                          <div className="text-base font-black">{idx + 1}</div>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 group-hover:text-orange-700 truncate">
                          {lang === "ru" ? topic.title_ru : topic.title_az}
                        </p>
                        {topic._count.resources > 0 && (
                          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                            {topic._count.resources} {lang === "ru" ? "материал" : "material"}
                          </p>
                        )}
                      </div>
                      {isFirst && (
                        <span className="text-xs bg-orange-100 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-full font-medium shrink-0">
                          {lang === "ru" ? "Начать" : "Başla"}
                        </span>
                      )}
                      <span className="text-orange-300 group-hover:text-orange-500 shrink-0 text-lg transition-colors">→</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* ── Default: standard topic list ── */
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
