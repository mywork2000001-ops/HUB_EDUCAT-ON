import { NextRequest, NextResponse } from "next/server";
import { jwtVerify, createRemoteJWKSet, decodeJwt } from "jose";

function enc(s: string) { return new TextEncoder().encode(s); }

// JWKS set is cached per Edge worker instance — fetched once on first request,
// refreshed automatically when Supabase rotates keys (unknown kid triggers re-fetch).
let _jwks: ReturnType<typeof createRemoteJWKSet> | null = null;
function getJWKS(supabaseUrl: string) {
  if (!_jwks) {
    _jwks = createRemoteJWKSet(
      new URL(`${supabaseUrl}/auth/v1/.well-known/jwks.json`),
    );
  }
  return _jwks;
}

async function isTeacherTokenValid(token: string): Promise<boolean> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  // Legacy path: HS256 shared secret (only works for tokens signed before key rotation)
  const secret = process.env.SUPABASE_JWT_SECRET;
  if (secret) {
    try {
      await jwtVerify(token, enc(secret), { audience: "authenticated" });
      return true;
    } catch { /* new ECC token — fall through to JWKS */ }
  }

  // Primary path: ECC (P-256) via JWKS — keys cached in-process, no per-request network call
  if (supabaseUrl) {
    try {
      await jwtVerify(token, getJWKS(supabaseUrl), { audience: "authenticated" });
      return true;
    } catch { return false; }
  }

  return false;
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
    // Extract role from JWT payload and propagate as a client-readable cookie
    try {
      const payload = decodeJwt(token);
      const meta = payload.user_metadata as Record<string, string> | undefined;
      const role = meta?.role ?? "teacher";
      const res = NextResponse.next();
      res.cookies.set("eduhub-teacher-role", role, {
        httpOnly: false,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
      return res;
    } catch {
      return NextResponse.next();
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
