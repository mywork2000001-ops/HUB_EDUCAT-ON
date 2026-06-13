import { NextRequest, NextResponse } from "next/server";

function isTeacherTokenValid(token: string): boolean {
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

function isStudentTokenValid(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    const raw = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(raw));
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return false;
    // Student tokens have "id" field (cuid), not "aud"
    if (!payload.id || !payload.class_name) return false;
    return true;
  } catch {
    return false;
  }
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── Teacher routes ──────────────────────────────────────────
  if (pathname.startsWith("/dashboard")) {
    const token = req.cookies.get("eduhub-token")?.value;
    if (!token || !isTeacherTokenValid(token)) {
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
    if (!token || !isStudentTokenValid(token)) {
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
