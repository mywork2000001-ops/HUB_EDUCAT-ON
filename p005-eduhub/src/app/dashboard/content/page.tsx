import { db } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

// ─── Types ────────────────────────────────────────────────────────────────────

type ResRow = {
  id: number; slug: string; type: string;
  title_az: string; title_ru: string; content_url: string | null;
};
type TopicRow = {
  id: number; order_index: number;
  title_az: string; title_ru: string;
  resources: ResRow[];
};

// ─── Data layer ───────────────────────────────────────────────────────────────

const RES_SELECT = {
  id: true, slug: true, type: true,
  title_az: true, title_ru: true, content_url: true,
} as const;

async function topicsOf(gradeSlug: string, subjectSlug: string): Promise<TopicRow[]> {
  try {
    const items = await db.curriculumItem.findMany({
      where: {
        parent_id: null,
        grade_subject: {
          grade:   { slug: gradeSlug },
          subject: { slug: subjectSlug },
        },
      },
      orderBy: { order_index: "asc" },
      include: {
        resources: { where: { is_published: true }, orderBy: { id: "asc" }, select: RES_SELECT },
      },
    });
    return items as TopicRow[];
  } catch { return []; }
}

async function getData() {
  const [g5Math, g5Dim, g6Math, abiBlock, muellimTaim] = await Promise.all([
    topicsOf("grade-5",    "math"),
    topicsOf("grade-5",    "dim-test"),
    topicsOf("grade-6",    "math"),
    topicsOf("abiturient", "block-exam"),
    topicsOf("muellim",    "taim-2026"),
  ]);
  return { g5Math, g5Dim, g6Math, abiBlock, muellimTaim };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const LESSON_T = new Set(["LESSON"]);
const TEST_T   = new Set(["TEST", "TAIM_TEST", "BSQ", "KSQ"]);

function lessons(rs: ResRow[]) { return rs.filter((r) => LESSON_T.has(r.type)); }
function tests(rs: ResRow[])   { return rs.filter((r) => TEST_T.has(r.type)); }

const TYPE_BADGE: Record<string, string> = {
  LESSON:    "bg-blue-100 text-blue-700",
  TEST:      "bg-orange-100 text-orange-700",
  TAIM_TEST: "bg-emerald-100 text-emerald-700",
  BSQ:       "bg-red-100 text-red-700",
  KSQ:       "bg-slate-100 text-slate-600",
  VIDEO:     "bg-pink-100 text-pink-700",
};
const TYPE_LABEL: Record<string, string> = {
  LESSON: "Dərs", TEST: "Test", TAIM_TEST: "TAİM", BSQ: "BSQ", KSQ: "KSQ", VIDEO: "Video",
};

// ─── Micro-components ─────────────────────────────────────────────────────────

function Badge({ type }: { type: string }) {
  return (
    <span className={`shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide
                      ${TYPE_BADGE[type] ?? "bg-slate-100 text-slate-600"}`}>
      {TYPE_LABEL[type] ?? type}
    </span>
  );
}

function ResRow({ r, accent }: { r: ResRow; accent: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 transition-colors group">
      <Badge type={r.type} />
      <span className="text-xs text-slate-700 flex-1 truncate">{r.title_az}</span>
      {r.content_url && (
        <Link href={r.content_url} target="_blank"
          className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded transition-all
                      opacity-0 group-hover:opacity-100 ${accent}`}>
          Aç →
        </Link>
      )}
    </div>
  );
}

// Chapter accordion (Fəsil)
function Chapter({ topic, accent }: { topic: TopicRow; accent: string }) {
  const ls = lessons(topic.resources);
  const ts = tests(topic.resources);

  return (
    <details className="group border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm mb-2">
      <summary className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50
                          transition-colors list-none select-none">
        <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-bold
                         flex items-center justify-center shrink-0">
          {topic.order_index}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate">{topic.title_az}</p>
          <p className="text-[11px] text-slate-400 truncate">{topic.title_ru}</p>
        </div>
        <div className="flex gap-1.5 shrink-0">
          {ls.length > 0 && (
            <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
              {ls.length} dərs
            </span>
          )}
          {ts.length > 0 && (
            <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
              {ts.length} test
            </span>
          )}
        </div>
        <span className="text-slate-300 text-xs group-open:rotate-90 transition-transform ml-1">▶</span>
      </summary>
      <div className="border-t border-slate-100 divide-y divide-slate-50">
        {topic.resources.map((r) => <ResRow key={r.id} r={r} accent={accent} />)}
      </div>
    </details>
  );
}

// Flat topic card (for DİM, Block, TAİM topics)
function TopicCard({ topic, accent }: { topic: TopicRow; accent: string }) {
  if (topic.resources.length === 0) return null;
  return (
    <details className="group border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm mb-1.5">
      <summary className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-slate-50
                          transition-colors list-none select-none">
        <span className="w-5 h-5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold
                         flex items-center justify-center shrink-0">
          {topic.order_index}
        </span>
        <p className="text-xs font-medium text-slate-800 flex-1 truncate">{topic.title_az}</p>
        <span className="text-[10px] text-slate-400 shrink-0">{topic.resources.length}</span>
        <span className="text-slate-300 text-[10px] group-open:rotate-90 transition-transform ml-1">▶</span>
      </summary>
      <div className="border-t border-slate-100 divide-y divide-slate-50">
        {topic.resources.map((r) => <ResRow key={r.id} r={r} accent={accent} />)}
      </div>
    </details>
  );
}

// Section wrapper
function SectionBlock({
  icon, grade, title, subtitle, gradient, children,
}: {
  icon: string; grade: string; title: string; subtitle: string;
  gradient: string; children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <div className={`flex items-center gap-4 px-5 py-4 rounded-2xl ${gradient} mb-5`}>
        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs bg-white/25 text-white px-2 py-0.5 rounded-full font-medium">
              {grade}
            </span>
          </div>
          <h2 className="text-base font-bold text-white leading-tight">{title}</h2>
          <p className="text-white/70 text-xs mt-0.5">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

// Sub-section label
function SubHead({ icon, label, count }: { icon: string; label: string; count: number }) {
  return (
    <div className="flex items-center gap-2 mb-3 px-1">
      <span className="text-sm">{icon}</span>
      <p className="text-sm font-bold text-slate-700 flex-1">{label}</p>
      <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{count}</span>
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default async function ContentLibraryPage() {
  const { g5Math, g5Dim, g6Math, abiBlock, muellimTaim } = await getData();

  const p002_5_count  = g5Math.reduce((a, t) => a + lessons(t.resources).length, 0);
  const p002_6_count  = g6Math.reduce((a, t) => a + lessons(t.resources).filter(r => r.content_url).length, 0);
  const p001_count    = g5Dim.length;
  const p003_count    = abiBlock.reduce((a, t) => a + t.resources.length, 0);
  const p004_count    = muellimTaim.reduce((a, t) => a + t.resources.length, 0);

  // Block-exam lessons/tests split
  const blokDərs = abiBlock.filter((t) => t.resources.some((r) => LESSON_T.has(r.type)));
  const blokTest = abiBlock.filter((t) => t.resources.some((r) => TEST_T.has(r.type)));
  // P003 tests are embedded under topic-01 → extract for dedicated column
  const topic01  = blokDərs.find((t) => t.order_index === 1);
  const p003Tests = topic01?.resources.filter((r) => TEST_T.has(r.type)) ?? [];

  return (
    <div className="p-6 max-w-5xl">

      {/* Header */}
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-slate-900">Dərslər və Testlər</h1>
        <p className="text-slate-400 text-sm mt-1">
          Siniflər üzrə — hər platforma ayrı bölmə kimi
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
        {[
          { icon: "📖", label: "P002 5-ci s.",  count: p002_5_count, unit: "dərs",   c: "bg-blue-50   border-blue-200   text-blue-700" },
          { icon: "📊", label: "P001 DİM",       count: p001_count,   unit: "test",   c: "bg-orange-50 border-orange-200 text-orange-700" },
          { icon: "📘", label: "P002 6-cı s.",  count: p002_6_count, unit: "dərs",   c: "bg-indigo-50 border-indigo-200 text-indigo-700" },
          { icon: "📝", label: "P003 Blok",      count: p003_count,   unit: "resurs", c: "bg-violet-50 border-violet-200 text-violet-700" },
          { icon: "🎓", label: "P004 TAİM",      count: p004_count,   unit: "test",   c: "bg-emerald-50 border-emerald-200 text-emerald-700" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border p-3 ${s.c}`}>
            <p className="text-lg mb-0.5">{s.icon}</p>
            <p className="text-[11px] font-medium opacity-75 leading-tight">{s.label}</p>
            <p className="text-lg font-black mt-0.5">
              {s.count} <span className="text-[10px] font-normal">{s.unit}</span>
            </p>
          </div>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* BLOK 1: 5-ci sinif (P001 DİM + P002 Dərslik)          */}
      {/* ═══════════════════════════════════════════════════════ */}
      <SectionBlock
        icon="🏫" grade="5-ci sinif"
        title="V Sinif Riyaziyyat"
        subtitle="P002 İnteraktiv Dərslik (8 fəsil · 90 dərs) + P001 DİM Test Bankı (17 test)"
        gradient="bg-gradient-to-r from-blue-600 to-indigo-600"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <SubHead icon="📖" label="Dərslik — Fəsillər (P002)" count={p002_5_count} />
            {g5Math.length === 0
              ? <p className="text-xs text-slate-400 italic px-2">Məlumat yoxdur</p>
              : g5Math.map((t) => (
                  <Chapter key={t.id} topic={t} accent="text-blue-500 hover:text-blue-700 hover:bg-blue-50" />
                ))
            }
          </div>
          <div>
            <SubHead icon="📊" label="DİM Test Bankı (P001)" count={p001_count} />
            {g5Dim.length === 0
              ? <p className="text-xs text-slate-400 italic px-2">Məlumat yoxdur</p>
              : g5Dim.map((t) => (
                  <TopicCard key={t.id} topic={t} accent="text-orange-500 hover:text-orange-700 hover:bg-orange-50" />
                ))
            }
          </div>
        </div>
      </SectionBlock>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* BLOK 2: 6-cı sinif (P002-6)                           */}
      {/* ═══════════════════════════════════════════════════════ */}
      <SectionBlock
        icon="📘" grade="6-cı sinif"
        title="VI Sinif Riyaziyyat"
        subtitle="P002 İnteraktiv Dərslik 6-cı sinif — hazırlanır (Fəsil 1 aktiv)"
        gradient="bg-gradient-to-r from-indigo-500 to-blue-700"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <SubHead icon="📖" label="Dərslik — Fəsillər (P002-6)" count={g6Math.length} />
            {g6Math.length === 0
              ? <p className="text-xs text-slate-400 italic px-2">Məlumat yoxdur</p>
              : g6Math.map((t) => {
                  const hasContent = t.resources.some((r) => r.content_url);
                  return (
                    <details key={t.id}
                      className="group border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm mb-2">
                      <summary className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50
                                          transition-colors list-none select-none">
                        <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-bold
                                         flex items-center justify-center shrink-0">
                          {t.order_index}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">{t.title_az}</p>
                          <p className="text-[11px] text-slate-400 truncate">{t.title_ru}</p>
                        </div>
                        {!hasContent && (
                          <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full shrink-0">
                            Tezliklə
                          </span>
                        )}
                        {hasContent && (
                          <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full shrink-0">
                            {t.resources.filter((r) => r.content_url).length} dərs
                          </span>
                        )}
                        <span className="text-slate-300 text-xs group-open:rotate-90 transition-transform ml-1">▶</span>
                      </summary>
                      <div className="border-t border-slate-100 divide-y divide-slate-50">
                        {t.resources.map((r) => <ResRow key={r.id} r={r} accent="text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50" />)}
                      </div>
                    </details>
                  );
                })
            }
          </div>
          <div className="flex flex-col justify-start">
            <div className="rounded-xl border border-dashed border-amber-200 bg-amber-50 p-5 text-center">
              <p className="text-3xl mb-3">🚧</p>
              <p className="text-sm font-semibold text-amber-800">Fəsil 2–8 hazırlanır</p>
              <p className="text-xs text-amber-600 mt-2 leading-relaxed">
                P002 6-cı sinif üçün dərslik məzmunu yaradılır.
                Hazır olanda sync.ts ilə avtomatik əlavə ediləcək.
              </p>
              <div className="mt-4 text-left space-y-1">
                {["Nisbət. Tənasüb. Faizlər", "Tam ədədlər", "Koordinat sistemi",
                  "Çoxluqlar", "Dəyişəni olan ifadələr", "Üçbucaqlar",
                  "Sahə və həcm", "Statistika"].map((ch, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-amber-700">
                    <span className="w-4 h-4 rounded-full border border-amber-300 bg-white text-[9px]
                                     flex items-center justify-center font-bold text-amber-500">
                      {i + 2}
                    </span>
                    {ch}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SectionBlock>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* BLOK 3: Abiturient — Blok İmtahan (P003)              */}
      {/* ═══════════════════════════════════════════════════════ */}
      <SectionBlock
        icon="📝" grade="Abiturient"
        title="Blok İmtahan — Hazırlıq Kursu"
        subtitle="P003 · 28 mövzu + testlər, sübutlar, situasiya məsələləri"
        gradient="bg-gradient-to-r from-violet-600 to-purple-700"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <SubHead icon="📚" label="Mövzular (28)" count={blokDərs.length} />
            {blokDərs.map((t) => (
              <TopicCard key={t.id} topic={t} accent="text-violet-500 hover:text-violet-700 hover:bg-violet-50" />
            ))}
          </div>
          <div>
            <SubHead icon="🧪" label="Aktiv Testlər (P003)" count={p003Tests.length} />
            {p003Tests.length > 0 ? (
              <div className="space-y-1.5">
                {p003Tests.map((r) => (
                  <div key={r.id}
                    className="flex items-center gap-2.5 px-4 py-3 bg-white border border-violet-200
                               rounded-xl shadow-sm hover:border-violet-400 transition-colors group">
                    <Badge type={r.type} />
                    <span className="text-xs text-slate-800 flex-1 leading-snug">{r.title_az}</span>
                    {r.content_url && (
                      <Link href={r.content_url} target="_blank"
                        className="shrink-0 text-[10px] text-violet-600 hover:text-violet-800
                                   px-2 py-0.5 rounded hover:bg-violet-50 transition-colors">
                        Aç →
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-violet-200 bg-violet-50 p-5 text-center">
                <p className="text-2xl mb-2">🔒</p>
                <p className="text-xs text-violet-600">
                  Testlər hazırlanır. Hazır olanda burada görünəcək.
                </p>
              </div>
            )}
          </div>
        </div>
      </SectionBlock>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* BLOK 4: Müəllim — TAİM 2026 (P004)                    */}
      {/* ═══════════════════════════════════════════════════════ */}
      <SectionBlock
        icon="🎓" grade="Müəllim — MİQ"
        title="TAİM 2026 — İşə Qəbul Attestasiyası"
        subtitle={`P004 · ${muellimTaim.length} bölmə — ${p004_count} test (hüquqi · metodiki · pedaqoji)`}
        gradient="bg-gradient-to-r from-emerald-600 to-teal-700"
      >
        {/* Bölmə stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: "Tematik testlər", count: muellimTaim.filter(t => t.resources.some(r => r.slug.startsWith("taim-test-"))).length, icon: "📋" },
            { label: "Fəsil sınaqları", count: muellimTaim.filter(t => t.resources.some(r => r.slug.startsWith("fs"))).length,         icon: "📑" },
            { label: "Ümumi sınaqlar",  count: muellimTaim.filter(t => t.resources.some(r => r.slug.startsWith("us"))).length,         icon: "🏆" },
          ].map((s) => (
            <div key={s.label} className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center gap-3">
              <span className="text-xl">{s.icon}</span>
              <div>
                <p className="text-xs font-semibold text-emerald-800">{s.label}</p>
                <p className="text-lg font-black text-emerald-700">{s.count}</p>
              </div>
            </div>
          ))}
        </div>
        {/* Bölmə accordion */}
        <div className="space-y-2">
          {muellimTaim.map((t) => {
            if (t.resources.length === 0) return null;
            return (
              <details key={t.id}
                className="group border border-emerald-200 rounded-xl overflow-hidden bg-white shadow-sm">
                <summary className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-emerald-50/40
                                    transition-colors list-none select-none">
                  <span className="w-5 h-5 rounded bg-emerald-100 text-emerald-700 text-[10px] font-bold
                                   flex items-center justify-center shrink-0">
                    {t.order_index}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{t.title_az}</p>
                    <p className="text-[11px] text-slate-400 truncate">{t.title_ru}</p>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full shrink-0">
                    {t.resources.length} test
                  </span>
                  <span className="text-slate-300 text-[10px] group-open:rotate-90 transition-transform ml-1">▶</span>
                </summary>
                <div className="border-t border-emerald-100 divide-y divide-slate-50">
                  {t.resources.map((r) => (
                    <ResRow key={r.id} r={r} accent="text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50" />
                  ))}
                </div>
              </details>
            );
          })}
        </div>
      </SectionBlock>
    </div>
  );
}
