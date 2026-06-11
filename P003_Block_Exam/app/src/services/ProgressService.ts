import type { ItemScore, ProgressRecord } from '@/types';

const STORAGE_KEY = 'dim_progress';

type Section = 'lesson' | 'test' | 'proof' | 'situational';

const defaultRecord = (): ProgressRecord => ({
  completedLessons: [],
  completedTests: [],
  completedProofs: [],
  completedSituational: [],
  scores: {},
  streak: 0,
  lastActiveDate: '',
  totalXP: 0,
});

export class ProgressService {
  static load(): ProgressRecord {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultRecord();
      return { ...defaultRecord(), ...(JSON.parse(raw) as Partial<ProgressRecord>) };
    } catch {
      return defaultRecord();
    }
  }

  private static save(r: ProgressRecord): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(r));
  }

  private static updateStreak(r: ProgressRecord): void {
    const today = new Date().toISOString().slice(0, 10);
    if (r.lastActiveDate === today) return;
    const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
    r.streak = r.lastActiveDate === yesterday ? r.streak + 1 : 1;
    r.lastActiveDate = today;
  }

  static markCompleted(section: Section, id: string, xp = 10): void {
    const r = this.load();
    const key = `completed${section.charAt(0).toUpperCase() + section.slice(1)}s` as
      | 'completedLessons'
      | 'completedTests'
      | 'completedProofs'
      | 'completedSituational';
    if (!r[key].includes(id)) {
      r[key].push(id);
      r.totalXP += xp;
      this.updateStreak(r);
    }
    this.save(r);
  }

  static setScore(id: string, score: ItemScore): void {
    const r = this.load();
    r.scores[id] = score;
    this.save(r);
  }

  static getScore(id: string): ItemScore | null {
    return this.load().scores[id] ?? null;
  }

  static isCompleted(section: Section, id: string): boolean {
    const r = this.load();
    const key = `completed${section.charAt(0).toUpperCase() + section.slice(1)}s` as
      | 'completedLessons'
      | 'completedTests'
      | 'completedProofs'
      | 'completedSituational';
    return r[key].includes(id);
  }

  static reset(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}
