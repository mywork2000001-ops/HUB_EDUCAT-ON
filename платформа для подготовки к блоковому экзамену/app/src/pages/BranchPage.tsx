import { useParams, Link } from 'react-router-dom';
import { getLessonsByBranch } from '@/data/lessons';
import { ProgressService } from '@/services/ProgressService';
import type { Branch } from '@/types';
import { CheckCircle2, Circle } from 'lucide-react';

export default function BranchPage() {
  const { branch } = useParams<{ branch: string }>();
  const lessons = branch ? getLessonsByBranch(branch) : [];

  if (!branch || lessons.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <p className="text-lg text-muted-foreground">
          {!branch ? 'Ветвь не указана' : `Уроки для ветви "${branch}" не найдены`}
        </p>
        <Link
          to="/"
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          На главную
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">
            Все ветви
          </Link>
          <span>/</span>
          <span>{branch as Branch}</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">{branch as Branch}</h1>
        <p className="text-muted-foreground">Доступно уроков: {lessons.length}</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {lessons.map((lesson) => {
          const completed = ProgressService.isCompleted(lesson.id);
          const score = ProgressService.getScore(lesson.id);
          return (
            <Link
              key={lesson.id}
              to={`/lesson/${lesson.id}`}
              className="flex items-center justify-between rounded-lg border bg-card p-4 hover:bg-accent hover:border-primary/50 transition-all"
            >
              <div className="flex items-center gap-3">
                {completed ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                )}
                <div>
                  <h3 className="font-medium">{lesson.title}</h3>
                  <p className="text-xs text-muted-foreground">{lesson.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {score && (
                  <span className="text-sm text-muted-foreground">
                    {score.points}/{score.maxPoints}
                  </span>
                )}
                <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary">
                  Открыть
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
