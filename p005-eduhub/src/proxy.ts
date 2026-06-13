import { NextRequest, NextResponse } from "next/server";

function isTokenValid(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;

    // Base64url → base64 → decode
    const raw = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(raw));

    // Must not be expired
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return false;

    // Must be a Supabase authenticated session token
    if (payload.aud !== "authenticated") return false;

    return true;
  } catch {
    return false;
  }
}

export function proxy(req: NextRequest) {
  const token = req.cookies.get("eduhub-token")?.value;

  if (!token || !isTokenValid(token)) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/login";
    const response = NextResponse.redirect(url);
    // Clear invalid/expired cookie
    if (token) response.cookies.delete("eduhub-token");
    return response;
  }

  return NextResponse.next();
}

export const config = { matcher: ["/dashboard/:path*"] };
