// @vitest-environment node
import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const jar = vi.hoisted(() => {
  const store = new Map<string, string>();
  return {
    store,
    reset() {
      store.clear();
    },
  };
});

const storeMock = vi.hoisted(() => ({
  syncConfigured: vi.fn((): boolean => true),
  saveUser: vi.fn(async (): Promise<void> => {}),
  loadUser: vi.fn(async (): Promise<unknown> => null),
  loadSync: vi.fn(async (): Promise<unknown> => null),
  saveSync: vi.fn(async (): Promise<number> => 1700000000000),
}));

const googleMock = vi.hoisted(() => ({
  exchangeCode: vi.fn(async (): Promise<string | null> => "access-token"),
  fetchProfile: vi.fn(async (): Promise<unknown> => ({
    sub: "g-1",
    name: "Jane Doe",
    email: "jane@example.com",
    picture: "",
  })),
}));

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) =>
      jar.store.has(name)
        ? { name, value: jar.store.get(name) as string }
        : undefined,
    set: (name: string, value: string) => {
      jar.store.set(name, value);
    },
    delete: (name: string) => {
      jar.store.delete(name);
    },
  }),
}));

vi.mock("@/lib/server/store", () => storeMock);

vi.mock("@/lib/server/google", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/lib/server/google")>();
  return { ...actual, ...googleMock };
});

import { GET as callbackGET } from "@/app/api/auth/callback/route";
import { GET as loginGET } from "@/app/api/auth/login/route";
import { POST as logoutPOST } from "@/app/api/auth/logout/route";
import { GET as meGET } from "@/app/api/auth/me/route";
import { GET as syncGET, PUT as syncPUT } from "@/app/api/sync/route";
import { readSession, SESSION_COOKIE, signSessionToken } from "@/lib/server/session";

function extractCookie(response: Response, name: string): string | null {
  const header = response.headers.get("set-cookie");
  if (!header) return null;
  const marker = `${name}=`;
  const index = header.indexOf(marker);
  if (index === -1) return null;
  const start = index + marker.length;
  const end = header.indexOf(";", start);
  return end === -1 ? header.slice(start) : header.slice(start, end);
}

function oauthCookie(value: { state: string; next?: string }): string {
  return `fbtn-oauth=${encodeURIComponent(JSON.stringify(value))}`;
}

function parseOauthCookie(raw: string): { state: string; next?: string } {
  try {
    return JSON.parse(raw) as { state: string; next?: string };
  } catch {
    return JSON.parse(decodeURIComponent(raw)) as {
      state: string;
      next?: string;
    };
  }
}

const VALID_BACKUP = { version: 3, unitStatus: {}, faves: {}, pulls: {} };

