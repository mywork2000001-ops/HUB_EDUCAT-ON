import { Link } from 'react-router-dom';
import { useLang } from '@/context/LangContext';
import { ProgressService } from '@/services/ProgressService';
import { SITUATIONAL } from '@/data/situational';
import type { Difficulty, SituationalProblem } from '@/types';

const DIFF_COLOR: Record<Difficulty, string> = {
  1: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
  2: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  3: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
};

const DIFF_LABEL: Record<Difficulty, { az: string; ru: string; en: string }> = {
  1: { az: 'Asan', ru: 'Лёгкий', en: 'Easy' },
  2: { az: 'Orta', ru: 'Средний', en: 'Medium' },
  3: { az: 'Çətin', ru: 'Сложный', en: 'Hard' },
};

function ProblemCard({ problem }: { problem: SituationalProblem }) {
  const { t } = useLang();
  const done = ProgressService.isCompleted('situational', problem.id);

  return (
    <Link
      to={`/situational/${problem.slug}`}
      className={`flex flex-col gap-3 rounded-xl border bg-card p-4 hover:border-primary/50 hover:shadow-sm transition-all ${
        done ? 'border-emerald-200 dark:border-emerald-900' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {done ? (
            <span className="text-emerald-500 text-lg">✅</span>
          ) : (
            <span className="text-lg">🧩</span>
          )}
          <h3 className="font-bold text-sm leading-snug">{t(problem.title)}</h3>
        </div>
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${DIFF_COLOR[problem.difficulty]}`}
        >
          {t(DIFF_LABEL[problem.difficulty])}
        </span>
      </div>

      {/* Real-world context badge */}
      <div className="flex items-start gap-1.5">
        <span className="text-xs">🌍</span>
        <p className="text-xs text-muted-foreground italic leading-snug line-clamp-2">
          {t(problem.context)}
        </p>
      </div>

      <p className="text-xs text-muted-foreground leading-snug line-clamp-2">{t(problem.description)}</p>

      <div className="flex items-center justify-end mt-auto">
        <span className="text-xs font-medium text-muted-foreground">
          {done
            ? t({ az: 'Həll edildi', ru: 'Решено', en: 'Solved' })
            : t({ az: 'Həll et', ru: 'Решить', en: 'Solve' })}
          {' →'}
        </span>
      </div>
    </Link>
  );
}

export default function SituationalPage() {
  const { t } = useLang();

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          🧩 {t({ az: 'Situasiya Məsələləri', ru: 'Ситуационные задачи', en: 'Situational Problems' })}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {t({
            az: 'Real həyat kontekstlərindəki riyaziyyat məsələləri',
            ru: 'Математические задачи в контексте реальной жизни',
            en: 'Mathematics problems in real-life contexts',
          })}
        </p>
      </div>

      {SITUATIONAL.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <span className="text-5xl">🧩</span>
          <div>
            <p className="font-bold text-lg">
              {t({ az: 'Məsələ yoxdur', ru: 'Задачи отсутствуют', en: 'No problems yet' })}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {t({
                az: 'Situasiya məsələləri tezliklə əlavə olunacaq',
                ru: 'Ситуационные задачи будут добавлены в ближайшее время',
                en: 'Situational problems will be added soon',
              })}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SITUATIONAL.map((problem) => (
            <ProblemCard key={problem.id} problem={problem} />
          ))}
        </div>
      )}
    </div>
  );
}
