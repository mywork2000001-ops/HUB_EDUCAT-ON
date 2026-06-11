import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { student_name, student_class, platform, lesson_id, lesson_title,
            score, total, percent, answers, started_at, finished_at } = body;

    if (!student_name || !platform || score === undefined || total === undefined) {
      return NextResponse.json({ error: "Məlumatlar natamamdır" }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Server konfiqurasiyası xətası" }, { status: 500 });
    }

    const { data, error } = await supabaseAdmin
      .from("results")
      .insert({
        student_name,
        student_class: student_class || "",
        platform,
        lesson_id: lesson_id || "",
        lesson_title: lesson_title || "",
        score: Number(score),
        total: Number(total),
        percent: Number(percent),
        answers: answers || {},
        started_at,
        finished_at,
      })
      .select("id")
      .single();

    if (error) throw error;

    return NextResponse.json({ ok: true, id: data.id });
  } catch (err) {
    console.error("Results API error:", err);
    return NextResponse.json({ error: "Server xətası" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const platform = searchParams.get("platform");
    const limit = Number(searchParams.get("limit") || 50);

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Server konfiqurasiyası xətası" }, { status: 500 });
    }

    let query = supabaseAdmin
      .from("results")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (platform) query = query.eq("platform", platform);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ results: data });
  } catch (err) {
    console.error("Results GET error:", err);
    return NextResponse.json({ error: "Server xətası" }, { status: 500 });
  }
}
