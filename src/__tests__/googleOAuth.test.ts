// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  authorizeUrl,
  exchangeCode,
  fetchProfile,
  getGoogleConfig,
  newOAuthState,
  safeNextPath,
} from "@/lib/server/google";

describe("getGoogleConfig", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("reads credentials from env", () => {
    vi.stubEnv("GOOGLE_CLIENT_ID", "id-1");
    vi.stubEnv("GOOGLE_CLIENT_SECRET", "secret-1");
    expect(getGoogleConfig()).toEqual({ clientId: "id-1", clientSecret: "secret-1" });
  });

  it("returns null when incomplete", () => {
    vi.stubEnv("GOOGLE_CLIENT_ID", "id-1");
    vi.stubEnv("GOOGLE_CLIENT_SECRET", "");
    expect(getGoogleConfig()).toBeNull();
  });
});

describe("newOAuthState", () => {
  it("produces 64-char hex strings that differ", () => {
    const a = newOAuthState();
    const b = newOAuthState();
    expect(a).toMatch(/^[0-9a-f]{64}$/);
    expect(a).not.toBe(b);
  });
});

describe("safeNextPath", () => {
  it("accepts simple in-app paths", () => {
    expect(safeNextPath("/")).toBe("/");
    expect(safeNextPath("/hsr/pulls")).toBe("/hsr/pulls");
    expect(safeNextPath("/units?game=zzz")).toBe("/units?game=zzz");
  });

  it("rejects open redirects and junk", () => {
    expect(safeNextPath("//evil.com")).toBeNull();
    expect(safeNextPath("/\\evil.com")).toBeNull();
    expect(safeNextPath("https://evil.com")).toBeNull();
    expect(safeNextPath("javascript:alert(1)")).toBeNull();
    expect(safeNextPath("/path\\with\\backslash")).toBeNull();
    expect(safeNextPath("/path\r\nSet-Cookie: x")).toBeNull();
    expect(safeNextPath("")).toBeNull();
    expect(safeNextPath(null)).toBeNull();
    expect(safeNextPath(undefined)).toBeNull();
  });
});

describe("authorizeUrl", () => {
  it("builds the Google consent URL", () => {
    const url = new URL(
      authorizeUrl({
        config: { clientId: "cid", clientSecret: "csec" },
        redirectUri: "https://app.test/api/auth/callback",
        state: "state-123",
      })
    );
    expect(url.origin).toBe("https://accounts.google.com");
    expect(url.searchParams.get("client_id")).toBe("cid");
    expect(url.searchParams.get("redirect_uri")).toBe(
      "https://app.test/api/auth/callback"
    );
    expect(url.searchParams.get("response_type")).toBe("code");
    expect(url.searchParams.get("state")).toBe("state-123");
    expect(url.searchParams.get("scope")).toBe("openid email profile");
    expect(url.searchParams.get("prompt")).toBe("select_account");
  });
});

describe("exchangeCode", () => {
  const config = { clientId: "cid", clientSecret: "csec" };

  afterEach(() => vi.unstubAllGlobals());

  it("returns the access token on success", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ access_token: "at-1" }), { status: 200 })
    );
    vi.stubGlobal("fetch", fetchMock);
    await expect(
      exchangeCode({ config, code: "the-code", redirectUri: "https://app.test/cb" })
    ).resolves.toBe("at-1");
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://oauth2.googleapis.com/token");
    expect(String(init.body)).toContain("grant_type=authorization_code");
    expect(String(init.body)).toContain("code=the-code");
  });

  it("returns null on HTTP error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("bad", { status: 400 }))
    );
    await expect(
      exchangeCode({ config, code: "x", redirectUri: "r" })
    ).resolves.toBeNull();
  });

  it("returns null on network failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("offline"))
    );
    await expect(
      exchangeCode({ config, code: "x", redirectUri: "r" })
    ).resolves.toBeNull();
  });
});

describe("fetchProfile", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("returns a profile for a verified email", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            sub: "g-1",
            name: "Jane Doe",
            email: "jane@example.com",
            email_verified: true,
            picture: "https://lh3.googleusercontent.com/pic",
          }),
          { status: 200 }
        )
      )
    );
    await expect(fetchProfile("at-1")).resolves.toEqual({
      sub: "g-1",
      name: "Jane Doe",
      email: "jane@example.com",
      picture: "https://lh3.googleusercontent.com/pic",
    });
  });

  it("rejects unverified emails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            sub: "g-1",
            email: "jane@example.com",
            email_verified: false,
          }),
          { status: 200 }
        )
      )
    );
    await expect(fetchProfile("at-1")).resolves.toBeNull();
  });

  it("rejects a missing email", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ sub: "g-1", email_verified: true }), {
          status: 200,
        })
      )
    );
    await expect(fetchProfile("at-1")).resolves.toBeNull();
  });

  it("returns null on network failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    await expect(fetchProfile("at-1")).resolves.toBeNull();
  });
});
