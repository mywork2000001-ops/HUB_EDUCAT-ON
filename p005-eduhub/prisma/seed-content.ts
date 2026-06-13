/**
 * seed-content.ts — расширенный seed для интеграции P001–P004 контента в P005 EduHub
 *
 * Добавляет:
 *   • P002-5: 90 индивидуальных уроков (Fəsil 1–8 × Dərs 1–N) в Grade 5 Riyaziyyat
 *   • P003:   28 тем Blok İmtahan как новый предмет под Grade 5
 *   • P004:   47 TAİM тестов как новый предмет под специальный Grade "TAİM"
 *
 * Запуск: npx tsx prisma/seed-content.ts
 */

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db      = new PrismaClient({ adapter });

type ResType = "LESSON" | "TEST" | "TAIM_TEST" | "BSQ" | "KSQ" | "WORKBOOK" | "VIDEO";

async function res(
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
    update: { type, title_az, title_ru, content_url: content_url ?? null, metadata: (metadata ?? null) as never },
    create: { curriculum_id, slug, type, title_az, title_ru, content_url: content_url ?? null,
              metadata: (metadata ?? null) as never, is_published: true },
  });
}

// ─── URL helpers ─────────────────────────────────────────────────────────────

const P1  = (n: number) => `/api/content/P001_Math_5_DIM/5dim_sinif_testi2025/Lesson-${n}.html`;
const P2  = (ch: number, file = "index.html") => `/api/content/P002_Math_5_Darslik/math-5-class-${ch}/${file}`;
const P2L = (ch: number, n: number) => P2(ch, `Lesson-${n}.html`);
const P3T = (n: number) => `/api/content/P003_Block_Exam/app/public/lessons/topics/topic-${String(n).padStart(2,"0")}.html`;
const P3X = (file: string) => `/api/content/P003_Block_Exam/app/public/lessons/tests/${file}`;
const P4  = (file: string) => `/api/content/P004_TAIM_2026/${file}`;

// ─── P002-5 chapter data ──────────────────────────────────────────────────────

