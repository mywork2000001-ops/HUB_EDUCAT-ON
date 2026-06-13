"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LangToggleInner() {
  const pathname    = usePathname();
  const searchParams = useSearchParams();
  const lang        = searchParams.get("lang") ?? "az";

  const next = new URLSearchParams(searchParams.toString());
  next.set("lang", lang === "az" ? "ru" : "az");

  return (
    <Link
      href={`${pathname}?${next.toString()}`}
      className="px-3 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-300
                 hover:bg-slate-700 transition-colors border border-slate-700"
    >
      {lang === "az" ? "RU" : "AZ"}
    </Link>
  );
}

export function AppHeader({ title }: { title?: string }) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-3
                       bg-slate-950/80 backdrop-blur-sm border-b border-slate-800">
      <p className="text-sm font-medium text-slate-300 truncate">{title ?? "EduHub"}</p>
      <Suspense fallback={<span className="text-xs text-slate-500">AZ</span>}>
        <LangToggleInner />
      </Suspense>
    </header>
  );
}
