/**
 * sync.ts — синхронизация файлов Projects/ с Supabase Resource таблицей
 *
 * Алгоритм:
 *   1. Сканирует все HTML файлы в P001–P004 на диске
 *   2. Сравнивает с content_url в таблице resources
 *   3. ДОБАВЛЯЕТ ресурсы для файлов, которых нет в БД
 *   4. СНИМАЕТ is_published для ресурсов, чьи файлы удалены с диска
 *
 * Запуск: npx tsx prisma/sync.ts
 */

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import * as fs from "fs";
import * as path from "path";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db      = new PrismaClient({ adapter });

const PROJECTS = "C:/Users/Administrator/Documents/Claude/Projects";

// ─── URL helpers (same as other seeds) ───────────────────────────────────────
const P1   = (n: number)             => `/api/content/P001_Math_5_DIM/5dim_sinif_testi2025/Lesson-${n}.html`;
const P2L  = (ch: number, n: number) => `/api/content/P002_Math_5_Darslik/math-5-class-${ch}/Lesson-${n}.html`;
const P2_6 = (ch: number, n: number) => `/api/content/P002_Math_6_Darslik/math-6-class-${ch}/Lesson-${n}.html`;
const P3T  = (n: number)             => `/api/content/P003_Block_Exam/app/public/lessons/topics/topic-${String(n).padStart(2,"0")}.html`;
const P3X  = (f: string)             => `/api/content/P003_Block_Exam/app/public/lessons/tests/${f}`;
const P4   = (f: string)             => `/api/content/P004_TAIM_2026/${f}`;

// ─── Disk → Grade5 Riyaziyyat topic mapping ──────────────────────────────────
const P001_TOPIC: Record<number, string> = {
   1: "natural-numbers",   2: "natural-numbers",   3: "natural-numbers",
   4: "fractions",         5: "fractions",          6: "fractions",         7: "fractions",
   8: "decimal-fractions", 9: "decimal-fractions",
  10: "percentages",      11: "natural-numbers",   // L11 = mixed nat.numbers review
  12: "proportions",      13: "geometry-basics",   14: "area-perimeter",
  15: "negative-numbers", 16: "negative-numbers",  17: "negative-numbers",
};

const P002_5_TOPIC: Record<number, string> = {
  1: "natural-numbers",   2: "fractions",         3: "decimal-fractions",
  4: "percentages",       5: "proportions",       6: "geometry-basics",
  7: "area-perimeter",    8: "negative-numbers",
};

const P002_6_TOPIC: Record<number, string> = {
  1: "natural-numbers-6",  2: "ratio-proportion",  3: "integers",
  4: "coordinate-system",  5: "sets",              6: "expressions-eq",
  7: "triangles",          8: "area-volume",
};

// P003 extra tests → blok-topic-28 (final review topic)
const P003_EXTRA_TESTS: { file: string; az: string; ru: string }[] = [
  { file: "test-dim-mixed.html", az: "DİM Qarışıq Test",   ru: "Смешанный ДИМ тест"  },
  { file: "test-variant-1.html", az: "Kitab 1 — Yekun Test", ru: "Книга 1 — Итоговый тест" },
  { file: "test-variant-2.html", az: "Kitab 2 — Yekun Test", ru: "Книга 2 — Итоговый тест" },
];