const CHAPTERS_5 = [
  {
    chapter: 1, topicSlug: "natural-numbers", lessonCount: 11,
    fəsilAz: "Təbii ədədlər", fəsilRu: "Натуральные числа",
    lessons: [
      ["Yazılışı və oxunuşu",                "Запись и чтение"],
      ["Müqayisə və sıralama",               "Сравнение и порядок"],
      ["Yuvarlaqlaşdırma",                   "Округление"],
      ["Toplama və çıxma",                   "Сложение и вычитание"],
      ["Natural ədədin kvadratı və kubu",    "Квадрат и куб числа"],
      ["Vurma və bölmə",                     "Умножение и деление"],
      ["Ədədi ifadələr",                     "Числовые выражения"],
      ["Bölənlər və qatlar",                 "Делители и кратные"],
      ["ƏBOB və ƏKOB",                       "НОД и НОК"],
      ["Ümumiləşdirmə",                      "Обобщение"],
      ["Yekun dərs",                         "Итоговый урок"],
    ],
  },
  {
    chapter: 2, topicSlug: "fractions", lessonCount: 16,
    fəsilAz: "Adi kəsrlər", fəsilRu: "Обыкновенные дроби",
    lessons: [
      ["Kəsrin anlayışı",                    "Понятие дроби"],
      ["Kəsrlərin müqayisəsi",               "Сравнение дробей"],
      ["Əsas xassə. Sadələşdirmə",           "Осн. свойство. Сокращение"],
      ["Ортaq məxrəcli kəsrlər",             "Приведение к общему знаменателю"],
      ["Toplama və çıxma",                   "Сложение и вычитание"],
      ["Qarışıq ədədlər",                    "Смешанные числа"],
      ["Adi kəsrlərin vurulması",            "Умножение обыкновенных дробей"],
      ["Adi kəsrlərin bölünməsi",            "Деление обыкновенных дробей"],
      ["Qarışıq ədədlərin bölünməsi",        "Деление смешанных чисел"],
      ["Ədədin hissəsini tapmaq",            "Нахождение части числа"],
      ["Ədədi hissəsinə görə tapmaq",        "Нахождение числа по его части"],
      ["Birgə əməllər",                      "Совместные действия"],
      ["Söz məsələləri",                     "Текстовые задачи"],
      ["Ümumiləşdirmə",                      "Обобщение"],
      ["Yekun dərs — 1",                     "Итоговый урок — 1"],
      ["Yekun dərs — 2",                     "Итоговый урок — 2"],
    ],
  },
  {
    chapter: 3, topicSlug: "decimal-fractions", lessonCount: 16,
    fəsilAz: "Onluq kəsrlər", fəsilRu: "Десятичные дроби",
    lessons: [
      ["Anlayış. Yazılış və oxunuş",         "Понятие. Запись и чтение"],
      ["Müqayisə",                           "Сравнение"],
      ["Onluq kəsrlərin müqayisəsi",         "Сравнение десятичных дробей"],
      ["Adi ↔ Onluq çevrilmə",              "Перевод обыкн. ↔ десят."],
      ["Toplama",                            "Сложение"],
      ["Çıxma",                              "Вычитание"],
      ["Onluq kəsrlərin çıxılması",          "Вычитание десятичных дробей"],
      ["Vurma ümumi qaydası",                "Умножение — общее правило"],
      ["× 10, 100, 1000",                    "Умножение на 10, 100, 1000"],
      ["Vurma — 1",                          "Умножение — 1"],
      ["Vurma — 2",                          "Умножение — 2"],
      ["Bölmə — 1",                          "Деление — 1"],
      ["Bölmə — 2",                          "Деление — 2"],
      ["Adi kəsrə vurma/bölmə",             "Умножение/деление на обыкн."],
      ["Ümumiləşdirmə",                      "Обобщение"],
      ["Yekun dərs",                         "Итоговый урок"],
    ],
  },
  {
    chapter: 4, topicSlug: "percentages", lessonCount: 9,
    fəsilAz: "Faizlər", fəsilRu: "Проценты",
    lessons: [
      ["Faiz anlayışı",                      "Понятие процента"],
      ["Ədədin faizini tapmaq",              "Нахождение процента числа"],
      ["Ədədi faizinə görə tapmaq",          "Нахождение числа по проценту"],
      ["Faiz artımı/azalması",               "Процентное увеличение/уменьшение"],
      ["Faizlə bağlı məsələlər — 1",        "Задачи на проценты — 1"],
      ["Faizlə bağlı məsələlər — 2",        "Задачи на проценты — 2"],
      ["Nisbət və tənasüb",                  "Отношение и пропорция"],
      ["Ümumiləşdirmə",                      "Обобщение"],
      ["Yekun dərs",                         "Итоговый урок"],
    ],
  },
  {
    chapter: 5, topicSlug: "proportions", lessonCount: 12,
    fəsilAz: "İfadələr. Tənliklər. Bərabərsizliklər", fəsilRu: "Выражения. Уравнения. Неравенства",
    lessons: [
      ["Ədədi ifadə. Dəyişən",              "Числовое выражение. Переменная"],
      ["Dəyişənli ifadə",                    "Выражение с переменной"],
      ["Tənlik anlayışı",                    "Понятие уравнения"],
      ["Sadə tənliklərin həlli",             "Решение простых уравнений"],
      ["Mürəkkəb tənliklər",                "Сложные уравнения"],
      ["Tənliklə məsələ həlli",             "Решение задач через уравнение"],
      ["Bərabərsizlik anlayışı",            "Понятие неравенства"],
      ["Bərabərsizliklərin həlli",          "Решение неравенств"],
      ["Birgə məsələlər",                   "Комплексные задачи"],
      ["Funksiya anlayışı",                  "Понятие функции"],
      ["Ümumiləşdirmə",                      "Обобщение"],
      ["Yekun dərs",                         "Итоговый урок"],
    ],
  },
  {
    chapter: 6, topicSlug: "geometry-basics", lessonCount: 10,
    fəsilAz: "Müstəvi fiqurlar", fəsilRu: "Плоские фигуры",
    lessons: [
      ["Nöqtə. Xətt. Bucaq",                "Точка. Прямая. Угол"],
      ["Bucaqların növləri",                  "Виды углов"],
      ["Üçbucaq",                            "Треугольник"],
      ["Üçbucağın növləri",                  "Виды треугольников"],
      ["Dördbucaqlılar",                     "Четырёхугольники"],
      ["Düzbucaqlı. Perimetr",               "Прямоугольник. Периметр"],
      ["Sahə anlayışı",                      "Понятие площади"],
      ["Dairə. Çevrə",                       "Круг. Окружность"],
      ["Ümumiləşdirmə",                      "Обобщение"],
      ["Yekun dərs",                         "Итоговый урок"],
    ],
  },
  {
    chapter: 7, topicSlug: "area-perimeter", lessonCount: 11,
    fəsilAz: "Fəza fiqurları", fəsilRu: "Пространственные фигуры",
    lessons: [
      ["Düzbucaqlı paralelepipped",          "Прямоугольный параллелепипед"],
      ["Kub",                                "Куб"],
      ["Silindr",                            "Цилиндр"],
      ["Konus",                              "Конус"],
      ["Kürə",                               "Шар"],
      ["Həcm anlayışı",                      "Понятие объёма"],
      ["Həcm hesablanması — 1",             "Вычисление объёма — 1"],
      ["Həcm hesablanması — 2",             "Вычисление объёма — 2"],
      ["Görünüş. Kəsik",                    "Проекции. Сечения"],
      ["Ümumiləşdirmə",                      "Обобщение"],
      ["Yekun dərs",                         "Итоговый урок"],
    ],
  },
  {
    chapter: 8, topicSlug: "negative-numbers", lessonCount: 5,
    fəsilAz: "Statistika və məlumatların təsviri", fəsilRu: "Статистика и представление данных",
    lessons: [
      ["Orta hesabi",                        "Среднее арифметическое"],
      ["Diaqramlar — çubuq, sektor",         "Диаграммы — столбчатая, секторная"],
      ["Qrafiklər",                          "Графики"],
      ["Məlumatların toplanması",            "Сбор данных"],
      ["Yekun dərs",                         "Итоговый урок"],
    ],
  },
];

