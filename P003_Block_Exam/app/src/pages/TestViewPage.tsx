import { useParams, useNavigate } from 'react-router-dom';
import { useLang } from '@/context/LangContext';
import { getTestBySlug } from '@/data/tests';
import ContentViewer from '@/components/ContentViewer';

export default function TestViewPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { t } = useLang();

  const test = slug ? getTestBySlug(slug) : undefined;

  if (!test) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <p className="text-muted-foreground">
          {t({ az: 'Test tapılmadı', ru: 'Тест не найден', en: 'Test not found' })}
        </p>
        <button
          onClick={() => navigate('/tests')}
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90"
        >
          {t({ az: 'Testlərə qayıt', ru: 'К тестам', en: 'Back to tests' })}
        </button>
      </div>
    );
  }

  return (
    <ContentViewer
      itemId={test.id}
      section="test"
      title={t(test.title)}
      urlPath={test.url_path}
      backTo="/tests"
      backLabel={t({ az: 'Testlər', ru: 'Тесты', en: 'Tests' })}
      xp={20}
    />
  );
}