beforeEach(() => {
  jar.reset();
  vi.stubEnv("SESSION_SECRET", "test-secret-value-for-unit-tests");
  vi.stubEnv("GOOGLE_CLIENT_ID", "cid");
  vi.stubEnv("GOOGLE_CLIENT_SECRET", "csec");
  storeMock.syncConfigured.mockReturnValue(true);
  storeMock.saveUser.mockReset().mockResolvedValue(undefined);
  storeMock.loadUser.mockReset().mockResolvedValue(null);
  storeMock.loadSync.mockReset().mockResolvedValue(null);
  storeMock.saveSync.mockReset().mockResolvedValue(1700000000000);
  googleMock.exchangeCode.mockReset().mockResolvedValue("access-token");
  googleMock.fetchProfile.mockReset().mockResolvedValue({
    sub: "g-1",
    name: "Jane Doe",
    email: "jane@example.com",
    picture: "",
  });
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("GET /api/auth/login", () => {
  it("redirects to Google with a state cookie", async () => {
    const response = await loginGET(
      new NextRequest("https://app.test/api/auth/login?next=/hsr/pulls")
    );
    expect(response.status).toBe(307);
    const location = new URL(response.headers.get("location") as string);
    expect(location.origin + location.pathname).toBe(
      "https://accounts.google.com/o/oauth2/v2/auth"
    );
    expect(location.searchParams.get("client_id")).toBe("cid");
    const raw = extractCookie(response, "fbtn-oauth");
    expect(raw).toBeTruthy();
    const saved = parseOauthCookie(raw as string);
    expect(saved.next).toBe("/hsr/pulls");
    expect(saved.state).toMatch(/^[0-9a-f]{64}$/);
    expect(location.searchParams.get("state")).toBe(saved.state);
  });

  it("falls back to / for unsafe next values", async () => {
    const response = await loginGET(
      new NextRequest("https://app.test/api/auth/login?next=//evil.com")
    );
    const raw = extractCookie(response, "fbtn-oauth") as string;
    const saved = parseOauthCookie(raw);
    expect(saved.next).toBe("/");
  });

  it("redirects to not-configured when Google env is missing", async () => {
    vi.stubEnv("GOOGLE_CLIENT_ID", "");
    const response = await loginGET(
      new NextRequest("https://app.test/api/auth/login")
    );
    expect(response.headers.get("location")).toBe(
      "https://app.test/?auth=not-configured"
    );
  });
});

describe("GET /api/auth/callback", () => {
  it("exchanges the code, stores the profile, and sets the session", async () => {
    const state = "a".repeat(64);
    const response = await callbackGET(
      new NextRequest(
        `https://app.test/api/auth/callback?code=code-1&state=${state}`,
        { headers: { cookie: oauthCookie({ state, next: "/hsr/pulls" }) } }
      )
    );
    expect(response.headers.get("location")).toBe("https://app.test/hsr/pulls");
    expect(extractCookie(response, "fbtn-session")).toBeTruthy();
    expect(extractCookie(response, "fbtn-oauth")).toBe("");
    expect(googleMock.exchangeCode).toHaveBeenCalledWith({
      config: { clientId: "cid", clientSecret: "csec" },
      code: "code-1",
      redirectUri: "https://app.test/api/auth/callback",
    });
    expect(storeMock.saveUser).toHaveBeenCalledWith(
      expect.objectContaining({ sub: "g-1", email: "jane@example.com" })
    );
    jar.store.set(
      SESSION_COOKIE,
      extractCookie(response, "fbtn-session") as string
    );
    await expect(readSession()).resolves.toEqual({ sub: "g-1" });
  });

  it("rejects a state mismatch", async () => {
    const response = await callbackGET(
      new NextRequest(
        `https://app.test/api/auth/callback?code=code-1&state=${"b".repeat(64)}`,
        { headers: { cookie: oauthCookie({ state: "a".repeat(64) }) } }
      )
    );
    expect(response.headers.get("location")).toBe(
      "https://app.test/?auth=error"
    );
    expect(googleMock.exchangeCode).not.toHaveBeenCalled();
  });

  it("rejects a missing oauth cookie", async () => {
    const state = "a".repeat(64);
    const response = await callbackGET(
      new NextRequest(
        `https://app.test/api/auth/callback?code=code-1&state=${state}`
      )
    );
    expect(response.headers.get("location")).toBe(
      "https://app.test/?auth=error"
    );
  });

  it("never redirects off-site even with a tampered cookie next", async () => {
    const state = "a".repeat(64);
    const response = await callbackGET(
      new NextRequest(
        `https://app.test/api/auth/callback?code=code-1&state=${state}`,
        { headers: { cookie: oauthCookie({ state, next: "//evil.com" }) } }
      )
    );
    expect(response.headers.get("location")).toBe("https://app.test/");
  });

  it("fails when the code exchange fails", async () => {
    googleMock.exchangeCode.mockResolvedValueOnce(null);
    const state = "a".repeat(64);
    const response = await callbackGET(
      new NextRequest(
        `https://app.test/api/auth/callback?code=bad&state=${state}`,
        { headers: { cookie: oauthCookie({ state }) } }
      )
    );
    expect(response.headers.get("location")).toBe(
      "https://app.test/?auth=error"
    );
  });

  it("fails when the profile is rejected", async () => {
    googleMock.fetchProfile.mockResolvedValueOnce(null);
    const state = "a".repeat(64);
    const response = await callbackGET(
      new NextRequest(
        `https://app.test/api/auth/callback?code=code-1&state=${state}`,
        { headers: { cookie: oauthCookie({ state }) } }
      )
    );
    expect(response.headers.get("location")).toBe(
      "https://app.test/?auth=error"
    );
  });
});

describe("POST /api/auth/logout", () => {
  it("clears the session cookie", async () => {
    const response = await logoutPOST();
    expect(response.status).toBe(200);
    expect(extractCookie(response, "fbtn-session")).toBe("");
  });
});

describe("GET /api/auth/me", () => {
  it("returns the profile for a valid session", async () => {
    jar.store.set(SESSION_COOKIE, await signSessionToken("g-1"));
    storeMock.loadUser.mockResolvedValueOnce({
      sub: "g-1",
      name: "Jane Doe",
      email: "jane@example.com",
      picture: "pic",
      updatedAt: 1,
    });
    const response = await meGET();
    expect(await response.json()).toEqual({
      user: {
        sub: "g-1",
        name: "Jane Doe",
        email: "jane@example.com",
        picture: "pic",
      },
      configured: true,
    });
  });

  it("returns null user without a session", async () => {
    const response = await meGET();
    expect(await response.json()).toEqual({ user: null, configured: true });
  });

  it("reports unconfigured when Google env is missing", async () => {
    vi.stubEnv("GOOGLE_CLIENT_ID", "");
    jar.store.set(SESSION_COOKIE, await signSessionToken("g-1"));
    const response = await meGET();
    expect(await response.json()).toEqual({ user: null, configured: false });
  });
});

describe("/api/sync", () => {
  async function signIn() {
    jar.store.set(SESSION_COOKIE, await signSessionToken("g-1"));
  }

  it("GET returns null when nothing is stored", async () => {
    await signIn();
    const response = await syncGET();
    expect(await response.json()).toEqual({ updatedAt: null, data: null });
  });

  it("GET echoes stored data", async () => {
    await signIn();
    storeMock.loadSync.mockResolvedValueOnce({
      updatedAt: 55,
      data: VALID_BACKUP,
    });
    const response = await syncGET();
    expect(await response.json()).toEqual({ updatedAt: 55, data: VALID_BACKUP });
  });

  it("GET returns 401 without a session", async () => {
    const response = await syncGET();
    expect(response.status).toBe(401);
  });

  it("GET returns 503 when not configured", async () => {
    await signIn();
    storeMock.syncConfigured.mockReturnValue(false);
    const response = await syncGET();
    expect(response.status).toBe(503);
  });

  it("GET returns 502 when the store fails", async () => {
    await signIn();
    storeMock.loadSync.mockRejectedValueOnce(new Error("down"));
    const response = await syncGET();
    expect(response.status).toBe(502);
  });

  it("PUT stores a valid backup", async () => {
    await signIn();
    const response = await syncPUT(
      new NextRequest("https://app.test/api/sync", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ data: VALID_BACKUP }),
      })
    );
    expect(await response.json()).toEqual({ updatedAt: 1700000000000 });
    expect(storeMock.saveSync).toHaveBeenCalledWith("g-1", VALID_BACKUP);
  });

  it("PUT returns 401 without a session", async () => {
    const response = await syncPUT(
      new NextRequest("https://app.test/api/sync", {
        method: "PUT",
        body: JSON.stringify({ data: VALID_BACKUP }),
      })
    );
    expect(response.status).toBe(401);
  });

  it("PUT rejects malformed JSON", async () => {
    await signIn();
    const response = await syncPUT(
      new NextRequest("https://app.test/api/sync", {
        method: "PUT",
        body: "not-json{",
      })
    );
    expect(response.status).toBe(400);
  });

  it("PUT rejects a non-v3 payload", async () => {
    await signIn();
    const response = await syncPUT(
      new NextRequest("https://app.test/api/sync", {
        method: "PUT",
        body: JSON.stringify({
          data: { version: 2, unitStatus: {}, faves: {} },
        }),
      })
    );
    expect(response.status).toBe(400);
    expect(storeMock.saveSync).not.toHaveBeenCalled();
  });

  it("PUT returns 502 when the store fails", async () => {
    await signIn();
    storeMock.saveSync.mockRejectedValueOnce(new Error("down"));
    const response = await syncPUT(
      new NextRequest("https://app.test/api/sync", {
        method: "PUT",
        body: JSON.stringify({ data: VALID_BACKUP }),
      })
    );
    expect(response.status).toBe(502);
  });

  it("PUT returns 503 when not configured", async () => {
    await signIn();
    storeMock.syncConfigured.mockReturnValue(false);
    const response = await syncPUT(
      new NextRequest("https://app.test/api/sync", {
        method: "PUT",
        body: JSON.stringify({ data: VALID_BACKUP }),
      })
    );
    expect(response.status).toBe(503);
  });
});
