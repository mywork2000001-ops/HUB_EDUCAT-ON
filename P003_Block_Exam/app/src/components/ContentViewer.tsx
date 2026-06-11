import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '@/context/LangContext';
import { ProgressService } from '@/services/ProgressService';
import type { ContentMessage } from '@/types';

type Section = 'lesson' | 'test' | 'proof' | 'situational';

interface ContentViewerProps {
  itemId: string;
  section: Section;
  title: string;
  urlPath: string;
  backTo: string;
  backLabel: string;
  xp?: number;
}

export default function ContentViewer({
  itemId,
  section,
  title,
  urlPath,
  backTo,
  backLabel,
  xp = 10,
}: ContentViewerProps) {
  const navigate = useNavigate();
  const { t } = useLang();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [score, setScore] = useState<{ points: number; maxPoints: number } | null>(null);
  const [completed, setCompleted] = useState(() => ProgressService.isCompleted(section, itemId));

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      const data = event.data as ContentMessage;
      if (!data?.type) return;

      if (data.type === 'LESSON_COMPLETE' || data.type === 'SCORE_UPDATE') {
        const { points, maxPoints, timeSpentSeconds } = data.payload;
        if (points !== undefined && maxPoints !== undefined) {
          const scoreData = {
            points,
            maxPoints,
            timeSpentSeconds: timeSpentSeconds ?? 0,
            completedAt: new Date().toISOString(),
          };
          ProgressService.setScore(itemId, scoreData);
          setScore({ points, maxPoints });
        }
        if (data.type === 'LESSON_COMPLETE') {
          ProgressService.markCompleted(section, itemId, xp);
          setCompleted(true);
        }
      }
    },
    [itemId, section, xp],
  );

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleMessage]);

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(backTo)}
            className="px-3 py-1.5 text-sm rounded-md border border-border hover:bg-accent transition-colors"
          >
            ← {backLabel}
          </button>
          <h1 className="text-base font-semibold truncate">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          {completed && (
            <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 text-xs font-bold">
              ✅ {t({ az: 'Tamamlandı', ru: 'Завершено', en: 'Completed' })}
            </span>
          )}
          {score && (
            <span className="px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-bold">
              {score.points} / {score.maxPoints}
            </span>
          )}
          {!completed && (
            <button
              onClick={() => {
                ProgressService.markCompleted(section, itemId, xp);
                setCompleted(true);
              }}
              className="px-3 py-1.5 text-xs rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {t({ az: 'Tamamlandı işarələ', ru: 'Отметить выполненным', en: 'Mark complete' })}
            </button>
          )}
        </div>
      </div>

      {/* iframe */}
      <div className="flex-1 rounded-xl overflow-hidden border border-border bg-white min-h-[70vh]">
        <iframe
          ref={iframeRef}
          src={urlPath.replace(/^\//, '')}
          title={title}
          sandbox="allow-scripts allow-same-origin allow-forms"
          className="w-full h-full min-h-[70vh]"
        />
      </div>
    </div>
  );
}
