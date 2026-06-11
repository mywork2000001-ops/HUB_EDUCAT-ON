import Link from "next/link";

const STATS = [
  { label: "Ümumi nəticə", value: "—", icon: "📋", href: "/dashboard/results" },
  { label: "Şagirdlər",    value: "—", icon: "👥", href: "/dashboard/students" },
  { label: "Orta bal",     value: "—%",icon: "📈", href: "/dashboard/results" },
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8">
      <header className="max-w-5xl mx-auto mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Müəllim Paneli</h1>
          <p className="text-slate-400 text-sm mt-0.5">Şagird nəticələri və statistika</p>
        </div>
        <Link href="/" className="text-slate-400 hover:text-white text-sm transition-colors">
          ← Hub
        </Link>
      </header>

      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {STATS.map((s) => (
          <Link key={s.label} href={s.href}
            className="bg-slate-900 rounded-xl p-5 hover:bg-slate-800 transition-colors">
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="text-2xl font-bold text-white">{s.value}</div>
            <div className="text-slate-400 text-sm mt-0.5">{s.label}</div>
          </Link>
        ))}
      </div>

      <div className="max-w-5xl mx-auto bg-slate-900 rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-4">Son nəticələr</h2>
        <p className="text-slate-500 text-sm text-center py-10">
          Hələ heç bir nəticə yoxdur. Şagirdlər test keçdikdə burada görünəcək.
        </p>
      </div>
    </main>
  );
}
