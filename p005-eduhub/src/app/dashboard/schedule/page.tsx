import { db } from "@/lib/db";
import Link from "next/link";
import { LiveClock } from "@/components/ui/LiveClock";
import { ScheduleQuickAdd } from "@/components/schedule/ScheduleQuickAdd";

export const dynamic = "force-dynamic";

const SUBJ_META: Record<string, { az: string; icon: string; color: string; bg: string; border: string; text: string }> = {
  "math":          { az: "Riyaziyyat",   icon: "📐", color: "#3b82f6", bg: "bg-blue-50",     border: "border-blue-200",    text: "text-blue-700" },
  "block-exam":    { az: "Blok İmtahan", icon: "📝", color: "#a855f7", bg: "bg-purple-50",   border: "border-purple-200",  text: "text-purple-700" },
  "taim-2026":     { az: "TAİM 2026",    icon: "🎓", color: "#22c55e", bg: "bg-emerald-50",  border: "border-emerald-200", text: "text-emerald-700" },
  "algorithmics":  { az: "Alqoritmlər",  icon: "🧩", color: "#f97316", bg: "bg-orange-50",   border: "border-orange-200",  text: "text-orange-700" },
  "informatics":   { az: "İnformatika",  icon: "💻", color: "#06b6d4", bg: "bg-cyan-50",     border: "border-cyan-200",    text: "text-cyan-700" },
  "physics":       { az: "Fizika",       icon: "⚛️", color: "#8b5cf6", bg: "bg-violet-50",   border: "border-violet-200",  text: "text-violet-700" },
  "chemistry":     { az: "Kimya",        icon: "🧪", color: "#10b981", bg: "bg-teal-50",     border: "border-teal-200",    text: "text-teal-700" },
};

const DAY_AZ = ["Bazar", "B.ertəsi", "Çərşənbəaxşamı", "Çərşənbə", "Cümaxertəsi", "Cümə", "Şənbə"];

