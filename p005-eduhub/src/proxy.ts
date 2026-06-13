import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

function getEncoder(secret: string) {
  return new TextEncoder().encode(secret);
}

async function isTeacherTokenValid(token: string): Promise<boolean> {
  // Structural pre-check (cheap, no crypto)
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    const raw     = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(raw));
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return false;
    if (payload.aud !== "authenticated") return false;
  } catch { return false; }

  // Cryptographic signature check (requires SUPABASE_JWT_SECRET in env)
  const secret = process.env.SUPABASE_JWT_SECRET;
  if (secret) {
    try {
      await jwtVerify(token, getEncoder(secret));
      return true;
    } catch { return false; }
  }

  // Fallback: structural check only (set SUPABASE_JWT_SECRET for full security)
  return true;
}

async function isStudentTokenValid(token: string): Promise<boolean> {
  const secret = process.env.STUDENT_JWT_SECRET;
  if (!secret) return false;
  try {
    await jwtVerify(token, getEncoder(secret));
    return true;
  } catch { return false; }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── Teacher routes ──────────────────────────────────────────
  if (pathname.startsWith("/dashboard")) {
    const token = req.cookies.get("eduhub-token")?.value;
    if (!token || !(await isTeacherTokenValid(token))) {
      const url = req.nextUrl.clone();
      url.pathname = "/auth/login";
      const response = NextResponse.redirect(url);
      if (token) response.cookies.delete("eduhub-token");
      return response;
    }
  }

  // ── Student routes ──────────────────────────────────────────
  if (pathname.startsWith("/learn") && !pathname.startsWith("/learn/login")) {
    const token = req.cookies.get("eduhub-student-token")?.value;
    if (!token || !(await isStudentTokenValid(token))) {
      const url = req.nextUrl.clone();
      url.pathname = "/learn/login";
      const response = NextResponse.redirect(url);
      if (token) response.cookies.delete("eduhub-student-token");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = { matcher: ["/dashboard/:path*", "/learn/:path*"] };
