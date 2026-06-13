import type { ResourceType } from "@/generated/prisma/client";

export type Lang = "az" | "ru";

export const RESOURCE_TYPE_LABELS: Record<ResourceType, Record<Lang, string>> = {
  LESSON:    { az: "Dərs planları (KTP)", ru: "Поурочные планы (КТП)" },
  TEST:      { az: "Testlər",             ru: "Тесты" },
  TAIM_TEST: { az: "TAİM testləri",       ru: "Тесты TAİM" },
  BSQ:       { az: "Buraxılış sınaq",     ru: "Выпускной пробный" },
  KSQ:       { az: "Kiçik summativ",      ru: "Малое суммативное" },
  WORKBOOK:  { az: "İş dəftəri",          ru: "Рабочая тетрадь" },
  VIDEO:     { az: "Video dərs",          ru: "Видеоурок" },
};

export const RESOURCE_TYPE_COLOR: Record<ResourceType, string> = {
  LESSON:    "bg-blue-100 text-blue-700 border-blue-200",
  TEST:      "bg-purple-100 text-purple-700 border-purple-200",
  TAIM_TEST: "bg-orange-100 text-orange-700 border-orange-200",
  BSQ:       "bg-red-100 text-red-700 border-red-200",
  KSQ:       "bg-yellow-100 text-yellow-700 border-yellow-200",
  WORKBOOK:  "bg-green-100 text-green-700 border-green-200",
  VIDEO:     "bg-pink-100 text-pink-700 border-pink-200",
};

export const GRADES = Array.from({ length: 11 }, (_, i) => ({
  number: i + 1,
  slug:   `grade-${i + 1}`,
  label:  `${i + 1}-ci sinif`,
}));

export const SUBJECTS: Array<{
  slug: string;
  label_az: string;
  label_ru: string;
  icon: string;
}> = [
  { slug: "math",           label_az: "Riyaziyyat",        label_ru: "Математика",        icon: "📐" },
  { slug: "informatics",    label_az: "İnformatika",       label_ru: "Информатика",       icon: "💻" },
  { slug: "algorithmics",   label_az: "Alqoritmlər",       label_ru: "Алгоритмика",       icon: "🧩" },
  { slug: "physics",        label_az: "Fizika",            label_ru: "Физика",            icon: "⚛️" },
  { slug: "chemistry",      label_az: "Kimya",             label_ru: "Химия",             icon: "🧪" },
  { slug: "biology",        label_az: "Biologiya",         label_ru: "Биология",          icon: "🌿" },
  { slug: "history",        label_az: "Tarix",             label_ru: "История",           icon: "📜" },
  { slug: "language",       label_az: "Azərbaycan dili",   label_ru: "Азерб. язык",       icon: "🗣️" },
  { slug: "block-exam",     label_az: "Blok İmtahan",      label_ru: "Блок Экзамен",      icon: "📝" },
  { slug: "taim-2026",      label_az: "TAİM 2026",         label_ru: "TAİM 2026",         icon: "🎓" },
];
