import type { Topic } from '@/types';

// ─── KİTAB 1 (Kitab 1 — Əsas səviyyə) ───────────────────────────────────────
// ─── КНИГА 1 (Базовый уровень) ───────────────────────────────────────────────

// ─── KİTAB 2 (Kitab 2 — DİM səviyyəsi) ──────────────────────────────────────
// ─── КНИГА 2 (Уровень DİM) ───────────────────────────────────────────────────

export const TOPICS: Topic[] = [

  // ── КНИГА 1 ── темы 1–17 ──────────────────────────────────────────────────

  {
    id: 'topic-01',
    slug: 'natural-ededler',
    order: 1,
    icon: '🔢',
    difficulty: 1,
    title: {
      az: 'Natural ədədlər',
      ru: 'Натуральные числа',
      en: 'Natural Numbers',
    },
    description: {
      az: 'Natural ədədlər, əməliyyatlar, xassələr',
      ru: 'Натуральные числа, операции, свойства',
      en: 'Natural numbers, operations, properties',
    },
    lessons: [
      {
        id: 'topic-01-main',
        topicId: 'topic-01',
        type: 'theory',
        title: { az: 'Natural ədədlər — tam dərs', ru: 'Натуральные числа — полный урок', en: 'Natural Numbers — full lesson' },
        url_path: '/lessons/topics/topic-01.html',
        estimatedMinutes: 40,
        questionCount: 20,
      },
    ],
  },

  {
    id: 'topic-02',
    slug: 'coxluqlar',
    order: 2,
    icon: '🔵',
    difficulty: 1,
    title: {
      az: 'Çoxluqlar',
      ru: 'Множества',
      en: 'Sets',
    },
    description: {
      az: 'Çoxluqlar, alt çoxluqlar, kəsişmə, birləşmə, fərq',
      ru: 'Множества, подмножества, пересечение, объединение, разность',
      en: 'Sets, subsets, intersection, union, difference',
    },
    lessons: [
      {
        id: 'topic-02-main',
        topicId: 'topic-02',
        type: 'theory',
        title: { az: 'Çoxluqlar — tam dərs', ru: 'Множества — полный урок', en: 'Sets — full lesson' },
        url_path: '/lessons/topics/topic-02.html',
        estimatedMinutes: 35,
        questionCount: 20,
      },
    ],
  },

  {
    id: 'topic-03',
    slug: 'adi-ve-onluq-kesirler',
    order: 3,
    icon: '½',
    difficulty: 1,
    title: {
      az: 'Adi və onluq kəsirlər',
      ru: 'Обыкновенные и десятичные дроби',
      en: 'Common and Decimal Fractions',
    },
    description: {
      az: 'Kəsirlərlə əməliyyatlar, çevrilmələr',
      ru: 'Операции с дробями, преобразования',
      en: 'Operations with fractions, conversions',
    },
    lessons: [
      {
        id: 'topic-03-main',
        topicId: 'topic-03',
        type: 'theory',
        title: { az: 'Adi və onluq kəsirlər — tam dərs', ru: 'Дроби — полный урок', en: 'Fractions — full lesson' },
        url_path: '/lessons/topics/topic-03.html',
        estimatedMinutes: 45,
        questionCount: 20,
      },
    ],
  },

  {
    id: 'topic-04',
    slug: 'hendesiinin-esas-anlayislari',
    order: 4,
    icon: '📐',
    difficulty: 1,
    title: {
      az: 'Həndəsənin əsas anlayışları',
      ru: 'Основные понятия геометрии',
      en: 'Basic Concepts of Geometry',
    },
    description: {
      az: 'Nöqtə, düz xətt, bucaq, çevrə, fiqurlar',
      ru: 'Точка, прямая, угол, окружность, фигуры',
      en: 'Point, line, angle, circle, figures',
    },
    lessons: [
      {
        id: 'topic-04-main',
        topicId: 'topic-04',
        type: 'theory',
        title: { az: 'Həndəsənin əsas anlayışları — tam dərs', ru: 'Основные понятия геометрии — полный урок', en: 'Basic Geometry — full lesson' },
        url_path: '/lessons/topics/topic-04.html',
        estimatedMinutes: 40,
        questionCount: 20,
      },
    ],
  },

  {
    id: 'topic-05',
    slug: 'nisbет-tenasub-faiz',
    order: 5,
    icon: '💯',
    difficulty: 1,
    title: {
      az: 'Nisbət. Tənasüb. Faiz',
      ru: 'Отношение. Пропорция. Процент',
      en: 'Ratio. Proportion. Percent',
    },
    description: {
      az: 'Nisbət, tənasüb, faiz hesablamaları, tətbiq məsələləri',
      ru: 'Отношение, пропорция, процентные вычисления, прикладные задачи',
      en: 'Ratio, proportion, percentage calculations, applied problems',
    },
    lessons: [
      {
        id: 'topic-05-main',
        topicId: 'topic-05',
        type: 'theory',
        title: { az: 'Nisbət. Tənasüb. Faiz — tam dərs', ru: 'Отношение. Пропорция. Процент — полный урок', en: 'Ratio. Proportion. Percent — full lesson' },
        url_path: '/lessons/topics/topic-05.html',
        estimatedMinutes: 45,
        questionCount: 20,
      },
    ],
  },

  {
    id: 'topic-06',
    slug: 'heqiqi-ededler-kvadrat-kok',
    order: 6,
    icon: '√',
    difficulty: 2,
    title: {
      az: 'Həqiqi ədədlər. Həqiqi üstlü qüvvət. Kvadrat kök',
      ru: 'Действительные числа. Степень. Квадратный корень',
      en: 'Real Numbers. Power. Square Root',
    },
    description: {
      az: 'İrrасional ədədlər, üstlər, kvadrat kök, sadələşdirmə',
      ru: 'Иррациональные числа, степени, квадратный корень, упрощение',
      en: 'Irrational numbers, powers, square root, simplification',
    },
    lessons: [
      {
        id: 'topic-06-main',
        topicId: 'topic-06',
        type: 'theory',
        title: { az: 'Həqiqi ədədlər. Üstlər. Kvadrat kök — tam dərs', ru: 'Действительные числа. Степени. Корень — полный урок', en: 'Real Numbers. Powers. Square Root — full lesson' },
        url_path: '/lessons/topics/topic-06.html',
        estimatedMinutes: 45,
        questionCount: 20,
      },
    ],
  },

  {
    id: 'topic-07',
    slug: 'ucbucaqlar',
    order: 7,
    icon: '🔺',
    difficulty: 2,
    title: {
      az: 'Üçbucaqlar',
      ru: 'Треугольники',
      en: 'Triangles',
    },
    description: {
      az: 'Üçbucaq əlamətləri, oxşarlıq, Pifaqor teoremi, sahə',
      ru: 'Признаки треугольников, подобие, теорема Пифагора, площадь',
      en: 'Triangle congruence, similarity, Pythagorean theorem, area',
    },
    lessons: [
      {
        id: 'topic-07-main',
        topicId: 'topic-07',
        type: 'theory',
        title: { az: 'Üçbucaqlar — tam dərs', ru: 'Треугольники — полный урок', en: 'Triangles — full lesson' },
        url_path: '/lessons/topics/topic-07.html',
        estimatedMinutes: 45,
        questionCount: 20,
      },
    ],
  },

  {
    id: 'topic-08',
    slug: 'rasional-ifadeler',
    order: 8,
    icon: '🔣',
    difficulty: 2,
    title: {
      az: 'Rasional ifadələr',
      ru: 'Рациональные выражения',
      en: 'Rational Expressions',
    },
    description: {
      az: 'Çoxhədlilər, faktorizasiya, rasional ifadələrlə əməliyyatlar',
      ru: 'Многочлены, факторизация, операции с рациональными выражениями',
      en: 'Polynomials, factorization, operations with rational expressions',
    },
    lessons: [],
  },

  {
    id: 'topic-09',
    slug: 'birmeçhullu-tenlikler',
    order: 9,
    icon: '⚖️',
    difficulty: 2,
    title: {
      az: 'Birməchullu tənliklər',
      ru: 'Уравнения с одним неизвестным',
      en: 'Single-Variable Equations',
    },
    description: {
      az: 'Xətti, kvadrat, rasional tənliklər; həll üsulları',
      ru: 'Линейные, квадратные, рациональные уравнения; методы решения',
      en: 'Linear, quadratic, rational equations; solution methods',
    },
    lessons: [],
  },

  {
    id: 'topic-10',
    slug: 'tenlikler-sistemi',
    order: 10,
    icon: '🔗',
    difficulty: 2,
    title: {
      az: 'Tənliklər sistemi',
      ru: 'Системы уравнений',
      en: 'Systems of Equations',
    },
    description: {
      az: 'İki məchullu tənliklər sistemi, həll üsulları, məsələlər',
      ru: 'Системы с двумя неизвестными, методы решения, задачи',
      en: 'Systems with two unknowns, solution methods, problems',
    },
    lessons: [],
  },

  {
    id: 'topic-11',
    slug: 'cevre',
    order: 11,
    icon: '⭕',
    difficulty: 2,
    title: {
      az: 'Çevrə',
      ru: 'Окружность',
      en: 'Circle',
    },
    description: {
      az: 'Çevrə xassələri, teoremlər, bucaqlar, vətər, toxunan',
      ru: 'Свойства окружности, теоремы, углы, хорда, касательная',
      en: 'Circle properties, theorems, angles, chord, tangent',
    },
    lessons: [],
  },

  {
    id: 'topic-12',
    slug: 'berabersizlikler',
    order: 12,
    icon: '↔️',
    difficulty: 2,
    title: {
      az: 'Bərabərsizliklər',
      ru: 'Неравенства',
      en: 'Inequalities',
    },
    description: {
      az: 'Xətti, kvadrat, rasional bərabərsizliklər; sistemlər',
      ru: 'Линейные, квадратные, рациональные неравенства; системы',
      en: 'Linear, quadratic, rational inequalities; systems',
    },
    lessons: [],
  },

  {
    id: 'topic-13',
    slug: 'ededi-ardiciiliqlar-silsileler',
    order: 13,
    icon: '📈',
    difficulty: 2,
    title: {
      az: 'Ədədi ardıcıllıqlar. Silsilələr',
      ru: 'Числовые последовательности. Прогрессии',
      en: 'Numerical Sequences. Progressions',
    },
    description: {
      az: 'Arifmetik və həndəsi silsilələr, cəmlərin hesablanması',
      ru: 'Арифметическая и геометрическая прогрессии, вычисление сумм',
      en: 'Arithmetic and geometric progressions, sum calculation',
    },
    lessons: [],
  },

  {
    id: 'topic-14',
    slug: 'coxbucaqlılar',
    order: 14,
    icon: '🔷',
    difficulty: 2,
    title: {
      az: 'Çoxbucaqlılar',
      ru: 'Многоугольники',
      en: 'Polygons',
    },
    description: {
      az: 'Çoxbucaqlı növləri, perimetr, sahə, düzgün çoxbucaqlılar',
      ru: 'Виды многоугольников, периметр, площадь, правильные многоугольники',
      en: 'Types of polygons, perimeter, area, regular polygons',
    },
    lessons: [],
  },

  {
    id: 'topic-15',
    slug: 'dordbucaqlılar',
    order: 15,
    icon: '▭',
    difficulty: 2,
    title: {
      az: 'Dördbucaqlılar',
      ru: 'Четырёхугольники',
      en: 'Quadrilaterals',
    },
    description: {
      az: 'Paralel­kenar, düzbucaqlı, romb, kvadrat, trapesiya; sahə',
      ru: 'Параллелограмм, прямоугольник, ромб, квадрат, трапеция; площадь',
      en: 'Parallelogram, rectangle, rhombus, square, trapezoid; area',
    },
    lessons: [],
  },

  {
    id: 'topic-16',
    slug: 'funksiyalar',
    order: 16,
    icon: '📊',
    difficulty: 2,
    title: {
      az: 'Funksiyalar',
      ru: 'Функции',
      en: 'Functions',
    },
    description: {
      az: 'Funksiya anlayışı, qrafik, xassələr, əsas funksiya növləri',
      ru: 'Понятие функции, график, свойства, основные виды функций',
      en: 'Concept of function, graph, properties, main types of functions',
    },
    lessons: [],
  },

  {
    id: 'topic-17',
    slug: 'trigonometrik-funksiyalar',
    order: 17,
    icon: '〰️',
    difficulty: 3,
    title: {
      az: 'Trigonometrik funksiyalar. Tənliklər və bərabərsizliklər',
      ru: 'Тригонометрические функции. Уравнения и неравенства',
      en: 'Trigonometric Functions. Equations and Inequalities',
    },
    description: {
      az: 'Sin, cos, tg, ctg; tənliklər, bərabərsizliklər, qrafiklər',
      ru: 'Sin, cos, tg, ctg; уравнения, неравенства, графики',
      en: 'Sin, cos, tan, cot; equations, inequalities, graphs',
    },
    lessons: [],
  },

  // ── КНИГА 2 ── темы 18–28 ─────────────────────────────────────────────────

  {
    id: 'topic-18',
    slug: 'kompleks-ededler',
    order: 18,
    icon: '🌀',
    difficulty: 3,
    title: {
      az: 'Kompleks ədədlər',
      ru: 'Комплексные числа',
      en: 'Complex Numbers',
    },
    description: {
      az: 'Kompleks ədədlər, əməliyyatlar, həndəsi mənası, modul',
      ru: 'Комплексные числа, операции, геометрический смысл, модуль',
      en: 'Complex numbers, operations, geometric meaning, modulus',
    },
    lessons: [],
  },

  {
    id: 'topic-19',
    slug: 'herekat-oxsarliq-homotetiya-simmetriya',
    order: 19,
    icon: '🔄',
    difficulty: 3,
    title: {
      az: 'Hərəkət və oxşarlıq. Homotetiya. Simmetriya',
      ru: 'Движение и подобие. Гомотетия. Симметрия',
      en: 'Motion and Similarity. Homothety. Symmetry',
    },
    description: {
      az: 'Fiqurların çevrilməsi, homotetiya, ox və mərkəz simmetriyası',
      ru: 'Преобразования фигур, гомотетия, осевая и центральная симметрия',
      en: 'Transformations of figures, homothety, axial and central symmetry',
    },
    lessons: [],
  },

  {
    id: 'topic-20',
    slug: 'ustlu-logarifmik-funksiyalar',
    order: 20,
    icon: '📉',
    difficulty: 3,
    title: {
      az: 'Üstlü və logarifmik funksiyalar. Tənliklər və bərabərsizliklər',
      ru: 'Показательные и логарифмические функции. Уравнения и неравенства',
      en: 'Exponential and Logarithmic Functions. Equations and Inequalities',
    },
    description: {
      az: 'Üstlü funksiya, logarifm, tənliklər, bərabərsizliklər, qrafiklər',
      ru: 'Показательная функция, логарифм, уравнения, неравенства, графики',
      en: 'Exponential function, logarithm, equations, inequalities, graphs',
    },
    lessons: [],
  },

  {
    id: 'topic-21',
    slug: 'vektorlar-koordinatlar',
    order: 21,
    icon: '➡️',
    difficulty: 3,
    title: {
      az: 'Vektorlar. Koordinatlar metodu',
      ru: 'Векторы. Координатный метод',
      en: 'Vectors. Coordinate Method',
    },
    description: {
      az: 'Vektorlar, skalyar hasil, koordinat metodu ilə həll',
      ru: 'Векторы, скалярное произведение, решение координатным методом',
      en: 'Vectors, dot product, solving by coordinate method',
    },
    lessons: [],
  },

  {
    id: 'topic-22',
    slug: 'toreme-tetbiqler',
    order: 22,
    icon: '∂',
    difficulty: 3,
    title: {
      az: 'Törəmə və tətbiqləri',
      ru: 'Производная и её приложения',
      en: 'Derivative and Its Applications',
    },
    description: {
      az: 'Törəmə anlayışı, hesablama qaydaları, ekstremuмlar, qrafik tərtibi',
      ru: 'Понятие производной, правила вычисления, экстремумы, построение графиков',
      en: 'Concept of derivative, computation rules, extrema, graph plotting',
    },
    lessons: [],
  },

  {
    id: 'topic-23',
    slug: 'limit',
    order: 23,
    icon: '∞',
    difficulty: 3,
    title: {
      az: 'Limit',
      ru: 'Предел',
      en: 'Limit',
    },
    description: {
      az: 'Ardıcıllığın və funksiyanın limiti, limit xassələri, hesablama',
      ru: 'Предел последовательности и функции, свойства предела, вычисление',
      en: 'Limit of sequence and function, limit properties, computation',
    },
    lessons: [],
  },

  {
    id: 'topic-24',
    slug: 'ibtidai-funksiya-inteqral',
    order: 24,
    icon: '∫',
    difficulty: 3,
    title: {
      az: 'İbtidai funksiya. İnteqral',
      ru: 'Первообразная. Интеграл',
      en: 'Antiderivative. Integral',
    },
    description: {
      az: 'İbtidai funksiya, qeyri-müəyyən inteqral, Nyuton-Leybnis düsturu',
      ru: 'Первообразная, неопределённый интеграл, формула Ньютона–Лейбница',
      en: 'Antiderivative, indefinite integral, Newton–Leibniz formula',
    },
    lessons: [],
  },

  {
    id: 'topic-25',
    slug: 'stereometriya',
    order: 25,
    icon: '🎲',
    difficulty: 3,
    title: {
      az: 'Stereometriya',
      ru: 'Стереометрия',
      en: 'Solid Geometry',
    },
    description: {
      az: 'Fəzada düz xətlər və müstəvilər, paralel və perpendikulyarlıq',
      ru: 'Прямые и плоскости в пространстве, параллельность и перпендикулярность',
      en: 'Lines and planes in space, parallelism and perpendicularity',
    },
    lessons: [],
  },

  {
    id: 'topic-26',
    slug: 'coxuzluler',
    order: 26,
    icon: '💎',
    difficulty: 3,
    title: {
      az: 'Çoxüzlülər',
      ru: 'Многогранники',
      en: 'Polyhedra',
    },
    description: {
      az: 'Prizma, piramida, həcm və səthi, kəsiklər',
      ru: 'Призма, пирамида, объём и поверхность, сечения',
      en: 'Prism, pyramid, volume and surface area, cross-sections',
    },
    lessons: [],
  },

  {
    id: 'topic-27',
    slug: 'firlanma-cisimleri',
    order: 27,
    icon: '🔵',
    difficulty: 3,
    title: {
      az: 'Fırlanma cisimləri',
      ru: 'Тела вращения',
      en: 'Solids of Revolution',
    },
    description: {
      az: 'Silindr, konus, kürə — həcm, səthi, kəsiklər',
      ru: 'Цилиндр, конус, шар — объём, поверхность, сечения',
      en: 'Cylinder, cone, sphere — volume, surface area, cross-sections',
    },
    lessons: [],
  },

  {
    id: 'topic-28',
    slug: 'birlesme-ehtimal-statistika',
    order: 28,
    icon: '🎲',
    difficulty: 3,
    title: {
      az: 'Birləşmələr nəzəriyyəsi. Ehtimal və statistika',
      ru: 'Комбинаторика. Вероятность и статистика',
      en: 'Combinatorics. Probability and Statistics',
    },
    description: {
      az: 'Permutasiya, kombinasiya, yerləşdirmə, ehtimal, statistika',
      ru: 'Перестановки, комбинации, размещения, вероятность, статистика',
      en: 'Permutations, combinations, arrangements, probability, statistics',
    },
    lessons: [],
  },

];

export const getTopicBySlug = (slug: string): Topic | undefined =>
  TOPICS.find((t) => t.slug === slug);

export const getLessonById = (lessonId: string) => {
  for (const topic of TOPICS) {
    const lesson = topic.lessons.find((l) => l.id === lessonId);
    if (lesson) return { topic, lesson };
  }
  return null;
};
