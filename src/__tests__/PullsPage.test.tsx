import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  cleanup,
  waitFor,
} from "@testing-library/react";
import { PullsPage } from "@/components/PullsPage";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { toBannerWindows } from "@/lib/pity";
import { setPulls } from "@/lib/pullStorage";
import { getUnitStatus } from "@/lib/unitStorage";
import type { GamePull } from "@/types/pulls";

vi.mock("next/navigation", () => ({
  usePathname: () => "/hsr/pulls",
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
  } & Omit<React.ComponentProps<"a">, "href">) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const STARDB_HSR = {
  user: {
    username: "tester",
    hsr: {
      achievements: [],
      uids: [
        {
          uid: "800003779",
          verified: true,
          private: false,
          warps: {
            departure: [],
            standard: [],
            light_cone: [],
            character: [
              {
                id: "1",
                item_id: 1001,
                type: "character",
                timestamp: "2024-01-01T00:00:00Z",
                official: true,
              },
              {
                id: "2",
                item_id: 1001,
                type: "character",
                timestamp: "2024-01-01T00:00:30Z",
                official: true,
              },
            ],
          },
        },
      ],
    },
  },
};

function pull(overrides: Partial<GamePull>): GamePull {
  return {
    id: "id",
    gameId: "hsr",
    itemId: "1",
    unitId: null,
    name: "Item",
    rarity: 3,
    ts: 1700000000000,
    category: "standard",
    ...overrides,
  };
}

function renderPage() {
  return render(
    <ThemeProvider>
      <PullsPage game="hsr" windows={toBannerWindows([])} />
    </ThemeProvider>
  );
}

function fileInput(): HTMLInputElement {
  const [input] = document.querySelectorAll<HTMLInputElement>('input[type="file"]');
  expect(input).toBeDefined();
  return input;
}

describe("PullsPage", () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
  });

  it("shows an empty state when no pulls are imported", () => {
    renderPage();
    expect(screen.getByText("No pull history imported yet.")).toBeDefined();
    expect(screen.getByText("0 pulls imported")).toBeDefined();
  });

  it("shows totals, banner pills and a per-banner pity table", () => {
    setPulls("hsr", [
      pull({ id: "a", ts: 1000, rarity: 5, category: "standard" }),
      pull({ id: "b", ts: 2000, rarity: 3, category: "character" }),
      pull({ id: "c", ts: 3000, rarity: 3, category: "character" }),
    ]);
    renderPage();

    expect(screen.getByText("3 pulls imported")).toBeDefined();
    expect(
      screen.getByRole("button", { name: "Stellar Warp (1)" })
    ).toBeDefined();
    expect(
      screen.getByRole("button", { name: "Character Event Warp (2)" })
    ).toBeDefined();

    expect(screen.getAllByText("Stellar Warp").length).toBeGreaterThan(0);
    expect(
      screen.getAllByText("Character Event Warp").length
    ).toBeGreaterThan(0);
    expect(screen.getByText("Showing 3 of 3 pulls (newest first)")).toBeDefined();
    expect(screen.getAllByText("Item")).toHaveLength(4);
    expect(screen.getByText("5★ drops (pity)")).toBeDefined();
    expect(screen.getByText("Showing 1 of 1")).toBeDefined();
  });

  it("shows the pity counter per 5★ drop, isolated per banner", () => {
    setPulls("hsr", [
      pull({ id: "a", ts: 1000, rarity: 3, category: "standard" }),
      pull({ id: "b", ts: 2000, rarity: 3, category: "character" }),
      pull({ id: "c", ts: 3000, rarity: 5, name: "Kafka", category: "character" }),
      pull({ id: "d", ts: 4000, rarity: 3, category: "character" }),
      pull({ id: "e", ts: 5000, rarity: 3, category: "character" }),
      pull({ id: "f", ts: 6000, rarity: 5, name: "Blade", category: "character" }),
      pull({ id: "g", ts: 7000, rarity: 5, name: "Bronya", category: "standard" }),
    ]);
    renderPage();

    expect(screen.getByText("5★ drops (pity)")).toBeDefined();
    expect(screen.getByText("Showing 3 of 3")).toBeDefined();
    expect(screen.getAllByText("Pity 3").length).toBe(2);
    expect(screen.getAllByText("Pity 2").length).toBe(4);
    expect(screen.queryByText("Pity 5")).toBeNull();
  });

  it("switches to per-banner pity stats when a pill is selected", () => {
    setPulls("hsr", [
      pull({ id: "b", ts: 2000, rarity: 3, category: "character" }),
      pull({ id: "c", ts: 3000, rarity: 3, category: "character" }),
    ]);
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "Character Event Warp (2)" }));

    expect(screen.getByText("5★ current pity")).toBeDefined();
    expect(screen.getAllByText("2 / 90").length).toBeGreaterThan(0);
    expect(
      screen.getByText("No 5★ pulled in this banner yet.")
    ).toBeDefined();
    expect(screen.queryByText("5★ drops (pity)")).toBeNull();
    expect(screen.getByText(/Pity length of each 5★ in Character Event Warp/)).toBeDefined();
  });

  it("filters rows by search text", () => {
    setPulls("hsr", [
      pull({ id: "a", ts: 1000, name: "Himeko", rarity: 5 }),
      pull({ id: "b", ts: 2000, name: "Astral Express", rarity: 3 }),
    ]);
    renderPage();

    fireEvent.change(screen.getByPlaceholderText("Search pulled items…"), {
      target: { value: "himeko" },
    });

    expect(screen.queryByText("Astral Express")).toBeNull();
    expect(screen.getAllByText("Himeko")).toHaveLength(2);
    expect(screen.getByText("Showing 1 of 1 pulls (newest first)")).toBeDefined();
  });

  it("imports a stardb export, stores pulls and fills owned units", async () => {
    renderPage();

    const file = new File([JSON.stringify(STARDB_HSR)], "export.json", {
      type: "application/json",
    });
    fireEvent.change(fileInput(), { target: { files: [file] } });

    await waitFor(() =>
      expect(
        document.body.textContent?.includes("pulls found")
      ).toBe(true)
    );

    fireEvent.click(screen.getByRole("button", { name: "Import" }));

    await screen.findByText(
      /Imported 2 new pulls \(2 total\) · 1 units marked owned\./
    );
    expect(screen.getByText("2 pulls imported")).toBeDefined();
    expect(getUnitStatus("hsr", "850191")).toBe("owned");
  });

  it("rejects files that are not pull histories", async () => {
    renderPage();

    const file = new File([JSON.stringify({ hello: "world" })], "bad.json", {
      type: "application/json",
    });
    fireEvent.change(fileInput(), { target: { files: [file] } });

    await screen.findByText(
      "This file is not a pull history for this game."
    );
    expect(screen.getByText("No pull history imported yet.")).toBeDefined();
  });
});
