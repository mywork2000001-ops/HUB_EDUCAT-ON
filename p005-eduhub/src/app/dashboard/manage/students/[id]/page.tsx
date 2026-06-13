"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

type Student = {
  id: string; name: string; email: string;
  class_name: string; group_name: string | null; is_active: boolean;
};

export default function EditStudentPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [student, setStudent] = useState<Student | null>(null);
  const [form, setForm]       = useState({ name: "", email: "", password: "", class_name: "", group_name: "", is_active: true });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/students/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.student) { setNotFound(true); return; }
        const s: Student = d.student;
        setStudent(s);
        setForm({ name: s.name, email: s.email, password: "", class_name: s.class_name, group_name: s.group_name ?? "", is_active: s.is_active });
      })
      .catch(() => setNotFound(true));
  }, [id]);

  function set(k: string, v: string | boolean) { setForm((f) => ({ ...f, [k]: v })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password && form.password.length < 6) { setError("Şifrə minimum 6 simvol olmalıdır"); return; }
    setError("");
    setLoading(true);
    try {
      const body: Record<string, unknown> = {
        name:       form.name.trim(),
        email:      form.email.trim(),
        class_name: form.class_name.trim(),
        group_name: form.group_name.trim() || null,
        is_active:  form.is_active,
      };
      if (form.password) body.password = form.password;

      const res  = await fetch(`/api/admin/students/${id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Xəta baş verdi");
      router.push("/dashboard/manage/students");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xəta baş verdi");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`"${student?.name}" şagirdini silmək istədiyinizə əminsiniz?`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/students/${id}`, { method: "DELETE" });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Silmə xətası"); }
      router.push("/dashboard/manage/students");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xəta baş verdi");
      setLoading(false);
    }
  }

  const field = "w-full bg-slate-800 text-white rounded-lg px-4 py-2.5 text-sm border border-slate-700 focus:outline-none focus:border-indigo-500 placeholder:text-slate-500";

  if (notFound) {
    return (
      <div className="p-6 max-w-lg">
        <p className="text-red-400 text-sm">Şagird tapılmadı.</p>
        <Link href="/dashboard/manage/students" className="text-indigo-400 text-sm mt-2 block hover:underline">← Geri</Link>
      </div>
    );
  }

  if (!student) {
    return <div className="p-6 text-slate-500 text-sm">Yüklənir…</div>;
  }

  return (
    <div className="p-6 max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/manage/students" className="text-slate-400 hover:text-white transition-colors text-sm">
          ← Geri
        </Link>
        <h1 className="text-xl font-bold text-white">Şagirdi düzəlt</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-900 rounded-2xl p-6 space-y-4">
        <div>
          <label className="block text-slate-300 text-sm mb-1.5">Ad Soyad</label>
          <input className={field} value={form.name} onChange={(e) => set("name", e.target.value)} required />
        </div>
        <div>
          <label className="block text-slate-300 text-sm mb-1.5">E-poçt (Gmail)</label>
          <input className={field} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} required />
        </div>
        <div>
          <label className="block text-slate-300 text-sm mb-1.5">Yeni şifrə (boş qoyulsa dəyişmir)</label>
          <input className={field} type="text" value={form.password} onChange={(e) => set("password", e.target.value)}
            placeholder="Ən azı 6 simvol" minLength={6} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-300 text-sm mb-1.5">Sinif</label>
            <input className={field} value={form.class_name} onChange={(e) => set("class_name", e.target.value)} required placeholder="5A" />
          </div>
          <div>
            <label className="block text-slate-300 text-sm mb-1.5">Qrup (istəyə görə)</label>
            <input className={field} value={form.group_name} onChange={(e) => set("group_name", e.target.value)} placeholder="Qrup 1" />
          </div>
        </div>
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input type="checkbox" checked={form.is_active} onChange={(e) => set("is_active", e.target.checked)}
            className="w-4 h-4 accent-indigo-600" />
          <span className="text-slate-300 text-sm">Aktiv hesab</span>
        </label>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-3 py-2">{error}</div>
        )}

        <div className="flex gap-3 pt-1">
          <button type="submit" disabled={loading}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-lg py-2.5 text-sm transition-colors">
            {loading ? "Saxlanılır…" : "Yadda saxla"}
          </button>
          <button type="button" onClick={handleDelete} disabled={loading}
            className="px-5 py-2.5 rounded-lg bg-red-900/30 hover:bg-red-900/50 text-red-400 text-sm transition-colors disabled:opacity-50">
            Sil
          </button>
        </div>
      </form>
    </div>
  );
}
