import { NextRequest } from "next/server";

function isTokenValid(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    const raw = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(raw));
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return false;
    if (payload.aud !== "authenticated") return false;
    return true;
  } catch {
    return false;
  }
}

export function verifyTeacher(req: NextRequest): boolean {
  const token = req.cookies.get("eduhub-token")?.value;
  return !!token && isTokenValid(token);
}
