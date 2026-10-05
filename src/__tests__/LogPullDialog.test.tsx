import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup, within } from "@testing-library/react";
import { LogPullDialog } from "@/components/LogPullDialog";
import { findMapItemByName, STANDARD_POOLS } from "@/lib/logPull";
import { getPulls, setPulls } from "@/lib/pullStorage";
import { getUnitStatus } from "@/lib/unitStorage";
import type { GamePull } from "@/types/pulls";

const KLEE_UNIT = "610146";

function pull(overrides: Partial<GamePull>): GamePull {
  return {
    id: "id",
    gameId: "genshin",
    itemId: "1",
    unitId: null,
    name: "Item",
    rarity: 3,
    ts: 1600000000000,
    category: "character",
    ...overrides,
  };
}

type DialogProps = Parameters<typeof LogPullDialog>[0];

function dialogProps(overrides: Partial<DialogProps> = {}) {
  const onSaved = vi.fn();
  const onClose = vi.fn();
  const props: DialogProps = {
    game: "genshin",
    category: "character",
    bannerTitle: "Sparkling Steps",
    bannerStart: "2021-06-09",
    bannerEnd: "2021-06-29",
    unit: findMapItemByName("genshin", "Klee")!,
    pulls: [] as GamePull[],
    onClose,
    onSaved,
    ...overrides,
  };
  return { props, onSaved, onClose };
}

