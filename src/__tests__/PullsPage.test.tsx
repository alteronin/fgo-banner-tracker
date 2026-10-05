import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  cleanup,
  waitFor,
  within,
} from "@testing-library/react";
import { PullsPage } from "@/components/PullsPage";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { toBannerWindows } from "@/lib/pity";
import { getPulls, setPulls } from "@/lib/pullStorage";
import { getUnitStatus } from "@/lib/unitStorage";
import type { GamePull } from "@/types/pulls";
import hsrPullMap from "@/data/hsr-pull-map.json";

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

function renderPage(windows = toBannerWindows([])) {
  return render(
    <ThemeProvider>
      <PullsPage game="hsr" windows={windows} />
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
    fireEvent.click(screen.getByRole("button", { name: "List" }));
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

    fireEvent.click(screen.getByRole("button", { name: "List" }));
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

  it("switches to a grid of 5★ tiles with pity numbers and 50/50 borders", () => {
    setPulls("hsr", [
      pull({ id: "a", ts: 1000, rarity: 3, category: "character" }),
      pull({ id: "b", ts: 2000, rarity: 5, name: "Kafka", category: "character" }),
      pull({ id: "c", ts: 3000, rarity: 5, name: "Himeko", category: "character" }),
      pull({ id: "d", ts: 4000, rarity: 5, name: "Kafka", category: "character" }),
    ]);
    const windows = toBannerWindows([
      {
        id: "b1",
        type: "character",
        banners: [{ name: "Character Event Warp" }],
        startDate: "1970-01-01",
        endDate: "2035-01-01",
        featured5: [{ name: "Kafka" }],
      },
    ]);
    renderPage(windows);
    fireEvent.click(screen.getByRole("button", { name: "Grid" }));

    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getAllByLabelText("pity 1")).toHaveLength(2);
    expect(screen.getAllByLabelText("pity 2")).toHaveLength(1);
    expect(document.querySelectorAll('[data-fifty="win"]')).toHaveLength(1);
    expect(document.querySelectorAll('[data-fifty="loss"]')).toHaveLength(1);
    expect(document.querySelectorAll('[data-fifty="guarantee"]')).toHaveLength(1);
    expect(document.querySelectorAll('[data-tone="early"]')).toHaveLength(3);
    expect(screen.queryByText("5★ drops (pity)")).toBeNull();
    expect(screen.queryByText(/pulls \(newest first\)/)).toBeNull();

    const grid = document.querySelector('[aria-label="5★ drops"]')!;
    expect(grid.className).toContain("minmax(76px,1fr)");
    expect(grid.className).toContain("gap-2");
    expect(grid.parentElement!.className).toContain("p-3");
    expect(grid.firstElementChild!.className).toContain("aspect-square");

    fireEvent.click(screen.getByRole("button", { name: "List" }));
    expect(screen.getByText("5★ drops (pity)")).toBeDefined();
    expect(screen.getByText(/pulls \(newest first\)/)).toBeDefined();
    expect(document.querySelectorAll("[data-fifty]")).toHaveLength(0);
  });

  it("shows the 50/50 record with guarantees counted as neither win nor loss", () => {
    setPulls("hsr", [
      pull({
        id: "l1",
        ts: Date.parse("2024-01-05T12:00:00Z"),
        rarity: 5,
        name: "Himeko",
        category: "character",
        manual: true,
        fifty: "loss",
      }),
      pull({
        id: "g1",
        ts: Date.parse("2024-02-05T12:00:00Z"),
        rarity: 5,
        name: "Kafka",
        category: "character",
        manual: true,
        fifty: "guarantee",
      }),
      pull({
        id: "w1",
        ts: Date.parse("2024-03-05T12:00:00Z"),
        rarity: 5,
        name: "Kafka",
        category: "character",
        manual: true,
        fifty: "win",
      }),
      pull({
        id: "l2",
        ts: Date.parse("2024-04-05T12:00:00Z"),
        rarity: 5,
        name: "Himeko",
        category: "character",
        manual: true,
        fifty: "loss",
      }),
    ]);
    renderPage();

    expect(screen.getByText("50/50 record")).toBeDefined();
    expect(screen.getByText("1W – 2L · 33%")).toBeDefined();
  });

  it("shows an em dash for the 50/50 record when no rolls exist", () => {
    setPulls("hsr", [pull({ id: "a", rarity: 3, category: "character" })]);
    renderPage();

    const label = screen.getByText("50/50 record");
    expect(label.parentElement!.textContent).toContain("—");
  });

  it("filters rows by search text", () => {
    setPulls("hsr", [
      pull({ id: "a", ts: 1000, name: "Himeko", rarity: 5 }),
      pull({ id: "b", ts: 2000, name: "Astral Express", rarity: 3 }),
    ]);
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "List" }));
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

  it("adds a manual entry through the Add Entry form", () => {
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: "Add Entry" }));

    const form = screen.getByRole("form", { name: "Add pull entry" });
    fireEvent.change(screen.getByLabelText("Date & time"), {
      target: { value: "2024-03-01T12:34:56" },
    });
    fireEvent.change(screen.getByLabelText("Custom item name"), {
      target: { value: "Trailblazer" },
    });
    fireEvent.click(within(form).getByRole("button", { name: "Add entry" }));

    expect(screen.getByText("Entry added.")).toBeDefined();
    expect(screen.queryByRole("form", { name: "Add pull entry" })).toBeNull();
    expect(screen.getByText("0 pulls imported · 1 manual")).toBeDefined();
    expect(screen.getAllByText("Trailblazer").length).toBeGreaterThan(0);

    const [stored] = getPulls("hsr");
    expect(stored.manual).toBe(true);
    expect(stored.name).toBe("Trailblazer");
    expect(stored.category).toBe("departure");
    expect(stored.rarity).toBe(5);
    expect(stored.id).toBe(`${stored.ts}|departure|manual-trailblazer|0`);
    const date = new Date(stored.ts);
    const pad = (n: number) => String(n).padStart(2, "0");
    expect(
      `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
    ).toBe("2024-03-01T12:34:56");
  });

  it("previews pity against existing pulls before saving", () => {
    setPulls("hsr", [
      pull({ id: "a", ts: 1000, rarity: 3, category: "character" }),
      pull({ id: "b", ts: 2000, rarity: 3, category: "character" }),
    ]);
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: "Add Entry" }));

    fireEvent.change(screen.getByLabelText("Banner"), {
      target: { value: "character" },
    });
    fireEvent.change(screen.getByLabelText("Custom item name"), {
      target: { value: "Kafka" },
    });

    expect(
      screen.getByText(
        "Preview: implied Pity 1 · Character Event Warp — not counted in stats"
      )
    ).toBeDefined();

    const form = screen.getByRole("form", { name: "Add pull entry" });
    fireEvent.click(within(form).getByRole("button", { name: "Add entry" }));

    expect(screen.getByText("Entry added.")).toBeDefined();
    expect(screen.getByText("2 pulls imported · 1 manual")).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: "List" }));
    expect(screen.queryByText("Pity 3")).toBeNull();
    expect(screen.getByText("✱ Manual")).toBeDefined();
    expect(getPulls("hsr")).toHaveLength(3);
  });

  it("selects an item from the pull map and stores its snapshot", () => {
    const items = Object.entries(hsrPullMap.items).filter(
      ([, entry]) => entry.name !== null
    );
    const [itemId, item] = items.find(
      ([, entry]) =>
        entry.rarity === 5 &&
        items.filter(([, other]) =>
          other.name!.toLowerCase().includes(entry.name!.toLowerCase())
        ).length === 1
    )!;
    const name = item.name!;

    renderPage();
    fireEvent.click(screen.getByRole("button", { name: "Add Entry" }));
    fireEvent.change(screen.getByLabelText("Search items"), {
      target: { value: name.toLowerCase() },
    });
    fireEvent.click(screen.getByText(name));

    expect(screen.getByText(name)).toBeDefined();
    expect(screen.queryByLabelText("Custom item name")).toBeNull();
    expect(screen.queryByLabelText("Search items")).toBeNull();

    const form = screen.getByRole("form", { name: "Add pull entry" });
    fireEvent.click(within(form).getByRole("button", { name: "Add entry" }));

    const [stored] = getPulls("hsr");
    expect(stored.itemId).toBe(itemId);
    expect(stored.name).toBe(name);
    expect(stored.rarity).toBe(5);
    expect(stored.manual).toBe(true);
  });

  it("edits an entry through the form", () => {
    setPulls("hsr", [
      pull({
        id: "x",
        itemId: "custom-edit",
        ts: 1700000000000,
        name: "Old Name",
        rarity: 4,
        manual: true,
      }),
    ]);
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: "List" }));
    fireEvent.click(screen.getByRole("button", { name: "Edit Old Name" }));

    expect(
      screen.getByRole("form", { name: "Edit pull entry" })
    ).toBeDefined();
    expect(screen.getByText("Custom item name")).toBeDefined();
    const date = new Date(1700000000000);
    const pad = (n: number) => String(n).padStart(2, "0");
    expect(
      (
        screen.getByLabelText("Date & time") as HTMLInputElement
      ).value.replace(/\.\d+$/, "")
    ).toBe(
      `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
    );

    fireEvent.change(screen.getByLabelText("Custom item name"), {
      target: { value: "New Name" },
    });
    const form = screen.getByRole("form", { name: "Edit pull entry" });
    fireEvent.click(within(form).getByRole("button", { name: "Save changes" }));

    expect(screen.getByText("Entry updated.")).toBeDefined();
    expect(screen.queryByRole("form", { name: "Edit pull entry" })).toBeNull();
    const stored = getPulls("hsr");
    expect(stored).toHaveLength(1);
    expect(stored[0].name).toBe("New Name");
    expect(stored[0].manual).toBe(true);
    expect(screen.getByText("New Name")).toBeDefined();
  });

  it("confirms deletes and warns for export-derived entries", () => {
    setPulls("hsr", [
      pull({ id: "a", ts: 1000, name: "Exported Item" }),
      pull({ id: "b", ts: 2000, name: "Manual Item", manual: true }),
    ]);
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: "List" }));

    fireEvent.click(
      screen.getByRole("button", { name: "Delete Exported Item" })
    );
    expect(
      screen.getByText("Delete? Re-import restores it.")
    ).toBeDefined();
    fireEvent.click(
      screen.getByRole("button", { name: "Cancel delete Exported Item" })
    );
    expect(screen.getByText("Exported Item")).toBeDefined();
    expect(screen.queryByText("Delete? Re-import restores it.")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Delete Manual Item" }));
    expect(screen.getByText("Delete?")).toBeDefined();
    expect(screen.queryByText("Delete? Re-import restores it.")).toBeNull();

    fireEvent.click(
      screen.getByRole("button", { name: "Confirm delete Manual Item" })
    );
    expect(screen.getByText("Entry deleted.")).toBeDefined();
    expect(
      getPulls("hsr").map((entry) => entry.name)
    ).toEqual(["Exported Item"]);
  });

  it("keeps imported stats pure and counts manual entries separately", () => {
    setPulls("hsr", [
      pull({ id: "a", ts: 500, rarity: 3, category: "character", manual: true }),
      pull({ id: "b", ts: 2000, rarity: 3, category: "character" }),
      pull({ id: "c", ts: 3000, rarity: 5, name: "Kafka", category: "character" }),
    ]);
    renderPage();

    expect(screen.getByText("2 pulls imported · 1 manual")).toBeDefined();
    expect(
      screen.getByText("Total pulls").parentElement?.textContent
    ).toContain("2");
    expect(
      screen.getByText("Manual").parentElement?.textContent
    ).toContain("1");

    fireEvent.click(
      screen.getByRole("button", { name: "Character Event Warp (3)" })
    );
    expect(
      screen.getByText("5★ average").parentElement?.textContent
    ).toContain("2.0");
    expect(
      screen.getByText("5★ average").parentElement?.textContent
    ).not.toContain("3.0");
    expect(
      screen.getByText("5★ current pity").parentElement?.textContent
    ).toContain("0 / 90");
  });

  it("blocks manual entries that are not older than the oldest pull", () => {
    setPulls("hsr", [pull({ id: "a", ts: 1000, rarity: 3 })]);
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: "Add Entry" }));

    fireEvent.change(screen.getByLabelText("Date & time"), {
      target: { value: "1970-01-02T00:00:00" },
    });
    fireEvent.change(screen.getByLabelText("Custom item name"), {
      target: { value: "Too New" },
    });

    expect(
      screen.getByText(
        /Manual entries must be dated before your oldest imported pull \(\d{4}-\d{2}-\d{2}\)\./
      )
    ).toBeDefined();
    expect(
      screen.getByText("Must be before your oldest imported pull.")
    ).toBeDefined();
    const form = screen.getByRole("form", { name: "Add pull entry" });
    expect(
      within(form).getByRole("button", { name: "Add entry" })
    ).toBeDisabled();

    fireEvent.change(screen.getByLabelText("Date & time"), {
      target: { value: "1969-12-31T00:00:00" },
    });
    expect(screen.queryByText(/Manual entries must be dated/)).toBeNull();
    fireEvent.click(within(form).getByRole("button", { name: "Add entry" }));
    expect(screen.getByText("Entry added.")).toBeDefined();
  });

  it("stores a chosen chip color for manual entries", () => {
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: "Add Entry" }));

    const group = screen.getByRole("group", { name: "Tile chip color" });
    fireEvent.change(screen.getByLabelText("Custom item name"), {
      target: { value: "Colored Entry" },
    });
    fireEvent.click(
      within(group).getByRole("button", { name: "Chip color #38bdf8" })
    );
    expect(
      within(group).getByRole("button", { name: "Chip color #38bdf8" })
        .getAttribute("aria-pressed")
    ).toBe("true");

    const form = screen.getByRole("form", { name: "Add pull entry" });
    fireEvent.click(within(form).getByRole("button", { name: "Add entry" }));

    const [stored] = getPulls("hsr");
    expect(stored.chipColor).toBe("#38bdf8");
  });

  it("marks manual tiles in the grid with the chosen chip color", () => {
    setPulls("hsr", [
      pull({ id: "a", ts: 2000, rarity: 5, name: "Kafka", category: "character" }),
      pull({
        id: "m",
        ts: 1000,
        rarity: 5,
        name: "Old Manual",
        category: "character",
        manual: true,
        chipColor: "#38bdf8",
      }),
    ]);
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: "Grid" }));

    const manualTile = document.querySelector('[data-manual="true"]');
    expect(manualTile).not.toBeNull();
    expect(manualTile!.getAttribute("data-fifty")).toBe("none");
    expect(manualTile!.getAttribute("title")).toContain("Manual (not counted)");
    expect(manualTile!.hasAttribute("data-tone")).toBe(false);
    const chip = manualTile!.querySelector(
      '[aria-label="manual entry"]'
    ) as HTMLElement;
    expect(chip.style.backgroundColor).toBe("rgb(56, 189, 248)");

    expect(screen.getByLabelText("pity 1")).toBeDefined();
    expect(screen.queryByLabelText("pity 2")).toBeNull();
    expect(document.querySelectorAll("[data-tone]")).toHaveLength(1);
  });

  it("shows logged manual tiles with their declared rate-up borders", () => {
    setPulls("hsr", [
      pull({ id: "a", ts: 3000, rarity: 5, name: "Kafka", category: "character" }),
      pull({
        id: "w",
        ts: 2000,
        rarity: 5,
        name: "Log Win",
        category: "character",
        manual: true,
        fifty: "win",
      }),
      pull({
        id: "l",
        ts: 1000,
        rarity: 5,
        name: "Log Loss",
        category: "character",
        manual: true,
        fifty: "loss",
        chipColor: "#38bdf8",
      }),
    ]);
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: "Grid" }));

    const tiles = document.querySelectorAll('[data-manual="true"]');
    expect(tiles).toHaveLength(2);

    const winTile = document.querySelector('[data-fifty="win"][data-manual="true"]')!;
    expect(winTile).not.toBeNull();
    expect(winTile.className).toContain("border-emerald-500");
    expect(winTile.getAttribute("title")).toContain("Won 50/50");

    const lossTile = document.querySelector('[data-fifty="loss"][data-manual="true"]')!;
    expect(lossTile).not.toBeNull();
    expect(lossTile.className).toContain("border-rose-500");
    expect(lossTile.getAttribute("title")).toContain("Lost 50/50");
    expect(lossTile.hasAttribute("data-tone")).toBe(false);
    const lossChip = lossTile.querySelector(
      '[aria-label="manual entry"]'
    ) as HTMLElement;
    expect(lossChip.style.backgroundColor).toBe("rgb(56, 189, 248)");
    expect(
      screen.getByText(/logged entries show your declared rate-up result/)
    ).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: "List" }));
    expect(screen.getByText("✱ Manual · Won")).toBeDefined();
    expect(screen.getByText("✱ Manual · Lost")).toBeDefined();
  });

  it("keeps export-derived entries export-derived when edited", () => {
    setPulls("hsr", [
      pull({ id: "a", itemId: "zzz-not-in-map", ts: 1000, name: "Exported Item" }),
    ]);
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: "List" }));
    fireEvent.click(screen.getByRole("button", { name: "Edit Exported Item" }));

    expect(
      screen.getByText("From your export — re-importing restores the original.")
    ).toBeDefined();
    expect(
      screen.queryByRole("group", { name: "Tile chip color" })
    ).toBeNull();

    fireEvent.change(screen.getByLabelText("Custom item name"), {
      target: { value: "Renamed Export" },
    });
    const form = screen.getByRole("form", { name: "Edit pull entry" });
    fireEvent.click(within(form).getByRole("button", { name: "Save changes" }));

    expect(screen.getByText("Entry updated.")).toBeDefined();
    const [stored] = getPulls("hsr");
    expect(stored.name).toBe("Renamed Export");
    expect(stored.manual).toBeFalsy();
    expect(stored.chipColor).toBeUndefined();
  });

  it("defaults to the grid view", () => {
    setPulls("hsr", [
      pull({
        id: "a",
        ts: 1000,
        rarity: 5,
        name: "Kafka",
        category: "character",
      }),
    ]);
    renderPage();

    expect(document.querySelector('[aria-label="5★ drops"]')).not.toBeNull();
    expect(screen.queryByText(/pulls \(newest first\)/)).toBeNull();
    expect(
      screen.getByRole("button", { name: "Grid" }).getAttribute("aria-pressed")
    ).toBe("true");
  });

  it("confirms deletion of manual grid tiles", () => {
    setPulls("hsr", [
      pull({ id: "a", ts: 3000, rarity: 5, name: "Kafka", category: "character" }),
      pull({
        id: "m",
        ts: 1000,
        rarity: 5,
        name: "Manual Item",
        category: "character",
        manual: true,
        fifty: "win",
      }),
    ]);
    renderPage();

    expect(
      screen.queryByRole("button", { name: "Delete manual entry Kafka" })
    ).toBeNull();

    fireEvent.click(
      screen.getByRole("button", { name: "Delete manual entry Manual Item" })
    );
    const dialog = screen.getByRole("dialog", { name: "Delete manual entry" });
    expect(within(dialog).getByText("Delete this entry?")).toBeDefined();
    expect(within(dialog).getByText(/Manual Item · .* · ✱ Manual · Won/)).toBeDefined();

    fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    expect(
      screen.queryByRole("dialog", { name: "Delete manual entry" })
    ).toBeNull();
    expect(getPulls("hsr")).toHaveLength(2);

    fireEvent.click(
      screen.getByRole("button", { name: "Delete manual entry Manual Item" })
    );
    const reopened = screen.getByRole("dialog", {
      name: "Delete manual entry",
    });
    fireEvent.click(within(reopened).getByRole("button", { name: "Delete" }));

    expect(screen.getByText("Entry deleted.")).toBeDefined();
    expect(
      screen.queryByRole("dialog", { name: "Delete manual entry" })
    ).toBeNull();
    expect(getPulls("hsr").map((entry) => entry.name)).toEqual(["Kafka"]);
    expect(
      screen.queryByRole("button", { name: "Delete manual entry Manual Item" })
    ).toBeNull();
  });
});
