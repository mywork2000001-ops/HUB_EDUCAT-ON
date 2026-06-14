"use client";

import { useState, useMemo } from "react";

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

function toYYYYMMDD(date: Date) {
  return date.toISOString().slice(0, 10);
}

function toEmbedUrl(url: string): string {
  // used for YouTube normalization if needed elsewhere
  return url;
}
void toEmbedUrl;

function printReport(results: ResultRow[], filters: { cls: string; platform: string }) {
  const label = [
    filters.cls      ? `Sinif: ${filters.cls}`           : "",
    filters.platform ? `Platform: ${PLATFORM_LABEL[filters.platform] ?? filters.platform}` : "",
  ].filter(Boolean).join(" · ") || "Bütün nəticələr";

  const avg = results.length
    ? Math.round(results.reduce((s, r) => s + r.percent, 0) / results.length)
    : 0;
  const pass     = results.filter((r) => r.percent >= 70).length;
  const passRate = results.length ? Math.round(pass / results.length * 100) : 0;

  const rows = results.map((r) => `
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
  <title>Test Nəticələri — ${label}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:system-ui,sans-serif;font-size:11px;color:#0f172a;padding:12mm 15mm}
    h1{font-size:16px;font-weight:700;margin-bottom:2mm}
    .meta{font-size:10px;color:#64748b;margin-bottom:6mm}
    .chips{display:flex;gap:4mm;margin-bottom:6mm;flex-wrap:wrap}
    .chip{border:1px solid #e2e8f0;border-radius:6px;padding:2mm 4mm;font-size:10px}
    .chip b{color:#0f172a}
    table{width:100%;border-collapse:collapse;font-size:10px}
    th{background:#f1f5f9;padding:2.5mm 3mm;text-align:left;font-weight:600;color:#475569;text-transform:uppercase;font-size:8px;letter-spacing:.05em}
    td{padding:2mm 3mm;border-bottom:1px solid #f1f5f9;color:#334155}
    tr:nth-child(even) td{background:#fafafa}
    .pass{color:#16a34a;font-weight:700}
    .fail{color:#dc2626;font-weight:700}
    .topic{max-width:60mm;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .footer{margin-top:8mm;font-size:9px;color:#94a3b8;text-align:center}
    @media print{body{padding:8mm 10mm}}
  </style></head><body>
  <h1>📊 Test Nəticələri Hesabatı</h1>
  <div class="meta">${label} · ${new Date().toLocaleDateString("az-AZ", { day:"2-digit",month:"long",year:"numeric" })} · ${results.length} nəticə</div>
  <div class="chips">
    <div class="chip">Cəmi: <b>${results.length}</b></div>
    <div class="chip">Orta bal: <b>${avg}%</b></div>
    <div class="chip">Keçdi (≥70%): <b>${pass}</b></div>
    <div class="chip">Keçmə faizi: <b>${passRate}%</b></div>
  </div>
  <table>
    <thead><tr>
      <th>Şagird</th><th>Sinif</th><th>Platform</th>
      <th>Mövzu</th><th>Nəticə</th><th>Bal</th><th>Tarix</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="footer">EduHub Müəllim Paneli · hub-educat-on.vercel.app</div>
  <script>window.onload=()=>window.print()</script>
  </body></html>`);
  win.document.close();
}

