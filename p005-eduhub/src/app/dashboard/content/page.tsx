import { db } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

const PLATFORM_MAP: Record<string, { label: string; icon: string; color: string; bg: string; border: string }> = {
  "math":        { label: "Məktəb (P001 + P002)", icon: "📐", color: "text-blue-700",   bg: "bg-blue-50",   border: "border-blue-200" },
  "block-exam":  { label: "Blok İmtahan (P003)",  icon: "📝", color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-200" },
  "taim-2026":   { label: "TAİM 2026 (P004)",      icon: "🎓", color: "text-emerald-700",bg: "bg-emerald-50",border: "border-emerald-200"},
};

async function getData() {
  const subjects = await db.subject.findMany({
    where: { slug: { in: ["math", "block-exam", "taim-2026"] } },
    include: {
      grades: {
        include: {
          grade: true,
          curriculum_items: {
            orderBy: { order_index: "asc" },
            include: {
              resources: {
                where: { is_published: true },
                orderBy: { id: "asc" },
                select: { id: true, type: true, title_az: true, content_url: true },
              },
              _count: { select: { resources: true } },
            },
          },
        },
      },
    },
  });

  // Sort by desired platform order
  const ORDER = ["math", "block-exam", "taim-2026"];
  return subjects.sort((a, b) => ORDER.indexOf(a.slug) - ORDER.indexOf(b.slug));
}

const TYPE_LABEL: Record<string, string> = {
  LESSON: "Dərs", TEST: "Test", TAIM_TEST: "TAİM Test",
  BSQ: "BSQ", KSQ: "KSQ", WORKBOOK: "İş dəftəri", VIDEO: "Video",
};
const TYPE_COLOR: Record<string, string> = {
  LESSON: "bg-blue-100 text-blue-700",
  TEST: "bg-orange-100 text-orange-700",
  TAIM_TEST: "bg-emerald-100 text-emerald-700",
};

export default async function ContentLibraryPage() {
  const subjects = await getData();

  const totalResources = subjects.reduce((acc, s) =>
    acc + s.grades.reduce((a2, gs) =>
      a2 + gs.curriculum_items.reduce((a3, ci) => a3 + ci._count.resources, 0), 0), 0);

  return (
    <div className="p-6 max-w-5xl">
      {/* Header */}
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-slate-900">Dərslər və Testlər</h1>
        <p className="text-slate-400 text-sm mt-1">
          P001–P004 bütün materiallar · {totalResources} resurs
        </p>
      </div>

      {/* Platform summaries */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {subjects.map((sub) => {
          const p = PLATFORM_MAP[sub.slug];
          if (!p) return null;
          const total = sub.grades.reduce((acc, gs) =>
            acc + gs.curriculum_items.reduce((a, ci) => a + ci._count.resources, 0), 0);
          const topics = sub.grades.reduce((acc, gs) => acc + gs.curriculum_items.length, 0);
          return (
            <div key={sub.slug} className={`rounded-xl border ${p.border} ${p.bg} p-4`}>
              <div className="text-2xl mb-2">{p.icon}</div>
              <p className={`text-sm font-bold ${p.color}`}>{p.label}</p>
              <p className="text-xs text-slate-500 mt-1">{topics} mövzu · {total} resurs</p>
            </div>
          );
        })}
      </div>

      {/* Platform sections */}
      <div className="space-y-8">
        {subjects.map((sub) => {
          const p = PLATFORM_MAP[sub.slug];
          if (!p) return null;

          return (
            <section key={sub.slug}>
              {/* Platform header */}
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl ${p.bg} border ${p.border} mb-4`}>
                <span className="text-2xl">{p.icon}</span>
                <div>
                  <h2 className={`text-sm font-bold ${p.color}`}>{p.label}</h2>
                  <p className="text-xs text-slate-500">{sub.label_az} · {sub.label_ru}</p>
                </div>
              </div>

              {/* Topics */}
              <div className="space-y-3">
                {sub.grades.flatMap((gs) =>
                  gs.curriculum_items.map((ci) => (
                    <div key={ci.id} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                      {/* Topic header */}
                      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-slate-50">
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                          {ci.order_index}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">{ci.title_az}</p>
                          <p className="text-xs text-slate-400 truncate">{ci.title_ru}</p>
                        </div>
                        <span className="text-xs text-slate-400 shrink-0">{ci._count.resources} resurs</span>
                      </div>

                      {/* Resources list */}
                      {ci.resources.length > 0 && (
                        <div className="divide-y divide-slate-100">
                          {ci.resources.slice(0, 8).map((r) => (
                            <div key={r.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors">
                              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0 ${TYPE_COLOR[r.type] ?? "bg-slate-100 text-slate-600"}`}>
                                {TYPE_LABEL[r.type] ?? r.type}
                              </span>
                              <span className="text-xs text-slate-700 truncate flex-1">{r.title_az}</span>
                              {r.content_url && (
                                <Link href={r.content_url} target="_blank"
                                  className="text-[10px] text-indigo-500 hover:text-indigo-700 shrink-0 px-2 py-0.5 rounded hover:bg-indigo-50 transition-colors">
                                  Aç →
                                </Link>
                              )}
                            </div>
                          ))}
                          {ci.resources.length > 8 && (
                            <div className="px-4 py-2 text-xs text-slate-400 text-center">
                              + {ci.resources.length - 8} daha resurs
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
