import type { Proof } from '@/types';

export const PROOFS: Proof[] = [
  // Доказательства будут добавлены здесь
];

export const getProofBySlug = (slug: string): Proof | undefined =>
  PROOFS.find((p) => p.slug === slug);
