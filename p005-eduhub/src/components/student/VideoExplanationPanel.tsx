"use client";

import { useState } from "react";

type VideoItem = { title: string; content_url: string; slug: string };

function getYtId(url: string) {
  return url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([^&?/\s]{11})/)?.[1] ?? null;
}

interface Props {
  videos:   VideoItem[];
  lang:     "az" | "ru";
  basePath: string;
}

export function VideoExplanationPanel({ videos, lang }: Props) {
  const [activeIdx, setActiveIdx] = useState(0);
  const active = videos[activeIdx];
  const ytId   = getYtId(active.content_url);

  return (
    <div className="bg-slate-900 border-b border-slate-700 shrink-0">
      {/* Panel header */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-slate-800">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-rose-400">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          {lang === "ru" ? "Видео объяснение учителя" : "Müəllim vidyo izahatı"}
        </span>
        {videos.length > 1 && (
          <div className="flex items-center gap-1 ml-2">
            {videos.map((v, i) => (
              <button
                key={v.slug}
                onClick={() => setActiveIdx(i)}
                className={`text-xs px-2.5 py-0.5 rounded-full transition-colors font-medium ${
                  i === activeIdx
                    ? "bg-rose-500 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-700"
                }`}
              >
                {i + 1}. {v.title.slice(0, 20)}{v.title.length > 20 ? "…" : ""}
              </button>
            ))}
          </div>
        )}
        <a
          href={`?vidopen=0`}
          className="ml-auto text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          ✕ {lang === "ru" ? "Закрыть" : "Bağla"}
        </a>
      </div>

      {/* Video */}
      <div className="flex" style={{ height: "280px" }}>
        {ytId ? (
          <iframe
            key={ytId}
            src={`https://www.youtube.com/embed/${ytId}?rel=0&autoplay=1`}
            className="w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={active.title}
          />
        ) : (
          <video
            key={active.content_url}
            src={active.content_url}
            controls
            autoPlay
            className="w-full"
          />
        )}
      </div>
    </div>
  );
}
