export type Branch = 'Theory' | 'TestBank' | 'Situational' | 'Proofs';

export interface Lesson {
  id: string;
  title: string;
  branch: Branch;
  url_path: string;
}

export interface LessonScore {
  points: number;
  maxPoints: number;
  timeSpentSeconds: number;
}

export interface ProgressRecord {
  completedLessons: string[];
  lessonScores: Record<string, LessonScore>;
}

export interface LessonMessage {
  type: 'LESSON_COMPLETE' | 'SCORE_UPDATE';
  payload: {
    lessonId: string;
    points?: number;
    maxPoints?: number;
    timeSpentSeconds?: number;
  };
}
