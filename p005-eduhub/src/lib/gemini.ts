// Gemini 2.0 Flash via REST API (no SDK dependency)
const MODEL = "gemini-2.0-flash";
const BASE  = "https://generativelanguage.googleapis.com/v1beta/models";

export type GeminiInsight = {
  summary:         string;
  strengths:       string[];
  weaknesses:      string[];
  atRisk:          { student: string; avg: number; reason: string }[];
  recommendations: string[];
  topicFocus:      string[];
  weeklyVerdict:   string;
};

export async function callGemini(prompt: string): Promise<GeminiInsight> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("NO_KEY");

  const res = await fetch(`${BASE}/${MODEL}:generateContent?key=${key}`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.4,
        maxOutputTokens: 1500,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${err.slice(0, 200)}`);
  }

  const json = await res.json();
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
  return JSON.parse(text) as GeminiInsight;
}

export function buildAnalyticsPrompt(stats: {
  total:       number;
  avg:         number;
  passRate:    number;
  students:    number;
  platforms:   { platform: string; count: number; avg: number }[];
  classes:     { cls: string; count: number; avg: number }[];
  weakTopics:  { topic: string; avg: number; count: number }[];
  atRiskList:  { name: string; cls: string; avg: number; tests: number }[];
  last7:       number;
  prev7:       number;
}): string {
  return `Sən EduHub məktəb platformasının analitika süni intellektsən.
Aşağıdakı test nəticələri məlumatlarını təhlil et (Azərbaycan məktəbi, 5–6-cı siniflər, riyaziyyat).

=== MƏLUMATLAR ===
Ümumi nəticə: ${stats.total}
Unikal şagird: ${stats.students}
Orta bal: ${stats.avg}%
Keçmə faizi (≥70%): ${stats.passRate}%
Son 7 gün: ${stats.last7} test (əvvəlki 7 gün: ${stats.prev7})

Platforma üzrə:
${stats.platforms.map(p => `- ${p.platform}: ${p.count} test, orta ${p.avg}%`).join("\n")}

Sinif üzrə:
${stats.classes.length ? stats.classes.map(c => `- ${c.cls}: ${c.count} test, orta ${c.avg}%`).join("\n") : "- Məlumat yoxdur"}

Ən zəif mövzular (orta bal ən az):
${stats.weakTopics.length ? stats.weakTopics.map(t => `- "${t.topic}": ${t.count} test, orta ${t.avg}%`).join("\n") : "- Məlumat yoxdur"}

Risk qrupu şagirdlər (orta bal < 50%):
${stats.atRiskList.length ? stats.atRiskList.map(s => `- ${s.name} (${s.cls}): ${s.tests} test, orta ${s.avg}%`).join("\n") : "- Yoxdur"}

=== TAPŞIRIQ ===
JSON formatında cavab ver. Bütün mətnlər Azərbaycan dilində olsun. Konkret, faydalı məsləhətlər ver.

{
  "summary": "2-3 cümlədən ibarət ümumi qiymətləndirmə",
  "strengths": ["güclü tərəf 1", "güclü tərəf 2"],
  "weaknesses": ["zəif tərəf 1", "zəif tərəf 2"],
  "atRisk": [{"student": "ad", "avg": 35, "reason": "səbəb"}],
  "recommendations": ["fəaliyyət 1", "fəaliyyət 2", "fəaliyyət 3"],
  "topicFocus": ["mövzu 1", "mövzu 2"],
  "weeklyVerdict": "bu həftəki qısa qiymətləndirmə"
}`;
}