describe("LogPullDialog", () => {
  beforeEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it("logs a won 50/50 pull and marks the unit owned", () => {
    const { props, onSaved, onClose } = dialogProps();
    render(<LogPullDialog {...props} />);

    const form = screen.getByRole("form", { name: "Log this pull" });
    expect(
      within(form).getByRole("button", { name: "Log pull" })
    ).toBeDisabled();

    fireEvent.click(within(form).getByRole("button", { name: "Won 50/50" }));
    expect(within(form).getByText(/Preview: implied Pity 1/)).toBeDefined();
    expect(
      within(form).getByRole("button", { name: "Log pull" })
    ).not.toBeDisabled();
    fireEvent.click(within(form).getByRole("button", { name: "Log pull" }));

    expect(onSaved).toHaveBeenCalledWith("Pull logged.");
    expect(onClose).not.toHaveBeenCalled();

    const stored = getPulls("genshin");
    expect(stored).toHaveLength(1);
    expect(stored[0]).toMatchObject({
      manual: true,
      fifty: "win",
      name: "Klee",
      rarity: 5,
      itemId: "10000029",
      unitId: KLEE_UNIT,
      category: "character",
    });
    expect(getUnitStatus("genshin", KLEE_UNIT)).toBe("owned");
  });

  it("warns and allows a second copy of the same unit on the banner", () => {
    const { props, onSaved } = dialogProps({
      pulls: [
        pull({
          id: "first",
          itemId: "10000029",
          unitId: KLEE_UNIT,
          rarity: 5,
          name: "Klee",
          fifty: "win",
          ts: Date.parse("2021-06-10T12:00:00Z"),
        }),
      ],
    });
    render(<LogPullDialog {...props} />);

    const form = screen.getByRole("form", { name: "Log this pull" });
    expect(within(form).getByText(/already logged Klee/)).toBeDefined();

    fireEvent.click(within(form).getByRole("button", { name: "Won 50/50" }));
    expect(within(form).getByRole("button", { name: "Log pull" })).not.toBeDisabled();
    fireEvent.click(within(form).getByRole("button", { name: "Log pull" }));

    expect(onSaved).toHaveBeenCalledWith("Pull logged.");
    const stored = getPulls("genshin");
    expect(stored).toHaveLength(2);
    expect(stored.every((p) => p.name === "Klee")).toBe(true);
    expect(stored.every((p) => p.fifty === "win")).toBe(true);
    expect(new Set(stored.map((p) => p.id)).size).toBe(2);
    expect(getUnitStatus("genshin", KLEE_UNIT)).toBe("owned");
  });

  it("requires a standard pick after a lost 50/50", () => {
    const { props, onSaved } = dialogProps();
    render(<LogPullDialog {...props} />);

    const form = screen.getByRole("form", { name: "Log this pull" });
    fireEvent.click(within(form).getByRole("button", { name: "Lost 50/50" }));

    const [standard] = STANDARD_POOLS.genshin.character;
    expect(within(form).getByRole("button", { name: standard })).toBeDefined();
    expect(
      within(form).getByRole("button", { name: "Log pull" })
    ).toBeDisabled();

    fireEvent.click(within(form).getByRole("button", { name: standard }));
    fireEvent.click(within(form).getByRole("button", { name: "Log pull" }));

    expect(onSaved).toHaveBeenCalledWith("Pull logged.");
    const stored = getPulls("genshin");
    expect(stored).toHaveLength(1);
    expect(stored[0].name).toBe(standard);
    expect(stored[0].fifty).toBe("loss");

    const standardItem = findMapItemByName("genshin", standard)!;
    expect(getUnitStatus("genshin", standardItem.unitId!)).toBe("owned");
    expect(getUnitStatus("genshin", KLEE_UNIT)).toBe("none");
  });

  it("closes on Skip without storing a pull", () => {
    const { props, onSaved, onClose } = dialogProps();
    render(<LogPullDialog {...props} />);

    fireEvent.click(screen.getByRole("button", { name: "Skip" }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onSaved).not.toHaveBeenCalled();
    expect(getPulls("genshin")).toHaveLength(0);
  });

  it("saves pulls that sit inside the import history", () => {
    const existing = [
      pull({ id: "old", ts: Date.parse("2020-09-20T00:00:00Z"), rarity: 5 }),
      pull({ id: "new", ts: Date.parse("2022-03-01T00:00:00Z"), rarity: 5 }),
    ];
    setPulls("genshin", existing);
    const { props, onSaved } = dialogProps({ pulls: existing });
    render(<LogPullDialog {...props} />);

    fireEvent.click(screen.getByRole("button", { name: "Won 50/50" }));
    expect(
      screen.queryByText(/Manual entries must be dated before your oldest imported pull/)
    ).toBeNull();
    expect(screen.getByRole("button", { name: "Log pull" })).not.toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Log pull" }));
    expect(onSaved).toHaveBeenCalledWith("Pull logged.");

    const stored = getPulls("genshin");
    expect(stored).toHaveLength(3);
    expect(stored.some((p) => p.name === "Klee" && p.fifty === "win")).toBe(
      true
    );
  });

  it("warns but allows a second loss when the 5★ between them isn't logged yet", () => {
    const [standard] = STANDARD_POOLS.genshin.character;
    const existing = [
      pull({
        id: "early-loss",
        name: standard,
        rarity: 5,
        ts: Date.parse("2020-10-21T12:00:00Z"),
        manual: true,
        fifty: "loss",
      }),
    ];
    setPulls("genshin", existing);
    const { props, onSaved } = dialogProps({ pulls: existing });
    render(<LogPullDialog {...props} />);

    fireEvent.click(screen.getByRole("button", { name: "Lost 50/50" }));
    fireEvent.click(screen.getByRole("button", { name: standard }));

    expect(screen.getByText(/Two 50\/50 losses in a row/)).toBeDefined();
    expect(
      screen.getByRole("button", { name: "Log pull" })
    ).not.toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Log pull" }));
    expect(onSaved).toHaveBeenCalledWith("Pull logged.");

    const stored = getPulls("genshin");
    expect(stored).toHaveLength(2);
    expect(stored.filter((p) => p.fifty === "loss")).toHaveLength(2);
  });

  it("logs the loss and the guarantee together when the follow-up is checked", () => {
    const [standard] = STANDARD_POOLS.genshin.character;
    const { props, onSaved } = dialogProps();
    render(<LogPullDialog {...props} />);

    fireEvent.click(screen.getByRole("button", { name: "Lost 50/50" }));
    fireEvent.click(screen.getByRole("button", { name: standard }));

    const checkbox = screen.getByRole("checkbox", { name: /guaranteed win/i });
    expect(checkbox).not.toBeChecked();
    expect(
      document.querySelectorAll('input[type="datetime-local"]')
    ).toHaveLength(1);

    fireEvent.click(checkbox);
    expect(
      document.querySelectorAll('input[type="datetime-local"]')
    ).toHaveLength(2);
    expect(screen.getByText(/Guarantee: Klee/)).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: "Log pull" }));
    expect(onSaved).toHaveBeenCalledWith("Pulls logged.");

    const stored = getPulls("genshin");
    expect(stored).toHaveLength(2);
    const loss = stored.find((p) => p.fifty === "loss")!;
    const guarantee = stored.find((p) => p.fifty === "guarantee")!;
    expect(loss.name).toBe(standard);
    expect(guarantee.name).toBe("Klee");
    expect(guarantee.ts).toBe(loss.ts + 86_400_000);
    const standardItem = findMapItemByName("genshin", standard)!;
    expect(getUnitStatus("genshin", standardItem.unitId!)).toBe("owned");
    expect(getUnitStatus("genshin", KLEE_UNIT)).toBe("owned");
  });

  it("logs a cross-banner guarantee through the Used guarantee option", () => {
    const [standard] = STANDARD_POOLS.genshin.character;
    const existing = [
      pull({
        id: "early-loss",
        name: standard,
        rarity: 5,
        ts: Date.parse("2021-02-04T12:00:00Z"),
        manual: true,
        fifty: "loss",
      }),
    ];
    setPulls("genshin", existing);
    const { props, onSaved } = dialogProps({ pulls: existing });
    render(<LogPullDialog {...props} />);

    const form = screen.getByRole("form", { name: "Log this pull" });
    fireEvent.click(
      within(form).getByRole("button", { name: "Used guarantee" })
    );

    expect(within(form).getByText(/You received Klee/)).toBeDefined();
    expect(
      within(form).queryByRole("button", { name: standard })
    ).toBeNull();
    expect(
      within(form).getByRole("button", { name: "Log pull" })
    ).not.toBeDisabled();

    fireEvent.click(within(form).getByRole("button", { name: "Log pull" }));
    expect(onSaved).toHaveBeenCalledWith("Pull logged.");

    const stored = getPulls("genshin");
    expect(stored).toHaveLength(2);
    const guarantee = stored.find((p) => p.fifty === "guarantee")!;
    expect(guarantee.name).toBe("Klee");
    expect(guarantee.rarity).toBe(5);
    expect(getUnitStatus("genshin", KLEE_UNIT)).toBe("owned");
  });

  it("saves a win as Guaranteed when a loss is still pending", () => {
    const [standard] = STANDARD_POOLS.genshin.character;
    const existing = [
      pull({
        id: "early-loss",
        name: standard,
        rarity: 5,
        ts: Date.parse("2021-02-04T12:00:00Z"),
        manual: true,
        fifty: "loss",
      }),
    ];
    setPulls("genshin", existing);
    const { props, onSaved } = dialogProps({ pulls: existing });
    render(<LogPullDialog {...props} />);

    const form = screen.getByRole("form", { name: "Log this pull" });
    fireEvent.click(within(form).getByRole("button", { name: "Won 50/50" }));

    expect(within(form).getByText(/saved as Guaranteed/)).toBeDefined();

    fireEvent.click(within(form).getByRole("button", { name: "Log pull" }));
    expect(onSaved).toHaveBeenCalledWith("Pull logged.");

    const stored = getPulls("genshin");
    expect(stored).toHaveLength(2);
    const klee = stored.find((p) => p.name === "Klee")!;
    expect(klee.fifty).toBe("guarantee");
  });

  it("logs wuwa weapon pulls without an outcome question", () => {
    const weapon = findMapItemByName("wuwa", "Emerald of Genesis")!;
    const onSaved = vi.fn();
    render(
      <LogPullDialog
        game="wuwa"
        category="2"
        bannerTitle="Lament of the Falling Star"
        bannerStart="2024-05-01"
        bannerEnd="2024-05-20"
        unit={weapon}
        pulls={[]}
        onClose={vi.fn()}
        onSaved={onSaved}
      />
    );

    expect(screen.queryByRole("group", { name: "Rate-up result" })).toBeNull();
    expect(
      screen.getByText("This banner has no 50/50 — logged as a win.")
    ).toBeDefined();
    expect(screen.getByRole("button", { name: "Log pull" })).not.toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Log pull" }));
    expect(onSaved).toHaveBeenCalledWith("Pull logged.");

    const stored = getPulls("wuwa");
    expect(stored).toHaveLength(1);
    expect(stored[0]).toMatchObject({
      manual: true,
      fifty: "win",
      name: "Emerald of Genesis",
      rarity: 5,
      unitId: "w-455939",
      category: "2",
    });
    expect(getUnitStatus("wuwa", "w-455939")).toBe("owned");
  });

  it("closes on Escape", () => {
    const { props, onClose } = dialogProps();
    render(<LogPullDialog {...props} />);

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
