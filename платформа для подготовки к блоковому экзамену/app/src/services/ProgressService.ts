import type { LessonScore, ProgressRecord } from '@/types';

const STORAGE_KEY = 'mathpath_progress';

const defaultRecord = (): ProgressRecord => ({
  completedLessons: [],
  lessonScores: {},
});

export class ProgressService {
  static load(): ProgressRecord {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultRecord();
      const parsed = JSON.parse(raw) as ProgressRecord;
      return {
        completedLessons: parsed.completedLessons ?? [],
        lessonScores: parsed.lessonScores ?? {},
      };
    } catch {
      return defaultRecord();
    }
  }

  private static save(record: ProgressRecord): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  }

  static markCompleted(lessonId: string): void {
    const record = this.load();
    if (!record.completedLessons.includes(lessonId)) {
      record.completedLessons.push(lessonId);
      this.save(record);
    }
  }

  static setScore(lessonId: string, score: LessonScore): void {
    const record = this.load();
    record.lessonScores[lessonId] = score;
    this.save(record);
  }

  static getScore(lessonId: string): LessonScore | null {
    const record = this.load();
    return record.lessonScores[lessonId] ?? null;
  }

  static isCompleted(lessonId: string): boolean {
    const record = this.load();
    return record.completedLessons.includes(lessonId);
  }

  static reset(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}
