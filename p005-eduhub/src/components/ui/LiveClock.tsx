"use client";

import { useState, useEffect } from "react";

interface Props {
  className?: string;
  showDate?:  boolean;
  locale?:    string;
}

export function LiveClock({ className = "", showDate = false, locale = "az" }: Props) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!now) return null; // avoid hydration mismatch

  const timeStr = now.toLocaleTimeString(locale === "ru" ? "ru-RU" : "az-AZ", {
    hour: "2-digit", minute: "2-digit",
  });
  const dateStr = now.toLocaleDateString(locale === "ru" ? "ru-RU" : "az-AZ", {
    weekday: "short", day: "numeric", month: "short",
  });

  return (
    <time dateTime={now.toISOString()} className={className}>
      <span className="font-bold tabular-nums">{timeStr}</span>
      {showDate && <span className="ml-1.5 opacity-70">{dateStr}</span>}
    </time>
  );
}
