"use client";
import { useRouter } from "next/navigation";

export function LangToggle({ lang }: { lang: "az" | "ru" }) {
  const router = useRouter();
  async function toggle() {
    await fetch("/api/lang", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lang: lang === "az" ? "ru" : "az" }),
    });
    router.refresh();
  }
  return (
    <button
      onClick={toggle}
      className="shrink-0 text-xs font-bold px-2.5 py-1.5 rounded-lg transition-colors
                 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
      title={lang === "az" ? "Rusca" : "Azərbaycanca"}
    >
      {lang === "az" ? "RU" : "AZ"}
    </button>
  );
}
