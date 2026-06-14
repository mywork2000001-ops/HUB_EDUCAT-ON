import { NextRequest } from "next/server";
import { jwtVerify, createRemoteJWKSet } from "jose";

function enc(s: string) { return new TextEncoder().encode(s); }

// JWKS cache (one instance per server process — same pattern as middleware.ts)
let _jwks: ReturnType<typeof createRemoteJWKSet> | null = null;
function getJWKS(supabaseUrl: string) {
  if (!_jwks) {
    _jwks = createRemoteJWKSet(
      new URL(`${supabaseUrl}/auth/v1/.well-known/jwks.json`),
    );
  }
  return _jwks;
}

export async function verifyTeacher(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get("eduhub-token")?.value;
  if (!token) return false;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  // Legacy path: HS256 shared secret (pre-rotation tokens)
  const secret = process.env.SUPABASE_JWT_SECRET;
  if (secret) {
    try {
      await jwtVerify(token, enc(secret), { audience: "authenticated" });
      return true;
    } catch { /* ECC token — fall through to JWKS */ }
  }

  // Primary path: ECC (P-256) via JWKS
  if (supabaseUrl) {
    try {
      await jwtVerify(token, getJWKS(supabaseUrl), { audience: "authenticated" });
      return true;
    } catch { return false; }
  }

  return false;
}
