/**
 * seed-grades.ts — правильное распределение предметов по классам
 *
 * Классификация:
 *   5-ci sinif  → math (P002-5) + dim-test (P001)
 *   6-cı sinif  → math (P002-6)
 *   Abiturient  → block-exam (P003)
 *   Müəllim     → taim-2026 (P004 — müəllimlər işə qəbulu / MİQ)
 *
 * БЕЗОПАСНО: только upsert + перенос, ничего не удаляет кроме неправильных GradeSubject.
 * ЗАПУСК: npx tsx prisma/seed-grades.ts
 */

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db      = new PrismaClient({ adapter });

async function moveSubjectToGrade(
  fromGradeId: number,
  toGradeId:   number,
  subjectId:   number,
  subjectSlug: string,
) {
  // 1. Ensure target GradeSubject exists before updateMany
  await db.gradeSubject.upsert({
    where:  { grade_id_subject_id: { grade_id: toGradeId, subject_id: subjectId } },
    update: {},
    create: { grade_id: toGradeId, subject_id: subjectId },
  });

  // 2. Move all curriculum_items to new grade
  const { count } = await db.curriculumItem.updateMany({
    where: { grade_id: fromGradeId, subject_id: subjectId },
    data:  { grade_id: toGradeId },
  });

  // 3. Remove old GradeSubject (safe — no items reference it anymore)
  try {
    await db.gradeSubject.delete({
      where: { grade_id_subject_id: { grade_id: fromGradeId, subject_id: subjectId } },
    });
    console.log(`  ✓ ${subjectSlug}: Grade(${fromGradeId}) → Grade(${toGradeId}) — ${count} item köçürüldü`);
  } catch {
    console.log(`  ℹ️  ${subjectSlug}: GradeSubject(from) artıq mövcud deyil`);
  }
}

async function main() {
  // ── Fetch core records ────────────────────────────────────────────────────
  const grade5    = await db.grade.findUniqueOrThrow({ where: { number: 5 } });
  const math      = await db.subject.findUniqueOrThrow({ where: { slug: "math" } });
  const dimTest   = await db.subject.findUniqueOrThrow({ where: { slug: "dim-test" } });
  const blockExam = await db.subject.findUniqueOrThrow({ where: { slug: "block-exam" } });
  const taim      = await db.subject.findUniqueOrThrow({ where: { slug: "taim-2026" } });

  // ── Ensure Grade 6 ────────────────────────────────────────────────────────
  const grade6 = await db.grade.upsert({
    where:  { number: 6 },
    update: {},
    create: { number: 6, slug: "grade-6", label_az: "6-cı sinif", label_ru: "6-й класс" },
  });
  await db.gradeSubject.upsert({
    where:  { grade_id_subject_id: { grade_id: grade6.id, subject_id: math.id } },
    update: {},
    create: { grade_id: grade6.id, subject_id: math.id },
  });

  // ── Ensure Grade 5 has math + dim-test ────────────────────────────────────
  for (const sub of [math, dimTest]) {
    await db.gradeSubject.upsert({
      where:  { grade_id_subject_id: { grade_id: grade5.id, subject_id: sub.id } },
      update: {},
      create: { grade_id: grade5.id, subject_id: sub.id },
    });
  }
  console.log(`✓ Grade 5: math + dim-test — GradeSubject yoxlanıldı`);

  // ── Create "Abiturient" grade — P003 Block Exam ───────────────────────────
  console.log("\n📝 Abiturient qradı yaradılır…");
  const abiturient = await db.grade.upsert({
    where:  { slug: "abiturient" },
    update: { label_az: "Abiturient", label_ru: "Абитуриент" },
    create: { number: 12, slug: "abiturient", label_az: "Abiturient", label_ru: "Абитуриент" },
  });

  // Move block-exam: Grade 5 → Abiturient
  await moveSubjectToGrade(grade5.id, abiturient.id, blockExam.id, "block-exam");

  // ── Create "Müəllim" grade — P004 TAİM 2026 ──────────────────────────────
  console.log("\n🎓 Müəllim qradı yaradılır…");
  const muellim = await db.grade.upsert({
    where:  { slug: "muellim" },
    update: { label_az: "Müəllim", label_ru: "Учитель (MİQ)" },
    create: { number: 13, slug: "muellim", label_az: "Müəllim", label_ru: "Учитель (MİQ)" },
  });

  // Move taim-2026: Grade 5 → Müəllim
  await moveSubjectToGrade(grade5.id, muellim.id, taim.id, "taim-2026");

  // ── Final state ───────────────────────────────────────────────────────────
  const grades = await db.grade.findMany({
    include: { subjects: { include: { subject: true } } },
    orderBy: { number: "asc" },
  });

  console.log("\n✅ seed-grades.ts TAMAMLANDI\n");
  console.log("  Sinif/Qrup          Predmetlər");
  console.log("  ─────────────────── ──────────────────────────────────");
  for (const g of grades) {
    const subs = g.subjects.map(gs => `${gs.subject.icon ?? "•"} ${gs.subject.slug}`).join("  ");
    console.log(`  ${g.label_az.padEnd(19)} ${subs || "(yoxdur)"}`);
  }
  console.log();
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
