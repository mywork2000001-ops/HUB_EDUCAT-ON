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
    return payload as unknown as StudentPayload;
  } catch {
    return null;
  }
}
