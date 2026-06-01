import { useParams, useNavigate } from 'react-router-dom';
import { useLang } from '@/context/LangContext';
import { getLessonById } from '@/data/topics';
import ContentViewer from '@/components/ContentViewer';

export default function TopicLessonPage() {
  const { slug, lessonId } = useParams<{ slug: string; lessonId: string }>();
  const navigate = useNavigate();
  const { t } = useLang();

  const found = lessonId ? getLessonById(lessonId) : null;

  if (!found || found.topic.slug !== slug) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <p className="text-muted-foreground">
          {t({ az: 'Dərs tapılmadı', ru: 'Урок не найден', en: 'Lesson not found' })}
        </p>
        <button
          onClick={() => navigate(`/topic/${slug}`)}
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90"
        >
          {t({ az: 'Mövzuya qayıt', ru: 'К теме', en: 'Back to topic' })}
        </button>
      </div>
    );
  }

  const { topic, lesson } = found;

  return (
    <ContentViewer
      itemId={lesson.id}
      section="lesson"
      title={t(lesson.title)}
      urlPath={lesson.url_path}
      backTo={`/topic/${topic.slug}`}
      backLabel={t(topic.title)}
      xp={15}
    />
  );
}