// ─── P003 Block İmtahan topics ────────────────────────────────────────────────

const P003_TOPICS = [
  { n:  1, az: "Natural Ədədlər",                     ru: "Натуральные числа"                      },
  { n:  2, az: "Çoxluqlar",                            ru: "Множества"                              },
  { n:  3, az: "Adi və Onluq Kəsirlər",               ru: "Обыкновенные и десятичные дроби"        },
  { n:  4, az: "Həndəsənin Əsas Anlayışları",         ru: "Основные понятия геометрии"             },
  { n:  5, az: "Nisbət. Tənasüb. Faiz",               ru: "Отношение. Пропорция. Процент"          },
  { n:  6, az: "Həqiqi Ədədlər. Üstlər. Kvadrat Kök", ru: "Реальные числа. Степени. Корни"         },
  { n:  7, az: "Üçbucaqlar",                           ru: "Треугольники"                           },
  { n:  8, az: "Rasional İfadələr",                   ru: "Рациональные выражения"                 },
  { n:  9, az: "Birməchullu Tənliklər",               ru: "Уравнения с одним неизвестным"          },
  { n: 10, az: "Tənliklər Sistemi",                   ru: "Системы уравнений"                      },
  { n: 11, az: "Çevrə",                               ru: "Окружность"                             },
  { n: 12, az: "Bərabərsizliklər",                    ru: "Неравенства"                            },
  { n: 13, az: "Ədədi Ardıcıllıqlar. Silsilələr",     ru: "Числовые последовательности"            },
  { n: 14, az: "Çoxbucaqlılar",                       ru: "Многоугольники"                         },
  { n: 15, az: "Dördbucaqlılar",                      ru: "Четырёхугольники"                       },
  { n: 16, az: "Funksiyalar",                         ru: "Функции"                                },
  { n: 17, az: "Triqonometrik Funksiyalar",           ru: "Тригонометрические функции"             },
  { n: 18, az: "Loqarifmlər",                         ru: "Логарифмы"                              },
  { n: 19, az: "Eksponensial Tənliklər",              ru: "Показательные уравнения"                },
  { n: 20, az: "Loqarifmik Tənliklər",               ru: "Логарифмические уравнения"              },
  { n: 21, az: "Kombinatorika",                       ru: "Комбинаторика"                          },
  { n: 22, az: "Ehtimal Nəzəriyyəsi",                ru: "Теория вероятностей"                    },
  { n: 23, az: "Statistika",                          ru: "Статистика"                             },
  { n: 24, az: "Vektorlar",                           ru: "Векторы"                                },
  { n: 25, az: "Koordinat Üsulu",                     ru: "Координатный метод"                     },
  { n: 26, az: "Törəmə",                              ru: "Производная"                            },
  { n: 27, az: "İntegral",                            ru: "Интеграл"                               },
  { n: 28, az: "Yekun Təkrar — DİM Hazırlıq",        ru: "Итоговое повторение — подготовка к ДИМ" },
];

