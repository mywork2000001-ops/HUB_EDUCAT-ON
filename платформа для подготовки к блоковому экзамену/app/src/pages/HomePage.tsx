import { Link } from 'react-router-dom';
import { BookOpen, ClipboardCheck, Brain, FlaskConical } from 'lucide-react';
import { ProgressService } from '@/services/ProgressService';
import type { Branch } from '@/types';

const BRANCHES: { id: Branch; label: string; desc: string; icon: typeof BookOpen }[] = [
  { id: 'Theory', label: 'Theory', desc: 'Теоретические материалы и конспекты', icon: BookOpen },
  { id: 'TestBank', label: 'Test Bank', desc: 'Банк тестовых заданий', icon: ClipboardCheck },
  { id: 'Situational', label: 'Situational', desc: 'Ситуационные задачи', icon: Brain },
  { id: 'Proofs', label: 'Proofs', desc: 'Доказательства и выводы', icon: FlaskConical },
];

export default function HomePage() {
  const completedCount = ProgressService.load().completedLessons.length;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Образовательная платформа по математике</h1>
        <p className="text-muted-foreground">
          Выберите ветвь обучения. Завершено уроков: {completedCount}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {BRANCHES.map((branch) => {
          const Icon = branch.icon;
          return (
            <Link
              key={branch.id}
              to={`/branch/${branch.id}`}
              className="group flex flex-col gap-3 rounded-xl border bg-card p-6 hover:bg-accent hover:border-primary/50 transition-all"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">{branch.label}</h3>
                <p className="text-sm text-muted-foreground mt-1">{branch.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
