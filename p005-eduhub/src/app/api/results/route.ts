import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
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
    return NextResponse.json({ ok: true, id: data.id }, { headers: CORS });
  } catch {
    return NextResponse.json({ error: "Server xətası" }, { status: 500, headers: CORS });
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
