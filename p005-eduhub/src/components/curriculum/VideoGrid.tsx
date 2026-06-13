import Link from "next/link";
import type { ResourceRow } from "@/server/queries/resources";
import type { Lang } from "@/lib/constants";
import { extractYouTubeId, isDirectVideo } from "@/lib/utils";

interface Props {
  videos:   ResourceRow[];
  basePath: string;
  lang?:    Lang;
}

function VideoCard({ video, href, lang }: { video: ResourceRow; href: string; lang: Lang }) {
  const title    = lang === "az" ? video.title_az : video.title_ru;
  const ytId     = video.content_url ? extractYouTubeId(video.content_url) : null;
  const isDirect = video.content_url ? isDirectVideo(video.content_url) : false;
  const meta     = video.metadata as Record<string, unknown> | null;
  const duration = typeof meta?.duration_min === "number" ? meta.duration_min : null;

  return (
    <Link href={href}
      className="group block rounded-xl overflow-hidden bg-white border border-slate-200
                 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all">

      {/* Thumbnail */}
      <div className="relative aspect-video bg-slate-100 overflow-hidden">
        {ytId ? (
          <img
            src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : isDirect ? (
          <div className="w-full h-full flex items-center justify-center bg-slate-900">
            <span className="text-4xl">🎬</span>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-100 to-rose-100">
            <span className="text-4xl">▶️</span>
          </div>
        )}

        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center
                          group-hover:bg-indigo-600/90 transition-colors shadow-lg">
            <svg className="w-5 h-5 text-white ml-1" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        {/* Duration badge */}
        {duration && (
          <span className="absolute bottom-2 right-2 bg-black/75 text-white text-[10px]
                           font-medium px-1.5 py-0.5 rounded tabular-nums">
            {duration} dəq
          </span>
        )}

        {/* YouTube badge */}
        {ytId && (
          <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px]
                           font-bold px-1.5 py-0.5 rounded">
            YouTube
          </span>
        )}
      </div>

      {/* Title */}
      <div className="px-3 py-2.5">
        <p className="text-sm font-semibold text-slate-800 group-hover:text-indigo-700
                      leading-snug line-clamp-2 transition-colors">
          {title}
        </p>
        {!video.content_url && (
          <p className="text-[11px] text-slate-400 mt-1">
            {lang === "az" ? "Tezliklə əlavə ediləcək" : "Скоро будет добавлено"}
          </p>
        )}
      </div>
    </Link>
  );
}

export function VideoGrid({ videos, basePath, lang = "az" }: Props) {
  if (videos.length === 0) {
    return (
      <div className="py-16 rounded-2xl bg-white border border-slate-200 text-center shadow-sm">
        <p className="text-5xl mb-3">🎬</p>
        <p className="text-slate-500 text-sm font-medium">
          {lang === "az" ? "Video dərs yoxdur" : "Видеоуроки не найдены"}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {videos.map((v) => (
        <VideoCard
          key={v.id}
          video={v}
          href={`${basePath}/${v.slug}`}
          lang={lang}
        />
      ))}
    </div>
  );
}
