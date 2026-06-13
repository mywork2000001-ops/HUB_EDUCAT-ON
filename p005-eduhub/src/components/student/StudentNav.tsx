"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

interface Crumb {
  label: string;
  href?: string;
}

interface Props {
  title:    string;
  crumbs?:  Crumb[];
  backHref: string;
  lang?:    "az" | "ru";
}

export function StudentNav({ title, crumbs, backHref, lang = "az" }: Props) {
  const router = useRouter();

  async function toggleLang() {
    const newLang = lang === "az" ? "ru" : "az";
    await fetch("/api/lang", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lang: newLang }),
    });
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">

        {/* Back button */}
        <Link
          href={backHref}
          className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-500
                     hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0"
          aria-label="Geri"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>

        {/* Title + breadcrumbs */}
        <div className="flex-1 min-w-0">
          {crumbs && crumbs.length > 0 && (
            <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-0.5 truncate">
              {crumbs.map((c, i) => (
                <span key={i} className="flex items-center gap-1 shrink-0">
                  {i > 0 && <span className="text-slate-300">/</span>}
                  {c.href ? (
                    <Link href={c.href} className="hover:text-slate-600 transition-colors">
                      {c.label}
                    </Link>
                  ) : (
                    <span>{c.label}</span>
                  )}
                </span>
              ))}
            </div>
          )}
          <p className="text-sm font-semibold text-slate-900 truncate leading-tight">{title}</p>
        </div>

        {/* Language toggle */}
        <button
          onClick={toggleLang}
          className="shrink-0 text-xs font-bold px-2.5 py-1.5 rounded-lg transition-colors
                     bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
          title={lang === "az" ? "Rusca" : "Azərbaycanca"}
        >
          {lang === "az" ? "RU" : "AZ"}
        </button>
      </div>
    </header>
  );
}
