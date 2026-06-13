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
    <main className="min-h-screen bg-slate-950">

      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">E</span>
            <span className="text-white font-semibold text-sm">EduHub</span>
            <span className="hidden sm:block text-slate-600 text-xs">— Vahid tədris platforması</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/learn/login"
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
              Şagird girişi
            </Link>
            <Link href="/auth/login"
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors">
              Müəllim girişi
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">

        {/* ── Entry point cards ───────────────────────────────── */}
        <section>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">Giriş</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Teacher */}
            <Link href="/auth/login"
              className="group relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950 to-slate-900
                         p-6 hover:border-indigo-500/60 hover:shadow-lg hover:shadow-indigo-900/30 transition-all">
              <div className="absolute inset-0 bg-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-11 h-11 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-2xl mb-4">
                  🎓
                </div>
                <h2 className="text-base font-bold text-white mb-1">Müəllim Paneli</h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Şagirdləri idarə et, mövzuları tə'yin et, nəticələrə bax
                </p>
                <div className="mt-5 flex items-center gap-2">
                  <span className="text-xs text-indigo-400 font-medium">Daxil ol</span>
                  <span className="text-indigo-400 text-sm group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </Link>

            {/* Student */}
            <Link href="/learn/login"
              className="group relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950 to-slate-900
                         p-6 hover:border-emerald-500/60 hover:shadow-lg hover:shadow-emerald-900/30 transition-all">
              <div className="absolute inset-0 bg-emerald-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-11 h-11 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-2xl mb-4">
                  📚
                </div>
                <h2 className="text-base font-bold text-white mb-1">Şagird Paneli</h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Müəllimin tə'yin etdiyi mövzuları öyrən və tapşırıqları tamamla
                </p>
                <div className="mt-5 flex items-center gap-2">
                  <span className="text-xs text-emerald-400 font-medium">Daxil ol</span>
                  <span className="text-emerald-400 text-sm group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </Link>

          </div>
        </section>

        {/* ── Divider ─────────────────────────────────────────── */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-slate-800" />
          <span className="text-xs text-slate-600 font-medium uppercase tracking-widest">Platformalar</span>
          <div className="flex-1 h-px bg-slate-800" />
        </div>

        {/* ── Platform cards ──────────────────────────────────── */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <h3 className="text-lg font-bold text-white mb-1">{p.title}</h3>
              <p className="text-white/80 text-sm leading-relaxed">{p.desc}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-white/50 text-xs">{p.stats}</span>
                <span className="text-white/70 text-xs font-medium">{p.id} →</span>
              </div>
            </a>
          ))}
        </section>

        {/* ── Footer ──────────────────────────────────────────── */}
        <footer className="text-center text-slate-600 text-xs pb-4">
          Proqramı telefonunuza quraşdırmaq üçün brauzer menyusunda &ldquo;Ana ekrana əlavə et&rdquo; seçin
        </footer>

      </div>
    </main>
  );
}
