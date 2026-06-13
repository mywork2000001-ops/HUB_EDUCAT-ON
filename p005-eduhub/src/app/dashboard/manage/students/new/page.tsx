"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewStudentPage() {
  const router = useRouter();
  const [form, setForm]     = useState({ name: "", email: "", password: "", class_name: "", group_name: "" });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/admin/students")
      .then((r) => r.json())
      .then((d) => {
        const names = [...new Set<string>((d.students ?? []).map((s: { class_name: string }) => s.class_name))].sort();
        setClasses(names);
      })
      .catch(() => {});
  }, []);

  function set(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password.length < 6) { setError("Şifrə minimum 6 simvol olmalıdır"); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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

  const field = "w-full bg-slate-800 text-white rounded-lg px-4 py-2.5 text-sm border border-slate-700 focus:outline-none focus:border-indigo-500 placeholder:text-slate-500";

  return (
    <div className="p-6 max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/manage/students" className="text-slate-400 hover:text-white text-sm transition-colors">← Geri</Link>
        <h1 className="text-xl font-bold text-white">Yeni şagird</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-900 rounded-2xl p-6 space-y-4">
        {/* Name */}
        <div>
          <label className="block text-slate-300 text-sm mb-1.5">Ad Soyad</label>
          <input className={field} value={form.name} onChange={(e) => set("name", e.target.value)}
            required placeholder="Əli Məmmədov" />
        </div>

        {/* Email */}
        <div>
          <label className="block text-slate-300 text-sm mb-1.5">E-poçt</label>
          <input className={field} type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
            required placeholder="eli.mammadov@gmail.com" />
        </div>

        {/* Password */}
        <div>
          <label className="block text-slate-300 text-sm mb-1.5">Şifrə</label>
          <input className={field} type="password" value={form.password} onChange={(e) => set("password", e.target.value)}
            required placeholder="Ən azı 6 simvol" minLength={6} />
        </div>

        {/* Class — smart selector */}
        <div>
          <label className="block text-slate-300 text-sm mb-1.5">Sinif</label>
          {classes.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {classes.map((c) => (
                <button key={c} type="button" onClick={() => set("class_name", c)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    form.class_name === c
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                  }`}>
                  {c}
                </button>
              ))}
            </div>
          )}
          <input className={field} value={form.class_name} onChange={(e) => set("class_name", e.target.value)}
            required placeholder="5A, 6B, 7A …" />
        </div>

        {/* Group */}
        <div>
          <label className="block text-slate-300 text-sm mb-1.5">Qrup <span className="text-slate-500 font-normal">(istəyə görə)</span></label>
          <input className={field} value={form.group_name} onChange={(e) => set("group_name", e.target.value)}
            placeholder="Qrup 1" />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-3 py-2">{error}</div>
        )}

        <button type="submit" disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-lg py-2.5 text-sm transition-colors">
          {loading ? "Əlavə edilir…" : "Şagirdi əlavə et"}
        </button>
      </form>
    </div>
  );
}
