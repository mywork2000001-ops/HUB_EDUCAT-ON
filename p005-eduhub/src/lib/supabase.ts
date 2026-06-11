import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Admin client for server-side data operations (API routes only)
export const supabaseAdmin = serviceKey && url
  ? createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })
  : null;

// Anon client for auth operations
export const supabaseAuth = url && anonKey
  ? createClient(url, anonKey)
  : null;
