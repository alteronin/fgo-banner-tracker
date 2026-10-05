const AUTHORIZE_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const USERINFO_ENDPOINT = "https://openidconnect.googleapis.com/v1/userinfo";
const SCOPE = "openid email profile";

export interface GoogleConfig {
  clientId: string;
  clientSecret: string;
}

export interface GoogleProfile {
  sub: string;
  name: string;
  email: string;
  picture: string;
}

export function getGoogleConfig(): GoogleConfig | null {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;
  return { clientId, clientSecret };
}

export function newOAuthState(): string {
  const bytes = new Uint8Array(32);
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function safeNextPath(value: string | null | undefined): string | null {
  if (!value) return null;
  if (!value.startsWith("/")) return null;
  if (value.startsWith("//") || value.startsWith("/\\")) return null;
  if (value.includes("\\")) return null;
  if (/[\r\n]/.test(value)) return null;
  return value;
}

export function authorizeUrl(params: {
  config: GoogleConfig;
  redirectUri: string;
  state: string;
}): string {
  const url = new URL(AUTHORIZE_ENDPOINT);
  url.searchParams.set("client_id", params.config.clientId);
  url.searchParams.set("redirect_uri", params.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", SCOPE);
  url.searchParams.set("state", params.state);
  url.searchParams.set("prompt", "select_account");
  return url.toString();
}

export async function exchangeCode(params: {
  config: GoogleConfig;
  code: string;
  redirectUri: string;
}): Promise<string | null> {
  try {
    const res = await fetch(TOKEN_ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code: params.code,
        client_id: params.config.clientId,
        client_secret: params.config.clientSecret,
        redirect_uri: params.redirectUri,
        grant_type: "authorization_code",
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { access_token?: unknown };
    return typeof json.access_token === "string" ? json.access_token : null;
  } catch {
    return null;
  }
}

export async function fetchProfile(
  accessToken: string
): Promise<GoogleProfile | null> {
  try {
    const res = await fetch(USERINFO_ENDPOINT, {
      headers: { authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as Record<string, unknown>;
    if (
      typeof json.sub !== "string" ||
      !json.sub ||
      typeof json.email !== "string" ||
      !json.email ||
      json.email_verified !== true
    ) {
      return null;
    }
    return {
      sub: json.sub,
      name: typeof json.name === "string" ? json.name : json.email,
      email: json.email,
      picture: typeof json.picture === "string" ? json.picture : "",
    };
  } catch {
    return null;
  }
}
