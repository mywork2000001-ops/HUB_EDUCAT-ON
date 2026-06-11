import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabase = createClient(url, anonKey);

// Server-side only (API routes)
export const supabaseAdmin = serviceKey
  ? createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })
  : null;

export type Database = {
  results: {
    id: string;
    student_name: string;
    student_class: string;
    platform: string;
    lesson_id: string;
    lesson_title: string;
    score: number;
    total: number;
    percent: number;
    answers: Record<string, number>;
    started_at: string;
    finished_at: string;
    created_at: string;
  };
};
