import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold text-white mb-2">Səhifə tapılmadı</h1>
        <p className="text-slate-400 text-sm mb-6">Bu səhifə mövcud deyil və ya hələ hazırlanır.</p>
        <Link href="/"
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors">
          Ana səhifəyə qayıt
        </Link>
      </div>
    </main>
  );
}