function exportCsv(results: ResultRow[], label: string) {
  const header = ["Şagird","Sinif","Platform","Mövzu","Faiz","Bal","Cəmi","Tarix"];
  const rows = results.map((r) => [
    r.student_name,
    r.student_class || "",
    PLATFORM_LABEL[r.platform] ?? r.platform,
    r.lesson_title || "",
    r.percent,
    r.score,
    r.total,
    r.finished_at ? new Date(r.finished_at).toLocaleDateString("az-AZ") : "",
  ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));

  const csv = "﻿" + [header.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `eduhub-neticeler-${label.replace(/\s+/g, "-")}-${toYYYYMMDD(new Date())}.csv`;
  a.click();
}

export function ResultsClient({ results }: { results: ResultRow[] }) {
  const allClasses   = useMemo(() => [...new Set(results.map((r) => r.student_class).filter(Boolean))].sort(), [results]);
  const allPlatforms = useMemo(() => [...new Set(results.map((r) => r.platform))].sort(), [results]);

  const [cls,       setCls]       = useState("");
  const [platform,  setPlatform]  = useState("");
  const [dateFrom,  setDateFrom]  = useState("");
  const [dateTo,    setDateTo]    = useState("");
  const [search,    setSearch]    = useState("");

  const filtered = useMemo(() => results.filter((r) => {
    if (cls       && r.student_class !== cls)                            return false;
    if (platform  && r.platform !== platform)                            return false;
    if (dateFrom  && r.finished_at && r.finished_at < dateFrom)          return false;
    if (dateTo    && r.finished_at && r.finished_at.slice(0, 10) > dateTo) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!r.student_name.toLowerCase().includes(q) && !r.lesson_title?.toLowerCase().includes(q)) return false;
    }
    return true;
  }), [results, cls, platform, dateFrom, dateTo, search]);

  const avg      = filtered.length ? Math.round(filtered.reduce((s, r) => s + r.percent, 0) / filtered.length) : 0;
  const pass     = filtered.filter((r) => r.percent >= 70).length;
  const passRate = filtered.length ? Math.round(pass / filtered.length * 100) : 0;

  const hasFilter = cls || platform || dateFrom || dateTo || search;
  const filterLabel = [
    cls      ? cls           : "",
    platform ? (PLATFORM_LABEL[platform] ?? platform) : "",
    dateFrom || dateTo ? `${dateFrom || "…"}→${dateTo || "…"}` : "",
  ].filter(Boolean).join("-") || "hamisi";

  return (
    <div className="p-6 max-w-6xl mx-auto">

      <div className="mb-5 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Test Nəticələri</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {filtered.length !== results.length
              ? `${filtered.length} / ${results.length} nəticə (filtr)`
              : `${results.length} nəticə`}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => exportCsv(filtered, filterLabel)}
            disabled={filtered.length === 0}
            className="px-3 py-2 rounded-lg text-sm font-medium border border-slate-200 bg-white
                       text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors
                       disabled:opacity-40 flex items-center gap-1.5 shadow-sm">
            📥 CSV ixrac
          </button>
          <button
            onClick={() => printReport(filtered, { cls, platform })}
            disabled={filtered.length === 0}
            className="px-3 py-2 rounded-lg text-sm font-medium border border-slate-200 bg-white
                       text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors
                       disabled:opacity-40 flex items-center gap-1.5 shadow-sm">
            🖨️ Hesabat çap et
          </button>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Şagird / mövzu..."
            className="col-span-2 sm:col-span-3 lg:col-span-2 w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-indigo-400 focus:bg-white transition-colors placeholder:text-slate-400"
          />
          <select value={cls} onChange={(e) => setCls(e.target.value)}
            className="text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-indigo-400 focus:bg-white transition-colors text-slate-700">
            <option value="">Bütün siniflər</option>
            {allClasses.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={platform} onChange={(e) => setPlatform(e.target.value)}
            className="text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-indigo-400 focus:bg-white transition-colors text-slate-700">
            <option value="">Bütün platformalar</option>
            {allPlatforms.map((p) => <option key={p} value={p}>{PLATFORM_LABEL[p] ?? p}</option>)}
          </select>
          <div className="flex gap-1.5 items-center">
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
              className="flex-1 text-xs px-2 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-indigo-400 focus:bg-white transition-colors text-slate-700" />
            <span className="text-slate-400 text-xs shrink-0">→</span>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
              className="flex-1 text-xs px-2 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-indigo-400 focus:bg-white transition-colors text-slate-700" />
          </div>
        </div>
        {hasFilter && (
          <button onClick={() => { setCls(""); setPlatform(""); setDateFrom(""); setDateTo(""); setSearch(""); }}
            className="mt-3 text-xs text-indigo-600 hover:text-indigo-700 font-medium">
            × Filtrləri sıfırla
          </button>
        )}
      </div>

      {/* ── Summary chips ── */}
      {filtered.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-5">
          {[
            { label: "Toplam",       value: String(filtered.length), cls: "bg-slate-100 text-slate-700 border-slate-200" },
            { label: "Orta bal",     value: `${avg}%`,               cls: "bg-indigo-50 text-indigo-700 border-indigo-200" },
            { label: "Keçdi (≥70%)", value: String(pass),            cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
            { label: "Keçmə faizi",  value: `${passRate}%`,          cls: passRate >= 70 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200" },
          ].map(({ label, value, cls: c }) => (
            <div key={label} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm shadow-sm ${c}`}>
              <span className="font-bold">{value}</span>
              <span className="text-xs opacity-70">{label}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Table ── */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm py-16 text-center">
          <p className="text-4xl mb-3">{hasFilter ? "🔍" : "📋"}</p>
          <p className="text-slate-400 text-sm">
            {hasFilter ? "Bu filtrlərə uyğun nəticə tapılmadı." : "Şagirdlər test bitirdikdə burada görünəcək."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-xs text-left">
                  <th className="px-5 py-3 font-semibold uppercase tracking-wider">Şagird</th>
                  <th className="px-3 py-3 font-semibold uppercase tracking-wider hidden sm:table-cell">Sinif</th>
                  <th className="px-3 py-3 font-semibold uppercase tracking-wider">Platforma</th>
                  <th className="px-3 py-3 font-semibold uppercase tracking-wider hidden md:table-cell">Mövzu</th>
                  <th className="px-3 py-3 font-semibold uppercase tracking-wider text-right">Nəticə</th>
                  <th className="px-3 py-3 font-semibold uppercase tracking-wider text-right hidden lg:table-cell">Tarix</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((r, i) => (
                  <tr key={r.id} className={`hover:bg-slate-50 transition-colors ${i % 2 === 0 ? "" : "bg-slate-50/40"}`}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold shrink-0">
                          {r.student_name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-slate-800 font-medium">{r.student_name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 hidden sm:table-cell">
                      <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        {r.student_class || "—"}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${PLATFORM_STYLE[r.platform] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>
                        {PLATFORM_LABEL[r.platform] ?? r.platform}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-slate-500 text-xs max-w-[200px] truncate hidden md:table-cell">
                      {r.lesson_title || "—"}
                    </td>
                    <td className="px-3 py-3 text-right whitespace-nowrap">
                      <span className={`font-bold ${r.percent >= 70 ? "text-emerald-600" : r.percent >= 50 ? "text-amber-600" : "text-rose-600"}`}>
                        {r.percent}%
                      </span>
                      <span className="text-slate-400 text-xs ml-1.5">({r.score}/{r.total})</span>
                    </td>
                    <td className="px-3 py-3 text-right text-slate-400 text-xs hidden lg:table-cell">
                      {r.finished_at ? new Date(r.finished_at).toLocaleDateString("az-AZ") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
