import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "fbtn-session";
export const OAUTH_COOKIE = "fbtn-oauth";

const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export interface SessionPayload {
  sub: string;
}

function sessionSecret(): Uint8Array | null {
  const secret = process.env.SESSION_SECRET;
  if (!secret) return null;
  return new TextEncoder().encode(secret);
}

export function sessionConfigured(): boolean {
  return Boolean(process.env.SESSION_SECRET);
}

export function authConfigured(): boolean {
  return Boolean(
    process.env.SESSION_SECRET &&
      process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET
  );
}

export async function signSessionToken(sub: string): Promise<string> {
  const secret = sessionSecret();
  if (!secret) throw new Error("SESSION_SECRET is not set");
  return new SignJWT({ sub })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
}

export function sessionCookieOptions(): {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax";
  path: string;
  maxAge: number;
} {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  };
}

export async function readSession(): Promise<SessionPayload | null> {
  const secret = sessionSecret();
  if (!secret) return null;
  let token: string | undefined;
  try {
    token = (await cookies()).get(SESSION_COOKIE)?.value;
  } catch {
    return null;
  }
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });
    if (typeof payload.sub !== "string" || !payload.sub) return null;
    return { sub: payload.sub };
  } catch {
    return null;
  }
}
