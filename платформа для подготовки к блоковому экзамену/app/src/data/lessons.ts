import type { Lesson } from '@/types';

export const LESSONS: Lesson[] = [
  {
    id: 'theory-quadratic-001',
    title: 'Квадратные уравнения: теория и дискриминант',
    branch: 'Theory',
    url_path: '/lessons/theory-quadratic.html',
  },
  {
    id: 'testbank-derivatives-001',
    title: 'Тест: Производные функций',
    branch: 'TestBank',
    url_path: '/lessons/testbank-derivatives.html',
  },
  {
    id: 'situational-probability-001',
    title: 'Ситуация: Вероятность в быту',
    branch: 'Situational',
    url_path: '/lessons/situational-probability.html',
  },
];

export const getLessonsByBranch = (branch: string): Lesson[] =>
  LESSONS.filter((l) => l.branch === branch);

export const getLessonById = (id: string): Lesson | undefined =>
  LESSONS.find((l) => l.id === id);
