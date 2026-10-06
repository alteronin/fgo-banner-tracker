import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AccountProvider } from "@/contexts/AccountContext";
import { AccountButton } from "@/components/AccountButton";
import { notifyPullsChange, setPulls } from "@/lib/pullStorage";
import type { GamePull } from "@/types/pulls";

const fetchMock = vi.fn();

type FetchHandler = (init?: RequestInit) => Response | Promise<Response>;

function routeFetch(routes: Record<string, FetchHandler>) {
  fetchMock.mockImplementation(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.href
            : input.url;
      for (const [prefix, handler] of Object.entries(routes)) {
        if (url.startsWith(prefix)) return handler(init);
      }
      return Response.json({ error: `unmocked ${url}` }, { status: 500 });
    }
  );
}

function meResponse(user: unknown, configured = true) {
  return Response.json({ user, configured });
}

function makePull(id: string): GamePull {
  return {
    id,
    gameId: "genshin",
    itemId: "item-1",
    unitId: `unit-${id}`,
    name: `Pull ${id}`,
    rarity: 5,
    ts: 1_700_000_000_000,
    category: "character",
  };
}

describe("AccountProvider", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows a configuration notice instead of navigating when unconfigured", async () => {
    routeFetch({
      "/api/auth/me": () => meResponse(null, false),
    });
    render(
      <AccountProvider>
        <AccountButton />
      </AccountProvider>
    );
    const button = await screen.findByRole("button", { name: /sign in/i });
    fireEvent.click(button);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "configured yet"
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("signs in a user, pushes the first backup, and shows Synced", async () => {
    const puts: Array<Record<string, unknown>> = [];
    routeFetch({
      "/api/auth/me": () =>
        meResponse({
          sub: "g-1",
          name: "Jane Doe",
          email: "jane@example.com",
          picture: "",
        }),
      "/api/sync": (init) => {
        if (init?.method === "PUT") {
          puts.push(JSON.parse(String(init.body)) as Record<string, unknown>);
          return Response.json({ updatedAt: 1700000000000 });
        }
        return Response.json({ updatedAt: null, data: null });
      },
    });

    render(
      <AccountProvider>
        <AccountButton />
      </AccountProvider>
    );

    await screen.findByRole("button", { name: "Account menu" });
    expect(await screen.findByText("Synced")).toBeInTheDocument();
    expect(puts).toHaveLength(1);
    const first = puts[0].data as { version: number };
    expect(first.version).toBe(4);
  });

  it("pushes local edits after the debounce window", async () => {
    const puts: Array<Record<string, unknown>> = [];
    routeFetch({
      "/api/auth/me": () =>
        meResponse({
          sub: "g-1",
          name: "Jane Doe",
          email: "jane@example.com",
          picture: "",
        }),
      "/api/sync": (init) => {
        if (init?.method === "PUT") {
          puts.push(JSON.parse(String(init.body)) as Record<string, unknown>);
          return Response.json({ updatedAt: puts.length * 1000 });
        }
        return Response.json({ updatedAt: null, data: null });
      },
    });

    render(
      <AccountProvider>
        <AccountButton />
      </AccountProvider>
    );
    await screen.findByText("Synced");
    expect(puts).toHaveLength(1);

    setPulls("genshin", [makePull("p1")]);
    notifyPullsChange("genshin");

    await waitFor(
      () => {
        expect(puts).toHaveLength(2);
      },
      { timeout: 5000 }
    );
    const pushed = puts[1].data as {
      pulls: { genshin: Array<{ id: string }> };
    };
    expect(pushed.pulls.genshin.map((p) => p.id)).toEqual(["p1"]);
  });

  it("clears the session on sign out", async () => {
    routeFetch({
      "/api/auth/me": () =>
        meResponse({
          sub: "g-1",
          name: "Jane Doe",
          email: "jane@example.com",
          picture: "",
        }),
      "/api/sync": (init) =>
        init?.method === "PUT"
          ? Response.json({ updatedAt: 1 })
          : Response.json({ updatedAt: null, data: null }),
      "/api/auth/logout": () => Response.json({ ok: true }),
    });

    render(
      <AccountProvider>
        <AccountButton />
      </AccountProvider>
    );

    await screen.findByText("Synced");
    fireEvent.click(screen.getByRole("button", { name: "Account menu" }));
    fireEvent.click(screen.getByRole("menuitem"));
    await screen.findByRole("button", { name: /sign in/i });
    const logoutCall = fetchMock.mock.calls.find(
      (call) => String(call[0]) === "/api/auth/logout"
    );
    expect(logoutCall).toBeTruthy();
    expect((logoutCall as Array<RequestInit>)[1]?.method).toBe("POST");
  });
});
