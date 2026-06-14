"use client";

import { useState, useEffect, useCallback, useRef } from "react";

type Topic = {
  id: number;
  title_az: string;
  order_index: number;
  grade_subject: {
    grade:   { label_az: string };
    subject: { label_az: string; slug: string };
  };
};

type Resource = {
  id: number;
  type: string;
  title_az: string;
  title_ru: string;
  content_url: string | null;
  is_published: boolean;
  created_at: string;
  metadata?: { duration_min?: number; questions_count?: number } | null;
};

const TYPE_LABELS: Record<string, string> = {
  VIDEO: "Video", LESSON: "Dərs", TEST: "Test",
  TAIM_TEST: "TAİM", BSQ: "BSQ", KSQ: "KSQ", WORKBOOK: "İş dəftəri",
};
const TYPE_COLORS: Record<string, string> = {
  VIDEO:    "bg-pink-100 text-pink-700 border-pink-200",
  LESSON:   "bg-blue-100 text-blue-700 border-blue-200",
  TEST:     "bg-purple-100 text-purple-700 border-purple-200",
  TAIM_TEST:"bg-orange-100 text-orange-700 border-orange-200",
  BSQ:      "bg-red-100 text-red-700 border-red-200",
  KSQ:      "bg-yellow-100 text-yellow-700 border-yellow-200",
  WORKBOOK: "bg-green-100 text-green-700 border-green-200",
};

// ── URL helpers ──────────────────────────────────────────────────────────────
function getYoutubeId(url: string): string | null {
  const fromEmbed = url.match(/youtube\.com\/embed\/([A-Za-z0-9_-]{11})/);
  if (fromEmbed) return fromEmbed[1];
  const fromShort = url.match(/youtu\.be\/([A-Za-z0-9_-]{11})/);
  if (fromShort) return fromShort[1];
  const fromWatch = url.match(/[?&]v=([A-Za-z0-9_-]{11})/);
  if (fromWatch) return fromWatch[1];
  return null;
}

function toEmbedUrl(raw: string): string {
  const s = raw.trim();
  if (s.includes("youtube.com/embed/")) return s;
  const short = s.match(/youtu\.be\/([A-Za-z0-9_-]{11})/);
  if (short) return `https://www.youtube.com/embed/${short[1]}`;
  const watch = s.match(/[?&]v=([A-Za-z0-9_-]{11})/);
  if (watch) return `https://www.youtube.com/embed/${watch[1]}`;
  const vimeo = s.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return s;
}

