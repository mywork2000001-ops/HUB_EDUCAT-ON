import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

function getSecret(): Uint8Array {
  const s = process.env.STUDENT_JWT_SECRET;
  if (!s) throw new Error("STUDENT_JWT_SECRET env var is not set");
  return new TextEncoder().encode(s);
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export type StudentPayload = {
  id:         string;
  name:       string;
  class_name: string;
  group_name: string | null;
};

export async function signStudentToken(payload: StudentPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifyStudentToken(token: string): Promise<StudentPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const p = payload as Record<string, unknown>;
    if (typeof p.id !== "string" || typeof p.name !== "string" || typeof p.class_name !== "string") {
      return null;
    }
    return {
      id:         p.id,
      name:       p.name,
      class_name: p.class_name,
      group_name: typeof p.group_name === "string" ? p.group_name : null,
    };
  } catch {
    return null;
  }
}
