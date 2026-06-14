"use client";

import { useState, useEffect } from "react";

interface Props {
  className?:   string;
  showDate?:    boolean;
  showSeconds?: boolean;
  locale?:      string;
}

export function LiveClock({ className = "", showDate = false, showSeconds = false, locale = "az" }: Props) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!now) return null;

  const loc     = locale === "ru" ? "ru-RU" : "az-AZ";
  const timeStr = now.toLocaleTimeString(loc, {
    hour: "2-digit", minute: "2-digit",
    ...(showSeconds ? { second: "2-digit" } : {}),
  });
  const dateStr = now.toLocaleDateString(loc, {
    weekday: "short", day: "numeric", month: "short",
  });

  return (
    <time dateTime={now.toISOString()} className={className}>
      <span className="font-bold tabular-nums">{timeStr}</span>
      {showDate && <span className="ml-1.5 opacity-70">{dateStr}</span>}
    </time>
  );
}
