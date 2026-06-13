import Link from "next/link";

const PLATFORMS = [
  {
    id: "P001",
    href: "/api/content/P001_Math_5_DIM/5dim_sinif_testi2025/index.html",
    icon: "📊",
    title: "DİM Test Bankı",
    desc: "2025-ci il riyaziyyat testləri — 17 dərs, 680 sual",
    color: "from-blue-600 to-blue-800",
    badge: "V sinif",
    stats: "17 dərs · 680 sual",
  },
  {
    id: "P002",
    href: "/api/content/P002_Math_5_Darslik/index.html",
    icon: "📖",
    title: "Riyaziyyat Dərsliyi",
    desc: "İnteraktiv dərslik — 4 sütun sistemi, 88 dərs",
    color: "from-emerald-600 to-emerald-800",
    badge: "V sinif",
    stats: "8 fəsil · 88 dərs",
  },
  {
    id: "P003",
    href: "/api/content/P003_Block_Exam/app/dist/index.html",
    icon: "🎯",
    title: "Blok İmtahan",
    desc: "Blok imtahana hazırlıq — mövzular, testlər, sübutlar",
    color: "from-violet-600 to-violet-800",
    badge: "V sinif",
    stats: "28 mövzu · 8 test",
  },
  {
    id: "P004",
    href: "/api/content/P004_TAIM_2026/index.html",
    icon: "🏫",
    title: "TAİM 2026",
    desc: "MİQ attestasiyasına hazırlıq — 47 test, 1500+ sual",
    color: "from-orange-600 to-orange-800",
    badge: "Müəllim",
    stats: "47 test · 1500+ sual",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8">
      <header className="max-w-5xl mx-auto mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">EduHub</h1>
          <p className="text-slate-400 text-sm mt-0.5">Vahid tədris platforması</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/learn"
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition-colors"
          >
            Şagird paneli →
          </Link>
          <Link
            href="/auth/login"
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
          >
            Müəllim →
          </Link>
        </div>
      </header>

      <section className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        {PLATFORMS.map((p) => (
          <a
            key={p.id}
            href={p.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`relative rounded-2xl bg-gradient-to-br ${p.color} p-6 hover:scale-[1.02] transition-transform shadow-lg block`}
          >
            <span className="absolute top-4 right-4 text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">
              {p.badge}
            </span>
            <div className="text-4xl mb-3">{p.icon}</div>
            <h2 className="text-lg font-bold text-white mb-1">{p.title}</h2>
            <p className="text-white/80 text-sm leading-relaxed">{p.desc}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-white/50 text-xs">{p.stats}</span>
              <span className="text-white/70 text-xs font-medium">{p.id} →</span>
            </div>
          </a>
        ))}
      </section>

      <div className="max-w-5xl mx-auto text-center text-slate-500 text-xs">
        Proqramı telefonunuza quraşdırmaq üçün brauzer menyusunda &ldquo;Ana ekrana əlavə et&rdquo; seçin
      </div>
    </main>
  );
}
