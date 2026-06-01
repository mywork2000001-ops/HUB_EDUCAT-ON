import type { Topic } from '@/types';

export const TOPICS: Topic[] = [
  // Темы будут добавлены здесь
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
