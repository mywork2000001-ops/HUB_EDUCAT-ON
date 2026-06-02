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
    lessons: [
      {
        id: 'topic-08-main',
        topicId: 'topic-08',
        type: 'theory',
        title: { az: 'Rasional ifadələr — tam dərs', ru: 'Рациональные выражения — полный урок', en: 'Rational Expressions — full lesson' },
        url_path: '/lessons/topics/topic-08.html',
        estimatedMinutes: 40,
        questionCount: 20,
      },
    ],
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
    lessons: [
      {
        id: 'topic-09-main',
        topicId: 'topic-09',
        type: 'theory',
        title: { az: 'Birməchullu tənliklər — tam dərs', ru: 'Уравнения с одним неизвестным — полный урок', en: 'Single-Variable Equations — full lesson' },
        url_path: '/lessons/topics/topic-09.html',
        estimatedMinutes: 40,
        questionCount: 20,
      },
    ],
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
    lessons: [
      {
        id: 'topic-10-main',
        topicId: 'topic-10',
        type: 'theory',
        title: { az: 'Tənliklər sistemi — tam dərs', ru: 'Системы уравнений — полный урок', en: 'Systems of Equations — full lesson' },
        url_path: '/lessons/topics/topic-10.html',
        estimatedMinutes: 40,
        questionCount: 20,
      },
    ],
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
    lessons: [
      {
        id: 'topic-11-main',
        topicId: 'topic-11',
        type: 'theory',
        title: { az: 'Çevrə — tam dərs', ru: 'Окружность — полный урок', en: 'Circle — full lesson' },
        url_path: '/lessons/topics/topic-11.html',
        estimatedMinutes: 45,
        questionCount: 20,
      },
    ],
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
    lessons: [
      {
        id: 'topic-12-main',
        topicId: 'topic-12',
        type: 'theory',
        title: { az: 'Bərabərsizliklər — tam dərs', ru: 'Неравенства — полный урок', en: 'Inequalities — full lesson' },
        url_path: '/lessons/topics/topic-12.html',
        estimatedMinutes: 45,
        questionCount: 20,
      },
    ],
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
    lessons: [
      {
        id: 'topic-13-main',
        topicId: 'topic-13',
        type: 'theory',
        title: { az: 'Ədədi ardıcıllıqlar. Silsilələr — tam dərs', ru: 'Числовые последовательности. Прогрессии — полный урок', en: 'Sequences & Progressions — full lesson' },
        url_path: '/lessons/topics/topic-13.html',
        estimatedMinutes: 45,
        questionCount: 20,
      },
    ],
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
    lessons: [
      {
        id: 'topic-14-main',
        topicId: 'topic-14',
        type: 'theory',
        title: { az: 'Çoxbucaqlılar — tam dərs', ru: 'Многоугольники — полный урок', en: 'Polygons — full lesson' },
        url_path: '/lessons/topics/topic-14.html',
        estimatedMinutes: 45,
        questionCount: 20,
      },
    ],
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
      az: 'Paraleloqram, düzbucaqlı, romb, kvadrat, trapesiya; sahə',
      ru: 'Параллелограмм, прямоугольник, ромб, квадрат, трапеция; площадь',
      en: 'Parallelogram, rectangle, rhombus, square, trapezoid; area',
    },
    lessons: [
      {
        id: 'topic-15-main',
        topicId: 'topic-15',
        type: 'theory',
        title: { az: 'Dördbucaqlılar — tam dərs', ru: 'Четырёхугольники — полный урок', en: 'Quadrilaterals — full lesson' },
        url_path: '/lessons/topics/topic-15.html',
        estimatedMinutes: 45,
        questionCount: 20,
      },
    ],
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
    lessons: [
      {
        id: 'topic-16-main',
        topicId: 'topic-16',
        type: 'theory',
        title: { az: 'Funksiyalar — tam dərs', ru: 'Функции — полный урок', en: 'Functions — full lesson' },
        url_path: '/lessons/topics/topic-16.html',
        estimatedMinutes: 50,
        questionCount: 20,
      },
    ],
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
    lessons: [
      {
        id: 'topic-17-main',
        topicId: 'topic-17',
        type: 'theory',
        title: { az: 'Trigonometrik funksiyalar — tam dərs', ru: 'Тригонометрические функции — полный урок', en: 'Trigonometric Functions — full lesson' },
        url_path: '/lessons/topics/topic-17.html',
        estimatedMinutes: 50,
        questionCount: 20,
      },
    ],
  },

  // ── КНИГА 2 ── темы 18–28 ─────────────────────────────────────────────────

  {
    id: 'topic-18',
    slug: 'loqarifmler',
    order: 18,
    icon: 'log',
    difficulty: 3,
    title: {
      az: 'Loqarifmlər',
      ru: 'Логарифмы',
      en: 'Logarithms',
    },
    description: {
      az: 'Loqarifm tərifi, xassələri, əsas düsturlar, loqarifmik tənliklər',
      ru: 'Определение логарифма, свойства, основные формулы, логарифмические уравнения',
      en: 'Logarithm definition, properties, key formulas, logarithmic equations',
    },
    lessons: [
      {
        id: 'topic-18-main',
        topicId: 'topic-18',
        type: 'theory',
        title: { az: 'Loqarifmlər — tam dərs', ru: 'Логарифмы — полный урок', en: 'Logarithms — full lesson' },
        url_path: '/lessons/topics/topic-18.html',
        estimatedMinutes: 50,
        questionCount: 20,
      },
    ],
  },

  {
    id: 'topic-19',
    slug: 'eksponensial-tenlikler',
    order: 19,
    icon: 'eˣ',
    difficulty: 3,
    title: {
      az: 'Eksponensial tənliklər',
      ru: 'Показательные уравнения',
      en: 'Exponential Equations',
    },
    description: {
      az: 'Üstlü funksiya, eyni əsaslı tənliklər, əvəzetmə üsulu, bərabərsizliklər',
      ru: 'Показательная функция, уравнения с одним основанием, метод замены, неравенства',
      en: 'Exponential function, same-base equations, substitution method, inequalities',
    },
    lessons: [
      {
        id: 'topic-19-main',
        topicId: 'topic-19',
        type: 'theory',
        title: { az: 'Eksponensial tənliklər — tam dərs', ru: 'Показательные уравнения — полный урок', en: 'Exponential Equations — full lesson' },
        url_path: '/lessons/topics/topic-19.html',
        estimatedMinutes: 50,
        questionCount: 20,
      },
    ],
  },

  {
    id: 'topic-20',
    slug: 'loqarifmik-tenlikler',
    order: 20,
    icon: '📉',
    difficulty: 3,
    title: {
      az: 'Loqarifmik tənliklər',
      ru: 'Логарифмические уравнения',
      en: 'Logarithmic Equations',
    },
    description: {
      az: 'ODZ, loqarifmik tənlik növləri, bərabərsizliklər, qarışıq tənliklər',
      ru: 'ОДЗ, типы логарифмических уравнений, неравенства, смешанные уравнения',
      en: 'Domain, types of log equations, inequalities, mixed equations',
    },
    lessons: [
      {
        id: 'topic-20-main',
        topicId: 'topic-20',
        type: 'theory',
        title: { az: 'Loqarifmik tənliklər — tam dərs', ru: 'Логарифмические уравнения — полный урок', en: 'Logarithmic Equations — full lesson' },
        url_path: '/lessons/topics/topic-20.html',
        estimatedMinutes: 50,
        questionCount: 20,
      },
    ],
  },

  {
    id: 'topic-21',
    slug: 'kombinatorika',
    order: 21,
    icon: '🔢',
    difficulty: 3,
    title: {
      az: 'Kombinatorika',
      ru: 'Комбинаторика',
      en: 'Combinatorics',
    },
    description: {
      az: 'Permutasiya, yerləşdirmə, kombinasiya, Paskal üçbucağı, binom teoremi',
      ru: 'Перестановки, размещения, сочетания, треугольник Паскаля, бином',
      en: 'Permutations, arrangements, combinations, Pascal triangle, binomial theorem',
    },
    lessons: [
      {
        id: 'topic-21-main',
        topicId: 'topic-21',
        type: 'theory',
        title: { az: 'Kombinatorika — tam dərs', ru: 'Комбинаторика — полный урок', en: 'Combinatorics — full lesson' },
        url_path: '/lessons/topics/topic-21.html',
        estimatedMinutes: 50,
        questionCount: 20,
      },
    ],
  },

  {
    id: 'topic-22',
    slug: 'ehtimal-nezəriyyesi',
    order: 22,
    icon: '🎲',
    difficulty: 3,
    title: {
      az: 'Ehtimal nəzəriyyəsi',
      ru: 'Теория вероятностей',
      en: 'Probability Theory',
    },
    description: {
      az: 'Klassik ehtimal, toplama/vurma qaydaları, şərti ehtimal, Bernulli',
      ru: 'Классическая вероятность, правила сложения/умножения, условная вероятность',
      en: 'Classical probability, addition/multiplication rules, conditional probability',
    },
    lessons: [
      {
        id: 'topic-22-main',
        topicId: 'topic-22',
        type: 'theory',
        title: { az: 'Ehtimal nəzəriyyəsi — tam dərs', ru: 'Теория вероятностей — полный урок', en: 'Probability Theory — full lesson' },
        url_path: '/lessons/topics/topic-22.html',
        estimatedMinutes: 50,
        questionCount: 20,
      },
    ],
  },

  {
    id: 'topic-23',
    slug: 'statistika',
    order: 23,
    icon: '📊',
    difficulty: 2,
    title: {
      az: 'Statistika',
      ru: 'Статистика',
      en: 'Statistics',
    },
    description: {
      az: 'Orta, mediana, moda, dispersiya, standart kənarlaşma, qutucuq diaqramı',
      ru: 'Среднее, медиана, мода, дисперсия, стандартное отклонение, ящик с усами',
      en: 'Mean, median, mode, variance, standard deviation, box plot',
    },
    lessons: [
      {
        id: 'topic-23-main',
        topicId: 'topic-23',
        type: 'theory',
        title: { az: 'Statistika — tam dərs', ru: 'Статистика — полный урок', en: 'Statistics — full lesson' },
        url_path: '/lessons/topics/topic-23.html',
        estimatedMinutes: 45,
        questionCount: 20,
      },
    ],
  },

  {
    id: 'topic-24',
    slug: 'vektorlar',
    order: 24,
    icon: '➡️',
    difficulty: 3,
    title: {
      az: 'Vektorlar',
      ru: 'Векторы',
      en: 'Vectors',
    },
    description: {
      az: 'Vektorlar, koordinatlar, skalyar hasil, vektorlar arası bucaq',
      ru: 'Векторы, координаты, скалярное произведение, угол между векторами',
      en: 'Vectors, coordinates, dot product, angle between vectors',
    },
    lessons: [
      {
        id: 'topic-24-main',
        topicId: 'topic-24',
        type: 'theory',
        title: { az: 'Vektorlar — tam dərs', ru: 'Векторы — полный урок', en: 'Vectors — full lesson' },
        url_path: '/lessons/topics/topic-24.html',
        estimatedMinutes: 45,
        questionCount: 20,
      },
    ],
  },

  {
    id: 'topic-25',
    slug: 'koordinat-usulu',
    order: 25,
    icon: '📍',
    difficulty: 3,
    title: {
      az: 'Koordinat üsulu',
      ru: 'Координатный метод',
      en: 'Coordinate Method',
    },
    description: {
      az: 'Məsafə, ortanöqtə, düz xətt tənliyi, çevrə, parabolanın koordinat üsulu ilə həlli',
      ru: 'Расстояние, середина отрезка, уравнение прямой, окружность, парабола',
      en: 'Distance, midpoint, line equation, circle, parabola in coordinates',
    },
    lessons: [
      {
        id: 'topic-25-main',
        topicId: 'topic-25',
        type: 'theory',
        title: { az: 'Koordinat üsulu — tam dərs', ru: 'Координатный метод — полный урок', en: 'Coordinate Method — full lesson' },
        url_path: '/lessons/topics/topic-25.html',
        estimatedMinutes: 50,
        questionCount: 20,
      },
    ],
  },

  {
    id: 'topic-26',
    slug: 'toreme',
    order: 26,
    icon: '∂',
    difficulty: 3,
    title: {
      az: 'Törəmə',
      ru: 'Производная',
      en: 'Derivative',
    },
    description: {
      az: 'Törəmənin tərifi, hesablama qaydaları, ekstremuмlar, mono­tonluq, toxunan xətt',
      ru: 'Определение производной, правила вычисления, экстремумы, монотонность, касательная',
      en: 'Derivative definition, computation rules, extrema, monotonicity, tangent line',
    },
    lessons: [
      {
        id: 'topic-26-main',
        topicId: 'topic-26',
        type: 'theory',
        title: { az: 'Törəmə — tam dərs', ru: 'Производная — полный урок', en: 'Derivative — full lesson' },
        url_path: '/lessons/topics/topic-26.html',
        estimatedMinutes: 55,
        questionCount: 20,
      },
    ],
  },

  {
    id: 'topic-27',
    slug: 'inteqral',
    order: 27,
    icon: '∫',
    difficulty: 3,
    title: {
      az: 'İntegral',
      ru: 'Интеграл',
      en: 'Integral',
    },
    description: {
      az: 'İbtidai funksiya, qeyri-müəyyən inteqral, Nyuton-Leybnis düsturu, sahə',
      ru: 'Первообразная, неопределённый интеграл, формула Ньютона–Лейбница, площадь',
      en: 'Antiderivative, indefinite integral, Newton–Leibniz formula, area',
    },
    lessons: [
      {
        id: 'topic-27-main',
        topicId: 'topic-27',
        type: 'theory',
        title: { az: 'İntegral — tam dərs', ru: 'Интеграл — полный урок', en: 'Integral — full lesson' },
        url_path: '/lessons/topics/topic-27.html',
        estimatedMinutes: 55,
        questionCount: 20,
      },
    ],
  },

  {
    id: 'topic-28',
    slug: 'dim-hazirliq',
    order: 28,
    icon: '🏆',
    difficulty: 3,
    title: {
      az: 'DİM-ə Hazırlıq — Yekun Təkrar',
      ru: 'Подготовка к ДИМ — Итоговое повторение',
      en: 'Exam Review — Final Preparation',
    },
    description: {
      az: 'Bütün mövzuların xülasəsi, DİM formatı, tipik səhvlər, qarışıq test',
      ru: 'Обзор всех тем, формат ДИМ, типичные ошибки, смешанный тест',
      en: 'All-topic summary, DİM format, common mistakes, mixed practice test',
    },
    lessons: [
      {
        id: 'topic-28-main',
        topicId: 'topic-28',
        type: 'theory',
        title: { az: 'DİM-ə Hazırlıq — tam dərs', ru: 'Подготовка к ДИМ — полный урок', en: 'Exam Review — full lesson' },
        url_path: '/lessons/topics/topic-28.html',
        estimatedMinutes: 60,
        questionCount: 20,
      },
    ],
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
