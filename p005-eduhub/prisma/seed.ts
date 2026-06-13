import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma  = new PrismaClient({ adapter });

// Helper — upsert a resource and keep it DRY
async function res(
  curriculum_id: number,
  slug: string,
  data: {
    type: "LESSON" | "TEST" | "TAIM_TEST" | "BSQ" | "KSQ" | "WORKBOOK" | "VIDEO";
    title_az: string;
    title_ru: string;
    content_url?: string;
    metadata?: Record<string, string | number | boolean>;
  }
) {
  return prisma.resource.upsert({
    where:  { curriculum_id_slug: { curriculum_id, slug } },
    update: { ...data },
    create: { curriculum_id, slug, is_published: true, ...data },
  });
}

const P1 = (lesson: number) =>
  `/api/content/P001_Math_5_DIM/5dim_sinif_testi2025/Lesson-${lesson}.html`;

const P2 = (chapter: number, file = "index.html") =>
  `/api/content/P002_Math_5_Darslik/math-5-class-${chapter}/${file}`;

const P2_6 = (chapter: number, file = "index.html") =>
  `/api/content/P002_Math_6_Darslik/math-6-class-${chapter}/${file}`;

async function main() {
  // ─── Grades ──────────────────────────────────────────────────
  const grade5 = await prisma.grade.upsert({
    where:  { number: 5 },
    update: {},
    create: { number: 5, slug: "grade-5", label_az: "5-ci sinif", label_ru: "5-й класс" },
  });

  const grade6 = await prisma.grade.upsert({
    where:  { number: 6 },
    update: {},
    create: { number: 6, slug: "grade-6", label_az: "6-cı sinif", label_ru: "6-й класс" },
  });

  // ─── Subjects ────────────────────────────────────────────────
  const math = await prisma.subject.upsert({
    where:  { slug: "math" },
    update: {},
    create: { slug: "math", label_az: "Riyaziyyat", label_ru: "Математика", icon: "📐" },
  });

  // ─── GradeSubject links ───────────────────────────────────────
  for (const gid of [grade5.id, grade6.id]) {
    await prisma.gradeSubject.upsert({
      where:  { grade_id_subject_id: { grade_id: gid, subject_id: math.id } },
      update: {},
      create: { grade_id: gid, subject_id: math.id },
    });
  }

  // ─── Grade 5 Riyaziyyat topics ────────────────────────────────
  const TOPICS = [
    { slug: "natural-numbers",   title_az: "Təbii ədədlər",      title_ru: "Натуральные числа",     order_index: 1 },
    { slug: "fractions",         title_az: "Adi kəsrlər",        title_ru: "Обыкновенные дроби",    order_index: 2 },
    { slug: "decimal-fractions", title_az: "Onluq kəsrlər",      title_ru: "Десятичные дроби",      order_index: 3 },
    { slug: "percentages",       title_az: "Faizlər",            title_ru: "Проценты",              order_index: 4 },
    { slug: "proportions",       title_az: "Nisbət və tənasüb",  title_ru: "Отношения и пропорции", order_index: 5 },
    { slug: "geometry-basics",   title_az: "Həndəsə əsasları",   title_ru: "Основы геометрии",      order_index: 6 },
    { slug: "area-perimeter",    title_az: "Sahə və perimetr",   title_ru: "Площадь и периметр",    order_index: 7 },
    { slug: "negative-numbers",  title_az: "Mənfi ədədlər",      title_ru: "Отрицательные числа",   order_index: 8 },
  ];

  for (const topic of TOPICS) {
    const t = await prisma.curriculumItem.upsert({
      where:  { grade_id_subject_id_slug: { grade_id: grade5.id, subject_id: math.id, slug: topic.slug } },
      update: {},
      create: { grade_id: grade5.id, subject_id: math.id, ...topic },
    });

    // ── 1. Təbii ədədlər ────────────────────────────────────────
    if (topic.slug === "natural-numbers") {
      await res(t.id, "darslik-1",  { type: "LESSON", title_az: "Dərslik — Təbii ədədlər (Fəsil 1)", title_ru: "Учебник — Натуральные числа (Гл. 1)", content_url: P2(1), metadata: { duration_min: 45 } });
      await res(t.id, "test-dim-1", { type: "TEST",   title_az: "DİM — Yazılışı və oxunuşu (30 sual)", title_ru: "ДИМ — Запись и чтение (30 вопр.)", content_url: P1(1), metadata: { questions_count: 30, duration_min: 30 } });
      await res(t.id, "test-dim-2", { type: "TEST",   title_az: "DİM — Toplama və çıxma (30 sual)",   title_ru: "ДИМ — Сложение и вычитание (30 вопр.)", content_url: P1(2), metadata: { questions_count: 30, duration_min: 30 } });
      await res(t.id, "test-dim-3", { type: "TEST",   title_az: "DİM — Vurma və bölmə (30 sual)",     title_ru: "ДИМ — Умножение и деление (30 вопр.)", content_url: P1(3), metadata: { questions_count: 30, duration_min: 30 } });
      await res(t.id, "ksq-1",      { type: "KSQ",    title_az: "KSQ — Təbii ədədlər (10 sual)",      title_ru: "МСО — Натуральные числа (10 вопр.)", metadata: { questions_count: 10, duration_min: 20 } });
    }

    // ── 2. Adi kəsrlər ──────────────────────────────────────────
    if (topic.slug === "fractions") {
      await res(t.id, "darslik-2",  { type: "LESSON", title_az: "Dərslik — Adi kəsrlər (Fəsil 2)",       title_ru: "Учебник — Обыкновенные дроби (Гл. 2)", content_url: P2(2), metadata: { duration_min: 45 } });
      await res(t.id, "test-dim-4", { type: "TEST",   title_az: "DİM — Adi kəsrlər (30 sual)",           title_ru: "ДИМ — Обыкновенные дроби (30 вопр.)", content_url: P1(4), metadata: { questions_count: 30, duration_min: 30 } });
      await res(t.id, "test-dim-5", { type: "TEST",   title_az: "DİM — Kəsrlərin müqayisəsi (30 sual)",  title_ru: "ДИМ — Сравнение дробей (30 вопр.)", content_url: P1(5), metadata: { questions_count: 30, duration_min: 30 } });
      await res(t.id, "test-dim-6", { type: "TEST",   title_az: "DİM — Toplama və çıxma (30 sual)",      title_ru: "ДИМ — Сложение и вычитание (30 вопр.)", content_url: P1(6), metadata: { questions_count: 30, duration_min: 30 } });
      await res(t.id, "test-dim-7", { type: "TEST",   title_az: "DİM — Vurma və bölmə (30 sual)",        title_ru: "ДИМ — Умножение и деление (30 вопр.)", content_url: P1(7), metadata: { questions_count: 30, duration_min: 30 } });
      await res(t.id, "ksq-2",      { type: "KSQ",    title_az: "KSQ — Adi kəsrlər (10 sual)",           title_ru: "МСО — Обыкновенные дроби (10 вопр.)", metadata: { questions_count: 10, duration_min: 20 } });
    }

    // ── 3. Onluq kəsrlər ────────────────────────────────────────
    if (topic.slug === "decimal-fractions") {
      await res(t.id, "darslik-3",  { type: "LESSON", title_az: "Dərslik — Onluq kəsrlər (Fəsil 3)",     title_ru: "Учебник — Десятичные дроби (Гл. 3)", content_url: P2(3), metadata: { duration_min: 45 } });
      await res(t.id, "test-dim-8", { type: "TEST",   title_az: "DİM — Onluq kəsrlər (30 sual)",         title_ru: "ДИМ — Десятичные дроби (30 вопр.)", content_url: P1(8), metadata: { questions_count: 30, duration_min: 30 } });
      await res(t.id, "test-dim-9", { type: "TEST",   title_az: "DİM — Adi və onluq kəsrlər (30 sual)",  title_ru: "ДИМ — Обыкн. и десят. дроби (30 вопр.)", content_url: P1(9), metadata: { questions_count: 30, duration_min: 30 } });
      await res(t.id, "ksq-3",      { type: "KSQ",    title_az: "KSQ — Onluq kəsrlər (10 sual)",         title_ru: "МСО — Десятичные дроби (10 вопр.)", metadata: { questions_count: 10, duration_min: 20 } });
    }

    // ── 4. Faizlər ──────────────────────────────────────────────
    if (topic.slug === "percentages") {
      await res(t.id, "darslik-4",   { type: "LESSON", title_az: "Dərslik — Faizlər (Fəsil 4)",       title_ru: "Учебник — Проценты (Гл. 4)", content_url: P2(4), metadata: { duration_min: 45 } });
      await res(t.id, "test-dim-10", { type: "TEST",   title_az: "DİM — Faizlər (30 sual)",           title_ru: "ДИМ — Проценты (30 вопр.)", content_url: P1(10), metadata: { questions_count: 30, duration_min: 30 } });
      await res(t.id, "ksq-4",       { type: "KSQ",    title_az: "KSQ — Faizlər (10 sual)",           title_ru: "МСО — Проценты (10 вопр.)", metadata: { questions_count: 10, duration_min: 20 } });
    }

    // ── 5. Nisbət və tənasüb ────────────────────────────────────
    if (topic.slug === "proportions") {
      await res(t.id, "darslik-5",   { type: "LESSON", title_az: "Dərslik — İfadələr. Tənliklər (Fəsil 5)", title_ru: "Учебник — Выражения. Уравнения (Гл. 5)", content_url: P2(5), metadata: { duration_min: 45 } });
      await res(t.id, "test-dim-12", { type: "TEST",   title_az: "DİM — Tənliklər və bərabərsizliklər (30 sual)", title_ru: "ДИМ — Уравнения и неравенства (30 вопр.)", content_url: P1(12), metadata: { questions_count: 30, duration_min: 30 } });
      await res(t.id, "ksq-5",       { type: "KSQ",    title_az: "KSQ — Nisbət və tənasüb (10 sual)",  title_ru: "МСО — Отношения и пропорции (10 вопр.)", metadata: { questions_count: 10, duration_min: 20 } });
    }

    // ── 6. Həndəsə əsasları ─────────────────────────────────────
    if (topic.slug === "geometry-basics") {
      await res(t.id, "darslik-6",   { type: "LESSON", title_az: "Dərslik — Müstəvi fiqurlar (Fəsil 6)", title_ru: "Учебник — Плоские фигуры (Гл. 6)", content_url: P2(6), metadata: { duration_min: 45 } });
      await res(t.id, "test-dim-13", { type: "TEST",   title_az: "DİM — Müstəvi fiqurlar (30 sual)",     title_ru: "ДИМ — Плоские фигуры (30 вопр.)", content_url: P1(13), metadata: { questions_count: 30, duration_min: 30 } });
      await res(t.id, "ksq-6",       { type: "KSQ",    title_az: "KSQ — Həndəsə əsasları (10 sual)",     title_ru: "МСО — Основы геометрии (10 вопр.)", metadata: { questions_count: 10, duration_min: 20 } });
    }

    // ── 7. Sahə və perimetr ─────────────────────────────────────
    if (topic.slug === "area-perimeter") {
      await res(t.id, "darslik-6b",  { type: "LESSON", title_az: "Dərslik — Fəza fiqurları (Fəsil 7)",   title_ru: "Учебник — Пространственные фигуры (Гл. 7)", content_url: P2(7), metadata: { duration_min: 45 } });
      await res(t.id, "test-dim-14", { type: "TEST",   title_az: "DİM — Fəza fiqurları (30 sual)",        title_ru: "ДИМ — Пространственные фигуры (30 вопр.)", content_url: P1(14), metadata: { questions_count: 30, duration_min: 30 } });
      await res(t.id, "ksq-7",       { type: "KSQ",    title_az: "KSQ — Sahə və perimetr (10 sual)",      title_ru: "МСО — Площадь и периметр (10 вопр.)", metadata: { questions_count: 10, duration_min: 20 } });
    }

    // ── 8. Mənfi ədədlər ────────────────────────────────────────
    if (topic.slug === "negative-numbers") {
      await res(t.id, "darslik-8",   { type: "LESSON", title_az: "Dərslik — Statistika (Fəsil 8)",        title_ru: "Учебник — Статистика (Гл. 8)", content_url: P2(8), metadata: { duration_min: 45 } });
      await res(t.id, "test-dim-15", { type: "TEST",   title_az: "DİM — Statistika (30 sual)",            title_ru: "ДИМ — Статистика (30 вопр.)", content_url: P1(15), metadata: { questions_count: 30, duration_min: 30 } });
      await res(t.id, "bsq-1",       { type: "BSQ",    title_az: "BSQ — 2-ci yarımil (30 sual)",          title_ru: "ВПР — 2-е полугодие (30 вопр.)", content_url: P1(16), metadata: { questions_count: 30, duration_min: 45 } });
      await res(t.id, "bsq-2",       { type: "BSQ",    title_az: "BSQ — İllik yekun (30 sual)",           title_ru: "ВПР — Итоговый годовой (30 вопр.)", content_url: P1(17), metadata: { questions_count: 30, duration_min: 45 } });
    }
  }

  console.log("✅ Seed tamamlandı — Grade 5 Riyaziyyat: 8 mövzu, 30+ resurs");

  // ─── Grade 6 Riyaziyyat topics ────────────────────────────────
  const TOPICS6 = [
    { slug: "natural-numbers-6",   title_az: "Natural Ədədlər",                           title_ru: "Натуральные числа",               order_index: 1 },
    { slug: "ratio-proportion",    title_az: "Nisbət. Tənasüb. Faizlər",                  title_ru: "Отношение. Пропорция. Проценты",  order_index: 2 },
    { slug: "integers",            title_az: "Tam Ədədlər",                                title_ru: "Целые числа",                     order_index: 3 },
    { slug: "coordinate-system",   title_az: "İkibuçaqlı Koordinat Sistemi",              title_ru: "Двуосная система координат",      order_index: 4 },
    { slug: "sets",                title_az: "Çoxluqlar",                                  title_ru: "Множества",                       order_index: 5 },
    { slug: "expressions-eq",      title_az: "Dəyişəni Olan İfadələr. Tənlik. Bərabərsizlik", title_ru: "Выражения с переменной. Уравнение. Неравенство", order_index: 6 },
    { slug: "triangles",           title_az: "Üçbucaqlar",                                 title_ru: "Треугольники",                    order_index: 7 },
    { slug: "area-volume",         title_az: "Həndəsi Fiqurların Sahəsi və Həcmi",         title_ru: "Площадь и объём геометрических фигур", order_index: 8 },
    { slug: "statistics-prob",     title_az: "Statistika və Ehtimal",                      title_ru: "Статистика и вероятность",        order_index: 9 },
  ];

  for (const topic of TOPICS6) {
    const t = await prisma.curriculumItem.upsert({
      where:  { grade_id_subject_id_slug: { grade_id: grade6.id, subject_id: math.id, slug: topic.slug } },
      update: {},
      create: { grade_id: grade6.id, subject_id: math.id, ...topic },
    });

    // ── 1. Natural Ədədlər — only class-1/Lesson-1.html exists ──────
    if (topic.slug === "natural-numbers-6") {
      await res(t.id, "darslik-6-1", { type: "LESSON", title_az: "Dərslik — Natural Ədədlər (Fəsil 1)", title_ru: "Учебник — Натуральные числа (Гл. 1)", content_url: P2_6(1, "Lesson-1.html"), metadata: { duration_min: 45 } });
    }

    // ── 2–9: Coming soon (no content yet) ──────────────────────────
    if (topic.slug === "ratio-proportion") {
      await res(t.id, "darslik-6-2", { type: "LESSON", title_az: "Dərslik — Nisbət. Tənasüb. Faizlər (Fəsil 2)", title_ru: "Учебник — Отношение. Пропорция. Проценты (Гл. 2)", metadata: { duration_min: 45 } });
    }
    if (topic.slug === "integers") {
      await res(t.id, "darslik-6-3", { type: "LESSON", title_az: "Dərslik — Tam Ədədlər (Fəsil 3)", title_ru: "Учебник — Целые числа (Гл. 3)", metadata: { duration_min: 45 } });
    }
    if (topic.slug === "coordinate-system") {
      await res(t.id, "darslik-6-4", { type: "LESSON", title_az: "Dərslik — Koordinat Sistemi (Fəsil 4)", title_ru: "Учебник — Система координат (Гл. 4)", metadata: { duration_min: 45 } });
    }
    if (topic.slug === "sets") {
      await res(t.id, "darslik-6-5", { type: "LESSON", title_az: "Dərslik — Çoxluqlar (Fəsil 5)", title_ru: "Учебник — Множества (Гл. 5)", metadata: { duration_min: 45 } });
    }
    if (topic.slug === "expressions-eq") {
      await res(t.id, "darslik-6-6", { type: "LESSON", title_az: "Dərslik — Dəyişəni Olan İfadələr (Fəsil 6)", title_ru: "Учебник — Выражения с переменной (Гл. 6)", metadata: { duration_min: 45 } });
    }
    if (topic.slug === "triangles") {
      await res(t.id, "darslik-6-7", { type: "LESSON", title_az: "Dərslik — Üçbucaqlar (Fəsil 7)", title_ru: "Учебник — Треугольники (Гл. 7)", metadata: { duration_min: 45 } });
    }
    if (topic.slug === "area-volume") {
      await res(t.id, "darslik-6-8", { type: "LESSON", title_az: "Dərslik — Sahə və Həcm (Fəsil 8)", title_ru: "Учебник — Площадь и объём (Гл. 8)", metadata: { duration_min: 45 } });
    }
    if (topic.slug === "statistics-prob") {
      await res(t.id, "darslik-6-9", { type: "LESSON", title_az: "Dərslik — Statistika və Ehtimal (Fəsil 9)", title_ru: "Учебник — Статистика и вероятность (Гл. 9)", metadata: { duration_min: 45 } });
    }
  }

  console.log("✅ Seed tamamlandı — Grade 6 Riyaziyyat: 9 mövzu, resurslar əlavə edildi");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
