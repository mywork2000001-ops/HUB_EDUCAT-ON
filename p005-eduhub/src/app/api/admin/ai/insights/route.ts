import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyTeacher } from "@/lib/verify-teacher";
import { callGemini, buildAnalyticsPrompt } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  if (!(await verifyTeacher(req)))
    return NextResponse.json({ error: "Icazə yoxdur" }, { status: 401 });

  if (!process.env.GEMINI_API_KEY)
    return NextResponse.json({ error: "GEMINI_API_KEY təyin edilməyib" }, { status: 501 });

  if (!supabaseAdmin)
    return NextResponse.json({ error: "DB xətası" }, { status: 500 });

  try {
    const { data: results } = await supabaseAdmin
      .from("results")
      .select("student_name, student_class, platform, lesson_title, percent, finished_at")
      .order("finished_at", { ascending: false })
      .limit(500);

    if (!results || results.length === 0)
      return NextResponse.json({ error: "Analiz üçün məlumat yoxdur" }, { status: 400 });

    const total    = results.length;
    const avg      = Math.round(results.reduce((s, r) => s + r.percent, 0) / total);
    const passRate = Math.round(results.filter(r => r.percent >= 70).length / total * 100);
    const students = new Set(results.map(r => `${r.student_name}|||${r.student_class}`)).size;

    // Platform breakdown
    const pMap = new Map<string, number[]>();
    results.forEach(r => { (pMap.get(r.platform) ?? pMap.set(r.platform, []).get(r.platform)!).push(r.percent); });
    const platforms = [...pMap.entries()].map(([platform, pcts]) => ({
      platform, count: pcts.length, avg: Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length),
    })).sort((a, b) => b.count - a.count);

    // Class breakdown
    const cMap = new Map<string, number[]>();
    results.forEach(r => { if (r.student_class) (cMap.get(r.student_class) ?? cMap.set(r.student_class, []).get(r.student_class)!).push(r.percent); });
    const classes = [...cMap.entries()].map(([cls, pcts]) => ({
      cls, count: pcts.length, avg: Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length),
    })).sort((a, b) => a.avg - b.avg);

    // Weak topics (min 2 tests, sorted by avg asc)
    const tMap = new Map<string, number[]>();
    results.forEach(r => { if (r.lesson_title) (tMap.get(r.lesson_title) ?? tMap.set(r.lesson_title, []).get(r.lesson_title)!).push(r.percent); });
    const weakTopics = [...tMap.entries()]
      .filter(([, p]) => p.length >= 2)
      .map(([topic, pcts]) => ({ topic, count: pcts.length, avg: Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length) }))
      .sort((a, b) => a.avg - b.avg)
      .slice(0, 5);

    // At-risk students (avg < 50, min 1 test)
    const sMap = new Map<string, { cls: string; pcts: number[] }>();
    results.forEach(r => {
      const key = r.student_name;
      const e   = sMap.get(key);
      if (e) { e.pcts.push(r.percent); }
      else    sMap.set(key, { cls: r.student_class ?? "", pcts: [r.percent] });
    });
    const atRiskList = [...sMap.entries()]
      .map(([name, v]) => ({ name, cls: v.cls, tests: v.pcts.length, avg: Math.round(v.pcts.reduce((a, b) => a + b, 0) / v.pcts.length) }))
      .filter(s => s.avg < 50)
      .sort((a, b) => a.avg - b.avg)
      .slice(0, 5);

    // Last 7 days vs previous 7 days
    const now    = Date.now();
    const day7   = 7 * 24 * 3600 * 1000;
    const last7  = results.filter(r => r.finished_at && (now - new Date(r.finished_at).getTime()) < day7).length;
    const prev7  = results.filter(r => r.finished_at && (now - new Date(r.finished_at).getTime()) >= day7 && (now - new Date(r.finished_at).getTime()) < 2 * day7).length;

    const prompt  = buildAnalyticsPrompt({ total, avg, passRate, students, platforms, classes, weakTopics, atRiskList, last7, prev7 });
    const insight = await callGemini(prompt);

    return NextResponse.json(insight);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Bilinməyən xəta";
    if (msg === "NO_KEY") return NextResponse.json({ error: "GEMINI_API_KEY təyin edilməyib" }, { status: 501 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
