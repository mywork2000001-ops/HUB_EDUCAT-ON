import type { Test } from '@/types';

export const TESTS: Test[] = [
  // Тесты будут добавлены здесь
];

export const getTestBySlug = (slug: string): Test | undefined =>
  TESTS.find((t) => t.slug === slug);