async function getWeekAssignments(from: Date, to: Date) {
  return db.assignment.findMany({
    where: { due_date: { gte: from, lte: to } },
    include: {
      item: {
        include: { grade_subject: { include: { subject: true, grade: true } } },
      },
      student: { select: { name: true, class_name: true } },
    },
    orderBy: { due_date: "asc" },
  });
}

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const { week = "0" } = await searchParams;
  const offset = Math.max(-4, Math.min(4, parseInt(week) || 0));

  /* ── Week bounds (Mon–Sun) ── */
  const now        = new Date();
  const dayOfWeek  = now.getDay(); // 0=Sun
  const daysToMon  = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const weekStart  = new Date(now);
  weekStart.setDate(now.getDate() + daysToMon + offset * 7);
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd    = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  const assignments = await getWeekAssignments(weekStart, weekEnd);

  /* ── Build grid: group → dayIndex(0-6) → items ── */
  type AssRow = Awaited<ReturnType<typeof getWeekAssignments>>[0];
  const groupOrder: string[] = [];
  const groupLabel: Record<string, string> = {};
  const grid: Record<string, Record<number, AssRow[]>> = {};

  function groupKey(a: AssRow): string {
    if (a.student_id) return `👤 ${a.student?.name ?? "?"}`;
    if (a.group_name) return `${a.class_name} · ${a.group_name}`;
    return a.class_name ?? "?";
  }

  for (const a of assignments) {
    if (!a.due_date) continue;
    const gk      = groupKey(a);
    const dayIdx  = a.due_date.getDay(); // 0=Sun, 1=Mon...
    if (!grid[gk]) {
      grid[gk] = {};
      groupOrder.push(gk);
      groupLabel[gk] = gk;
    }
    if (!grid[gk][dayIdx]) grid[gk][dayIdx] = [];
    grid[gk][dayIdx].push(a);
  }

  /* ── 7 day objects ── */
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const weekLabel = `${weekStart.toLocaleDateString("az", { day: "numeric", month: "short" })} – ${weekEnd.toLocaleDateString("az", { day: "numeric", month: "short", year: "numeric" })}`;
  const isCurrentWeek = offset === 0;

  /* ── No-with-due-date stats ── */
  const todayCount = await db.assignment.count({
    where: {
      due_date: {
        gte: new Date(new Date().setHours(0, 0, 0, 0)),
        lte: new Date(new Date().setHours(23, 59, 59, 999)),
      },
    },
  });

  return (
    <div className="p-6 max-w-full overflow-x-auto">

      {/* ── Header ── */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">Dərs Cədvəli</h1>
          <p className="text-slate-400 text-sm mt-0.5 flex items-center gap-2">
            Sinif/qruplara görə həftəlik cədvəl
            {isCurrentWeek && todayCount > 0 && (
              <span className="text-indigo-500 font-medium">· Bu gün {todayCount} dərs</span>
            )}
            <LiveClock className="text-indigo-600 font-bold text-sm tabular-nums" showDate />
          </p>
        </div>

        {/* Quick add + week navigation */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <ScheduleQuickAdd defaultDate={weekStart.toISOString().slice(0, 10)} />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link href={`?week=${offset - 1}`}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 text-sm transition-colors shadow-sm">
            ← Əvvəlki
          </Link>
          <Link href="?"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm ${
              isCurrentWeek
                ? "bg-indigo-600 text-white"
                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}>
            Bu həftə
          </Link>
          <Link href={`?week=${offset + 1}`}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 text-sm transition-colors shadow-sm">
            Növbəti →
          </Link>
        </div>
      </div>

      {/* ── Week label ── */}
      <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-2 mb-6">
        <span className="text-lg">📅</span>
        <span className="text-sm font-semibold text-indigo-700">{weekLabel}</span>
      </div>

      {/* ── Empty state ── */}
      {groupOrder.length === 0 ? (
        <div className="py-20 rounded-2xl bg-white border border-slate-200 shadow-sm text-center">
          <p className="text-5xl mb-4">📅</p>
          <p className="text-slate-500 font-medium text-sm">Bu həftə üçün tə'yinat yoxdur</p>
          <p className="text-slate-400 text-xs mt-2 mb-5">
            Tə'yinatlar məntəqəsindən dərs planlaşdırın
          </p>
          <Link href="/dashboard/manage/assignments"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
            + Tə'yinat əlavə et
          </Link>
        </div>
      ) : (
        /* ── Timetable grid ── */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

          {/* Column headers — Mon(1)…Sun(0) reordered as Mon-Sun */}
          <div
            className="grid border-b border-slate-200 bg-slate-50"
            style={{ gridTemplateColumns: `180px repeat(7, minmax(120px, 1fr))` }}>
            {/* Group header cell */}
            <div className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest border-r border-slate-200">
              Sinif / Qrup
            </div>
            {/* Day headers */}
            {days.map((d, i) => {
              const isToday = d.toDateString() === new Date().toDateString();
              return (
                <div key={i}
                  className={`px-3 py-3 text-center border-r border-slate-200 last:border-r-0 ${isToday ? "bg-indigo-50" : ""}`}>
                  <p className={`text-xs font-bold uppercase tracking-wide ${isToday ? "text-indigo-600" : "text-slate-500"}`}>
                    {DAY_AZ[d.getDay()]}
                  </p>
                  <p className={`text-lg font-bold mt-0.5 ${isToday ? "text-indigo-700" : "text-slate-700"}`}>
                    {d.getDate()}
                  </p>
                  {isToday && (
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 mt-0.5" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Group rows */}
          {groupOrder.map((gk, ri) => (
            <div key={gk}
              className={`grid border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50 transition-colors`}
              style={{ gridTemplateColumns: `180px repeat(7, minmax(120px, 1fr))` }}>

              {/* Group name cell */}
              <div className="px-4 py-3 border-r border-slate-200 flex items-center">
                <div>
                  <p className="text-sm font-semibold text-slate-800 leading-tight">
                    {gk.startsWith("👤") ? gk : (
                      gk.includes("·") ? (
                        <>
                          <span className="text-slate-600">{gk.split(" · ")[0]}</span>
                          <span className="text-slate-400"> · </span>
                          <span className="text-indigo-600">{gk.split(" · ")[1]}</span>
                        </>
                      ) : gk
                    )}
                  </p>
                </div>
              </div>

              {/* Day cells */}
              {days.map((d, di) => {
                const dayIdx  = d.getDay();
                const items   = grid[gk]?.[dayIdx] ?? [];
                const isToday = d.toDateString() === new Date().toDateString();

                return (
                  <div key={di}
                    className={`px-2 py-2 border-r border-slate-100 last:border-r-0 ${isToday ? "bg-indigo-50/40" : ""} min-h-[72px]`}>
                    {items.length === 0 ? (
                      <div className="h-full flex items-center justify-center">
                        <span className="text-slate-200 text-xs">—</span>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {items.map((a) => {
                          const dt      = a.due_date!;
                          const hasTime = dt.getHours() > 0 || dt.getMinutes() > 0;
                          const subj    = SUBJ_META[a.item.grade_subject.subject.slug];
                          return (
                            <div key={a.id}
                              className={`rounded-lg p-2 border ${subj?.border ?? "border-slate-200"} ${subj?.bg ?? "bg-slate-50"} text-left`}>
                              {hasTime && (
                                <p className={`text-[10px] font-bold tabular-nums ${subj?.text ?? "text-slate-600"} mb-0.5`}>
                                  {dt.toLocaleTimeString("az", { hour: "2-digit", minute: "2-digit" })}
                                </p>
                              )}
                              <p className="text-[11px] font-medium text-slate-800 leading-tight line-clamp-2">
                                {subj?.icon ?? "📚"} {a.item.title_az}
                              </p>
                              {a.note && (
                                <p className="text-[9px] text-amber-600 mt-0.5 italic truncate">{a.note}</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* ── Quick stats ── */}
      {groupOrder.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-3">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm text-sm text-slate-600">
            <span className="font-bold text-slate-900">{groupOrder.length}</span> sinif / qrup
          </div>
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm text-sm text-slate-600">
            <span className="font-bold text-slate-900">{assignments.filter(a => a.due_date).length}</span> planlanmış dərs
          </div>
          <Link href="/dashboard/manage/assignments"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2.5 text-sm font-medium transition-colors shadow-sm ml-auto">
            + Tə'yinat əlavə et
          </Link>
        </div>
      )}
    </div>
  );
}
