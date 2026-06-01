import { useParams, useNavigate } from 'react-router-dom';
import { useLang } from '@/context/LangContext';
import { getProofBySlug } from '@/data/proofs';
import ContentViewer from '@/components/ContentViewer';

export default function ProofViewPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { t } = useLang();

  const proof = slug ? getProofBySlug(slug) : undefined;

  if (!proof) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <p className="text-muted-foreground">
          {t({ az: 'İsbat tapılmadı', ru: 'Доказательство не найдено', en: 'Proof not found' })}
        </p>
        <button
          onClick={() => navigate('/proofs')}
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90"
        >
          {t({ az: 'İsbatlara qayıt', ru: 'К доказательствам', en: 'Back to proofs' })}
        </button>
      </div>
    );
  }

  return (
    <ContentViewer
      itemId={proof.id}
      section="proof"
      title={t(proof.title)}
      urlPath={proof.url_path}
      backTo="/proofs"
      backLabel={t({ az: 'İsbatlar', ru: 'Доказательства', en: 'Proofs' })}
      xp={25}
    />
  );
}
