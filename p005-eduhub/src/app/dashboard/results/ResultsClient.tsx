"use client";

import { useState, useEffect, useMemo } from "react";

export type ResultRow = {
  id: string;
  student_name: string;
  student_class: string;
  platform: string;
  lesson_title: string;
  score: number;
  total: number;
  percent: number;
  finished_at: string;
};

type StudentInfo = {
  name: string;
  class_name: string;
  group_name: string | null;
};

type Tab = "class" | "group" | "student" | "all";

/* ─── helpers ─────────────────────────────────────────────────── */

const PLATFORM_LABEL: Record<string, string> = {
  P001: "DİM Testlər", P002: "Riyaziyyat Dərsliyi",
  P003: "Blok İmtahan", P004: "TAİM 2026",
};
const PLATFORM_STYLE: Record<string, string> = {
  P001: "bg-orange-50 text-orange-700 border-orange-200",
  P002: "bg-blue-50 text-blue-700 border-blue-200",
  P003: "bg-purple-50 text-purple-700 border-purple-200",
  P004: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

function avg(arr: number[]) {
  return arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;
}

function statsOf(rows: ResultRow[]) {
  const pcts      = rows.map((r) => r.percent);
  const avgPct    = avg(pcts);
  const pass      = rows.filter((r) => r.percent >= 70).length;
  const passRate  = rows.length ? Math.round(pass / rows.length * 100) : 0;
  const students  = new Set(rows.map((r) => r.student_name)).size;
  return { avgPct, pass, passRate, count: rows.length, students };
}

function toYYYYMMDD(d: Date) { return d.toISOString().slice(0, 10); }

/* ─── print / csv ─────────────────────────────────────────────── */

function printReport(rows: ResultRow[], label: string) {
  const { avgPct, pass, passRate } = statsOf(rows);
  const tableRows = rows.map((r) => `
    <tr>
      <td>${r.student_name}</td>
      <td>${r.student_class || "—"}</td>
      <td>${PLATFORM_LABEL[r.platform] ?? r.platform}</td>
      <td class="topic">${r.lesson_title || "—"}</td>
      <td class="${r.percent >= 70 ? "pass" : "fail"}">${r.percent}%</td>
      <td>${r.score}/${r.total}</td>
      <td>${r.finished_at ? new Date(r.finished_at).toLocaleDateString("az-AZ") : "—"}</td>
    </tr>`).join("");

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8">
  <title>Hesabat — ${label}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:system-ui,sans-serif;font-size:11px;color:#0f172a;padding:12mm 15mm}
    h1{font-size:16px;font-weight:700;margin-bottom:2mm}
    .meta{font-size:10px;color:#64748b;margin-bottom:5mm}
    .chips{display:flex;gap:4mm;margin-bottom:6mm;flex-wrap:wrap}
    .chip{border:1px solid #e2e8f0;border-radius:6px;padding:2mm 4mm;font-size:10px}
    .chip b{color:#0f172a}
    table{width:100%;border-collapse:collapse;font-size:10px}
    th{background:#f1f5f9;padding:2.5mm 3mm;text-align:left;font-weight:600;color:#475569;
       text-transform:uppercase;font-size:8px;letter-spacing:.05em}
    td{padding:2mm 3mm;border-bottom:1px solid #f1f5f9;color:#334155}
    tr:nth-child(even) td{background:#fafafa}
    .pass{color:#16a34a;font-weight:700}
    .fail{color:#dc2626;font-weight:700}
    .topic{max-width:60mm;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .footer{margin-top:8mm;font-size:9px;color:#94a3b8;text-align:center}
    @media print{body{padding:8mm 10mm}}
  </style></head><body>
  <h1>📊 Test Nəticələri — ${label}</h1>
  <div class="meta">${new Date().toLocaleDateString("az-AZ",{day:"2-digit",month:"long",year:"numeric"})} · ${rows.length} nəticə</div>
  <div class="chips">
    <div class="chip">Cəmi: <b>${rows.length}</b></div>
    <div class="chip">Orta bal: <b>${avgPct}%</b></div>
    <div class="chip">Keçdi (≥70%): <b>${pass}</b></div>
    <div class="chip">Keçmə faizi: <b>${passRate}%</b></div>
  </div>
  <table>
    <thead><tr>
      <th>Şagird</th><th>Sinif</th><th>Platform</th>
      <th>Mövzu</th><th>Nəticə</th><th>Bal</th><th>Tarix</th>
    </tr></thead>
    <tbody>${tableRows}</tbody>
  </table>
  <div class="footer">EduHub Müəllim Paneli · hub-educat-on.vercel.app</div>
  <script>window.onload=()=>window.print()</script>
  </body></html>`);
  win.document.close();
}

function exportCsv(rows: ResultRow[], label: string) {
  const header = ["Şagird","Sinif","Platform","Mövzu","Faiz","Bal","Cəmi","Tarix"];
  const body = rows.map((r) => [
    r.student_name, r.student_class || "",
    PLATFORM_LABEL[r.platform] ?? r.platform, r.lesson_title || "",
    r.percent, r.score, r.total,
    r.finished_at ? new Date(r.finished_at).toLocaleDateString("az-AZ") : "",
  ].map((v) => `"${String(v).replace(/"/g,'""')}"`).join(","));
  const csv = "﻿" + [header.join(","), ...body].join("\n");
  const a   = document.createElement("a");
  a.href    = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
  a.download = `eduhub-${label.replace(/[\s·\/]+/g,"-")}-${toYYYYMMDD(new Date())}.csv`;
  a.click();
}

/* ─── sub-components ──────────────────────────────────────────── */

function ScoreBadge({ pct }: { pct: number }) {
  const cls = pct >= 70 ? "text-emerald-600" : pct >= 50 ? "text-amber-600" : "text-rose-600";
  return <span className={`font-bold ${cls}`}>{pct}%</span>;
}

function StatChip({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${color}`}>
      <span className="font-bold">{value}</span>
      <span className="opacity-60 ml-1">{label}</span>
    </span>
  );
}

function ResultsTable({ rows }: { rows: ResultRow[] }) {
  return (
    <div className="overflow-x-auto border-t border-slate-100">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 text-left text-[11px] text-slate-400 uppercase tracking-wider">
            <th className="px-5 py-2.5 font-semibold">Şagird</th>
            <th className="px-3 py-2.5 font-semibold hidden sm:table-cell">Sinif</th>
            <th className="px-3 py-2.5 font-semibold">Platform</th>
            <th className="px-3 py-2.5 font-semibold hidden md:table-cell">Mövzu</th>
            <th className="px-3 py-2.5 font-semibold text-right">Nəticə</th>
            <th className="px-3 py-2.5 font-semibold text-right hidden lg:table-cell">Tarix</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((r, i) => (
            <tr key={r.id} className={`hover:bg-slate-50/70 transition-colors ${i % 2 === 1 ? "bg-slate-50/40" : ""}`}>
              <td className="px-5 py-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center
                                  text-indigo-600 text-[10px] font-bold shrink-0">
                    {r.student_name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-slate-800 font-medium text-sm">{r.student_name}</span>
                </div>
              </td>
              <td className="px-3 py-2.5 hidden sm:table-cell">
                <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                  {r.student_class || "—"}
                </span>
              </td>
              <td className="px-3 py-2.5">
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${PLATFORM_STYLE[r.platform] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>
                  {PLATFORM_LABEL[r.platform] ?? r.platform}
                </span>
              </td>
              <td className="px-3 py-2.5 text-slate-500 text-xs max-w-[180px] truncate hidden md:table-cell">
                {r.lesson_title || "—"}
              </td>
              <td className="px-3 py-2.5 text-right whitespace-nowrap">
                <ScoreBadge pct={r.percent} />
                <span className="text-slate-400 text-[11px] ml-1">({r.score}/{r.total})</span>
              </td>
              <td className="px-3 py-2.5 text-right text-slate-400 text-xs hidden lg:table-cell">
                {r.finished_at ? new Date(r.finished_at).toLocaleDateString("az-AZ") : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* Accordion section used by all 3 grouped tabs */
function AccordionSection({
  icon, title, subtitle, rows, defaultOpen = false,
}: {
  icon: string; title: string; subtitle?: string;
  rows: ResultRow[]; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const { avgPct, pass, passRate, count, students } = statsOf(rows);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 py-3.5 cursor-pointer select-none hover:bg-slate-50 transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="text-base">{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-900 text-sm">{title}</span>
            {subtitle && <span className="text-xs text-slate-400">{subtitle}</span>}
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <StatChip label="test"    value={count}        color="bg-slate-50 text-slate-600 border-slate-200" />
            <StatChip label="şagird"  value={students}     color="bg-blue-50 text-blue-600 border-blue-100" />
            <StatChip label="orta"    value={`${avgPct}%`} color={avgPct >= 70 ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-amber-50 text-amber-700 border-amber-100"} />
            <StatChip label="keçmə"   value={`${passRate}%`} color={passRate >= 70 ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-rose-50 text-rose-700 border-rose-100"} />
            <span className="hidden sm:inline text-xs text-slate-400">keçdi: {pass}/{count}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); printReport(rows, title); }}
            className="text-[11px] text-slate-400 hover:text-slate-700 px-2 py-1.5 rounded-lg
                       hover:bg-slate-100 transition-colors flex items-center gap-1"
            title="Çap et">
            🖨️
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); exportCsv(rows, title); }}
            className="text-[11px] text-slate-400 hover:text-slate-700 px-2 py-1.5 rounded-lg
                       hover:bg-slate-100 transition-colors flex items-center gap-1"
            title="CSV ixrac">
            📥
          </button>
          <span className={`text-slate-400 text-sm transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
            ▾
          </span>
        </div>
      </div>

      {/* Expanded content */}
      {open && <ResultsTable rows={rows} />}
    </div>
  );
}

/* Student card for "Şagird üzrə" tab */
function StudentSection({
  name, cls, grp, rows,
}: {
  name: string; cls: string; grp: string | null; rows: ResultRow[];
}) {
  const [open, setOpen] = useState(false);
  const { avgPct, count } = statsOf(rows);

  /* Trend: compare avg of first half vs second half */
  const sorted = [...rows].sort((a, b) =>
    new Date(a.finished_at).getTime() - new Date(b.finished_at).getTime()
  );
  const half  = Math.ceil(sorted.length / 2);
  const trend = sorted.length >= 3
    ? avg(sorted.slice(-half).map((r) => r.percent)) - avg(sorted.slice(0, half).map((r) => r.percent))
    : null;

  /* Mini sparkline (last 6 tests) */
  const last6  = sorted.slice(-6);
  const maxPct = Math.max(...last6.map((r) => r.percent), 1);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div
        className="flex items-center gap-3 px-5 py-3.5 cursor-pointer select-none hover:bg-slate-50 transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center
                        text-indigo-600 text-sm font-bold shrink-0">
          {name.charAt(0).toUpperCase()}
        </div>

        {/* Name + meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-900 text-sm">{name}</span>
            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{cls || "—"}</span>
            {grp && (
              <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">{grp}</span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <StatChip label="test"  value={count}        color="bg-slate-50 text-slate-600 border-slate-200" />
            <StatChip label="orta"  value={`${avgPct}%`} color={avgPct >= 70 ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-amber-50 text-amber-700 border-amber-100"} />
            {trend !== null && (
              <span className={`text-xs font-bold ${trend > 3 ? "text-emerald-600" : trend < -3 ? "text-rose-600" : "text-slate-400"}`}>
                {trend > 3 ? `▲ +${trend}` : trend < -3 ? `▼ ${trend}` : `→ ${trend > 0 ? "+" : ""}${trend}`}
              </span>
            )}
          </div>
        </div>

        {/* Sparkline */}
        {last6.length > 1 && (
          <div className="hidden sm:flex items-end gap-0.5 h-8 shrink-0">
            {last6.map((r, i) => (
              <div key={i}
                className="w-3 rounded-t-sm"
                style={{
                  height: `${Math.max(Math.round(r.percent / maxPct * 100), 12)}%`,
                  backgroundColor: r.percent >= 70 ? "#22c55e" : r.percent >= 50 ? "#f59e0b" : "#ef4444",
                  opacity: 0.75,
                }}
                title={`${r.percent}%`}
              />
            ))}
          </div>
        )}

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); printReport(rows, `${name} (${cls})`); }}
            className="text-[11px] text-slate-400 hover:text-slate-700 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            title="Çap et">
            🖨️
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); exportCsv(rows, name); }}
            className="text-[11px] text-slate-400 hover:text-slate-700 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            title="CSV">
            📥
          </button>
          <span className={`text-slate-400 text-sm transition-transform duration-200 ${open ? "rotate-180" : ""}`}>▾</span>
        </div>
      </div>
      {open && <ResultsTable rows={rows} />}
    </div>
  );
}

/* ─── main component ──────────────────────────────────────────── */

export function ResultsClient({ results }: { results: ResultRow[] }) {
  const [students,  setStudents]  = useState<StudentInfo[]>([]);
  const [tab,       setTab]       = useState<Tab>("class");
  const [platform,  setPlatform]  = useState("");
  const [dateFrom,  setDateFrom]  = useState("");
  const [dateTo,    setDateTo]    = useState("");
  const [search,    setSearch]    = useState("");

  /* Load students for group lookup */
  useEffect(() => {
    fetch("/api/admin/students")
      .then((r) => r.json())
      .then((d) => setStudents(d.students ?? []))
      .catch(() => {});
  }, []);

  /* name::class → group_name */
  const groupLookup = useMemo(() => {
    const m = new Map<string, string | null>();
    for (const s of students) m.set(`${s.name}::${s.class_name}`, s.group_name);
    return m;
  }, [students]);

  const allPlatforms = useMemo(() => [...new Set(results.map((r) => r.platform))].sort(), [results]);
  const allClasses   = useMemo(() => [...new Set(results.map((r) => r.student_class).filter(Boolean))].sort(), [results]);

  /* Apply global filters */
  const filtered = useMemo(() => results.filter((r) => {
    if (platform && r.platform !== platform) return false;
    if (dateFrom  && r.finished_at && r.finished_at < dateFrom) return false;
    if (dateTo    && r.finished_at && r.finished_at.slice(0, 10) > dateTo) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!r.student_name.toLowerCase().includes(q) && !(r.lesson_title ?? "").toLowerCase().includes(q)) return false;
    }
    return true;
  }), [results, platform, dateFrom, dateTo, search]);

  /* Group by class */
  const byClass = useMemo(() => {
    const m = new Map<string, ResultRow[]>();
    for (const r of filtered) {
      const k = r.student_class || "Sinif göstərilməyib";
      (m.get(k) ?? m.set(k, []).get(k)!).push(r);
    }
    return [...m.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  /* Group by group */
  const byGroup = useMemo(() => {
    const m = new Map<string, ResultRow[]>();
    for (const r of filtered) {
      const grp = groupLookup.get(`${r.student_name}::${r.student_class}`);
      const k   = grp ? `${r.student_class} · ${grp}` : "Qrupsuz";
      (m.get(k) ?? m.set(k, []).get(k)!).push(r);
    }
    return [...m.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [filtered, groupLookup]);

  /* Group by student */
  const byStudent = useMemo(() => {
    const m = new Map<string, { cls: string; grp: string | null; rows: ResultRow[] }>();
    for (const r of filtered) {
      const grp = groupLookup.get(`${r.student_name}::${r.student_class}`) ?? null;
      if (m.has(r.student_name)) {
        m.get(r.student_name)!.rows.push(r);
      } else {
        m.set(r.student_name, { cls: r.student_class, grp, rows: [r] });
      }
    }
    return [...m.entries()]
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => {
        const aAvg = avg(a.rows.map((r) => r.percent));
        const bAvg = avg(b.rows.map((r) => r.percent));
        return bAvg - aAvg;
      });
  }, [filtered, groupLookup]);

  const hasFilter = platform || dateFrom || dateTo || search;
  const totals    = statsOf(filtered);

  const TABS: { id: Tab; icon: string; label: string }[] = [
    { id: "class",   icon: "🏫", label: "Sinif üzrə"   },
    { id: "group",   icon: "👥", label: "Qrup üzrə"    },
    { id: "student", icon: "👤", label: "Şagird üzrə"  },
    { id: "all",     icon: "📋", label: "Hamısı"        },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">

      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Test Nəticələri</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {filtered.length !== results.length
              ? `${filtered.length} / ${results.length} nəticə (filtr aktiv)`
              : `${results.length} nəticə`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportCsv(filtered, "neticeler")}
            disabled={!filtered.length}
            className="px-3 py-2 rounded-lg text-sm font-medium border border-slate-200 bg-white
                       text-slate-600 hover:bg-slate-50 disabled:opacity-40 shadow-sm
                       flex items-center gap-1.5 transition-colors">
            📥 CSV
          </button>
          <button
            onClick={() => printReport(filtered, "Bütün nəticələr")}
            disabled={!filtered.length}
            className="px-3 py-2 rounded-lg text-sm font-medium border border-slate-200 bg-white
                       text-slate-600 hover:bg-slate-50 disabled:opacity-40 shadow-sm
                       flex items-center gap-1.5 transition-colors">
            🖨️ Çap et
          </button>
        </div>
      </div>

      {/* ── Global stats ── */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: "📋", val: filtered.length, sub: "test nəticəsi",  bg: "bg-indigo-50 border-indigo-100",   v: "text-indigo-900" },
            { icon: "👥", val: totals.students,  sub: "unikal şagird", bg: "bg-blue-50 border-blue-100",       v: "text-blue-900" },
            { icon: "📈", val: `${totals.avgPct}%`, sub: "orta bal",   bg: totals.avgPct >= 70 ? "bg-emerald-50 border-emerald-100" : "bg-amber-50 border-amber-100", v: totals.avgPct >= 70 ? "text-emerald-900" : "text-amber-900" },
            { icon: "✅", val: `${totals.passRate}%`, sub: "keçmə faizi", bg: totals.passRate >= 70 ? "bg-emerald-50 border-emerald-100" : "bg-rose-50 border-rose-100", v: totals.passRate >= 70 ? "text-emerald-900" : "text-rose-900" },
          ].map(({ icon, val, sub, bg, v }) => (
            <div key={sub} className={`border rounded-xl p-4 shadow-sm ${bg}`}>
              <div className="text-xl mb-1">{icon}</div>
              <div className={`text-xl font-bold ${v}`}>{val}</div>
              <div className="text-xs text-slate-500 mt-0.5">{sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Filters ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Ad / mövzu…"
            className="col-span-2 sm:col-span-1 text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50
                       focus:outline-none focus:border-indigo-400 focus:bg-white transition-colors placeholder:text-slate-400"
          />
          <select value={platform} onChange={(e) => setPlatform(e.target.value)}
            className="text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50
                       focus:outline-none focus:border-indigo-400 focus:bg-white transition-colors text-slate-700">
            <option value="">Bütün platformalar</option>
            {allPlatforms.map((p) => <option key={p} value={p}>{PLATFORM_LABEL[p] ?? p}</option>)}
          </select>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
            className="text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50
                       focus:outline-none focus:border-indigo-400 focus:bg-white transition-colors text-slate-700" />
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
            className="text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50
                       focus:outline-none focus:border-indigo-400 focus:bg-white transition-colors text-slate-700" />
        </div>
        {hasFilter && (
          <button onClick={() => { setPlatform(""); setDateFrom(""); setDateTo(""); setSearch(""); }}
            className="mt-2.5 text-xs text-indigo-600 hover:text-indigo-700 font-medium">
            × Filtrləri sıfırla
          </button>
        )}
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
              tab === t.id
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}>
            <span>{t.icon}</span>
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* ── Empty state ── */}
      {filtered.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm py-16 text-center">
          <p className="text-3xl mb-3">{hasFilter ? "🔍" : "📋"}</p>
          <p className="text-slate-400 text-sm">
            {hasFilter ? "Bu filtrlərə uyğun nəticə tapılmadı." : "Şagirdlər test bitirdikdə burada görünəcək."}
          </p>
        </div>
      )}

      {/* ── Sinif üzrə ── */}
      {tab === "class" && filtered.length > 0 && (
        <div className="space-y-3">
          {byClass.map(([cls, rows]) => (
            <AccordionSection
              key={cls}
              icon="🏫"
              title={`${cls} sinifi`}
              rows={rows}
              defaultOpen={byClass.length === 1}
            />
          ))}
        </div>
      )}

      {/* ── Qrup üzrə ── */}
      {tab === "group" && filtered.length > 0 && (
        <div className="space-y-3">
          {students.length === 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 text-sm text-amber-700">
              Qrup məlumatı şagird qeydiyyatına əsaslanır. Şagirdlər qeydiyyatda yoxdursa qrupsuz görünə bilər.
            </div>
          )}
          {byGroup.map(([grpKey, rows]) => (
            <AccordionSection
              key={grpKey}
              icon={grpKey === "Qrupsuz" ? "📭" : "👥"}
              title={grpKey}
              rows={rows}
              defaultOpen={byGroup.length === 1}
            />
          ))}
        </div>
      )}

      {/* ── Şagird üzrə ── */}
      {tab === "student" && filtered.length > 0 && (
        <div className="space-y-3">
          {byStudent.map(({ name, cls, grp, rows }) => (
            <StudentSection key={name} name={name} cls={cls} grp={grp} rows={rows} />
          ))}
        </div>
      )}

      {/* ── Hamısı (flat list) ── */}
      {tab === "all" && filtered.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <ResultsTable rows={filtered} />
        </div>
      )}
    </div>
  );
}
