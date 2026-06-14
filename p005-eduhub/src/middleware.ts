import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

function enc(s: string) { return new TextEncoder().encode(s); }

async function isTeacherTokenValid(token: string): Promise<boolean> {
  // Structural pre-check (no crypto, no network)
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    const raw     = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(raw));
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return false;
    if (payload.aud !== "authenticated") return false;
  } catch { return false; }

  // If SUPABASE_JWT_SECRET is configured, verify signature; otherwise accept structural check.
  // Data-level security is enforced separately via verifyTeacher() in every API route.
  const secret = process.env.SUPABASE_JWT_SECRET;
  if (!secret) return true;
  try {
    await jwtVerify(token, enc(secret));
    return true;
  } catch { return false; }
}

async function isStudentTokenValid(token: string): Promise<boolean> {
  const secret = process.env.STUDENT_JWT_SECRET;
  if (!secret) return false;
  try {
    await jwtVerify(token, enc(secret));
    return true;
  } catch { return false; }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── Teacher routes ──────────────────────────────────────────────
  if (pathname.startsWith("/dashboard")) {
    const token = req.cookies.get("eduhub-token")?.value;
    if (!token || !(await isTeacherTokenValid(token))) {
      const url = req.nextUrl.clone();
      url.pathname = "/auth/login";
      const res = NextResponse.redirect(url);
      if (token) res.cookies.delete("eduhub-token");
      return res;
    }
  }

  // ── Student routes ──────────────────────────────────────────────
  if (pathname.startsWith("/learn") && !pathname.startsWith("/learn/login")) {
    const token = req.cookies.get("eduhub-student-token")?.value;
    if (!token || !(await isStudentTokenValid(token))) {
      const url = req.nextUrl.clone();
      url.pathname = "/learn/login";
      const res = NextResponse.redirect(url);
      if (token) res.cookies.delete("eduhub-student-token");
      return res;
    }
  }

  return NextResponse.next();
}

export const config = { matcher: ["/dashboard/:path*", "/learn/:path*"] };
