import { Link, useParams, useNavigate } from 'react-router-dom';
import { useLang } from '@/context/LangContext';
import { ProgressService } from '@/services/ProgressService';
import { getTopicBySlug } from '@/data/topics';
import type { Lesson, LessonType } from '@/types';

const TYPE_META: Record<LessonType, { icon: string; label: { az: string; ru: string; en: string } }> = {
  theory: {
    icon: '📖',
    label: { az: 'Nəzəriyyə', ru: 'Теория', en: 'Theory' },
  },
  examples: {
    icon: '✏️',
    label: { az: 'Nümunələr', ru: 'Примеры', en: 'Examples' },
  },
  practice: {
    icon: '🏋️',
    label: { az: 'Praktika', ru: 'Практика', en: 'Practice' },
  },
};

function LessonRow({ lesson, topicSlug }: { lesson: Lesson; topicSlug: string }) {
  const { t } = useLang();
  const meta = TYPE_META[lesson.type];
  const done = ProgressService.isCompleted('lesson', lesson.id);

  return (
    <Link
      to={`/topic/${topicSlug}/lesson/${lesson.id}`}
      className="flex items-center justify-between rounded-lg border bg-card px-4 py-3 hover:border-primary/50 hover:bg-accent/50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <span className="text-lg leading-none">{done ? '✅' : meta.icon}</span>
        <div>
          <p className="text-sm font-semibold">{t(lesson.title)}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px] text-muted-foreground">{t(meta.label)}</span>
            {lesson.estimatedMinutes > 0 && (
              <>
                <span className="text-muted-foreground/40">·</span>
                <span className="text-[11px] text-muted-foreground">
                  {lesson.estimatedMinutes} {t({ az: 'dəq', ru: 'мин', en: 'min' })}
                </span>
              </>
            )}
            {lesson.questionCount && (
              <>
                <span className="text-muted-foreground/40">·</span>
                <span className="text-[11px] text-muted-foreground">
                  {lesson.questionCount} {t({ az: 'sual', ru: 'вопр', en: 'q' })}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
      <span className="text-xs font-medium text-muted-foreground">
        {done
          ? t({ az: 'Tamamlandı', ru: 'Готово', en: 'Done' })
          : t({ az: 'Başla', ru: 'Начать', en: 'Start' })}
        {' →'}
      </span>
    </Link>
  );
}

export default function TopicDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { t } = useLang();

  const topic = slug ? getTopicBySlug(slug) : undefined;

  if (!topic) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <p className="text-lg text-muted-foreground">
          {t({ az: 'Mövzu tapılmadı', ru: 'Тема не найдена', en: 'Topic not found' })}
        </p>
        <button
          onClick={() => navigate('/topics')}
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors"
        >
          {t({ az: 'Mövzulara qayıt', ru: 'К темам', en: 'Back to topics' })}
        </button>
      </div>
    );
  }

  const progress = ProgressService.load();
  const done = topic.lessons.filter((l) => progress.completedLessons.includes(l.id)).length;
  const total = topic.lessons.length;

  const byType: Record<LessonType, Lesson[]> = { theory: [], examples: [], practice: [] };
  for (const lesson of topic.lessons) {
    byType[lesson.type].push(lesson);
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/topics" className="hover:text-foreground transition-colors">
          {t({ az: 'Mövzular', ru: 'Темы', en: 'Topics' })}
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">{t(topic.title)}</span>
      </div>

      {/* Header */}
      <div className="flex items-start gap-4">
        <span className="text-4xl leading-none mt-1">{topic.icon}</span>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{t(topic.title)}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t(topic.description)}</p>
          <div className="flex items-center gap-3 mt-3">
            <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: total > 0 ? `${Math.round((done / total) * 100)}%` : '0%' }}
              />
            </div>
            <span className="text-xs text-muted-foreground shrink-0">
              {done}/{total} {t({ az: 'dərs', ru: 'уроков', en: 'lessons' })}
            </span>
          </div>
        </div>
      </div>

      {/* Lessons by type */}
      {(Object.entries(byType) as [LessonType, Lesson[]][]).map(([type, lessons]) => {
        if (lessons.length === 0) return null;
        const meta = TYPE_META[type];
        return (
          <div key={type}>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              {meta.icon} {t(meta.label)}
            </h2>
            <div className="flex flex-col gap-2">
              {lessons.map((lesson) => (
                <LessonRow key={lesson.id} lesson={lesson} topicSlug={topic.slug} />
              ))}
            </div>
          </div>
        );
      })}

      {topic.lessons.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-4xl mb-3">📭</p>
          <p className="font-medium">
            {t({ az: 'Dərslər hələ əlavə edilməyib', ru: 'Уроки пока не добавлены', en: 'No lessons yet' })}
          </p>
        </div>
      )}
    </div>
  );
}
