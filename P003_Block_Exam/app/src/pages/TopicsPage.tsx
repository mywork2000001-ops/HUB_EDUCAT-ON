import { Link } from 'react-router-dom';
import { useLang } from '@/context/LangContext';
import { ProgressService } from '@/services/ProgressService';
import { TOPICS } from '@/data/topics';
import type { Difficulty, Topic } from '@/types';

const DIFF_LABEL: Record<Difficulty, { az: string; ru: string; en: string }> = {
  1: { az: 'Asan', ru: 'Лёгкий', en: 'Easy' },
  2: { az: 'Orta', ru: 'Средний', en: 'Medium' },
  3: { az: 'Çətin', ru: 'Сложный', en: 'Hard' },
};

const DIFF_COLOR: Record<Difficulty, string> = {
  1: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
  2: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  3: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
};

function TopicCard({ topic }: { topic: Topic }) {
  const { t } = useLang();
  const progress = ProgressService.load();
  const done = topic.lessons.filter((l) => progress.completedLessons.includes(l.id)).length;
  const total = topic.lessons.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <Link
      to={`/topic/${topic.slug}`}
      className="flex flex-col gap-3 rounded-xl border bg-card p-4 hover:border-primary/50 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="text-2xl leading-none">{topic.icon}</span>
          <h3 className="font-bold text-sm leading-snug">{t(topic.title)}</h3>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${DIFF_COLOR[topic.difficulty]}`}>
          {t(DIFF_LABEL[topic.difficulty])}
        </span>
      </div>

      <p className="text-xs text-muted-foreground leading-snug line-clamp-2">{t(topic.description)}</p>

      <div>
        <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
          <span>{t({ az: 'Dərslər', ru: 'Уроки', en: 'Lessons' })}</span>
          <span>{done}/{total}</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </Link>
  );
}

function EmptyState() {
  const { t } = useLang();
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      <span className="text-5xl">📚</span>
      <div>
        <p className="font-bold text-lg">
          {t({ az: 'Mövzu yoxdur', ru: 'Темы отсутствуют', en: 'No topics yet' })}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {t({
            az: 'Tezliklə mövzular əlavə olunacaq',
            ru: 'Темы будут добавлены в ближайшее время',
            en: 'Topics will be added soon',
          })}
        </p>
      </div>
    </div>
  );
}

export default function TopicsPage() {
  const { t } = useLang();

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          📚 {t({ az: 'Mövzular', ru: 'Темы', en: 'Topics' })}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {t({
            az: 'Nəzəriyyə, nümunələr və praktika tapşırıqları',
            ru: 'Теория, примеры и практические задания',
            en: 'Theory, examples and practice tasks',
          })}
        </p>
      </div>

      {TOPICS.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TOPICS.sort((a, b) => a.order - b.order).map((topic) => (
            <TopicCard key={topic.id} topic={topic} />
          ))}
        </div>
      )}
    </div>
  );
}
