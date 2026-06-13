import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 flex flex-col">

      {/* ── Header ── */}
      <header className="border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-md">E</span>
            <div>
              <p className="text-white font-bold text-sm leading-none">EduHub</p>
              <p className="text-slate-500 text-[10px]">Vahid tədris platforması</p>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm space-y-4">

          {/* Title */}
          <div className="text-center mb-8">
            <p className="text-4xl mb-3">🎓</p>
            <h1 className="text-xl font-bold text-white">EduHub-ə xoş gəlmisiniz</h1>
            <p className="text-slate-400 text-sm mt-1.5">Rolunuzu seçib daxil olun</p>
          </div>

          {/* Teacher entry */}
          <Link href="/auth/login"
            className="group flex items-center gap-5 p-5 rounded-2xl border border-indigo-500/30
                       bg-gradient-to-br from-indigo-950 to-slate-900
                       hover:border-indigo-500/70 hover:shadow-lg hover:shadow-indigo-900/40
                       transition-all active:scale-[0.98]">
            <div className="w-13 h-13 rounded-xl bg-indigo-600/20 border border-indigo-500/30
                            flex items-center justify-center text-2xl shrink-0 w-14 h-14">
              🏫
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white">Müəllim</p>
              <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">
                Şagirdləri idarə et, mövzu tə'yin et, nəticələrə bax
              </p>
            </div>
            <span className="text-indigo-400 text-lg group-hover:translate-x-1 transition-transform shrink-0">→</span>
          </Link>

          {/* Student entry */}
          <Link href="/learn/login"
            className="group flex items-center gap-5 p-5 rounded-2xl border border-emerald-500/30
                       bg-gradient-to-br from-emerald-950 to-slate-900
                       hover:border-emerald-500/70 hover:shadow-lg hover:shadow-emerald-900/40
                       transition-all active:scale-[0.98]">
            <div className="w-14 h-14 rounded-xl bg-emerald-600/20 border border-emerald-500/30
                            flex items-center justify-center text-2xl shrink-0">
              📚
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white">Şagird</p>
              <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">
                Müəllimin tə'yin etdiyi mövzuları keç, tapşırıqları tamamla
              </p>
            </div>
            <span className="text-emerald-400 text-lg group-hover:translate-x-1 transition-transform shrink-0">→</span>
          </Link>

          {/* Install hint */}
          <p className="text-center text-slate-600 text-xs pt-4">
            📱 Tətbiqi telefonunuza quraşdırmaq üçün brauzer menyusunda
            &ldquo;Ana ekrana əlavə et&rdquo; seçin
          </p>
        </div>
      </div>
    </main>
  );
}