// ─── P003 Block İmtahan tests ─────────────────────────────────────────────────

const P003_TESTS = [
  { slug: "p1-s01-t1", az: "Test 1 — Natural ədədlər: onluq say sistemi (30 sual)",    ru: "Тест 1 — Натуральные числа: десятичная система (30 вопр.)", file: "p1-s01-t1.html" },
  { slug: "p1-s01-t2", az: "Test 2 — Natural ədədlər: əməllər (30 sual)",              ru: "Тест 2 — Натуральные числа: действия (30 вопр.)",            file: "p1-s01-t2.html" },
  { slug: "p1-s01-t3", az: "Test 3 — Bölünmə əlamətləri. Qalıqlı bölmə (30 sual)",    ru: "Тест 3 — Признаки делимости. Деление с остатком (30 вопр.)", file: "p1-s01-t3.html" },
  { slug: "p1-s01-t4", az: "Test 4 — Sadə vuruqlar. ƏBOB. ƏKOB (30 sual)",            ru: "Тест 4 — Простые множители. НОД. НОК (30 вопр.)",            file: "p1-s01-t4.html" },
];

// ─── P004 TAİM tests ──────────────────────────────────────────────────────────

const P004_BOLME = [
  {
    slug: "hüquqi",     az: "I Bölmə: Hüquqi Savadlılıq",     ru: "Раздел I: Правовая грамотность",
    tests: [
      { n: 1, az: "1.1.1–1.1.4 Hüquqi savadlılıq",           ru: "Правовая грамотность" },
    ],
  },
  {
    slug: "metodiki",   az: "II Bölmə: Metodiki Savadlılıq",   ru: "Раздел II: Методическая грамотность",
    tests: [
      { n:  2, az: "2.1.1 İnteqrasiya",                       ru: "Интеграция" },
      { n:  3, az: "2.1.2 XXI əsrin kompetensiyaları",        ru: "Компетенции XXI века" },
      { n:  4, az: "2.1.3 Təfəkkürün növləri",               ru: "Виды мышления" },
      { n:  5, az: "2.1.4 Metakognitiv bacarıqlar",          ru: "Метакогнитивные навыки" },
      { n:  6, az: "2.1.5 Bilik növləri",                    ru: "Виды знаний" },
      { n:  7, az: "2.1.6 Blumun taksonomiyası",             ru: "Таксономия Блума" },
      { n:  8, az: "2.1.7 Webb Dərin bilik səviyyələri",     ru: "Уровни Вебба" },
      { n:  9, az: "2.1.8 Tədrisin forma və modelləri",      ru: "Формы и модели обучения" },
      { n: 10, az: "2.1.9 Strategiya və texnikalar",         ru: "Стратегии и техники" },
      { n: 11, az: "2.1.10 Fərqli öyrənmə",                 ru: "Дифференцированное обучение" },
      { n: 12, az: "2.1.11 Formativ qiymətləndirmə",        ru: "Формативное оценивание" },
      { n: 13, az: "2.1.12 Standartlara əsaslanan tədris",  ru: "Обучение на основе стандартов" },
      { n: 14, az: "2.1.13 Fənlərarası əlaqə",              ru: "Межпредметные связи" },
      { n: 15, az: "2.1.14 Layihə əsaslı öyrənmə",         ru: "Проектное обучение" },
      { n: 16, az: "2.1.15 Problemə əsaslanan öyrənmə",    ru: "Проблемное обучение" },
      { n: 17, az: "2.1.16 Kooperativ öyrənmə",            ru: "Кооперативное обучение" },
      { n: 18, az: "2.1.17 Aktiv öyrənmə texnikaları",     ru: "Техники активного обучения" },
      { n: 19, az: "2.1.18 Rəqəmsal texnologiyalar",       ru: "Цифровые технологии" },
      { n: 20, az: "2.1.19 STEAM təhsili",                 ru: "STEAM-образование" },
      { n: 21, az: "2.1.20 Inklüziv təhsil",              ru: "Инклюзивное образование" },
      { n: 22, az: "2.1.21 Ev tapşırıqları",              ru: "Домашние задания" },
      { n: 23, az: "2.1.22 Dərs planının hazırlanması",   ru: "Составление плана урока" },
      { n: 24, az: "2.1.23 Sinif menecmenti",             ru: "Управление классом" },
      { n: 25, az: "2.1.24 Emosional intellekt",          ru: "Эмоциональный интеллект" },
      { n: 26, az: "2.1.25 Kommunikasiya bacarıqları",    ru: "Коммуникативные навыки" },
      { n: 27, az: "2.1.26 Peşəkar inkişaf",              ru: "Профессиональное развитие" },
      { n: 28, az: "2.1.27 Tədqiqatçı müəllim",          ru: "Учитель-исследователь" },
      { n: 29, az: "2.1.28 Mentorluq",                   ru: "Наставничество" },
      { n: 30, az: "2.1.29–2.1.30 Qiymətləndirmə metodları", ru: "Методы оценивания" },
    ],
  },
  {
    slug: "pedaqoji", az: "III Bölmə: Pedaqoji Savadlılıq",  ru: "Раздел III: Педагогическая грамотность",
    tests: [
      { n: 31, az: "3.1 Psixi inkişaf teoriyaları",        ru: "Теории психического развития" },
      { n: 32, az: "3.2 Gardner — Çoxsaylı intellektlər",  ru: "Гарднер — Множественный интеллект" },
      { n: 33, az: "3.3 Piaget — İdrak inkişafı",          ru: "Пиаже — Когнитивное развитие" },
      { n: 34, az: "3.4 Vygotsky — Proksimal inkişaf",     ru: "Выготский — Зона ближайшего развития" },
      { n: 35, az: "3.5 SEL — Sosial-emosional öyrənmə",  ru: "SEL — Социально-эмоциональное обучение" },
      { n: 36, az: "3.6 Zorakılığın qarşısının alınması", ru: "Профилактика буллинга" },
      { n: 37, az: "3.7 Xüsusi ehtiyaclı uşaqlar",       ru: "Дети с особыми потребностями" },
      { n: 38, az: "3.8 Ailə-məktəb əlaqəsi",            ru: "Связь семьи и школы" },
    ],
  },
];

