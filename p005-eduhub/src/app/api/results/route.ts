import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const ALLOWED_ORIGINS = [
  "https://ferid-hesenov.github.io",
  "https://hub-educat-on.vercel.app",
  "http://localhost:3000",
  "http://localhost:3001",
];

function corsHeaders(req: NextRequest) {
  const origin = req.headers.get("origin") ?? "";
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[1];
  return {
    "Access-Control-Allow-Origin":  allowed,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
  };
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req) });
}

function noAdmin() {
  return NextResponse.json({ error: "Server konfiqurasiyası xətası" }, { status: 500 });
}

export async function POST(req: NextRequest) {
  if (!supabaseAdmin) return noAdmin();
  try {
    const { student_name, student_class, platform, lesson_id, lesson_title,
            score, total, percent, answers, started_at, finished_at } = await req.json();

    if (!student_name || !platform || score === undefined || total === undefined) {
      return NextResponse.json({ error: "Məlumatlar natamamdır" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("results")
      .insert({
        student_name,
        student_class: student_class ?? "",
        platform,
        lesson_id: lesson_id ?? "",
        lesson_title: lesson_title ?? "",
        score: Number(score),
        total: Number(total),
        percent: Number(percent),
        answers: answers ?? {},
        started_at,
        finished_at,
      })
      .select("id")
      .single();

    if (error) throw error;
    return NextResponse.json({ ok: true, id: data.id }, { headers: corsHeaders(req) });
  } catch {
    return NextResponse.json({ error: "Server xətası" }, { status: 500, headers: corsHeaders(req) });
  }
}

export async function GET(req: NextRequest) {
  if (!supabaseAdmin) return noAdmin();
  try {
    const { searchParams } = new URL(req.url);
    const platform = searchParams.get("platform");
    const limit = Math.min(Number(searchParams.get("limit") || 50), 200);

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
