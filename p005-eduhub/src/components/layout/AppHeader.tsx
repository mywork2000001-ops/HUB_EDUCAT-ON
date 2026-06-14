"use client";

import { useTeacherLang } from "@/hooks/useTeacherLang";

export function AppHeader({ title }: { title?: string }) {
  const [lang, setLang] = useTeacherLang();

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-3
                       bg-white/90 backdrop-blur-sm border-b border-slate-200 shadow-sm">
      <p className="text-sm font-semibold text-slate-700 truncate">{title ?? "EduHub"}</p>
      <button
        onClick={() => setLang(lang === "az" ? "ru" : "az")}
        className="px-3 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-600
                   hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300
                   transition-colors border border-slate-200"
      >
        {lang === "az" ? "RU" : "AZ"}
      </button>
    </header>
  );
}
