"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const TYPES = [
  { value: "LESSON",    label: "Dərs (P002 Dərslik)" },
  { value: "TEST",      label: "Test (P001 DİM / P003)" },
  { value: "TAIM_TEST", label: "TAİM Testi (P004)" },
  { value: "BSQ",       label: "Buraxılış sınaq" },
  { value: "KSQ",       label: "Kiçik summativ" },
  { value: "WORKBOOK",  label: "İş dəftəri" },
  { value: "VIDEO",     label: "Video dərs" },
];

// Известные пути контента P001-P004
const CONTENT_HINTS: Record<string, string[]> = {
  LESSON:    [
    "/api/content/P002_Math_5_Darslik/math-5-class-1/lesson-1.html",
    "/api/content/P002_Math_6_Darslik/math-6-class-1/Lesson-1.html",
  ],
  TEST:      [
    "/api/content/P001_Math_5_DIM/5dim_sinif_testi2025/Lesson-1.html",
    "/api/content/P001_Math_5_DIM/5dim_sinif_testi2025/Lesson-2.html",
  ],
  TAIM_TEST: [
    "/api/content/P004_TAIM_2026/test-1.html",
    "/api/content/P004_TAIM_2026/test-2.html",
  ],
};

interface Props {
  topicId: number;
}

export function AddResourceForm({ topicId }: Props) {
  const router = useRouter();
  const [open, setOpen]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm]       = useState({
    type: "LESSON", title_az: "", title_ru: "", content_url: "",
  });

  const hints = CONTENT_HINTS[form.type] ?? [];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title_az) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ curriculum_id: topicId, ...form }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setForm({ type: "LESSON", title_az: "", title_ru: "", content_url: "" });
      setOpen(false);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Xəta baş verdi");
    } finally {
      setLoading(false);
    }
  }

  const fd = "w-full bg-slate-800 text-white rounded-lg px-3 py-2 text-sm border border-slate-700 focus:outline-none focus:border-indigo-500";

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700
                   text-slate-300 hover:text-white text-sm transition-colors border border-dashed border-slate-700"
      >
        <span className="text-lg">+</span> Resurs əlavə et
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-slate-900 rounded-xl border border-indigo-800/40 p-5 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200">Yeni resurs</h3>
        <button type="button" onClick={() => setOpen(false)} className="text-slate-500 hover:text-white text-xs">
          ✕ Ləğv et
        </button>
      </div>

      {/* Type */}
      <div>
        <label className="block text-xs text-slate-400 mb-1">Növ (Platform)</label>
        <select className={fd} value={form.type}
          onChange={(e) => setForm((f) => ({ ...f, type: e.target.value, content_url: "" }))}>
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {/* Titles */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Başlıq (AZ) *</label>
          <input className={fd} required placeholder="Dərs 1 — Təbii ədədlər" value={form.title_az}
            onChange={(e) => setForm((f) => ({ ...f, title_az: e.target.value }))} />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Başlıq (RU)</label>
          <input className={fd} placeholder="Урок 1 — Натуральные числа" value={form.title_ru}
            onChange={(e) => setForm((f) => ({ ...f, title_ru: e.target.value }))} />
        </div>
      </div>

      {/* Content URL */}
      <div>
        <label className="block text-xs text-slate-400 mb-1">
          {form.type === "VIDEO" ? "YouTube linki / Video URL" : "Məzmun URL (P001–P004)"}
        </label>
        <input className={fd}
          placeholder={
            form.type === "VIDEO"
              ? "https://www.youtube.com/watch?v=... və ya .mp4 URL"
              : "/api/content/P001_Math_5_DIM/5dim_sinif_testi2025/Lesson-1.html"
          }
          value={form.content_url}
          onChange={(e) => setForm((f) => ({ ...f, content_url: e.target.value }))} />

        {form.type === "VIDEO" && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {[
              { label: "YouTube linki", val: "https://www.youtube.com/watch?v=" },
              { label: "YouTube Shorts", val: "https://youtube.com/shorts/" },
              { label: "youtu.be", val: "https://youtu.be/" },
            ].map(({ label, val }) => (
              <button key={val} type="button"
                onClick={() => setForm((f) => ({ ...f, content_url: val }))}
                className="text-xs text-pink-400 hover:text-pink-200 bg-pink-950/30
                           px-2 py-0.5 rounded hover:bg-pink-900/40 transition-colors border border-pink-900/30">
                ▶ {label}
              </button>
            ))}
          </div>
        )}

        {form.type !== "VIDEO" && hints.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {hints.map((h) => (
              <button key={h} type="button"
                onClick={() => setForm((f) => ({ ...f, content_url: h }))}
                className="text-xs text-indigo-400 hover:text-indigo-200 bg-indigo-950/40
                           px-2 py-0.5 rounded truncate max-w-full hover:bg-indigo-900/40 transition-colors">
                {h.split("/").slice(-2).join("/")}
              </button>
            ))}
          </div>
        )}

        <p className="mt-1 text-xs text-slate-600">
          {form.type === "VIDEO"
            ? "YouTube, youtu.be linki və ya birbaşa .mp4 URL"
            : "Nümunə: /api/content/P001_Math_5_DIM/5dim_sinif_testi2025/Lesson-5.html"}
        </p>
      </div>

      <button type="submit" disabled={loading || !form.title_az}
        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white
                   font-medium rounded-lg py-2.5 text-sm transition-colors">
        {loading ? "Saxlanılır…" : "Resurs əlavə et"}
      </button>
    </form>
  );
}
