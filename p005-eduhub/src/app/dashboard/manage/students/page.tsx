"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

type Student = {
  id: string; name: string; email: string;
  class_name: string; group_name: string | null;
  is_active: boolean; created_at: string;
};

type Tab = "class" | "group" | "individual";

type ResetModal = { student: Student; newPassword: string | null; loading: boolean };

function printCredentials(students: Student[], groupLabel: string) {
  const rows = students.map((s) => `
    <div class="card">
      <div class="school">EduHub — ${groupLabel}</div>
      <div class="name">${s.name}</div>
      <div class="row"><span class="label">E-poçt (ID):</span><span class="val">${s.email}</span></div>
      <div class="row"><span class="label">Şifrə:</span><span class="val">— (şifrəni şagirdə ayrıca verin)</span></div>
      <div class="row"><span class="label">Sinif:</span><span class="val">${s.class_name}${s.group_name ? ` · ${s.group_name}` : ""}</span></div>
      <div class="url">hub-educat-on.vercel.app/learn/login</div>
    </div>
  `).join("");
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Şagird Məlumatları</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:system-ui,sans-serif;background:#fff;padding:10mm}
    .grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8mm}
    .card{border:1.5px solid #334155;border-radius:8px;padding:5mm;page-break-inside:avoid;background:#f8fafc}
    .school{font-size:9px;color:#64748b;text-transform:uppercase;letter-spacing:.05em;margin-bottom:3mm}
    .name{font-size:14px;font-weight:700;color:#0f172a;margin-bottom:3mm;border-bottom:1px solid #e2e8f0;padding-bottom:2mm}
    .row{display:flex;gap:2mm;margin-bottom:1.5mm;font-size:11px}
    .label{color:#64748b;white-space:nowrap;min-width:22mm}
    .val{color:#0f172a;font-weight:600;font-family:monospace}
    .url{font-size:9px;color:#6366f1;margin-top:3mm;text-align:center}
    @media print{body{padding:5mm}.grid{gap:5mm}}
  </style></head><body>
  <div style="text-align:center;margin-bottom:8mm;font-size:11px;color:#475569">
    EduHub — Şagird Giriş Məlumatları · ${groupLabel} · ${new Date().toLocaleDateString("az")}
  </div>
  <div class="grid">${rows}</div>
  <script>window.onload=()=>window.print()</script>
  </body></html>`);
  win.document.close();
}

export const dynamic = "force-dynamic";

export default function StudentsManagePage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [tab, setTab]           = useState<Tab>("class");
  const [loading, setLoading]   = useState(true);
  const [modal,   setModal]     = useState<ResetModal | null>(null);
  const [copied,  setCopied]    = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/students");
    const d   = await res.json();
    setStudents(d.students ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function resetPassword(student: Student) {
    setModal({ student, newPassword: null, loading: true });
    const res  = await fetch(`/api/admin/students/${student.id}?action=reset-password`, { method: "PATCH" });
    const data = await res.json();
    setModal({ student, newPassword: data.plainPassword ?? null, loading: false });
  }

  async function toggleActive(id: string, currentStatus: boolean) {
    // Optimistic update
    setStudents((prev) => prev.map((s) => s.id === id ? { ...s, is_active: !currentStatus } : s));
    try {
      const res = await fetch(`/api/admin/students/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !currentStatus }),
      });
      if (!res.ok) throw new Error();
    } catch {
      // Revert on error
      setStudents((prev) => prev.map((s) => s.id === id ? { ...s, is_active: currentStatus } : s));
    }
  }

  function copyPassword() {
    if (!modal?.newPassword) return;
    navigator.clipboard.writeText(modal.newPassword).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const byClass = students.reduce<Record<string, Student[]>>((acc, s) => {
    (acc[s.class_name] ??= []).push(s);
    return acc;
  }, {});

  const byGroup = students.reduce<Record<string, Student[]>>((acc, s) => {
    const key = s.group_name ? `${s.class_name} · ${s.group_name}` : null;
    if (key) (acc[key] ??= []).push(s);
    return acc;
  }, {});

  const TABS: { id: Tab; label: string }[] = [
    { id: "class",      label: "Sinif üzrə" },
    { id: "group",      label: "Qrup üzrə" },
    { id: "individual", label: "Fərdi" },
  ];

  function StudentRow({ s }: { s: Student }) {
    return (
      <div className={`flex items-start gap-3 px-4 py-3 border-b border-slate-100 last:border-0 transition-colors ${
        s.is_active ? "hover:bg-slate-50" : "bg-slate-50/60 hover:bg-slate-100/60"
      }`}>
        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 mt-0.5 ${
          s.is_active ? "bg-indigo-100 text-indigo-600" : "bg-slate-200 text-slate-400"
        }`}>
          {s.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-4 gap-1 sm:gap-3 items-center">
          <div className="min-w-0">
            <p className={`text-sm font-medium truncate ${s.is_active ? "text-slate-800" : "text-slate-400 line-through"}`}>
              {s.name}
            </p>
            <p className="text-xs text-slate-400 truncate">{s.class_name}{s.group_name ? ` · ${s.group_name}` : ""}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs text-slate-400 mb-0.5">E-poçt (ID)</p>
            <p className="text-xs font-mono text-indigo-600 select-all truncate">{s.email}</p>
          </div>
          <div className="flex items-center gap-2 justify-end flex-wrap">
            {/* Active toggle — clickable */}
            <button
              type="button"
              onClick={() => toggleActive(s.id, s.is_active)}
              title={s.is_active ? "Deaktiv et" : "Aktivləşdir"}
              className={`text-xs px-2 py-0.5 rounded-full border font-medium transition-colors cursor-pointer ${
                s.is_active
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                  : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200"
              }`}>
              {s.is_active ? "✓ Aktiv" : "✕ Deaktiv"}
            </button>
            <button type="button" onClick={() => resetPassword(s)}
              className="text-xs text-amber-600 hover:text-amber-700 px-2 py-1 rounded-lg hover:bg-amber-50 transition-colors shrink-0 font-medium">
              🔑 Şifrə
            </button>
            <Link href={`/dashboard/manage/students/${s.id}`}
              className="text-xs text-slate-400 hover:text-slate-700 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors shrink-0">
              Düzəlt
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Şagirdlər</h1>
          <p className="text-slate-400 text-sm mt-0.5">{students.length} şagird qeydiyyatda</p>
        </div>
        <Link href="/dashboard/manage/students/new"
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors shadow-sm">
          + Yeni şagird
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-slate-100 rounded-xl p-1 w-fit">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              tab === t.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400 text-sm">Yüklənir…</div>
      ) : students.length === 0 ? (
        <div className="py-16 rounded-2xl bg-white border border-slate-200 shadow-sm text-center">
          <p className="text-4xl mb-3">👥</p>
          <p className="text-slate-500 text-sm">Hələ şagird əlavə edilməyib.</p>
          <Link href="/dashboard/manage/students/new"
            className="inline-block mt-4 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm transition-colors shadow-sm">
            İlk şagirdi əlavə et
          </Link>
        </div>
      ) : tab === "class" ? (
        <div className="space-y-5">
          {Object.entries(byClass).map(([className, list]) => (
            <section key={className}>
              <div className="flex items-center gap-3 mb-2 px-1">
                <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                  🏫 {className} sinfi — {list.length} şagird
                </h2>
                <button onClick={() => printCredentials(list, `${className} sinfi`)}
                  className="ml-auto text-xs text-slate-500 hover:text-slate-700 px-2.5 py-1 rounded-lg
                             bg-white border border-slate-200 hover:border-slate-300 transition-colors flex items-center gap-1 shadow-sm">
                  🖨️ Çap et
                </button>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                {list.map((s) => <StudentRow key={s.id} s={s} />)}
              </div>
            </section>
          ))}
        </div>
      ) : tab === "group" ? (
        Object.keys(byGroup).length === 0 ? (
          <div className="py-16 rounded-2xl bg-white border border-slate-200 shadow-sm text-center">
            <p className="text-slate-400 text-sm">Qrupa aid şagird yoxdur.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {Object.entries(byGroup).map(([groupKey, list]) => (
              <section key={groupKey}>
                <div className="flex items-center gap-3 mb-2 px-1">
                  <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                    👥 {groupKey} — {list.length} şagird
                  </h2>
                  <button onClick={() => printCredentials(list, groupKey)}
                    className="ml-auto text-xs text-slate-500 hover:text-slate-700 px-2.5 py-1 rounded-lg
                               bg-white border border-slate-200 hover:border-slate-300 transition-colors shadow-sm">
                    🖨️ Çap et
                  </button>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                  {list.map((s) => <StudentRow key={s.id} s={s} />)}
                </div>
              </section>
            ))}
          </div>
        )
      ) : (
        <div className="space-y-5">
          <div className="flex items-center gap-3 mb-2 px-1">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
              👤 Bütün şagirdlər — {students.length} nəfər
            </h2>
            <button onClick={() => printCredentials(students, "Bütün şagirdlər")}
              className="ml-auto text-xs text-slate-500 hover:text-slate-700 px-2.5 py-1 rounded-lg
                         bg-white border border-slate-200 hover:border-slate-300 transition-colors shadow-sm">
              🖨️ Hamısını çap et
            </button>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            {students.map((s) => <StudentRow key={s.id} s={s} />)}
          </div>
        </div>
      )}

      {/* ── Reset password modal ── */}
      {modal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setModal(null); }}>
          <div className="bg-white rounded-2xl border border-slate-200 p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-base font-bold text-slate-900 mb-1">Şifrəni sıfırla</h3>
            <p className="text-xs text-slate-400 mb-5">{modal.student.name} · {modal.student.email}</p>

            {modal.loading ? (
              <div className="py-8 text-center text-slate-400 text-sm">Yeni şifrə yaradılır…</div>
            ) : modal.newPassword ? (
              <>
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4">
                  <p className="text-xs text-amber-600 mb-1.5">Yeni şifrə (bir dəfə göstərilir)</p>
                  <div className="flex items-center gap-3">
                    <p className="text-lg font-mono font-bold text-amber-700 tracking-widest select-all flex-1">
                      {modal.newPassword}
                    </p>
                    <button type="button" onClick={copyPassword}
                      className="text-xs text-slate-500 hover:text-slate-900 px-2.5 py-1.5 rounded-lg
                                 bg-white border border-slate-200 hover:border-slate-300 transition-colors whitespace-nowrap shadow-sm">
                      {copied ? "✓ Kopyalandı" : "Kopyala"}
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mb-5 text-center">Şagirdə bu şifrəni ayrıca bildirin</p>
                <button type="button" onClick={() => setModal(null)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition-colors">
                  Bağla
                </button>
              </>
            ) : (
              <>
                <p className="text-sm text-slate-600 mb-5">
                  Bu şagirdin şifrəsi avtomatik olaraq yenilənəcək. Köhnə şifrə artıq işləməyəcək.
                </p>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setModal(null)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-medium transition-colors">
                    Ləğv et
                  </button>
                  <button type="button" onClick={() => resetPassword(modal.student)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium transition-colors shadow-sm">
                    Yenilə
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
