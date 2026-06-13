export const dynamic = "force-dynamic";

const PLATFORMS = [
  {
    id:    "P001",
    href:  "/api/content/P001_Math_5_DIM/5dim_sinif_testi2025/index.html",
    icon:  "📊",
    title: "DİM Test Bankı",
    desc:  "2025-ci il riyaziyyat testləri — 17 dərs, 680 sual",
    color: "from-blue-600 to-blue-700",
    bg:    "bg-blue-600",
    badge: "V sinif",
    stats: "17 dərs · 680 sual",
  },
  {
    id:    "P002",
    href:  "/api/content/P002_Math_5_Darslik/index.html",
    icon:  "📖",
    title: "Riyaziyyat Dərsliyi",
    desc:  "İnteraktiv dərslik — 4 sütun sistemi, 88 dərs",
    color: "from-emerald-600 to-emerald-700",
    bg:    "bg-emerald-600",
    badge: "V sinif",
    stats: "8 fəsil · 88 dərs",
  },
  {
    id:    "P003",
    href:  "/api/content/P003_Block_Exam/app/dist/index.html",
    icon:  "🎯",
    title: "Blok İmtahan",
    desc:  "Blok imtahana hazırlıq — mövzular, testlər, sübutlar",
    color: "from-violet-600 to-violet-700",
    bg:    "bg-violet-600",
    badge: "V sinif",
    stats: "28 mövzu · 8 test",
  },
  {
    id:    "P004",
    href:  "/api/content/P004_TAIM_2026/index.html",
    icon:  "🏫",
    title: "TAİM 2026",
    desc:  "MİQ attestasiyasına hazırlıq — 47 test, 1500+ sual",
    color: "from-orange-600 to-orange-700",
    bg:    "bg-orange-600",
    badge: "Müəllim",
    stats: "47 test · 1500+ sual",
  },
];

export default function PlatformsPage() {
  return (
    <div className="p-6 max-w-4xl">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Platformalar</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          P001–P004 interaktiv tədris platformaları — yeni sekmede açılır
        </p>
      </div>

      {/* Info banner */}
      <div className="mb-6 flex items-start gap-3 bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3">
        <span className="text-xl shrink-0">ℹ️</span>
        <p className="text-sm text-indigo-700 leading-relaxed">
          Bu platformalar yalnız <strong>müəllim panelindən</strong> əlçatandır.
          Şagirdlər platformaları birbaşa açmır — öyrənmə <code className="bg-indigo-100 px-1 py-0.5 rounded text-xs">/learn</code> üzərindən gedir.
        </p>
      </div>

      {/* Platform grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PLATFORMS.map((p) => (
          <a
            key={p.id}
            href={p.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`relative rounded-2xl bg-gradient-to-br ${p.color} p-6
                        hover:scale-[1.02] hover:shadow-xl transition-all shadow-md block group`}
          >
            {/* Badge */}
            <span className="absolute top-4 right-4 text-xs bg-white/25 text-white px-2 py-0.5 rounded-full font-medium">
              {p.badge}
            </span>

            {/* Icon */}
            <div className="text-4xl mb-3">{p.icon}</div>

            {/* Title + desc */}
            <h3 className="text-lg font-bold text-white mb-1">{p.title}</h3>
            <p className="text-white/80 text-sm leading-relaxed">{p.desc}</p>

            {/* Footer */}
            <div className="mt-4 flex items-center justify-between">
              <span className="text-white/50 text-xs">{p.stats}</span>
              <span className="text-white/80 text-xs font-bold group-hover:text-white transition-colors">
                {p.id} → Aç
              </span>
            </div>
          </a>
        ))}
      </div>

      {/* Usage note */}
      <div className="mt-6 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <p className="text-sm font-semibold text-slate-700 mb-3">Platformadan şagirdə necə mövzu tə'yin edilir?</p>
        <ol className="space-y-2 text-sm text-slate-600">
          <li className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
            Yuxarıdakı platformaları açın → mövzu/testlərə baxın
          </li>
          <li className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
            <span>
              <strong>Dərslər</strong> bölməsindən istədiyiniz mövzunu tapın
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
            <span>
              <strong>Tə'yinatlar</strong> bölməsindən sinif/qrupa mövzu tə'yin edin
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">4</span>
            Şagirdlər <code className="bg-slate-100 px-1 py-0.5 rounded text-xs">/learn</code> girərkən yalnız tə'yin edilmiş mövzuları görür
          </li>
        </ol>
      </div>
    </div>
  );
}
