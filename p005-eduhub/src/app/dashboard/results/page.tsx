import { supabaseAdmin } from "@/lib/supabase";
import { ResultsClient } from "./ResultsClient";
import type { ResultRow } from "./ResultsClient";

export const revalidate = 60;

export default async function ResultsPage() {
  let results: ResultRow[] = [];

  if (supabaseAdmin) {
    const { data } = await supabaseAdmin
      .from("results")
      .select("id, student_name, student_class, platform, lesson_title, score, total, percent, finished_at")
      .order("finished_at", { ascending: false })
      .limit(500);
    results = (data ?? []) as ResultRow[];
  }

  return <ResultsClient results={results} />;
}
