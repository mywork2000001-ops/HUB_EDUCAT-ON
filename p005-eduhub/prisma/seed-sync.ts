/**
 * seed-sync.ts — синхронизация P001 (DİM) и P002 (Dərslik) с P005 EduHub
 *
 * СОЗДАЁТ:
 *  • subject "dim-test" (DİM Test Bankı 2025) → Grade 5 — 17 тем, каждая = 1 тест
 *  • Обновляет ресурсы в subject "math" — 8 fəsil × все уроки с правильными URL
 *
 * БЕЗОПАСНО: только upsert, ничего не удаляет.
 * ЗАПУСК: npx tsx prisma/seed-sync.ts
 */

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db      = new PrismaClient({ adapter });

type ResType = "LESSON" | "TEST" | "TAIM_TEST" | "BSQ" | "KSQ" | "WORKBOOK" | "VIDEO";

async function upsertResource(
  curriculum_id: number,
  slug: string,
  type: ResType,
  title_az: string,
  title_ru: string,
  content_url?: string,
  metadata?: Record<string, string | number | boolean>,
) {
  return db.resource.upsert({
    where:  { curriculum_id_slug: { curriculum_id, slug } },
    update: { type, title_az, title_ru, content_url: content_url ?? null,
              metadata: (metadata ?? null) as never, is_published: true },
    create: { curriculum_id, slug, type, title_az, title_ru,
              content_url: content_url ?? null,
              metadata: (metadata ?? null) as never, is_published: true },
  });
}

// ─── URL helpers ──────────────────────────────────────────────────────────────

const P1 = (n: number) =>
  `/api/content/P001_Math_5_DIM/5dim_sinif_testi2025/Lesson-${n}.html`;

const P2 = (ch: number, file: string) =>
  `/api/content/P002_Math_5_Darslik/math-5-class-${ch}/${file}`;

// ─── P001: DİM Test Bankı 2025 ────────────────────────────────────────────────

const P001_LESSONS: { n: number; az: string; ru: string; type: ResType }[] = [
  { n:  1, type: "TEST", az: "Dərs 1 — Təbii ədədlər: yazılış və oxunuş (30 sual)",       ru: "Урок 1 — Нат. числа: запись и чтение (30 вопр.)"        },
  { n:  2, type: "TEST", az: "Dərs 2 — Toplama. Çıxma. Ədədi ifadələr (30 sual)",         ru: "Урок 2 — Сложение. Вычитание. Числовые выражения (30 вопр.)" },
  { n:  3, type: "TEST", az: "Dərs 3 — Vurma. Bölmə. Bölünmə əlamətləri (30 sual)",       ru: "Урок 3 — Умножение. Деление. Признаки делимости (30 вопр.)" },
  { n:  4, type: "TEST", az: "Dərs 4 — Adi kəsrlər. Anlayış (30 sual)",                   ru: "Урок 4 — Обыкновенные дроби. Понятие (30 вопр.)"         },
  { n:  5, type: "TEST", az: "Dərs 5 — Kəsrlərin müqayisəsi (30 sual)",                   ru: "Урок 5 — Сравнение дробей (30 вопр.)"                    },
  { n:  6, type: "TEST", az: "Dərs 6 — Adi kəsrlərin toplanması / çıxılması (30 sual)",   ru: "Урок 6 — Сложение / вычитание обыкн. дробей (30 вопр.)" },
  { n:  7, type: "TEST", az: "Dərs 7 — Adi kəsrlərin vurulması / bölünməsi (30 sual)",    ru: "Урок 7 — Умножение / деление обыкн. дробей (30 вопр.)"  },
  { n:  8, type: "TEST", az: "Dərs 8 — Onluq kəsrlər. Anlayış (30 sual)",                 ru: "Урок 8 — Десятичные дроби. Понятие (30 вопр.)"          },
  { n:  9, type: "TEST", az: "Dərs 9 — Adi ↔ Onluq kəsrlər. Çevrilmə (30 sual)",        ru: "Урок 9 — Перевод обыкн. ↔ десят. дробей (30 вопр.)"    },
  { n: 10, type: "TEST", az: "Dərs 10 — Faizlər (30 sual)",                               ru: "Урок 10 — Проценты (30 вопр.)"                          },
  { n: 11, type: "TEST", az: "Dərs 11 — Nisbət. Tənasüb. Faizlər II (30 sual)",          ru: "Урок 11 — Отношение. Пропорция. Проценты II (30 вопр.)" },
  { n: 12, type: "TEST", az: "Dərs 12 — Tənliklər və bərabərsizliklər (30 sual)",        ru: "Урок 12 — Уравнения и неравенства (30 вопр.)"           },
  { n: 13, type: "TEST", az: "Dərs 13 — Müstəvi fiqurlar. Sahə. Perimetr (30 sual)",     ru: "Урок 13 — Плоские фигуры. Площадь. Периметр (30 вопр.)" },
  { n: 14, type: "TEST", az: "Dərs 14 — Fəza fiqurları. Həcm (30 sual)",                 ru: "Урок 14 — Пространственные фигуры. Объём (30 вопр.)"    },
  { n: 15, type: "TEST", az: "Dərs 15 — Statistika. Diaqramlar (30 sual)",               ru: "Урок 15 — Статистика. Диаграммы (30 вопр.)"             },
  { n: 16, type: "BSQ",  az: "Dərs 16 — BSQ: 2-ci yarımil yekun sınağı (30 sual)",       ru: "Урок 16 — ВПР: итоговый за 2-е полугодие (30 вопр.)"   },
  { n: 17, type: "BSQ",  az: "Dərs 17 — BSQ: İllik yekun sınağı (30 sual)",              ru: "Урок 17 — ВПР: годовой итоговый (30 вопр.)"             },
];