// P004 test→bölmə mapping
const P004_TEST_BOLME: Record<number, string> = {
   1: "hüquqi",
   ...Object.fromEntries(Array.from({length: 29}, (_, i) => [i + 2, "metodiki"])),
  ...Object.fromEntries(Array.from({length:  8}, (_, i) => [i + 31, "pedaqoji"])),
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function exists(relPath: string): boolean {
  return fs.existsSync(path.join(PROJECTS, relPath));
}

function parseLesson(filename: string): number | null {
  const m = filename.match(/^Lesson-(\d+)\.html$/i);
  return m ? parseInt(m[1]) : null;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  // Load all existing resource URLs from DB
  const existing = await db.resource.findMany({ select: { id: true, content_url: true, is_published: true } });
  const urlToId  = new Map(existing.filter(r => r.content_url).map(r => [r.content_url!, r.id]));

  // Load all grades, subjects, topics
  const grade5 = await db.grade.findUniqueOrThrow({ where: { number: 5 } });
  const grade6 = await db.grade.findUniqueOrThrow({ where: { number: 6 } });
  const math   = await db.subject.findUniqueOrThrow({ where: { slug: "math" } });
  const block  = await db.subject.findUniqueOrThrow({ where: { slug: "block-exam" } });
  const taim   = await db.subject.findUniqueOrThrow({ where: { slug: "taim-2026" } });

  // Topic lookup helper
  async function getTopic(gradeId: number, subjectId: number, slug: string) {
    return db.curriculumItem.findUnique({
      where: { grade_id_subject_id_slug: { grade_id: gradeId, subject_id: subjectId, slug } },
    });
  }

  type ResType = "LESSON" | "TEST" | "TAIM_TEST" | "BSQ" | "KSQ";

  async function upsertRes(
    curriculum_id: number, slug: string, type: ResType,
    title_az: string, title_ru: string, content_url: string,
    metadata?: Record<string, string | number | boolean>,
  ) {
    return db.resource.upsert({
      where:  { curriculum_id_slug: { curriculum_id, slug } },
      update: { content_url, is_published: true, type, title_az, title_ru, metadata: metadata ?? null },
      create: { curriculum_id, slug, type, title_az, title_ru, content_url,
                is_published: true, metadata: metadata ?? null },
    });
  }

  let added = 0, alreadySynced = 0, unpublished = 0;

  // ── 1. P001: Lesson-1..17 ─────────────────────────────────────────────────
  console.log("\n🔍 Scanning P001 (17 DİM lessons)…");
  for (let n = 1; n <= 17; n++) {
    const url      = P1(n);
    const diskPath = `P001_Math_5_DIM/5dim_sinif_testi2025/Lesson-${n}.html`;
    const onDisk   = exists(diskPath);
    const inDb     = urlToId.has(url);

    if (!onDisk) {
      if (inDb) {
        await db.resource.update({ where: { id: urlToId.get(url)! }, data: { is_published: false } });
        console.log(`  ⚠️  L${n} file missing → unpublished`);
        unpublished++;
      }
      continue;
    }
    if (inDb) { alreadySynced++; continue; }

    // Not in DB — add it
    const topicSlug = P001_TOPIC[n];
    const topic = await getTopic(grade5.id, math.id, topicSlug);
    if (!topic) { console.warn(`  ⚠️  Topic ${topicSlug} not found for P001 L${n}`); continue; }

    await upsertRes(topic.id, `test-dim-${n}`, "TEST",
      `DİM — Dərs ${n} (30 sual)`, `ДИМ — Урок ${n} (30 вопр.)`,
      url, { questions_count: 30, duration_min: 30, lesson: n });
    console.log(`  ✅ Added P001 Lesson-${n} → ${topicSlug}`);
    added++;
  }

  // ── 2. P002-5: Lesson files per chapter ──────────────────────────────────
  console.log("\n🔍 Scanning P002-5 (8 chapters)…");
  for (let ch = 1; ch <= 8; ch++) {
    const dir = path.join(PROJECTS, `P002_Math_5_Darslik/math-5-class-${ch}`);
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir).filter(f => /^Lesson-\d+\.html$/i.test(f));

    for (const file of files) {
      const n   = parseLesson(file)!;
      const url = P2L(ch, n);
      if (urlToId.has(url)) { alreadySynced++; continue; }

      const topicSlug = P002_5_TOPIC[ch];
      const topic = await getTopic(grade5.id, math.id, topicSlug);
      if (!topic) { console.warn(`  ⚠️  Topic not found: ${topicSlug}`); continue; }

      await upsertRes(topic.id, `p2-c${ch}-l${n}`, "LESSON",
        `Fəsil ${ch} · Dərs ${n}`, `Гл. ${ch} · Урок ${n}`,
        url, { chapter: ch, lesson: n, duration_min: 40 });
      console.log(`  ✅ Added P002-5 class-${ch}/Lesson-${n} → ${topicSlug}`);
      added++;
    }

    // Check for DB resources pointing to files that don't exist on disk
    const chTopic = await getTopic(grade5.id, math.id, P002_5_TOPIC[ch]);
    if (!chTopic) continue;
    const chResources = await db.resource.findMany({
      where: { curriculum_id: chTopic.id, content_url: { contains: `class-${ch}/Lesson-` } },
    });
    for (const r of chResources) {
      if (!r.content_url) continue;
      const m = r.content_url.match(/Lesson-(\d+)\.html/);
      if (!m) continue;
      const lessonN = parseInt(m[1]);
      const diskFile = path.join(PROJECTS, `P002_Math_5_Darslik/math-5-class-${ch}/Lesson-${lessonN}.html`);
      if (!fs.existsSync(diskFile) && r.is_published) {
        await db.resource.update({ where: { id: r.id }, data: { is_published: false } });
        console.log(`  ⚠️  P002-5 class-${ch}/Lesson-${lessonN} missing on disk → unpublished`);
        unpublished++;
      }
    }
  }

  // ── 3. P002-6: Auto-detect new lessons ───────────────────────────────────
  console.log("\n🔍 Scanning P002-6 (Grade 6)…");
  for (let ch = 1; ch <= 8; ch++) {
    const dir = path.join(PROJECTS, `P002_Math_6_Darslik/math-6-class-${ch}`);
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir).filter(f => /^Lesson-\d+\.html$/i.test(f));

    for (const file of files) {
      const n   = parseLesson(file)!;
      const url = P2_6(ch, n);
      if (urlToId.has(url)) { alreadySynced++; continue; }

      const topicSlug = P002_6_TOPIC[ch];
      const topic = await getTopic(grade6.id, math.id, topicSlug);
      if (!topic) { console.warn(`  ⚠️  Grade 6 topic not found: ${topicSlug}`); continue; }

      await upsertRes(topic.id, `p2-6-c${ch}-l${n}`, "LESSON",
        `Fəsil ${ch} · Dərs ${n}`, `Гл. ${ch} · Урок ${n}`,
        url, { chapter: ch, lesson: n, duration_min: 40 });
      console.log(`  ✅ Added P002-6 class-${ch}/Lesson-${n} → ${topicSlug}`);
      added++;
    }
  }

  // ── 4. P003: topics 1-28 ─────────────────────────────────────────────────
  console.log("\n🔍 Scanning P003 topics (28)…");
  for (let n = 1; n <= 28; n++) {
    const url = P3T(n);
    if (urlToId.has(url)) { alreadySynced++; continue; }

    const slug  = `blok-topic-${String(n).padStart(2,"0")}`;
    const topic = await getTopic(grade5.id, block.id, slug);
    if (!topic) { console.warn(`  ⚠️  Block topic not found: ${slug}`); continue; }

    if (!exists(`P003_Block_Exam/app/public/lessons/topics/topic-${String(n).padStart(2,"0")}.html`)) continue;

    await upsertRes(topic.id, "topic-page", "LESSON",
      topic.title_az, topic.title_ru, url, { topic_number: n });
    console.log(`  ✅ Added P003 topic-${n}`);
    added++;
  }

  // ── 5. P003: extra tests (dim-mixed, variant-1, variant-2) ───────────────
  console.log("\n🔍 Scanning P003 extra tests…");
  const finalTopic = await getTopic(grade5.id, block.id, "blok-topic-28");
  if (finalTopic) {
    for (const t of P003_EXTRA_TESTS) {
      const url = P3X(t.file);
      if (urlToId.has(url)) { alreadySynced++; continue; }
      if (!exists(`P003_Block_Exam/app/public/lessons/tests/${t.file}`)) continue;
      const slug = t.file.replace(".html", "");
      await upsertRes(finalTopic.id, slug, "TEST", t.az, t.ru, url, { duration_min: 45 });
      console.log(`  ✅ Added P003 test: ${t.file}`);
      added++;
    }
  }

  // ── 6. P004: test-1..38 ──────────────────────────────────────────────────
  console.log("\n🔍 Scanning P004 tematik tests (38)…");
  for (let n = 1; n <= 38; n++) {
    const url = P4(`test-${n}.html`);
    if (urlToId.has(url)) { alreadySynced++; continue; }
    if (!exists(`P004_TAIM_2026/test-${n}.html`)) continue;

    const bölməSlug = P004_TEST_BOLME[n];
    const topic = await getTopic(grade5.id, taim.id, bölməSlug);
    if (!topic) { console.warn(`  ⚠️  TAİM bölmə not found: ${bölməSlug}`); continue; }

    await upsertRes(topic.id, `taim-test-${n}`, "TAIM_TEST",
      `TAİM Test ${n}`, `TAİM Тест ${n}`,
      url, { test_number: n, duration_min: 45, questions_count: 30 });
    console.log(`  ✅ Added P004 test-${n} → ${bölməSlug}`);
    added++;
  }

  // ── 7. P004: fəsil + ümumi sınaqlar ─────────────────────────────────────
  console.log("\n🔍 Scanning P004 sınaqlar…");
  const sinaqTopic = await getTopic(grade5.id, taim.id, "fesil-sinaqlar");
  const umumiTopic = await getTopic(grade5.id, taim.id, "umumi-sinaqlar");

  const sinaqlar = [
    ...[1,2,3,4,5,6].map(n => ({ slug: `fs${n}`, file: `test-fs${n}.html`, topic: sinaqTopic })),
    ...[1,2,3].map(n => ({ slug: `us${n}`, file: `test-us${n}.html`, topic: umumiTopic })),
  ];

  for (const s of sinaqlar) {
    if (!s.topic) continue;
    const url = P4(s.file);
    if (urlToId.has(url)) { alreadySynced++; continue; }
    if (!exists(`P004_TAIM_2026/${s.file}`)) continue;
    await upsertRes(s.topic.id, s.slug, "TAIM_TEST",
      `TAİM — ${s.slug.toUpperCase()}`, `TAİM — ${s.slug.toUpperCase()}`,
      url, { duration_min: 60 });
    console.log(`  ✅ Added P004 ${s.file}`);
    added++;
  }

  // ── SUMMARY ──────────────────────────────────────────────────────────────
  console.log("\n" + "═".repeat(55));
  console.log(`✅ Sync complete!`);
  console.log(`   Already synced : ${alreadySynced} resources`);
  console.log(`   Newly added    : ${added} resources`);
  console.log(`   Unpublished    : ${unpublished} (file missing on disk)`);
  console.log("═".repeat(55) + "\n");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
