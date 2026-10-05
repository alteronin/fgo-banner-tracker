import { NextRequest, NextResponse } from "next/server";
import { authorizeUrl, getGoogleConfig, newOAuthState, safeNextPath } from "@/lib/server/google";
import { authConfigured, OAUTH_COOKIE } from "@/lib/server/session";
import { syncConfigured } from "@/lib/server/store";

export async function GET(request: NextRequest) {
  const google = getGoogleConfig();
  if (!google || !authConfigured() || !syncConfigured()) {
    return NextResponse.redirect(new URL("/?auth=not-configured", request.url));
  }
  const state = newOAuthState();
  const next = safeNextPath(request.nextUrl.searchParams.get("next")) || "/";
  const redirectUri = `${request.nextUrl.origin}/api/auth/callback`;
  const url = new URL(authorizeUrl({ config: google, redirectUri, state }));
  const response = NextResponse.redirect(url);
  response.cookies.set(
    OAUTH_COOKIE,
    JSON.stringify({ state, next }),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 600,
    }
  );
  return response;
}
