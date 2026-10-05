import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { exchangeCode, fetchProfile, getGoogleConfig } from "@/lib/server/google";
import {
  authConfigured,
  OAUTH_COOKIE,
  SESSION_COOKIE,
  sessionCookieOptions,
  signSessionToken,
} from "@/lib/server/session";
import { saveUser, syncConfigured } from "@/lib/server/store";

function failRedirect(request: NextRequest): NextResponse {
  const response = NextResponse.redirect(new URL("/?auth=error", request.url));
  response.cookies.delete(OAUTH_COOKIE);
  return response;
}

function statesMatch(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length === 0 || bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

function parseOauthCookie(raw: string): { state?: string; next?: string } {
  try {
    return JSON.parse(raw) as { state?: string; next?: string };
  } catch {
    return JSON.parse(decodeURIComponent(raw)) as {
      state?: string;
      next?: string;
    };
  }
}

export async function GET(request: NextRequest) {
  const google = getGoogleConfig();
  if (!google || !authConfigured() || !syncConfigured()) {
    const response = NextResponse.redirect(
      new URL("/?auth=not-configured", request.url)
    );
    response.cookies.delete(OAUTH_COOKIE);
    return response;
  }

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const rawCookie = request.cookies.get(OAUTH_COOKIE)?.value;
  if (!code || !state || !rawCookie) return failRedirect(request);

  let saved: { state?: string; next?: string } = {};
  try {
    saved = parseOauthCookie(rawCookie);
  } catch {
    return failRedirect(request);
  }
  if (typeof saved.state !== "string" || !statesMatch(state, saved.state)) {
    return failRedirect(request);
  }

  const nextPath = safeNext(saved.next);
  const redirectUri = `${request.nextUrl.origin}/api/auth/callback`;
  const token = await exchangeCode({ config: google, code, redirectUri });
  if (!token) return failRedirect(request);
  const profile = await fetchProfile(token);
  if (!profile) return failRedirect(request);

  try {
    await saveUser({
      sub: profile.sub,
      name: profile.name,
      email: profile.email,
      picture: profile.picture,
      updatedAt: Date.now(),
    });
  } catch {
    return failRedirect(request);
  }

  let sessionToken: string;
  try {
    sessionToken = await signSessionToken(profile.sub);
  } catch {
    return failRedirect(request);
  }

  const response = NextResponse.redirect(new URL(nextPath, request.url));
  response.cookies.set(SESSION_COOKIE, sessionToken, sessionCookieOptions());
  response.cookies.delete(OAUTH_COOKIE);
  return response;
}

function safeNext(value: string | undefined): string {
  if (
    typeof value === "string" &&
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !value.startsWith("/\\") &&
    !value.includes("\\") &&
    !/[\r\n]/.test(value)
  ) {
    return value;
  }
  return "/";
}
