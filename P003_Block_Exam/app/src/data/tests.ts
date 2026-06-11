import type { Test } from '@/types';

export const TESTS: Test[] = [
  {
    id: 'test-variant-1',
    slug: 'kitab-1-yekun',
    title: {
      az: 'Kitab 1 — Yekun Testi',
      ru: 'Книга 1 — Итоговый тест',
      en: 'Book 1 — Final Test',
    },
    description: {
      az: 'Mövzular 1–14 üzrə yekun qiymətləndirmə: natural ədədlər, çoxluqlar, kəsrlər, həndəsə, faiz, reyal ədədlər, üçbucaqlar, tənliklər, dairə, bərabərsizliklər.',
      ru: 'Итоговая оценка по темам 1–14: натуральные числа, множества, дроби, геометрия, проценты, уравнения, окружность, неравенства.',
      en: 'Final assessment covering topics 1–14: natural numbers, sets, fractions, geometry, percentages, equations, circle, inequalities.',
    },
    topicIds: ['topic-01','topic-02','topic-03','topic-04','topic-05','topic-06','topic-07','topic-08','topic-09','topic-10','topic-11','topic-12','topic-13','topic-14'],
    questionCount: 30,
    timeMinutes: 40,
    difficulty: 2,
    url_path: '/lessons/tests/test-variant-1.html',
  },
  {
    id: 'test-variant-2',
    slug: 'kitab-2-yekun',
    title: {
      az: 'Kitab 2 — Yekun Testi',
      ru: 'Книга 2 — Итоговый тест',
      en: 'Book 2 — Final Test',
    },
    description: {
      az: 'Mövzular 15–28 üzrə yekun qiymətləndirmə: dördbucaqlılar, funksiyalar, triqonometriya, loqarifm, eksponensial, kombinatorika, ehtimal, statistika, vektorlar, inteqral.',
      ru: 'Итоговая оценка по темам 15–28: четырёхугольники, функции, тригонометрия, логарифмы, комбинаторика, вероятность, производная, интеграл.',
      en: 'Final assessment covering topics 15–28: quadrilaterals, functions, trigonometry, logarithms, combinatorics, probability, derivative, integral.',
    },
    topicIds: ['topic-15','topic-16','topic-17','topic-18','topic-19','topic-20','topic-21','topic-22','topic-23','topic-24','topic-25','topic-26','topic-27','topic-28'],
    questionCount: 30,
    timeMinutes: 40,
    difficulty: 3,
    url_path: '/lessons/tests/test-variant-2.html',
  },
  {
    id: 'test-dim-mixed',
    slug: 'dim-qarisiq',
    title: {
      az: 'DİM — Qarışıq Test',
      ru: 'DİM — Смешанный тест',
      en: 'DİM — Mixed Test',
    },
    description: {
      az: 'Bütün 28 mövzu üzrə DİM formatında qarışıq test. Hər mövzudan bir sual. Blok imtahanına hazırlıq üçün ideal.',
      ru: 'Смешанный тест в формате DİM по всем 28 темам. По одному вопросу из каждой темы. Идеально для подготовки к блочному экзамену.',
      en: 'DİM-format mixed test across all 28 topics. One question per topic. Ideal for block exam preparation.',
    },
    topicIds: ['topic-01','topic-02','topic-03','topic-04','topic-05','topic-06','topic-07','topic-08','topic-09','topic-10','topic-11','topic-12','topic-13','topic-14','topic-15','topic-16','topic-17','topic-18','topic-19','topic-20','topic-21','topic-22','topic-23','topic-24','topic-25','topic-26','topic-27','topic-28'],
    questionCount: 30,
    timeMinutes: 45,
    difficulty: 3,
    url_path: '/lessons/tests/test-dim-mixed.html',
  },
];

export const getTestBySlug = (slug: string): Test | undefined =>
  TESTS.find((t) => t.slug === slug);