// ─── P002: Riyaziyyat Dərsliyi fəsilləri ──────────────────────────────────────

interface LessonDef { file: string; az: string; ru: string }
interface ChapterDef {
  chapter: number;
  slug: string;
  title_az: string;
  title_ru: string;
  lessons: LessonDef[];
}

const P002_CHAPTERS: ChapterDef[] = [
  {
    chapter: 1, slug: "natural-numbers",
    title_az: "Fəsil 1 — Təbii ədədlər",
    title_ru: "Глава 1 — Натуральные числа",
    lessons: [
      { file: "Lesson-1.html",  az: "Yazılışı və oxunuşu",              ru: "Запись и чтение" },
      { file: "Lesson-2.html",  az: "Müqayisə və sıralama",             ru: "Сравнение и порядок" },
      { file: "Lesson-3.html",  az: "Yuvarlaqlaşdırma",                 ru: "Округление" },
      { file: "Lesson-4.html",  az: "Toplama və çıxma",                 ru: "Сложение и вычитание" },
      { file: "Lesson-5.html",  az: "Kvadrat və kub",                   ru: "Квадрат и куб числа" },
      { file: "Lesson-6.html",  az: "Vurma və bölmə",                   ru: "Умножение и деление" },
      { file: "Lesson-7.html",  az: "Ədədi ifadələr",                   ru: "Числовые выражения" },
      { file: "Lesson-8.html",  az: "Bölənlər və qatlar",               ru: "Делители и кратные" },
      { file: "Lesson-9.html",  az: "ƏBOB və ƏKOB",                     ru: "НОД и НОК" },
      { file: "Lesson-10.html", az: "Ümumiləşdirmə",                    ru: "Обобщение" },
      { file: "Lesson-11.html", az: "Yekun dərs",                       ru: "Итоговый урок" },
    ],
  },
  {
    // class-2 has non-standard filenames: Lesson-6.1, Lesson-6.2, Lesson-6.2-1
    chapter: 2, slug: "fractions",
    title_az: "Fəsil 2 — Adi kəsrlər",
    title_ru: "Глава 2 — Обыкновенные дроби",
    lessons: [
      { file: "Lesson-1.html",    az: "Kəsrin anlayışı",                  ru: "Понятие дроби" },
      { file: "Lesson-2.html",    az: "Kəsrlərin müqayisəsi",             ru: "Сравнение дробей" },
      { file: "Lesson-3.html",    az: "Əsas xassə. Sadələşdirmə",         ru: "Осн. свойство. Сокращение" },
      { file: "Lesson-4.html",    az: "Ortaq məxrəcli kəsrlər",           ru: "Приведение к общему знаменателю" },
      { file: "Lesson-5.html",    az: "Toplama və çıxma",                 ru: "Сложение и вычитание" },
      { file: "Lesson-6.1.html",  az: "Qarışıq ədədlər",                  ru: "Смешанные числа" },
      { file: "Lesson-6.2.html",  az: "Adi kəsrlərin vurulması",          ru: "Умножение обыкновенных дробей" },
      { file: "Lesson-6.2-1.html",az: "Adi kəsrlərin bölünməsi",          ru: "Деление обыкновенных дробей" },
      { file: "Lesson-7.html",    az: "Qarışıq ədədlərin bölünməsi",      ru: "Деление смешанных чисел" },
      { file: "Lesson-8.html",    az: "Ədədin hissəsini tapmaq",          ru: "Нахождение части числа" },
      { file: "Lesson-9.html",    az: "Ədədi hissəsinə görə tapmaq",      ru: "Нахождение числа по его части" },
      { file: "Lesson-10.html",   az: "Birgə əməllər",                    ru: "Совместные действия" },
      { file: "Lesson-11.html",   az: "Söz məsələləri",                   ru: "Текстовые задачи" },
      { file: "Lesson-12.html",   az: "Ümumiləşdirmə",                    ru: "Обобщение" },
      { file: "Lesson-13.html",   az: "Yekun dərs — 1",                   ru: "Итоговый урок — 1" },
      { file: "Lesson-14.html",   az: "Yekun dərs — 2",                   ru: "Итоговый урок — 2" },
    ],
  },
  {
    chapter: 3, slug: "decimal-fractions",
    title_az: "Fəsil 3 — Onluq kəsrlər",
    title_ru: "Глава 3 — Десятичные дроби",
    lessons: [
      { file: "Lesson-1.html",  az: "Anlayış. Yazılış və oxunuş",       ru: "Понятие. Запись и чтение" },
      { file: "Lesson-2.html",  az: "Müqayisə",                         ru: "Сравнение" },
      { file: "Lesson-3.html",  az: "Onluq kəsrlərin müqayisəsi",       ru: "Сравнение десятичных дробей" },
      { file: "Lesson-4.html",  az: "Adi ↔ Onluq çevrilmə",            ru: "Перевод обыкн. ↔ десят." },
      { file: "Lesson-5.html",  az: "Toplama",                           ru: "Сложение" },
      { file: "Lesson-6.html",  az: "Çıxma",                             ru: "Вычитание" },
      { file: "Lesson-7.html",  az: "Onluq kəsrlərin çıxılması",        ru: "Вычитание десятичных дробей" },
      { file: "Lesson-8.html",  az: "Vurma ümumi qaydası",               ru: "Умножение — общее правило" },
      { file: "Lesson-9.html",  az: "× 10, 100, 1000",                  ru: "Умножение на 10, 100, 1000" },
      { file: "Lesson-10.html", az: "Vurma — 1",                         ru: "Умножение — 1" },
      { file: "Lesson-11.html", az: "Vurma — 2",                         ru: "Умножение — 2" },
      { file: "Lesson-12.html", az: "Bölmə — 1",                         ru: "Деление — 1" },
      { file: "Lesson-13.html", az: "Bölmə — 2",                         ru: "Деление — 2" },
      { file: "Lesson-14.html", az: "Adi kəsrə vurma/bölmə",            ru: "Умножение/деление на обыкн." },
      { file: "Lesson-15.html", az: "Ümumiləşdirmə",                     ru: "Обобщение" },
      { file: "Lesson-16.html", az: "Yekun dərs",                        ru: "Итоговый урок" },
    ],
  },
  {
    chapter: 4, slug: "percentages",
    title_az: "Fəsil 4 — Faizlər",
    title_ru: "Глава 4 — Проценты",
    lessons: [
      { file: "Lesson-1.html", az: "Faiz anlayışı",                      ru: "Понятие процента" },
      { file: "Lesson-2.html", az: "Ədədin faizini tapmaq",              ru: "Нахождение процента числа" },
      { file: "Lesson-3.html", az: "Ədədi faizinə görə tapmaq",          ru: "Нахождение числа по проценту" },
      { file: "Lesson-4.html", az: "Faiz artımı/azalması",               ru: "Процентное увеличение/уменьшение" },
      { file: "Lesson-5.html", az: "Faizlə bağlı məsələlər — 1",        ru: "Задачи на проценты — 1" },
      { file: "Lesson-6.html", az: "Faizlə bağlı məsələlər — 2",        ru: "Задачи на проценты — 2" },
      { file: "Lesson-7.html", az: "Nisbət və tənasüb",                  ru: "Отношение и пропорция" },
      { file: "Lesson-8.html", az: "Ümumiləşdirmə",                      ru: "Обобщение" },
      { file: "Lesson-9.html", az: "Yekun dərs",                         ru: "Итоговый урок" },
    ],
  },
  {
    chapter: 5, slug: "proportions",
    title_az: "Fəsil 5 — İfadələr. Tənliklər. Bərabərsizliklər",
    title_ru: "Глава 5 — Выражения. Уравнения. Неравенства",
    lessons: [
      { file: "Lesson-1.html",  az: "Ədədi ifadə. Dəyişən",             ru: "Числовое выражение. Переменная" },
      { file: "Lesson-2.html",  az: "Dəyişənli ifadə",                   ru: "Выражение с переменной" },
      { file: "Lesson-3.html",  az: "Tənlik anlayışı",                   ru: "Понятие уравнения" },
      { file: "Lesson-4.html",  az: "Sadə tənliklərin həlli",            ru: "Решение простых уравнений" },
      { file: "Lesson-5.html",  az: "Mürəkkəb tənliklər",               ru: "Сложные уравнения" },
      { file: "Lesson-6.html",  az: "Tənliklə məsələ həlli",            ru: "Решение задач через уравнение" },
      { file: "Lesson-7.html",  az: "Bərabərsizlik anlayışı",           ru: "Понятие неравенства" },
      { file: "Lesson-8.html",  az: "Bərabərsizliklərin həlli",         ru: "Решение неравенств" },
      { file: "Lesson-9.html",  az: "Birgə məsələlər",                  ru: "Комплексные задачи" },
      { file: "Lesson-10.html", az: "Funksiya anlayışı",                 ru: "Понятие функции" },
      { file: "Lesson-11.html", az: "Ümumiləşdirmə",                     ru: "Обобщение" },
      { file: "Lesson-12.html", az: "Yekun dərs",                        ru: "Итоговый урок" },
    ],
  },
  {
    chapter: 6, slug: "geometry-basics",
    title_az: "Fəsil 6 — Müstəvi fiqurlar",
    title_ru: "Глава 6 — Плоские фигуры",
    lessons: [
      { file: "Lesson-1.html",  az: "Nöqtə. Xətt. Bucaq",              ru: "Точка. Прямая. Угол" },
      { file: "Lesson-2.html",  az: "Bucaqların növləri",               ru: "Виды углов" },
      { file: "Lesson-3.html",  az: "Üçbucaq",                          ru: "Треугольник" },
      { file: "Lesson-4.html",  az: "Üçbucağın növləri",               ru: "Виды треугольников" },
      { file: "Lesson-5.html",  az: "Dördbucaqlılar",                  ru: "Четырёхугольники" },
      { file: "Lesson-6.html",  az: "Düzbucaqlı. Perimetr",            ru: "Прямоугольник. Периметр" },
      { file: "Lesson-7.html",  az: "Sahə anlayışı",                   ru: "Понятие площади" },
      { file: "Lesson-8.html",  az: "Dairə. Çevrə",                    ru: "Круг. Окружность" },
      { file: "Lesson-9.html",  az: "Ümumiləşdirmə",                   ru: "Обобщение" },
      { file: "Lesson-10.html", az: "Yekun dərs",                       ru: "Итоговый урок" },
    ],
  },
  {
    chapter: 7, slug: "area-perimeter",
    title_az: "Fəsil 7 — Fəza fiqurları",
    title_ru: "Глава 7 — Пространственные фигуры",
    lessons: [
      { file: "Lesson-1.html",  az: "Düzbucaqlı paralelepipped",        ru: "Прямоугольный параллелепипед" },
      { file: "Lesson-2.html",  az: "Kub",                              ru: "Куб" },
      { file: "Lesson-3.html",  az: "Silindr",                          ru: "Цилиндр" },
      { file: "Lesson-4.html",  az: "Konus",                            ru: "Конус" },
      { file: "Lesson-5.html",  az: "Kürə",                             ru: "Шар" },
      { file: "Lesson-6.html",  az: "Həcm anlayışı",                   ru: "Понятие объёма" },
      { file: "Lesson-7.html",  az: "Həcm hesablanması — 1",           ru: "Вычисление объёма — 1" },
      { file: "Lesson-8.html",  az: "Həcm hesablanması — 2",           ru: "Вычисление объёма — 2" },
      { file: "Lesson-9.html",  az: "Görünüş. Kəsik",                 ru: "Проекции. Сечения" },
      { file: "Lesson-10.html", az: "Ümumiləşdirmə",                   ru: "Обобщение" },
      { file: "Lesson-11.html", az: "Yekun dərs",                       ru: "Итоговый урок" },
    ],
  },
  {
    chapter: 8, slug: "negative-numbers",
    title_az: "Fəsil 8 — Statistika və məlumatların təsviri",
    title_ru: "Глава 8 — Статистика и представление данных",
    lessons: [
      { file: "Lesson-1.html", az: "Orta hesabi",                       ru: "Среднее арифметическое" },
      { file: "Lesson-2.html", az: "Diaqramlar — çubuq, sektor",        ru: "Диаграммы — столбчатая, секторная" },
      { file: "Lesson-3.html", az: "Qrafiklər",                         ru: "Графики" },
      { file: "Lesson-4.html", az: "Məlumatların toplanması",           ru: "Сбор данных" },
      { file: "Lesson-5.html", az: "Yekun dərs",                        ru: "Итоговый урок" },
    ],
  },
];

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  const grade5 = await db.grade.findUniqueOrThrow({ where: { number: 5 } });
  const math   = await db.subject.findUniqueOrThrow({ where: { slug: "math" } });

  // ── 1. P001: Create/ensure "DİM Test Bankı 2025" subject ──────────────────
  console.log("\n📊 P001: DİM Test Bankı 2025 — creating subject and 17 topics…");

  const dimSubj = await db.subject.upsert({
    where:  { slug: "dim-test" },
    update: { label_az: "DİM Test Bankı 2025", label_ru: "ДИМ Банк тестов 2025", icon: "📊" },
    create: { slug: "dim-test", label_az: "DİM Test Bankı 2025", label_ru: "ДИМ Банк тестов 2025", icon: "📊" },
  });

  await db.gradeSubject.upsert({
    where:  { grade_id_subject_id: { grade_id: grade5.id, subject_id: dimSubj.id } },
    update: {},
    create: { grade_id: grade5.id, subject_id: dimSubj.id },
  });

  let dimCount = 0;
  for (const lesson of P001_LESSONS) {
    const slug = `dim-lesson-${lesson.n}`;
    const item = await db.curriculumItem.upsert({
      where:  { grade_id_subject_id_slug: { grade_id: grade5.id, subject_id: dimSubj.id, slug } },
      update: { title_az: lesson.az, title_ru: lesson.ru, order_index: lesson.n },
      create: { grade_id: grade5.id, subject_id: dimSubj.id, slug,
                title_az: lesson.az, title_ru: lesson.ru, order_index: lesson.n },
    });

    await upsertResource(
      item.id, "test-file", lesson.type,
      lesson.az, lesson.ru,
      P1(lesson.n),
      { questions_count: 30, duration_min: 30 },
    );
    dimCount++;
  }
  console.log(`  ✓ DİM Test Bankı: ${dimCount} dərs əlavə edildi / yeniləndi`);

  // ── 2. P002: Update "math" topics + add individual lesson resources ─────────
  console.log("\n📚 P002: Riyaziyyat Dərsliyi — updating chapters with individual lessons…");

  let p002Total = 0;

  for (const ch of P002_CHAPTERS) {
    // Update the existing topic title to match chapter format
    const topic = await db.curriculumItem.upsert({
      where:  { grade_id_subject_id_slug: { grade_id: grade5.id, subject_id: math.id, slug: ch.slug } },
      update: { title_az: ch.title_az, title_ru: ch.title_ru },
      create: { grade_id: grade5.id, subject_id: math.id, slug: ch.slug,
                title_az: ch.title_az, title_ru: ch.title_ru, order_index: ch.chapter },
    });

    // Upsert chapter index (overview page)
    await upsertResource(
      topic.id, `p2-ch${ch.chapter}-index`, "LESSON",
      `${ch.title_az} — İcmal`,
      `${ch.title_ru} — Обзор`,
      P2(ch.chapter, "index.html"),
      { is_chapter_index: true },
    );

    // Upsert each individual lesson with correct filename
    for (let i = 0; i < ch.lessons.length; i++) {
      const lesson = ch.lessons[i];
      const n = i + 1;
      // slug is safe: replace dots with dash for Lesson-6.1, 6.2, 6.2-1
      const resSlug = `p2-c${ch.chapter}-l${lesson.file.replace("Lesson-", "").replace(".html", "").replace(/\./g, "-")}`;
      const titleAz = `Fəsil ${ch.chapter} · Dərs ${n}: ${lesson.az}`;
      const titleRu = `Гл. ${ch.chapter} · Урок ${n}: ${lesson.ru}`;

      await upsertResource(
        topic.id, resSlug, "LESSON",
        titleAz, titleRu,
        P2(ch.chapter, lesson.file),
        { chapter: ch.chapter, lesson: n, duration_min: 40 },
      );
      p002Total++;
    }

    console.log(`  ✓ ${ch.title_az}: ${ch.lessons.length} dərs`);
  }

  console.log(`  → P002 total: ${p002Total} individual lesson resources synced`);

  // ── 3. Summary ────────────────────────────────────────────────────────────
  console.log(`
✅ seed-sync.ts COMPLETE

  Grade 5 predmetlər:
  ┌─────────────────────────────────────┬────────────────┬─────────┐
  │ Predmet                             │ Slug           │ Say     │
  ├─────────────────────────────────────┼────────────────┼─────────┤
  │ 📊 DİM Test Bankı 2025              │ dim-test       │ 17 dərs │
  │ 📐 Riyaziyyat Dərsliyi (P002)       │ math           │ 8 fəsil │
  │ 📝 Blok İmtahan (P003)              │ block-exam     │ 28 mövzu│
  │ 🎓 TAİM 2026 (P004)                 │ taim-2026      │ 47 test │
  └─────────────────────────────────────┴────────────────┴─────────┘
`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
