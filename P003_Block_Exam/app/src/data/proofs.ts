import type { Proof } from '@/types';

export const PROOFS: Proof[] = [
  {
    id: 'proof-pythagoras',
    slug: 'proof-pythagoras',
    title: {
      az: 'Pifaqor Teoreminin İsbatı',
      ru: 'Доказательство теоремы Пифагора',
      en: "Proof of Pythagoras' Theorem",
    },
    description: {
      az: 'Düzbucaqlı üçbucaqda hipotenuzun katetlər vasitəsilə ifadəsi',
      ru: 'Квадрат гипотенузы равен сумме квадратов катетов',
      en: 'The square of the hypotenuse equals the sum of the squares of the legs',
    },
    topicId: 'topic-15',
    difficulty: 2,
    url_path: '/lessons/proofs/proof-pythagoras.html',
  },
  {
    id: 'proof-triangle-angles',
    slug: 'proof-triangle-angles',
    title: {
      az: 'Üçbucaq Daxili Bucaqlarının Cəmi',
      ru: 'Сумма углов треугольника',
      en: 'Sum of Angles in a Triangle',
    },
    description: {
      az: 'Hər üçbucağın daxili bucaqlarının cəmi 180° bərabərdir',
      ru: 'Сумма внутренних углов любого треугольника равна 180°',
      en: 'The sum of interior angles of any triangle equals 180°',
    },
    topicId: 'topic-15',
    difficulty: 1,
    url_path: '/lessons/proofs/proof-triangle-angles.html',
  },
  {
    id: 'proof-vieta',
    slug: 'proof-vieta',
    title: {
      az: 'Vieta Teoreminin İsbatı',
      ru: 'Доказательство теоремы Виета',
      en: "Proof of Vieta's Theorem",
    },
    description: {
      az: 'İkinci dərəcəli tənliyin kökləri əmsallarla necə əlaqələnir',
      ru: 'Связь корней квадратного уравнения с его коэффициентами',
      en: 'How roots of a quadratic relate to its coefficients',
    },
    topicId: 'topic-09',
    difficulty: 2,
    url_path: '/lessons/proofs/proof-vieta.html',
  },
];

export const getProofBySlug = (slug: string): Proof | undefined =>
  PROOFS.find((p) => p.slug === slug);
