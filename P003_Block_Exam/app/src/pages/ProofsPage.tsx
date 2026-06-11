import { Link } from 'react-router-dom';
import { useLang } from '@/context/LangContext';
import { ProgressService } from '@/services/ProgressService';
import { PROOFS } from '@/data/proofs';
import type { Difficulty, Proof } from '@/types';

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

function ProofCard({ proof }: { proof: Proof }) {
  const { t } = useLang();
  const done = ProgressService.isCompleted('proof', proof.id);

  return (
    <Link
      to={`/proof/${proof.slug}`}
      className={`flex flex-col gap-3 rounded-xl border bg-card p-4 hover:border-primary/50 hover:shadow-sm transition-all ${
        done ? 'border-emerald-200 dark:border-emerald-900' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {done ? (
            <span className="text-emerald-500 text-lg">✅</span>
          ) : (
            <span className="text-lg">🔬</span>
          )}
          <h3 className="font-bold text-sm leading-snug">{t(proof.title)}</h3>
        </div>
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${DIFF_COLOR[proof.difficulty]}`}
        >
          {t(DIFF_LABEL[proof.difficulty])}
        </span>
      </div>

      <p className="text-xs text-muted-foreground leading-snug line-clamp-2">{t(proof.description)}</p>

      <div className="flex items-center justify-end mt-auto">
        <span className="text-xs font-medium text-muted-foreground">
          {done
            ? t({ az: 'Öyrənildi', ru: 'Изучено', en: 'Studied' })
            : t({ az: 'Öyrən', ru: 'Изучить', en: 'Study' })}
          {' →'}
        </span>
      </div>
    </Link>
  );
}

export default function ProofsPage() {
  const { t } = useLang();

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          🔬 {t({ az: 'İsbatlar', ru: 'Доказательства', en: 'Proofs' })}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {t({
            az: 'Formulların və teoremlərin əsaslandırılması',
            ru: 'Обоснование формул и теорем',
            en: 'Justification of formulas and theorems',
          })}
        </p>
      </div>

      {PROOFS.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <span className="text-5xl">🔬</span>
          <div>
            <p className="font-bold text-lg">
              {t({ az: 'İsbat yoxdur', ru: 'Доказательства отсутствуют', en: 'No proofs yet' })}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {t({
                az: 'İsbatlar tezliklə əlavə olunacaq',
                ru: 'Доказательства будут добавлены в ближайшее время',
                en: 'Proofs will be added soon',
              })}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PROOFS.map((proof) => (
            <ProofCard key={proof.id} proof={proof} />
          ))}
        </div>
      )}
    </div>
  );
}
