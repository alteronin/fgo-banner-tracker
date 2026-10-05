// @vitest-environment node
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

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) =>
      store.has(name) ? { name, value: store.get(name) as string } : undefined,
    set: (name: string, value: string) => {
      store.set(name, value);
    },
    delete: (name: string) => {
      store.delete(name);
    },
  }),
}));

const store = jar.store;

import {
  authConfigured,
  readSession,
  sessionConfigured,
  signSessionToken,
  SESSION_COOKIE,
} from "@/lib/server/session";

describe("server session", () => {
  beforeEach(() => {
    jar.reset();
    vi.stubEnv("SESSION_SECRET", "test-secret-value-for-unit-tests");
    vi.stubEnv("GOOGLE_CLIENT_ID", "client-id");
    vi.stubEnv("GOOGLE_CLIENT_SECRET", "client-secret");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("roundtrips a signed session token", async () => {
    const token = await signSessionToken("user-123");
    store.set(SESSION_COOKIE, token);
    await expect(readSession()).resolves.toEqual({ sub: "user-123" });
  });

  it("rejects a tampered token", async () => {
    const token = await signSessionToken("user-123");
    const tampered = `${token.slice(0, -3)}aaa`;
    store.set(SESSION_COOKIE, tampered);
    await expect(readSession()).resolves.toBeNull();
  });

  it("rejects a token signed with a different secret", async () => {
    const token = await signSessionToken("user-123");
    vi.stubEnv("SESSION_SECRET", "rotated-secret-value-for-unit-tests");
    store.set(SESSION_COOKIE, token);
    await expect(readSession()).resolves.toBeNull();
  });

  it("returns null when no cookie or secret is present", async () => {
    await expect(readSession()).resolves.toBeNull();
    const token = await signSessionToken("user-123");
    store.set(SESSION_COOKIE, token);
    vi.stubEnv("SESSION_SECRET", "");
    await expect(readSession()).resolves.toBeNull();
    expect(sessionConfigured()).toBe(false);
  });

  it("throws when signing without a secret", async () => {
    vi.stubEnv("SESSION_SECRET", "");
    await expect(signSessionToken("user-123")).rejects.toThrow();
  });

  it("reports auth configuration", () => {
    expect(authConfigured()).toBe(true);
    vi.stubEnv("GOOGLE_CLIENT_ID", "");
    expect(authConfigured()).toBe(false);
  });
});
