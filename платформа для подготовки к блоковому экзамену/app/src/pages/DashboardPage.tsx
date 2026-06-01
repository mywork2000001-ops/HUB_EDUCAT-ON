import { Link } from 'react-router-dom';
import { useLang } from '@/context/LangContext';
import { ProgressService } from '@/services/ProgressService';
import { TOPICS } from '@/data/topics';
import { TESTS } from '@/data/tests';
import { PROOFS } from '@/data/proofs';
import { SITUATIONAL } from '@/data/situational';

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  color: string;
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  return (
    <div className={`rounded-xl border bg-card p-4 flex items-center gap-4`}>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold leading-none">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{label}</p>
      </div>
    </div>
  );
}

interface SectionProgressProps {
  icon: string;
  label: string;
  completed: number;
  total: number;
  to: string;
  color: string;
}

function SectionProgress({ icon, label, completed, total, to, color }: SectionProgressProps) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <Link
      to={to}
      className="flex items-center gap-4 rounded-xl border bg-card p-4 hover:border-primary/50 hover:bg-accent/50 transition-colors"
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${color}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-1.5">
          <span className="text-sm font-semibold">{label}</span>
          <span className="text-xs text-muted-foreground">
            {completed}/{total}
          </span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${color.replace('bg-', 'bg-').replace('/10', '')}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <span className="text-xs font-bold text-muted-foreground w-9 text-right shrink-0">
        {pct}%
      </span>
    </Link>
  );
}

interface QuickLinkProps {
  to: string;
  icon: string;
  title: string;
  sub: string;
  colorClass: string;
}

function QuickLink({ to, icon, title, sub, colorClass }: QuickLinkProps) {
  return (
    <Link
      to={to}
      className={`flex flex-col gap-2 rounded-xl border p-4 hover:scale-[1.02] transition-transform ${colorClass}`}
    >
      <span className="text-2xl">{icon}</span>
      <p className="font-bold text-sm">{title}</p>
      <p className="text-xs text-muted-foreground leading-snug">{sub}</p>
    </Link>
  );
}

export default function DashboardPage() {
  const { t } = useLang();
  const progress = ProgressService.load();

  const totalTopicLessons = TOPICS.reduce((s, tp) => s + tp.lessons.length, 0);
  const completedLessons = progress.completedLessons.length;
  const completedTests = progress.completedTests.length;
  const completedProofs = progress.completedProofs.length;
  const completedSituational = progress.completedSituational.length;

  const sections = [
    {
      icon: '📚',
      label: t({ az: 'Mövzular', ru: 'Темы', en: 'Topics' }),
      completed: completedLessons,
      total: totalTopicLessons,
      to: '/topics',
      color: 'bg-blue-500/10 text-blue-600',
      bar: 'bg-blue-500',
    },
    {
      icon: '📝',
      label: t({ az: 'Testlər', ru: 'Тесты', en: 'Tests' }),
      completed: completedTests,
      total: TESTS.length,
      to: '/tests',
      color: 'bg-violet-500/10 text-violet-600',
      bar: 'bg-violet-500',
    },
    {
      icon: '🔬',
      label: t({ az: 'İsbatlar', ru: 'Доказательства', en: 'Proofs' }),
      completed: completedProofs,
      total: PROOFS.length,
      to: '/proofs',
      color: 'bg-emerald-500/10 text-emerald-600',
      bar: 'bg-emerald-500',
    },
    {
      icon: '🧩',
      label: t({ az: 'Situasiya', ru: 'Ситуационные', en: 'Situational' }),
      completed: completedSituational,
      total: SITUATIONAL.length,
      to: '/situational',
      color: 'bg-orange-500/10 text-orange-600',
      bar: 'bg-orange-500',
    },
  ];

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {t({
            az: 'Xoş gəldiniz 👋',
            ru: 'Добро пожаловать 👋',
            en: 'Welcome 👋',
          })}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t({
            az: 'DİM Riyaziyyat hazırlıq platforması',
            ru: 'Платформа подготовки к DİM по математике',
            en: 'DİM Mathematics preparation platform',
          })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          icon="⚡"
          label={t({ az: 'Ümumi XP', ru: 'Всего XP', en: 'Total XP' })}
          value={progress.totalXP}
          color="bg-yellow-500/10"
        />
        <StatCard
          icon="🔥"
          label={t({ az: 'Ardıcıllıq', ru: 'Серия дней', en: 'Streak' })}
          value={`${progress.streak} ${t({ az: 'gün', ru: 'дн', en: 'd' })}`}
          color="bg-orange-500/10"
        />
        <StatCard
          icon="✅"
          label={t({ az: 'Mövzu dərsi', ru: 'Урок тем', en: 'Topic lessons' })}
          value={`${completedLessons}/${totalTopicLessons}`}
          color="bg-blue-500/10"
        />
        <StatCard
          icon="📝"
          label={t({ az: 'Test', ru: 'Тестов', en: 'Tests done' })}
          value={`${completedTests}/${TESTS.length}`}
          color="bg-violet-500/10"
        />
      </div>

      {/* Section progress */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          {t({ az: 'Bölmələr üzrə tərəqqi', ru: 'Прогресс по разделам', en: 'Progress by section' })}
        </h2>
        <div className="flex flex-col gap-2">
          {sections.map((s) => (
            <SectionProgress key={s.to} {...s} />
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          {t({ az: 'Tez başla', ru: 'Быстрый старт', en: 'Quick start' })}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <QuickLink
            to="/topics"
            icon="📚"
            title={t({ az: 'Mövzular', ru: 'Темы', en: 'Topics' })}
            sub={t({ az: 'Nəzəriyyə və nümunələr', ru: 'Теория и примеры', en: 'Theory & examples' })}
            colorClass="border-blue-200 dark:border-blue-900"
          />
          <QuickLink
            to="/tests"
            icon="📝"
            title={t({ az: 'Testlər', ru: 'Тесты', en: 'Tests' })}
            sub={t({ az: 'DİM variantları', ru: 'Варианты DİM', en: 'DİM variants' })}
            colorClass="border-violet-200 dark:border-violet-900"
          />
          <QuickLink
            to="/proofs"
            icon="🔬"
            title={t({ az: 'İsbatlar', ru: 'Доказательства', en: 'Proofs' })}
            sub={t({ az: 'Formulların əsaslandırılması', ru: 'Обоснование формул', en: 'Formula proofs' })}
            colorClass="border-emerald-200 dark:border-emerald-900"
          />
          <QuickLink
            to="/situational"
            icon="🧩"
            title={t({ az: 'Situasiya', ru: 'Ситуационные', en: 'Situational' })}
            sub={t({ az: 'Həyati məsələlər', ru: 'Жизненные задачи', en: 'Real-world problems' })}
            colorClass="border-orange-200 dark:border-orange-900"
          />
        </div>
      </div>
    </div>
  );
}
