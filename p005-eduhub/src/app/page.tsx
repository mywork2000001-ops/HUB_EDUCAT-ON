import Link from "next/link";

const PLATFORMS = [
  {
    id: "P001",
    href: "/dim",
    icon: "📊",
    title: "DİM Test Bankı",
    desc: "2025-ci il riyaziyyat testləri — 17 dərs, 680 sual",
    color: "from-blue-600 to-blue-800",
    badge: "V sinif",
  },
  {
    id: "P002",
    href: "/textbook",
    icon: "📖",
    title: "Riyaziyyat Dərsliyi",
    desc: "İnteraktiv dərslik — 4 sütun sistemi, 28 mövzu",
    color: "from-emerald-600 to-emerald-800",
    badge: "V sinif",
  },
  {
    id: "P003",
    href: "/exam",
    icon: "🎯",
    title: "Blok İmtahan",
    desc: "Blok imtahana hazırlıq — testlər, sübutlar, situasiyalar",
    color: "from-violet-600 to-violet-800",
    badge: "V sinif",
  },
  {
    id: "P004",
    href: "/taim",
    icon: "🏫",
    title: "TAİM 2026",
    desc: "MİQ attestasiyasına hazırlıq — 47 test, 1500+ sual",
    color: "from-orange-600 to-orange-800",
    badge: "Müəllim",
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
        <Link
          href="/auth/login"
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
        >
          Müəllim paneli →
        </Link>
      </header>

      <section className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        {PLATFORMS.map((p) => (
          <Link
            key={p.id}
            href={p.href}
            className={`relative rounded-2xl bg-gradient-to-br ${p.color} p-6 hover:scale-[1.02] transition-transform shadow-lg`}
          >
            <span className="absolute top-4 right-4 text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">
              {p.badge}
            </span>
            <div className="text-4xl mb-3">{p.icon}</div>
            <h2 className="text-lg font-bold text-white mb-1">{p.title}</h2>
            <p className="text-white/80 text-sm leading-relaxed">{p.desc}</p>
            <div className="mt-4 text-white/60 text-xs">{p.id} →</div>
          </Link>
        ))}
      </section>

      <div className="max-w-5xl mx-auto text-center text-slate-500 text-xs">
        Proqramı telefonunuza quraşdırmaq üçün brauzer menyusunda &ldquo;Ana ekrana əlavə et&rdquo; seçin
      </div>
    </main>
  );
}
