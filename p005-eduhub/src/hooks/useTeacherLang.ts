"use client";
import { useState, useEffect, useCallback } from "react";

export type Lang = "az" | "ru";

const KEY = "eduhub_lang";

export function useTeacherLang(): [Lang, (l: Lang) => void] {
  const [lang, setLangState] = useState<Lang>("az");

  useEffect(() => {
    const stored = localStorage.getItem(KEY);
    if (stored === "az" || stored === "ru") setLangState(stored);
  }, []);

  const setLang = useCallback((l: Lang) => {
    localStorage.setItem(KEY, l);
    setLangState(l);
  }, []);

  return [lang, setLang];
}

export function getLangSync(): Lang {
  if (typeof window === "undefined") return "az";
  const v = localStorage.getItem(KEY);
  return v === "ru" ? "ru" : "az";
}
