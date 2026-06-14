import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

function enc(s: string) { return new TextEncoder().encode(s); }

async function isTeacherTokenValid(token: string): Promise<boolean> {
  const secret = process.env.SUPABASE_JWT_SECRET;
  // Missing secret means the deployment is misconfigured — deny, never accept.
  if (!secret) return false;
  try {
    const { payload } = await jwtVerify(token, enc(secret), { audience: "authenticated" });
    return !!payload;
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
  // Use exact match for /learn/login to avoid fragile startsWith with trailing slashes.
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
