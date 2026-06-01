import { useParams, useNavigate } from 'react-router-dom';
import { useLang } from '@/context/LangContext';
import { getSituationalBySlug } from '@/data/situational';
import ContentViewer from '@/components/ContentViewer';

export default function SituationalViewPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { t } = useLang();

  const problem = slug ? getSituationalBySlug(slug) : undefined;

  if (!problem) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <p className="text-muted-foreground">
          {t({ az: 'Məsələ tapılmadı', ru: 'Задача не найдена', en: 'Problem not found' })}
        </p>
        <button
          onClick={() => navigate('/situational')}
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90"
        >
          {t({ az: 'Məsələlərə qayıt', ru: 'К задачам', en: 'Back to problems' })}
        </button>
      </div>
    );
  }

  return (
    <ContentViewer
      itemId={problem.id}
      section="situational"
      title={t(problem.title)}
      urlPath={problem.url_path}
      backTo="/situational"
      backLabel={t({ az: 'Situasiya məsələləri', ru: 'Ситуационные задачи', en: 'Situational problems' })}
      xp={30}
    />
  );
}
