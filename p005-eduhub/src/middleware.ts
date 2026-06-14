import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

function enc(s: string) { return new TextEncoder().encode(s); }

async function isTeacherTokenValid(token: string): Promise<boolean> {
  const secret = process.env.SUPABASE_JWT_SECRET;

  if (secret) {
    // Fast path: local crypto — no network call
    try {
      const { payload } = await jwtVerify(token, enc(secret), { audience: "authenticated" });
      return !!payload;
    } catch {
      return false;
    }
  }

  // Fallback: SUPABASE_JWT_SECRET not configured — verify via Supabase Admin REST API.
  // Add SUPABASE_JWT_SECRET to env vars to skip this network call on every request.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return false;
  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: serviceKey,
      },
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function isStudentTokenValid(token: string): Promise<boolean> {
  const secret = process.env.STUDENT_JWT_SECRET;
  if (!secret) return false;
  try {
    await jwtVerify(token, enc(secret));
    return true;
  } catch {
    return false;
  }
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
  if (pathname.startsWith("/learn") && pathname !== "/learn/login") {
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
