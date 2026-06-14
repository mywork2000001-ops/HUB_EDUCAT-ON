import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyTeacher } from "@/lib/verify-teacher";
import { sendResultNotification } from "@/lib/notify-email";

const PROD_ORIGINS = [
  "https://ferid-hesenov.github.io",
  "https://mywork2000001-ops.github.io",
  "https://hub-educat-on.vercel.app",
];
const DEV_ORIGINS = ["http://localhost:3000", "http://localhost:3001"];
const ALLOWED_ORIGINS = process.env.NODE_ENV === "production"
  ? PROD_ORIGINS
  : [...PROD_ORIGINS, ...DEV_ORIGINS];

function corsHeaders(req: NextRequest): Record<string, string> {
  const origin = req.headers.get("origin") ?? "";
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : null;
  return {
    ...(allowed ? { "Access-Control-Allow-Origin": allowed } : {}),
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
  };
}

export async function OPTIONS(req: NextRequest) {
  const headers = corsHeaders(req);
  if (!headers["Access-Control-Allow-Origin"]) {
    return new NextResponse(null, { status: 403 });
  }
  return new NextResponse(null, { status: 204, headers });
}

// POST is called cross-origin from P001–P004 (GitHub Pages) — CORS required.
// percent is always computed server-side; the client-supplied value is ignored.
export async function POST(req: NextRequest) {
  const cors = corsHeaders(req);
  if (!supabaseAdmin)
    return NextResponse.json({ error: "Server konfiqurasiyası xətası" }, { status: 500, headers: cors });
  try {
    const body = await req.json();
    const { student_name, student_class, platform, lesson_id, lesson_title,
            score, total, answers, started_at, finished_at } = body;

    if (!student_name || !platform || score === undefined || total === undefined)
      return NextResponse.json({ error: "Məlumatlar natamamdır" }, { status: 400, headers: cors });

    const scoreNum = Number(score);
    const totalNum = Number(total);
    if (!Number.isFinite(scoreNum) || !Number.isFinite(totalNum) || totalNum <= 0)
      return NextResponse.json({ error: "Xal məlumatları yanlışdır" }, { status: 400, headers: cors });

    // Server-side percent — never trust the client value
    const percent = Math.round((scoreNum / totalNum) * 100);

    // Guard against oversized answers payload
    const answersJson = answers ?? {};
    if (JSON.stringify(answersJson).length > 64_000)
      return NextResponse.json({ error: "Cavablar həddindən böyükdür" }, { status: 400, headers: cors });

    // Validate optional date strings before touching the DB
    const parsedStarted  = started_at  ? new Date(started_at)  : null;
    const parsedFinished = finished_at ? new Date(finished_at) : null;
    if (parsedStarted  && isNaN(parsedStarted.getTime()))
      return NextResponse.json({ error: "started_at formatı yanlışdır" }, { status: 400, headers: cors });
    if (parsedFinished && isNaN(parsedFinished.getTime()))
      return NextResponse.json({ error: "finished_at formatı yanlışdır" }, { status: 400, headers: cors });

    const { data, error } = await supabaseAdmin
      .from("results")
      .insert({
        student_name,
        student_class: student_class ?? "",
        platform,
        lesson_id:    lesson_id    ?? "",
        lesson_title: lesson_title ?? "",
        score:   scoreNum,
        total:   totalNum,
        percent,
        answers: answersJson,
        started_at:  parsedStarted?.toISOString()  ?? null,
        finished_at: parsedFinished?.toISOString() ?? null,
      })
      .select("id")
      .single();

    if (error) throw error;

    void sendResultNotification({
      student_name,
      student_class: student_class ?? "",
      platform,
      lesson_title:  lesson_title ?? "",
      score: scoreNum,
      total: totalNum,
      percent,
    });

    return NextResponse.json({ ok: true, id: data.id }, { headers: cors });
  } catch {
    return NextResponse.json({ error: "Server xətası" }, { status: 500, headers: cors });
  }
}

// GET is teacher-only (same-origin dashboard) — no CORS, auth required.
export async function GET(req: NextRequest) {
  if (!(await verifyTeacher(req)))
    return NextResponse.json({ error: "Icazə yoxdur" }, { status: 401 });

  if (!supabaseAdmin)
    return NextResponse.json({ error: "Server konfiqurasiyası xətası" }, { status: 500 });
  try {
    const { searchParams } = new URL(req.url);
    const platform = searchParams.get("platform");
    const limit    = Math.min(Number(searchParams.get("limit") || 50), 200);

    let query = supabaseAdmin
      .from("results")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (platform) query = query.eq("platform", platform);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ results: data });
  } catch {
    return NextResponse.json({ error: "Server xətası" }, { status: 500 });
  }
}
