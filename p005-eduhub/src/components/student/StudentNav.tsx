"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

interface Crumb {
  label: string;
  href?: string;
}

interface Props {
  title: string;
  crumbs?: Crumb[];
  backHref: string;
  lang?: "az" | "ru";
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
    <header className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur-sm border-b border-slate-800">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
        <Link
          href={backHref}
          className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-400
                     hover:text-white hover:bg-slate-800 transition-colors shrink-0"
          aria-label="Geri"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>

        <div className="flex-1 min-w-0">
          {crumbs && crumbs.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-slate-500 mb-0.5 truncate">
              {crumbs.map((c, i) => (
                <span key={i} className="flex items-center gap-1 shrink-0">
                  {i > 0 && <span>/</span>}
                  {c.href ? (
                    <Link href={c.href} className="hover:text-slate-300 transition-colors">
                      {c.label}
                    </Link>
                  ) : (
                    <span>{c.label}</span>
                  )}
                </span>
              ))}
            </div>
          )}
          <p className="text-sm font-semibold text-white truncate">{title}</p>
        </div>

        <button
          onClick={toggleLang}
          className="shrink-0 text-xs font-bold px-2.5 py-1.5 rounded-lg transition-colors
                     bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
          title={lang === "az" ? "Rusca" : "Azərbaycanca"}
        >
          {lang === "az" ? "RU" : "AZ"}
        </button>

        <Link
          href="/"
          className="shrink-0 text-indigo-400 hover:text-indigo-300 text-xs font-medium
                     px-2.5 py-1.5 rounded-lg bg-indigo-950/50 hover:bg-indigo-900/50
                     transition-colors"
        >
          Hub
        </Link>
      </div>
    </header>
  );
}
