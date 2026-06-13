import { NextRequest } from "next/server";
import { supabaseAdmin } from "./supabase";

export async function verifyTeacher(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get("eduhub-token")?.value;
  if (!token) return false;

  // Fast structural check before making a network call
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    const raw = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(raw));
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return false;
    if (payload.aud !== "authenticated") return false;
  } catch {
    return false;
  }

  // Cryptographic verification via Supabase Admin (validates signature)
  if (!supabaseAdmin) return false;
  try {
    const { error } = await supabaseAdmin.auth.getUser(token);
    return !error;
  } catch {
    return false;
  }
}
