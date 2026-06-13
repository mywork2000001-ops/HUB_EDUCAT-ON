import { db } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

// ─── Types ────────────────────────────────────────────────────────────────────

type ResRow = {
  id: number; slug: string; type: string; title_az: string;
  title_ru: string; content_url: string | null;
};

type TopicRow = {
  id: number; slug: string; title_az: string; title_ru: string;
  order_index: number; resources: ResRow[];
};

type SubjectData = {
  id: number; slug: string; label_az: string;
  topics: TopicRow[];
};

// ─── Data layer ───────────────────────────────────────────────────────────────

async function getData(): Promise<Record<string, SubjectData>> {
  const subjects = await db.subject.findMany({
    where: { slug: { in: ["math", "dim-test", "block-exam", "taim-2026"] } },
    include: {
      grades: {
        include: {
          curriculum_items: {
            where:   { parent_id: null },
            orderBy: { order_index: "asc" },
            include: {
              resources: {
                where:   { is_published: true },
                orderBy: { id: "asc" },
                select: { id: true, slug: true, type: true, title_az: true, title_ru: true, content_url: true },
              },
            },
          },
        },
      },
    },
  });

  const result: Record<string, SubjectData> = {};
  for (const s of subjects) {
    const topics: TopicRow[] = s.grades.flatMap((gs) =>
      gs.curriculum_items.map((ci) => ({
        id: ci.id, slug: ci.slug,
        title_az: ci.title_az, title_ru: ci.title_ru,
        order_index: ci.order_index,
        resources: ci.resources as ResRow[],
      }))
    );
    topics.sort((a, b) => a.order_index - b.order_index);
    result[s.slug] = { id: s.id, slug: s.slug, label_az: s.label_az, topics };
  }
  return result;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const LESSON_TYPES = new Set(["LESSON"]);
const TEST_TYPES   = new Set(["TEST", "TAIM_TEST", "BSQ", "KSQ"]);

function isLesson(r: ResRow) { return LESSON_TYPES.has(r.type); }
function isTest(r: ResRow)   { return TEST_TYPES.has(r.type); }

const TYPE_BADGE: Record<string, string> = {
  LESSON:    "bg-blue-100 text-blue-700",
  TEST:      "bg-orange-100 text-orange-700",
  TAIM_TEST: "bg-emerald-100 text-emerald-700",
  BSQ:       "bg-red-100 text-red-700",
  KSQ:       "bg-slate-100 text-slate-700",
  VIDEO:     "bg-pink-100 text-pink-700",
};
const TYPE_LABEL: Record<string, string> = {
  LESSON: "Dərs", TEST: "Test", TAIM_TEST: "TAİM",
  BSQ: "BSQ", KSQ: "KSQ", VIDEO: "Video",
};

function ResBadge({ type }: { type: string }) {
  return (
    <span className={`shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide
                      ${TYPE_BADGE[type] ?? "bg-slate-100 text-slate-600"}`}>
      {TYPE_LABEL[type] ?? type}
    </span>
  );
}

function ResLink({ r }: { r: ResRow }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 transition-colors group">
      <ResBadge type={r.type} />
      <span className="text-xs text-slate-700 flex-1 truncate">{r.title_az}</span>
      {r.content_url && (
        <Link href={r.content_url} target="_blank"
          className="shrink-0 text-[10px] text-indigo-500 hover:text-indigo-700 px-1.5 py-0.5
                     rounded hover:bg-indigo-50 opacity-0 group-hover:opacity-100 transition-all">
          Aç →
        </Link>
      )}
    </div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({
  icon, title, subtitle, color,
}: { icon: string; title: string; subtitle: string; color: string }) {
  return (
    <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl ${color} mb-5`}>
      <span className="text-3xl">{icon}</span>
      <div>
        <h2 className="text-base font-bold text-white leading-tight">{title}</h2>
        <p className="text-white/70 text-xs mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

// ─── Sub-section label ────────────────────────────────────────────────────────

function SubLabel({ icon, label, count }: { icon: string; label: string; count: number }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-sm">{icon}</span>
      <p className="text-sm font-bold text-slate-700">{label}</p>
      <span className="ml-auto text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
        {count}
      </span>
    </div>
  );
}

// ─── Chapter accordion (for P002) ────────────────────────────────────────────

function ChapterAccordion({ topic }: { topic: TopicRow }) {
  const lessons = topic.resources.filter(isLesson);
  const tests   = topic.resources.filter(isTest);

  return (
    <details className="group border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm mb-2">
      <summary className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors list-none select-none">
        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold
                         flex items-center justify-center shrink-0">
          {topic.order_index}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate">{topic.title_az}</p>
          <p className="text-[11px] text-slate-400 truncate">{topic.title_ru}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {lessons.length > 0 && (
            <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
              {lessons.length} dərs
            </span>
          )}
          {tests.length > 0 && (
            <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
              {tests.length} test
            </span>
          )}
          <span className="text-slate-300 text-xs group-open:rotate-90 transition-transform">▶</span>
        </div>
      </summary>
      <div className="border-t border-slate-100 divide-y divide-slate-50">
        {topic.resources.map((r) => <ResLink key={r.id} r={r} />)}
      </div>
    </details>
  );
}

// ─── Flat topic card (for P001, P003 topics, P004 topics) ────────────────────

function TopicCard({ topic }: { topic: TopicRow }) {
  const res = topic.resources;
  if (res.length === 0) return null;

  return (
    <details className="group border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm mb-1.5">
      <summary className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-slate-50 transition-colors list-none select-none">
        <span className="w-5 h-5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold
                         flex items-center justify-center shrink-0">
          {topic.order_index}
        </span>
        <p className="text-xs font-medium text-slate-800 flex-1 truncate">{topic.title_az}</p>
        <span className="text-[10px] text-slate-400 shrink-0">{res.length} resurs</span>
        <span className="text-slate-300 text-[10px] group-open:rotate-90 transition-transform ml-1">▶</span>
      </summary>
      <div className="border-t border-slate-100 divide-y divide-slate-50">
        {res.map((r) => <ResLink key={r.id} r={r} />)}
      </div>
    </details>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default async function ContentLibraryPage() {
  const data = await getData();

  const math      = data["math"]       ?? { topics: [] as TopicRow[], label_az: "Riyaziyyat",  slug: "math",       id: 0 };
  const dimTest   = data["dim-test"]   ?? { topics: [] as TopicRow[], label_az: "DİM Test",    slug: "dim-test",   id: 0 };
  const blockExam = data["block-exam"] ?? { topics: [] as TopicRow[], label_az: "Blok İmtahan",slug: "block-exam", id: 0 };
  const taim      = data["taim-2026"]  ?? { topics: [] as TopicRow[], label_az: "TAİM 2026",   slug: "taim-2026",  id: 0 };

  // Split block-exam topics: those that have LESSON resources = mövzular, TEST = testlər
  const blokMövzu = blockExam.topics.filter((t) => t.resources.some(isLesson));
  const blokTest  = blockExam.topics.filter((t) => t.resources.some(isTest));

  // P002 lesson count (only LESSON type)
  const p002LessonCount = math.topics.reduce((acc, t) => acc + t.resources.filter(isLesson).length, 0);
  const p001TestCount   = dimTest.topics.length;
  const blokTotal       = blockExam.topics.reduce((acc, t) => acc + t.resources.length, 0);
  const taimTotal       = taim.topics.reduce((acc, t) => acc + t.resources.length, 0);

  return (
    <div className="p-6 max-w-5xl">

      {/* ── Page header ──────────────────────────────────────────────────────── */}
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-slate-900">Dərslər və Testlər</h1>
        <p className="text-slate-400 text-sm mt-1">
          P001–P004 bütün materiallar — platformalar üzrə ayrı bölmələr
        </p>
      </div>

      {/* ── Stats summary ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { icon: "📖", label: "P002 Dərslik",    count: p002LessonCount, unit: "dərs",  color: "bg-blue-50 border-blue-200 text-blue-700" },
          { icon: "📊", label: "P001 DİM Testlər", count: p001TestCount,   unit: "test",  color: "bg-orange-50 border-orange-200 text-orange-700" },
          { icon: "📝", label: "P003 Blok",         count: blokTotal,       unit: "resurs",color: "bg-violet-50 border-violet-200 text-violet-700" },
          { icon: "🎓", label: "P004 TAİM",         count: taimTotal,       unit: "test",  color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border p-4 ${s.color}`}>
            <p className="text-xl mb-1">{s.icon}</p>
            <p className="text-xs font-medium opacity-80">{s.label}</p>
            <p className="text-xl font-black mt-0.5">{s.count} <span className="text-xs font-normal">{s.unit}</span></p>
          </div>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* BLOK 1: MƏKTƏB (P001 + P002)                                         */}
      {/* ══════════════════════════════════════════════════════════════════════ */}

      <section className="mb-10">
        <SectionHeader
          icon="🏫"
          title="Məktəb — V sinif Riyaziyyat"
          subtitle="P001 DİM Test Bankı + P002 İnteraktiv Dərslik"
          color="bg-gradient-to-r from-blue-600 to-indigo-600"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── P002: Dərslik (chapters) ── */}
          <div>
            <SubLabel icon="📖" label="Dərslik — Fəsillər üzrə (P002)" count={p002LessonCount} />
            <div>
              {math.topics.length === 0 ? (
                <p className="text-xs text-slate-400 italic px-2">Məlumat yoxdur</p>
              ) : (
                math.topics.map((t) => <ChapterAccordion key={t.id} topic={t} />)
              )}
            </div>
          </div>

          {/* ── P001: DİM Tests (flat list) ── */}
          <div>
            <SubLabel icon="📊" label="DİM Test Bankı 2025 (P001)" count={p001TestCount} />
            <div>
              {dimTest.topics.length === 0 ? (
                <p className="text-xs text-slate-400 italic px-2">Məlumat yoxdur</p>
              ) : (
                dimTest.topics.map((t) => <TopicCard key={t.id} topic={t} />)
              )}
            </div>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* BLOK 2: BLOK İMTAHAN (P003)                                          */}
      {/* ══════════════════════════════════════════════════════════════════════ */}

      <section className="mb-10">
        <SectionHeader
          icon="📝"
          title="Blok İmtahan — Hazırlıq"
          subtitle="P003 · 28 mövzu + testlər, sübutlar, situasiya məsələləri"
          color="bg-gradient-to-r from-violet-600 to-purple-700"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── Mövzular ── */}
          <div>
            <SubLabel icon="📚" label="Mövzular" count={blokMövzu.length} />
            {blokMövzu.length === 0 ? (
              <p className="text-xs text-slate-400 italic px-2">Məlumat yoxdur</p>
            ) : (
              blokMövzu.map((t) => (
                <TopicCard key={t.id} topic={t} />
              ))
            )}
          </div>

          {/* ── Testlər ── */}
          <div>
            <SubLabel icon="🧪" label="Testlər (P003)" count={blokTest.length} />
            {blokTest.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center">
                <p className="text-2xl mb-2">🔒</p>
                <p className="text-xs text-slate-500">Testlər mövzular altında göstərilir.</p>
                <p className="text-xs text-slate-400 mt-1">
                  Mövzu 1-in içindəki &ldquo;Test&rdquo; tipli resurslar Blok testlərdir.
                </p>
              </div>
            ) : (
              blokTest.map((t) => (
                <TopicCard key={t.id} topic={t} />
              ))
            )}
            {/* P003 tests are embedded under topic-01 — show them directly */}
            {blokTest.length === 0 && (() => {
              const t1 = blokMövzu.find((t) => t.order_index === 1);
              const tests = t1?.resources.filter(isTest) ?? [];
              if (tests.length === 0) return null;
              return (
                <div className="space-y-1.5 mt-2">
                  <p className="text-[11px] text-slate-400 px-1 mb-2">
                    Mövzu 1 altındakı aktiv testlər:
                  </p>
                  {tests.map((r) => (
                    <div key={r.id}
                      className="flex items-center gap-2.5 px-3 py-2.5 bg-white border border-violet-200
                                 rounded-xl shadow-sm hover:border-violet-400 transition-colors group">
                      <ResBadge type={r.type} />
                      <span className="text-xs text-slate-700 flex-1 truncate">{r.title_az}</span>
                      {r.content_url && (
                        <Link href={r.content_url} target="_blank"
                          className="shrink-0 text-[10px] text-violet-500 hover:text-violet-700
                                     px-2 py-0.5 rounded hover:bg-violet-50 transition-colors">
                          Aç →
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* BLOK 3: TAİM 2026 (P004)                                             */}
      {/* ══════════════════════════════════════════════════════════════════════ */}

      <section>
        <SectionHeader
          icon="🎓"
          title="TAİM 2026 — MİQ Attestasiya Hazırlığı"
          subtitle={`P004 · ${taim.topics.length} bölmə — ${taimTotal} test (hüquqi, metodiki, pedaqoji)`}
          color="bg-gradient-to-r from-emerald-600 to-teal-700"
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          {[
            { label: "Tematik testlər", count: taim.topics.filter(t => t.resources.some(r => r.slug.startsWith("taim-test-"))).length, icon: "📋" },
            { label: "Fəsil sınaqları", count: taim.topics.filter(t => t.resources.some(r => r.slug.startsWith("fs"))).length,         icon: "📑" },
            { label: "Ümumi sınaqlar",  count: taim.topics.filter(t => t.resources.some(r => r.slug.startsWith("us"))).length,         icon: "🏆" },
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

        {/* Tematik sections (I, II, III bölmə) + fəsil + ümumi */}
        <div className="space-y-2">
          {taim.topics.map((t) => {
            const testsTotal = t.resources.length;
            if (testsTotal === 0) return null;
            return (
              <details key={t.id}
                className="group border border-emerald-200 rounded-xl overflow-hidden bg-white shadow-sm">
                <summary className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-emerald-50/50 transition-colors list-none select-none">
                  <span className="w-5 h-5 rounded bg-emerald-100 text-emerald-700 text-[10px] font-bold
                                   flex items-center justify-center shrink-0">
                    {t.order_index}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{t.title_az}</p>
                    <p className="text-[11px] text-slate-400 truncate">{t.title_ru}</p>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium shrink-0">
                    {testsTotal} test
                  </span>
                  <span className="text-slate-300 text-[10px] group-open:rotate-90 transition-transform ml-1">▶</span>
                </summary>
                <div className="border-t border-emerald-100 divide-y divide-slate-50">
                  {t.resources.map((r) => (
                    <div key={r.id}
                      className="flex items-center gap-2 px-4 py-2.5 hover:bg-slate-50 transition-colors group/res">
                      <ResBadge type={r.type} />
                      <span className="text-xs text-slate-700 flex-1 truncate">{r.title_az}</span>
                      {r.content_url && (
                        <Link href={r.content_url} target="_blank"
                          className="shrink-0 text-[10px] text-emerald-600 hover:text-emerald-800 px-1.5 py-0.5
                                     rounded hover:bg-emerald-50 opacity-0 group-hover/res:opacity-100 transition-all">
                          Aç →
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </details>
            );
          })}
        </div>
      </section>
    </div>
  );
}