function getThumbnailUrl(embedUrl: string | null): string | null {
  if (!embedUrl) return null;
  const id = getYoutubeId(embedUrl);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

async function fetchYoutubeMeta(url: string): Promise<{ title: string } | null> {
  try {
    const r = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`,
    );
    if (!r.ok) return null;
    const d = await r.json();
    return { title: d.title ?? "" };
  } catch { return null; }
}

// ── Form state ───────────────────────────────────────────────────────────────
type FormState = {
  title_az: string; title_ru: string; url: string;
  type: string; duration_min: string; questions_count: string;
};
const EMPTY_FORM: FormState = {
  title_az: "", title_ru: "", url: "", type: "VIDEO",
  duration_min: "", questions_count: "",
};
const META_TYPES_QUESTIONS = new Set(["TEST", "TAIM_TEST", "BSQ", "KSQ"]);

function buildMetadata(f: FormState): Record<string, number> | null {
  const meta: Record<string, number> = {};
  if (f.duration_min && Number(f.duration_min) > 0)      meta.duration_min    = Number(f.duration_min);
  if (f.questions_count && Number(f.questions_count) > 0) meta.questions_count = Number(f.questions_count);
  return Object.keys(meta).length ? meta : null;
}

// ── Filter tabs ──────────────────────────────────────────────────────────────
const FILTER_TABS = [
  { key: "ALL",      label: "Hamısı" },
  { key: "VIDEO",    label: "Video" },
  { key: "LESSON",   label: "Dərs" },
  { key: "TEST",     label: "Test" },
  { key: "TAIM_TEST",label: "TAİM" },
  { key: "BSQ",      label: "BSQ" },
  { key: "KSQ",      label: "KSQ" },
];

// ── Component ────────────────────────────────────────────────────────────────
export default function ResourcesManagePage() {
  const [topics,      setTopics]      = useState<Topic[]>([]);
  const [topicId,     setTopicId]     = useState<number | null>(null);
  const [resources,   setResources]   = useState<Resource[]>([]);
  const [loadingRes,  setLoadingRes]  = useState(false);
  const [showForm,    setShowForm]    = useState(false);
  const [form,        setForm]        = useState<FormState>(EMPTY_FORM);
  const [saving,      setSaving]      = useState(false);
  const [editId,      setEditId]      = useState<number | null>(null);
  const [editForm,    setEditForm]    = useState<FormState>(EMPTY_FORM);
  const [editSaving,  setEditSaving]  = useState(false);
  const [previewId,   setPreviewId]   = useState<number | null>(null);
  const [filterType,  setFilterType]  = useState("ALL");
  const [fetchingTitle, setFetchingTitle] = useState(false);
  const [fetchingEditTitle, setFetchingEditTitle] = useState(false);
  const topicSearchRef = useRef<HTMLInputElement>(null);
  const [topicSearch,  setTopicSearch]  = useState("");

  useEffect(() => {
    fetch("/api/admin/assignments/topics")
      .then((r) => r.json())
      .then((d) => setTopics(d.topics ?? []))
      .catch(() => {});
  }, []);

  const loadResources = useCallback(async (id: number) => {
    setLoadingRes(true);
    try {
      const r = await fetch(`/api/admin/resources?topic_id=${id}`);
      const d = await r.json();
      setResources(d.resources ?? []);
    } finally { setLoadingRes(false); }
  }, []);

  function selectTopic(id: number) {
    setTopicId(id);
    setShowForm(false);
    setEditId(null);
    setPreviewId(null);
    setFilterType("ALL");
    loadResources(id);
  }

  // ── Auto-fetch YouTube title ──
  async function autoFillTitle(url: string, target: "add" | "edit") {
    if (!url) return;
    const setter = target === "add" ? setForm : setEditForm;
    const setFetching = target === "add" ? setFetchingTitle : setFetchingEditTitle;
    setFetching(true);
    try {
      const meta = await fetchYoutubeMeta(url);
      if (meta?.title) {
        setter((f) => ({
          ...f,
          title_az: f.title_az || meta.title,
          title_ru: f.title_ru || meta.title,
        }));
      }
    } finally { setFetching(false); }
  }

  // ── Add resource ──
  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!topicId) return;
    setSaving(true);
    try {
      const embedUrl = form.type === "VIDEO" ? toEmbedUrl(form.url) : form.url.trim();
      const res = await fetch("/api/admin/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          curriculum_id: topicId,
          type:          form.type,
          title_az:      form.title_az.trim(),
          title_ru:      form.title_ru.trim() || form.title_az.trim(),
          content_url:   embedUrl || null,
          metadata:      buildMetadata(form),
        }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setForm(EMPTY_FORM);
      setShowForm(false);
      await loadResources(topicId);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Xəta");
    } finally { setSaving(false); }
  }

  async function handleDelete(id: number) {
    if (!confirm("Bu resursu silmək istədiyinizə əminsiniz?")) return;
    await fetch(`/api/admin/resources?id=${id}`, { method: "DELETE" });
    if (previewId === id) setPreviewId(null);
    if (topicId) await loadResources(topicId);
  }

  async function handleToggle(r: Resource) {
    await fetch(`/api/admin/resources?id=${r.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_published: !r.is_published }),
    });
    if (topicId) await loadResources(topicId);
  }

  function startEdit(r: Resource) {
    setEditId(r.id);
    setPreviewId(null);
    setEditForm({
      title_az:        r.title_az,
      title_ru:        r.title_ru,
      url:             r.content_url ?? "",
      type:            r.type,
      duration_min:    r.metadata?.duration_min    ? String(r.metadata.duration_min)    : "",
      questions_count: r.metadata?.questions_count ? String(r.metadata.questions_count) : "",
    });
    setShowForm(false);
  }

  async function handleEditSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editId) return;
    setEditSaving(true);
    try {
      const embedUrl = editForm.type === "VIDEO" ? toEmbedUrl(editForm.url) : editForm.url.trim();
      const res = await fetch(`/api/admin/resources?id=${editId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title_az:    editForm.title_az.trim(),
          title_ru:    editForm.title_ru.trim() || editForm.title_az.trim(),
          content_url: embedUrl || null,
          metadata:    buildMetadata(editForm),
        }),
      });
      if (!res.ok) throw new Error("Xəta");
      setEditId(null);
      if (topicId) await loadResources(topicId);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Xəta");
    } finally { setEditSaving(false); }
  }

  // ── Derived state ──
  const grouped: Record<string, { label: string; topics: Topic[] }> = {};
  for (const t of topics) {
    const gLabel = t.grade_subject.grade.label_az;
    const sLabel = t.grade_subject.subject.label_az;
    const key    = `${gLabel} — ${sLabel}`;
    if (!grouped[key]) grouped[key] = { label: key, topics: [] };
    grouped[key].topics.push(t);
  }

  const filteredTopics = topicSearch.trim()
    ? topics.filter((t) => t.title_az.toLowerCase().includes(topicSearch.toLowerCase()))
    : null;

  const selectedTopic  = topics.find((t) => t.id === topicId);
  const filteredRes    = filterType === "ALL"
    ? resources
    : resources.filter((r) => r.type === filterType);

  const typeCounts = resources.reduce((acc, r) => {
    acc[r.type] = (acc[r.type] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const fd = "w-full bg-white text-slate-900 rounded-lg px-3 py-2 text-sm border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 placeholder:text-slate-400";

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Resurs İdarəetməsi</h1>
        <p className="text-slate-400 text-sm mt-0.5">Mövzulara video dərs, test və digər resurslar əlavə edin</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* ── LEFT: Topic picker ── */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-3 py-2.5 border-b border-slate-100 bg-slate-50">
            <input
              ref={topicSearchRef}
              value={topicSearch}
              onChange={(e) => setTopicSearch(e.target.value)}
              placeholder="Mövzu axtar…"
              className="w-full bg-white text-slate-900 rounded-lg px-3 py-1.5 text-xs border border-slate-200 focus:outline-none focus:border-indigo-400 placeholder:text-slate-400"
            />
          </div>
          <div className="overflow-y-auto max-h-[70vh]">
            {filteredTopics ? (
              filteredTopics.length === 0 ? (
                <p className="px-4 py-8 text-center text-slate-400 text-sm">Tapılmadı</p>
              ) : filteredTopics.map((t) => (
                <button key={t.id} onClick={() => selectTopic(t.id)}
                  className={`w-full text-left px-4 py-2.5 border-b border-slate-50 transition-colors flex items-center gap-2 ${
                    topicId === t.id ? "bg-indigo-50 text-indigo-700" : "text-slate-700 hover:bg-slate-50"
                  }`}>
                  <span className="text-xs text-slate-400 w-6 shrink-0 font-mono">{t.order_index}.</span>
                  <span className="text-sm truncate">{t.title_az}</span>
                </button>
              ))
            ) : (
              Object.entries(grouped).map(([key, { label, topics: grpTopics }]) => (
                <div key={key}>
                  <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest truncate">{label}</p>
                  </div>
                  {grpTopics.map((t) => (
                    <button key={t.id} onClick={() => selectTopic(t.id)}
                      className={`w-full text-left px-4 py-2.5 border-b border-slate-50 transition-colors flex items-center gap-2 ${
                        topicId === t.id ? "bg-indigo-50 text-indigo-700" : "text-slate-700 hover:bg-slate-50"
                      }`}>
                      <span className="text-xs text-slate-400 w-6 shrink-0 font-mono">{t.order_index}.</span>
                      <span className="text-sm truncate">{t.title_az}</span>
                    </button>
                  ))}
                </div>
              ))
            )}
            {topics.length === 0 && (
              <p className="px-4 py-8 text-center text-slate-400 text-sm">Mövzu tapılmadı</p>
            )}
          </div>
        </div>

        {/* ── RIGHT: Resources panel ── */}
        <div className="lg:col-span-3 space-y-4">

          {!topicId ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm py-20 text-center">
              <p className="text-4xl mb-3">🎬</p>
              <p className="text-slate-700 font-medium mb-1">Resurs İdarəetməsi</p>
              <p className="text-slate-400 text-sm">Sol tərəfdən mövzu seçin</p>
            </div>
          ) : (
            <>
              {/* Topic header */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-slate-400 mb-0.5">
                    {selectedTopic?.grade_subject.grade.label_az} · {selectedTopic?.grade_subject.subject.label_az}
                  </p>
                  <p className="font-semibold text-slate-900 truncate">{selectedTopic?.title_az}</p>
                </div>
                <button onClick={() => { setShowForm(!showForm); setEditId(null); setPreviewId(null); }}
                  className="shrink-0 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors shadow-sm">
                  {showForm ? "Ləğv et" : "+ Resurs əlavə et"}
                </button>
              </div>

              {/* ── Add form ── */}
              {showForm && (
                <form onSubmit={handleAdd} className="bg-white rounded-xl border border-indigo-200 shadow-sm p-5 space-y-3">
                  <p className="text-sm font-semibold text-slate-700">Yeni resurs</p>

                  {/* Type selector */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">Növ</label>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(TYPE_LABELS).map(([k, v]) => (
                        <button key={k} type="button"
                          onClick={() => setForm((f) => ({ ...f, type: k }))}
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors border ${
                            form.type === k
                              ? "bg-indigo-600 text-white border-indigo-600"
                              : "bg-slate-100 text-slate-600 border-slate-200 hover:border-indigo-300"
                          }`}>
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* URL + auto-title */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      {form.type === "VIDEO" ? "YouTube / Vimeo URL" : "Məzmun URL"}
                    </label>
                    <div className="flex gap-2">
                      <input className={fd} value={form.url}
                        onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                        placeholder={form.type === "VIDEO" ? "https://www.youtube.com/watch?v=..." : "https://..."}
                      />
                      {form.type === "VIDEO" && form.url && (
                        <button type="button" disabled={fetchingTitle}
                          onClick={() => autoFillTitle(form.url, "add")}
                          className="shrink-0 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 text-xs text-slate-600 transition-colors disabled:opacity-50 whitespace-nowrap">
                          {fetchingTitle ? "…" : "Başlığı al"}
                        </button>
                      )}
                    </div>
                    {form.type === "VIDEO" && form.url && (
                      <p className="text-xs text-indigo-500 mt-1">→ embed: {toEmbedUrl(form.url)}</p>
                    )}
                  </div>

                  {/* YouTube thumbnail preview */}
                  {form.type === "VIDEO" && form.url && (() => {
                    const thumb = getThumbnailUrl(toEmbedUrl(form.url));
                    return thumb ? (
                      <div className="rounded-lg overflow-hidden border border-slate-200 aspect-video max-h-40 bg-slate-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={thumb} alt="preview" className="w-full h-full object-cover" />
                      </div>
                    ) : null;
                  })()}

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Başlıq (AZ)</label>
                    <input className={fd} required value={form.title_az}
                      onChange={(e) => setForm((f) => ({ ...f, title_az: e.target.value }))}
                      placeholder="Məs: Natural ədədlər — video dərs" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Başlıq (RU) <span className="text-slate-400 font-normal">(boş qoyulsa AZ ilə eyni)</span>
                    </label>
                    <input className={fd} value={form.title_ru}
                      onChange={(e) => setForm((f) => ({ ...f, title_ru: e.target.value }))}
                      placeholder="Натуральные числа — видеоурок" />
                  </div>

                  {form.type === "VIDEO" && (
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Müddət (dəq)</label>
                      <input type="number" min="1" max="999" className={fd} value={form.duration_min}
                        onChange={(e) => setForm((f) => ({ ...f, duration_min: e.target.value }))}
                        placeholder="Məs: 12" />
                    </div>
                  )}

                  {META_TYPES_QUESTIONS.has(form.type) && (
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Sual sayı</label>
                      <input type="number" min="1" max="999" className={fd} value={form.questions_count}
                        onChange={(e) => setForm((f) => ({ ...f, questions_count: e.target.value }))}
                        placeholder="Məs: 30" />
                    </div>
                  )}

                  <button type="submit" disabled={saving}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-xl py-2.5 text-sm transition-colors shadow-sm">
                    {saving ? "Əlavə edilir…" : "Əlavə et"}
                  </button>
                </form>
              )}

              {/* ── Resources list ── */}
              {loadingRes ? (
                <div className="py-12 text-center text-slate-400 text-sm bg-white rounded-xl border border-slate-200 shadow-sm">
                  Yüklənir…
                </div>
              ) : resources.length === 0 ? (
                <div className="py-16 text-center bg-white rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-3xl mb-2">🎬</p>
                  <p className="text-slate-500 font-medium mb-1">Resurs yoxdur</p>
                  <p className="text-slate-400 text-sm">Bu mövzuya resurs əlavə edin</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

                  {/* Filter tabs */}
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center gap-1.5 flex-wrap">
                    {FILTER_TABS.filter((tab) => tab.key === "ALL" || (typeCounts[tab.key] ?? 0) > 0).map((tab) => (
                      <button key={tab.key} type="button"
                        onClick={() => setFilterType(tab.key)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border ${
                          filterType === tab.key
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
                        }`}>
                        {tab.label}
                        {tab.key !== "ALL" && (
                          <span className={`ml-1 ${filterType === tab.key ? "text-indigo-200" : "text-slate-400"}`}>
                            {typeCounts[tab.key] ?? 0}
                          </span>
                        )}
                        {tab.key === "ALL" && (
                          <span className={`ml-1 ${filterType === "ALL" ? "text-indigo-200" : "text-slate-400"}`}>
                            {resources.length}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="divide-y divide-slate-100">
                    {filteredRes.length === 0 ? (
                      <p className="py-8 text-center text-slate-400 text-sm">Bu növdə resurs yoxdur</p>
                    ) : filteredRes.map((r) => (
                      <div key={r.id}>
                        {editId === r.id ? (
                          /* ── Inline edit form ── */
                          <form onSubmit={handleEditSave} className="p-4 space-y-2.5 bg-indigo-50/30">
                            <div className="grid grid-cols-2 gap-2">
                              <input className={fd} value={editForm.title_az}
                                onChange={(e) => setEditForm((f) => ({ ...f, title_az: e.target.value }))}
                                placeholder="Başlıq AZ" required />
                              <input className={fd} value={editForm.title_ru}
                                onChange={(e) => setEditForm((f) => ({ ...f, title_ru: e.target.value }))}
                                placeholder="Başlıq RU" />
                            </div>
                            <div className="flex gap-2">
                              <input className={fd} value={editForm.url}
                                onChange={(e) => setEditForm((f) => ({ ...f, url: e.target.value }))}
                                placeholder={editForm.type === "VIDEO" ? "YouTube / Vimeo URL" : "Məzmun URL"} />
                              {editForm.type === "VIDEO" && editForm.url && (
                                <button type="button" disabled={fetchingEditTitle}
                                  onClick={() => autoFillTitle(editForm.url, "edit")}
                                  className="shrink-0 px-3 py-1.5 rounded-lg bg-white hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 text-xs text-slate-600 transition-colors disabled:opacity-50 whitespace-nowrap">
                                  {fetchingEditTitle ? "…" : "Başlığı al"}
                                </button>
                              )}
                            </div>
                            {editForm.type === "VIDEO" && editForm.url && (
                              <p className="text-xs text-indigo-500">→ embed: {toEmbedUrl(editForm.url)}</p>
                            )}
                            {editForm.type === "VIDEO" && (
                              <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Müddət (dəq)</label>
                                <input type="number" min="1" max="999" className={fd} value={editForm.duration_min}
                                  onChange={(e) => setEditForm((f) => ({ ...f, duration_min: e.target.value }))}
                                  placeholder="Məs: 12" />
                              </div>
                            )}
                            {META_TYPES_QUESTIONS.has(editForm.type) && (
                              <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Sual sayı</label>
                                <input type="number" min="1" max="999" className={fd} value={editForm.questions_count}
                                  onChange={(e) => setEditForm((f) => ({ ...f, questions_count: e.target.value }))}
                                  placeholder="Məs: 30" />
                              </div>
                            )}
                            <div className="flex gap-2">
                              <button type="submit" disabled={editSaving}
                                className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-medium transition-colors">
                                {editSaving ? "…" : "Yadda saxla"}
                              </button>
                              <button type="button" onClick={() => setEditId(null)}
                                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs hover:bg-slate-100 transition-colors">
                                Ləğv et
                              </button>
                            </div>
                          </form>
                        ) : (
                          <>
                            {/* ── Resource row ── */}
                            {r.type === "VIDEO" ? (
                              /* VIDEO card with thumbnail */
                              <div className="p-3">
                                <div className="flex gap-3">
                                  {/* Thumbnail */}
                                  <div className="shrink-0 w-28 h-16 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 relative">
                                    {(() => {
                                      const thumb = getThumbnailUrl(r.content_url);
                                      return thumb ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={thumb} alt={r.title_az} className="w-full h-full object-cover" />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300 text-2xl">
                                          ▶
                                        </div>
                                      );
                                    })()}
                                    {/* Duration badge */}
                                    {r.metadata?.duration_min && (
                                      <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1 rounded leading-4">
                                        {r.metadata.duration_min}&#x2032;
                                      </span>
                                    )}
                                  </div>

                                  {/* Info */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="min-w-0">
                                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                                          <span className="text-xs px-2 py-0.5 rounded-full border font-medium bg-pink-100 text-pink-700 border-pink-200">
                                            Video
                                          </span>
                                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                            r.is_published ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                                          }`}>
                                            {r.is_published ? "Aktiv" : "Gizli"}
                                          </span>
                                        </div>
                                        <p className="text-sm font-medium text-slate-800 leading-snug line-clamp-2">{r.title_az}</p>
                                      </div>
                                      {/* Actions */}
                                      <div className="flex items-center gap-0.5 shrink-0">
                                        <button onClick={() => setPreviewId(previewId === r.id ? null : r.id)}
                                          title={previewId === r.id ? "Bağla" : "Önizlə"}
                                          className={`p-1.5 rounded-lg text-sm transition-colors ${
                                            previewId === r.id
                                              ? "bg-indigo-100 text-indigo-700"
                                              : "text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                                          }`}>
                                          {previewId === r.id ? "✕" : "▶"}
                                        </button>
                                        <button onClick={() => handleToggle(r)} title={r.is_published ? "Gizlə" : "Aktivləşdir"}
                                          className={`p-1.5 rounded-lg text-sm transition-colors ${
                                            r.is_published ? "text-emerald-600 hover:bg-emerald-50" : "text-slate-400 hover:bg-slate-100"
                                          }`}>
                                          {r.is_published ? "👁" : "🚫"}
                                        </button>
                                        <button onClick={() => startEdit(r)} title="Redaktə et"
                                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors text-sm">
                                          ✏️
                                        </button>
                                        <button onClick={() => handleDelete(r.id)} title="Sil"
                                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors text-sm">
                                          🗑️
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Inline player */}
                                {previewId === r.id && r.content_url && (
                                  <div className="mt-3 rounded-xl overflow-hidden border border-indigo-200 bg-black aspect-video shadow-sm">
                                    <iframe
                                      src={r.content_url + (r.content_url.includes("?") ? "&" : "?") + "autoplay=1"}
                                      className="w-full h-full"
                                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                      allowFullScreen
                                    />
                                  </div>
                                )}
                              </div>
                            ) : (
                              /* Non-video row */
                              <div className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap mb-1">
                                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${TYPE_COLORS[r.type] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>
                                      {TYPE_LABELS[r.type] ?? r.type}
                                    </span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                      r.is_published ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                                    }`}>
                                      {r.is_published ? "Aktiv" : "Gizli"}
                                    </span>
                                    {r.metadata?.questions_count && (
                                      <span className="text-xs text-slate-400">❓ {r.metadata.questions_count} sual</span>
                                    )}
                                  </div>
                                  <p className="text-sm font-medium text-slate-800 truncate">{r.title_az}</p>
                                  {r.content_url && (
                                    <p className="text-xs text-slate-400 truncate mt-0.5 max-w-[220px]">
                                      {r.content_url.length > 55 ? r.content_url.slice(0, 55) + "…" : r.content_url}
                                    </p>
                                  )}
                                </div>
                                <div className="flex items-center gap-0.5 shrink-0">
                                  {r.content_url && (
                                    <a href={r.content_url} target="_blank" rel="noopener noreferrer"
                                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors text-sm"
                                      title="Aç">
                                      ↗
                                    </a>
                                  )}
                                  <button onClick={() => handleToggle(r)} title={r.is_published ? "Gizlə" : "Aktivləşdir"}
                                    className={`p-1.5 rounded-lg text-sm transition-colors ${
                                      r.is_published ? "text-emerald-600 hover:bg-emerald-50" : "text-slate-400 hover:bg-slate-100"
                                    }`}>
                                    {r.is_published ? "👁" : "🚫"}
                                  </button>
                                  <button onClick={() => startEdit(r)} title="Redaktə et"
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors text-sm">
                                    ✏️
                                  </button>
                                  <button onClick={() => handleDelete(r.id)} title="Sil"
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors text-sm">
                                    🗑️
                                  </button>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
