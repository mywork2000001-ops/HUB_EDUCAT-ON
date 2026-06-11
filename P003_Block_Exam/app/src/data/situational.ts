import type { SituationalProblem } from '@/types';

export const SITUATIONAL: SituationalProblem[] = [
  {
    id: 'sit-magaza',
    slug: 'sit-magaza',
    title: {
      az: 'Elektronika Mağazasında Alış-veriş',
      ru: 'Покупка в магазине электроники',
      en: 'Electronics Store Shopping',
    },
    description: {
      az: 'Faiz, endirim, ƏDV və cashback hesablamaları',
      ru: 'Расчёт скидки, НДС и кэшбэка',
      en: 'Discount, VAT and cashback calculations',
    },
    context: {
      az: '1500 manat noutbuk, 20% endirim, 18% ƏDV, 5% cashback',
      ru: 'Ноутбук за 1500 манат, скидка 20%, НДС 18%, кэшбэк 5%',
      en: '1500 AZN laptop, 20% discount, 18% VAT, 5% cashback',
    },
    topicIds: ['topic-03'],
    difficulty: 2,
    url_path: '/lessons/situational/sit-magaza.html',
  },
  {
    id: 'sit-bag',
    slug: 'sit-bag',
    title: {
      az: 'Kənd Bağı — Hasarlanma Planı',
      ru: 'Сельский сад — план ограждения',
      en: 'Garden Fencing Plan',
    },
    description: {
      az: 'Düzbucaqlı sahənin perimetri, bölünməsi və xərci',
      ru: 'Периметр прямоугольника, разделение, стоимость ограды',
      en: 'Rectangle perimeter, partitioning and fence cost',
    },
    context: {
      az: '24m × 15m bağ, 3 hissəyə bölünür, 12 manat/m hasar',
      ru: 'Сад 24м × 15м, делится на 3 части, забор 12 ман/м',
      en: '24m × 15m garden, 3 sections, 12 AZN/m fence',
    },
    topicIds: ['topic-14', 'topic-16'],
    difficulty: 2,
    url_path: '/lessons/situational/sit-bag.html',
  },
  {
    id: 'sit-mesafe',
    slug: 'sit-mesafe',
    title: {
      az: 'Yol Problemi: İki Avtomobil',
      ru: 'Задача о движении: два автомобиля',
      en: 'Distance Problem: Two Cars',
    },
    description: {
      az: 'Sürət, məsafə və vaxt əlaqəsi ilə qarşılaşma məsələsi',
      ru: 'Задача на встречное движение: скорость, расстояние, время',
      en: 'Meeting point problem: speed, distance and time',
    },
    context: {
      az: 'A-dan 80 km/saat, B-dən 100 km/saat, aralarında 360 km',
      ru: 'Из A 80 км/ч, из B 100 км/ч, расстояние 360 км',
      en: 'From A at 80 km/h, from B at 100 km/h, distance 360 km',
    },
    topicIds: ['topic-03', 'topic-09'],
    difficulty: 2,
    url_path: '/lessons/situational/sit-mesafe.html',
  },
];

export const getSituationalBySlug = (slug: string): SituationalProblem | undefined =>
  SITUATIONAL.find((s) => s.slug === slug);
