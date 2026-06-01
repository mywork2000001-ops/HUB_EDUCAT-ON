import { Link } from 'react-router-dom';
import { useLang } from '@/context/LangContext';
import { ProgressService } from '@/services/ProgressService';
import { TESTS } from '@/data/tests';
import type { Difficulty, Test } from '@/types';

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

function TestCard({ test }: { test: Test }) {
  const { t } = useLang();
  const done = ProgressService.isCompleted('test', test.id);
  const score = ProgressService.getScore(test.id);

  return (
    <Link
      to={`/test/${test.slug}`}
      className={`flex flex-col gap-3 rounded-xl border bg-card p-4 hover:border-primary/50 hover:shadow-sm transition-all ${
        done ? 'border-emerald-200 dark:border-emerald-900' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {done ? <span className="text-emerald-500 text-lg">✅</span> : <span className="text-lg">📝</span>}
          <h3 className="font-bold text-sm leading-snug">{t(test.title)}</h3>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${DIFF_COLOR[test.difficulty]}`}>
          {t(DIFF_LABEL[test.difficulty])}
        </span>
      </div>

      <p className="text-xs text-muted-foreground leading-snug line-clamp-2">{t(test.description)}</p>

      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-auto">
        <span>🕐 {test.timeMinutes} {t({ az: 'dəq', ru: 'мин', en: 'min' })}</span>
        <span>❓ {test.questionCount} {t({ az: 'sual', ru: 'вопрос', en: 'q' })}</span>
        {test.year && <span>📅 {test.year}</span>}
        {score && (
          <span className="ml-auto font-semibold text-emerald-600">
            {score.points}/{score.maxPoints}
          </span>
        )}
      </div>
    </Link>
  );
}

export default function TestsPage() {
  const { t } = useLang();

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          📝 {t({ az: 'Testlər', ru: 'Тесты', en: 'Tests' })}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {t({
            az: 'DİM variantları və mövzu testləri',
            ru: 'Варианты DİM и тематические тесты',
            en: 'DİM variants and topic tests',
          })}
        </p>
      </div>

      {TESTS.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <span className="text-5xl">📝</span>
          <div>
            <p className="font-bold text-lg">
              {t({ az: 'Test yoxdur', ru: 'Тесты отсутствуют', en: 'No tests yet' })}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {t({
                az: 'Testlər tezliklə əlavə olunacaq',
                ru: 'Тесты будут добавлены в ближайшее время',
                en: 'Tests will be added soon',
              })}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TESTS.map((test) => (
            <TestCard key={test.id} test={test} />
          ))}
        </div>
      )}
    </div>
  );
}
