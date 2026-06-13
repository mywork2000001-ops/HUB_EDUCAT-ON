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
  LESSON:    "bg-blue-900/40 text-blue-300 border-blue-800/50",
  TEST:      "bg-purple-900/40 text-purple-300 border-purple-800/50",
  TAIM_TEST: "bg-orange-900/40 text-orange-300 border-orange-800/50",
  BSQ:       "bg-red-900/40 text-red-300 border-red-800/50",
  KSQ:       "bg-yellow-900/40 text-yellow-300 border-yellow-800/50",
  WORKBOOK:  "bg-green-900/40 text-green-300 border-green-800/50",
  VIDEO:     "bg-pink-900/40 text-pink-300 border-pink-800/50",
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
  { slug: "math",        label_az: "Riyaziyyat",      label_ru: "Математика",   icon: "📐" },
  { slug: "informatics", label_az: "İnformatika",     label_ru: "Информатика",  icon: "💻" },
  { slug: "physics",     label_az: "Fizika",          label_ru: "Физика",       icon: "⚛️" },
  { slug: "chemistry",   label_az: "Kimya",           label_ru: "Химия",        icon: "🧪" },
  { slug: "biology",     label_az: "Biologiya",       label_ru: "Биология",     icon: "🌿" },
  { slug: "history",     label_az: "Tarix",           label_ru: "История",      icon: "📜" },
  { slug: "language",    label_az: "Azərbaycan dili", label_ru: "Азерб. язык",  icon: "🗣️" },
];
