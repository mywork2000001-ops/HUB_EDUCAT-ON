import type { SituationalProblem } from '@/types';

export const SITUATIONAL: SituationalProblem[] = [
  // Ситуационные задачи будут добавлены здесь
];

export const getSituationalBySlug = (slug: string): SituationalProblem | undefined =>
  SITUATIONAL.find((s) => s.slug === slug);
