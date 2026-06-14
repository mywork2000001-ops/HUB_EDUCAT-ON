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

const HUB_URL = 'https://hub-educat-on.vercel.app/api/results';

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
  const iframeRef  = useRef<HTMLIFrameElement>(null);
  const startedAt  = useRef(new Date().toISOString());
  const [score, setScore]       = useState<{ points: number; maxPoints: number } | null>(null);
  const [completed, setCompleted] = useState(() => ProgressService.isCompleted(section, itemId));

  // Reset timer when a new item is opened
  useEffect(() => {
    startedAt.current = new Date().toISOString();
    setCompleted(ProgressService.isCompleted(section, itemId));
    setScore(null);
  }, [itemId, section]);

  // ── Send result to EduHub ─────────────────────────────────────────────────
  const sendToHub = useCallback((scoreVal: number, total: number) => {
    if (total <= 0) return;
    const name = localStorage.getItem('eduhub_student_name')
               || localStorage.getItem('dim_student_name')
               || 'Şagird';
    const cls  = localStorage.getItem('eduhub_student_class')
               || localStorage.getItem('dim_student_class')
               || '';
    fetch(HUB_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_name:  name,
        student_class: cls,
        platform:      'P003',
        lesson_id:     itemId,
        lesson_title:  title,
        score:         scoreVal,
        total,
        percent:       Math.round((scoreVal / total) * 100),
        answers:       {},
        started_at:    startedAt.current,
        finished_at:   new Date().toISOString(),
      }),
    }).catch(() => {});
  }, [itemId, title]);

  // ── postMessage handler (for HTML files that DO send postMessage) ─────────
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
          if (points !== undefined && maxPoints !== undefined) {
            sendToHub(points, maxPoints);
          }
        }
      }
    },
    [itemId, section, xp, sendToHub],
  );

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleMessage]);

  // ── Inject hub reporter into iframe on load ───────────────────────────────
  // HTML test files use showResult()/showResults() without postMessage.
  // allow-same-origin lets us access contentWindow directly.
  const handleIframeLoad = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const iw = iframe.contentWindow as (Window & typeof globalThis) | null;
    if (!iw) return;

    // Snapshot closure values so they stay correct even if props change mid-session
    const snapItemId = itemId;
    const snapTitle  = title;
    const snapStart  = startedAt.current;

    function postHub(sc: number, tot: number) {
      const name = localStorage.getItem('eduhub_student_name')
                 || localStorage.getItem('dim_student_name')
                 || 'Şagird';
      const cls  = localStorage.getItem('eduhub_student_class')
                 || localStorage.getItem('dim_student_class')
                 || '';
      fetch(HUB_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_name:  name,
          student_class: cls,
          platform:      'P003',
          lesson_id:     snapItemId,
          lesson_title:  snapTitle,
          score:         sc,
          total:         tot,
          percent:       Math.round((sc / tot) * 100),
          answers:       {},
          started_at:    snapStart,
          finished_at:   new Date().toISOString(),
        }),
      }).catch(() => {});
    }

    // Use unknown cast to safely access dynamic window properties
    const iwAny = iw as unknown as Record<string, unknown>;

    // Patch showResult() — P003 quiz-engine format
    const origSR = iwAny.showResult as ((...a: unknown[]) => void) | undefined;
    if (typeof origSR === 'function') {
      iwAny.showResult = function (...args: unknown[]) {
        origSR.apply(iw, args);
        setTimeout(() => {
          try {
            const sub = iframe.contentDocument?.getElementById('resSub');
            if (sub) {
              const m = sub.textContent?.match(/(\d+)\s*\/\s*(\d+)/);
              if (m) postHub(parseInt(m[1], 10), parseInt(m[2], 10));
            }
          } catch { /* ignore */ }
        }, 300);
      };
    }

    // Patch showResults() — P002/P001 format, as fallback
    const origSRS = iwAny.showResults as ((c: number, tot: number, ...a: unknown[]) => void) | undefined;
    if (typeof origSRS === 'function') {
      iwAny.showResults = function (correct: number, tot: number, ...rest: unknown[]) {
        origSRS.apply(iw, [correct, tot, ...rest]);
        postHub(correct, tot);
      };
    }
  }, [itemId, title]);

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
          onLoad={handleIframeLoad}
        />
      </div>
    </div>
  );
}
