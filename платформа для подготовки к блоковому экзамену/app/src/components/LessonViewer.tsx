import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLessonById } from '@/data/lessons';
import { ProgressService } from '@/services/ProgressService';
import type { LessonMessage } from '@/types';

export default function LessonViewer() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [score, setScore] = useState<{
    points: number;
    maxPoints: number;
  } | null>(null);

  const lesson = lessonId ? getLessonById(lessonId) : undefined;

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      if (!lessonId) return;

      // Security: validate origin in production
      // if (event.origin !== window.location.origin) return;

      const data = event.data as LessonMessage;

      if (data?.type === 'LESSON_COMPLETE') {
        ProgressService.markCompleted(lessonId);
        if (data.payload.points && data.payload.maxPoints) {
          const scoreData = {
            points: data.payload.points,
            maxPoints: data.payload.maxPoints,
            timeSpentSeconds: data.payload.timeSpentSeconds ?? 0,
          };
          ProgressService.setScore(lessonId, scoreData);
          setScore({
            points: scoreData.points,
            maxPoints: scoreData.maxPoints,
          });
        }
      }

      if (data?.type === 'SCORE_UPDATE') {
        if (data.payload.points && data.payload.maxPoints) {
          const scoreData = {
            points: data.payload.points,
            maxPoints: data.payload.maxPoints,
            timeSpentSeconds: data.payload.timeSpentSeconds ?? 0,
          };
          ProgressService.setScore(lessonId, scoreData);
          setScore({
            points: scoreData.points,
            maxPoints: scoreData.maxPoints,
          });
        }
      }
    },
    [lessonId]
  );

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [handleMessage]);

  if (!lesson) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <p className="text-lg text-muted-foreground">Урок не найден</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          На главную
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/branch/${lesson.branch}`)}
            className="px-3 py-1.5 text-sm rounded-md border border-border hover:bg-accent transition-colors"
          >
            Назад
          </button>
          <h1 className="text-xl font-semibold">{lesson.title}</h1>
        </div>
        {score && (
          <div className="px-3 py-1.5 rounded-md bg-green-100 text-green-800 text-sm font-medium">
            Результат: {score.points} / {score.maxPoints}
          </div>
        )}
      </div>

      <div className="flex-1 rounded-lg overflow-hidden border border-border bg-white">
        <iframe
          ref={iframeRef}
          src={lesson.url_path}
          title={lesson.title}
          sandbox="allow-scripts allow-same-origin"
          className="w-full h-full min-h-[70vh]"
        />
      </div>
    </div>
  );
}