const P004_SINAQ = [
  { slug: "fs1", file: "test-fs1.html", az: "Fəsil Sınağı 1 — Hüquqi + Metodiki 1-10",   ru: "Главный тест 1 — Право + Методика 1-10" },
  { slug: "fs2", file: "test-fs2.html", az: "Fəsil Sınağı 2 — Metodiki 11-20",            ru: "Главный тест 2 — Методика 11-20" },
  { slug: "fs3", file: "test-fs3.html", az: "Fəsil Sınağı 3 — Metodiki 21-30",            ru: "Главный тест 3 — Методика 21-30" },
  { slug: "fs4", file: "test-fs4.html", az: "Fəsil Sınağı 4 — Pedaqoji 31-35",            ru: "Главный тест 4 — Педагогика 31-35" },
  { slug: "fs5", file: "test-fs5.html", az: "Fəsil Sınağı 5 — Pedaqoji 36-38",            ru: "Главный тест 5 — Педагогика 36-38" },
  { slug: "fs6", file: "test-fs6.html", az: "Fəsil Sınağı 6 — Qarışıq (Bölmə I+II)",     ru: "Главный тест 6 — Смешанный (Разделы I+II)" },
];

const P004_UMUMI = [
  { slug: "us1", file: "test-us1.html", az: "Ümumi Sınaq 1 — 50 sual",  ru: "Итоговый тест 1 — 50 вопросов" },
  { slug: "us2", file: "test-us2.html", az: "Ümumi Sınaq 2 — 50 sual",  ru: "Итоговый тест 2 — 50 вопросов" },
  { slug: "us3", file: "test-us3.html", az: "Ümumi Sınaq 3 — 50 sual",  ru: "Итоговый тест 3 — 50 вопросов" },
];

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  // ── Resolve existing grades & subjects ──────────────────────────────────────
  const grade5 = await db.grade.findUniqueOrThrow({ where: { number: 5 } });
  const grade6 = await db.grade.findUniqueOrThrow({ where: { number: 6 } });
  const math   = await db.subject.findUniqueOrThrow({ where: { slug: "math" } });

  // ── 1. P002-5: Add individual lessons to existing Grade 5 topics ───────────
  console.log("\n📚 P002-5: Adding individual lesson resources…");
  let lessonCount = 0;

  for (const ch of CHAPTERS_5) {
    const topic = await db.curriculumItem.findUnique({
      where: { grade_id_subject_id_slug: { grade_id: grade5.id, subject_id: math.id, slug: ch.topicSlug } },
    });
    if (!topic) { console.warn(`  ⚠️  Topic not found: ${ch.topicSlug}`); continue; }

    for (let i = 0; i < ch.lessonCount; i++) {
      const n   = i + 1;
      const [az, ru] = ch.lessons[i] ?? [`Dərs ${n}`, `Урок ${n}`];
      await res(
        topic.id,
        `p2-c${ch.chapter}-l${n}`,
        "LESSON",
        `Fəsil ${ch.chapter} · Dərs ${n}: ${az}`,
        `Гл. ${ch.chapter} · Урок ${n}: ${ru}`,
        P2L(ch.chapter, n),
        { duration_min: 40, chapter: ch.chapter, lesson: n },
      );
      lessonCount++;
    }
    console.log(`  ✓ ${ch.fəsilAz} (Fəsil ${ch.chapter}): ${ch.lessonCount} dərs`);
  }
  console.log(`  → ${lessonCount} individual lesson resources added to Grade 5 Riyaziyyat`);

  // ── 2. P003: Blok İmtahan subject + 28 topics ──────────────────────────────
  console.log("\n📝 P003: Setting up Blok İmtahan…");

  const blockExam = await db.subject.upsert({
    where:  { slug: "block-exam" },
    update: {},
    create: { slug: "block-exam", label_az: "Blok İmtahan", label_ru: "Блок-экзамен", icon: "📝" },
  });

  // Link to Grade 5 (block exam prep is typically Grade 5–9 level overview)
  await db.gradeSubject.upsert({
    where:  { grade_id_subject_id: { grade_id: grade5.id, subject_id: blockExam.id } },
    update: {},
    create: { grade_id: grade5.id, subject_id: blockExam.id },
  });

  for (const tp of P003_TOPICS) {
    const slug = `blok-topic-${String(tp.n).padStart(2, "0")}`;
    const item = await db.curriculumItem.upsert({
      where:  { grade_id_subject_id_slug: { grade_id: grade5.id, subject_id: blockExam.id, slug } },
      update: {},
      create: {
        grade_id: grade5.id, subject_id: blockExam.id,
        slug, title_az: tp.az, title_ru: tp.ru, order_index: tp.n,
      },
    });

    await res(item.id, "topic-page", "LESSON",
      `Mövzu ${tp.n} — ${tp.az}`, `Тема ${tp.n} — ${tp.ru}`,
      P3T(tp.n), { topic_number: tp.n },
    );
  }
  console.log(`  ✓ 28 Blok İmtahan topics created under Grade 5`);

  // Add P003 tests (4 unlocked) to Topic 1 (Natural Numbers)
  const t1 = await db.curriculumItem.findUnique({
    where: { grade_id_subject_id_slug: { grade_id: grade5.id, subject_id: blockExam.id, slug: "blok-topic-01" } },
  });
  if (t1) {
    for (const t of P003_TESTS) {
      await res(t1.id, t.slug, "TEST", t.az, t.ru, P3X(t.file), { questions_count: 30, duration_min: 30 });
    }
    console.log(`  ✓ 4 Blok İmtahan tests added to Topic 1`);
  }

  // ── 3. P004: TAİM 2026 subject (teacher MİQ prep) ──────────────────────────
  console.log("\n🎓 P004: Setting up TAİM 2026…");

  // TAİM has its own dedicated standalone PWA but we expose it via the hub too.
  // Use Grade 5 for now (teachers can be assigned this subject via the dashboard).
  const taim = await db.subject.upsert({
    where:  { slug: "taim-2026" },
    update: {},
    create: { slug: "taim-2026", label_az: "TAİM 2026 (MİQ)", label_ru: "TAİM 2026 (Атт.)", icon: "🎓" },
  });

  await db.gradeSubject.upsert({
    where:  { grade_id_subject_id: { grade_id: grade5.id, subject_id: taim.id } },
    update: {},
    create: { grade_id: grade5.id, subject_id: taim.id },
  });

  let taimCount = 0;
  for (const bolme of P004_BOLME) {
    const bItem = await db.curriculumItem.upsert({
      where:  { grade_id_subject_id_slug: { grade_id: grade5.id, subject_id: taim.id, slug: bolme.slug } },
      update: {},
      create: { grade_id: grade5.id, subject_id: taim.id, slug: bolme.slug,
                title_az: bolme.az, title_ru: bolme.ru, order_index: P004_BOLME.indexOf(bolme) + 1 },
    });
    for (const t of bolme.tests) {
      await res(bItem.id, `taim-test-${t.n}`, "TAIM_TEST",
        t.az, t.ru, P4(`test-${t.n}.html`), { test_number: t.n, duration_min: 45, questions_count: 30 });
      taimCount++;
    }
  }

  // Fəsil sınaqları (chapter tests)
  const sinaqItem = await db.curriculumItem.upsert({
    where:  { grade_id_subject_id_slug: { grade_id: grade5.id, subject_id: taim.id, slug: "fesil-sinaqlar" } },
    update: {},
    create: { grade_id: grade5.id, subject_id: taim.id, slug: "fesil-sinaqlar",
              title_az: "Fəsil Sınaqları", title_ru: "Тесты по разделам", order_index: 4 },
  });
  for (const t of P004_SINAQ) {
    await res(sinaqItem.id, t.slug, "TAIM_TEST", t.az, t.ru, P4(t.file), { duration_min: 60 });
    taimCount++;
  }

  // Ümumi sınaqlar (final tests)
  const umumiItem = await db.curriculumItem.upsert({
    where:  { grade_id_subject_id_slug: { grade_id: grade5.id, subject_id: taim.id, slug: "umumi-sinaqlar" } },
    update: {},
    create: { grade_id: grade5.id, subject_id: taim.id, slug: "umumi-sinaqlar",
              title_az: "Ümumi Sınaqlar", title_ru: "Итоговые тесты", order_index: 5 },
  });
  for (const t of P004_UMUMI) {
    await res(umumiItem.id, t.slug, "TAIM_TEST", t.az, t.ru, P4(t.file), { duration_min: 90 });
    taimCount++;
  }

  console.log(`  ✓ ${taimCount} TAİM 2026 tests created (${P004_BOLME.length} bölmə + fəsil + ümumi sınaqlar)`);

  // ── 4. P002-6: placeholder lessons for chapters 2–8 ───────────────────────
  console.log("\n📗 P002-6: Marking Grade 6 chapters 2–8 as coming-soon…");
  // Only class-1/Lesson-1.html exists. Others are placeholders without content_url.
  // The existing seed already added them without content_url. Nothing to do here.
  console.log("  ✓ Grade 6 structure already seeded (class-1 Lesson-1 has content_url)");

  console.log("\n✅ seed-content.ts complete!\n");
  console.log("  Grade 5 Riyaziyyat  → 90 individual P002 lessons added");
  console.log("  Grade 5 Blok İmtahan→ 28 topics + 4 tests (P003)");
  console.log("  Grade 5 TAİM 2026   → 47 tests (P004)");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
