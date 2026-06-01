export type Lang = 'az' | 'ru' | 'en';

export interface I18n {
  az: string;
  ru: string;
  en: string;
}

export type Difficulty = 1 | 2 | 3;

export type LessonType = 'theory' | 'examples' | 'practice';

export interface Lesson {
  id: string;
  topicId: string;
  type: LessonType;
  title: I18n;
  url_path: string;
  estimatedMinutes: number;
  questionCount?: number;
}

export interface Topic {
  id: string;
  slug: string;
  order: number;
  icon: string;
  title: I18n;
  description: I18n;
  difficulty: Difficulty;
  lessons: Lesson[];
}

export interface Test {
  id: string;
  slug: string;
  title: I18n;
  description: I18n;
  topicIds: string[];
  questionCount: number;
  timeMinutes: number;
  difficulty: Difficulty;
  url_path: string;
  year?: number;
}

export interface Proof {
  id: string;
  slug: string;
  title: I18n;
  description: I18n;
  topicId: string;
  difficulty: Difficulty;
  url_path: string;
}

export interface SituationalProblem {
  id: string;
  slug: string;
  title: I18n;
  description: I18n;
  context: I18n;
  topicIds: string[];
  difficulty: Difficulty;
  url_path: string;
}

export interface ItemScore {
  points: number;
  maxPoints: number;
  timeSpentSeconds: number;
  completedAt: string;
}

export interface ProgressRecord {
  completedLessons: string[];
  completedTests: string[];
  completedProofs: string[];
  completedSituational: string[];
  scores: Record<string, ItemScore>;
  streak: number;
  lastActiveDate: string;
  totalXP: number;
}

export type ContentMessageType = 'LESSON_COMPLETE' | 'SCORE_UPDATE';

export interface ContentMessage {
  type: ContentMessageType;
  payload: {
    itemId: string;
    points?: number;
    maxPoints?: number;
    timeSpentSeconds?: number;
  };
}
