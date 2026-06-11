import Link from "next/link";

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
        {[
          { label: "Ümumi nəticə", value: "—", icon: "📋", href: "/dashboard/results" },
          { label: "Şagirdlər", value: "—", icon: "👥", href: "/dashboard/students" },
          { label: "Orta bal", value: "—%", icon: "📈", href: "/dashboard/results" },
        ].map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-slate-900 rounded-xl p-5 hover:bg-slate-800 transition-colors"
          >
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-slate-400 text-sm mt-0.5">{stat.label}</div>
          </Link>
        ))}
      </div>

      <div className="max-w-5xl mx-auto bg-slate-900 rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-4">Son nəticələr</h2>
        <div className="text-slate-500 text-sm text-center py-10">
          Hələ heç bir nəticə yoxdur. Şagirdlər test keçdikdə burada görünəcək.
        </div>
      </div>
    </main>
  );
}
