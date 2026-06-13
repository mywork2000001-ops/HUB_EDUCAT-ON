"use client";

import { useState } from "react";
import Link from "next/link";

export type ChapterChild = {
  id: number; slug: string; title_az: string; title_ru: string;
  order_index: number; _count: { resources: number };
};
export type Chapter = {
  id: number; slug: string; title_az: string; title_ru: string;
  order_index: number; _count: { resources: number };
  children: ChapterChild[];
};

const SUBJ_STYLE: Record<string, { badge: string; numBg: string }> = {
  "math":       { badge: "bg-blue-100 text-blue-700 border-blue-200",    numBg: "bg-blue-50 text-blue-600" },
  "block-exam": { badge: "bg-purple-100 text-purple-700 border-purple-200", numBg: "bg-purple-50 text-purple-600" },
  "taim-2026":  { badge: "bg-emerald-100 text-emerald-700 border-emerald-200", numBg: "bg-emerald-50 text-emerald-600" },
};
const DEFAULT_STYLE = { badge: "bg-slate-100 text-slate-600 border-slate-200", numBg: "bg-slate-100 text-slate-600" };

function ChapterRow({
  chapter, gradeSlug, subjectSlug, style,
}: {
  chapter: Chapter;
  gradeSlug: string;
  subjectSlug: string;
  style: { badge: string; numBg: string };
}) {
  const [open, setOpen] = useState(true);
  const hasChildren = chapter.children.length > 0;
  const chapterHref = `/dashboard/classes/${gradeSlug}/${subjectSlug}/${chapter.slug}`;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Chapter header */}
      <div
        className={`flex items-center gap-3 px-4 py-3 bg-slate-50 border-b border-slate-100 transition-colors ${
          hasChildren ? "cursor-pointer hover:bg-slate-100 select-none" : ""
        }`}
        onClick={() => hasChildren && setOpen((o) => !o)}
      >
        <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 border ${style.badge}`}>
          {chapter.order_index}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate">{chapter.title_az}</p>
          {chapter.title_ru && (
            <p className="text-xs text-slate-400 truncate">{chapter.title_ru}</p>
          )}
        </div>
        {hasChildren ? (
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-slate-400">{chapter.children.length} dərs</span>
            <span className="text-slate-300 text-xs">{open ? "▲" : "▼"}</span>
          </div>
        ) : (
          <Link
            href={chapterHref}
            onClick={(e) => e.stopPropagation()}
            className="shrink-0 text-xs text-indigo-600 hover:text-indigo-800 px-3 py-1
                       rounded-lg hover:bg-indigo-50 transition-colors font-medium border border-indigo-200"
          >
            Aç →
          </Link>
        )}
      </div>

      {/* Children */}
      {hasChildren && open && (
        <div className="divide-y divide-slate-100">
          {chapter.children.map((child, ci) => (
            <Link
              key={child.id}
              href={`/dashboard/classes/${gradeSlug}/${subjectSlug}/${child.slug}`}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors group"
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${style.numBg}`}>
                {ci + 1}
              </span>
              <p className="text-sm text-slate-700 group-hover:text-indigo-700 truncate flex-1 transition-colors">
                {child.title_az}
              </p>
              {child._count.resources > 0 && (
                <span className="text-[10px] text-slate-400 shrink-0 tabular-nums">
                  {child._count.resources} resurs
                </span>
              )}
              <span className="text-slate-200 group-hover:text-indigo-400 shrink-0 transition-colors">›</span>
            </Link>
          ))}
        </div>
      )}

      {/* Leaf topic resource count */}
      {!hasChildren && chapter._count.resources > 0 && (
        <div className="px-4 py-2 text-xs text-slate-400 border-t border-slate-100">
          {chapter._count.resources} resurs
        </div>
      )}
    </div>
  );
}

interface Props {
  chapters:    Chapter[];
  gradeSlug:   string;
  subjectSlug: string;
}

export function ChapterList({ chapters, gradeSlug, subjectSlug }: Props) {
  const style = SUBJ_STYLE[subjectSlug] ?? DEFAULT_STYLE;

  if (chapters.length === 0) {
    return (
      <div className="py-16 rounded-2xl bg-white border border-slate-200 shadow-sm text-center">
        <p className="text-4xl mb-3">📚</p>
        <p className="text-slate-400 text-sm">Bu fənn üçün mövzu tapılmadı.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {chapters.map((ch) => (
        <ChapterRow
          key={ch.id}
          chapter={ch}
          gradeSlug={gradeSlug}
          subjectSlug={subjectSlug}
          style={style}
        />
      ))}
    </div>
  );
}
